import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
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
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="text-pink-400 animate-spin mx-auto mb-4" />
          <p className="text-white">Memuat...</p>
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
    <ProtectedRoute
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center">
          <div className="bg-black/40 backdrop-blur rounded-xl p-8 text-center border border-pink-500/30 max-w-md mx-4">
            <Lock size={64} className="text-pink-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Login Diperlukan</h1>
            <p className="text-gray-300 mb-6">
              Anda harus login terlebih dahulu untuk mengakses halaman ini.
            </p>
            <div className="space-y-3">
              <a 
                href="/auth" 
                className="block w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Login Sekarang
              </a>
              <a 
                href="/" 
                className="block w-full bg-gray-600 hover:bg-gray-700 text-white py-3 rounded-lg font-medium transition-colors"
              >
                Kembali ke Beranda
              </a>
            </div>
          </div>
        </div>
      }
    >
      {children}
    </ProtectedRoute>
  );
};

export default ProtectedRoute;
