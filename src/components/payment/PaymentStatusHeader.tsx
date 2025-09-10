import React from 'react';

interface PaymentStatusConfig {
  title: string;
  color: string;
  bg: string;
}

interface PaymentStatusHeaderProps {
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  orderId: string;
  amount: number;
}

export const PaymentStatusHeader: React.FC<PaymentStatusHeaderProps> = ({
  status,
  orderId,
  amount
}) => {
  const statusMap: Record<string, PaymentStatusConfig> = {
    paid: { title: 'Pembayaran diterima', color: 'text-green-600', bg: 'bg-green-50' },
    completed: { title: 'Transaksi selesai', color: 'text-green-700', bg: 'bg-green-50' },
    pending: { title: 'Menunggu pembayaran', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    cancelled: { title: 'Transaksi dibatalkan/expired', color: 'text-red-600', bg: 'bg-red-50' },
  };

  const statusConfig = statusMap[status];

  const formatCurrency = (amount: number): string => {
    return `Rp ${amount.toLocaleString('id-ID')}`;
  };

  return (
    <div>
      <h1 className={`text-2xl font-bold mb-2 ${statusConfig.color}`}>
        {statusConfig.title}
      </h1>
      <p className="text-gray-300 mb-4">
        Order ID: <span className="font-mono">{orderId}</span>
      </p>
      <p className="text-gray-300 mb-6">
        Total Pembayaran: <strong>{formatCurrency(amount)}</strong>
      </p>
    </div>
  );
};
