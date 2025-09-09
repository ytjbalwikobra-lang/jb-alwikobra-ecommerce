import React from 'react';
import { PieChart } from 'lucide-react';

interface AreaStatusChartProps {
  data: Record<string, number>;
}

export const AreaStatusChart: React.FC<AreaStatusChartProps> = ({ data }) => {
  const entries = Object.entries(data).filter(([, v]) => (v ?? 0) > 0);
  const labelsMap: Record<string, string> = {
    pending: 'Menunggu',
    paid: 'Dibayar',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    canceled: 'Dibatalkan'
  };
  const colors: Record<string, string> = {
    pending: '#F59E0B',
    paid: '#10B981',
    completed: '#3B82F6',
    cancelled: '#EF4444',
    canceled: '#EF4444'
  };

  const width = 1000; 
  const height = 280; 
  const px = 40; 
  const py = 30;
  const innerW = width - px * 2; 
  const innerH = height - py * 2;
  const maxV = Math.max(1, ...entries.map(([, v]) => v));
  
  const points = entries.map(([k, v], i) => {
    const x = entries.length > 1 ? (i / (entries.length - 1)) * innerW + px : px + innerW/2;
    const y = py + innerH - (v / maxV) * innerH;
    return { x, y, k, v };
  });
  
  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = points.length
    ? `M ${points[0].x} ${height - py} L ${points.map(p => `${p.x} ${p.y}`).join(' L ')} L ${points[points.length - 1].x} ${height - py} Z`
    : '';

  return (
    <div className="bg-gray-900/60 border border-orange-500/30 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-orange-400" />
        Status Pesanan (Area Chart)
      </h3>
      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-72">
          <line x1={px} y1={height - py} x2={width - px} y2={height - py} stroke="#374151" strokeWidth="1" />
          <line x1={px} y1={py} x2={px} y2={height - py} stroke="#374151" strokeWidth="1" />
          {points.length > 1 && (
            <path d={areaD} fill="url(#statusArea)" opacity={0.35} />
          )}
          <defs>
            <linearGradient id="statusArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>
          {points.length > 0 && (
            <path d={pathD} fill="none" stroke="#fb923c" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          )}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r={4} fill="#fff" stroke="#fb923c" strokeWidth={2}>
                <title>{`${labelsMap[p.k] || p.k}: ${p.v}`}</title>
              </circle>
              <text x={p.x} y={height - py + 18} textAnchor="middle" fontSize="10" fill="#9CA3AF">
                {labelsMap[p.k] || p.k}
              </text>
            </g>
          ))}
          <text x={px - 8} y={py + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{maxV}</text>
          <text x={px - 8} y={height - py} textAnchor="end" fontSize="10" fill="#9CA3AF">0</text>
        </svg>
      </div>
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-3">
        {entries.map(([k, v]) => (
          <div key={k} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[k] || '#9CA3AF' }} />
              <span className="text-gray-300 text-sm">{labelsMap[k] || k}</span>
            </div>
            <div className="text-white text-sm font-semibold">{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
};
