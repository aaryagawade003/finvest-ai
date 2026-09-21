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
