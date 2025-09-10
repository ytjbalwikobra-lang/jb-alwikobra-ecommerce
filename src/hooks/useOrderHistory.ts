import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/TraditionalAuthContext';

export interface Order {
  id: string;
  amount: number;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  created_at: string;
  payment_channel?: string | null;
  xendit_invoice_url?: string | null;
}

export interface UseOrderHistoryReturn {
  orders: Order[];
  loading: boolean;
  error: string | null;
  refetchOrders: () => Promise<void>;
}

export const useOrderHistory = (): UseOrderHistoryReturn => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchOrders = useCallback(async () => {
    if (!user || !supabase) { 
      setLoading(false); 
      return; 
    }
    
    try {
      setError(null);
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('id, amount, status, created_at, payment_channel, xendit_invoice_url')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (fetchError) {
        setError('Gagal memuat riwayat pesanan');
        console.error('Error fetching orders:', fetchError);
      } else if (data) {
        setOrders(data);
      }
    } catch (err) {
      setError('Terjadi kesalahan saat memuat data');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchOrders();
  }, [fetchOrders]);

  const refetchOrders = useCallback(async () => {
    setLoading(true);
    await fetchOrders();
  }, [fetchOrders]);

  return {
    orders,
    loading,
    error,
    refetchOrders
  };
};
