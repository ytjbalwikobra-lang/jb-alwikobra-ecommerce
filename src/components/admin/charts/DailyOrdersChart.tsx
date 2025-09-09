import React, { useState } from 'react';

interface ChartData { date: string; orders: number; revenue: number; }
interface Props { data: ChartData[]; loading?: boolean; className?: string; }

const DailyOrdersChart: React.FC<Props> = ({ data, loading = false, className = '' }) => {
  const [hover, setHover] = useState<number | null>(null);
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
  const max = Math.max(...data.map(d => d.orders), 1);
  const H = 200;
  const W = data.length * 60;
  const fmt = (s: string) => new Date(s).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
  const fmtCur = (v: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(v);
  return (
    <div className={`bg-gray-900/60 border border-orange-500/30 rounded-xl p-6 ${className}`}>
      <div className='mb-6'>
        <h3 className='text-lg font-semibold text-white mb-1'>Daily Orders</h3>
        <p className='text-sm text-gray-400'>Order trends (7 days)</p>
      </div>
      <div className='relative h-64'>
        <svg className='w-full h-full' viewBox={`0 0 ${W} ${H + 60}`}>
          {[0, 25, 50, 75, 100].map(p => (
            <line key={p} x1={0} y1={H * (p / 100)} x2={W} y2={H * (p / 100)} stroke='#374151' strokeDasharray='2,2' strokeWidth={1} />
          ))}
          {data.map((d, i) => {
            const h = (d.orders / max) * H;
            const x = i * 60 + 10;
            const y = H - h;
            return (
              <g key={i}>
                <rect x={x} y={y} width={40} height={h} fill={hover === i ? '#FB923C' : '#F97316'} rx={4} className='transition-colors duration-200 cursor-pointer' onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(null)} />
                <text x={x + 20} y={H + 20} textAnchor='middle' className='fill-gray-400 text-xs'>{fmt(d.date)}</text>
                <text x={x + 20} y={y - 8} textAnchor='middle' className='fill-white text-xs font-medium'>{d.orders}</text>
              </g>
            );
          })}
        </svg>
        {hover !== null && (
          <div className='absolute z-10 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg pointer-events-none' style={{ left: `${((hover * 60 + 30) / W) * 100}%`, top: '10px', transform: 'translateX(-50%)' }}>
            <div className='text-sm text-white'>
              <div className='font-medium'>{fmt(data[hover].date)}</div>
              <div className='text-orange-400'>{data[hover].orders} orders</div>
              <div className='text-green-400'>{fmtCur(data[hover].revenue)}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default DailyOrdersChart;
