import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health():
    res = client.get("/api/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"

def test_demo_portfolios():
    res = client.get("/api/demo/portfolios")
    assert res.status_code == 200
    data = res.json()
    assert "growth" in data
    assert "balanced" in data
    assert "conservative" in data
    
    growth = data["growth"]
    assert growth["metrics"]["total_portfolio_value"] > 1400000
    assert len(growth["holdings"]) >= 8

def test_get_single_portfolio():
    res = client.get("/api/demo/portfolios/growth")
    assert res.status_code == 200
    assert res.json()["name"] == "Growth Investor Profile"

def test_what_if_simulation():
    res = client.post("/api/analytics/simulate", json={
        "portfolio_id": "port-growth-01",
        "target_sector_weights": {
            "Technology": 30.0,
            "Healthcare": 25.0,
            "Precious Metals": 15.0
        }
    })
    assert res.status_code == 200
    data = res.json()
    assert "simulated_metrics" in data
    assert "metric_deltas" in data
    assert "ai_explanation" in data

def test_copilot_chat():
    res = client.post("/api/copilot/chat", json={
        "portfolio_id": "port-growth-01",
        "question": "What is the biggest risk in my portfolio?"
    })
    assert res.status_code == 200
    data = res.json()
    assert "answer" in data
    assert len(data["suggested_followups"]) > 0

def test_copilot_report():
    res = client.post("/api/copilot/report", json={
        "portfolio_id": "port-growth-01"
    })
    assert res.status_code == 200
    data = res.json()
    assert "executive_summary" in data
    assert "financial_snapshot" in data
    assert "risk_analytics_table" in data

def test_settings_endpoints():
    res = client.get("/api/settings/status")
    assert res.status_code == 200
    data = res.json()
    assert "providers" in data
    assert "gemini" in data["providers"]
    assert "openai" in data["providers"]
    assert "yahoo_finance" in data["providers"]

    # Test key update
    res_update = client.post("/api/settings/keys", json={
        "DEFAULT_LLM_PROVIDER": "gemini"
    })
    assert res_update.status_code == 200
    assert res_update.json()["status"] == "UPDATED"

def test_live_market_endpoints():
    # Test live quote endpoint
    res = client.get("/api/market/live-quote/AAPL")
    assert res.status_code == 200
    quote = res.json()
    assert "symbol" in quote
    assert "price" in quote
    assert quote["price"] > 0

    # Test news endpoint
    res_news = client.get("/api/market/news/AAPL")
    assert res_news.status_code == 200
    news = res_news.json()
    assert isinstance(news, list)

def test_prometheus_metrics():
    res = client.get("/metrics")
    assert res.status_code == 200
    assert "finvest_ai_requests_total" in res.text
