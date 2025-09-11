import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { Loader2, Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  fallback 
}) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-ios-background text-ios-text flex items-center justify-center px-6">
        <div className="w-full max-w-sm">
          <div className="ios-skeleton h-5 w-36 mb-4"></div>
          <div className="ios-skeleton h-4 w-full mb-2"></div>
          <div className="ios-skeleton h-4 w-4/5 mb-2"></div>
          <div className="ios-skeleton h-4 w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    return (
      <Navigate 
        to={`/auth?redirect=${encodeURIComponent(location.pathname)}`} 
        replace 
      />
    );
  }

  return <>{children}</>;
};

export const AuthRequired: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;
