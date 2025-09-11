import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';

const RequireAdmin: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="w-full max-w-xs px-6">
          <div className="ios-skeleton h-4 w-28 mb-3"></div>
          <div className="ios-skeleton h-3.5 w-full mb-2"></div>
          <div className="ios-skeleton h-3.5 w-5/6"></div>
        </div>
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
