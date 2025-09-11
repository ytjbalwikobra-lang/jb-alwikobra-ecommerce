import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Home, HelpCircle, User, Rss } from 'lucide-react';
import { bindHoverPrefetch, warmImport, shouldPrefetch } from '../utils/prefetch';
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

  // Light prefetch of routes on hover/touch
  React.useEffect(() => {
    if (!shouldPrefetch()) return;
    const disposers: Array<() => void> = [];
    const runPrefetch = (path: string) => {
      // dynamic import warmups for key routes
      if (path === '/products') warmImport(() => import('../pages/ProductsPage'));
      else if (path === '/sell') warmImport(() => import('../pages/SellPage'));
      else if (path === '/feed') warmImport(() => import('../pages/HomePage'));
      else if (path === '/help') warmImport(() => import('../pages/HelpPage'));
      else if (path === '/') warmImport(() => import('../pages/HomePage'));
    };
    // attach to all header nav links when rendered (desktop only here)
    const root = document.querySelector('header nav');
    if (root) {
      root.querySelectorAll('a[href]')?.forEach((el) => {
        const href = (el as HTMLAnchorElement).getAttribute('href') || '';
        if (!href.startsWith('/')) return;
        disposers.push(bindHoverPrefetch(el, () => runPrefetch(href)));
      });
    }
    return () => { disposers.forEach(d => d()); };
  }, []);

  return (
    <header className="backdrop-blur-md fixed top-0 left-0 right-0 z-50 pt-safe-top bg-ios-background/90 border-b border-ios-border h-14 md:h-16">
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
        <IOSContainer>
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-3">
              {logoUrl ? (
                <img src={logoUrl} alt={siteName} className="h-10 w-10 rounded-xl object-cover" />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-ios-accent to-pink-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">JB</span>
                </div>
              )}
              <div>
                <span className="text-xl font-bold text-ios-text">{siteName}</span>
                <p className="text-xs text-ios-text-secondary -mt-1">Gaming Marketplace</p>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="flex space-x-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                      isActive
                        ? 'bg-ios-accent/10 text-ios-accent border border-ios-accent/20'
                        : 'text-ios-text-secondary hover:text-ios-text hover:bg-ios-surface/50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Auth actions */}
            <div className="flex items-center gap-3">
              {user ? (
                <Link 
                  to="/profile" 
                  className="w-10 h-10 bg-ios-surface rounded-full flex items-center justify-center border border-ios-border transition-all duration-200 hover:border-ios-accent/50"
                >
                  <User size={18} className="text-ios-text" />
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link 
                    to="/auth" 
                    className="px-4 py-2 text-sm font-medium text-ios-text-secondary hover:text-ios-text transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link 
                    to="/auth" 
                    className="px-4 py-2 bg-ios-accent text-white text-sm font-medium rounded-xl transition-all duration-200 hover:bg-ios-accent/90 active:scale-95"
                  >
                    Daftar
                  </Link>
                </div>
              )}
            </div>
          </div>
        </IOSContainer>
      </div>
    </header>
  );
};

export default Header;
