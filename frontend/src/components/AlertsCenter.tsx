import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, AlertCircle, Info, Check, Filter } from 'lucide-react';
import { PortfolioAlert } from '../types';

interface AlertsCenterProps {
  alerts: PortfolioAlert[];
  onAcknowledgeAlert?: (id: string) => void;
}

export const AlertsCenter: React.FC<AlertsCenterProps> = ({ alerts, onAcknowledgeAlert }) => {
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [ackedIds, setAckedIds] = useState<Set<string>>(new Set());

  const handleAck = (id: string) => {
    setAckedIds(prev => new Set(prev).add(id));
    if (onAcknowledgeAlert) {
      onAcknowledgeAlert(id);
    }
  };

  const filteredAlerts = alerts.filter(a => {
    if (filterLevel === 'ALL') return true;
    return a.level === filterLevel;
  });

  const getAlertIcon = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return <AlertCircle className="w-5 h-5 text-rose-400" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      default:
        return <Info className="w-5 h-5 text-cyan-400" />;
    }
  };

  const getAlertBadge = (level: string) => {
    switch (level) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'WARNING':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30';
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-md p-5 space-y-4">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <span>Intelligent Risk & Performance Alerts</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">Automated surveillance engine monitoring concentration, volatility, and drawdowns</p>
        </div>

        {/* Level Filters */}
        <div className="flex items-center space-x-1.5 self-start sm:self-auto bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          {(['ALL', 'CRITICAL', 'WARNING', 'INFO'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilterLevel(lvl)}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                filterLevel === lvl
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs">
            No active alerts matching the selected filter.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isAcked = ackedIds.has(alert.id);
            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between space-x-4 ${
                  isAcked 
                    ? 'bg-slate-950/30 border-slate-800/60 opacity-60' 
                    : alert.level === 'CRITICAL'
                    ? 'bg-rose-950/20 border-rose-500/30 shadow-sm'
                    : alert.level === 'WARNING'
                    ? 'bg-amber-950/20 border-amber-500/30 shadow-sm'
                    : 'bg-cyan-950/20 border-cyan-500/30 shadow-sm'
                }`}
              >
                <div className="flex items-start space-x-3.5">
                  <div className="mt-0.5">{getAlertIcon(alert.level)}</div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white">{alert.title}</span>
                      <span className={`text-[10px] px-2 py-0.2 rounded-full border font-semibold ${getAlertBadge(alert.level)}`}>
                        {alert.level}
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono">[{alert.type}]</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">{alert.message}</p>
                    <div className="text-[10px] text-slate-500 flex items-center space-x-3 pt-1">
                      <span>Triggered: {alert.created_at}</span>
                      {alert.threshold && (
                        <span>Threshold: <strong className="text-slate-400">{alert.threshold}%</strong></span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Acknowledge Button */}
                <button
                  onClick={() => handleAck(alert.id)}
                  disabled={isAcked}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all flex-shrink-0 ${
                    isAcked
                      ? 'bg-slate-800 text-slate-500 cursor-default'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isAcked ? 'Acknowledged' : 'Acknowledge'}</span>
                </button>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
