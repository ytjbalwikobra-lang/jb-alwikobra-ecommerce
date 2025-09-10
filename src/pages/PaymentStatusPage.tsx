/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unnecessary-type-assertion, @typescript-eslint/no-floating-promises */
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { isLoggedIn } from '../services/authService';

type Order = {
  id: string;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  amount: number;
  created_at: string;
  xendit_invoice_id?: string | null;
  xendit_invoice_url?: string | null;
  currency?: string | null;
  expires_at?: string | null;
  paid_at?: string | null;
  payment_channel?: string | null;
  payer_email?: string | null;
};

const PaymentStatusPage: React.FC = () => {
  const [params] = useSearchParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const orderId = params.get('order_id');
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const run = async () => {
      const ok = await isLoggedIn();
      setAuthed(ok);
      if (!supabase) { setLoading(false); return; }
      if (orderId) {
  const { data } = await supabase.from('orders').select('*').eq('id', orderId).maybeSingle();
        setOrder(data as any);
        setLoading(false);
        return;
      }
      // Fallback: show latest order for logged-in user
      if (ok) {
        const { data } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        setOrder((data && data[0]) as any);
      }
      setLoading(false);
    };
    run();
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-dark text-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Memuat status pembayaran...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-dark text-gray-200">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Tidak ada detail order</h2>
          <p className="text-gray-300 mb-4">Jika pembayaran berhasil, Anda akan menerima email konfirmasi. {authed ? 'Cek juga riwayat order Anda.' : 'Silakan login untuk melihat riwayat order.'}</p>
          <div className="flex gap-3 justify-center">
            {authed && <Link to="/orders" className="bg-pink-600 text-white px-4 py-2 rounded-lg">Lihat Riwayat Order</Link>}
            <Link to="/" className="border border-pink-500/40 px-4 py-2 rounded-lg">Beranda</Link>
          </div>
        </div>
      </div>
    );
  }

  const map = {
    paid: { title: 'Pembayaran diterima', color: 'text-green-600', bg: 'bg-green-50' },
    completed: { title: 'Transaksi selesai', color: 'text-green-700', bg: 'bg-green-50' },
    pending: { title: 'Menunggu pembayaran', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    cancelled: { title: 'Transaksi dibatalkan/expired', color: 'text-red-600', bg: 'bg-red-50' },
  } as const;

  const style = map[order.status];

  return (
    <div className="min-h-screen bg-app-dark text-gray-200">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className={`p-6 rounded-xl border bg-black/70 border-pink-500/30`}>
          <h1 className={`text-2xl font-bold mb-2 ${style.color}`}>{style.title}</h1>
          <p className="text-gray-300 mb-4">Order ID: <span className="font-mono">{order.id}</span></p>
          <p className="text-gray-300 mb-6">Total Pembayaran: <strong>Rp {Number(order.amount).toLocaleString('id-ID')}</strong></p>
          <div className="text-sm text-gray-300 space-y-1 mb-6">
            {order.payment_channel && <p>Metode: <strong className="capitalize">{order.payment_channel.toLowerCase().replace(/_/g,' ')}</strong></p>}
            {order.payer_email && <p>Email Pembayar: <strong>{order.payer_email}</strong></p>}
            {order.xendit_invoice_id && <p>Invoice ID: <span className="font-mono">{order.xendit_invoice_id}</span></p>}
            {order.xendit_invoice_url && <p><a href={order.xendit_invoice_url} target="_blank" rel="noreferrer" className="text-pink-400">Buka invoice Xendit</a></p>}
            {order.expires_at && <p>Expired: {new Date(order.expires_at).toLocaleString('id-ID')}</p>}
            {order.paid_at && <p>Dibayar: {new Date(order.paid_at).toLocaleString('id-ID')}</p>}
          </div>
          <div className="flex gap-3">
            <Link to="/products" className="bg-pink-600 text-white px-4 py-2 rounded-lg">Lanjut belanja</Link>
            <Link to="/" className="border border-pink-500/40 px-4 py-2 rounded-lg">Beranda</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatusPage;
