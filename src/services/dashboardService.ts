// Optimized Dashboard Data Service
export class DashboardService {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number }>();
  
  // Cache TTL dalam ms
  private static readonly CACHE_TTL = {
    stats: 60000,      // 1 menit untuk stats dasar
    analytics: 300000, // 5 menit untuk analytics
    charts: 180000     // 3 menit untuk chart data
  };

  // Get data dengan caching
  private static async getCachedData<T>(
    key: string, 
    fetcher: () => Promise<T>, 
    ttl: number
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    
    if (cached && (now - cached.timestamp) < cached.ttl) {
      return cached.data;
    }
    
    try {
      const data = await fetcher();
      this.cache.set(key, { data, timestamp: now, ttl });
      return data;
    } catch (error) {
      // Jika ada cache lama, gunakan itu
      if (cached) {
        console.warn(`Using stale cache for ${key}:`, error);
        return cached.data;
      }
      throw error;
    }
  }

  // Fetch basic stats (cepat)
  static async getBasicStats() {
    return this.getCachedData(
      'basic-stats',
      async () => {
        const response = await fetch('/api/admin?action=basic-stats');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.data;
      },
      this.CACHE_TTL.stats
    );
  }

  // Fetch analytics (lebih lambat)
  static async getAnalytics() {
    return this.getCachedData(
      'analytics',
      async () => {
        const response = await fetch('/api/admin?action=analytics');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.data;
      },
      this.CACHE_TTL.analytics
    );
  }

  // Fetch chart data
  static async getChartData() {
    return this.getCachedData(
      'chart-data',
      async () => {
        const response = await fetch('/api/admin?action=chart-data');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        return result.data;
      },
      this.CACHE_TTL.charts
    );
  }

  // Fetch semua data secara paralel dengan prioritas
  static async getDashboardData() {
    try {
      // 1. Load basic stats dulu (paling cepat)
      const basicStats = await this.getBasicStats();
      
      // 2. Load analytics dan charts secara paralel
      const [analytics, chartData] = await Promise.allSettled([
        this.getAnalytics(),
        this.getChartData()
      ]);

      return {
        ...basicStats,
        analytics: analytics.status === 'fulfilled' ? analytics.value : null,
        chartData: chartData.status === 'fulfilled' ? chartData.value : null
      };
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      throw error;
    }
  }

  // Clear cache (untuk refresh manual)
  static clearCache() {
    this.cache.clear();
  }

  // Clear specific cache
  static clearCacheKey(key: string) {
    this.cache.delete(key);
  }
}
