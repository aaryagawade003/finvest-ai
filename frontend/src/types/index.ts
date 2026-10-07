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

// --- FinVest-R Research Interfaces ---

export interface OptimizationResult {
  strategy: string;
  strategy_name: string;
  weights: Record<string, number>;
  sector_weights: Record<string, number>;
  expected_return: number;
  expected_volatility: number;
  sharpe_ratio: number;
  diversification_score: number;
  max_drawdown: number;
  risk_contributions: Record<string, number>;
  mathematical_formula: string;
  objective_value: number;
  ai_explanation?: string;
}

export interface OptimizationComparisonResponse {
  strategies: Record<string, OptimizationResult>;
  efficient_frontier_points: Array<{ volatility: number; return: number; sharpe: number }>;
  best_strategy: string;
  summary_explanation: string;
  mathematical_proof: string;
}

export interface ScenarioImpact {
  scenario_id: string;
  name: string;
  description: string;
  macro_shock_details: Record<string, string>;
  metrics_table: Array<{
    metric: string;
    original: string;
    shock: string;
    delta: string;
    negative: boolean;
  }>;
  asset_impacts: Record<string, number>;
  ai_attribution: string;
}

export interface StressTestResponse {
  scenarios: ScenarioImpact[];
  resilience_ranking: Array<{
    scenario_id: string;
    name: string;
    capital_impact_pct: number;
    shocked_sharpe: number;
    resilience_rating: string;
  }>;
  research_takeaways: string;
}

export interface MonteCarloResult {
  num_simulations: number;
  horizon_days: number;
  strategy_metrics: Record<string, {
    name: string;
    expected_return: number;
    volatility: number;
    sharpe_ratio: number;
    var_95: number;
    cvar_95: number;
    var_99: number;
    cvar_99: number;
    probability_of_loss: number;
    probability_exceeding_target: number;
    expected_mdd: number;
    worst_case_mdd_95: number;
    median_terminal_wealth: number;
  }>;
  sample_paths: Record<string, number[][]>;
  terminal_wealth_percentiles: Record<string, {
    p5: number;
    p25: number;
    p50: number;
    p75: number;
    p95: number;
  }>;
  research_conclusion: string;
}

export interface BacktestMetrics {
  strategy_name: string;
  cagr: number;
  volatility: number;
  sharpe: number;
  sortino: number;
  max_drawdown: number;
  calmar_ratio: number;
  var_95: number;
  cvar_95: number;
  win_rate: number;
  cumulative_return: number;
}

export interface BacktestComparisonResponse {
  train_test_windows: Array<{ window_id: string; train: string; test: string; market_regime: string }>;
  results_table: BacktestMetrics[];
  annual_returns_breakdown: Array<Record<string, any>>;
  research_insights: string;
}

export interface RiskAttributionItem {
  symbol: string;
  name: string;
  weight: number;
  volatility: number;
  marginal_risk_contribution: number;
  percentage_risk_contribution: number;
  traceability: {
    data_point: string;
    calculation: string;
    source: string;
    evidence: string;
  };
}

export interface RiskAttributionReport {
  total_volatility: number;
  components: RiskAttributionItem[];
  top_risk_driver: string;
  concentration_risk_summary: string;
  recommended_action: string;
}

export interface KnowledgeGraphNode {
  id: string;
  label: string;
  type: string;
  properties?: Record<string, any>;
}

export interface KnowledgeGraphEdge {
  source: string;
  target: string;
  relation: string;
  weight: number;
}

export interface KnowledgeGraphData {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  entity_insights?: Record<string, any>;
}

export interface UncertaintyEstimate {
  metric_name: string;
  point_estimate: number;
  ci_lower_95: number;
  ci_upper_95: number;
  standard_error: number;
  confidence_score: number;
  method: string;
}

export interface UncertaintyReport {
  metrics: UncertaintyEstimate[];
  bootstrap_samples: number;
  research_note: string;
}

export interface InvestorProfileComparison {
  profiles: Record<string, any>;
  hypothesis_testing: Record<string, any>;
}

export interface BenchmarkEvaluationResult {
  model_name: string;
  model_tag: string;
  numerical_accuracy: number;
  citation_accuracy: number;
  hallucination_rate: number;
  risk_explanation_score: number;
  sample_evaluations: Array<{
    question: string;
    response: string;
    accurate: boolean;
    hallucination: boolean;
    note: string;
  }>;
}

export interface BenchmarkSuiteResponse {
  benchmark_size: number;
  models: BenchmarkEvaluationResult[];
  research_verdict: string;
}

