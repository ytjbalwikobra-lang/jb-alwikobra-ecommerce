import React, { createContext, useState, useMemo, useCallback } from 'react';
import { Order } from '../types';

export type Notification = Omit<Order, 'type'> & {
  notificationId: string;
  type: 'new_order' | 'order_paid';
  read: boolean;
};

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (order: Order, type: 'new_order' | 'order_paid') => void;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const addNotification = useCallback((order: Order, type: 'new_order' | 'order_paid') => {
    const newNotification: Notification = {
      ...order,
      notificationId: `notif_${new Date().getTime()}_${order.id}`,
      type,
      read: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  }, []);

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.notificationId === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);
  
  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const removeNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.notificationId !== notificationId));
  }, []);

  const unreadCount = useMemo(() => notifications.filter(n => !n.read).length, [notifications]);

  const value = useMemo(() => ({
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    clearAll,
  }), [notifications, unreadCount, addNotification, markAsRead, markAllAsRead, clearAll]);

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
