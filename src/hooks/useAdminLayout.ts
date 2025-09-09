import { useContext } from 'react';
import { AdminLayoutContext } from '../contexts/AdminLayoutContext';

export const useAdminLayout = () => {
  const context = useContext(AdminLayoutContext);
  if (context === undefined) {
    throw new Error('useAdminLayout must be used within an AdminLayoutProvider');
  }
  return context;
};
