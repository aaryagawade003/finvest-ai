import pytest
from app.models.schemas import Holding, AssetClass, WhatIfRequest, CopilotQuery
from app.analytics.risk_engine import calculate_portfolio_metrics
from app.analytics.simulator import simulate_portfolio_scenario
from app.ai.copilot import generate_copilot_response
from app.demo_data import get_demo_profiles

def test_growth_portfolio_metrics():
    profiles = get_demo_profiles()
    assert "growth" in profiles
    growth = profiles["growth"]
    
    metrics, allocation, alerts = calculate_portfolio_metrics(growth["holdings"])
    
    # Verify portfolio valuation (~14.5L to 15.5L)
    assert metrics.total_portfolio_value > 1400000.0
    assert metrics.volatility > 10.0
    assert metrics.sharpe_ratio > 0.8
    assert metrics.beta > 1.0
    assert metrics.max_drawdown < 0  # negative number
    
    # Technology sector should be ~50-55%
    assert allocation.sector_allocation.get("Technology", 0) > 45.0
    
    # Concentration alert should be present due to high tech exposure
    conc_alerts = [a for a in alerts if a.type == "CONCENTRATION"]
    assert len(conc_alerts) >= 1
    assert "Technology" in conc_alerts[0].title

def test_balanced_portfolio_metrics():
    profiles = get_demo_profiles()
    balanced = profiles["balanced"]
    metrics, allocation, alerts = calculate_portfolio_metrics(balanced["holdings"])
    
    # Balanced should have lower volatility than growth
    assert metrics.volatility < 16.0
    # Diversification score should be higher due to multi-asset allocation
    assert metrics.diversification_score > 60.0

def test_what_if_simulator():
    profiles = get_demo_profiles()
    growth_holdings = profiles["growth"]["holdings"]
    
    # Simulate trimming Technology to 30% and allocating to Healthcare and Gold
    request = WhatIfRequest(
        target_sector_weights={
            "Technology": 30.0,
            "Healthcare": 25.0,
            "Precious Metals": 15.0
        }
    )
    response = simulate_portfolio_scenario(request, growth_holdings)
    
    # Check that simulated volatility is lower than current
    assert response.metric_deltas["volatility_delta"] < 0
    # Check that diversification improved
    assert response.metric_deltas["diversification_delta"] > 0
    assert len(response.ai_explanation) > 50

def test_copilot_reasoning():
    profiles = get_demo_profiles()
    growth = profiles["growth"]
    metrics, alloc, alerts = calculate_portfolio_metrics(growth["holdings"])
    
    query = CopilotQuery(
        question="What is the biggest risk in my portfolio?"
    )
    response = generate_copilot_response(query)
    assert "Technology" in response.answer or "Concentration" in response.answer
    assert len(response.suggested_followups) >= 2
