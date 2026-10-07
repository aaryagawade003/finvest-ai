import { 
  PortfolioSummary, 
  WhatIfResponse, 
  CopilotResponse, 
  ExecutiveReport, 
  Transaction,
  SettingsStatus,
  TestKeyResult,
  LiveQuote,
  OptimizationComparisonResponse,
  StressTestResponse,
  MonteCarloResult,
  BacktestComparisonResponse,
  RiskAttributionReport,
  UncertaintyReport,
  KnowledgeGraphData,
  BenchmarkSuiteResponse,
  InvestorProfileComparison
} from '../types';

const API_BASE = '/api';

export async function getDemoPortfolios(): Promise<Record<string, PortfolioSummary>> {
  try {
    const res = await fetch(`${API_BASE}/demo/portfolios`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('API error, using fallback client data', err);
    return getFallbackPortfolios();
  }
}

export async function simulateScenario(portfolioId: string, sectorWeights: Record<string, number>): Promise<WhatIfResponse> {
  try {
    const res = await fetch(`${API_BASE}/analytics/simulate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        portfolio_id: portfolioId,
        target_sector_weights: sectorWeights
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Simulation API error, using fallback simulation', err);
    return getFallbackSimulation(sectorWeights);
  }
}

export async function askCopilot(question: string, portfolio?: PortfolioSummary): Promise<CopilotResponse> {
  try {
    const res = await fetch(`${API_BASE}/copilot/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        portfolio: portfolio || null
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Copilot API error, using client heuristic copilot', err);
    return getFallbackCopilotResponse(question, portfolio);
  }
}

export async function generateExecutiveReport(portfolio?: PortfolioSummary): Promise<ExecutiveReport> {
  try {
    const res = await fetch(`${API_BASE}/copilot/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio: portfolio || null })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    console.warn('Report API error, using fallback report generator', err);
    return getFallbackReport(portfolio);
  }
}

export async function triggerMarketShock(dropPercentage: number = -0.045): Promise<any> {
  try {
    const res = await fetch(`${API_BASE}/market/shock?drop_percentage=${dropPercentage}`, {
      method: 'POST'
    });
    return await res.json();
  } catch (err) {
    console.warn('Market shock API error', err);
    return { message: 'Shock simulated in client state' };
  }
}

// ==================== REAL SETTINGS & KEYS ====================

export async function getSettingsStatus(): Promise<SettingsStatus> {
  try {
    const res = await fetch(`${API_BASE}/settings/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      active_llm_provider: "None",
      providers: {
        gemini: { configured: false, masked_key: "Not Configured" },
        openai: { configured: false, masked_key: "Not Configured" },
        finnhub: { configured: false, masked_key: "Not Configured" },
        alpha_vantage: { configured: false, masked_key: "Not Configured" },
        yahoo_finance: { configured: true, status: "Active (Zero-Key Real-Time Market Feed)" }
      }
    };
  }
}

export async function updateApiKeys(keys: Record<string, string>): Promise<any> {
  const res = await fetch(`${API_BASE}/settings/keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(keys)
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function testApiKey(provider: string, key: string): Promise<TestKeyResult> {
  try {
    const res = await fetch(`${API_BASE}/settings/test-key`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, key })
    });
    return await res.json();
  } catch (err: any) {
    return {
      valid: false,
      provider,
      message: err.message || "Failed to reach backend"
    };
  }
}

export async function getLiveQuote(symbol: string): Promise<LiveQuote> {
  try {
    const res = await fetch(`${API_BASE}/market/live-quote/${encodeURIComponent(symbol)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      symbol: symbol.toUpperCase(),
      source: "FinVest Standard Store",
      price: 150.0,
      change: 0.0,
      change_pct: 0.0,
      previous_close: 150.0,
      currency: "INR"
    };
  }
}

// Client-side instant fallback generators to ensure 100% resilient UI demo
function getFallbackPortfolios(): Record<string, PortfolioSummary> {
  return {
    growth: {
      id: "port-growth-01",
      name: "Growth Investor Profile",
      owner: "Aditya Sharma",
      description: "Aggressive capital compounding oriented portfolio with 55% Technology concentration and high-beta equities.",
      holdings: [
        { id: "h-tcs", symbol: "TCS", name: "Tata Consultancy Services", asset_class: "EQUITY", sector: "Technology", quantity: 72, avg_buy_price: 3750, current_price: 4210, currency: "INR" },
        { id: "h-msft", symbol: "MSFT", name: "Microsoft Corp.", asset_class: "EQUITY", sector: "Technology", quantity: 7.5, avg_buy_price: 31500, current_price: 35090, currency: "INR" },
        { id: "h-nvda", symbol: "NVDA", name: "NVIDIA Corp.", asset_class: "EQUITY", sector: "Technology", quantity: 25, avg_buy_price: 8500, current_price: 10250, currency: "INR" },
        { id: "h-hdfc", symbol: "HDFCBANK", name: "HDFC Bank Ltd.", asset_class: "EQUITY", sector: "Financial Services", quantity: 120, avg_buy_price: 1510, current_price: 1640.5, currency: "INR" },
        { id: "h-icici", symbol: "ICICIBANK", name: "ICICI Bank Ltd.", asset_class: "EQUITY", sector: "Financial Services", quantity: 85, avg_buy_price: 1075, current_price: 1215.3, currency: "INR" },
        { id: "h-sunpharma", symbol: "SUNPHARMA", name: "Sun Pharma Industries", asset_class: "EQUITY", sector: "Healthcare", quantity: 83, avg_buy_price: 1620, current_price: 1810, currency: "INR" },
        { id: "h-niftybees", symbol: "NIFTYBEES", name: "Nippon India Nifty 50 BeES ETF", asset_class: "ETF", sector: "Broad Market Index", quantity: 560, avg_buy_price: 245, current_price: 268.4, currency: "INR" },
        { id: "h-goldbees", symbol: "GOLDBEES", name: "Nippon India Gold BeES ETF", asset_class: "COMMODITY", sector: "Precious Metals", quantity: 1200, avg_buy_price: 56, current_price: 62.8, currency: "INR" }
      ],
      metrics: {
        total_portfolio_value: 1498600,
        total_invested_amount: 1330185,
        total_unrealized_pnl: 168415,
        total_pnl_percentage: 12.66,
        today_pnl: 18420,
        today_pnl_percentage: 1.23,
        annualized_return: 14.8,
        volatility: 12.4,
        sharpe_ratio: 1.31,
        sortino_ratio: 1.73,
        max_drawdown: -8.2,
        beta: 1.14,
        diversification_score: 62.0,
        hhi_sector_concentration: 3640,
        risk_level: "High",
        benchmark_name: "NIFTY 50",
        benchmark_return: 11.2
      },
      allocation: {
        sector_allocation: { "Technology": 54.5, "Financial Services": 20.0, "Healthcare": 10.0, "Broad Market Index": 10.1, "Precious Metals": 5.4 },
        asset_allocation: { "EQUITY": 84.5, "ETF": 10.1, "COMMODITY": 5.4 },
        top_holdings: [
          { id: "h-tcs", symbol: "TCS", name: "Tata Consultancy Services", value: 303120, pnl: 33120, pnl_pct: 12.27, weight: 20.2 },
          { id: "h-msft", symbol: "MSFT", name: "Microsoft Corp.", value: 263175, pnl: 26925, pnl_pct: 11.40, weight: 17.6 },
          { id: "h-nvda", symbol: "NVDA", name: "NVIDIA Corp.", value: 256250, pnl: 43750, pnl_pct: 20.59, weight: 17.1 },
          { id: "h-hdfc", symbol: "HDFCBANK", name: "HDFC Bank Ltd.", value: 196860, pnl: 15660, pnl_pct: 8.64, weight: 13.1 }
        ]
      },
      alerts: [
        { id: "a1", type: "CONCENTRATION", level: "CRITICAL", title: "High Technology Exposure (54.5%)", message: "Technology allocation exceeds recommended 35% concentration threshold.", created_at: "2026-09-11 10:00:00" },
        { id: "a2", type: "DRAWDOWN", level: "WARNING", title: "Drawdown Threshold Crossed (-8.2%)", message: "Peak-to-trough decline has touched -8.2%.", created_at: "2026-09-11 10:00:00" },
        { id: "a3", type: "PERFORMANCE", level: "INFO", title: "Benchmark Outperformance (+3.6%)", message: "Portfolio return (14.8%) leads NIFTY 50 (11.2%).", created_at: "2026-09-11 10:00:00" }
      ],
      history: generateMockHistory()
    }
  };
}

function generateMockHistory() {
  const points = [];
  let pVal = 1000000;
  let bVal = 1000000;
  const now = new Date();
  for (let i = 90; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    pVal *= (1 + (Math.random() * 0.008 - 0.0035));
    bVal *= (1 + (Math.random() * 0.006 - 0.0028));
    points.push({
      date: d.toISOString().split('T')[0],
      portfolio: Math.round(pVal),
      benchmark: Math.round(bVal),
      portfolio_return_pct: Math.round(((pVal / 1000000) - 1) * 1000) / 10,
      benchmark_return_pct: Math.round(((bVal / 1000000) - 1) * 1000) / 10
    });
  }
  return points;
}

function getFallbackSimulation(sectorWeights: Record<string, number>): WhatIfResponse {
  const techTarget = sectorWeights['Technology'] ?? 30;
  const isReduced = techTarget < 45;
  return {
    current_metrics: {
      total_portfolio_value: 1498600,
      total_invested_amount: 1330185,
      total_unrealized_pnl: 168415,
      total_pnl_percentage: 12.66,
      today_pnl: 18420,
      today_pnl_percentage: 1.23,
      annualized_return: 14.8,
      volatility: 12.4,
      sharpe_ratio: 1.31,
      sortino_ratio: 1.73,
      max_drawdown: -8.2,
      beta: 1.14,
      diversification_score: 62.0,
      hhi_sector_concentration: 3640,
      risk_level: "High",
      benchmark_name: "NIFTY 50",
      benchmark_return: 11.2
    },
    simulated_metrics: {
      total_portfolio_value: 1498600,
      total_invested_amount: 1330185,
      total_unrealized_pnl: 168415,
      total_pnl_percentage: 12.66,
      today_pnl: 12100,
      today_pnl_percentage: 0.81,
      annualized_return: isReduced ? 13.6 : 15.2,
      volatility: isReduced ? 9.8 : 13.5,
      sharpe_ratio: isReduced ? 1.42 : 1.25,
      sortino_ratio: isReduced ? 1.85 : 1.62,
      max_drawdown: isReduced ? -5.1 : -9.5,
      beta: isReduced ? 0.92 : 1.22,
      diversification_score: isReduced ? 84.5 : 54.0,
      hhi_sector_concentration: isReduced ? 1820 : 4200,
      risk_level: isReduced ? "Moderate" : "Very High",
      benchmark_name: "NIFTY 50",
      benchmark_return: 11.2
    },
    metric_deltas: {
      volatility_delta: isReduced ? -2.6 : 1.1,
      sharpe_delta: isReduced ? 0.11 : -0.06,
      drawdown_delta: isReduced ? 3.1 : -1.3,
      beta_delta: isReduced ? -0.22 : 0.08,
      diversification_delta: isReduced ? 22.5 : -8.0,
      expected_return_delta: isReduced ? -1.2 : 0.4
    },
    ai_explanation: isReduced
      ? "Simulated Scenario Analysis: Trimming Technology exposure reduces annualized volatility by 2.6% (from 12.4% to 9.8%) and cushions maximum historical drawdown from -8.2% to -5.1%. Diversification Score improves significantly to 84.5/100, achieving superior risk-adjusted return (Sharpe improves to 1.42)."
      : "Simulated Scenario Analysis: Increasing Technology exposure increases beta to 1.22 and pushes volatility up to 13.5%, leaving the portfolio more susceptible to tech sector drawdowns.",
    recommendations: isReduced
      ? [
          "Lower portfolio beta shields capital during broader market pullbacks.",
          "Increased allocation in non-correlated assets (Gold/Debt) optimizes the institutional efficiency frontier."
        ]
      : [
          "Keep stop-loss thresholds active due to heightened single-sector concentration risk."
        ]
  };
}

function getFallbackCopilotResponse(question: string, portfolio?: PortfolioSummary): CopilotResponse {
  const q = question.toLowerCase();
  if (q.includes("biggest risk") || q.includes("risk")) {
    return {
      answer: "**Primary Portfolio Risk: High Technology Exposure (54.5%)**\n\nYour portfolio is heavily weighted toward high-beta tech equities (TCS, MSFT, NVDA). While this has driven impressive +14.8% annualized returns, it also introduces:\n\n- **Elevated Volatility**: 12.4% vs benchmark 13.0%\n- **Concentration Index (HHI)**: 3,640 (Institutional guidelines flag >2,500 as high risk)\n- **Drawdown Vulnerability**: -8.2% peak drawdown\n\n**Actionable Advice**: Test our What-If Simulator to rebalance ~15% into Sovereign Debt or Gold to insulate against cyclical drawdowns.",
      referenced_metrics: { volatility: 12.4, beta: 1.14, sharpe: 1.31 },
      relevant_context: ["Technology equities exhibit beta > 1.15 and higher intra-sector correlation."],
      suggested_followups: [
        "How can I reduce risk without lowering returns?",
        "What happens if the tech sector drops 10%?",
        "How diversified is my portfolio?"
      ]
    };
  } else if (q.includes("benchmark") || q.includes("compare")) {
    return {
      answer: "**Benchmark Comparison (vs NIFTY 50)**\n\n- **Your Annualized Return**: **14.8%**\n- **Benchmark Return**: **11.2%**\n- **Alpha**: **+3.6%** excess return\n- **Sharpe Ratio**: **1.31** (Benchmark ~0.95)\n\nYour portfolio is currently beating the benchmark by 3.6 percentage points, primarily due to strong performance in semiconductor and cloud computing holdings.",
      referenced_metrics: { return: 14.8, benchmark: 11.2, alpha: 3.6 },
      relevant_context: ["Broad market index compounding provides lower volatility baseline."],
      suggested_followups: [
        "What is my biggest single holding risk?",
        "Why did my portfolio fall today?",
        "Generate an executive portfolio report"
      ]
    };
  } else {
    return {
      answer: `**Portfolio Intelligence Insight**\n\nRegarding *"${question}"*:\n\nYour current portfolio stands at **₹${(portfolio?.metrics?.total_portfolio_value ?? 1498600).toLocaleString('en-IN')}** with an annualized return of **${portfolio?.metrics?.annualized_return ?? 14.8}%** and a Sharpe Ratio of **${portfolio?.metrics?.sharpe_ratio ?? 1.31}**.\n\nMaintain discipline in periodic rebalancing and use our What-If Simulator before executing new trades.`,
      referenced_metrics: { total_value: 1498600, sharpe: 1.31 },
      relevant_context: ["Asset allocation determines over 80% of long-term return variance."],
      suggested_followups: [
        "What is the biggest risk in my portfolio?",
        "How diversified is my portfolio?",
        "Explain my Sharpe ratio"
      ]
    };
  }
}

function getFallbackReport(portfolio?: PortfolioSummary): ExecutiveReport {
  return {
    report_id: `FINVEST-REP-${Date.now()}`,
    generated_at: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    portfolio_name: portfolio?.name || "Growth Investor Profile",
    owner: portfolio?.owner || "Aditya Sharma",
    currency: "INR",
    executive_summary: {
      verdict: "High-Growth Profile with Elevated Single-Sector Concentration",
      headline: "The portfolio delivers solid compounding (+14.8% annualized return), outperforming NIFTY 50 by +3.6%. However, 54.5% Technology exposure represents the primary portfolio-level risk factor.",
      key_takeaways: [
        "Generated +3.6% Alpha relative to NIFTY 50 benchmark.",
        "Sharpe ratio of 1.31 demonstrates strong risk-adjusted returns.",
        "Technology concentration (54.5%) exceeds the 35% safety threshold.",
        "Diversification score rated at 62/100."
      ]
    },
    financial_snapshot: {
      total_value: 1498600,
      invested_capital: 1330185,
      net_unrealized_pnl: 168415,
      net_pnl_percentage: 12.66,
      today_pnl: 18420,
      today_pnl_percentage: 1.23
    },
    risk_analytics_table: [
      { metric: "Annualized Return", portfolio: "14.8%", benchmark: "11.2%", status: "Strong" },
      { metric: "Annualized Volatility", portfolio: "12.4%", benchmark: "13.0%", status: "Optimal" },
      { metric: "Sharpe Ratio (Rf=6.5%)", portfolio: "1.31", benchmark: "0.95", status: "Strong" },
      { metric: "Sortino Ratio", portfolio: "1.73", benchmark: "1.10", status: "Optimal" },
      { metric: "Maximum Drawdown", portfolio: "-8.2%", benchmark: "-6.5%", status: "Caution" },
      { metric: "Portfolio Beta", portfolio: "1.14", benchmark: "1.00", status: "Aggressive" },
      { metric: "Diversification Score", portfolio: "62/100", benchmark: "75/100", status: "Moderate" }
    ],
    sector_breakdown: { "Technology": 54.5, "Financial Services": 20.0, "Healthcare": 10.0, "Broad Market Index": 10.1, "Precious Metals": 5.4 },
    top_holdings: [
      { id: "1", symbol: "TCS", name: "Tata Consultancy Services", value: 303120, pnl: 33120, pnl_pct: 12.27, weight: 20.2 },
      { id: "2", symbol: "MSFT", name: "Microsoft Corp.", value: 263175, pnl: 26925, pnl_pct: 11.40, weight: 17.6 },
      { id: "3", symbol: "NVDA", name: "NVIDIA Corp.", value: 256250, pnl: 43750, pnl_pct: 20.59, weight: 17.1 }
    ],
    strategic_recommendations: [
      "Trim Technology exposure from 54.5% toward 35% across upcoming quarters.",
      "Reallocate into Gold (GOLDBEES) and Sovereign Debt (GSEC10Y) to cushion against market pullbacks.",
      "Run What-If scenario simulations before initiating sizable positions."
    ]
  };
}

// ==================== FINVEST-R RESEARCH API CLIENT ====================

export async function fetchOptimizationComparison(riskProfile = 'MODERATE'): Promise<OptimizationComparisonResponse> {
  const res = await fetch(`${API_BASE}/research/optimize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ risk_profile: riskProfile })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchStressTest(portfolioId?: string): Promise<StressTestResponse> {
  const res = await fetch(`${API_BASE}/research/stress-test`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio_id: portfolioId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchMonteCarlo(numSims = 25000, horizonDays = 252): Promise<MonteCarloResult> {
  const res = await fetch(`${API_BASE}/research/monte-carlo`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ num_simulations: numSims, horizon_days: horizonDays })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchWalkForwardBacktest(): Promise<BacktestComparisonResponse> {
  const res = await fetch(`${API_BASE}/research/backtest`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchRiskAttribution(portfolioId?: string): Promise<RiskAttributionReport> {
  const res = await fetch(`${API_BASE}/research/risk-attribution`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio_id: portfolioId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchUncertaintyEstimates(portfolioId?: string): Promise<UncertaintyReport> {
  const res = await fetch(`${API_BASE}/research/uncertainty`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio_id: portfolioId })
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchKnowledgeGraph(): Promise<KnowledgeGraphData> {
  const res = await fetch(`${API_BASE}/research/knowledge-graph`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchBenchmarkSuite(): Promise<BenchmarkSuiteResponse> {
  const res = await fetch(`${API_BASE}/research/benchmark`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

export async function fetchInvestorPersonalization(): Promise<InvestorProfileComparison> {
  const res = await fetch(`${API_BASE}/research/personalize`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

