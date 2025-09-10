import React from 'react';
import { PaymentOrder } from '../../hooks/usePaymentStatus';
import { PaymentStatusHeader } from './PaymentStatusHeader';
import { PaymentDetails } from './PaymentDetails';
import { PaymentActions } from './PaymentActions';

interface PaymentStatusCardProps {
  order: PaymentOrder;
}

export const PaymentStatusCard: React.FC<PaymentStatusCardProps> = ({ order }) => {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="p-6 rounded-xl border bg-black/70 border-pink-500/30">
        <PaymentStatusHeader 
          status={order.status}
          orderId={order.id}
          amount={order.amount}
        />
        <PaymentDetails order={order} />
        <PaymentActions />
      </div>
    </div>
  );
};
