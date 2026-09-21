import React from 'react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  Legend 
} from 'recharts';
import { AllocationBreakdown } from '../types';
import { PieChart as PieIcon, AlertTriangle } from 'lucide-react';

interface AllocationViewProps {
  allocation: AllocationBreakdown;
}

const SECTOR_COLORS = ['#10b981', '#06b6d4', '#6366f1', '#a855f7', '#f59e0b', '#ec4899', '#3b82f6'];
const ASSET_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#14b8a6'];

export const AllocationView: React.FC<AllocationViewProps> = ({ allocation }) => {
  const sectorData = React.useMemo(() => {
    return Object.entries(allocation.sector_allocation || {}).map(([name, value]) => ({
      name,
      value
    }));
  }, [allocation.sector_allocation]);

  const assetData = React.useMemo(() => {
    return Object.entries(allocation.asset_allocation || {}).map(([name, value]) => ({
      name,
      value
    }));
  }, [allocation.asset_allocation]);

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-700 px-3 py-1.5 rounded-lg shadow-xl text-xs">
          <p className="font-semibold text-white">{payload[0].name}</p>
          <p className="text-emerald-400 font-mono font-bold">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Sector Allocation Card */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-emerald-400" />
              <span>Sector Allocation</span>
            </h3>
            <span className="text-xs text-slate-400">Target max: 35%</span>
          </div>

          <div className="h-56 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sectorData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sectorData.map((_, index) => (
                    <Cell key={`cell-sec-${index}`} fill={SECTOR_COLORS[index % SECTOR_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sector Progress Bars */}
        <div className="space-y-2 mt-2">
          {sectorData.map((item, idx) => {
            const isConcentrated = item.value >= 40.0;
            return (
              <div key={item.name} className="text-xs">
                <div className="flex items-center justify-between text-slate-300 mb-1">
                  <span className="flex items-center space-x-1.5">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length] }} 
                    />
                    <span className="font-medium">{item.name}</span>
                    {isConcentrated && (
                      <span title="Concentration threshold exceeded (>40%)">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400 inline ml-1" />
                      </span>
                    )}
                  </span>
                  <span className={`font-mono font-semibold ${isConcentrated ? 'text-amber-400' : 'text-slate-300'}`}>
                    {item.value}%
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
                    style={{ 
                      width: `${item.value}%`, 
                      backgroundColor: SECTOR_COLORS[idx % SECTOR_COLORS.length] 
                    }} 
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Asset Class Breakdown Card */}
      <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow-md flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <span>Asset Class Breakdown</span>
            </h3>
            <span className="text-xs text-slate-400">Multi-Asset Strategy</span>
          </div>

          <div className="h-56 mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={assetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {assetData.map((_, index) => (
                    <Cell key={`cell-asset-${index}`} fill={ASSET_COLORS[index % ASSET_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Asset Bars */}
        <div className="space-y-2.5 mt-2">
          {assetData.map((item, idx) => (
            <div key={item.name} className="text-xs">
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span className="flex items-center space-x-1.5">
                  <span 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: ASSET_COLORS[idx % ASSET_COLORS.length] }} 
                  />
                  <span className="font-medium">{item.name}</span>
                </span>
                <span className="font-mono font-semibold text-slate-300">{item.value}%</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-500" 
                  style={{ 
                    width: `${item.value}%`, 
                    backgroundColor: ASSET_COLORS[idx % ASSET_COLORS.length] 
                  }} 
                />
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
