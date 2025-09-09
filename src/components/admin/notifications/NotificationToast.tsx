import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, DollarSign, X } from 'lucide-react';
import { Notification } from '../../../contexts/NotificationContext';
import { formatNumberID } from '../../../utils/helpers';
import { Button } from '../../ui/button';

interface NotificationToastProps {
  notification: Notification;
  onDismiss: () => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onDismiss }) => {
  const navigate = useNavigate();

  const isPaid = notification.type === 'order_paid';
  
  const bgColor = isPaid ? 'bg-green-100/95 dark:bg-green-900/95' : 'bg-blue-100/95 dark:bg-blue-900/95';
  const borderColor = isPaid ? 'border-green-400' : 'border-blue-400';
  const iconColor = isPaid ? 'text-green-500' : 'text-blue-500';
  const icon = isPaid ? <DollarSign /> : <ShoppingCart />;

  const handleClick = () => {
    navigate(`/admin/orders?highlight=${notification.id}`);
    onDismiss();
  };

  const productName = notification.product?.name || 'an item';
  const customerName = notification.customer?.name || 'A customer';

  return (
    <div
      className={`relative w-80 max-w-sm rounded-lg border ${borderColor} ${bgColor} p-4 shadow-lg transition-all hover:shadow-xl cursor-pointer`}
      onClick={handleClick}
    >
      <div className="flex items-start gap-4">
        <div className={`flex-shrink-0 ${iconColor}`}>{icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-sm text-foreground">
            {isPaid ? 'Order Paid' : 'New Order'}
          </h4>
          <p className="text-sm text-muted-foreground mt-1">
            {customerName} purchased {productName} for{' '}
            <span className="font-bold text-foreground">
              Rp {formatNumberID(notification.amount)}
            </span>.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-6 w-6"
          onClick={(e) => {
            e.stopPropagation(); // Prevent click from navigating
            onDismiss();
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
