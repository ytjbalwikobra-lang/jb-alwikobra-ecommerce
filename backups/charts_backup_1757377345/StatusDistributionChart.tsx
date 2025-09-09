import React, { useState } from 'react';

interface StatusData {
  status: string;
  count: number;
  color: string;
}

interface StatusDistributionChartProps {
  data: StatusData[];
  loading?: boolean;
  className?: string;
}

const StatusDistributionChart: React.FC<StatusDistributionChartProps> = ({
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

  const total = data.reduce((sum, item) => sum + item.count, 0);
  
  // Calculate angles for pie chart
  let currentAngle = 0;
  const segments = data.map(item => {
    const percentage = (item.count / total) * 100;
    const angle = (item.count / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;
    
    return {
      ...item,
      percentage,
      startAngle,
      endAngle,
      angle
    };
  });

  const radius = 80;
  const centerX = 120;
  const centerY = 120;

  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    
    return [
      "M", x, y, 
      "L", start.x, start.y,
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y,
      "Z"
    ].join(" ");
  };

  return (
    <div className={`bg-gray-900/60 border border-orange-500/30 rounded-xl p-6 ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-1">Order Status Distribution</h3>
        <p className="text-sm text-gray-400">Breakdown by status</p>
      </div>
      
      <div className="flex items-center justify-between">
        {/* Pie Chart */}
        <div className="relative">
          <svg width="240" height="240" className="transform -rotate-90">
            {segments.map((segment, index) => (
              <path
                key={segment.status}
                d={describeArc(centerX, centerY, radius, segment.startAngle, segment.endAngle)}
                fill={hoveredIndex === index ? 
                  segment.color.replace('500', '400') : 
                  segment.color
                }
                stroke="#1F2937"
                strokeWidth="2"
                className="transition-colors duration-200 cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            ))}
            
            {/* Center circle */}
            <circle
              cx={centerX}
              cy={centerY}
              r="40"
              fill="#1F2937"
              stroke="#374151"
              strokeWidth="2"
            />
            
            {/* Total count in center */}
            <text
              x={centerX}
              y={centerY - 5}
              textAnchor="middle"
              className="fill-white text-lg font-bold transform rotate-90"
              dominantBaseline="middle"
            >
              {total}
            </text>
            <text
              x={centerX}
              y={centerY + 15}
              textAnchor="middle"
              className="fill-gray-400 text-xs transform rotate-90"
              dominantBaseline="middle"
            >
              Total
            </text>
          </svg>
        </div>
        
        {/* Legend */}
        <div className="space-y-3">
          {segments.map((segment, index) => (
            <div 
              key={segment.status}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-colors duration-200 cursor-pointer ${
                hoveredIndex === index ? 'bg-gray-800' : ''
              }`}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div 
                className="w-4 h-4 rounded-full" 
                style={{ backgroundColor: segment.color }}
              ></div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white capitalize">
                  {segment.status}
                </div>
                <div className="text-xs text-gray-400">
                  {segment.count} orders ({segment.percentage.toFixed(1)}%)
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatusDistributionChart;
