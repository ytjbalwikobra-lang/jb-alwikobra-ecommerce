import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase.ts';
import { isLoggedIn, getCurrentUserProfile } from '../services/authService.ts';

type Order = {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  created_at: string;
  payment_channel?: string | null;
  xendit_invoice_url?: string | null;
};

const OrderHistoryPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    (async () => {
      const ok = await isLoggedIn();
      setAuthed(ok);
      if (!ok || !supabase) { setLoading(false); return; }
      // Fetch by auth.uid() on server using RLS; client doesn't need to send user_id explicitly
      const { data, error } = await supabase
        .from('orders')
        .select('id, amount, status, created_at, payment_channel, xendit_invoice_url')
        .order('created_at', { ascending: false });
      if (!error && data) setOrders(data as any);
      setLoading(false);
    })();
  }, []);

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-dark text-gray-200">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2 text-white">Silakan login</h1>
          <p className="text-gray-300 mb-4">Riwayat order hanya tersedia untuk pengguna yang login.</p>
          <Link to="/" className="text-pink-400">Kembali</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-dark text-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Memuat riwayat order...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-dark text-gray-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-white mb-6">Riwayat Order Saya</h1>
        {orders.length === 0 ? (
          <div className="bg-black border border-pink-500/30 rounded-lg p-6 text-center text-gray-300">Belum ada order.</div>
        ) : (
          <div className="bg-black border border-pink-500/30 rounded-lg divide-y divide-pink-500/20">
            {orders.map(o => (
              <div key={o.id} className="p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-400">{new Date(o.created_at).toLocaleString('id-ID')}</div>
                  <div className="font-mono text-gray-200">{o.id}</div>
                  {o.payment_channel && (
                    <div className="text-xs text-gray-400 mt-1">Metode: <span className="capitalize">{o.payment_channel.toLowerCase().replace(/_/g,' ')}</span></div>
                  )}
                </div>
                <div className="text-right">
                  <div className="font-semibold text-white">Rp {Number(o.amount).toLocaleString('id-ID')}</div>
                  <div className={`text-sm capitalize ${o.status === 'paid' ? 'text-green-400' : o.status === 'pending' ? 'text-yellow-400' : o.status === 'cancelled' ? 'text-red-400' : 'text-gray-400'}`}>{o.status}</div>
                  {o.xendit_invoice_url && (
                    <div className="mt-1 text-xs"><a href={o.xendit_invoice_url} target="_blank" rel="noreferrer" className="text-pink-400">Buka invoice</a></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
