import React from 'react';
import { ShoppingBag, MessageSquare, Home, User } from 'lucide-react';
import { MobileNavItem, useMobileNavigation } from './mobile';

const MobileBottomNav: React.FC = () => {
  const { currentPath, hasNewFeed } = useMobileNavigation();

  const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/products', label: 'Katalog', icon: ShoppingBag },
    { path: '/feed', label: 'Feed', icon: MessageSquare },
    { path: '/sell', label: 'Jual Akun', icon: ShoppingBag },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-pink-500/30 bg-black/98 backdrop-blur-md z-[9999] shadow-2xl" style={{ height: 'calc(64px + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-t from-pink-500/10 via-pink-500/5 to-transparent pointer-events-none"></div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full"></div>
      
      <nav className="relative flex justify-around py-2" style={{ height: 64 }}>
        {navItems.map((item) => (
          <MobileNavItem
            key={item.path}
            path={item.path}
            label={item.label}
            icon={item.icon}
            isActive={currentPath === item.path}
            hasNotification={item.path === '/feed' && hasNewFeed}
          />
        ))}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
