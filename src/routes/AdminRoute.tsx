import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';
import AdminLayout from '../layouts/AdminLayout';

const AdminRoute: React.FC = () => {
  const { user, loading } = useAuth();

  if (process.env.NODE_ENV === 'development') {
    return <AdminLayout />;
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || !user.isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <AdminLayout />;
};

export default AdminRoute;
