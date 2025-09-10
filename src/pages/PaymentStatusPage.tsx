import React from 'react';
import { usePaymentStatus } from '../hooks/usePaymentStatus';
import { PaymentStatusLoader } from '../components/payment/PaymentStatusLoader';
import { PaymentNoOrder } from '../components/payment/PaymentNoOrder';
import { PaymentStatusCard } from '../components/payment/PaymentStatusCard';

const PaymentStatusPageRefactored: React.FC = () => {
  const { order, loading, isAuthenticated } = usePaymentStatus();

  if (loading) {
    return <PaymentStatusLoader />;
  }

  if (!order) {
    return <PaymentNoOrder isAuthenticated={isAuthenticated} />;
  }

  return (
    <div className="min-h-screen bg-app-dark text-gray-200">
      <PaymentStatusCard order={order} />
    </div>
  );
};

export default PaymentStatusPageRefactored;
