import React from 'react';
import { AdminLayoutProvider } from '../contexts/AdminLayoutContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import AdminLayoutRefactored from './AdminLayoutRefactored';
import NotificationCenter from '../components/admin/notifications/NotificationCenter';

const AdminLayoutWrapper: React.FC = () => {
  return (
    <AdminLayoutProvider>
      <NotificationProvider>
        <AdminLayoutRefactored />
        <NotificationCenter />
      </NotificationProvider>
    </AdminLayoutProvider>
  );
};

export default AdminLayoutWrapper;
