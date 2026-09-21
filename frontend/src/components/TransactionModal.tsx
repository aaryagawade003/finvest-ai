import React, { useState } from 'react';
import { X, CheckCircle2, ArrowRight, Search, RefreshCw, Globe } from 'lucide-react';
import { Holding, Transaction, LiveQuote } from '../types';
import { getLiveQuote } from '../services/api';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedHolding?: Holding | null;
  defaultType?: 'BUY' | 'SELL';
  onExecuteTransaction: (tx: Transaction) => void;
  currency: 'INR' | 'USD';
}

const POPULAR_ASSETS = [
  { symbol: 'TCS', name: 'Tata Consultancy Services', price: 4210.00 },
  { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2985.40 },
  { symbol: 'HDFCBANK', name: 'HDFC Bank Ltd.', price: 1640.50 },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 185.50 },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 35090.00 },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 10250.00 },
  { symbol: 'GOLDBEES', name: 'Nippon India Gold BeES ETF', price: 62.80 },
  { symbol: 'NIFTYBEES', name: 'Nippon India Nifty 50 BeES ETF', price: 268.40 },
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  preselectedHolding,
  defaultType = 'BUY',
  onExecuteTransaction,
  currency
}) => {
  const [type, setType] = useState<'BUY' | 'SELL'>(defaultType);
  const [symbol, setSymbol] = useState<string>(preselectedHolding?.symbol || 'TCS');
  const [assetName, setAssetName] = useState<string>(preselectedHolding?.name || 'Tata Consultancy Services');
  const [quantity, setQuantity] = useState<number>(10);
  const [price, setPrice] = useState<number>(preselectedHolding?.current_price || 4210.00);
  const [notes, setNotes] = useState<string>('Portfolio Order');

  const [isFetchingQuote, setIsFetchingQuote] = useState(false);
  const [quoteSource, setQuoteSource] = useState<string | null>(null);

  React.useEffect(() => {
    if (preselectedHolding) {
      setSymbol(preselectedHolding.symbol);
      setAssetName(preselectedHolding.name);
      setPrice(preselectedHolding.current_price);
    }
  }, [preselectedHolding]);

  if (!isOpen) return null;

  const totalAmount = quantity * price;

  const handleFetchLivePrice = async () => {
    if (!symbol.trim()) return;
    setIsFetchingQuote(true);
    try {
      const q: LiveQuote = await getLiveQuote(symbol.trim());
      if (q.price > 0) {
        setPrice(q.price);
        setQuoteSource(q.source);
      }
    } catch (e) {
      console.error('Failed to fetch live quote', e);
    } finally {
      setIsFetchingQuote(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onExecuteTransaction({
      symbol: symbol.toUpperCase(),
      name: assetName,
      transaction_type: type,
      quantity,
      price,
      notes
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div>
            <h3 className="text-base font-bold text-white">Execute Real Market Transaction</h3>
            <p className="text-xs text-slate-400 mt-0.5">Live quotes from Yahoo Finance, Finnhub & Alpha Vantage</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          
          {/* Order Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setType('BUY')}
              className={`py-2 rounded-lg font-bold transition-all ${
                type === 'BUY' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              BUY / ADD
            </button>
            <button
              type="button"
              onClick={() => setType('SELL')}
              className={`py-2 rounded-lg font-bold transition-all ${
                type === 'SELL' 
                  ? 'bg-rose-500 text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              SELL / TRIM
            </button>
          </div>

          {/* Quick preset chips */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-[10px]">
            <span className="text-slate-400 font-semibold flex-shrink-0">Popular:</span>
            {POPULAR_ASSETS.slice(0, 5).map(a => (
              <button
                key={a.symbol}
                type="button"
                onClick={() => {
                  setSymbol(a.symbol);
                  setAssetName(a.name);
                  setPrice(a.price);
                  setQuoteSource("Preset Market Catalog");
                }}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 flex-shrink-0"
              >
                {a.symbol}
              </button>
            ))}
          </div>

          {/* Custom Ticker Search Bar */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Ticker / Asset Symbol</label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g. AAPL, NVDA, RELIANCE, INFY, TSLA..."
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="flex-1 bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold"
              />
              <button
                type="button"
                onClick={handleFetchLivePrice}
                disabled={isFetchingQuote || !symbol.trim()}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-semibold flex items-center space-x-1"
                title="Fetch live market price"
              >
                {isFetchingQuote ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
                <span>Live Quote</span>
              </button>
            </div>
            {quoteSource && (
              <p className="text-[10px] text-emerald-400 mt-1 flex items-center space-x-1">
                <span>Verified via {quoteSource}</span>
              </p>
            )}
          </div>

          {/* Asset Display Name */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Company / Fund Name</label>
            <input
              type="text"
              value={assetName}
              onChange={(e) => setAssetName(e.target.value)}
              className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Quantity & Price Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Quantity</label>
              <input
                type="number"
                min="0.1"
                step="any"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(0.1, Number(e.target.value)))}
                className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Price per Share</label>
              <input
                type="number"
                min="0.01"
                step="any"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono font-bold text-emerald-400"
              />
            </div>
          </div>

          {/* Order Summary Total */}
          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex items-center justify-between">
            <span className="text-slate-400">Total Order Value:</span>
            <span className="font-mono text-base font-extrabold text-white">
              {currency === 'INR' ? '₹' : '$'}{totalAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Trade Rationale / Notes</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 text-white px-3 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md ${
              type === 'BUY'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-slate-950 shadow-emerald-500/20'
                : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-500/20'
            }`}
          >
            <span>Confirm & Record {type} Order</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

      </div>
    </div>
  );
};
