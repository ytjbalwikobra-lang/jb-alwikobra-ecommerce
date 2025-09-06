import React, { useEffect, useState } from 'react';
import { TrendingUp, DollarSign, ShoppingBag, Users, Zap, Calendar, BarChart3, PieChart, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="text-sm font-medium text-gray-600">{label}</div>
      {icon && <div className={`text-${color}-400`}>{icon}</div>}
    </div>
    <div className="text-2xl font-bold text-gray-900 mb-2">{value}</div>
    {trend && (
      <div className={`text-sm flex items-center gap-1 ${trend.value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {trend.value >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
        <span>{Math.abs(trend.value)}% {trend.label}</span>
      </div>
    )}
    {hint && <div className="text-sm text-gray-500 mt-1">{hint}</div>}
  </div>
);

const SimpleChart: React.FC<{ 
  data: Array<{date: string; revenue: number; orders: number}>; 
  title: string 
}> = ({ data, title }) => {
  const maxRevenue = Math.max(...data.map(d => d.revenue));
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-pink-500" />
        {title}
      </h3>
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 font-medium">
                {new Date(item.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
              </span>
              <span className="text-gray-900 font-medium">
                {item.orders} pesanan • Rp {item.revenue.toLocaleString('id-ID')}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-pink-500 to-purple-500 h-3 rounded-full transition-all duration-700 ease-out" 
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
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-green-100 text-green-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  
  const statusLabels: Record<string, string> = {
    pending: 'Menunggu',
    paid: 'Dibayar',
    completed: 'Selesai',
    cancelled: 'Dibatalkan'
  };

  return (
    <div className="bg-gray-900 rounded-xl shadow-sm border border-pink-500/30 p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-pink-400" />
        Status Pesanan (7 Hari)
      </h3>
      <div className="space-y-4">
        {Object.entries(data).map(([status, count]) => (
          <div key={status} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-3">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-700 text-gray-300 border border-gray-600'}`}>
                {statusLabels[status] || status}
              </span>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-white">{count}</div>
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
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
      <div className="space-y-6">
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-200 rounded-xl"></div>
            <div className="h-96 bg-gray-200 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl text-white p-6">
        <h1 className="text-2xl font-bold mb-2">Selamat Datang di Dashboard Admin</h1>
        <p className="text-pink-100">Kelola toko online JB Alwikobra dengan mudah</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Produk Aktif" 
          value={String(data.products)} 
          hint="Total produk tersedia"
          icon={<ShoppingBag className="w-6 h-6" />}
          color="blue"
        />
        <StatCard 
          label="Flash Sale Aktif" 
          value={String(data.flashSales)} 
          hint="Sedang berlangsung"
          icon={<Zap className="w-6 h-6" />}
          color="yellow"
        />
        <StatCard 
          label="Pesanan 7 Hari" 
          value={String(data.orders.count)} 
          hint="Pesanan baru"
          icon={<Calendar className="w-6 h-6" />}
          color="green"
        />
        <StatCard 
          label="Pendapatan 7 Hari" 
          value={`Rp ${data.orders.revenue.toLocaleString('id-ID')}`}
          hint="Total revenue"
          icon={<DollarSign className="w-6 h-6" />}
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
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">💡 Insight Performa</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-700 font-semibold mb-2">Rata-rata Pesanan/Hari</div>
                <div className="text-2xl font-bold text-green-900">
                  {data.analytics.dailyRevenue.length > 0 
                    ? Math.round(data.orders.count / 7) 
                    : 0} pesanan
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="text-blue-700 font-semibold mb-2">Rata-rata Nilai Pesanan</div>
                <div className="text-2xl font-bold text-blue-900">
                  Rp {data.orders.count > 0 
                    ? Math.round(data.orders.revenue / data.orders.count).toLocaleString('id-ID')
                    : 0}
                </div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="text-purple-700 font-semibold mb-2">Growth Rate</div>
                <div className="text-2xl font-bold text-purple-900">
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
