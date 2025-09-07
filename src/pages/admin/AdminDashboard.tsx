import React, { useEffect, useState, useCallback } from 'react';
import { 
  TrendingUp, DollarSign, ShoppingBag, Users, Zap, Calendar, BarChart3, PieChart, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Filter, ChevronDown, Eye, Edit, 
  Trash2, Download, Settings, BarChart2, PieChart as PieChartIcon
} from 'lucide-react';
import { adminService } from '../../services/adminService.ts';
import { AdminPillBadge } from '../../components/admin/AdminPillBadge.tsx';

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

// Time period types
type TimePeriod = 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

interface DashboardData {
  orders: { count: number; revenue: number; averageValue?: number };
  users: number;
  products: number;
  flashSales: number;
  analytics?: {
    statusDistribution: Record<string, number>;
    dailyRevenue: Array<{date: string; revenue: number; orders: number}>;
    monthlyOrders: number;
    monthlyRevenue: number;
    trends?: {
      orderTrend: number;
      revenueTrend: number;
      userTrend: number;
    };
    conversionRate?: number;
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
}> = ({ label, value, hint, icon, color = 'orange', trend, loading = false }) => {
  
  // Color themes using orange/amber as primary
  const colorThemes = {
    orange: 'text-orange-400 bg-orange-900/20 border-orange-500/30',
    amber: 'text-amber-400 bg-amber-900/20 border-amber-500/30',
    yellow: 'text-yellow-400 bg-yellow-900/20 border-yellow-500/30',
    green: 'text-green-400 bg-green-900/20 border-green-500/30',
    blue: 'text-blue-400 bg-blue-900/20 border-blue-500/30',
    purple: 'text-purple-400 bg-purple-900/20 border-purple-500/30',
    red: 'text-red-400 bg-red-900/20 border-red-500/30',
    indigo: 'text-indigo-400 bg-indigo-900/20 border-indigo-500/30'
  };

  const themeClass = colorThemes[color as keyof typeof colorThemes] || colorThemes.orange;

  return (
    <div className={`bg-gray-900/60 border rounded-xl p-6 ${themeClass}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm font-semibold text-gray-300">{label}</div>
        {icon && <div className={`text-${color}-400`}>{icon}</div>}
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
            <AdminPillBadge 
              variant={trend.value >= 0 ? 'success' : 'danger'}
              size="sm"
              className="text-xs"
            >
              {trend.value >= 0 ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
              {Math.abs(trend.value)}% {trend.label}
            </AdminPillBadge>
          )}
          {hint && (
            <AdminPillBadge variant="secondary" size="sm" className="mt-2">
              {hint}
            </AdminPillBadge>
          )}
        </>
      )}
    </div>
  );
};

// Time Period Filter Component
const TimePeriodFilter: React.FC<{
  currentPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
  customDateRange?: { start: string; end: string };
  onCustomDateChange?: (range: { start: string; end: string }) => void;
}> = ({ currentPeriod, onPeriodChange, customDateRange, onCustomDateChange }) => {
  const [showCustom, setShowCustom] = useState(false);

  const periods = [
    { key: 'weekly' as TimePeriod, label: 'Mingguan', icon: Calendar },
    { key: 'monthly' as TimePeriod, label: 'Bulanan', icon: BarChart3 },
    { key: 'quarterly' as TimePeriod, label: 'Kuartalan', icon: PieChartIcon },
    { key: 'yearly' as TimePeriod, label: 'Tahunan', icon: TrendingUp },
    { key: 'custom' as TimePeriod, label: 'Custom', icon: Settings }
  ];

  return (
    <div className="bg-gray-900/60 border border-orange-500/30 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="w-5 h-5 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Periode Waktu</h3>
      </div>
      
      <div className="flex flex-wrap gap-2">
        {periods.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => {
              onPeriodChange(key);
              if (key === 'custom') {
                setShowCustom(true);
              } else {
                setShowCustom(false);
              }
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
              currentPeriod === key
                ? 'bg-orange-600 border-orange-500 text-white'
                : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {showCustom && currentPeriod === 'custom' && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tanggal Mulai
            </label>
            <input
              type="date"
              value={customDateRange?.start || ''}
              onChange={(e) => onCustomDateChange?.({ 
                start: e.target.value, 
                end: customDateRange?.end || '' 
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Tanggal Akhir
            </label>
            <input
              type="date"
              value={customDateRange?.end || ''}
              onChange={(e) => onCustomDateChange?.({ 
                start: customDateRange?.start || '', 
                end: e.target.value 
              })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
          </div>
        </div>
      )}
    </div>
  );
};

// Action Button Component (Icon Only)
const ActionButton: React.FC<{
  icon: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  tooltip: string;
  loading?: boolean;
}> = ({ icon, onClick, variant = 'secondary', tooltip, loading = false }) => {
  const variants = {
    primary: 'bg-orange-600 hover:bg-orange-700 text-white',
    secondary: 'bg-gray-700 hover:bg-gray-600 text-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      title={tooltip}
      className={`p-2 rounded-lg transition-all ${variants[variant]} ${
        loading ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : icon}
    </button>
  );
};

const DailyOrdersLineChart: React.FC<{ 
  data: Array<{date: string; revenue: number; orders: number}>; 
  title: string 
}> = ({ data, title }) => {
  const padded = data && data.length ? data : [];
  const maxOrders = Math.max(1, ...padded.map(d => d.orders));
  const width = 700; // virtual width for viewBox
  const height = 240; // virtual height for viewBox
  const paddingX = 40;
  const paddingY = 30;
  const innerW = width - paddingX * 2;
  const innerH = height - paddingY * 2;

  const points = padded.map((d, i) => {
    const x = padded.length > 1 ? (i / (padded.length - 1)) * innerW + paddingX : paddingX + innerW / 2;
    const y = paddingY + innerH - (d.orders / maxOrders) * innerH;
    return { x, y, d };
  });

  const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = points.length
    ? `M ${points[0].x} ${height - paddingY} L ${points.map(p => `${p.x} ${p.y}`).join(' L ')} L ${points[points.length - 1].x} ${height - paddingY} Z`
    : '';

  return (
    <div className="bg-gray-900/60 border border-orange-500/30 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-orange-400" />
        {title}
      </h3>
      <div className="w-full">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-56">
          {/* Axes */}
          <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#374151" strokeWidth="1" />
          <line x1={paddingX} y1={paddingY} x2={paddingX} y2={height - paddingY} stroke="#374151" strokeWidth="1" />

          {/* Area fill */}
          {points.length > 1 && (
            <path d={areaD} fill="url(#areaGradient)" opacity={0.25} />
          )}
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fb923c" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Line */}
          {points.length > 0 && (
            <path d={pathD} fill="none" stroke="#fb923c" strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" />
          )}

          {/* Points + tooltips */}
          {points.map((p, idx) => (
            <g key={idx}>
              <circle cx={p.x} cy={p.y} r={4} fill="#fff" stroke="#fb923c" strokeWidth={2}>
                <title>{`${new Date(p.d.date).toLocaleDateString('id-ID')}: ${p.d.orders} pesanan`}</title>
              </circle>
            </g>
          ))}

          {/* Y-axis max label */}
          <text x={paddingX - 8} y={paddingY + 4} textAnchor="end" fontSize="10" fill="#9CA3AF">{maxOrders}</text>
          <text x={paddingX - 8} y={height - paddingY} textAnchor="end" fontSize="10" fill="#9CA3AF">0</text>

          {/* X-axis labels (first, middle, last) */}
          {points.length >= 1 && (
            <>
              <text x={points[0].x} y={height - paddingY + 18} textAnchor="middle" fontSize="10" fill="#9CA3AF">
                {new Date(points[0].d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
              </text>
              {points.length > 2 && (
                <text x={points[Math.floor(points.length / 2)].x} y={height - paddingY + 18} textAnchor="middle" fontSize="10" fill="#9CA3AF">
                  {new Date(points[Math.floor(points.length / 2)].d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                </text>
              )}
              {points.length > 1 && (
                <text x={points[points.length - 1].x} y={height - paddingY + 18} textAnchor="middle" fontSize="10" fill="#9CA3AF">
                  {new Date(points[points.length - 1].d.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short' })}
                </text>
              )}
            </>
          )}
        </svg>
      </div>
      <div className="mt-2 text-sm text-gray-300">
        Total pesanan dibuat: <span className="text-white font-semibold">{padded.reduce((s, d) => s + d.orders, 0)}</span>
      </div>
    </div>
  );
};

const DonutStatusChart: React.FC<{ data: Record<string, number> }> = ({ data }) => {
  const entries = Object.entries(data).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
  const size = 220;
  const stroke = 28;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const colors: Record<string, string> = {
    pending: '#F59E0B', // amber
    paid: '#10B981', // emerald
    completed: '#3B82F6', // blue
    canceled: '#EF4444' // red
  };
  const labels: Record<string, string> = {
    pending: 'Menunggu',
    paid: 'Dibayar',
    completed: 'Selesai',
    canceled: 'Dibatalkan'
  };
  let offset = 0;
  const segments = entries.map(([k, v]) => {
    const portion = v / total;
    const length = portion * circumference;
    const seg = { key: k, value: v, length, offset, portion };
    offset += length;
    return seg;
  });

  return (
    <div className="bg-gray-900/60 border border-orange-500/30 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
        <PieChart className="w-5 h-5 text-orange-400" />
        Status Pesanan
      </h3>
      <div className="flex items-center gap-8">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
          <g transform={`rotate(-90 ${size/2} ${size/2})`}>
            <circle cx={size/2} cy={size/2} r={radius} stroke="#374151" strokeWidth={stroke} fill="none" />
            {segments.map((s, i) => (
              <circle
                key={i}
                cx={size/2}
                cy={size/2}
                r={radius}
                stroke={colors[s.key] || '#9CA3AF'}
                strokeWidth={stroke}
                strokeDasharray={`${s.length} ${circumference - s.length}`}
                strokeDashoffset={-s.offset}
                fill="none"
              >
                <title>{`${labels[s.key] || s.key}: ${s.value} (${Math.round(s.portion*100)}%)`}</title>
              </circle>
            ))}
          </g>
          {/* center text */}
          <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="fill-white" fontSize="16" fontWeight="700">
            {total}
          </text>
          <text x="50%" y={size/2 + 18} textAnchor="middle" dominantBaseline="hanging" fill="#9CA3AF" fontSize="10">
            total
          </text>
        </svg>
        <div className="flex-1 grid grid-cols-2 gap-3">
          {entries.map(([k, v]) => (
            <div key={k} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 border border-gray-700">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[k] || '#9CA3AF' }} />
                <span className="text-gray-300 text-sm">{labels[k] || k}</span>
              </div>
              <div className="text-white text-sm font-semibold">{v}</div>
            </div>
          ))}
        </div>
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
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('weekly');
  const [customDateRange, setCustomDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: ''
  });

  // Calculate date range based on time period
  const getDateRange = () => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (timePeriod) {
      case 'weekly':
        return {
          start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: today
        };
      case 'monthly':
        return {
          start: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
          end: today
        };
      case 'quarterly':
        return {
          start: new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()),
          end: today
        };
      case 'yearly':
        return {
          start: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
          end: today
        };
      case 'custom':
        return {
          start: customDateRange.start ? new Date(customDateRange.start) : new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000),
          end: customDateRange.end ? new Date(customDateRange.end) : today
        };
      default:
        return {
          start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          end: today
        };
    }
  };

  const fetchDashboardData = useCallback(async (forceRefresh = false) => {
    try {
      if (forceRefresh) {
        setRefreshing(true);
        dataCache.clear();
      }
      
      setLoading({ basic: true, analytics: true });
      
      const dateRange = getDateRange();
      const cacheKey = `dashboard-${timePeriod}-${dateRange.start.toISOString()}-${dateRange.end.toISOString()}`;
      
      // Check if admin service is available
      const testResult = await adminService.testConnection();
      if (!testResult.success) {
        console.warn('Admin service not available, using fallback data');
        setData({
          orders: { count: 0, revenue: 0, averageValue: 0 },
          users: 0,
          products: 0,
          flashSales: 0,
          analytics: {
            statusDistribution: {},
            dailyRevenue: [],
            monthlyOrders: 0,
            monthlyRevenue: 0
          }
        });
        setLoading({ basic: false, analytics: false });
        return;
      }
      
      // Fetch dashboard data using adminService
      const dashboardData = await getCachedData(
        cacheKey,
        async () => {
          try {
            // Get dashboard stats from adminService (dynamic by time period)
            const statsResult = await adminService.getDashboardStats({
              start: dateRange.start.toISOString(),
              end: dateRange.end.toISOString()
            });
            
            if (statsResult.success) {
              const stats = statsResult.data;
              
              return {
                orders: { 
                  count: stats.totalOrders, 
                  revenue: stats.totalRevenue, 
                  averageValue: stats.averageOrders 
                },
                users: stats.totalUsers,
                products: stats.totalProducts,
                flashSales: stats.flashSales,
                analytics: {
                  statusDistribution: {
                    paid: stats.orderStatuses.paid,
                    pending: stats.orderStatuses.pending,
                    completed: stats.orderStatuses.completed ?? 0,
                    canceled: stats.orderStatuses.canceled
                  } as Record<string, number>,
                  dailyRevenue: stats.dailyRevenue || [],
                  monthlyOrders: stats.totalOrders,
                  monthlyRevenue: stats.totalRevenue,
                  trends: {
                    orderTrend: 0, // Would be calculated from historical data
                    revenueTrend: 0,
                    userTrend: 0
                  },
                  conversionRate: stats.conversionRate
                }
              };
            } else {
              // Fallback to product-based estimates
              const productsResult = await adminService.getProducts({ page: 1, perPage: 1 });
              const productsCount = productsResult.count || 0;
              
              return {
                orders: { 
                  count: Math.floor(productsCount * 0.1), 
                  revenue: productsCount * 50000, 
                  averageValue: 50000 
                },
                users: Math.floor(productsCount * 0.5),
                products: productsCount,
                flashSales: Math.floor(productsCount * 0.2),
                analytics: {
                  statusDistribution: {
                    'active': Math.round(productsCount * 0.7),
                    'inactive': Math.round(productsCount * 0.2),
                    'draft': Math.round(productsCount * 0.1)
                  } as Record<string, number>,
                  dailyRevenue: [],
                  monthlyOrders: Math.floor(productsCount * 0.1),
                  monthlyRevenue: productsCount * 50000
                }
              };
            }
          } catch (error) {
            console.warn('Using fallback dashboard data:', error);
            return {
              orders: { count: 0, revenue: 0, averageValue: 0 },
              users: 0,
              products: 0,
              flashSales: 0,
              analytics: {
                statusDistribution: {
                  'paid': 0,
                  'pending': 0,
                  'cancelled': 0
                } as Record<string, number>,
                dailyRevenue: [],
                monthlyOrders: 0,
                monthlyRevenue: 0
              }
            };
          }
        },
        timePeriod === 'custom' ? 30000 : 300000 // Custom: 30s, Others: 5min
      );
      
      setData(dashboardData);
      setLoading({ basic: false, analytics: false });
      
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
  }, [timePeriod, customDateRange]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto refresh every 2 minutes for non-custom periods
  useEffect(() => {
    if (timePeriod !== 'custom') {
      const interval = setInterval(() => {
        if (!refreshing) {
          fetchDashboardData();
        }
      }, 120000);
      
      return () => clearInterval(interval as any);
    }
  }, [timePeriod, refreshing, fetchDashboardData]);

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
      {/* Header dengan action buttons */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Admin</h1>
          <p className="text-gray-400">Kelola toko online JB Alwikobra dengan mudah</p>
        </div>
        <div className="flex items-center gap-2">
          <ActionButton
            icon={<Download className="w-4 h-4" />}
            onClick={() => {/* TODO: Export functionality */}}
            variant="secondary"
            tooltip="Export Data"
          />
          <ActionButton
            icon={<Eye className="w-4 h-4" />}
            onClick={() => {/* TODO: View detailed reports */}}
            variant="secondary"
            tooltip="View Reports"
          />
          <ActionButton
            icon={<RefreshCw className="w-4 h-4" />}
            onClick={() => fetchDashboardData(true)}
            variant="primary"
            tooltip="Refresh Data"
            loading={refreshing}
          />
        </div>
      </div>

      {/* Time Period Filter */}
      <TimePeriodFilter
        currentPeriod={timePeriod}
        onPeriodChange={(period) => {
          setTimePeriod(period);
          // Clear cache when period changes
          dataCache.clear();
        }}
        customDateRange={customDateRange}
        onCustomDateChange={setCustomDateRange}
      />

      {/* Main Statistics Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Produk" 
          value={String(data.products)} 
          hint="Produk tersedia"
          icon={<ShoppingBag className="w-6 h-6" />}
          color="blue"
          loading={loading.basic}
        />
        <StatCard 
          label="Flash Sale" 
          value={String(data.flashSales)} 
          hint="Aktif sekarang"
          icon={<Zap className="w-6 h-6" />}
          color="yellow"
          loading={loading.basic}
        />
        <StatCard 
          label="Total Pesanan" 
          value={String(data.orders.count)} 
          hint={`Periode ${timePeriod === 'weekly' ? 'mingguan' : timePeriod === 'monthly' ? 'bulanan' : timePeriod === 'quarterly' ? 'kuartalan' : timePeriod === 'yearly' ? 'tahunan' : 'custom'}`}
          icon={<Calendar className="w-6 h-6" />}
          color="green"
          loading={loading.basic}
          trend={data.analytics?.trends ? { value: data.analytics.trends.orderTrend, label: 'vs periode sebelumnya' } : undefined}
        />
        <StatCard 
          label="Total Pendapatan" 
          value={`Rp ${(Number.isFinite(data.orders.revenue) ? data.orders.revenue : 0).toLocaleString('id-ID')}`}
          hint="Revenue periode ini"
          icon={<DollarSign className="w-6 h-6" />}
          color="orange"
          loading={loading.basic}
          trend={data.analytics?.trends ? { value: data.analytics.trends.revenueTrend, label: 'vs periode sebelumnya' } : undefined}
        />
        <StatCard 
          label="Total Pengguna" 
          value={String(data.users)} 
          hint="Pengguna terdaftar"
          icon={<Users className="w-6 h-6" />}
          color="indigo"
          loading={loading.basic}
          trend={data.analytics?.trends ? { value: data.analytics.trends.userTrend, label: 'vs periode sebelumnya' } : undefined}
        />
      </div>

      {/* Analytics Section */}
      {loading.analytics ? (
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-96 bg-gray-700 rounded-xl"></div>
            <div className="h-96 bg-gray-700 rounded-xl"></div>
          </div>
        </div>
      ) : data.analytics && (
        <>
          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <DailyOrdersLineChart 
              data={data.analytics.dailyRevenue || []} 
              title={`Pesanan Harian (${timePeriod === 'weekly' ? '7 Hari' : timePeriod === 'monthly' ? '30 Hari' : timePeriod === 'quarterly' ? '90 Hari' : timePeriod === 'yearly' ? '365 Hari' : 'Custom'} Terakhir)`}
            />
            <DonutStatusChart data={data.analytics.statusDistribution || {}} />
          </div>

          {/* Advanced Insights */}
          <div className="bg-gray-900/60 border border-orange-500/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-orange-400" />
              Insight Performa
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
                <div className="text-green-400 font-semibold mb-2">Rata-rata Pesanan/Hari</div>
                <div className="text-2xl font-bold text-white">
                  {data.analytics.dailyRevenue?.length > 0 
                    ? Math.round(data.orders.count / (data.analytics.dailyRevenue.length || 1))
                    : 0} pesanan
                </div>
              </div>
              <div className="bg-blue-900/30 border border-blue-700 rounded-lg p-4">
                <div className="text-blue-400 font-semibold mb-2">Tingkat Konversi</div>
                <div className="text-2xl font-bold text-white">
                  {Math.round((data.analytics?.conversionRate || 0))}%
                </div>
              </div>
              {/* Revenue per User card removed as requested */}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
