import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase.ts';
import { isAdmin } from '../services/authService.ts';

type AdminState = 'checking' | 'allowed' | 'denied';

const RequireAdmin: React.FC = () => {
  const [state, setState] = useState<AdminState>('checking');
  const location = useLocation();

  useEffect(() => {
    (async () => {
      try {
        if (!supabase) { setState('denied'); return; }
        const { data } = await supabase.auth.getUser();
        if (!data?.user) { setState('denied'); return; }
  const ok = await isAdmin();
  setState(ok ? 'allowed' : 'denied');
      } catch {
        setState('denied');
      }
    })();
  }, []);

  if (state === 'checking') {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-gray-300">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (state === 'denied') {
    const redirect = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?redirect=${redirect}`} replace />;
  }

  return <Outlet />;
};

export default RequireAdmin;
