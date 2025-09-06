import React, { useEffect, useState, useCallback } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Zap, Calendar, BarChart3, PieChart, ArrowUpRight, ArrowDownRight, RefreshCw } from 'lucide-react';
import { clientCache } from '../../services/clientCacheService.ts';

// Simple cache untuk optimasi
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

interface DashboardData {
  orders: { count: number; revenue: number };
  users: number;
  products: number;
  flashSales: number;
  analytics?: {
    statusDistribution: Record<string, number>;
    dailyRevenue: Array<{date: string; revenue: number; orders: number}>;
    monthlyOrders: number;
    monthlyRevenue: number;
  };
}

const StatCard: React.FC<{ 
  label: string; 
  value: string; 
  hint?: string; 
  icon?: React.ReactNode;
  color?: string;
  trend?: { value: number; label: string };
  loading?: boolean;
}> = ({ label, value, hint, icon, color = 'pink', trend, loading = false }) => (
  <div className="admin-card">
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm font-semibold text-gray-300">{label}</div>
      {icon && <div className="text-pink-400">{icon}</div>}
    </div>
    
    {loading ? (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
      </div>
    ) : (
      <>
        <div className="text-3xl font-bold text-white mb-2">{value}</div>
        {trend && (
          <div className={`text-sm flex items-center gap-1 font-medium ${
            trend.value >= 0 ? 'text-green-400' : 'text-red-400'
          }`}>
            {trend.value >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
            <span>{Math.abs(trend.value)}% {trend.label}</span>
          </div>
        )}
        {hint && <div className="text-sm mt-1 text-gray-400">{hint}</div>}
      </>
    )}
  </div>
);

const SimpleChart: React.FC<{ 
  data: Array<{date: string; revenue: number; orders: number}>; 
  title: string 
}> = ({ data, title }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div className="admin-card">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-pink-400" />
        {title}
      </h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="font-semibold text-gray-300">
                {new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <span className="text-white font-semibold">
                {item.orders} pesanan • Rp {item.revenue.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="w-full rounded-full h-4 bg-gray-700 border border-gray-600">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-4 rounded-full transition-all duration-700 ease-out shadow-sm" 
                style={{ width: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatusChart: React.FC<{ data: Record<string, number> }> = ({ data }) => {
  const total = Object.values(data).reduce((sum, count) => sum + count, 0);
  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-900/50 text-yellow-300 border border-yellow-700',
    paid: 'bg-green-900/50 text-green-300 border border-green-700',
    completed: 'bg-blue-900/50 text-blue-300 border border-blue-700',
    cancelled: 'bg-red-900/50 text-red-300 border border-red-700'
  };
  
  const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    paid: 'Dibayar',
    completed: 'Selesai',
    cancelled: 'Dibatalkan'
  };

  return (
    <div className="admin-card">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-pink-400" />
        Status Pesanan (7 Hari)
      </h3>
      <div className="space-y-4">
        {Object.entries(data).map(([status, count]) => (
          <div key={status} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 border border-gray-700">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[status] || 'bg-gray-700 text-gray-300 border border-gray-600'}`}>
                {statusLabels[status] || status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-white">{count}</div>
              <div className="text-sm text-gray-400">
                {total > 0 ? Math.round((count / total) * 100) : 0}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({
    orders: { count: 0, revenue: 0 },
    users: 0,
    products: 0,
    flashSales: 0
  });
  const [loading, setLoading] = useState({ basic: true, analytics: true });
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
        dataCache.clear();
      }
      
      setLoading({ basic: true, analytics: true });
      
      // Fetch basic stats dengan cache 1 menit
      const basicData = await clientCache.get(
        'dashboard-basic-stats',
        async () => {
          const response = await fetch('/api/admin?action=dashboard');
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          const result = await response.json();
          if (!result.success) throw new Error(result.error);
          return {
            orders: result.data.orders || { count: 0, revenue: 0 },
            users: result.data.users || 0,
            products: result.data.products || 0,
            flashSales: result.data.flashSales || 0
          };
        },
        60000 // 1 menit cache
      );
      
      setData(prevData => ({ ...prevData, ...basicData }));
      setLoading(prev => ({ ...prev, basic: false }));
      
      // Kemudian fetch analytics dengan cache 5 menit
      try {
        const analytics = await clientCache.get(
          'dashboard-analytics',
          async () => {
            const response = await fetch('/api/admin?action=dashboard');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            return result.data.analytics;
          },
          300000 // 5 menit cache
        );
        
        if (analytics) {
          setData(prevData => ({ ...prevData, analytics }));
        }
      } catch (error) {
        console.warn('Analytics fetch failed:', error);
      } finally {
        setLoading(prev => ({ ...prev, analytics: false }));
      }
      
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      setData({
        orders: { count: 0, revenue: 0 },
        users: 0,
        products: 0,
        flashSales: 0
      });
      setLoading({ basic: false, analytics: false });
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
    
    // Refresh basic stats setiap 2 menit
    const basicInterval = setInterval(() => {
      if (!refreshing) {
        getCachedData(
          'basic-stats',
          async () => {
            const response = await fetch('/api/admin?action=dashboard');
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const result = await response.json();
            if (!result.success) throw new Error(result.error);
            return {
              orders: result.data.orders || { count: 0, revenue: 0 },
              users: result.data.users || 0,
              products: result.data.products || 0,
              flashSales: result.data.flashSales || 0
            };
          },
          60000
        ).then(basicData => {
          setData(prevData => ({ ...prevData, ...basicData }));
        }).catch(console.error);
      }
    }, 120000);
    
    return () => {
      clearInterval(basicInterval);
    };
  }, [fetchDashboardData, refreshing]);

  if (loading.basic) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
        </div>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="admin-card h-32">
                <div className="h-4 bg-gray-700 rounded mb-4"></div>
                <div className="h-8 bg-gray-700 rounded mb-2"></div>
                <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header dengan refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">Dashboard Admin</h1>
          <p className="text-gray-400">Kelola toko online JB Alwikobra dengan mudah</p>
        </div>
        <button
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
          className={`admin-button flex items-center gap-2 ${refreshing ? 'opacity-50' : ''}`}
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <StatCard 
          label="Produk Aktif" 
          value={String(data.products)} 
          hint="Total produk tersedia"
          icon={<ShoppingBag className="w-6 h-6" />}
          color="blue"
          loading={loading.basic}
        />
        <StatCard 
          label="Flash Sale Aktif" 
          value={String(data.flashSales)} 
          hint="Sedang berlangsung"
          icon={<Zap className="w-6 h-6" />}
          color="yellow"
          loading={loading.basic}
        />
        <StatCard 
          label="Pesanan 7 Hari" 
          value={String(data.orders.count)} 
          hint="Pesanan baru"
          icon={<Calendar className="w-6 h-6" />}
          color="green"
          loading={loading.basic}
        />
        <StatCard 
          label="Pendapatan 7 Hari" 
          value={`Rp ${data.orders.revenue.toLocaleString('id-ID')}`}
          hint="Total revenue"
          icon={<DollarSign className="w-6 h-6" />}
          color="pink"
          loading={loading.basic}
        />
        <StatCard 
          label="Rata-rata Pesanan" 
          value={`Rp ${((data.orders as any).averageValue || 0).toLocaleString('id-ID')}`}
          hint="Nilai rata-rata per pesanan"
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
          loading={loading.basic}
        />
      </div>

      {/* Analytics Section - dengan loading terpisah */}
      {loading.analytics ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="admin-card h-32">
              <div className="h-4 bg-gray-700 rounded mb-4"></div>
              <div className="h-8 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
            <div className="admin-card h-32">
              <div className="h-4 bg-gray-700 rounded mb-4"></div>
              <div className="h-8 bg-gray-700 rounded mb-2"></div>
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="admin-card h-96">
              <div className="h-6 bg-gray-700 rounded mb-6"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-8 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
            <div className="admin-card h-96">
              <div className="h-6 bg-gray-700 rounded mb-6"></div>
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-700 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : data.analytics && (
        <>
          {/* Monthly Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard 
              label="Total Pengguna" 
              value={String(data.users)} 
              hint="Pengguna terdaftar"
              icon={<Users className="w-6 h-6" />}
              color="purple"
            />
            <StatCard 
              label="Pesanan 30 Hari" 
              value={String(data.analytics.monthlyOrders)} 
              hint={`Pendapatan: Rp ${data.analytics.monthlyRevenue.toLocaleString('id-ID')}`}
              icon={<TrendingUp className="w-6 h-6" />}
              color="indigo"
            />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SimpleChart 
              data={data.analytics.dailyRevenue} 
              title="Pendapatan Harian (7 Hari Terakhir)" 
            />
            <StatusChart data={data.analytics.statusDistribution} />
          </div>

          {/* Performance Insights */}
          <div className="admin-card">
            <h3 className="text-lg font-semibold text-white mb-6">💡 Insight Performa</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <div className="text-green-400 font-semibold mb-2">Rata-rata Pesanan/Hari</div>
                <div className="text-2xl font-bold text-white">
                  {data.analytics.dailyRevenue.length > 0 
                    ? Math.round(data.orders.count / 7) 
                    : 0} pesanan
                </div>
              </div>
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <div className="text-blue-400 font-semibold mb-2">Rata-rata Nilai Pesanan</div>
                <div className="text-2xl font-bold text-white">
                  Rp {data.orders.count > 0 
                    ? Math.round(data.orders.revenue / data.orders.count).toLocaleString('id-ID')
                    : 0}
                </div>
              </div>
              <div className="bg-purple-900/30 border border-purple-700 rounded-lg p-4">
                <div className="text-purple-400 font-semibold mb-2">Growth Rate</div>
                <div className="text-2xl font-bold text-white">
                  {data.analytics.monthlyOrders > 0 && data.orders.count > 0
                    ? `${Math.round(((data.orders.count / 7 * 30) / data.analytics.monthlyOrders - 1) * 100)}%`
                    : 'N/A'
                  }
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
