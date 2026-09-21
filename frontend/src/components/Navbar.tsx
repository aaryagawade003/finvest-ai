import React from 'react';
import { 
  TrendingUp, 
  ShieldAlert, 
  Zap, 
  RefreshCw, 
  Sliders, 
  Bot, 
  FileText,
  Key
} from 'lucide-react';
import { PortfolioSummary } from '../types';

interface NavbarProps {
  activeProfileKey: string;
  onSelectProfile: (key: string) => void;
  onSimulateShock: () => void;
  currency: 'INR' | 'USD';
  onToggleCurrency: () => void;
  alertCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReport: () => void;
  onOpenSettings: () => void;
  isLlmActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeProfileKey,
  onSelectProfile,
  onSimulateShock,
  currency,
  onToggleCurrency,
  alertCount,
  activeTab,
  setActiveTab,
  onOpenReport,
  onOpenSettings,
  isLlmActive
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0c1222]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <TrendingUp className="w-5 h-5 text-slate-950 font-bold" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  FINVEST
                </span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium hidden sm:block">Portfolio Intelligence Platform</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-slate-800 text-emerald-400' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab('holdings')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeTab === 'holdings' 
                  ? 'bg-slate-800 text-emerald-400' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              Holdings
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'simulator' 
                  ? 'bg-slate-800 text-emerald-400' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('copilot')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 ${
                activeTab === 'copilot' 
                  ? 'bg-slate-800 text-emerald-400' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>AI Copilot</span>
            </button>
            <button
              onClick={() => setActiveTab('alerts')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center space-x-1.5 relative ${
                activeTab === 'alerts' 
                  ? 'bg-slate-800 text-emerald-400' 
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Alerts</span>
              {alertCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {alertCount}
                </span>
              )}
            </button>
          </nav>

          {/* Right Tools: Profile Switcher, API Keys, Shock Button, Report, Currency */}
          <div className="flex items-center space-x-2">
            
            {/* Demo Profile Selector */}
            <div className="relative hidden sm:block">
              <select
                value={activeProfileKey}
                onChange={(e) => onSelectProfile(e.target.value)}
                className="bg-slate-800/90 text-slate-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-700 hover:border-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="growth">Growth Profile (₹15L • 55% Tech)</option>
                <option value="balanced">Balanced Multi-Asset (₹10L)</option>
                <option value="conservative">Conservative Wealth (₹8L)</option>
              </select>
            </div>

            {/* API Keys & Integrations Button */}
            <button
              onClick={onOpenSettings}
              title="Manage and test real API keys (Gemini, OpenAI, Finnhub, Alpha Vantage)"
              className="px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all shadow-sm"
            >
              <Key className="w-3.5 h-3.5 text-teal-400" />
              <span className="hidden md:inline">API Keys</span>
              <span className={`w-2 h-2 rounded-full ${isLlmActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>

            {/* Market Shock Simulation Trigger */}
            <button
              onClick={onSimulateShock}
              title="Simulate Market Event (e.g. Tech sector decline) to trigger real-time recalculation & alerts"
              className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-semibold flex items-center space-x-1 transition-all"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden lg:inline">Shock Test</span>
            </button>

            {/* AI Report Button */}
            <button
              onClick={onOpenReport}
              className="px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center space-x-1 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Report</span>
            </button>

            {/* Currency Switcher */}
            <button
              onClick={onToggleCurrency}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 text-xs font-mono font-bold"
              title="Toggle INR / USD"
            >
              {currency === 'INR' ? '₹' : '$'}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
