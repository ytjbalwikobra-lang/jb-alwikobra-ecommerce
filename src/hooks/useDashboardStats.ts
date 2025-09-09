import { useState, useEffect, useCallback } from 'react';
import { adminService } from '../services/adminService';
import { TimePeriod } from '../components/admin/dashboard/TimePeriodFilter';

// Simple in-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getDateRange = (period: TimePeriod) => {
    const end = new Date();
    let start = new Date();

    switch (period) {
        case '7d':
            start.setDate(end.getDate() - 7);
            break;
        case '30d':
            start.setMonth(end.getMonth() - 1);
            break;
        case '90d':
            start.setMonth(end.getMonth() - 3);
            break;
        case '1y':
            start.setFullYear(end.getFullYear() - 1);
            break;
        case 'weekly':
            start.setDate(end.getDate() - 7);
            break;
        case 'monthly':
            start.setMonth(end.getMonth() - 1);
            break;
        case 'yearly':
            start.setFullYear(end.getFullYear() - 1);
            break;
        case 'all':
            start = new Date(0); // The beginning of time
            break;
    }
    return { start: start.toISOString(), end: end.toISOString() };
}

export const useDashboardStats = () => {
  const [period, setPeriod] = useState<TimePeriod>('monthly');
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    const range = getDateRange(period);
    const cacheKey = `dashboard-stats-${period}`;
    const now = Date.now();

    if (!forceRefresh && cache.has(cacheKey)) {
        const cached = cache.get(cacheKey)!;
        if (now - cached.timestamp < CACHE_TTL) {
            setStats(cached.data);
            setLoading(false);
            return;
        }
    }

    try {
      const result = await adminService.getDashboardStats(range);
      if (result.success) {
        setStats(result.data);
        cache.set(cacheKey, { data: result.data, timestamp: Date.now() });
      } else {
        throw new Error('Failed to fetch dashboard stats');
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const refresh = () => {
    fetchStats(true);
  };

  return { stats, loading, error, period, setPeriod, refresh };
};
