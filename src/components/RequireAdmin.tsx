import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';

const RequireAdmin: React.FC = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-300">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // If not logged in, send to login with redirect
  if (!user) {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${redirect}`} replace />;
  }

  // Logged in but not admin -> No Access page
  if (!user.isAdmin) {
    return <Navigate to="/no-access" replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
