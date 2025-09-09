import React, { useState } from 'react';
import { Filter, Calendar, BarChart3, PieChart as PieChartIcon, TrendingUp, Settings } from 'lucide-react';

type TimePeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

interface TimePeriodFilterProps {
  currentPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  customDateRange?: { start: string; end: string };
  onCustomDateChange?: (range: { start: string; end: string }) => void;
}

export const TimePeriodFilter: React.FC<TimePeriodFilterProps> = ({ 
  currentPeriod, 
  onPeriodChange, 
  customDateRange, 
  onCustomDateChange 
}) => {
  const [showCustom, setShowCustom] = useState(false);

  const periods = [
    { key: 'weekly' as TimePeriod, label: 'Mingguan', icon: Calendar },
    { key: 'monthly' as TimePeriod, label: 'Bulanan', icon: BarChart3 },
    { key: 'quarterly' as TimePeriod, label: 'Kuartalan', icon: PieChartIcon },
    { key: 'yearly' as TimePeriod, label: 'Tahunan', icon: TrendingUp },
    { key: 'custom' as TimePeriod, label: 'Custom', icon: Settings }
  ];

  return (
    <div className="bg-gray-900/60 border border-orange-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Periode Waktu</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {periods.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              onPeriodChange(key);
              if (key === 'custom') {
                setShowCustom(true);
              } else {
                setShowCustom(false);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              currentPeriod === key
                ? 'bg-orange-600 border-orange-500 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {showCustom && currentPeriod === 'custom' && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={customDateRange?.start || ''}
              onChange={(e) => onCustomDateChange?.({ 
                start: e.target.value, 
                end: customDateRange?.end || '' 
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={customDateRange?.end || ''}
              onChange={(e) => onCustomDateChange?.({ 
                start: customDateRange?.start || '', 
                end: e.target.value 
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};
