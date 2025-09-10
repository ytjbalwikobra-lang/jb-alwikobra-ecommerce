import React from 'react';
import Footer from '../components/Footer';
import { AuthRequired } from '../components/ProtectedRoute';
import { useOrderHistory } from '../hooks/useOrderHistory';
import { OrderHistoryHeader } from '../components/order/OrderHistoryHeader';
import { OrderHistoryLoader } from '../components/order/OrderHistoryLoader';
import { OrderHistoryEmpty } from '../components/order/OrderHistoryEmpty';
import { OrderList } from '../components/order/OrderList';
import { OrderError } from '../components/order/OrderError';

const OrderHistoryPageRefactored: React.FC = () => {
  const { orders, loading, error, refetchOrders } = useOrderHistory();

  const renderContent = () => {
    if (loading) {
      return <OrderHistoryLoader />;
    }

    if (error) {
      return <OrderError error={error} onRetry={refetchOrders} />;
    }

    if (orders.length === 0) {
      return <OrderHistoryEmpty />;
    }

    return <OrderList orders={orders} />;
  };

  return (
    <AuthRequired>
      <div className="min-h-screen bg-app-dark">
        <div className="pt-20 pb-20 px-4">
          <div className="max-w-4xl mx-auto">
            <OrderHistoryHeader />
            {renderContent()}
          </div>
        </div>
        <Footer />
      </div>
    </AuthRequired>
  );
};

export default OrderHistoryPageRefactored;
