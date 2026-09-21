from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
import time
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

from app.models.schemas import (
    Holding, RiskMetrics, AllocationBreakdown,
    PortfolioSummary, WhatIfRequest, WhatIfResponse,
    CopilotQuery, CopilotResponse, ReportRequest
)
from app.analytics.risk_engine import calculate_portfolio_metrics
from app.analytics.simulator import simulate_portfolio_scenario
from app.ai.copilot import generate_copilot_response_async, generate_copilot_response
from app.ai.report_generator import generate_executive_report
from app.market_data.market_store import market_store
from app.market_data.live_market import live_market_service
from app.demo_data import get_demo_profiles
from app.settings_manager import settings_manager

app = FastAPI(
    title="FinVest AI - Portfolio Intelligence & AI Service",
    description="Quantitative Financial Risk Engine, Real Market APIs, What-If Simulator, and AI Portfolio Copilot",
    version="2.0.0"
)

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Prometheus metrics
REQUEST_COUNT = Counter("finvest_ai_requests_total", "Total requests received", ["method", "endpoint"])
REQUEST_LATENCY = Histogram("finvest_ai_latency_seconds", "Request latency", ["endpoint"])

# In-memory store for active demo portfolios
_active_portfolios = get_demo_profiles()

@app.middleware("http")
async def monitor_requests(request, call_next):
    start_time = time.time()
    endpoint = request.url.path
    response = await call_next(request)
    duration = time.time() - start_time
    REQUEST_COUNT.labels(method=request.method, endpoint=endpoint).inc()
    REQUEST_LATENCY.labels(endpoint=endpoint).observe(duration)
    return response

@app.get("/metrics")
def metrics():
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "FinVest AI Portfolio Intelligence Engine",
        "version": "2.0.0",
        "timestamp": time.time(),
        "live_market_api": "active"
    }

# ==================== SETTINGS & REAL API KEYS ====================

@app.get("/api/settings/status")
def get_settings_status():
    """Returns connectivity and configuration status for Gemini, OpenAI, Finnhub, Alpha Vantage, and Yahoo Finance."""
    return settings_manager.get_status()

@app.post("/api/settings/keys")
def update_api_keys(payload: Dict[str, str] = Body(...)):
    """Updates API keys at runtime and persists them to .env."""
    for k, v in payload.items():
        if k in ["GEMINI_API_KEY", "OPENAI_API_KEY", "FINNHUB_API_KEY", "ALPHA_VANTAGE_API_KEY", "DEFAULT_LLM_PROVIDER"]:
            settings_manager.set_key(k, v.strip())
    return {
        "status": "UPDATED",
        "settings": settings_manager.get_status()
    }

@app.post("/api/settings/test-key")
async def test_api_key(payload: Dict[str, str] = Body(...)):
    """Live probe test for an API key before saving."""
    provider = payload.get("provider", "")
    key = payload.get("key", "").strip()
    if not key:
        raise HTTPException(status_code=400, detail="API key is required for testing")
    result = await settings_manager.test_key(provider, key)
    return result

# ==================== REAL MARKET DATA & NEWS ====================

@app.get("/api/market/quotes")
def get_market_quotes():
    """Returns current market quotes and asset metadata."""
    return market_store.get_all_quotes()

@app.get("/api/market/live-quote/{symbol}")
async def get_live_quote(symbol: str):
    """Fetches real-time market quote from Yahoo Finance, Finnhub, or Alpha Vantage."""
    return await live_market_service.get_live_quote(symbol)

@app.get("/api/market/news/{symbol}")
async def get_live_news(symbol: str):
    """Fetches recent financial news articles for a ticker."""
    return await live_market_service.get_live_news(symbol)

@app.post("/api/market/shock")
def trigger_market_shock(drop_percentage: float = -0.045):
    """
    Simulates a sector drawdown event (e.g. Tech -4.5%)
    triggering portfolio recalculation and intelligent alerts.
    """
    affected = market_store.trigger_tech_shock(drop_percentage)
    return {
        "event": "TECH_SECTOR_DRAWDOWN",
        "drop_percentage": drop_percentage * 100,
        "affected_holdings": affected,
        "message": f"Simulated market shock applied: Tech equities declined by {abs(drop_percentage * 100):.1f}%"
    }

# ==================== PORTFOLIO INTELLIGENCE ====================

@app.get("/api/demo/portfolios")
def list_demo_portfolios():
    """Returns all pre-configured synthetic demo portfolios with calculated metrics."""
    result = {}
    for key, p_data in _active_portfolios.items():
        holdings = p_data["holdings"]
        metrics, allocation, alerts = calculate_portfolio_metrics(holdings, p_data.get("benchmark_name", "NIFTY 50"))
        history = market_store.generate_historical_series(days=120)
        
        summary = PortfolioSummary(
            id=p_data["id"],
            name=p_data["name"],
            owner=p_data["owner"],
            description=p_data["description"],
            holdings=holdings,
            metrics=metrics,
            allocation=allocation,
            alerts=alerts,
            history=history
        )
        result[key] = summary.model_dump()
    return result

@app.get("/api/demo/portfolios/{profile_key}")
def get_demo_portfolio(profile_key: str):
    if profile_key not in _active_portfolios:
        raise HTTPException(status_code=404, detail=f"Profile '{profile_key}' not found")

    p_data = _active_portfolios[profile_key]
    holdings = p_data["holdings"]
    metrics, allocation, alerts = calculate_portfolio_metrics(holdings, p_data.get("benchmark_name", "NIFTY 50"))
    history = market_store.generate_historical_series(days=120)

    summary = PortfolioSummary(
        id=p_data["id"],
        name=p_data["name"],
        owner=p_data["owner"],
        description=p_data["description"],
        holdings=holdings,
        metrics=metrics,
        allocation=allocation,
        alerts=alerts,
        history=history
    )
    return summary.model_dump()

@app.post("/api/analytics/metrics")
def compute_metrics(holdings: List[Holding], benchmark: str = "NIFTY 50"):
    """Calculates risk metrics, asset/sector allocation, and alerts for any holdings list."""
    metrics, allocation, alerts = calculate_portfolio_metrics(holdings, benchmark)
    return {
        "metrics": metrics.model_dump(),
        "allocation": allocation.model_dump(),
        "alerts": [a.model_dump() for a in alerts]
    }

@app.post("/api/analytics/simulate", response_model=WhatIfResponse)
def simulate_scenario(request: WhatIfRequest):
    """Runs a What-If portfolio simulation and generates AI delta commentary."""
    baseline_holdings = request.holdings
    if not baseline_holdings and request.portfolio_id:
        for p in _active_portfolios.values():
            if p["id"] == request.portfolio_id:
                baseline_holdings = p["holdings"]
                break

    if not baseline_holdings:
        baseline_holdings = _active_portfolios["growth"]["holdings"]

    return simulate_portfolio_scenario(request, baseline_holdings)

@app.post("/api/copilot/chat", response_model=CopilotResponse)
async def copilot_chat(query: CopilotQuery):
    """Conversational AI Copilot powered by Google Gemini, OpenAI, and live market RAG."""
    if not query.portfolio and query.portfolio_id:
        for p_data in _active_portfolios.values():
            if p_data["id"] == query.portfolio_id:
                m, a, al = calculate_portfolio_metrics(p_data["holdings"], p_data.get("benchmark_name", "NIFTY 50"))
                query.portfolio = PortfolioSummary(
                    id=p_data["id"],
                    name=p_data["name"],
                    owner=p_data["owner"],
                    description=p_data["description"],
                    holdings=p_data["holdings"],
                    metrics=m,
                    allocation=a,
                    alerts=al,
                    history=[]
                )
                break
    elif not query.portfolio:
        p_data = _active_portfolios["growth"]
        m, a, al = calculate_portfolio_metrics(p_data["holdings"])
        query.portfolio = PortfolioSummary(
            id=p_data["id"],
            name=p_data["name"],
            owner=p_data["owner"],
            description=p_data["description"],
            holdings=p_data["holdings"],
            metrics=m,
            allocation=a,
            alerts=al,
            history=[]
        )

    return await generate_copilot_response_async(query)

@app.post("/api/copilot/report")
def generate_report(request: ReportRequest):
    """Generates an executive AI-authored portfolio assessment report."""
    if not request.portfolio and request.portfolio_id:
        for p_data in _active_portfolios.values():
            if p_data["id"] == request.portfolio_id:
                m, a, al = calculate_portfolio_metrics(p_data["holdings"], p_data.get("benchmark_name", "NIFTY 50"))
                request.portfolio = PortfolioSummary(
                    id=p_data["id"],
                    name=p_data["name"],
                    owner=p_data["owner"],
                    description=p_data["description"],
                    holdings=p_data["holdings"],
                    metrics=m,
                    allocation=a,
                    alerts=al,
                    history=[]
                )
                break
    elif not request.portfolio:
        p_data = _active_portfolios["growth"]
        m, a, al = calculate_portfolio_metrics(p_data["holdings"])
        request.portfolio = PortfolioSummary(
            id=p_data["id"],
            name=p_data["name"],
            owner=p_data["owner"],
            description=p_data["description"],
            holdings=p_data["holdings"],
            metrics=m,
            allocation=a,
            alerts=al,
            history=[]
        )

    return generate_executive_report(request)
