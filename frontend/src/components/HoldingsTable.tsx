import React, { useState } from 'react';
import { Holding } from '../types';
import { ArrowUpRight, ArrowDownRight, Plus, Minus, Search, ArrowUpDown } from 'lucide-react';

interface HoldingsTableProps {
  holdings: Holding[];
  currency: 'INR' | 'USD';
  onTrade: (holding: Holding, type: 'BUY' | 'SELL') => void;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({
  holdings,
  currency,
  onTrade
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('ALL');

  const symbol = currency === 'INR' ? '₹' : '$';
  const multiplier = currency === 'USD' ? 0.012 : 1;

  const filteredHoldings = holdings.filter(h => {
    const matchesSearch = h.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          h.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          h.sector.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAsset = selectedAssetClass === 'ALL' || h.asset_class === selectedAssetClass;
    return matchesSearch && matchesAsset;
  });

  const formatMoney = (amount: number) => {
    return (amount * multiplier).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const totalValue = holdings.reduce((sum, h) => sum + (h.quantity * h.current_price), 0);

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-slate-800 shadow-md overflow-hidden">
      
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-white">Portfolio Holdings Ledger</h3>
          <p className="text-xs text-slate-400 mt-0.5">Real-time market valuation and position-level analytics</p>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-y-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search ticker, company, sector..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-950 text-xs text-white pl-8 pr-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-52"
            />
          </div>

          {/* Asset filter */}
          <select
            value={selectedAssetClass}
            onChange={(e) => setSelectedAssetClass(e.target.value)}
            className="bg-slate-950 text-xs text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 cursor-pointer"
          >
            <option value="ALL">All Asset Classes</option>
            <option value="EQUITY">Equities</option>
            <option value="ETF">ETFs</option>
            <option value="COMMODITY">Commodities</option>
            <option value="BOND">Bonds</option>
          </select>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-800/80 bg-slate-950/40 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4">Asset</th>
              <th className="py-3.5 px-3">Sector</th>
              <th className="py-3.5 px-3 text-right">Quantity</th>
              <th className="py-3.5 px-3 text-right">Avg Cost</th>
              <th className="py-3.5 px-3 text-right">Live Price</th>
              <th className="py-3.5 px-3 text-right">Current Value</th>
              <th className="py-3.5 px-3 text-right">Unrealized P&L</th>
              <th className="py-3.5 px-3 text-right">Weight</th>
              <th className="py-3.5 px-4 text-center">Trade</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredHoldings.map((h) => {
              const currentVal = h.quantity * h.current_price;
              const investedVal = h.quantity * h.avg_buy_price;
              const pnl = currentVal - investedVal;
              const pnlPct = investedVal > 0 ? (pnl / investedVal) * 100 : 0;
              const isProfit = pnl >= 0;
              const weight = totalValue > 0 ? (currentVal / totalValue) * 100 : 0;

              return (
                <tr key={h.id} className="hover:bg-slate-800/30 transition-colors group">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-white text-xs border border-slate-700">
                        {h.symbol.slice(0, 3)}
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-bold text-white">{h.symbol}</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {h.asset_class}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px] block truncate max-w-[140px]">{h.name}</span>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-slate-300 font-medium">{h.sector}</td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-300 font-semibold">{h.quantity}</td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-400">{symbol}{formatMoney(h.avg_buy_price)}</td>
                  <td className="py-3.5 px-3 text-right font-mono text-white font-bold">{symbol}{formatMoney(h.current_price)}</td>
                  <td className="py-3.5 px-3 text-right font-mono text-slate-200 font-bold">{symbol}{formatMoney(currentVal)}</td>
                  
                  <td className="py-3.5 px-3 text-right">
                    <div className={`font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isProfit ? '+' : ''}{symbol}{formatMoney(pnl)}
                    </div>
                    <div className={`text-[10px] flex items-center justify-end font-semibold ${isProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isProfit ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {pnlPct.toFixed(2)}%
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono text-slate-300 font-bold">
                    {weight.toFixed(1)}%
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center space-x-1">
                      <button
                        onClick={() => onTrade(h, 'BUY')}
                        className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition-all"
                        title="Buy more"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onTrade(h, 'SELL')}
                        className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all"
                        title="Sell shares"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
