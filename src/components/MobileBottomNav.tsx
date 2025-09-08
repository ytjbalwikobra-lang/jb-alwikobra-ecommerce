import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, MessageSquare, Home, User } from 'lucide-react';
import { supabase } from '../services/supabase.ts';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const [hasNewFeed, setHasNewFeed] = React.useState(false);
  React.useEffect(() => {
    let timer: any; let unsub: any;
    const token = localStorage.getItem('session_token') || '';
    const load = async () => {
      try {
        if (!token) return;
        const res = await fetch('/api/feed?action=notifications', { headers: { 'Authorization': `Bearer ${token}` } });
        const j = await res.json();
        const hasUnread = (j.notifications || []).some((n: any) => !n.read_at);
        setHasNewFeed(hasUnread);
      } catch {}
    };
    load();
    timer = setInterval(load, 30000);
    if (supabase) {
      try {
        unsub = (supabase as any)
          .channel('feed_notifications')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_notifications' }, load)
          .subscribe();
      } catch {}
    }
    return () => { clearInterval(timer); try { unsub && supabase?.removeChannel(unsub); } catch {} };
  }, []);

  // Clear badge on entering feed
  React.useEffect(() => {
    if (location.pathname === '/feed' && hasNewFeed) {
      setTimeout(() => setHasNewFeed(false), 300); // smooth fade
      const token = localStorage.getItem('session_token') || '';
      if (token) fetch('/api/feed?action=notifications-read', { method: 'POST', headers: { 'Authorization': `Bearer ${token}` } });
    }
  }, [location.pathname, hasNewFeed]);

  const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/products', label: 'Katalog', icon: ShoppingBag },
    { path: '/feed', label: 'Feed', icon: MessageSquare },
    { path: '/sell', label: 'Jual Akun', icon: ShoppingBag },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-pink-500/30 bg-black/90 backdrop-blur z-[1000]" style={{ height: 'calc(64px + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <nav className="flex justify-around py-2" style={{ height: 64 }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                isActive ? 'text-pink-400' : 'text-gray-300'
              }`}
            >
              <div className="relative">
                <Icon size={20} />
                {item.path === '/feed' && hasNewFeed && !isActive && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse" />
                )}
              </div>
              <span className="mt-1">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
