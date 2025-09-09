import React from 'react';
import { Link } from 'react-router-dom';
import { Package2 } from 'lucide-react';
import { SidebarNav } from './SidebarNav';
import { useSettings } from '../../../hooks/useSettings';
import { useAdminLayout } from '../../../hooks/useAdminLayout';

export const Sidebar: React.FC = () => {
  const { settings } = useSettings();
  const { sidebarOpen, setSidebarOpen } = useAdminLayout();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/60 md:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex-col border-r bg-background transition-transform duration-300 ease-in-out md:flex md:static md:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } w-72`}
      >
        <div className="flex h-16 items-center gap-4 border-b px-6">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt={settings.siteName || 'Logo'} className="h-8 w-8 object-contain rounded-md" />
            ) : (
              <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
                <Package2 className="h-5 w-5 text-primary-foreground" />
              </div>
            )}
            <span className="">{settings?.siteName || 'Admin Panel'}</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <SidebarNav />
        </div>
      </aside>
    </>
  );
};
