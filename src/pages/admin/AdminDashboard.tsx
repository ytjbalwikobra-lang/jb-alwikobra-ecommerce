import React, { useEffect, useState, useCallback } from 'react';
import {
  TrendingUp, DollarSign, ShoppingBag, Users, Zap,
  RefreshCw, Settings, Eye
} from 'lucide-react';

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-inferrable-types */
import { useToast } from '../../components/Toast';
import { AdminButton } from '../../components/admin/AdminButton';
import AdminCard from '../../components/admin/AdminCard';
// Import charts; include direct StatCard path to avoid any stale barrel resolution issues
import { DailyOrdersChart, StatusDistributionChart } from '../../components/admin/charts';
import StatCardComponent from '../../components/admin/charts/StatCard';

// Data interfaces
interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalUsers: number;
  totalProducts: number;
  activeFlashSales: number;
  monthlyGrowth: {
    orders: number;
    revenue: number;
    users: number;
  };
}

interface ChartData { date: string; orders: number; revenue: number; }
interface StatusData { status: string; count: number; color: string; }

// Simple cache for optimizing API calls
const dataCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const getCachedData = async <T,>(key: string, fetcher: () => Promise<T>, ttlMs: number = 60000): Promise<T> => {
  const cached = dataCache.get(key);
  const now = Date.now();
  if (cached && (now - cached.timestamp) < cached.ttl) return cached.data;
  try {
    const data = await fetcher();
    dataCache.set(key, { data, timestamp: now, ttl: ttlMs });
    return data;
  } catch (err) {
    if (cached) {
      console.warn('Using stale cache for', key, err);
      return cached.data;
    }
    throw err;
  }
};
const AdminDashboard: React.FC = () => {
  const { push } = useToast();
  
  // State management
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dailyData, setDailyData] = useState<ChartData[]>([]);
  const [statusData, setStatusData] = useState<StatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Format currency helper
  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  // Format number helper
  const formatNumber = useCallback((num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  }, []);

  // Load dashboard statistics
  const loadStats = useCallback(async () => {
    try {
      const data = await getCachedData('dashboard-stats', async () => {
        const response = await fetch('/api/admin?action=dashboard-stats');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to fetch stats');
        return result.data;
      });

      setStats({
        totalOrders: data.orders?.count || 0,
        totalRevenue: data.orders?.revenue || 0,
        totalUsers: data.users || 0,
        totalProducts: data.products || 0,
        activeFlashSales: data.flashSales || 0,
        monthlyGrowth: {
          orders: data.growth?.orders || 0,
          revenue: data.growth?.revenue || 0,
          users: data.growth?.users || 0,
        }
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      push(error instanceof Error ? error.message : 'Failed to load dashboard stats');
    }
  }, [push]);

  // Load daily orders chart data
  const loadDailyData = useCallback(async () => {
    try {
      const data = await getCachedData('daily-orders', async () => {
        const response = await fetch('/api/admin?action=daily-orders&days=7');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to fetch daily data');
        return result.data;
      });

      setDailyData(data.map((item: any) => ({
        date: item.date,
        orders: item.orders || 0,
        revenue: item.revenue || 0
      })));
    } catch (error) {
      console.error('Error loading daily data:', error);
    }
  }, []);

  // Load status distribution data
  const loadStatusData = useCallback(async () => {
    try {
      const data = await getCachedData('status-distribution', async () => {
        const response = await fetch('/api/admin?action=status-distribution');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error || 'Failed to fetch status data');
        return result.data;
      });

      const statusColors: Record<string, string> = {
        pending: '#F59E0B',
        paid: '#10B981',
        completed: '#3B82F6',
        cancelled: '#EF4444'
      };

      setStatusData(Object.entries(data.statusDistribution || {}).map(([status, count]) => ({
        status,
        count: count as number,
        color: statusColors[status] || '#6B7280'
      })));
    } catch (error) {
      console.error('Error loading status data:', error);
    }
  }, []);

  // Load all dashboard data
  const loadDashboardData = useCallback(async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    else setLoading(true);

    try {
      await Promise.all([
        loadStats(),
        loadDailyData(),
        loadStatusData()
      ]);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadStats, loadDailyData, loadStatusData]);

  // Refresh data
  const handleRefresh = useCallback(() => {
    // Clear cache for fresh data
    dataCache.clear();
    loadDashboardData(true);
  }, [loadDashboardData]);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Auto-refresh every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        handleRefresh();
      }
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [handleRefresh]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back, admin!</p>
        </div>
        
        <div className="flex items-center space-x-3">
          {lastUpdated && (
            <span className="text-sm text-gray-500">
              Last updated: {lastUpdated.toLocaleTimeString('id-ID')}
            </span>
          )}
          <AdminButton
            variant="secondary"
            size="sm"
            icon={<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            Refresh
          </AdminButton>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCardComponent title="Total Orders" value={stats ? formatNumber(stats.totalOrders) : 0} icon={ShoppingBag} loading={loading} change={stats?.monthlyGrowth.orders ? { value: stats.monthlyGrowth.orders, type: stats.monthlyGrowth.orders >=0 ? 'increase':'decrease', period:'this month'}:undefined} />
        <StatCardComponent title="Total Revenue" value={stats ? formatCurrency(stats.totalRevenue) : 0} icon={DollarSign} loading={loading} change={stats?.monthlyGrowth.revenue ? { value: Math.abs(stats.monthlyGrowth.revenue), type: stats.monthlyGrowth.revenue >=0 ? 'increase':'decrease', period:'this month'}:undefined} />
        <StatCardComponent title="Total Users" value={stats ? formatNumber(stats.totalUsers) : 0} icon={Users} loading={loading} change={stats?.monthlyGrowth.users ? { value: stats.monthlyGrowth.users, type: stats.monthlyGrowth.users >=0 ? 'increase':'decrease', period:'this month'}:undefined} />
        <StatCardComponent title="Active Flash Sales" value={stats?.activeFlashSales || 0} icon={Zap} loading={loading} subtitle={`${stats?.totalProducts || 0} total products`} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DailyOrdersChart 
          data={dailyData} 
          loading={loading}
          className="lg:col-span-1"
        />
        
        <StatusDistributionChart 
          data={statusData} 
          loading={loading}
          className="lg:col-span-1"
        />
      </div>

      {/* Quick Actions */}
      <AdminCard
        title="Quick Actions"
        subtitle="Common admin tasks"
        className="lg:col-span-2"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <AdminButton
            variant="ghost"
            className="h-20 flex-col"
            onClick={() => window.location.href = '/admin/orders'}
          >
            <Eye className="h-6 w-6 mb-2" />
            View Orders
          </AdminButton>
          
          <AdminButton
            variant="ghost"
            className="h-20 flex-col"
            onClick={() => window.location.href = '/admin/products'}
          >
            <ShoppingBag className="h-6 w-6 mb-2" />
            Manage Products
          </AdminButton>
          
          <AdminButton
            variant="ghost"
            className="h-20 flex-col"
            onClick={() => window.location.href = '/admin/flash-sales'}
          >
            <Zap className="h-6 w-6 mb-2" />
            Flash Sales
          </AdminButton>
          
          <AdminButton
            variant="ghost"
            className="h-20 flex-col"
            onClick={() => window.location.href = '/admin/settings'}
          >
            <Settings className="h-6 w-6 mb-2" />
            Settings
          </AdminButton>
        </div>
      </AdminCard>
    </div>
  );
};

export default AdminDashboard;
