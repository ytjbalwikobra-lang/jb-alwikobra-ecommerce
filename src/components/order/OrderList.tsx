import React from 'react';
import { Order } from '../../hooks/useOrderHistory';
import { OrderItem } from './OrderItem';

interface OrderListProps {
  orders: Order[];
}

export const OrderList: React.FC<OrderListProps> = ({ orders }) => {
  return (
    <div className="bg-black border border-pink-500/30 rounded-lg divide-y divide-pink-500/20">
      {orders.map(order => (
        <OrderItem key={order.id} order={order} />
      ))}
    </div>
  );
};
