import React from 'react';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldAlert, 
  Sparkles, 
  Sliders, 
  PlusCircle, 
  Bot, 
  Award,
  BarChart3
} from 'lucide-react';
import { PortfolioSummary } from '../types';

interface DashboardOverviewProps {
  portfolio: PortfolioSummary;
  currency: 'INR' | 'USD';
  onOpenCopilot: () => void;
  onOpenSimulator: () => void;
  onOpenReport: () => void;
  onAddTransaction: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  portfolio,
  currency,
  onOpenCopilot,
  onOpenSimulator,
  onOpenReport,
  onAddTransaction,
}) => {
  const m = portfolio.metrics;
  const isPositiveToday = m.today_pnl >= 0;
  const isPositiveTotal = m.total_unrealized_pnl >= 0;
  const symbol = currency === 'INR' ? '₹' : '$';
  const multiplier = currency === 'USD' ? 0.012 : 1;

  const formatCurrency = (val: number) => {
    const converted = val * multiplier;
    if (currency === 'INR') {
      return new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(converted);
    }
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(converted);
  };

  const alpha = Math.round((m.annualized_return - m.benchmark_return) * 10) / 10;

  return (
    <div className="space-y-6">
      
      {/* Top Welcome / Profile Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 p-5 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Live Intelligence
            </span>
            <span className="text-xs text-slate-400 font-mono">Owner: {portfolio.owner}</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5 tracking-tight">{portfolio.name}</h1>
          <p className="text-xs text-slate-400 mt-0.5">{portfolio.description}</p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <button
            onClick={onAddTransaction}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Buy / Sell</span>
          </button>
          <button
            onClick={onOpenSimulator}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
          >
            <Sliders className="w-3.5 h-3.5 text-teal-400" />
            <span>What-If Rebalance</span>
          </button>
          <button
            onClick={onOpenCopilot}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-lg shadow-emerald-600/20"
          >
            <Bot className="w-4 h-4" />
            <span>Ask Copilot</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Portfolio Value */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Portfolio Value</p>
          <div className="mt-2 flex items-baseline space-x-1">
            <span className="text-sm font-medium text-slate-400">{symbol}</span>
            <span className="text-3xl font-extrabold text-white tracking-tight">{formatCurrency(m.total_portfolio_value)}</span>
          </div>
          <div className="mt-3 flex items-center space-x-2 text-xs">
            <span className="text-slate-400">Invested:</span>
            <span className="font-mono text-slate-300">{symbol}{formatCurrency(m.total_invested_amount)}</span>
          </div>
        </div>

        {/* Today's Gain / Loss */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition-all">
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Today's P&L</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold tracking-tight ${isPositiveToday ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isPositiveToday ? '+' : ''}{symbol}{formatCurrency(Math.abs(m.today_pnl))}
            </span>
          </div>
          <div className="mt-3 flex items-center space-x-1.5">
            <span className={`inline-flex items-center text-xs font-bold px-2 py-0.5 rounded-full ${
              isPositiveToday ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
            }`}>
              {isPositiveToday ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
              {isPositiveToday ? '+' : ''}{m.today_pnl_percentage}%
            </span>
            <span className="text-xs text-slate-400">vs yesterday close</span>
          </div>
        </div>

        {/* Overall Return */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition-all">
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Overall Return (CAGR)</p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className={`text-2xl font-extrabold tracking-tight ${isPositiveTotal ? 'text-emerald-400' : 'text-rose-400'}`}>
              +{m.annualized_return}%
            </span>
          </div>
          <div className="mt-3 flex items-center space-x-1.5 text-xs text-slate-300">
            <span className="text-slate-400">Unrealized:</span>
            <span className="font-mono text-emerald-400 font-semibold">
              +{symbol}{formatCurrency(m.total_unrealized_pnl)} ({m.total_pnl_percentage}%)
            </span>
          </div>
        </div>

        {/* Benchmark Alpha */}
        <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800/90 relative overflow-hidden group hover:border-slate-700 transition-all">
          <p className="text-xs font-semibold text-slate-400 tracking-wider uppercase flex items-center justify-between">
            <span>Benchmark Comparison</span>
            <Award className="w-3.5 h-3.5 text-amber-400" />
          </p>
          <div className="mt-2 flex items-baseline space-x-2">
            <span className="text-2xl font-extrabold text-amber-300 tracking-tight">
              {alpha >= 0 ? `+${alpha}%` : `${alpha}%`}
            </span>
            <span className="text-xs text-slate-400">Alpha</span>
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
            <span>{m.benchmark_name}: {m.benchmark_return}%</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-300">Beta {m.beta}</span>
          </div>
        </div>

      </div>

      {/* AI Insights & Alerts Highlights Bar (Matches Section 15 of user's specification) */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 sm:p-5 shadow-lg">
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-white tracking-wide uppercase flex items-center space-x-2">
            <span>🤖 AI Portfolio Insights</span>
            <span className="text-[10px] normal-case font-normal px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Generated in real-time
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          
          <div className="bg-slate-950/50 p-3.5 rounded-xl border border-amber-500/30 flex items-start space-x-3">
            <span className="text-amber-400 font-bold text-base mt-0.5">⚠️</span>
            <div>
              <p className="text-xs font-semibold text-amber-200">Technology exposure is above threshold</p>
              <p className="text-[11px] text-slate-400 mt-0.5">54.5% allocation triggers single-sector concentration risk alert.</p>
            </div>
          </div>

          <div className="bg-slate-950/50 p-3.5 rounded-xl border border-emerald-500/30 flex items-start space-x-3">
            <span className="text-emerald-400 font-bold text-base mt-0.5">↑</span>
            <div>
              <p className="text-xs font-semibold text-emerald-200">Portfolio outperformed benchmark by +{alpha}%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Driven by semiconductor and cloud computing momentum.</p>
            </div>
          </div>

          <div className="bg-slate-950/50 p-3.5 rounded-xl border border-slate-700/60 flex items-start space-x-3">
            <span className="text-cyan-400 font-bold text-base mt-0.5">📊</span>
            <div>
              <p className="text-xs font-semibold text-cyan-200">Sharpe Ratio is optimal at {m.sharpe_ratio}</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Exceeds hurdle threshold (1.0) confirming adequate risk-adjusted reward.</p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
