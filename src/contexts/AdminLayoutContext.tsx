import React, { createContext, useState, useMemo } from 'react';

interface AdminLayoutContextType {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  pageTitle: string;
  setPageTitle: React.Dispatch<React.SetStateAction<string>>;
}

export const AdminLayoutContext = createContext<AdminLayoutContextType | undefined>(undefined);

export const AdminLayoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  const value = useMemo(() => ({
    sidebarOpen,
    setSidebarOpen,
    pageTitle,
    setPageTitle,
  }), [sidebarOpen, pageTitle]);

  return (
    <AdminLayoutContext.Provider value={value}>
      {children}
    </AdminLayoutContext.Provider>
  );
};
