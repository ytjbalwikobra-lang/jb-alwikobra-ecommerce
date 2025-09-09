import * as React from 'react';
import {
  DollarSign,
  Users,
  ShoppingBag,
  Zap,
} from 'lucide-react';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import StatCard from '../../components/admin/dashboard/StatCard';
import DailyRevenueChart from '../../components/admin/dashboard/DailyRevenueChart';
import OrderStatusChart from '../../components/admin/dashboard/OrderStatusChart';
import DashboardHeader from '../../components/admin/dashboard/DashboardHeader';
import TimePeriodFilter from '../../components/admin/dashboard/TimePeriodFilter';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';

const AdminDashboard: React.FC = () => {
  const { stats, loading, error, period, setPeriod, refresh } = useDashboardStats();

  const handleExport = () => {
    // Implementation for exporting dashboard data
    console.log('Exporting dashboard data...');
  };

  return (
    <div className="space-y-6">
      <DashboardHeader 
        onExport={handleExport}
        onTimePeriodChange={setPeriod}
        timePeriod={period}
      />
      
      <div className="flex items-center justify-end">
        <TimePeriodFilter value={period} onChange={setPeriod} />
      </div>

      {error && (
        <Card className="bg-destructive/10 border-destructive/50">
            <CardHeader>
                <CardTitle className="text-destructive">Error Loading Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-destructive">{error}</p>
            </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`Rp ${(stats?.totalRevenue || 0).toLocaleString('id-ID')}`}
          icon={<DollarSign className="w-4 h-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Total Orders"
          value={String(stats?.totalOrders || 0)}
          icon={<ShoppingBag className="w-4 h-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="New Users"
          value={String(stats?.totalUsers || 0)}
          icon={<Users className="w-4 h-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Active Flash Sales"
          value={String(stats?.flashSales || 0)}
          icon={<Zap className="w-4 h-4 text-muted-foreground" />}
          loading={loading}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
            <DailyRevenueChart data={stats?.dailyRevenue || []} loading={loading} />
        </div>
        <div className="lg:col-span-3">
            <OrderStatusChart data={stats?.orderStatuses || {}} loading={loading} />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
