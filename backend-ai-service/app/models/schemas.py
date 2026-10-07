from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime
from enum import Enum

class AssetClass(str, Enum):
    EQUITY = "EQUITY"
    ETF = "ETF"
    BOND = "BOND"
    COMMODITY = "COMMODITY"
    CASH = "CASH"

class TransactionType(str, Enum):
    BUY = "BUY"
    SELL = "SELL"

class Holding(BaseModel):
    id: str
    symbol: str
    name: str
    asset_class: AssetClass
    sector: str
    quantity: float
    avg_buy_price: float
    current_price: float
    currency: str = "INR"
    last_updated: Optional[datetime] = None

    @property
    def invested_amount(self) -> float:
        return self.quantity * self.avg_buy_price

    @property
    def current_value(self) -> float:
        return self.quantity * self.current_price

    @property
    def pnl(self) -> float:
        return self.current_value - self.invested_amount

    @property
    def pnl_percentage(self) -> float:
        if self.invested_amount == 0:
            return 0.0
        return (self.pnl / self.invested_amount) * 100

class Transaction(BaseModel):
    id: str
    portfolio_id: str
    symbol: str
    name: str
    transaction_type: TransactionType
    quantity: float
    price: float
    timestamp: datetime
    notes: Optional[str] = None

class RiskMetrics(BaseModel):
    total_portfolio_value: float
    total_invested_amount: float
    total_unrealized_pnl: float
    total_pnl_percentage: float
    today_pnl: float
    today_pnl_percentage: float
    annualized_return: float
    volatility: float  # Annualized std dev (%)
    sharpe_ratio: float
    sortino_ratio: float
    max_drawdown: float  # Negative percentage (e.g. -8.2%)
    beta: float  # Relative to benchmark
    diversification_score: float  # 0 to 100
    hhi_sector_concentration: float  # 0 to 10,000
    risk_level: str  # Low, Moderate, High, Very High
    benchmark_name: str = "NIFTY 50"
    benchmark_return: float = 11.2

class AllocationBreakdown(BaseModel):
    sector_allocation: Dict[str, float]  # sector name -> percentage (0-100)
    asset_allocation: Dict[str, float]   # asset class -> percentage (0-100)
    top_holdings: List[Dict[str, Any]]

class AlertLevel(str, Enum):
    INFO = "INFO"
    WARNING = "WARNING"
    CRITICAL = "CRITICAL"

class PortfolioAlert(BaseModel):
    id: str
    type: str  # CONCENTRATION, VOLATILITY, DRAWDOWN, BENCHMARK_DIVERGENCE, PERFORMANCE
    level: AlertLevel
    title: str
    message: str
    metric_value: Optional[float] = None
    threshold: Optional[float] = None
    created_at: datetime

class PortfolioSummary(BaseModel):
    id: str
    name: str
    owner: str
    description: str
    holdings: List[Holding]
    metrics: RiskMetrics
    allocation: AllocationBreakdown
    alerts: List[PortfolioAlert]
    history: List[Dict[str, Any]]

class WhatIfRequest(BaseModel):
    portfolio_id: Optional[str] = None
    holdings: Optional[List[Holding]] = None
    target_sector_weights: Optional[Dict[str, float]] = None # e.g. {"Technology": 30.0, "Healthcare": 25.0}
    target_asset_weights: Optional[Dict[str, float]] = None
    simulated_transactions: Optional[List[Dict[str, Any]]] = None

class WhatIfResponse(BaseModel):
    current_metrics: RiskMetrics
    simulated_metrics: RiskMetrics
    metric_deltas: Dict[str, float]
    ai_explanation: str
    recommendations: List[str]

class CopilotQuery(BaseModel):
    portfolio_id: Optional[str] = None
    portfolio: Optional[PortfolioSummary] = None
    question: str
    conversation_history: Optional[List[Dict[str, str]]] = []

class CopilotResponse(BaseModel):
    answer: str
    referenced_metrics: Dict[str, Any]
    relevant_context: List[str]
    suggested_followups: List[str]

class ReportRequest(BaseModel):
    portfolio_id: Optional[str] = None
    portfolio: Optional[PortfolioSummary] = None
    include_ai_commentary: bool = True

# --- FinVest-R Research Schemas ---

class OptimizationStrategy(str, Enum):
    EQUAL_WEIGHT = "EQUAL_WEIGHT"
    MEAN_VARIANCE = "MEAN_VARIANCE"
    MIN_VOLATILITY = "MIN_VOLATILITY"
    MAX_SHARPE = "MAX_SHARPE"
    RISK_PARITY = "RISK_PARITY"
    FINVEST_R = "FINVEST_R"

class OptimizationResult(BaseModel):
    strategy: str
    strategy_name: str
    weights: Dict[str, float]  # symbol -> weight percentage (0-100)
    sector_weights: Dict[str, float]
    expected_return: float
    expected_volatility: float
    sharpe_ratio: float
    diversification_score: float
    max_drawdown: float
    risk_contributions: Dict[str, float]  # Euler risk contribution %
    mathematical_formula: str
    objective_value: float
    ai_explanation: Optional[str] = None

class OptimizationComparisonResponse(BaseModel):
    strategies: Dict[str, OptimizationResult]
    efficient_frontier_points: List[Dict[str, float]]
    best_strategy: str
    summary_explanation: str
    mathematical_proof: str

class ScenarioImpact(BaseModel):
    scenario_id: str
    name: str
    description: str
    macro_shock_details: Dict[str, str]
    metrics_table: List[Dict[str, Any]]
    asset_impacts: Dict[str, float]
    ai_attribution: str

class StressTestResponse(BaseModel):
    scenarios: List[ScenarioImpact]
    resilience_ranking: List[Dict[str, Any]]
    research_takeaways: str

class MonteCarloResult(BaseModel):
    num_simulations: int
    horizon_days: int
    strategy_metrics: Dict[str, Dict[str, Any]]
    sample_paths: Dict[str, List[List[float]]]
    terminal_wealth_percentiles: Dict[str, Dict[str, float]]
    research_conclusion: str

class BacktestMetrics(BaseModel):
    strategy_name: str
    cagr: float
    volatility: float
    sharpe: float
    sortino: float
    max_drawdown: float
    calmar_ratio: float
    var_95: float
    cvar_95: float
    win_rate: float
    cumulative_return: float

class BacktestComparisonResponse(BaseModel):
    train_test_windows: List[Dict[str, str]]
    results_table: List[BacktestMetrics]
    annual_returns_breakdown: List[Dict[str, Any]]
    research_insights: str

class RiskAttributionItem(BaseModel):
    symbol: str
    name: str
    weight: float
    volatility: float
    marginal_risk_contribution: float
    percentage_risk_contribution: float
    traceability: Dict[str, str]

class RiskAttributionReport(BaseModel):
    total_volatility: float
    components: List[RiskAttributionItem]
    top_risk_driver: str
    concentration_risk_summary: str
    recommended_action: str

class KnowledgeGraphNode(BaseModel):
    id: str
    label: str
    type: str  # Company, Sector, MacroFactor, AssetClass, FinancialEvent
    properties: Dict[str, Any] = {}

class KnowledgeGraphEdge(BaseModel):
    source: str
    target: str
    relation: str  # belongs_to, affected_by, correlated_with, reported, hedges
    weight: float = 1.0

class KnowledgeGraphData(BaseModel):
    nodes: List[KnowledgeGraphNode]
    edges: List[KnowledgeGraphEdge]
    entity_insights: Optional[Dict[str, Any]] = None

class UncertaintyEstimate(BaseModel):
    metric_name: str
    point_estimate: float
    ci_lower_95: float
    ci_upper_95: float
    standard_error: float
    confidence_score: float
    method: str

class UncertaintyReport(BaseModel):
    metrics: List[UncertaintyEstimate]
    bootstrap_samples: int
    research_note: str

class InvestorProfileType(str, Enum):
    CONSERVATIVE = "CONSERVATIVE"
    MODERATE = "MODERATE"
    AGGRESSIVE = "AGGRESSIVE"

class InvestorProfileComparison(BaseModel):
    profiles: Dict[str, Dict[str, Any]]
    hypothesis_testing: Dict[str, Any]

class BenchmarkEvaluationResult(BaseModel):
    model_name: str
    model_tag: str
    numerical_accuracy: float
    citation_accuracy: float
    hallucination_rate: float
    risk_explanation_score: float
    sample_evaluations: List[Dict[str, Any]]

class BenchmarkSuiteResponse(BaseModel):
    benchmark_size: int
    models: List[BenchmarkEvaluationResult]
    research_verdict: str

