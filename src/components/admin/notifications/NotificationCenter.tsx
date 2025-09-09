import { Bell, CheckCircle, XCircle } from 'lucide-react';
import { useNotifications } from '../../../hooks/useNotifications';
import { adminService } from '../../../services/adminService';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Button } from '../../ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { useEffect } from 'react';

const NotificationCenter = () => {
  const { notifications, markAsRead, markAllAsRead, clearAll } = useNotifications();

  const getNotificationTitle = (notification: any) => {
    switch (notification.type) {
      case 'new_order':
        return 'Pesanan Baru';
      case 'order_paid':
        return 'Pembayaran Diterima';
      default:
        return 'Notifikasi';
    }
  };

  const getNotificationMessage = (notification: any) => {
    const customerName = notification.customer?.name || 'Customer';
    const amount = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(notification.amount || 0);
    
    switch (notification.type) {
      case 'new_order':
        return `Pesanan baru dari ${customerName} sebesar ${amount}`;
      case 'order_paid':
        return `Pembayaran dari ${customerName} sebesar ${amount} telah dikonfirmasi`;
      default:
        return `Notifikasi untuk pesanan #${notification.id}`;
    }
  };

  useEffect(() => {
    const fetchInitialNotifications = async () => {
      // TODO: Implement a method in adminService to fetch notifications
      // For now, this is commented out to prevent build errors.
      /*
      try {
        const { data, error } = await adminService.getOrders({
          page: 1,
          perPage: 10,
          status: 'pending',
        });

        if (error) {
          console.error('Failed to fetch recent orders for notifications:', error);
          return;
        }

        if (data) {
          data.forEach((order: Order) => {
            // This is a placeholder. You would adapt this to your notification system.
            // For example, you might check if a notification for this order already exists.
          });
        }
      } catch (err) {
        console.error('Error in fetchInitialNotifications:', err);
      }
      */
    };

    fetchInitialNotifications();
  }, []);

  const unreadNotifications = notifications.filter(n => !n.read);
  const readNotifications = notifications.filter(n => n.read);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Notification Center</span>
          <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>Mark All as Read</Button>
            <Button variant="destructive" size="sm" onClick={clearAll}>Clear All</Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="unread">
          <TabsList>
            <TabsTrigger value="unread">Unread ({unreadNotifications.length})</TabsTrigger>
            <TabsTrigger value="read">Read ({readNotifications.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="unread">
            {unreadNotifications.length > 0 ? (
              <ul className="space-y-2">
                {unreadNotifications.map(notification => (
                  <li key={notification.id} className="flex items-start justify-between p-2 rounded-lg bg-secondary">
                    <div className="flex items-start space-x-3">
                      <Bell className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <p className="font-semibold">{getNotificationTitle(notification)}</p>
                        <p className="text-sm text-muted-foreground">{getNotificationMessage(notification)}</p>
                        <p className="text-xs text-muted-foreground/70">{new Date(notification.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.notificationId)}>
                      <CheckCircle className="h-5 w-5" />
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-4">No unread notifications.</p>
            )}
          </TabsContent>
          <TabsContent value="read">
            {readNotifications.length > 0 ? (
              <ul className="space-y-2">
                {readNotifications.map(notification => (
                  <li key={notification.id} className="flex items-start p-2 rounded-lg">
                     <div className="flex items-start space-x-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                      <div>
                        <p className="font-semibold text-muted-foreground">{getNotificationTitle(notification)}</p>
                        <p className="text-sm text-muted-foreground/80">{getNotificationMessage(notification)}</p>
                         <p className="text-xs text-muted-foreground/50">{new Date(notification.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-center text-muted-foreground py-4">No read notifications.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default NotificationCenter;
