import React from 'react';
import { PaymentOrder } from '../../hooks/usePaymentStatus';

interface PaymentDetailsProps {
  order: PaymentOrder;
}

export const PaymentDetails: React.FC<PaymentDetailsProps> = ({ order }) => {
  const formatPaymentChannel = (channel: string): string => {
    return channel.toLowerCase().replace(/_/g, ' ');
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('id-ID');
  };

  return (
    <div className="text-sm text-gray-300 space-y-1 mb-6">
      {order.payment_channel && (
        <p>
          Metode: <strong className="capitalize">{formatPaymentChannel(order.payment_channel)}</strong>
        </p>
      )}
      {order.payer_email && (
        <p>
          Email Pembayar: <strong>{order.payer_email}</strong>
        </p>
      )}
      {order.xendit_invoice_id && (
        <p>
          Invoice ID: <span className="font-mono">{order.xendit_invoice_id}</span>
        </p>
      )}
      {order.xendit_invoice_url && (
        <p>
          <a 
            href={order.xendit_invoice_url} 
            target="_blank" 
            rel="noreferrer" 
            className="text-pink-400 hover:text-pink-300"
          >
            Buka invoice Xendit
          </a>
        </p>
      )}
      {order.expires_at && (
        <p>
          Expired: {formatDate(order.expires_at)}
        </p>
      )}
      {order.paid_at && (
        <p>
          Dibayar: {formatDate(order.paid_at)}
        </p>
      )}
    </div>
  );
};
