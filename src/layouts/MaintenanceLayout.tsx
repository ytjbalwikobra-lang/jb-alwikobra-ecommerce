import React from 'react';

interface MaintenanceLayoutProps {
  children: React.ReactNode;
}

const MaintenanceLayout: React.FC<MaintenanceLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-app-dark">
      {children}
    </div>
  );
};

export default MaintenanceLayout;
