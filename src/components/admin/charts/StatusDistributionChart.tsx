import React from 'react';

interface StatusData { status: string; count: number; color: string; }
interface Props { data: StatusData[]; loading?: boolean; className?: string; }

const StatusDistributionChart: React.FC<Props> = ({ data, loading = false, className = '' }) => {
  if (loading) {
    return (
      <div className={`bg-gray-900/60 border border-orange-500/30 rounded-xl p-6 ${className}`}>
        <div className='animate-pulse'>
          <div className='h-6 bg-gray-700 rounded w-1/3 mb-4' />
          <div className='h-64 bg-gray-700 rounded' />
        </div>
      </div>
    );
  }
  const total = data.reduce((s, d) => s + d.count, 0) || 1;
  const r = 90, cx = 100, cy = 100;
  let acc = 0;
  const segments = data.map(d => {
    const start = (acc / total) * 2 * Math.PI; acc += d.count; const end = (acc / total) * 2 * Math.PI;
    const x1 = cx + r * Math.sin(start), y1 = cy - r * Math.cos(start), x2 = cx + r * Math.sin(end), y2 = cy - r * Math.cos(end);
    const large = end - start > Math.PI ? 1 : 0;
    return { ...d, path: `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z` };
  });
  return (
    <div className={`bg-gray-900/60 border border-orange-500/30 rounded-xl p-6 ${className}`}>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-white mb-1'>Order Status Distribution</h3>
        <p className='text-sm text-gray-400'>Proportion of orders</p>
      </div>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='flex items-center justify-center'>
          <svg viewBox='0 0 200 200' className='w-64 h-64'>
            {segments.map((s, i) => <path key={i} d={s.path} fill={s.color} stroke='#1F2937' strokeWidth={2} className='opacity-90 hover:opacity-100 transition-opacity' />)}
            <circle cx={cx} cy={cy} r={50} fill='#111827' />
            <text x={cx} y={cy} textAnchor='middle' className='fill-white text-lg font-semibold'>{total}</text>
            <text x={cx} y={cy + 20} textAnchor='middle' className='fill-gray-400 text-xs'>orders</text>
          </svg>
        </div>
        <div className='space-y-4'>
          {data.map((d, i) => {
            const pct = ((d.count / total) * 100).toFixed(1);
            return (
              <div key={i} className='flex items-center justify-between'>
                <div className='flex items-center space-x-3'>
                  <div className='w-3 h-3 rounded-full' style={{ background: d.color }} />
                  <span className='text-sm text-gray-300 capitalize'>{d.status}</span>
                </div>
                <div className='flex items-center space-x-4'>
                  <span className='text-sm font-medium text-white'>{d.count}</span>
                  <span className='text-sm text-gray-400'>{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default StatusDistributionChart;
