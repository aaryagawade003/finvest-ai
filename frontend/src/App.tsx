import React, { useState, useEffect } from 'react';
import { 
  getDemoPortfolios, 
  triggerMarketShock,
  getSettingsStatus
} from './services/api';
import { PortfolioSummary, Holding, Transaction, PortfolioAlert, SettingsStatus } from './types';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { PerformanceChart } from './components/PerformanceChart';
import { AllocationView } from './components/AllocationView';
import { RiskMetricsCard } from './components/RiskMetricsCard';
import { HoldingsTable } from './components/HoldingsTable';
import { WhatIfSimulator } from './components/WhatIfSimulator';
import { AiCopilotChat } from './components/AiCopilotChat';
import { AlertsCenter } from './components/AlertsCenter';
import { ReportGeneratorModal } from './components/ReportGeneratorModal';
import { TransactionModal } from './components/TransactionModal';
import { SettingsModal } from './components/SettingsModal';
import { Sparkles, Activity, ShieldCheck, Zap } from 'lucide-react';

export function App() {
  const [portfolios, setPortfolios] = useState<Record<string, PortfolioSummary>>({});
  const [activeProfileKey, setActiveProfileKey] = useState<string>('growth');
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [loading, setLoading] = useState<boolean>(true);
  const [settingsStatus, setSettingsStatus] = useState<SettingsStatus | null>(null);

  // Modals
  const [isReportOpen, setIsReportOpen] = useState<boolean>(false);
  const [isTransactionOpen, setIsTransactionOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [tradeHolding, setTradeHolding] = useState<Holding | null>(null);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');

  // Toast banner
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'alert' } | null>(null);

  const showToast = (message: string, type: 'success' | 'alert' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4500);
  };

  const loadData = () => {
    getDemoPortfolios()
      .then(data => {
        setPortfolios(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load demo portfolios', err);
        setLoading(false);
      });

    getSettingsStatus()
      .then(st => setSettingsStatus(st))
      .catch(() => {});
  };

  useEffect(() => {
    loadData();
  }, []);

  const activePortfolio = portfolios[activeProfileKey] || Object.values(portfolios)[0];
  const isLlmActive = Boolean(
    settingsStatus?.active_llm_provider && settingsStatus.active_llm_provider !== 'None'
  );

  // Handle simulated market shock (Section 21 Demonstration Scenario)
  const handleSimulateShock = async () => {
    if (!activePortfolio) return;

    showToast("⚡ Market Event Triggered: Global Technology sector pullback (-4.5%)", 'alert');
    
    // Recalculate portfolio with shock
    const updatedHoldings = activePortfolio.holdings.map(h => {
      if (h.sector === 'Technology') {
        const newPrice = Math.round(h.current_price * 0.955 * 100) / 100;
        return { ...h, current_price: newPrice };
      }
      return h;
    });

    const totalVal = updatedHoldings.reduce((sum, h) => sum + (h.quantity * h.current_price), 0);
    const dropAmount = activePortfolio.metrics.total_portfolio_value - totalVal;

    // Trigger shock alert
    const shockAlert: PortfolioAlert = {
      id: `alert-shock-${Date.now()}`,
      type: 'DRAWDOWN',
      level: 'CRITICAL',
      title: 'Technology Sector Sell-Off Impact (-4.5%)',
      message: `Simulated market shock caused high-beta tech holdings to decline. Total value impacted by -₹${Math.round(dropAmount).toLocaleString('en-IN')}.`,
      metric_value: -4.5,
      threshold: -3.0,
      created_at: new Date().toLocaleTimeString()
    };

    const updatedPortfolio: PortfolioSummary = {
      ...activePortfolio,
      holdings: updatedHoldings,
      alerts: [shockAlert, ...activePortfolio.alerts],
      metrics: {
        ...activePortfolio.metrics,
        total_portfolio_value: totalVal,
        today_pnl: activePortfolio.metrics.today_pnl - dropAmount,
        today_pnl_percentage: Math.round(((activePortfolio.metrics.today_pnl - dropAmount) / totalVal) * 1000) / 10,
        max_drawdown: Math.round((activePortfolio.metrics.max_drawdown - 2.8) * 10) / 10,
        volatility: Math.round((activePortfolio.metrics.volatility + 1.4) * 10) / 10
      }
    };

    setPortfolios(prev => ({
      ...prev,
      [activeProfileKey]: updatedPortfolio
    }));

    // Notify backend
    triggerMarketShock(-0.045).catch(() => {});
  };

  // Handle Trade execution
  const handleExecuteTransaction = (tx: Transaction) => {
    if (!activePortfolio) return;

    let updatedHoldings = [...activePortfolio.holdings];
    const existingIndex = updatedHoldings.findIndex(h => h.symbol === tx.symbol);

    if (tx.transaction_type === 'BUY') {
      if (existingIndex >= 0) {
        const h = updatedHoldings[existingIndex];
        const oldTotal = h.quantity * h.avg_buy_price;
        const addTotal = tx.quantity * tx.price;
        const newQty = h.quantity + tx.quantity;
        const newAvg = (oldTotal + addTotal) / newQty;
        updatedHoldings[existingIndex] = {
          ...h,
          quantity: newQty,
          avg_buy_price: Math.round(newAvg * 100) / 100,
          current_price: tx.price
        };
      } else {
        updatedHoldings.push({
          id: `h-${tx.symbol.toLowerCase()}-${Date.now()}`,
          symbol: tx.symbol,
          name: tx.name,
          asset_class: 'EQUITY',
          sector: 'Other',
          quantity: tx.quantity,
          avg_buy_price: tx.price,
          current_price: tx.price,
          currency: currency
        });
      }
      showToast(`Successfully bought ${tx.quantity} shares of ${tx.symbol} at ₹${tx.price}`);
    } else {
      if (existingIndex >= 0) {
        const h = updatedHoldings[existingIndex];
        const newQty = Math.max(0, h.quantity - tx.quantity);
        if (newQty === 0) {
          updatedHoldings = updatedHoldings.filter((_, i) => i !== existingIndex);
        } else {
          updatedHoldings[existingIndex] = { ...h, quantity: newQty };
        }
        showToast(`Successfully sold ${tx.quantity} shares of ${tx.symbol} at ₹${tx.price}`);
      }
    }

    const totalVal = updatedHoldings.reduce((sum, h) => sum + (h.quantity * h.current_price), 0);
    const totalInv = updatedHoldings.reduce((sum, h) => sum + (h.quantity * h.avg_buy_price), 0);

    const updatedPortfolio: PortfolioSummary = {
      ...activePortfolio,
      holdings: updatedHoldings,
      metrics: {
        ...activePortfolio.metrics,
        total_portfolio_value: Math.round(totalVal),
        total_invested_amount: Math.round(totalInv),
        total_unrealized_pnl: Math.round(totalVal - totalInv),
        total_pnl_percentage: totalInv > 0 ? Math.round(((totalVal - totalInv) / totalInv) * 1000) / 10 : 0
      }
    };

    setPortfolios(prev => ({
      ...prev,
      [activeProfileKey]: updatedPortfolio
    }));
  };

  if (loading || !activePortfolio) {
    return (
      <div className="min-h-screen bg-[#090d16] flex items-center justify-center text-white">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center animate-spin mx-auto">
            <Activity className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-bold">Initializing FinVest AI Intelligence Engine...</h2>
          <p className="text-xs text-slate-400">Loading live market connections and portfolio risk metrics</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col">
      
      {/* Toast Notification Banner */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl border shadow-2xl flex items-center space-x-3 text-xs font-semibold backdrop-blur-md transition-all ${
          toast.type === 'alert' 
            ? 'bg-rose-950/90 text-rose-200 border-rose-500/50' 
            : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
        }`}>
          {toast.type === 'alert' ? <Zap className="w-4 h-4 text-rose-400" /> : <Sparkles className="w-4 h-4 text-emerald-400" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Main Top Navbar */}
      <Navbar
        activeProfileKey={activeProfileKey}
        onSelectProfile={(key) => {
          setActiveProfileKey(key);
          showToast(`Switched to ${portfolios[key]?.name || key}`);
        }}
        onSimulateShock={handleSimulateShock}
        currency={currency}
        onToggleCurrency={() => setCurrency(currency === 'INR' ? 'USD' : 'INR')}
        alertCount={activePortfolio.alerts.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        isLlmActive={isLlmActive}
      />

      {/* Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <DashboardOverview
              portfolio={activePortfolio}
              currency={currency}
              onOpenCopilot={() => setActiveTab('copilot')}
              onOpenSimulator={() => setActiveTab('simulator')}
              onOpenReport={() => setIsReportOpen(true)}
              onAddTransaction={() => {
                setTradeHolding(null);
                setTradeType('BUY');
                setIsTransactionOpen(true);
              }}
            />

            {/* Performance Chart */}
            <PerformanceChart
              history={activePortfolio.history}
              currency={currency}
              benchmarkName={activePortfolio.metrics.benchmark_name}
            />

            {/* Risk Gauges Card */}
            <RiskMetricsCard metrics={activePortfolio.metrics} />

            {/* Allocation Donut Charts */}
            <AllocationView allocation={activePortfolio.allocation} />

            {/* Quick Holdings Preview Table */}
            <HoldingsTable
              holdings={activePortfolio.holdings}
              currency={currency}
              onTrade={(holding, type) => {
                setTradeHolding(holding);
                setTradeType(type);
                setIsTransactionOpen(true);
              }}
            />
          </div>
        )}

        {/* TAB 2: HOLDINGS & TRANSACTIONS */}
        {activeTab === 'holdings' && (
          <div className="space-y-6">
            <HoldingsTable
              holdings={activePortfolio.holdings}
              currency={currency}
              onTrade={(holding, type) => {
                setTradeHolding(holding);
                setTradeType(type);
                setIsTransactionOpen(true);
              }}
            />
            <AllocationView allocation={activePortfolio.allocation} />
          </div>
        )}

        {/* TAB 3: WHAT-IF SIMULATOR */}
        {activeTab === 'simulator' && (
          <WhatIfSimulator portfolio={activePortfolio} />
        )}

        {/* TAB 4: AI COPILOT */}
        {activeTab === 'copilot' && (
          <AiCopilotChat portfolio={activePortfolio} />
        )}

        {/* TAB 5: ALERTS CENTER */}
        {activeTab === 'alerts' && (
          <AlertsCenter alerts={activePortfolio.alerts} />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 bg-slate-950/40 text-center text-xs text-slate-500">
        <p>FinVest AI — Production FinTech Portfolio Intelligence Platform • Real Market Data APIs & Multi-Provider LLM Architecture</p>
      </footer>

      {/* Settings & API Key Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onKeysUpdated={(msg) => {
          showToast(msg);
          loadData();
        }}
      />

      {/* AI Report Modal */}
      <ReportGeneratorModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        portfolio={activePortfolio}
      />

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionOpen}
        onClose={() => setIsTransactionOpen(false)}
        preselectedHolding={tradeHolding}
        defaultType={tradeType}
        onExecuteTransaction={handleExecuteTransaction}
        currency={currency}
      />

    </div>
  );
}

export default App;
