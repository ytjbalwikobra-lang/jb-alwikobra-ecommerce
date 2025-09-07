import React from 'react';
import { useLocation } from 'react-router-dom';
import AdminLayout from './AdminLayout.tsx';

const AdminLayoutWrapper: React.FC = () => {
  const location = useLocation();
  // Force remount of the entire admin layout when the path changes
  return <AdminLayout key={location.pathname} />;
};

export default AdminLayoutWrapper;
