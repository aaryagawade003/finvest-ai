export type AssetClass = 'EQUITY' | 'ETF' | 'BOND' | 'COMMODITY' | 'CASH';

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  asset_class: AssetClass;
  sector: string;
  quantity: number;
  avg_buy_price: number;
  current_price: number;
  currency: string;
  weight?: number;
  pnl?: number;
  pnl_pct?: number;
}

export interface RiskMetrics {
  total_portfolio_value: number;
  total_invested_amount: number;
  total_unrealized_pnl: number;
  total_pnl_percentage: number;
  today_pnl: number;
  today_pnl_percentage: number;
  annualized_return: number;
  volatility: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown: number;
  beta: number;
  diversification_score: number;
  hhi_sector_concentration: number;
  risk_level: string;
  benchmark_name: string;
  benchmark_return: number;
}

export interface TopHoldingValue {
  id: string;
  symbol: string;
  name: string;
  value: number;
  pnl: number;
  pnl_pct: number;
  weight: number;
}

export interface AllocationBreakdown {
  sector_allocation: Record<string, number>;
  asset_allocation: Record<string, number>;
  top_holdings: TopHoldingValue[];
}

export interface PortfolioAlert {
  id: string;
  type: 'CONCENTRATION' | 'VOLATILITY' | 'DRAWDOWN' | 'BENCHMARK_DIVERGENCE' | 'PERFORMANCE';
  level: 'INFO' | 'WARNING' | 'CRITICAL';
  title: string;
  message: string;
  metric_value?: number;
  threshold?: number;
  created_at: string;
}

export interface HistoricalDataPoint {
  date: string;
  portfolio: number;
  benchmark: number;
  portfolio_return_pct: number;
  benchmark_return_pct: number;
}

export interface PortfolioSummary {
  id: string;
  name: string;
  owner: string;
  description: string;
  holdings: Holding[];
  metrics: RiskMetrics;
  allocation: AllocationBreakdown;
  alerts: PortfolioAlert[];
  history: HistoricalDataPoint[];
}

export interface WhatIfResponse {
  current_metrics: RiskMetrics;
  simulated_metrics: RiskMetrics;
  metric_deltas: {
    volatility_delta: number;
    sharpe_delta: number;
    drawdown_delta: number;
    beta_delta: number;
    diversification_delta: number;
    expected_return_delta: number;
  };
  ai_explanation: string;
  recommendations: string[];
}

export interface CopilotResponse {
  answer: string;
  referenced_metrics: Record<string, any>;
  relevant_context: string[];
  suggested_followups: string[];
}

export interface ExecutiveReport {
  report_id: string;
  generated_at: string;
  portfolio_name: string;
  owner: string;
  currency: string;
  executive_summary: {
    verdict: string;
    headline: string;
    key_takeaways: string[];
  };
  financial_snapshot: {
    total_value: number;
    invested_capital: number;
    net_unrealized_pnl: number;
    net_pnl_percentage: number;
    today_pnl: number;
    today_pnl_percentage: number;
  };
  risk_analytics_table: Array<{
    metric: string;
    portfolio: string;
    benchmark: string;
    status: string;
  }>;
  sector_breakdown: Record<string, number>;
  top_holdings: TopHoldingValue[];
  strategic_recommendations: string[];
}

export interface Transaction {
  id?: string;
  symbol: string;
  name: string;
  transaction_type: 'BUY' | 'SELL';
  quantity: number;
  price: number;
  timestamp?: string;
  notes?: string;
}

export interface ProviderStatus {
  configured: boolean;
  masked_key?: string;
  model?: string;
  status?: string;
  coverage?: string;
  features?: string;
}

export interface SettingsStatus {
  active_llm_provider: string;
  providers: {
    gemini: ProviderStatus;
    openai: ProviderStatus;
    finnhub: ProviderStatus;
    alpha_vantage: ProviderStatus;
    yahoo_finance: ProviderStatus;
  };
}

export interface TestKeyResult {
  valid: boolean;
  provider: string;
  latency_ms?: number;
  message: string;
}

export interface LiveQuote {
  symbol: string;
  source: string;
  price: number;
  change: number;
  change_pct: number;
  previous_close: number;
  high?: number;
  low?: number;
  currency: string;
}
