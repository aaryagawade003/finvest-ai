import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { HistoricalDataPoint } from '../types';

interface PerformanceChartProps {
  history: HistoricalDataPoint[];
  currency: 'INR' | 'USD';
  benchmarkName: string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  history,
  currency,
  benchmarkName
}) => {
  const [timeframe, setTimeframe] = useState<'1M' | '3M' | '6M' | 'ALL'>('3M');

  // Filter history by timeframe
  const filteredData = React.useMemo(() => {
    if (!history || history.length === 0) return [];
    const count = timeframe === '1M' ? 30 : timeframe === '3M' ? 60 : timeframe === '6M' ? 90 : history.length;
    return history.slice(-count);
  }, [history, timeframe]);

  const symbol = currency === 'INR' ? '₹' : '$';
  const multiplier = currency === 'USD' ? 0.012 : 1;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl text-xs space-y-1.5">
          <p className="font-semibold text-slate-300">{label}</p>
          <div className="flex items-center justify-between space-x-4">
            <span className="text-emerald-400 font-medium">Portfolio:</span>
            <span className="font-mono text-white font-bold">
              {symbol}{((payload[0]?.value ?? 0) * multiplier).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
          <div className="flex items-center justify-between space-x-4">
            <span className="text-cyan-400 font-medium">{benchmarkName}:</span>
            <span className="font-mono text-slate-300 font-bold">
              {symbol}{((payload[1]?.value ?? 0) * multiplier).toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Portfolio Performance vs Benchmark</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">Historical growth compared with {benchmarkName} index baseline</p>
        </div>

        {/* Timeframe Buttons */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(['1M', '3M', '6M', 'ALL'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                timeframe === tf
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-72 mt-4 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={filteredData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
              </linearGradient>
              <linearGradient id="colorBenchmark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis 
              stroke="#64748b" 
              tick={{ fill: '#64748b', fontSize: 11 }}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(v) => `${symbol}${Math.round(v * multiplier / 1000)}k`}
              domain={['auto', 'auto']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              formatter={(value) => <span className="text-slate-300 font-medium">{value}</span>}
            />
            <Area 
              type="monotone" 
              dataKey="portfolio" 
              name="FinVest Portfolio" 
              stroke="#10b981" 
              strokeWidth={2.5} 
              fillOpacity={1} 
              fill="url(#colorPortfolio)" 
            />
            <Area 
              type="monotone" 
              dataKey="benchmark" 
              name={benchmarkName} 
              stroke="#06b6d4" 
              strokeWidth={2} 
              strokeDasharray="4 4"
              fillOpacity={1} 
              fill="url(#colorBenchmark)" 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
