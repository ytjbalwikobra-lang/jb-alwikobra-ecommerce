import React from 'react';
import { BarChart3 } from 'lucide-react';

interface DailyOrdersLineChartProps {
  data: Array<{date: string; revenue: number; orders: number}>; 
  title: string;
}

export const DailyOrdersLineChart: React.FC<DailyOrdersLineChartProps> = ({ data, title }) => {
  const padded = data && data.length ? data : [];
  const maxOrders = Math.max(1, ...padded.map(d => d.orders));
  const width = 1000; // virtual width for viewBox
  const height = 320; // virtual height for viewBox
  const paddingX = 40;
  const paddingY = 30;
  const innerW = width - paddingX * 2;
  const innerH = height - paddingY * 2;

  const points = padded.map((d, i) => {
    const x = padded.length > 1 ? (i / (padded.length - 1)) * innerW + paddingX : paddingX + innerW / 2;
    const y = paddingY + innerH - (d.orders / maxOrders) * innerH;
    return { x, y, d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = points.length
    ? `M ${points[0].x} ${height - paddingY} L ${points.map(p => `${p.x} ${p.y}`).join(' L ')} L ${points[points.length - 1].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="bg-gray-900/60 border border-orange-500/30 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-orange-400" />
        {title}
      </h3>
      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-80 md:h-96">
          {/* Axes */}
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#374151" strokeWidth="1" />
          <line x1={paddingX} y1={paddingY} x2={paddingX} y2={height - paddingY} stroke="#374151" strokeWidth="1" />

          {/* Area fill */}
          {points.length > 1 && (
            <path d={areaD} fill="url(#areaGradient)" opacity={0.25} />
          )}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Line */}
          {points.length > 0 && (
            <path d={pathD} fill="none" stroke="#fb923c" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          )}

          {/* Points + tooltips */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r={4} fill="#fff" stroke="#fb923c" strokeWidth={2}>
                <title>{`${new Date(p.d.date).toLocaleDateString('id-ID')}: ${p.d.orders} pesanan`}</title>
              </circle>
            </g>
          ))}

          {/* Y-axis max label */}
          <text x={paddingX - 8} y={paddingY + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{maxOrders}</text>
          <text x={paddingX - 8} y={height - paddingY} textAnchor="end" fontSize="10" fill="#9CA3AF">0</text>

          {/* X-axis labels (first, middle, last) */}
          {points.length >= 1 && (
            <>
              <text x={points[0].x} y={height - paddingY + 18} textAnchor="middle" fontSize="10" fill="#9CA3AF">
                {new Date(points[0].d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
              </text>
              {points.length > 2 && (
                <text x={points[Math.floor(points.length / 2)].x} y={height - paddingY + 18} textAnchor="middle" fontSize="10" fill="#9CA3AF">
                  {new Date(points[Math.floor(points.length / 2)].d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                </text>
              )}
              {points.length > 1 && (
                <text x={points[points.length - 1].x} y={height - paddingY + 18} textAnchor="middle" fontSize="10" fill="#9CA3AF">
                  {new Date(points[points.length - 1].d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                </text>
              )}
            </>
          )}
        </svg>
      </div>
      <div className="mt-2 text-sm text-gray-300">
        Total pesanan dibuat: <span className="text-white font-semibold">{padded.reduce((s, d) => s + d.orders, 0)}</span>
      </div>
    </div>
  );
};
