import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from '../components/admin/layout/Sidebar';
import { AdminHeader } from '../components/admin/layout/AdminHeader';
import AdminRouteBoundary from '../components/admin/AdminRouteBoundary';
import { useAdminLayout } from '../hooks/useAdminLayout';
import { usePageTitle } from '../hooks/usePageTitle';

const AdminLayoutContent: React.FC = () => {
  const { pageTitle } = useAdminLayout();
  const location = useLocation();

  // Reset scroll on content area when navigating
  useEffect(() => {
    const contentElement = document.getElementById('admin-content-area');
    if (contentElement) {
      contentElement.scrollTop = 0;
    }
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <Sidebar />
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-14 md:pl-0 md:ml-72">
        <AdminHeader pageTitle={pageTitle} />
        <main id="admin-content-area" className="flex-1 gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 overflow-auto">
          <AdminRouteBoundary>
            <Outlet />
          </AdminRouteBoundary>
        </main>
      </div>
    </div>
  );
};

const AdminLayout: React.FC = () => {
  // This component now just sets up the title logic
  usePageTitle(); 
  
  return <AdminLayoutContent />;
};

export default AdminLayout;
