import React from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Zap, ListOrdered, Image as ImageIcon, Settings as SettingsIcon, Gamepad2, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/TraditionalAuthContext';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const isSuper = user?.isAdmin || false;
  const [open, setOpen] = React.useState(false);

  const links = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/products', label: 'Produk', icon: Package },
    { to: '/admin/flash-sales', label: 'Flash Sale', icon: Zap },
    { to: '/admin/posts', label: 'Posts', icon: LayoutDashboard },
    { to: '/admin/game-titles', label: 'Game Titles', icon: Gamepad2 },
    { to: '/admin/orders', label: 'Orders', icon: ListOrdered },
    { to: '/admin/banners', label: 'Banners', icon: ImageIcon },
    { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
  ];
  if (isSuper) links.push({ to: '/admin/users', label: 'Users', icon: Users } as any);

  return (
    <div className="min-h-screen bg-app-dark text-gray-200">
      {/* Top bar */}
      <header className="sticky top-0 z-30 bg-black/80 backdrop-blur border-b border-pink-500/20 pt-safe-top">
        <div className="h-14 px-4 md:px-6 flex items-center justify-between">
          <button onClick={() => setOpen(!open)} className="md:hidden text-gray-200" aria-label="Menu">
            <Menu size={20} />
          </button>
          <div className="flex-1 text-center md:text-left font-semibold">Admin</div>
          <button
            onClick={async ()=>{ await logout(); window.location.href='/' }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm text-white"
            title="Keluar"
          >
            <LogOut size={16} />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>
      </header>

      {/* Shell with sidebar */}
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr]">
        {/* Sidebar */}
        <aside className={`bg-black/60 border-r border-white/10 md:sticky md:top-14 md:h-[calc(100vh-56px)] overflow-y-auto ${open ? 'block' : 'hidden'} md:block`}>
          <nav className="py-3">
            {links.map((l) => {
              const Icon = l.icon as any;
              return (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={(l as any).end}
                  className={({ isActive }) => `flex items-center gap-3 px-4 py-2 text-sm font-medium border-l-2 transition-colors ${isActive ? 'text-pink-300 bg-pink-600/10 border-pink-500' : 'text-gray-300 hover:text-pink-200 hover:bg-white/5 border-transparent'}`}
                >
                  <Icon size={16} />
                  <span>{l.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
