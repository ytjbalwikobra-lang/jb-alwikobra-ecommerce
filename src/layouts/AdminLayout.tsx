import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Zap, ListOrdered, Image as ImageIcon, Settings as SettingsIcon } from 'lucide-react';
import { getUserRole } from '../services/authService.ts';

const AdminLayout: React.FC = () => {
  const [role, setRole] = useState<string>('');
  useEffect(()=>{ (async()=> setRole(await getUserRole()))(); }, []);
  const isSuper = (()=>{
    const r = String(role).toLowerCase().trim().replace(/\s+/g,' ');
    return r==='super admin' || r==='superadmin' || r==='owner' || r==='super-admin';
  })();
  return (
    <div className="min-h-screen bg-app-dark text-gray-200">
      {/* Top Navigation */}
      <header className="sticky top-0 z-20 bg-black/80 backdrop-blur border-b border-pink-500/20">
        <div className="h-16 px-4 md:px-6 flex items-center justify-between">
          {/* Brand */}
          <Link to="/" className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600" />
            <span className="font-bold hidden sm:block">Admin Panel</span>
          </Link>

          {/* Nav Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-white/5'}`}
            >
              <LayoutDashboard size={16} /> Dashboard
            </NavLink>
            <NavLink
              to="/admin/products"
              className={({ isActive }) => `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-white/5'}`}
            >
              <Package size={16} /> Produk
            </NavLink>
            <NavLink
              to="/admin/flash-sales"
              className={({ isActive }) => `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-white/5'}`}
            >
              <Zap size={16} /> Flash Sale
            </NavLink>
            <NavLink
              to="/admin/orders"
              className={({ isActive }) => `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-white/5'}`}
            >
              <ListOrdered size={16} /> Orders
            </NavLink>
            <NavLink
              to="/admin/banners"
              className={({ isActive }) => `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-white/5'}`}
            >
              <ImageIcon size={16} /> Banners
            </NavLink>
            <NavLink
              to="/admin/settings"
              className={({ isActive }) => `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-white/5'}`}
            >
              <SettingsIcon size={16} /> Settings
            </NavLink>
            {isSuper && (
              <NavLink
                to="/admin/users"
                className={({ isActive }) => `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-white/5'}`}
              >
                <Users size={16} /> Users
              </NavLink>
            )}
          </nav>

          {/* Right Slot */}
          <div className="text-xs md:text-sm text-gray-400">JB Alwikobra</div>
        </div>
      </header>

      {/* Content */}
      <main className="p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
