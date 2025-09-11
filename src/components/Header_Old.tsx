import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Zap, Home, Settings, HelpCircle, User, Rss } from 'lucide-react';
import { useAuth } from '../contexts/TraditionalAuthContext';
import { IOSContainer } from './ios/IOSDesignSystem';

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

  const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/feed', label: 'Feed', icon: Rss },
    { path: '/products', label: 'Katalog', icon: ShoppingBag },
    { path: '/sell', label: 'Jual Akun', icon: ShoppingBag },
    { path: '/help', label: 'Bantuan', icon: HelpCircle },
  ];

  return (
    <header className="backdrop-blur-md sticky top-0 z-50 pt-safe-top bg-ios-background/90 border-b border-ios-border">
      {/* Mobile compact header */}
      <div className="md:hidden">
        <IOSContainer padding={false} className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center space-x-3">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-ios-accent to-pink-600 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">JB</span>
                </div>
              )}
              <span className="text-lg font-bold text-ios-text">{siteName}</span>
            </Link>
            
            {/* Mobile user avatar */}
            <Link 
              to="/profile" 
              className="w-8 h-8 bg-ios-surface rounded-full flex items-center justify-center border border-ios-border transition-all duration-200 active:scale-95"
            >
              <User size={16} className="text-ios-text-secondary" />
            </Link>
          </div>
        </IOSContainer>
      </div>


      {/* Desktop header */}
      <div className="hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
          {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-8 w-auto rounded" />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-600) 100%)' }}>
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
                      ? 'text-pink-400'
                      : 'text-gray-300 hover:text-pink-300'
                  }`}
                  style={isActive ? { backgroundColor: 'rgba(236,72,153,0.1)', border: '1px solid rgba(236,72,153,0.4)' } : {}}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
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
