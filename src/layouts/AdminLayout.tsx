import React, { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Package, Users, Zap, ListOrdered, Image as ImageIcon, Settings as SettingsIcon, Gamepad2 } from 'lucide-react';
import { useAuth } from '../contexts/TraditionalAuthContext.tsx';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const isSuper = user?.isAdmin || false;
  
  return (
    <div className="min-h-screen bg-app-dark text-gray-200">
      {/* Top Navigation */}
    <header className="sticky top-0 z-20 bg-black/80 backdrop-blur border-b border-pink-500/20">
        <div className="max-w-7xl mx-auto h-16 px-4 md:px-6 flex items-center justify-between">
      {/* Left spacer to keep tabs centered */}
      <div className="w-24" />

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
              to="/admin/game-titles"
              className={({ isActive }) => `inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${isActive ? 'bg-pink-600/20 text-pink-300' : 'hover:bg-white/5'}`}
            >
              <Gamepad2 size={16} /> Game Titles
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

          {/* Right: Logout only */}
          <button
            onClick={async ()=>{ await logout(); window.location.href='/' }}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-sm text-white"
            title="Keluar"
          >
            Keluar
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-6">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
