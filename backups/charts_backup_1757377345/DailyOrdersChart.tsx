import React, { useState } from 'react';

interface ChartData {
  date: string;
  orders: number;
  revenue: number;
}

interface DailyOrdersChartProps {
  data: ChartData[];
  loading?: boolean;
  className?: string;
}

const DailyOrdersChart: React.FC<DailyOrdersChartProps> = ({
  data,
  loading = false,
  className = ''
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (loading) {
    return (
      <div className={`bg-gray-900/60 border border-orange-500/30 rounded-xl p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const maxOrders = Math.max(...data.map(d => d.orders), 1);
  const chartHeight = 200;

  return (
    <div className={`bg-gray-900/60 border border-orange-500/30 rounded-xl p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-1">Daily Orders</h3>
        <p className="text-sm text-gray-400">Order trends over the last 7 days</p>
      </div>
      
      <div className="relative h-64">
        <svg className="w-full h-full" viewBox={`0 0 ${data.length * 60} ${chartHeight + 60}`}>
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map(percent => (
            <line
              key={percent}
              x1="0"
              y1={chartHeight * (percent / 100)}
              x2={data.length * 60}
              y2={chartHeight * (percent / 100)}
              stroke="#374151"
              strokeDasharray="2,2"
              strokeWidth="1"
            />
          ))}
          
          {/* Bars */}
          {data.map((item, index) => {
            const barHeight = (item.orders / maxOrders) * chartHeight;
            const x = index * 60 + 10;
            const y = chartHeight - barHeight;
            
            return (
              <g key={index}>
                <rect
                  x={x}
                  y={y}
                  width="40"
                  height={barHeight}
                  fill={hoveredIndex === index ? "#FB923C" : "#F97316"}
                  rx="4"
                  className="transition-colors duration-200 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
                
                {/* Date labels */}
                <text
                  x={x + 20}
                  y={chartHeight + 20}
                  textAnchor="middle"
                  className="fill-gray-400 text-xs"
                >
                  {formatDate(item.date)}
                </text>
                
                {/* Value labels */}
                <text
                  x={x + 20}
                  y={y - 8}
                  textAnchor="middle"
                  className="fill-white text-xs font-medium"
                >
                  {item.orders}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Tooltip */}
        {hoveredIndex !== null && (
          <div 
            className="absolute z-10 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg pointer-events-none"
            style={{
              left: `${(hoveredIndex * 60 + 30) / (data.length * 60) * 100}%`,
              top: '10px',
              transform: 'translateX(-50%)'
            }}
          >
            <div className="text-sm text-white">
              <div className="font-medium">{formatDate(data[hoveredIndex].date)}</div>
              <div className="text-orange-400">{data[hoveredIndex].orders} orders</div>
              <div className="text-green-400">{formatCurrency(data[hoveredIndex].revenue)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyOrdersChart;
