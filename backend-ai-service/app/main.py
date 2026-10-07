from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, List, Optional
import time
from prometheus_client import Counter, Histogram, generate_latest, CONTENT_TYPE_LATEST
from starlette.responses import Response

from app.models.schemas import (
    Holding, RiskMetrics, AllocationBreakdown,
    PortfolioSummary, WhatIfRequest, WhatIfResponse,
    CopilotQuery, CopilotResponse, ReportRequest,
    OptimizationComparisonResponse, StressTestResponse, MonteCarloResult,
    BacktestComparisonResponse, RiskAttributionReport, UncertaintyReport,
    KnowledgeGraphData, InvestorProfileComparison, BenchmarkSuiteResponse
)
from app.analytics.risk_engine import calculate_portfolio_metrics
from app.analytics.simulator import simulate_portfolio_scenario
from app.analytics.optimizer import portfolio_optimizer
from app.analytics.stress_tester import stress_test_engine
from app.analytics.monte_carlo import monte_carlo_engine
from app.analytics.backtester import walk_forward_backtester
from app.analytics.risk_attribution import risk_attribution_engine
from app.analytics.uncertainty import uncertainty_estimator
from app.analytics.investor_profile import investor_personalization_engine
from app.ai.knowledge_graph import financial_knowledge_graph
from app.ai.eval_benchmark import llm_eval_benchmark
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
    """Returns connectivity and configuration status for Gemini and Yahoo Finance."""
    return settings_manager.get_status()

@app.post("/api/settings/keys")
def update_api_keys(payload: Dict[str, str] = Body(...)):
    """Updates API keys at runtime and persists them to .env."""
    for k, v in payload.items():
        if k in ["GEMINI_API_KEY", "DEFAULT_LLM_PROVIDER"]:
            settings_manager.set_key(k, v.strip())
    return {
        "status": "UPDATED",
        "settings": settings_manager.get_status()
    }

@app.post("/api/settings/test-key")
async def test_api_key(payload: Dict[str, str] = Body(...)):
    """Live probe test for an API key before saving."""
    provider = payload.get("provider", "")
    key = payload.get("key", "").strip() or settings_manager.get_key("GEMINI_API_KEY")
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
    """Fetches real-time market quote from Yahoo Finance (zero-key)."""
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
    """Conversational AI Copilot powered exclusively by Google Gemini and live market RAG."""
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

# ==================== FINVEST-R RESEARCH SUITE ====================

@app.post("/api/research/optimize", response_model=OptimizationComparisonResponse)
def run_portfolio_optimization(payload: Dict[str, Any] = Body(default={})):
    """Runs 5 baselines (Equal Weight, Mean-Variance, Min Vol, Max Sharpe, Risk Parity) + FinVest-R."""
    risk_profile = payload.get("risk_profile", "MODERATE")
    return portfolio_optimizer.compare_all_strategies(risk_profile=risk_profile)

@app.post("/api/research/stress-test", response_model=StressTestResponse)
def run_scenario_stress_test(payload: Dict[str, Any] = Body(default={})):
    """Runs research macro shocks (Scenarios A-E) generating Original vs Shock vs Delta comparison tables."""
    portfolio_id = payload.get("portfolio_id", "port-growth-001")
    p_data = _active_portfolios.get("growth")
    for p in _active_portfolios.values():
        if p["id"] == portfolio_id:
            p_data = p
            break
    holdings = p_data["holdings"]
    m, _, _ = calculate_portfolio_metrics(holdings)
    return stress_test_engine.run_stress_test(holdings, m)

@app.post("/api/research/monte-carlo", response_model=MonteCarloResult)
def run_monte_carlo_simulation(payload: Dict[str, Any] = Body(default={})):
    """Runs 25,000+ Monte Carlo simulated paths for each strategy computing VaR, CVaR, Loss Probability, and Drawdowns."""
    num_sims = int(payload.get("num_simulations", 25000))
    horizon_days = int(payload.get("horizon_days", 252))
    return monte_carlo_engine.run_simulation(num_simulations=num_sims, horizon_days=horizon_days)

@app.get("/api/research/backtest", response_model=BacktestComparisonResponse)
def get_walk_forward_backtest():
    """Returns Walk-Forward Rolling Backtest across 2018-2024 windows measuring CAGR, Sharpe, Sortino, Calmar, and MDD."""
    return walk_forward_backtester.run_walk_forward_backtest()

@app.post("/api/research/risk-attribution", response_model=RiskAttributionReport)
def get_risk_attribution(payload: Dict[str, Any] = Body(default={})):
    """Performs Euler Marginal Risk Decomposition (%RC_i) across portfolio holdings."""
    portfolio_id = payload.get("portfolio_id", "port-growth-001")
    p_data = _active_portfolios.get("growth")
    for p in _active_portfolios.values():
        if p["id"] == portfolio_id:
            p_data = p
            break
    return risk_attribution_engine.compute_risk_attribution(p_data["holdings"])

@app.post("/api/research/uncertainty", response_model=UncertaintyReport)
def get_uncertainty_estimates(payload: Dict[str, Any] = Body(default={})):
    """Computes 95% Confidence Intervals via non-parametric Block Bootstrap and Lo asymptotic variance."""
    portfolio_id = payload.get("portfolio_id", "port-growth-001")
    p_data = _active_portfolios.get("growth")
    for p in _active_portfolios.values():
        if p["id"] == portfolio_id:
            p_data = p
            break
    m, _, _ = calculate_portfolio_metrics(p_data["holdings"])
    return uncertainty_estimator.compute_uncertainty(m)

@app.get("/api/research/knowledge-graph", response_model=KnowledgeGraphData)
def get_knowledge_graph():
    """Returns the Financial Knowledge Graph (nodes, edges, macro dependencies) for GraphRAG."""
    return financial_knowledge_graph.get_full_graph()

@app.get("/api/research/benchmark", response_model=BenchmarkSuiteResponse)
def get_llm_benchmark_evaluation():
    """Returns the empirical evaluation benchmark across 120 questions for Models A-D."""
    return llm_eval_benchmark.get_benchmark_suite()

@app.get("/api/research/personalize", response_model=InvestorProfileComparison)
def get_investor_personalization_experiment():
    """Evaluates Conservative vs Moderate vs Aggressive optimizer profiles and tests hypothesis H1."""
    return investor_personalization_engine.evaluate_profiles()

