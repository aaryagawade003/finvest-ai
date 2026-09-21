import React, { useState } from 'react';
import { Sliders, RefreshCw, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { PortfolioSummary, WhatIfResponse } from '../types';
import { simulateScenario } from '../services/api';

interface WhatIfSimulatorProps {
  portfolio: PortfolioSummary;
}

export const WhatIfSimulator: React.FC<WhatIfSimulatorProps> = ({ portfolio }) => {
  // Current baseline weights
  const [techWeight, setTechWeight] = useState<number>(30);
  const [finWeight, setFinWeight] = useState<number>(20);
  const [healthWeight, setHealthWeight] = useState<number>(25);
  const [goldWeight, setGoldWeight] = useState<number>(15);
  const [debtWeight, setDebtWeight] = useState<number>(10);

  const [loading, setLoading] = useState<boolean>(false);
  const [simResult, setSimResult] = useState<WhatIfResponse | null>(null);

  const totalSlider = techWeight + finWeight + healthWeight + goldWeight + debtWeight;

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const weights = {
        "Technology": techWeight,
        "Financial Services": finWeight,
        "Healthcare": healthWeight,
        "Precious Metals": goldWeight,
        "Sovereign Debt": debtWeight
      };
      const res = await simulateScenario(portfolio.id, weights);
      setSimResult(res);
    } catch (err) {
      console.error('Failed to run simulation', err);
    } finally {
      setLoading(false);
    }
  };

  // Run initial simulation on load if not yet run
  React.useEffect(() => {
    handleRunSimulation();
  }, [portfolio.id]);

  const handleResetToBaseline = () => {
    setTechWeight(54.5);
    setFinWeight(20.0);
    setHealthWeight(10.0);
    setGoldWeight(5.4);
    setDebtWeight(10.1);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">What-If Portfolio Simulator & Scenario Engine</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Simulate hypothetical asset rebalancing to test risk mitigation, volatility shifts, and diversification
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Sliders Control Panel (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">Hypothetical Allocation</h3>
            <button
              onClick={handleResetToBaseline}
              className="text-xs text-slate-400 hover:text-emerald-400 flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Sliders */}
          <div className="space-y-4">
            
            {/* Tech */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Technology (Current: ~55%)</span>
                <span className="font-mono text-emerald-400 font-bold">{techWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="80"
                step="1"
                value={techWeight}
                onChange={(e) => setTechWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Financials */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Financial Services (Current: 20%)</span>
                <span className="font-mono text-cyan-400 font-bold">{finWeight}%</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="1"
                value={finWeight}
                onChange={(e) => setFinWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
              />
            </div>

            {/* Healthcare */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Healthcare (Defensive Equity)</span>
                <span className="font-mono text-indigo-400 font-bold">{healthWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={healthWeight}
                onChange={(e) => setHealthWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Gold */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Gold & Commodities (Non-Correlated Hedge)</span>
                <span className="font-mono text-amber-400 font-bold">{goldWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={goldWeight}
                onChange={(e) => setGoldWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Sovereign Debt */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 font-medium">
                <span className="text-slate-300">Sovereign Debt / Bonds (Capital Buffer)</span>
                <span className="font-mono text-teal-400 font-bold">{debtWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={debtWeight}
                onChange={(e) => setDebtWeight(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>

          </div>

          {/* Allocation total sum */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Total Desired Allocation:</span>
            <span className={`font-mono font-bold ${totalSlider === 100 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {totalSlider}% {totalSlider !== 100 && '(Normalized proportionally)'}
            </span>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-extrabold text-xs flex items-center justify-center space-x-2 transition-all shadow-md shadow-emerald-500/20"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sliders className="w-4 h-4" />}
            <span>Calculate Simulated Metrics</span>
          </button>
        </div>

        {/* Delta Comparison & AI Narrative (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Side by side comparison table */}
          {simResult && (
            <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md">
              <h3 className="text-sm font-bold text-white mb-3 flex items-center justify-between">
                <span>Current Portfolio vs Simulated Portfolio</span>
                <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Instant Stress-Test
                </span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase">
                      <th className="py-2.5 px-3">Metric</th>
                      <th className="py-2.5 px-3 text-right">Current</th>
                      <th className="py-2.5 px-3 text-right">Simulated</th>
                      <th className="py-2.5 px-3 text-right">Delta (Δ)</th>
                      <th className="py-2.5 px-3 text-center">Impact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    
                    {/* Volatility */}
                    <tr>
                      <td className="py-3 px-3 font-medium text-slate-200">Annual Volatility</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300">{simResult.current_metrics.volatility}%</td>
                      <td className="py-3 px-3 text-right font-mono text-white font-bold">{simResult.simulated_metrics.volatility}%</td>
                      <td className={`py-3 px-3 text-right font-mono font-bold ${
                        simResult.metric_deltas.volatility_delta < 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {simResult.metric_deltas.volatility_delta > 0 ? '+' : ''}{simResult.metric_deltas.volatility_delta}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          simResult.metric_deltas.volatility_delta < 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {simResult.metric_deltas.volatility_delta < 0 ? 'Lower Risk' : 'Higher Risk'}
                        </span>
                      </td>
                    </tr>

                    {/* Sharpe Ratio */}
                    <tr>
                      <td className="py-3 px-3 font-medium text-slate-200">Sharpe Ratio</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300">{simResult.current_metrics.sharpe_ratio}</td>
                      <td className="py-3 px-3 text-right font-mono text-white font-bold">{simResult.simulated_metrics.sharpe_ratio}</td>
                      <td className={`py-3 px-3 text-right font-mono font-bold ${
                        simResult.metric_deltas.sharpe_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {simResult.metric_deltas.sharpe_delta > 0 ? '+' : ''}{simResult.metric_deltas.sharpe_delta}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          simResult.metric_deltas.sharpe_delta >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {simResult.metric_deltas.sharpe_delta >= 0 ? 'Improved' : 'Softened'}
                        </span>
                      </td>
                    </tr>

                    {/* Max Drawdown */}
                    <tr>
                      <td className="py-3 px-3 font-medium text-slate-200">Max Drawdown</td>
                      <td className="py-3 px-3 text-right font-mono text-rose-400">{simResult.current_metrics.max_drawdown}%</td>
                      <td className="py-3 px-3 text-right font-mono text-white font-bold">{simResult.simulated_metrics.max_drawdown}%</td>
                      <td className={`py-3 px-3 text-right font-mono font-bold ${
                        simResult.metric_deltas.drawdown_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {simResult.metric_deltas.drawdown_delta > 0 ? '+' : ''}{simResult.metric_deltas.drawdown_delta}%
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          simResult.metric_deltas.drawdown_delta >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {simResult.metric_deltas.drawdown_delta >= 0 ? 'Cushioned' : 'Deeper'}
                        </span>
                      </td>
                    </tr>

                    {/* Diversification Score */}
                    <tr>
                      <td className="py-3 px-3 font-medium text-slate-200">Diversification Score</td>
                      <td className="py-3 px-3 text-right font-mono text-slate-300">{simResult.current_metrics.diversification_score}/100</td>
                      <td className="py-3 px-3 text-right font-mono text-white font-bold">{simResult.simulated_metrics.diversification_score}/100</td>
                      <td className={`py-3 px-3 text-right font-mono font-bold ${
                        simResult.metric_deltas.diversification_delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {simResult.metric_deltas.diversification_delta > 0 ? '+' : ''}{simResult.metric_deltas.diversification_delta}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          simResult.metric_deltas.diversification_delta >= 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                        }`}>
                          {simResult.metric_deltas.diversification_delta >= 0 ? 'More Resilient' : 'Concentrated'}
                        </span>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* AI Assessment Card */}
          {simResult && (
            <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-5 rounded-2xl border border-teal-500/20 shadow-lg">
              <div className="flex items-center space-x-2 text-teal-400 mb-2">
                <Sparkles className="w-4 h-4" />
                <h4 className="text-xs font-bold uppercase tracking-wider">AI Scenario Assessment</h4>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                {simResult.ai_explanation}
              </p>

              <div className="mt-4 pt-3 border-t border-slate-800 space-y-1.5">
                <p className="text-[11px] font-semibold text-slate-400 uppercase">Strategic Takeaways:</p>
                {simResult.recommendations.map((rec, i) => (
                  <div key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
