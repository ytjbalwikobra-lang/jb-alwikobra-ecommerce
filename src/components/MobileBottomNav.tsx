import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Zap, Home, User, Newspaper } from 'lucide-react';

const MobileBottomNav: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
  { path: '/feed', label: 'Feed', icon: Newspaper },
    { path: '/products', label: 'Katalog', icon: ShoppingBag },
    { path: '/sell', label: 'Jual Akun', icon: ShoppingBag },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 backdrop-blur z-[1000] pb-safe-bottom" style={{ backgroundColor: 'rgba(0,0,0,0.9)', borderTop: '1px solid var(--border)' }}>
      <nav className="flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center py-2 px-4 rounded-lg text-xs font-medium transition-colors ${
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
