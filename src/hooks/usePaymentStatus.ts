import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { isLoggedIn } from '../services/authService';

export interface PaymentOrder {
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
}

export interface UsePaymentStatusReturn {
  order: PaymentOrder | null;
  loading: boolean;
  isAuthenticated: boolean;
  orderId: string | null;
}

export const usePaymentStatus = (): UsePaymentStatusReturn => {
  const [params] = useSearchParams();
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const orderId = params.get('order_id');

  const fetchOrder = useCallback(async () => {
    try {
      const authStatus = await isLoggedIn();
      setIsAuthenticated(authStatus);

      if (!supabase) {
        setLoading(false);
        return;
      }

      if (orderId) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle();
        
        if (!error && data) {
          setOrder(data as PaymentOrder);
        }
      } else if (authStatus) {
        // Fallback: show latest order for logged-in user
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const { data, error } = await supabase
          .from('orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1);
        
        if (!error && data && data.length > 0) {
          setOrder(data[0] as PaymentOrder);
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    void fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    isAuthenticated,
    orderId
  };
};
