import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase.ts';

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
        if (!supabase) return;
        const now = new Date();
        const sevenAgo = new Date(now.getTime() - 7*24*60*60*1000).toISOString();
        const [{ count: pCount }, { count: fsCount }, { data: oRows }]: any = await Promise.all([
          (supabase as any).from('products').select('id', { count: 'exact', head: true }),
          (supabase as any).from('flash_sales').select('id', { count: 'exact', head: true }).eq('is_active', true).gte('end_time', new Date().toISOString()),
          (supabase as any).from('orders').select('amount, status, created_at').gte('created_at', sevenAgo)
        ]);
        const orders = oRows || [];
        const revenue = orders.filter((o:any)=>['paid','completed'].includes(o.status)).reduce((s:number,o:any)=>s+Number(o.amount||0),0);
        setCounts({ products: pCount||0, flash: fsCount||0, orders7: orders.length, revenue7: revenue });
      } catch {}
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
