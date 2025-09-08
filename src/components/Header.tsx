import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, MessageSquare, Home, Settings, HelpCircle, User } from 'lucide-react';
import { useAuth } from '../contexts/TraditionalAuthContext.tsx';
import { supabase } from '../services/supabase.ts';

const Header: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const [siteName, setSiteName] = React.useState<string>('JB Alwikobra');
  const [logoUrl, setLogoUrl] = React.useState<string | undefined>(undefined);
  
  // Lazy load settings to improve initial page load
  React.useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
        const { SettingsService } = await import('../services/settingsService.ts');
        if (!mounted) return;
        const s = await SettingsService.get();
        if (mounted) {
          if (s?.siteName) setSiteName(s.siteName);
          if (s?.logoUrl) setLogoUrl(s.logoUrl);
        }
      } catch {
        // Silent fail for better UX
      }
    };
    // Delay settings load to prioritize critical content
    const timer = setTimeout(loadSettings, 100);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  const [hasNewFeed, setHasNewFeed] = React.useState(false);
  // Poll feed notifications and indicate new items
  React.useEffect(() => {
    let timer: any;
    let unsub: any;
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
    // Optional realtime hook if supabase available
    if (supabase) {
      try {
        unsub = (supabase as any)
          .channel('feed_notifications')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_notifications' }, () => {
            load();
          })
          .subscribe();
      } catch {}
    }
    return () => { clearInterval(timer); try { unsub && supabase?.removeChannel(unsub); } catch {} };
  }, []);

  const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/products', label: 'Katalog', icon: ShoppingBag },
    { path: '/feed', label: 'Feed', icon: MessageSquare },
    { path: '/sell', label: 'Jual Akun', icon: ShoppingBag },
    { path: '/help', label: 'Bantuan', icon: HelpCircle },
  ];

  return (
    <header className="bg-black/80 backdrop-blur border-b border-pink-500/30 sticky top-0 z-50">
      {/* Top bar hidden on mobile; desktop only */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
          {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-8 w-auto rounded" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">JB</span>
                </div>
              )}
              <div>
                <span className="text-xl font-bold text-white">{siteName}</span>
                <p className="text-xs text-gray-400 -mt-1">Gaming Marketplace</p>
              </div>
            </Link>

          {/* Navigation */}
            <nav className="flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-pink-500/10 text-pink-400 border border-pink-500/40'
                      : 'text-gray-300 hover:text-pink-300 hover:bg-white/5'
                  }`}
                >
                  <div className="relative">
                    <Icon size={16} />
                    {item.path === '/feed' && hasNewFeed && !isActive && (
                      <span className="absolute -top-1 -right-2 w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse" />
                    )}
                  </div>
                  <span className="relative">
                    {item.label}
                    {item.path === '/feed' && hasNewFeed && !isActive && (
                      <span className="ml-2 inline-flex items-center justify-center px-1.5 h-4 text-[10px] rounded-full bg-pink-600/30 text-pink-200 border border-pink-500/40 transition-opacity duration-500">Baru</span>
                    )}
                  </span>
                </Link>
              );
            })}
            </nav>

          {/* Auth actions */}
            <div className="flex items-center gap-2">
            {user ? (
              <Link 
                to="/profile" 
                className={`px-3 py-2 text-sm rounded-lg border border-pink-500/40 text-gray-200 hover:bg-white/5 flex items-center space-x-2 ${
                  location.pathname === '/profile' ? 'bg-pink-500/10 text-pink-400' : ''
                }`}
              >
                <User size={16} />
                <span>Profile</span>
              </Link>
            ) : (
              <Link to="/auth" className="px-3 py-2 text-sm rounded-lg border border-pink-500/40 text-gray-200 hover:bg-white/5">Masuk</Link>
            )}
            </div>
          </div>
        </div>
      </div>

  {/* Mobile navigation moved to root (MobileBottomNav) */}
    </header>
  );
};

export default Header;
