import React from 'react';
import { 
  ShieldCheck, 
  Activity, 
  Zap, 
  TrendingDown, 
  Layers, 
  Scale, 
  HelpCircle 
} from 'lucide-react';
import { RiskMetrics } from '../types';

interface RiskMetricsCardProps {
  metrics: RiskMetrics;
}

export const RiskMetricsCard: React.FC<RiskMetricsCardProps> = ({ metrics }) => {
  const getSharpeBadge = (sharpe: number) => {
    if (sharpe >= 1.2) return { text: 'Optimal', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    if (sharpe >= 0.9) return { text: 'Good', bg: 'bg-teal-500/15 text-teal-400 border-teal-500/30' };
    return { text: 'Suboptimal', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  };

  const getDrawdownBadge = (mdd: number) => {
    if (mdd > -8.0) return { text: 'Safe Buffer', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    if (mdd > -15.0) return { text: 'Moderate', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
    return { text: 'High Risk', bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30' };
  };

  const getDiversificationBadge = (score: number) => {
    if (score >= 75) return { text: 'Institutional', bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' };
    if (score >= 50) return { text: 'Moderate', bg: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' };
    return { text: 'Concentrated', bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30' };
  };

  const sharpeBadge = getSharpeBadge(metrics.sharpe_ratio);
  const mddBadge = getDrawdownBadge(metrics.max_drawdown);
  const divBadge = getDiversificationBadge(metrics.diversification_score);

  return (
    <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md">
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Risk & Quantitative Analytics Engine</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Statistical risk profiling and capital preservation metrics</p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          Risk Tier: <span className="text-emerald-400">{metrics.risk_level}</span>
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-4">
        
        {/* Volatility */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Annual Volatility</span>
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-2xl font-extrabold text-white font-mono">{metrics.volatility}%</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">Std dev (σ) of daily returns</p>
        </div>

        {/* Sharpe Ratio */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Sharpe Ratio</span>
            <Scale className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-white font-mono">{metrics.sharpe_ratio}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${sharpeBadge.bg}`}>
              {sharpeBadge.text}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">Rf = 6.5% benchmark</p>
        </div>

        {/* Sortino Ratio */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Sortino Ratio</span>
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-white font-mono">{metrics.sortino_ratio}</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">Downside risk penalty</p>
        </div>

        {/* Max Drawdown */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Max Drawdown</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-rose-400 font-mono">{metrics.max_drawdown}%</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${mddBadge.bg}`}>
              {mddBadge.text}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">Peak-to-trough drop</p>
        </div>

        {/* Beta */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Portfolio Beta</span>
            <Activity className="w-3.5 h-3.5 text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-white font-mono">{metrics.beta}</span>
            <span className="text-[10px] text-slate-400">vs 1.00</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">Sensitivity to index</p>
        </div>

        {/* Diversification Score */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span className="font-semibold">Diversification</span>
            <Layers className="w-3.5 h-3.5 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline space-x-1.5">
            <span className="text-2xl font-extrabold text-white font-mono">{metrics.diversification_score}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${divBadge.bg}`}>
              {divBadge.text}
            </span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1.5">HHI Index: {metrics.hhi_sector_concentration}</p>
        </div>

      </div>
    </div>
  );
};
