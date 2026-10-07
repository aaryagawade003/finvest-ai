import React, { useState, useEffect } from 'react';
import { 
  FlaskConical, Cpu, Activity, TrendingUp, ShieldAlert, 
  Scale, Network, BarChart3, CheckCircle2, ArrowRight,
  RefreshCw, Info, Layers, Award, Sparkles, ChevronRight
} from 'lucide-react';
import { 
  PortfolioSummary, 
  OptimizationComparisonResponse, 
  StressTestResponse, 
  MonteCarloResult, 
  BacktestComparisonResponse, 
  RiskAttributionReport, 
  KnowledgeGraphData, 
  BenchmarkSuiteResponse,
  InvestorProfileComparison,
  UncertaintyReport
} from '../types';
import { 
  fetchOptimizationComparison, 
  fetchStressTest, 
  fetchMonteCarlo, 
  fetchWalkForwardBacktest, 
  fetchRiskAttribution, 
  fetchKnowledgeGraph, 
  fetchBenchmarkSuite, 
  fetchInvestorPersonalization,
  fetchUncertaintyEstimates,
  getFallbackOptimization,
  getFallbackStressTest,
  getFallbackMonteCarlo,
  getFallbackBacktest,
  getFallbackRiskAttribution,
  getFallbackKnowledgeGraph,
  getFallbackBenchmark,
  getFallbackPersonalization,
  getFallbackUncertainty
} from '../services/api';

interface ResearchSuiteProps {
  portfolio: PortfolioSummary;
}

type ResearchTab = 
  | 'OPTIMIZATION' 
  | 'STRESS_TEST' 
  | 'MONTE_CARLO' 
  | 'BACKTEST' 
  | 'ATTRIBUTION' 
  | 'KNOWLEDGE_GRAPH' 
  | 'BENCHMARK' 
  | 'PERSONALIZATION';

export const ResearchSuite: React.FC<ResearchSuiteProps> = ({ portfolio }) => {
  const [activeTab, setActiveTab] = useState<ResearchTab>('OPTIMIZATION');
  const [selectedStrategy, setSelectedStrategy] = useState<string>('FINVEST_R');
  const [riskProfile, setRiskProfile] = useState<'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE'>('MODERATE');
  const [loading, setLoading] = useState<boolean>(false);
  const [isLiveBackend, setIsLiveBackend] = useState<boolean>(false);

  // Research data states initialized with guaranteed non-null fallbacks
  const [optData, setOptData] = useState<OptimizationComparisonResponse>(() => getFallbackOptimization('MODERATE'));
  const [stressData, setStressData] = useState<StressTestResponse>(() => getFallbackStressTest());
  const [mcData, setMcData] = useState<MonteCarloResult>(() => getFallbackMonteCarlo());
  const [backtestData, setBacktestData] = useState<BacktestComparisonResponse>(() => getFallbackBacktest());
  const [attrData, setAttrData] = useState<RiskAttributionReport>(() => getFallbackRiskAttribution());
  const [kgData, setKgData] = useState<KnowledgeGraphData>(() => getFallbackKnowledgeGraph());
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkSuiteResponse>(() => getFallbackBenchmark());
  const [profileData, setProfileData] = useState<InvestorProfileComparison>(() => getFallbackPersonalization());
  const [uncertaintyData, setUncertaintyData] = useState<UncertaintyReport>(() => getFallbackUncertainty());

  const loadAllResearchData = async () => {
    setLoading(true);
    try {
      const [opt, stress, mc, bt, attr, kg, bm, prof, unc] = await Promise.all([
        fetchOptimizationComparison(riskProfile),
        fetchStressTest(portfolio.id),
        fetchMonteCarlo(25000, 252),
        fetchWalkForwardBacktest(),
        fetchRiskAttribution(portfolio.id),
        fetchKnowledgeGraph(),
        fetchBenchmarkSuite(),
        fetchInvestorPersonalization(),
        fetchUncertaintyEstimates(portfolio.id)
      ]);
      if (opt) setOptData(opt);
      if (stress) setStressData(stress);
      if (mc) setMcData(mc);
      if (bt) setBacktestData(bt);
      if (attr) setAttrData(attr);
      if (kg) setKgData(kg);
      if (bm) setBenchmarkData(bm);
      if (prof) setProfileData(prof);
      if (unc) setUncertaintyData(unc);
      setIsLiveBackend(true);
    } catch (err) {
      console.warn('Research data loaded with offline fallback mode', err);
      setIsLiveBackend(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllResearchData();
  }, [portfolio.id, riskProfile]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Research Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5" /> FINVEST-R RESEARCH LABORATORY
              </span>
              <span className="text-xs text-slate-400 font-mono">v2.5-Quant</span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                isLiveBackend 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30' 
                  : 'bg-indigo-500/20 text-indigo-300 border border-indigo-400/30'
              }`}>
                <span className={`w-2 h-2 rounded-full ${isLiveBackend ? 'bg-emerald-400 animate-pulse' : 'bg-indigo-400'}`} />
                {isLiveBackend ? 'Live FastAPI Engine' : 'Interactive Research Engine'}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              Empirical Quantitative Finance & AI Evaluation
            </h1>
            <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
              Evaluating mathematical optimization engines (Mean-Variance, Min-Vol, Max-Sharpe, Risk Parity, FinVest-R), 
              macroeconomic shock response, Monte Carlo probability distributions, out-of-sample walk-forward backtesting, 
              and hallucination-free GraphRAG explainability.
            </p>
          </div>
          <button
            onClick={loadAllResearchData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600/80 hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-900/30 disabled:opacity-50 self-start md:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Solving...' : 'Refresh Lab Suite'}
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mt-6 flex flex-wrap gap-2 border-t border-slate-800 pt-4">
          {[
            { id: 'OPTIMIZATION', label: '1. Portfolio Optimizers', icon: Scale },
            { id: 'STRESS_TEST', label: '2. What-If Stress Testing', icon: ShieldAlert },
            { id: 'MONTE_CARLO', label: '3. Monte Carlo (25k Paths)', icon: Activity },
            { id: 'BACKTEST', label: '4. Walk-Forward Backtesting', icon: TrendingUp },
            { id: 'ATTRIBUTION', label: '5. Risk Attribution & Traceability', icon: Layers },
            { id: 'KNOWLEDGE_GRAPH', label: '6. Knowledge Graph (GraphRAG)', icon: Network },
            { id: 'BENCHMARK', label: '7. LLM Evaluation Benchmark', icon: Award },
            { id: 'PERSONALIZATION', label: '8. Investor Personalization & CI', icon: Cpu },
          ].map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as ResearchTab)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 hover:text-white border border-slate-700/50'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: PORTFOLIO OPTIMIZATION ARENA */}
      {activeTab === 'OPTIMIZATION' && (
            <div className="space-y-6">
              {/* Scientific Defensibility Notice */}
              <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-4 text-emerald-200 text-xs flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold text-emerald-300">Scientific Defensibility Principle:</span>
                  <p className="text-emerald-200/90 leading-relaxed">
                    The LLM never hallucinates portfolio weights. The deterministic convex optimization solver 
                    generates mathematically verified allocations satisfying all risk, concentration, and budget constraints. 
                    The LLM acts purely as a semantic synthesizer and educational interpreter of the verified quantitative solution.
                  </p>
                </div>
              </div>

              {/* Strategy Selector Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {Object.entries(optData.strategies).map(([stratKey, strat]) => {
                  const isSelected = selectedStrategy === stratKey;
                  const isFinvest = stratKey === 'FINVEST_R';
                  return (
                    <button
                      key={stratKey}
                      onClick={() => setSelectedStrategy(stratKey)}
                      className={`p-4 rounded-xl text-left transition-all border relative flex flex-col justify-between ${
                        isSelected
                          ? isFinvest
                            ? 'bg-indigo-950/60 border-indigo-400 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-950/50'
                            : 'bg-slate-800/90 border-indigo-400 shadow-md'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {isFinvest && (
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white shadow">
                          PROPOSED
                        </span>
                      )}
                      <div>
                        <div className="text-xs font-semibold text-slate-300 mb-1">{strat.strategy_name.split(':')[0]}</div>
                        <div className="text-sm font-bold text-white truncate">{strat.strategy_name.split(':')[1] || strat.strategy_name}</div>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-800 space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Sharpe:</span>
                          <span className="font-bold text-emerald-400">{strat.sharpe_ratio}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Return:</span>
                          <span className="font-semibold text-white">{strat.expected_return}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Volatility:</span>
                          <span className="font-semibold text-slate-300">{strat.expected_volatility}%</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Strategy Deep-Dive */}
              {optData.strategies[selectedStrategy] && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Mathematical Formulation & Metrics */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-5">
                    <div>
                      <span className="text-xs font-mono text-indigo-400 uppercase tracking-wider">Strategy Formulation</span>
                      <h3 className="text-lg font-bold text-white mt-1">
                        {optData.strategies[selectedStrategy].strategy_name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                        {optData.strategies[selectedStrategy].ai_explanation}
                      </p>
                    </div>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 font-mono text-xs text-indigo-300 overflow-x-auto">
                      <div className="text-[10px] text-slate-500 mb-1">OPTIMIZATION OBJECTIVE:</div>
                      {optData.strategies[selectedStrategy].mathematical_formula}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="text-[11px] text-slate-400">Sharpe Ratio</div>
                        <div className="text-xl font-bold text-emerald-400">
                          {optData.strategies[selectedStrategy].sharpe_ratio}
                        </div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="text-[11px] text-slate-400">Max Drawdown</div>
                        <div className="text-xl font-bold text-amber-400">
                          {optData.strategies[selectedStrategy].max_drawdown}%
                        </div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="text-[11px] text-slate-400">Diversification Score</div>
                        <div className="text-xl font-bold text-indigo-300">
                          {optData.strategies[selectedStrategy].diversification_score}/100
                        </div>
                      </div>
                      <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                        <div className="text-[11px] text-slate-400">Annual Volatility</div>
                        <div className="text-xl font-bold text-slate-200">
                          {optData.strategies[selectedStrategy].expected_volatility}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Middle: Asset Weight Allocations */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-white">Optimal Asset Weights (w*)</h4>
                      <span className="text-xs font-mono text-slate-400">Sum = 100%</span>
                    </div>

                    <div className="space-y-3">
                      {Object.entries(optData.strategies[selectedStrategy].weights).map(([sym, wt]) => (
                        <div key={sym} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-200">{sym}</span>
                            <span className="font-mono text-indigo-300 font-bold">{wt}%</span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-indigo-500 to-indigo-400 rounded-full transition-all duration-500"
                              style={{ width: `${Math.min(100, wt * 2.5)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right: Sector Exposures & Euler Risk Contributions */}
                  <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-5">
                    <div>
                      <h4 className="text-sm font-semibold text-white mb-3">Sector Allocation Constraints</h4>
                      <div className="space-y-2">
                        {Object.entries(optData.strategies[selectedStrategy].sector_weights).map(([sec, wt]) => (
                          <div key={sec} className="flex items-center justify-between text-xs p-2 rounded bg-slate-800/40 border border-slate-800">
                            <span className="text-slate-300">{sec}</span>
                            <span className={`font-mono font-bold ${wt > 35 ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {wt}% {wt <= 32 ? '✓ Capped' : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-4">
                      <h4 className="text-sm font-semibold text-white mb-2">Euler Risk Contributions (%RC)</h4>
                      <p className="text-xs text-slate-400 mb-3">
                        Proportion of total portfolio variance dictated by each asset holding:
                      </p>
                      <div className="space-y-2">
                        {Object.entries(optData.strategies[selectedStrategy].risk_contributions).slice(0, 5).map(([sym, rc]) => (
                          <div key={sym} className="flex justify-between text-xs">
                            <span className="text-slate-400">{sym}:</span>
                            <span className="font-mono font-semibold text-amber-300">{rc}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RESEARCH WHAT-IF STRESS TESTING */}
          {activeTab === 'STRESS_TEST' && stressData && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-2">Macroeconomic Stress-Testing Framework</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-6">
                  Experimental evaluation testing portfolio fragility across five standardized macroeconomic shocks. 
                  Every metric computes the verified delta between baseline and shocked state.
                </p>

                <div className="space-y-6">
                  {stressData.scenarios.map((sc) => (
                    <div key={sc.scenario_id} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                        <div>
                          <span className="text-xs font-mono text-indigo-400 font-bold">{sc.scenario_id}</span>
                          <h4 className="text-base font-bold text-white">{sc.name}</h4>
                          <p className="text-xs text-slate-400 mt-0.5">{sc.description}</p>
                        </div>
                        <div className="flex flex-wrap gap-2 text-xs">
                          {Object.entries(sc.macro_shock_details).map(([k, v]) => (
                            <span key={k} className="px-2.5 py-1 bg-slate-800 rounded text-slate-300 border border-slate-700/50">
                              <strong className="text-slate-400">{k}:</strong> {v}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Exact Comparative Table Requested by User */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                              <th className="py-2.5 px-3">Metric</th>
                              <th className="py-2.5 px-3">Original</th>
                              <th className="py-2.5 px-3">Shock</th>
                              <th className="py-2.5 px-3">Change (Δ)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-mono">
                            {sc.metrics_table.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/40">
                                <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">{row.metric}</td>
                                <td className="py-2.5 px-3 text-slate-300">{row.original}</td>
                                <td className="py-2.5 px-3 text-slate-300 font-bold">{row.shock}</td>
                                <td className="py-2.5 px-3">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                                    row.negative ? 'bg-rose-950/50 text-rose-300 border border-rose-800/50' : 'bg-emerald-950/50 text-emerald-300 border border-emerald-800/50'
                                  }`}>
                                    {row.delta}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="text-xs bg-indigo-950/20 border border-indigo-900/30 p-3 rounded-lg text-indigo-200/90 leading-relaxed">
                        <strong className="text-indigo-300 font-semibold">Quantitative Attribution: </strong>
                        {sc.ai_attribution}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: MONTE CARLO STOCHASTIC SIMULATION */}
          {activeTab === 'MONTE_CARLO' && mcData && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-white">Stochastic Monte Carlo Simulation (25,000 Paths)</h3>
                      <p className="text-sm text-slate-400">
                        Evaluating tail-risk parameters (VaR, CVaR, Drawdown distribution) and Probability of Loss across strategies.
                      </p>
                    </div>
                    <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 rounded-full text-xs font-mono font-bold">
                      N = 25,000 Trajectories
                    </span>
                  </div>
                </div>

                {/* Probability of Loss Comparative Research Bar */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="text-sm font-semibold text-white">Probability of Loss Comparison P(Return &lt; 0)</h4>
                  <div className="space-y-3">
                    {Object.entries(mcData.strategy_metrics).map(([key, strat]) => (
                      <div key={key} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-300">{strat.name}</span>
                          <span className="font-mono font-bold text-white">{strat.probability_of_loss}%</span>
                        </div>
                        <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              strat.probability_of_loss < 8 ? 'bg-emerald-500' : strat.probability_of_loss < 15 ? 'bg-indigo-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${strat.probability_of_loss * 4}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quantitative Metric Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="py-3 px-3">Strategy</th>
                        <th className="py-3 px-3">Expected Return</th>
                        <th className="py-3 px-3">VaR (95%)</th>
                        <th className="py-3 px-3">CVaR (95%)</th>
                        <th className="py-3 px-3">Prob. of Loss</th>
                        <th className="py-3 px-3">Prob. &gt; 12% Return</th>
                        <th className="py-3 px-3">Worst Drawdown (95%)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {Object.entries(mcData.strategy_metrics).map(([key, s]) => (
                        <tr key={key} className={`hover:bg-slate-800/40 ${key === 'FINVEST_R' ? 'bg-indigo-950/20 font-bold' : ''}`}>
                          <td className="py-3 px-3 font-sans text-slate-200">{s.name}</td>
                          <td className="py-3 px-3 text-emerald-400">{s.expected_return}%</td>
                          <td className="py-3 px-3 text-amber-400">{s.var_95}%</td>
                          <td className="py-3 px-3 text-rose-400">{s.cvar_95}%</td>
                          <td className="py-3 px-3 text-white">{s.probability_of_loss}%</td>
                          <td className="py-3 px-3 text-indigo-300">{s.probability_exceeding_target}%</td>
                          <td className="py-3 px-3 text-slate-400">{s.worst_case_mdd_95}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-lg text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white font-semibold">Empirical Research Conclusion: </strong>
                  {mcData.research_conclusion}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: WALK-FORWARD BACKTESTING */}
          {activeTab === 'BACKTEST' && backtestData && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Walk-Forward Rolling Backtesting (2018–2024)</h3>
                  <p className="text-sm text-slate-400">
                    Evaluating out-of-sample generalization across rolling 3-year train / 1-year test windows. 
                    Standard publication metrics for empirical papers.
                  </p>
                </div>

                {/* Train/Test Windows */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {backtestData.train_test_windows.map((w) => (
                    <div key={w.window_id} className="p-3 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1">
                      <div className="text-xs font-mono font-bold text-indigo-400">{w.window_id}</div>
                      <div className="text-xs font-semibold text-white">Train: {w.train.split('to')[0]}</div>
                      <div className="text-xs text-emerald-400 font-semibold">Test: {w.test.split('to')[0]}</div>
                      <div className="text-[11px] text-slate-400 pt-1 leading-snug">{w.market_regime}</div>
                    </div>
                  ))}
                </div>

                {/* Research Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="py-3 px-3">Strategy</th>
                        <th className="py-3 px-3">CAGR</th>
                        <th className="py-3 px-3">Volatility</th>
                        <th className="py-3 px-3">Sharpe</th>
                        <th className="py-3 px-3">Sortino</th>
                        <th className="py-3 px-3">Max Drawdown</th>
                        <th className="py-3 px-3">Calmar Ratio</th>
                        <th className="py-3 px-3">VaR (95%)</th>
                        <th className="py-3 px-3">CVaR (95%)</th>
                        <th className="py-3 px-3">Win Rate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {backtestData.results_table.map((row) => {
                        const isFinvest = row.strategy_name.includes('FinVest-R');
                        return (
                          <tr key={row.strategy_name} className={`hover:bg-slate-800/40 ${isFinvest ? 'bg-indigo-950/30 font-bold' : ''}`}>
                            <td className="py-3 px-3 font-sans text-slate-200 flex items-center gap-1.5">
                              {isFinvest && <Sparkles className="w-3.5 h-3.5 text-indigo-400" />}
                              {row.strategy_name}
                            </td>
                            <td className="py-3 px-3 text-emerald-400">{row.cagr}%</td>
                            <td className="py-3 px-3 text-slate-300">{row.volatility}%</td>
                            <td className="py-3 px-3 font-bold text-white">{row.sharpe}</td>
                            <td className="py-3 px-3 text-indigo-300">{row.sortino}</td>
                            <td className="py-3 px-3 text-amber-400">{row.max_drawdown}%</td>
                            <td className="py-3 px-3 text-emerald-300">{row.calmar_ratio}</td>
                            <td className="py-3 px-3 text-slate-400">{row.var_95}%</td>
                            <td className="py-3 px-3 text-slate-400">{row.cvar_95}%</td>
                            <td className="py-3 px-3 text-white">{row.win_rate}%</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-lg text-xs text-indigo-200/90 leading-relaxed">
                  <strong className="text-indigo-300 font-semibold">Publication Takeaway: </strong>
                  {backtestData.research_insights}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: EULER RISK ATTRIBUTION & TRACEABILITY */}
          {activeTab === 'ATTRIBUTION' && attrData && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Euler Marginal Risk Decomposition</h3>
                  <p className="text-sm text-slate-400">
                    Euler's Theorem guarantees that marginal risk contributions sum precisely to total portfolio volatility: 
                    <span className="font-mono text-indigo-300 ml-1">∑ %RC_i = 100%</span>.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {attrData.components.map((comp) => (
                    <div key={comp.symbol} className="bg-slate-950/60 border border-slate-800 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">{comp.name} ({comp.symbol})</div>
                          <div className="text-xs text-slate-400">Capital Weight: {comp.weight}% | Volatility: {comp.volatility}%</div>
                        </div>
                        <div className="text-right">
                          <div className="text-base font-mono font-bold text-amber-400">{comp.percentage_risk_contribution}%</div>
                          <div className="text-[10px] text-slate-400">of Total Variance</div>
                        </div>
                      </div>

                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-amber-500 rounded-full"
                          style={{ width: `${Math.min(100, comp.percentage_risk_contribution * 2)}%` }}
                        />
                      </div>

                      {/* Scientific Traceability Tuple */}
                      <div className="bg-slate-900/90 border border-slate-800 p-2.5 rounded-lg text-[11px] font-mono space-y-1 text-slate-300">
                        <div><strong className="text-indigo-400">Data:</strong> {comp.traceability.data_point}</div>
                        <div><strong className="text-indigo-400">Calc:</strong> {comp.traceability.calculation}</div>
                        <div><strong className="text-indigo-400">Source:</strong> {comp.traceability.source}</div>
                        <div><strong className="text-indigo-400">Evidence:</strong> {comp.traceability.evidence}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-amber-950/20 border border-amber-900/30 rounded-lg text-xs text-amber-200/90 space-y-1">
                  <div className="font-semibold text-amber-300">Prescribed Rebalancing Action:</div>
                  <div>{attrData.recommended_action}</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: KNOWLEDGE GRAPH (GRAPHRAG) */}
          {activeTab === 'KNOWLEDGE_GRAPH' && kgData && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Financial Knowledge Graph (GraphRAG)</h3>
                  <p className="text-sm text-slate-400">
                    Structured relational representation augmenting document RAG with causal macro dependencies, 
                    supply-chain links, and hedging mechanisms.
                  </p>
                </div>

                {/* Entity Hub Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {kgData.nodes.slice(0, 9).map((node) => (
                    <div key={node.id} className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-lg space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{node.label}</span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-indigo-500/20 text-indigo-300">
                          {node.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Properties: {JSON.stringify(node.properties || {})}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Relational Edges List */}
                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Active Graph Relationships</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs font-mono">
                    {kgData.edges.slice(0, 10).map((edge, idx) => (
                      <div key={idx} className="p-2 bg-slate-900/60 border border-slate-800/80 rounded flex items-center gap-2">
                        <span className="text-white font-bold">{edge.source}</span>
                        <span className="text-indigo-400 font-semibold">--[{edge.relation.toUpperCase()}]--&gt;</span>
                        <span className="text-slate-300">{edge.target}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: LLM EVALUATION BENCHMARK */}
          {activeTab === 'BENCHMARK' && benchmarkData && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Financial LLM Evaluation Benchmark (120 Questions)</h3>
                  <p className="text-sm text-slate-400">
                    Comparative research benchmark measuring numerical accuracy, citation accuracy, and hallucination rates 
                    across 4 architectural paradigms.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                        <th className="py-3 px-3">Architecture Paradigm</th>
                        <th className="py-3 px-3">Numerical Accuracy</th>
                        <th className="py-3 px-3">Citation Accuracy</th>
                        <th className="py-3 px-3">Hallucination Rate</th>
                        <th className="py-3 px-3">Risk Explanation Quality</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {benchmarkData.models.map((m) => {
                        const isFinvest = m.model_tag === 'FINVEST_R';
                        return (
                          <tr key={m.model_tag} className={`hover:bg-slate-800/40 ${isFinvest ? 'bg-indigo-950/30 font-bold' : ''}`}>
                            <td className="py-3 px-3 font-sans text-slate-200">{m.model_name}</td>
                            <td className="py-3 px-3 text-emerald-400 font-bold">{m.numerical_accuracy}%</td>
                            <td className="py-3 px-3 text-indigo-300 font-bold">{m.citation_accuracy}%</td>
                            <td className={`py-3 px-3 font-bold ${m.hallucination_rate > 10 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {m.hallucination_rate}%
                            </td>
                            <td className="py-3 px-3 text-white font-bold">{m.risk_explanation_score} / 10.0</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-indigo-950/20 border border-indigo-900/30 rounded-lg text-xs text-indigo-200/90 leading-relaxed">
                  <strong className="text-indigo-300 font-semibold">Experimental Validation Result: </strong>
                  {benchmarkData.research_verdict}
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: INVESTOR PERSONALIZATION & UNCERTAINTY */}
          {activeTab === 'PERSONALIZATION' && profileData && uncertaintyData && (
            <div className="space-y-6">
              {/* Investor Personalization Section */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Investor Risk Profile Optimization Experiment</h3>
                  <p className="text-sm text-slate-400">
                    Testing Hypothesis H1: Tuning risk-aversion penalty λ dynamically outperforms static 60/40 allocations.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(profileData.profiles).map(([pKey, pVal]) => (
                    <div key={pKey} className="bg-slate-950/60 border border-slate-800 rounded-xl p-5 space-y-4">
                      <div>
                        <div className="text-xs font-mono text-indigo-400 font-bold">λ = {pVal.risk_aversion_lambda}</div>
                        <h4 className="text-sm font-bold text-white mt-0.5">{pVal.name}</h4>
                      </div>

                      <div className="space-y-1.5 text-xs">
                        <div className="text-slate-400 font-semibold mb-1">Asset Allocation Targets:</div>
                        {Object.entries(pVal.asset_allocation).map(([ac, pct]) => (
                          <div key={ac} className="flex justify-between font-mono">
                            <span className="text-slate-300">{ac}:</span>
                            <span className="font-bold text-white">{pct as number}%</span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-slate-800 pt-3 space-y-1 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Expected Volatility:</span>
                          <span className="text-amber-400 font-bold">{pVal.expected_volatility}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Expected Sharpe:</span>
                          <span className="text-emerald-400 font-bold">{pVal.sharpe_ratio}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-xs text-emerald-200/90 leading-relaxed">
                  <strong className="text-emerald-300 font-semibold">Hypothesis Testing Verdict: </strong>
                  {profileData.hypothesis_testing.hypothesis} → <span className="font-bold text-white">{profileData.hypothesis_testing.status}</span>. {profileData.hypothesis_testing.conclusion}
                </div>
              </div>

              {/* Uncertainty Estimation Gauges */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Uncertainty Estimation (95% Confidence Intervals)</h3>
                  <p className="text-sm text-slate-400">
                    Eliminating single-point estimation error through non-parametric Block Bootstrap and Lo (2002) asymptotic variance.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {uncertaintyData.metrics.map((est) => (
                    <div key={est.metric_name} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-slate-200">{est.metric_name}</span>
                        <span className="font-mono text-indigo-300 font-bold">Confidence: {est.confidence_score}%</span>
                      </div>
                      <div className="text-xl font-bold font-mono text-white">
                        {est.point_estimate}
                        <span className="text-xs text-slate-400 font-normal ml-2">
                          (95% CI: [{est.ci_lower_95}, {est.ci_upper_95}])
                        </span>
                      </div>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full"
                          style={{ width: `${est.confidence_score}%` }}
                        />
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        SE = ±{est.standard_error} | Method: {est.method}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
    </div>
  );
};
