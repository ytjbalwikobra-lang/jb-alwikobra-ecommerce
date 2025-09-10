import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, MessageSquare, Home, HelpCircle, User } from 'lucide-react';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { supabase } from '../services/supabase';

const Header: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const [siteName, setSiteName] = React.useState<string>('JB Alwikobra');
  const [logoUrl, setLogoUrl] = React.useState<string | undefined>(undefined);
  const [hasNewFeed, setHasNewFeed] = React.useState(false);
  
  // Lazy load settings to improve initial page load
  React.useEffect(() => {
    let mounted = true;
    const loadSettings = async () => {
      try {
        const { SettingsService } = await import('../services/settingsService');
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

  // Poll feed notifications and indicate new items
  React.useEffect(() => {
    let intervalTimer: NodeJS.Timeout | null = null;
    let unsub: any;
    const token = localStorage.getItem('session_token') || '';
    const load = async () => {
      try {
        if (!token) return;
        const res = await fetch('/api/feed?action=notifications', { headers: { 'Authorization': `Bearer ${token}` } });
        const j = await res.json() as { notifications?: Array<{ read_at?: string }> };
        const hasUnread = (j.notifications || []).some((n) => !n.read_at);
        setHasNewFeed(hasUnread);
      } catch {
        // Silent fail
      }
    };
    void load();
    intervalTimer = setInterval(() => {
      void load();
    }, 30000);
    // Optional realtime hook if supabase available
    if (supabase) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
        unsub = (supabase as any)
          .channel('feed_notifications')
          .on('postgres_changes', { event: '*', schema: 'public', table: 'feed_notifications' }, () => {
            void load();
          })
          .subscribe();
      } catch {
        // Silent fail
      }
    }
    return () => { 
      if (intervalTimer) {
        clearInterval(intervalTimer);
      }
      try { 
        if (unsub && supabase) {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
          (supabase as any).removeChannel(unsub); 
        }
      } catch {
        // Silent fail
      } 
    };
  }, []);

  const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/products', label: 'Katalog', icon: ShoppingBag },
    { path: '/feed', label: 'Feed', icon: MessageSquare },
    { path: '/sell', label: 'Jual Akun', icon: ShoppingBag },
    { path: '/help', label: 'Bantuan', icon: HelpCircle },
  ];

  return (
    <header className="bg-black/95 backdrop-blur-md border-b border-pink-500/20 sticky top-0 z-50 shadow-lg">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
      
      {/* Always visible navigation */}
      <div className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 group">
              {logoUrl ? (
                <img 
                  src={logoUrl} 
                  alt={siteName} 
                  className="h-8 w-auto rounded-lg group-hover:shadow-lg group-hover:shadow-pink-500/20 transition-all duration-300" 
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-pink-600 rounded-lg flex items-center justify-center group-hover:shadow-lg group-hover:shadow-pink-500/20 transition-all duration-300 group-hover:scale-105">
                  <span className="text-white font-bold text-sm">JB</span>
                </div>
              )}
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                  {siteName}
                </span>
                <p className="text-xs text-gray-400 -mt-1 hidden sm:block">Gaming Marketplace</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2 relative group ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border border-pink-500/40 shadow-lg shadow-pink-500/20'
                        : 'text-gray-300 hover:text-pink-300 hover:bg-white/5 hover:border hover:border-pink-500/20'
                    }`}
                  >
                    <div className="relative">
                      <Icon size={16} />
                      {item.path === '/feed' && hasNewFeed && !isActive && (
                        <span className="absolute -top-1 -right-2 w-2.5 h-2.5 bg-pink-500 rounded-full animate-pulse shadow-lg shadow-pink-500/50" />
                      )}
                    </div>
                    <span className="relative">
                      {item.label}
                      {item.path === '/feed' && hasNewFeed && !isActive && (
                        <span className="ml-2 inline-flex items-center justify-center px-1.5 h-4 text-[10px] rounded-full bg-gradient-to-r from-pink-600/30 to-purple-600/30 text-pink-200 border border-pink-500/40 transition-all duration-500 animate-pulse">
                          Baru
                        </span>
                      )}
                    </span>
                    {!isActive && (
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-pink-400 to-purple-400 group-hover:w-full transition-all duration-300"></span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Auth actions */}
            <div className="flex items-center gap-2">
              {user ? (
                <Link
                  to="/profile"
                  className={`px-3 py-2 text-sm rounded-lg border transition-all duration-300 flex items-center space-x-2 group ${
                    location.pathname === '/profile' 
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-400 border-pink-500/40 shadow-lg shadow-pink-500/20' 
                      : 'border-pink-500/40 text-gray-200 hover:bg-white/5 hover:text-pink-300'
                  }`}
                >
                  <User size={16} />
                  <span className="hidden sm:inline">Profile</span>
                </Link>
              ) : (
                <Link 
                  to="/auth" 
                  className="px-4 py-2 text-sm rounded-lg bg-gradient-to-r from-pink-500 to-purple-500 text-white hover:from-pink-600 hover:to-purple-600 transition-all duration-300 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transform hover:scale-105"
                >
                  <span className="hidden sm:inline">Masuk</span>
                  <span className="sm:hidden">
                    <User size={16} />
                  </span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
