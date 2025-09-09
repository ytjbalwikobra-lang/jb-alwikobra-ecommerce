// Admin charts barrel clean
export { default as StatCard } from './StatCard';
export { default as DailyOrdersChart } from './DailyOrdersChart';
export { default as StatusDistributionChart } from './StatusDistributionChart';
export interface ChartData { date:string; orders:number; revenue:number;}
export interface StatusData { status:string; count:number; color:string;}
export interface StatCardData { title:string; value:string|number; change?:{value:number; type:'increase'|'decrease'; period:string}; subtitle?:string;}
