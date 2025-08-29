import React from 'react';

const StatCard: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="bg-black/60 border border-pink-500/30 rounded-xl p-4">
    <div className="text-sm text-gray-400">{label}</div>
    <div className="text-2xl font-bold text-white mt-1">{value}</div>
    {hint && <div className="text-xs text-gray-500 mt-1">{hint}</div>}
  </div>
);

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400">Ringkasan performa toko Anda</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Produk Aktif" value="12" hint="Termasuk flash sale" />
        <StatCard label="Flash Sale Aktif" value="3" hint="Berakhir < 24 jam" />
        <StatCard label="Pesanan 7 Hari" value="48" />
        <StatCard label="Pendapatan 7 Hari" value="Rp 12.450.000" />
      </div>
    </div>
  );
};

export default AdminDashboard;
