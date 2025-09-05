import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import Footer from '../components/Footer.tsx';
import { AuthRequired } from '../components/ProtectedRoute.tsx';

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
  const { user } = useAuth();

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user || !supabase) { 
        setLoading(false); 
        return; 
      }
      
      try {
        // Fetch orders for the current user
        const { data, error } = await supabase
          .from('orders')
          .select('id, amount, status, created_at, payment_channel, xendit_invoice_url')
          .eq('user_id', user.id) // Filter by user_id
          .order('created_at', { ascending: false });
          
        if (!error && data) {
          setOrders(data as any);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
      
      setLoading(false);
    };

    fetchOrders();
  }, [user]);



  return (
    <AuthRequired>
      <div className="min-h-screen bg-app-dark">
        <div className="pt-20 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-white mb-6">Riwayat Order Saya</h1>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center text-gray-200">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
                  <p>Memuat riwayat pesanan...</p>
                </div>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-black border border-pink-500/30 rounded-lg p-6 text-center text-gray-300">
                Belum ada order.
              </div>
            ) : (
              <div className="bg-black border border-pink-500/30 rounded-lg divide-y divide-pink-500/20">
                {orders.map(o => (
                  <div key={o.id} className="p-4 flex items-center justify-between">
                    <div>
                      <div className="text-sm text-gray-400">{new Date(o.created_at).toLocaleString('id-ID')}</div>
                      <div className="font-mono text-gray-200">{o.id}</div>
                      {o.payment_channel && (
                        <div className="text-xs text-gray-400 mt-1">
                          Metode: <span className="capitalize">{o.payment_channel.toLowerCase().replace(/_/g,' ')}</span>
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-white">Rp {Number(o.amount).toLocaleString('id-ID')}</div>
                      <div className={`text-sm px-2 py-1 rounded ${
                        o.status === 'paid' ? 'bg-green-600 text-white' :
                        o.status === 'pending' ? 'bg-yellow-600 text-white' :
                        o.status === 'completed' ? 'bg-blue-600 text-white' :
                        'bg-red-600 text-white'
                      }`}>
                        {o.status === 'paid' ? 'Lunas' :
                         o.status === 'pending' ? 'Menunggu' :
                         o.status === 'completed' ? 'Selesai' :
                         'Dibatalkan'}
                      </div>
                      {o.xendit_invoice_url && o.status === 'pending' && (
                        <a href={o.xendit_invoice_url} target="_blank" rel="noopener noreferrer" className="text-xs text-pink-400 hover:underline block mt-1">
                          Bayar Sekarang
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </AuthRequired>
  );
};

export default OrderHistoryPage;
