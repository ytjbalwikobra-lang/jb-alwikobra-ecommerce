import { useContext } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  Users,
  Zap,
  ListOrdered,
  ImageIcon,
  Settings,
  Gamepad2,
  ChevronUp,
  Home,
} from 'lucide-react';
import { AuthContext } from '../../../contexts/TraditionalAuthContext';
import { useAdminLayout } from '../../../hooks/useAdminLayout';

const navItems = [
  { name: 'Dashboard', to: '/admin', icon: LayoutDashboard, end: true },
  { name: 'Produk', to: '/admin/products', icon: Package },
  { name: 'Flash Sale', to: '/admin/flash-sales', icon: Zap },
  { name: 'Game Titles', to: '/admin/game-titles', icon: Gamepad2 },
  { name: 'Orders', to: '/admin/orders', icon: ListOrdered },
  { name: 'Banners', to: '/admin/banners', icon: ImageIcon },
  { name: 'Users', to: '/admin/users', icon: Users, adminOnly: true },
];

const NavItem: React.FC<{
  to: string;
  icon: React.ElementType;
  children: React.ReactNode;
  end?: boolean;
}> = ({ to, icon: Icon, children, end }) => {
  const location = useLocation();
  const { setSidebarOpen } = useAdminLayout();
  const isActive = end
    ? location.pathname === to
    : location.pathname.startsWith(to);

  return (
    <NavLink
      to={to}
      end={end}
      onClick={() => setSidebarOpen(false)}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary ${
        isActive ? 'bg-muted text-primary' : ''
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </NavLink>
  );
};

export const SidebarNav: React.FC = () => {
  const location = useLocation();
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const isSuper = user?.isAdmin || false;

  return (
    <nav className="grid items-start px-4 text-sm font-medium">
      {navItems.map(
        (item) =>
          (!item.adminOnly || isSuper) && (
            <NavItem key={item.name} to={item.to} icon={item.icon} end={item.end}>
              {item.name}
            </NavItem>
          )
      )}
       <div className="my-4 border-t -mx-4"></div>
        <NavItem to="/admin/settings" icon={Settings}>
            Settings
        </NavItem>
        <a
            href="/"
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
            <Home className="h-4 w-4" />
            Back to Store
        </a>
    </nav>
  );
};
