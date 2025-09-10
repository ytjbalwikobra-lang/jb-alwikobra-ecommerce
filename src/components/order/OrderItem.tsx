import React from 'react';
import { Order } from '../../hooks/useOrderHistory';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderItemProps {
  order: Order;
}

export const OrderItem: React.FC<OrderItemProps> = ({ order }) => {
  const formatPaymentChannel = (channel: string) => {
    return channel.toLowerCase().replace(/_/g, ' ');
  };

  const formatCurrency = (amount: number) => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  return (
    <div className="p-4 flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-400">{formatDate(order.created_at)}</div>
        <div className="font-mono text-gray-200">{order.id}</div>
        {order.payment_channel && (
          <div className="text-xs text-gray-400 mt-1">
            Metode: <span className="capitalize">{formatPaymentChannel(order.payment_channel)}</span>
          </div>
        )}
      </div>
      <div className="text-right">
        <div className="font-semibold text-white">{formatCurrency(order.amount)}</div>
        <OrderStatusBadge status={order.status} />
        {order.xendit_invoice_url && order.status === 'pending' && (
          <a 
            href={order.xendit_invoice_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-xs text-pink-400 hover:underline block mt-1"
          >
            Bayar Sekarang
          </a>
        )}
      </div>
    </div>
  );
};
