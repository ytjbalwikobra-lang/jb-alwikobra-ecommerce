import React, { useEffect, useState, useCallback } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Package, Users, Zap, ListOrdered, Image as ImageIcon, 
  Settings as SettingsIcon, Gamepad2, Menu, X, LogOut,
  ChevronDown, User, Home, Bell, Search
} from 'lucide-react';
import { useAuth } from '../contexts/TraditionalAuthContext.tsx';
import { useSettings } from '../hooks/useSettings.ts';
import '../styles/admin.css';
import AdminErrorBoundary from '../components/admin/AdminErrorBoundary.tsx';

interface NotificationBadgeProps {
  count: number;
}

const NotificationBadge: React.FC<NotificationBadgeProps> = ({ count }) => {
  if (count === 0) return null;
  
  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  );
};

const AdminLayoutRefactored: React.FC = () => {
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const location = useLocation();
  const isSuper = user?.isAdmin || false;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState(0); // Mock notification count

  // Close sidebar on route change (mobile) and reset user menu
  useEffect(() => {
    setSidebarOpen(false);
    setUserMenuOpen(false);
    
    // Ensure content scroll position resets on route change
    const content = document.querySelector('.admin-content');
    if (content) content.scrollTop = 0;
  }, [location.pathname]);

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.user-menu-container')) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation configuration
  const navigation = [
    { name: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true, badge: 0 },
    { name: 'Produk', to: '/admin/products', icon: Package, badge: 0 },
    { name: 'Flash Sale', to: '/admin/flash-sales', icon: Zap, badge: 0 },
    { name: 'Game Titles', to: '/admin/game-titles', icon: Gamepad2, badge: 0 },
    { name: 'Orders', to: '/admin/orders', icon: ListOrdered, badge: notifications },
    { name: 'Banners', to: '/admin/banners', icon: ImageIcon, badge: 0 },
    ...(isSuper ? [{ name: 'Users', to: '/admin/users', icon: Users, badge: 0 }] : []),
  ];

  // Get page title
  const getPageTitle = useCallback(() => {
    const currentPath = location.pathname;
    const nav = navigation.find(item => 
      item.end ? currentPath === item.to : currentPath.startsWith(item.to)
    );
    if (currentPath.startsWith('/admin/settings')) return 'Settings';
    return nav?.name || 'Admin Panel';
  }, [location.pathname, navigation]);

  // Handle logout
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [logout]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K for search (future feature)
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        // Open search modal
        console.log('Search shortcut triggered');
      }
      
      // Escape to close sidebar on mobile
      if (event.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [sidebarOpen]);

  return (
    <AdminErrorBoundary>
      <div className="admin-layout">
        {/* Sidebar */}
        <div className={`admin-sidebar ${sidebarOpen ? 'open' : ''}`}>
          {/* Sidebar Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-orange-500/30">
            <div className="flex items-center space-x-3">
              {settings?.logoUrl ? (
                <img 
                  src={settings.logoUrl} 
                  alt={settings.siteName || 'JB Alwikobra'} 
                  className="w-8 h-8 rounded-lg object-contain"
                />
              ) : (
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
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
              className="p-1 rounded-md text-gray-400 hover:text-gray-300 lg:hidden transition-colors"
              aria-label="Close sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigation.map((item) => {
              const active = item.end ? location.pathname === item.to : location.pathname.startsWith(item.to);
              return (
                <NavLink
                  key={item.name}
                  to={item.to}
                  end={item.end}
                  className={() =>
                    `relative group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active
                        ? 'bg-orange-600/20 text-orange-300 border-r-2 border-orange-500 shadow-lg'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white hover:shadow-md'
                    }`
                  }
                >
                  <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="flex-1">{item.name}</span>
                  {item.badge > 0 && <NotificationBadge count={item.badge} />}
                </NavLink>
              );
            })}
          </nav>

          {/* Sidebar Footer */}
          <div className="border-t border-orange-500/30 p-4 space-y-2">
            {/* Settings */}
            <NavLink
              to="/admin/settings"
              className={() => {
                const active = location.pathname.startsWith('/admin/settings');
                return `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                  active
                    ? 'bg-orange-600/20 text-orange-300 border-r-2 border-orange-500'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white'
                }`;
              }}
            >
              <SettingsIcon className="mr-3 h-5 w-5 flex-shrink-0" />
              Settings
            </NavLink>
            
            {/* Back to Store */}
            <Link 
              to="/"
              className="flex items-center px-3 py-2.5 text-sm text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-all duration-200"
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
                className="p-2 rounded-md text-gray-400 hover:text-gray-300 hover:bg-white/5 lg:hidden transition-colors"
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h2 className="text-xl font-semibold text-white">{getPageTitle()}</h2>
                <p className="text-sm text-gray-400 hidden sm:block">
                  {new Date().toLocaleDateString('id-ID', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            {/* Right: Search + Notifications + User Menu */}
            <div className="flex items-center space-x-3">
              {/* Search Button (future feature) */}
              <button 
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors hidden sm:block"
                title="Search (Ctrl+K)"
                onClick={() => console.log('Search clicked')}
              >
                <Search className="h-5 w-5" />
              </button>
              
              {/* Notifications */}
              <button 
                className="relative p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Notifications"
                onClick={() => console.log('Notifications clicked')}
              >
                <Bell className="h-5 w-5" />
                {notifications > 0 && <NotificationBadge count={notifications} />}
              </button>

              {/* User Menu */}
              <div className="relative user-menu-container">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                  aria-label="User menu"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-400 truncate max-w-32">{user?.email}</p>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-lg bg-gray-900 border border-orange-500/30 z-50">
                    <div className="py-1">
                      <div className="px-4 py-3 border-b border-orange-500/30">
                        <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
                        <p className="text-sm text-gray-400 break-words">{user?.email}</p>
                        <p className="text-xs text-orange-400 mt-1">
                          {isSuper ? 'Super Admin' : 'Admin'}
                        </p>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
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
            {/* Force remount on navigation to avoid stale content */}
            <Outlet key={(location as any).key || location.pathname} />
          </main>
        </div>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-gray-900/75 lg:hidden transition-opacity"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          />
        )}
      </div>
    </AdminErrorBoundary>
  );
};

export default AdminLayoutRefactored;
