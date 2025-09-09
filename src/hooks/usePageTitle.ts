import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAdminLayout } from './useAdminLayout';

const navItems = [
  { name: 'Dashboard', path: '/admin', end: true },
  { name: 'Produk', path: '/admin/products' },
  { name: 'Flash Sale', path: '/admin/flash-sales' },
  { name: 'Game Titles', path: '/admin/game-titles' },
  { name: 'Orders', path: '/admin/orders' },
  { name: 'Banners', path: '/admin/banners' },
  { name: 'Users', path: '/admin/users' },
  { name: 'Settings', path: '/admin/settings' },
];

export const usePageTitle = () => {
  const { setPageTitle } = useAdminLayout();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    // Find the best match. For paths like /admin/products/edit/1, it should match /admin/products.
    const bestMatch = navItems
      .filter(item => currentPath.startsWith(item.path))
      .sort((a, b) => b.path.length - a.path.length)[0]; // Get the most specific match

    if (bestMatch) {
      setPageTitle(bestMatch.name);
    } else {
      setPageTitle('Admin'); // Default title
    }
  }, [location.pathname, setPageTitle]);
};
