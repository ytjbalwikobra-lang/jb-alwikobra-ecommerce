import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useWhatsAppAuth } from '../contexts/WhatsAppAuthContext.tsx';

const RequireAdmin: React.FC = () => {
  const { user, loading } = useWhatsAppAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-300">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user || !user.isAdmin) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
