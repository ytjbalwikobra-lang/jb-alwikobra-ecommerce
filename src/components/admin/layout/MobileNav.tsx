import React from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Home,
  LineChart,
  Package,
  Package2,
  ShoppingCart,
  Users,
} from 'lucide-react';

import { Button } from '../../ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card';

export function MobileNav() {
  return (
    <div className="flex-1">
      <nav className="grid items-start px-4 text-sm font-medium">
        <Link
          to="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <Home className="h-4 w-4" />
          Dashboard
        </Link>
        <Link
          to="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <ShoppingCart className="h-4 w-4" />
          Orders
          <div className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            6
          </div>
        </Link>
        <Link
          to="#"
          className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary"
        >
          <Package className="h-4 w-4" />
          Products{' '}
        </Link>
        <Link
          to="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <Users className="h-4 w-4" />
          Customers
        </Link>
        <Link
          to="#"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <LineChart className="h-4 w-4" />
          Analytics
        </Link>
      </nav>
    </div>
  );
}
