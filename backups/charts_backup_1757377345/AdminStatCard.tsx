import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
	title: string;
	value: string | number;
	icon: LucideIcon;
	change?: {
		value: number;
		type: 'increase' | 'decrease';
		period: string;
	};
	subtitle?: string;
	loading?: boolean;
	className?: string;
}

const AdminStatCard: React.FC<StatCardProps> = ({
	title,
	value,
	icon: Icon,
	change,
	subtitle,
	loading = false,
	className = ''
}) => {
	if (loading) {
		return (
			<div className={`bg-gray-900/60 border border-orange-500/30 rounded-xl p-6 ${className}`}>
				<div className="animate-pulse">
					<div className="flex items-center justify-between mb-4">
						<div className="h-4 bg-gray-700 rounded w-1/2"></div>
						<div className="h-8 w-8 bg-gray-700 rounded"></div>
					</div>
					<div className="h-8 bg-gray-700 rounded w-3/4 mb-2"></div>
					<div className="h-3 bg-gray-700 rounded w-1/2"></div>
				</div>
			</div>
		);
	}

	return (
		<div className={`bg-gray-900/60 border border-orange-500/30 rounded-xl p-6 hover:bg-gray-900/80 transition-all duration-200 ${className}`}>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-sm font-medium text-gray-400 uppercase tracking-wide">{title}</h3>
				<div className="p-2 bg-orange-500/20 rounded-lg">
					<Icon className="h-5 w-5 text-orange-500" />
				</div>
			</div>
      
			<div className="space-y-2">
				<p className="text-2xl font-bold text-white">{value}</p>
        
				{subtitle && (
					<p className="text-sm text-gray-400">{subtitle}</p>
				)}
        
				{change && (
					<div className="flex items-center space-x-1">
						<span className={`text-sm font-medium ${
							change.type === 'increase' ? 'text-green-400' : 'text-red-400'
						}`}>
							{change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
						</span>
						<span className="text-xs text-gray-500">{change.period}</span>
					</div>
				)}
			</div>
		</div>
	);
};

export default AdminStatCard;
