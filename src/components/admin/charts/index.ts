// Admin charts barrel (recreated clean)
export { default as StatCard } from './StatCard';
export { default as DailyOrdersChart } from './DailyOrdersChart';
export { default as StatusDistributionChart } from './StatusDistributionChart';

export interface ChartData { date: string; orders: number; revenue: number; }
export interface StatusData { status: string; count: number; color: string; }
export interface StatCardChange { value: number; type: 'increase' | 'decrease'; period: string; }
export interface StatCardData { title: string; value: string | number; change?: StatCardChange; subtitle?: string; }
