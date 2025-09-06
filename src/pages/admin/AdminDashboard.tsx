import React, { useEffect, useState } from 'react';

const StatCard: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="bg-black/60 border border-pink-500/30 rounded-xl p-4">
    <div className="text-sm text-gray-400">{label}</div>
    <div className="text-2xl font-bold text-white mt-1">{value}</div>
    {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
  </div>
);

const AdminDashboard: React.FC = () => {
  const [counts, setCounts] = useState({ products: 0, flash: 0, orders7: 0, revenue7: 0 });
  useEffect(()=>{
    (async()=>{
      try {
        // Fetch dashboard data from consolidated admin API endpoint
        const response = await fetch('/api/admin?action=dashboard');
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch dashboard data');
        }
        
        const data = result.data;
        setCounts({ 
          products: data.products, 
          flash: data.flashSales, 
          orders7: data.orders.count, 
          revenue7: data.orders.revenue 
        });
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        // Set default values on error
        setCounts({ products: 0, flash: 0, orders7: 0, revenue7: 0 });
      }
    })();
  }, []);
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Ringkasan performa toko Anda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard label="Produk Aktif" value={String(counts.products)} hint="Termasuk flash sale" />
  <StatCard label="Flash Sale Aktif" value={String(counts.flash)} hint="Berakhir >= sekarang" />
  <StatCard label="Pesanan 7 Hari" value={String(counts.orders7)} />
  <StatCard label="Pendapatan 7 Hari" value={`Rp ${counts.revenue7.toLocaleString('id-ID')}`} />
      </div>
    </div>
  );
};

export default AdminDashboard;
