import pytest
import numpy as np
from fastapi.testclient import TestClient
from app.main import app
from app.analytics.optimizer import portfolio_optimizer
from app.analytics.stress_tester import stress_test_engine
from app.analytics.monte_carlo import monte_carlo_engine
from app.analytics.backtester import walk_forward_backtester
from app.analytics.risk_attribution import risk_attribution_engine
from app.analytics.uncertainty import uncertainty_estimator
from app.analytics.investor_profile import investor_personalization_engine
from app.ai.knowledge_graph import financial_knowledge_graph
from app.ai.eval_benchmark import llm_eval_benchmark
from app.demo_data import get_demo_profiles

client = TestClient(app)

def test_portfolio_optimizer_baselines_and_finvest_r():
    comparison = portfolio_optimizer.compare_all_strategies(risk_profile="MODERATE")
    assert "EQUAL_WEIGHT" in comparison.strategies
    assert "MEAN_VARIANCE" in comparison.strategies
    assert "MIN_VOLATILITY" in comparison.strategies
    assert "MAX_SHARPE" in comparison.strategies
    assert "RISK_PARITY" in comparison.strategies
    assert "FINVEST_R" in comparison.strategies

    # Check Equal Weight weights sum to 100%
    eq = comparison.strategies["EQUAL_WEIGHT"]
    assert round(sum(eq.weights.values())) == 100

    # Check FinVest-R weights sum to 100% and sector constraint
    finvest = comparison.strategies["FINVEST_R"]
    assert round(sum(finvest.weights.values())) == 100
    for sec, w in finvest.sector_weights.items():
        assert w <= 32.5, f"Sector {sec} exceeded 32% institutional threshold: {w}%"

    assert len(comparison.efficient_frontier_points) > 10

def test_stress_testing_scenarios():
    profiles = get_demo_profiles()
    holdings = profiles["growth"]["holdings"]
    res = stress_test_engine.run_stress_test(holdings)
    assert len(res.scenarios) == 5
    scenario_ids = [s.scenario_id for s in res.scenarios]
    assert "SCENARIO_A" in scenario_ids
    assert "SCENARIO_B" in scenario_ids
    assert "SCENARIO_C" in scenario_ids
    assert "SCENARIO_D" in scenario_ids
    assert "SCENARIO_E" in scenario_ids

    # Verify metrics table structure
    s_a = res.scenarios[0]
    assert len(s_a.metrics_table) == 5
    assert any(m["metric"] == "Annualized Return" for m in s_a.metrics_table)

def test_monte_carlo_engine():
    res = monte_carlo_engine.run_simulation(num_simulations=5000, horizon_days=252)
    assert "FINVEST_R" in res.strategy_metrics
    assert "EQUAL_WEIGHT" in res.strategy_metrics
    finvest_m = res.strategy_metrics["FINVEST_R"]
    eq_m = res.strategy_metrics["EQUAL_WEIGHT"]
    
    # FinVest-R should have lower probability of loss than Equal Weight
    assert finvest_m["probability_of_loss"] < eq_m["probability_of_loss"]
    assert finvest_m["var_95"] > 0
    assert finvest_m["cvar_95"] > finvest_m["var_95"]

def test_walk_forward_backtest():
    res = walk_forward_backtester.run_walk_forward_backtest()
    assert len(res.train_test_windows) == 4
    assert len(res.results_table) >= 6
    finvest_row = next(r for r in res.results_table if "FinVest-R" in r.strategy_name)
    assert finvest_row.sharpe > 0.6
    assert finvest_row.cagr > 10.0

def test_euler_risk_attribution():
    profiles = get_demo_profiles()
    holdings = profiles["growth"]["holdings"]
    report = risk_attribution_engine.compute_risk_attribution(holdings)
    assert report.total_volatility > 0
    assert len(report.components) > 0
    # Euler's theorem: sum of percentage risk contributions should equal 100%
    prc_sum = sum(c.percentage_risk_contribution for c in report.components)
    assert abs(prc_sum - 100.0) < 1.0
    assert report.top_risk_driver != "None"

def test_uncertainty_estimation():
    profiles = get_demo_profiles()
    from app.analytics.risk_engine import calculate_portfolio_metrics
    m, _, _ = calculate_portfolio_metrics(profiles["growth"]["holdings"])
    res = uncertainty_estimator.compute_uncertainty(m)
    assert len(res.metrics) == 5
    for est in res.metrics:
        assert est.ci_upper_95 >= est.ci_lower_95
        assert est.standard_error >= 0

def test_knowledge_graph_and_rag():
    data = financial_knowledge_graph.get_full_graph()
    assert len(data.nodes) >= 15
    assert len(data.edges) >= 20
    query_text = financial_knowledge_graph.query_relationships_for_symbols(["NVDA", "TCS"])
    assert "NVIDIA" in query_text or "Tata Consultancy" in query_text

def test_investor_personalization():
    comp = investor_personalization_engine.evaluate_profiles()
    assert "CONSERVATIVE" in comp.profiles
    assert "MODERATE" in comp.profiles
    assert "AGGRESSIVE" in comp.profiles
    assert comp.profiles["CONSERVATIVE"]["expected_volatility"] < comp.profiles["AGGRESSIVE"]["expected_volatility"]

def test_llm_benchmark_evaluation():
    bench = llm_eval_benchmark.get_benchmark_suite()
    assert bench.benchmark_size >= 100
    assert len(bench.models) == 4
    finvest_model = next(m for m in bench.models if m.model_tag == "FINVEST_R")
    no_rag_model = next(m for m in bench.models if m.model_tag == "NO_RAG")
    assert finvest_model.numerical_accuracy > no_rag_model.numerical_accuracy
    assert finvest_model.hallucination_rate < no_rag_model.hallucination_rate

def test_research_api_endpoints():
    # Optimization
    r_opt = client.post("/api/research/optimize", json={"risk_profile": "MODERATE"})
    assert r_opt.status_code == 200
    assert "strategies" in r_opt.json()

    # Stress Test
    r_stress = client.post("/api/research/stress-test", json={})
    assert r_stress.status_code == 200
    assert len(r_stress.json()["scenarios"]) == 5

    # Backtest
    r_bt = client.get("/api/research/backtest")
    assert r_bt.status_code == 200
    assert len(r_bt.json()["results_table"]) >= 6

    # Knowledge Graph
    r_kg = client.get("/api/research/knowledge-graph")
    assert r_kg.status_code == 200
    assert len(r_kg.json()["nodes"]) >= 15

    # Benchmark
    r_bm = client.get("/api/research/benchmark")
    assert r_bm.status_code == 200
    assert len(r_bm.json()["models"]) == 4
