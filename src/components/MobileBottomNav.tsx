import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Home, User, Newspaper } from 'lucide-react';
import { bindHoverPrefetch, warmImport, shouldPrefetch } from '../utils/prefetch';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
  { path: '/feed', label: 'Feed', icon: Newspaper },
    { path: '/products', label: 'Katalog', icon: ShoppingBag },
    { path: '/sell', label: 'Jual Akun', icon: ShoppingBag },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  React.useEffect(() => {
    if (!shouldPrefetch()) return;
    const disposers: Array<() => void> = [];
    const runPrefetch = (path: string) => {
      if (path === '/products') warmImport(() => import('../pages/ProductsPage'));
      else if (path === '/sell') warmImport(() => import('../pages/SellPage'));
      else if (path === '/feed') warmImport(() => import('../pages/HomePage'));
      else if (path === '/profile') warmImport(() => import('../pages/ProfilePage'));
      else if (path === '/') warmImport(() => import('../pages/HomePage'));
    };
    const root = document.querySelector('nav');
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur z-[1000] pb-safe-bottom" style={{ backgroundColor: 'rgba(0,0,0,0.9)', borderTop: '1px solid var(--border)' }}>
      <nav className="flex justify-around py-2 h-[62px] items-end">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-4 rounded-lg text-[11px] font-medium transition-colors ${
                isActive ? 'text-pink-400' : 'text-gray-300'
              }`}
            >
              <Icon size={22} />
              <span className="mt-1 leading-none">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
