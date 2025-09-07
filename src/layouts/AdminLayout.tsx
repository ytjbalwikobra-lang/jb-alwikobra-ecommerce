import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Users, Zap, ListOrdered, Image as ImageIcon, 
  Settings as SettingsIcon, Gamepad2, Menu, X, LogOut,
  ChevronDown, User, Home
} from 'lucide-react';
import { useAuth } from '../contexts/TraditionalAuthContext.tsx';
import { useSettings } from '../hooks/useSettings.ts';
import '../styles/admin.css';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const isSuper = user?.isAdmin || false;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  const navigation = [
    { name: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Produk', to: '/admin/products', icon: Package },
    { name: 'Flash Sale', to: '/admin/flash-sales', icon: Zap },
    { name: 'Game Titles', to: '/admin/game-titles', icon: Gamepad2 },
    { name: 'Orders', to: '/admin/orders', icon: ListOrdered },
    { name: 'Banners', to: '/admin/banners', icon: ImageIcon },
    { name: 'Settings', to: '/admin/settings', icon: SettingsIcon },
    ...(isSuper ? [{ name: 'Users', to: '/admin/users', icon: Users }] : []),
  ];

  const getPageTitle = () => {
    const currentPath = location.pathname;
    const nav = navigation.find(item => 
      item.end ? currentPath === item.to : currentPath.startsWith(item.to)
    );
    return nav?.name || 'Admin Panel';
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between h-16 px-6" style={{borderBottom: '1px solid rgba(236, 72, 153, 0.3)'}}>
          <div className="flex items-center space-x-3">
            {settings?.logoUrl ? (
              <img 
                src={settings.logoUrl} 
                alt={settings.siteName || 'JB Alwikobra'} 
                className="w-8 h-8 rounded-lg object-contain"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">JB</span>
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-white">Admin Panel</h1>
              <p className="text-xs text-gray-400">{settings?.siteName || 'JB Alwikobra'}</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-gray-400 hover:text-gray-300 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-pink-600/20 text-pink-300 border-r-2 border-pink-500'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div style={{borderTop: '1px solid rgba(236, 72, 153, 0.3)', padding: '16px'}}>
          <Link 
            to="/"
            className="flex items-center px-3 py-2 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
          >
            <Home className="mr-3 h-4 w-4" />
            Kembali ke Toko
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        {/* Top Bar */}
        <header className="admin-header">
          {/* Left: Menu Button + Page Title */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-white/5 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-white">{getPageTitle()}</h2>
              <p className="text-sm text-gray-400">
                {new Date().toLocaleDateString('id-ID', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
          </div>

          {/* Right: User Menu */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-400">{user?.email}</p>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-black border border-pink-500/30 z-50">
                  <div className="py-1">
                    <div className="px-4 py-3 border-b border-pink-500/30">
                      <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                      <p className="text-sm text-gray-400">{user?.email}</p>
                    </div>
                    <button
                      onClick={async () => {
                        await logout();
                        window.location.href = '/';
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-300 hover:bg-white/5 hover:text-white"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Keluar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="admin-content">
          {/* Force remount on path change to avoid stale content */}
          <Outlet key={location.pathname} />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
