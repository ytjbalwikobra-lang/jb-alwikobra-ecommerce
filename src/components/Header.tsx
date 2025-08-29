import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Zap, Home, Settings } from 'lucide-react';
import { isAdmin } from '../utils/auth.ts';
import { isLoggedIn } from '../services/authService.ts';
import { supabase } from '../services/supabase.ts';

const Header: React.FC = () => {
  const location = useLocation();

  const [authed, setAuthed] = React.useState(false);
  React.useEffect(() => { (async () => setAuthed(await isLoggedIn()))(); }, []);

  const navItems = [
    { path: '/', label: 'Beranda', icon: Home },
    { path: '/flash-sales', label: 'Flash Sale', icon: Zap },
    { path: '/products', label: 'Katalog', icon: ShoppingBag },
    ...(authed ? [{ path: '/orders', label: 'Order Saya', icon: ShoppingBag }] : []),
    // Admin only, hidden for non-admins
    ...(isAdmin() ? [{ path: '/admin', label: 'Admin', icon: Settings }] : []),
  ];

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">JB</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">JB Alwikobra</span>
              <p className="text-xs text-gray-500 -mt-1">Gaming Marketplace</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                    isActive
                      ? 'bg-primary-50 text-primary-600 border border-primary-200'
                      : 'text-gray-600 hover:text-primary-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Auth actions */}
          <div className="flex items-center gap-2">
            {authed ? (
              <button
                onClick={async ()=>{ if (supabase) await supabase.auth.signOut(); window.location.reload(); }}
                className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50"
              >Keluar</button>
            ) : (
              <Link to="/auth" className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50">Masuk</Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-100 bg-white">
        <nav className="flex justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-3 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'text-primary-600'
                    : 'text-gray-600'
                }`}
              >
                <Icon size={20} />
                <span className="mt-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
};

export default Header;
