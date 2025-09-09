import React, { useContext } from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "../../ui/dropdown-menu"
import { Button } from '../../ui/button'; // Assuming you have a button component
import { CreditCard, LogOut, Mail, MessageSquare, PlusCircle, Settings, User, UserPlus } from "lucide-react";
import { AuthContext } from '../../../contexts/TraditionalAuthContext';
import { Link } from 'react-router-dom';

export const UserNav: React.FC = () => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const logout = auth?.logout;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name || 'User'} />}
            <AvatarFallback>
              <User />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name || 'User'}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link to="/admin/settings">Settings</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
             <a href="/" target="_blank" rel="noopener noreferrer">Go to Store</a>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
