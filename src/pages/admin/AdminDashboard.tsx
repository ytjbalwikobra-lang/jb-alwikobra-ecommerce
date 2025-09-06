import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Zap, Calendar, BarChart3, PieChart } from 'lucide-react';

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
}> = ({ label, value, hint, icon, color = 'pink', trend }) => (
  <div className={`bg-black/60 border border-${color}-500/30 rounded-xl p-4 hover:border-${color}-400/50 transition-colors`}>
    <div className="flex items-center justify-between mb-2">
      <div className="text-sm text-gray-400">{label}</div>
      {icon && <div className={`text-${color}-400`}>{icon}</div>}
    </div>
    <div className="text-2xl font-bold text-white mt-1">{value}</div>
    {trend && (
      <div className={`text-xs mt-1 flex items-center gap-1 ${trend.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
        <TrendingUp className="w-3 h-3" />
        <span>{trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}</span>
      </div>
    )}
    {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
  </div>
);

const SimpleChart: React.FC<{ 
  data: Array<{date: string; revenue: number; orders: number}>; 
  title: string 
}> = ({ data, title }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  const maxOrders = Math.max(...data.map(d => d.orders));
  
  return (
    <div className="bg-black/60 border border-pink-500/30 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-pink-400" />
        {title}
      </h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                {new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <span className="text-white">
                {item.orders} pesanan • Rp {item.revenue.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-2 rounded-full transition-all duration-500" 
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
    pending: 'text-yellow-400',
    paid: 'text-green-400',
    completed: 'text-blue-400',
    cancelled: 'text-red-400'
  };
  
  const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    paid: 'Dibayar',
    completed: 'Selesai',
    cancelled: 'Dibatalkan'
  };

  return (
    <div className="bg-black/60 border border-pink-500/30 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-pink-400" />
        Status Pesanan (7 Hari)
      </h3>
      <div className="space-y-3">
        {Object.entries(data).map(([status, count]) => (
          <div key={status} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${statusColors[status]?.replace('text-', 'bg-') || 'bg-gray-400'}`}></div>
              <span className="text-gray-300">{statusLabels[status] || status}</span>
            </div>
            <div className="text-right">
              <div className="text-white font-medium">{count}</div>
              <div className="text-xs text-gray-400">
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch dashboard data from consolidated admin API endpoint
        const response = await fetch('/api/admin?action=dashboard');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch dashboard data');
        }
        
        setData(result.data);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        // Set default values on error
        setData({
          orders: { count: 0, revenue: 0 },
          users: 0,
          products: 0,
          flashSales: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-700 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white mb-2">Dashboard Admin</h1>
        <p className="text-gray-400">Ringkasan data toko dan penjualan</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Produk Aktif" 
          value={String(data.products)} 
          hint="Total produk tersedia"
          icon={<ShoppingBag className="w-5 h-5" />}
          color="blue"
        />
        <StatCard 
          label="Flash Sale Aktif" 
          value={String(data.flashSales)} 
          hint="Sedang berlangsung"
          icon={<Zap className="w-5 h-5" />}
          color="yellow"
        />
        <StatCard 
          label="Pesanan 7 Hari" 
          value={String(data.orders.count)} 
          icon={<Calendar className="w-5 h-5" />}
          color="green"
        />
        <StatCard 
          label="Pendapatan 7 Hari" 
          value={`Rp ${data.orders.revenue.toLocaleString('id-ID')}`}
          icon={<DollarSign className="w-5 h-5" />}
          color="pink"
        />
      </div>

      {/* Analytics Section */}
      {data.analytics && (
        <>
          {/* Monthly Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatCard 
              label="Total Pengguna" 
              value={String(data.users)} 
              hint="Pengguna terdaftar"
              icon={<Users className="w-5 h-5" />}
              color="purple"
            />
            <StatCard 
              label="Pesanan 30 Hari" 
              value={String(data.analytics.monthlyOrders)} 
              hint={`Pendapatan: Rp ${data.analytics.monthlyRevenue.toLocaleString('id-ID')}`}
              icon={<TrendingUp className="w-5 h-5" />}
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
          <div className="bg-black/60 border border-pink-500/30 rounded-xl p-4">
            <h3 className="text-lg font-semibold text-white mb-4">💡 Insight Performa</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-3">
                <div className="text-green-400 font-medium mb-1">Rata-rata Pesanan/Hari</div>
                <div className="text-white text-lg">
                  {data.analytics.dailyRevenue.length > 0 
                    ? Math.round(data.orders.count / 7) 
                    : 0} pesanan
                </div>
              </div>
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3">
                <div className="text-blue-400 font-medium mb-1">Rata-rata Nilai Pesanan</div>
                <div className="text-white text-lg">
                  Rp {data.orders.count > 0 
                    ? Math.round(data.orders.revenue / data.orders.count).toLocaleString('id-ID')
                    : 0}
                </div>
              </div>
              <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3">
                <div className="text-purple-400 font-medium mb-1">Growth Rate</div>
                <div className="text-white text-lg">
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
