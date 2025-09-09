import React from 'react';
import { Menu } from 'lucide-react';
import { UserNav } from './UserNav';
import { useAdminLayout } from '../../../hooks/useAdminLayout';

interface AdminHeaderProps {
  pageTitle: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ pageTitle }) => {
  const { setSidebarOpen } = useAdminLayout();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <button
        onClick={() => setSidebarOpen(true)}
        className="p-2 rounded-md text-muted-foreground hover:text-foreground md:hidden"
        aria-label="Open sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="flex-1">
        <h1 className="text-lg font-semibold">{pageTitle}</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Can add other header items here */}
      </div>
      <UserNav />
    </header>
  );
};
