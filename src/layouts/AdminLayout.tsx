import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Zap, LogOut, Home, Users, ListOrdered, Image as ImageIcon, Settings as SettingsIcon } from 'lucide-react';
import { getUserRole } from '../services/authService.ts';

const AdminLayout: React.FC = () => {
  const [role, setRole] = useState<string>('');
  useEffect(()=>{ (async()=> setRole(await getUserRole()))(); }, []);
  const isSuper = (()=>{
    const r = String(role).toLowerCase().trim().replace(/\s+/g,' ');
    return r==='super admin' || r==='superadmin' || r==='owner' || r==='super-admin';
  })();
  return (
    <div className="min-h-screen bg-app-dark text-gray-200 flex">
      {/* Sidebar */}
      <aside className="hidden md:flex md:w-64 bg-black border-r border-pink-500/20 flex-col">
        <div className="h-16 flex items-center px-5 border-b border-pink-500/20">
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600" />
            <span className="font-bold">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-white/5'
              }`
            }
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-white/5'
              }`
            }
          >
            <Package size={18} />
            <span>Produk</span>
          </NavLink>
          <NavLink
            to="/admin/flash-sales"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-white/5'
              }`
            }
          >
            <Zap size={18} />
            <span>Flash Sale</span>
          </NavLink>
          <NavLink
            to="/admin/orders"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-white/5'
              }`
            }
          >
            <ListOrdered size={18} />
            <span>Orders</span>
          </NavLink>
          <NavLink
            to="/admin/banners"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-white/5'
              }`
            }
          >
            <ImageIcon size={18} />
            <span>Banners</span>
          </NavLink>
          <NavLink
            to="/admin/settings"
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                isActive ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-white/5'
              }`
            }
          >
            <SettingsIcon size={18} />
            <span>Settings</span>
          </NavLink>
          {isSuper && (
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-white/5'
                }`
              }
            >
              <Users size={18} />
              <span>Users</span>
            </NavLink>
          )}
        </nav>
        <div className="p-4 border-t border-pink-500/20 text-sm text-gray-400">
          <p className="mb-3">Masuk sebagai <span className="text-white">Admin</span></p>
          <div className="flex gap-2">
            <Link to="/" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5">
              <Home size={16} /> Beranda
            </Link>
            <button className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5">
              <LogOut size={16} /> Keluar
            </button>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0">
        {/* Topbar */}
        <header className="h-16 flex items-center justify-between px-4 md:px-6 border-b border-pink-500/20 bg-black/60 backdrop-blur sticky top-0 z-10">
          <div className="flex items-center gap-3 md:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600" />
            <span className="font-bold">Admin</span>
          </div>
          <div className="flex-1" />
          <div className="text-sm text-gray-400">JB Alwikobra</div>
        </header>

        {/* Content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
