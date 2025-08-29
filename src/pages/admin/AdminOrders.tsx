import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase.ts';
import { useToast } from '../../components/Toast.tsx';

type OrderRow = {
  id: string;
  product_id: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  order_type: 'purchase'|'rental';
  amount: number;
  status: 'pending'|'paid'|'completed'|'cancelled';
  payment_method: 'xendit'|'whatsapp';
  rental_duration?: string | null;
  created_at: string;
};

const AdminOrders: React.FC = () => {
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { push } = useToast();

  const load = async () => {
    try {
      if (!supabase) return;
      const { data, error } = await (supabase as any).from('orders').select('*').order('created_at', { ascending: false }).limit(200);
      if (error) throw error;
      setRows(data || []);
    } catch (e: any) {
      push(`Gagal memuat orders: ${e?.message || e}`, 'error');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);

  const updateStatus = async (id: string, status: OrderRow['status']) => {
    if (!supabase) return;
    const { error } = await (supabase as any).from('orders').update({ status }).eq('id', id);
    if (error) push('Gagal memperbarui status', 'error'); else { push('Status diperbarui', 'success'); await load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Orders</h1>
          <p className="text-gray-400">Pantau pesanan guest/user dan tindak lanjuti</p>
        </div>
      </div>

      <div className="bg-black/60 border border-pink-500/30 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 text-xs uppercase text-gray-400 px-4 py-2 border-b border-pink-500/20">
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Jenis</div>
          <div className="col-span-2">Jumlah</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-right">Aksi</div>
        </div>
        {loading ? (
          <div className="p-4 text-gray-400">Memuat…</div>
        ) : rows.length === 0 ? (
          <div className="p-4 text-gray-400">Belum ada order.</div>
        ) : rows.map((r) => (
          <div key={r.id} className="grid grid-cols-12 items-center px-4 py-3 border-b border-pink-500/10">
            <div className="col-span-3 text-white">
              <div className="font-medium">{r.customer_name}</div>
              <div className="text-xs text-gray-400">{r.customer_email} · {r.customer_phone}</div>
            </div>
            <div className="col-span-2 text-gray-300">{r.order_type}</div>
            <div className="col-span-2 text-gray-300">Rp {Number(r.amount||0).toLocaleString('id-ID')}</div>
            <div className="col-span-2 text-gray-300">{r.status}</div>
            <div className="col-span-3 text-right">
              <select value={r.status} onChange={(e)=>updateStatus(r.id, e.target.value as any)} className="bg-black border border-white/20 rounded px-2 py-1 text-white">
                <option value="pending">pending</option>
                <option value="paid">paid</option>
                <option value="completed">completed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOrders;
