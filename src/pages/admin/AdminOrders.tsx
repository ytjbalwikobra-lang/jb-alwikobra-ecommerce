import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '../../services/supabase.ts';
import { useToast } from '../../components/Toast.tsx';
import { RefreshCw, Filter } from 'lucide-react';

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
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all'|'pending'|'paid'|'completed'|'cancelled'>('all');
  const { push } = useToast();

  const mapRow = (r: any): OrderRow => ({
    id: r.id,
    product_id: r.product_id ?? r.productId ?? null,
    customer_name: r.customer_name ?? r.customerName ?? r.customer?.name ?? 'Unknown',
    customer_email: r.customer_email ?? r.customerEmail ?? r.customer?.email ?? '',
    customer_phone: r.customer_phone ?? r.customerPhone ?? r.customer?.phone ?? '',
    order_type: r.order_type ?? r.orderType ?? 'purchase',
    amount: Number(r.amount ?? 0),
    status: (r.status ?? 'pending') as OrderRow['status'],
    payment_method: r.payment_method ?? r.paymentMethod ?? 'whatsapp',
    rental_duration: r.rental_duration ?? r.rentalDuration ?? null,
    created_at: r.created_at ?? r.createdAt ?? new Date().toISOString(),
  });

  const load = async () => {
    setLoading(true); setErrorMsg('');
    try {
      if (!supabase) return;
      // Attempt joined select for product info
      let data: any[] | null = null;
      let errMsg = '';
      try {
        const { data: d, error } = await (supabase as any)
          .from('orders')
          .select('*, products:product_id ( id, name )')
          .order('created_at', { ascending: false })
          .limit(500);
        if (error) throw error; else data = d as any[];
      } catch (e: any) {
        // Fallback to basic select if relation or RLS blocks join
        errMsg = e?.message || String(e);
        const { data: d2, error: e2 } = await (supabase as any)
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(500);
        if (e2) throw e2; else data = d2 as any[];
      }
      setRows((data || []).map(mapRow));
      if (errMsg) {
        // Show soft warning but keep data loaded
        setErrorMsg(`Relasi produk tidak bisa dimuat: ${errMsg}`);
      }
    } catch (e: any) {
      const m = e?.message || String(e);
      setErrorMsg(m);
      push(`Gagal memuat orders: ${m}`, 'error');
    } finally { setLoading(false); }
  };

  useEffect(()=>{ load(); }, []);
  // Realtime updates: refresh on any change in orders
  useEffect(() => {
    if (!supabase) return;
    const channel = (supabase as any)
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => {
        // Lightweight: reload list to pick up latest status
        load();
      })
      .subscribe();
    return () => { try { (supabase as any).removeChannel?.(channel); } catch(_) {} };
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return rows as OrderRow[];
    return (rows as OrderRow[]).filter(r => r.status === statusFilter);
  }, [rows, statusFilter]);

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

      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <Filter size={16} className="text-gray-400" />
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)} className="bg-black/60 border border-white/10 rounded px-2 py-1">
            <option value="all">Semua</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <button onClick={load} className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm">
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="bg-black/60 border border-pink-500/30 rounded-xl overflow-hidden mt-3">
        {errorMsg && (
          <div className="px-4 py-2 text-sm text-amber-300 bg-amber-900/30 border-b border-amber-700/40">
            {errorMsg.includes('permission') || errorMsg.includes('RLS') ? (
              <span>Akses dibatasi oleh RLS. Pastikan kebijakan RLS untuk tabel orders mengizinkan admin melihat semua data.</span>
            ) : (
              <span>{errorMsg}</span>
            )}
          </div>
        )}
        <div className="grid grid-cols-12 text-xs uppercase text-gray-400 px-4 py-2 border-b border-pink-500/20">
          <div className="col-span-3">Customer</div>
          <div className="col-span-2">Jenis</div>
          <div className="col-span-2">Jumlah</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-right">Aksi</div>
        </div>
        {loading ? (
          <div className="p-4 text-gray-400">Memuat…</div>
        ) : filtered.length === 0 ? (
          <div className="p-4 text-gray-400">Belum ada order{statusFilter!=='all' ? ` dengan status ${statusFilter}` : ''}.</div>
        ) : filtered.map((r) => (
          <div key={r.id} className="grid grid-cols-12 items-center px-4 py-3 border-b border-pink-500/10">
            <div className="col-span-3 text-white">
              <div className="font-medium">{r.customer_name}</div>
              <div className="text-xs text-gray-400">{r.customer_email} · {r.customer_phone}</div>
            </div>
            <div className="col-span-2 text-gray-300">
              <div className="capitalize">{r.order_type}</div>
              {/* Product quick link when available */}
              {((r as any).products || r.product_id) && (
                <div className="mt-1 text-xs">
                  <a
                    href={`/products/${(r as any).products?.id || r.product_id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-pink-400 hover:text-pink-300 underline decoration-dotted"
                    title={(r as any).products?.name || 'Lihat produk'}
                  >
                    {(r as any).products?.name || 'Buka produk'}
                  </a>
                </div>
              )}
            </div>
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
