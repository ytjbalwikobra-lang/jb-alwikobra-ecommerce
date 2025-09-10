import React from 'react';

interface OrderStatusBadgeProps {
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'paid':
        return { className: 'bg-green-600 text-white', label: 'Lunas' };
      case 'pending':
        return { className: 'bg-yellow-600 text-white', label: 'Menunggu' };
      case 'completed':
        return { className: 'bg-blue-600 text-white', label: 'Selesai' };
      case 'cancelled':
        return { className: 'bg-red-600 text-white', label: 'Dibatalkan' };
      default:
        return { className: 'bg-gray-600 text-white', label: 'Unknown' };
    }
  };

  const config = getStatusConfig(status);

  return (
    <div className={`text-sm px-2 py-1 rounded ${config.className}`}>
      {config.label}
    </div>
  );
};
