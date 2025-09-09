// Neutralized backup dashboard file. Original content removed intentionally.
export {};

import React, { useEffect, useState, useCallback } from 'react';
import { 
  TrendingUp, DollarSign, ShoppingBag, Users, Zap, Calendar, BarChart3, 
  RefreshCw, Settings, Eye, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import { useToast } from '../../components/Toast';
// TEMP disable chart imports for build isolation
// import StatCard from '../../components/adminChartsNew/StatCard';
// import { TEST_RESOLVE } from '../../components/admin/charts/TestResolve';
// import DailyOrdersChart from '../../components/admin/charts/DailyOrdersChart';
// import StatusDistributionChart from '../../components/admin/charts/StatusDistributionChart';
import { AdminButton } from '../../components/admin/AdminButton';
import AdminCard from '../../components/admin/AdminCard';

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

interface ChartData {
  date: string;
  orders: number;
  revenue: number;
}

interface StatusData {
  status: string;
  count: number;
  color: string;
}

// Simple cache for optimizing API calls
const dataCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

const getCachedData = async <T,>(
  key: string, 
  fetcher: () => Promise<T>, 
  ttlMs: number = 60000
): Promise<T> => {
  const cached = dataCache.get(key);
  const now = Date.now();
  
  if (cached && (now - cached.timestamp) < cached.ttl) {
    return cached.data;
  }
  
  try {
    const data = await fetcher();
    dataCache.set(key, { data, timestamp: now, ttl: ttlMs });
    return data;
  } catch (error) {
    if (cached) {
      console.warn(`Using stale cache for ${key}:`, error);
      return cached.data;
    }
    throw error;
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
          // Neutralized backup file (original dashboard preserved in git history)
          export {};
          users: data.growth?.users || 0,
