import React, { useState, useEffect } from 'react';
import { X, Printer, Download, Sparkles, CheckCircle, ShieldCheck, Award } from 'lucide-react';
import { PortfolioSummary, ExecutiveReport } from '../types';
import { generateExecutiveReport } from '../services/api';

interface ReportGeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: PortfolioSummary;
}

export const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({
  isOpen,
  onClose,
  portfolio
}) => {
  const [report, setReport] = useState<ExecutiveReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      generateExecutiveReport(portfolio)
        .then(rep => setReport(rep))
        .catch(err => console.error('Failed to generate report', err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, portfolio]);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-6">
        
        {/* Modal Top Bar */}
        <div className="p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">AI Executive Portfolio Briefing</h3>
              <p className="text-[11px] text-slate-400">Institutional-grade intelligence & risk report</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 print:p-0 print:m-0 text-slate-100">
          
          {loading || !report ? (
            <div className="py-20 text-center text-slate-400 text-xs space-y-2">
              <Sparkles className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
              <p>Synthesizing quantitative metrics and generating executive commentary...</p>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* Report Title & Metadata Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                      {report.report_id}
                    </span>
                    <h1 className="text-xl font-extrabold text-white mt-0.5">{report.portfolio_name}</h1>
                    <p className="text-xs text-slate-400">Prepared for: {report.owner} • Date: {report.generated_at}</p>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold">
                      VERDICT: STRONG ALPHA
                    </span>
                  </div>
                </div>
              </div>

              {/* Executive Summary Card */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1.5">
                  <Award className="w-4 h-4" />
                  <span>Executive Verdict & Headline</span>
                </h4>
                <p className="text-xs text-slate-200 leading-relaxed font-sans font-medium">
                  {report.executive_summary.headline}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                  {report.executive_summary.key_takeaways.map((point, i) => (
                    <div key={i} className="flex items-start space-x-2 text-xs text-slate-300">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Financial Snapshot */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">Capital & Return Attribution</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Total Valuation</span>
                    <p className="text-base font-extrabold text-white font-mono mt-1">
                      ₹{report.financial_snapshot.total_value.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Unrealized P&L</span>
                    <p className="text-base font-extrabold text-emerald-400 font-mono mt-1">
                      +₹{report.financial_snapshot.net_unrealized_pnl.toLocaleString('en-IN')} ({report.financial_snapshot.net_pnl_percentage}%)
                    </p>
                  </div>
                  <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Today's Move</span>
                    <p className="text-base font-extrabold text-emerald-400 font-mono mt-1">
                      +₹{report.financial_snapshot.today_pnl.toLocaleString('en-IN')} (+{report.financial_snapshot.today_pnl_percentage}%)
                    </p>
                  </div>
                </div>
              </div>

              {/* Risk Analytics Table */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2.5">Risk & Efficiency Comparison</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-800">
                  <table className="w-full text-xs text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 text-[11px] uppercase border-b border-slate-800">
                        <th className="py-2.5 px-3">Quantitative Metric</th>
                        <th className="py-2.5 px-3 text-right">Portfolio</th>
                        <th className="py-2.5 px-3 text-right">Benchmark</th>
                        <th className="py-2.5 px-3 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-sans">
                      {report.risk_analytics_table.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/20">
                          <td className="py-2.5 px-3 text-slate-200 font-medium">{row.metric}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-white font-bold">{row.portfolio}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-slate-400">{row.benchmark}</td>
                          <td className="py-2.5 px-3 text-center">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-semibold text-emerald-400 border border-slate-700">
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Strategic AI Recommendations */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-teal-500/30 space-y-2">
                <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Strategic Optimization Action Plan</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                  {report.strategic_recommendations.map((rec, i) => (
                    <li key={i} className="leading-relaxed">{rec}</li>
                  ))}
                </ul>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
