import { User, MoreHorizontal, Shield, Clock } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '../../ui/dropdown-menu';
import { ProfileRow } from '../../../pages/admin/AdminUsers';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';

interface UsersTableProps {
  users: ProfileRow[];
  onEdit: (user: ProfileRow) => void;
  onDelete: (user: ProfileRow) => void;
  onSetRole: (userId: string, role: 'admin' | 'user') => void;
}

export function UsersTable({ users, onEdit, onDelete, onSetRole }: UsersTableProps) {
  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: id });
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>User</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead>Last Login</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="font-medium">{user.name || 'Unnamed User'}</div>
                  <div className="text-xs text-muted-foreground font-mono">{user.id.substring(0, 8)}...</div>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <div className="text-sm">
                {user.email && (
                  <div className="text-foreground flex items-center gap-1">
                    <span>{user.email}</span>
                    {user.phone_verified && (
                      <Shield size={12} className="text-green-500" />
                    )}
                  </div>
                )}
                {user.phone && (
                  <div className="text-muted-foreground text-xs">{user.phone}</div>
                )}
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={user.is_admin ? 'destructive' : 'secondary'}>
                {user.is_admin ? 'Admin' : 'User'}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock size={12} />
                {formatDate(user.created_at)}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {user.last_login_at ? (
                  <>
                    <Clock size={12} />
                    {formatDate(user.last_login_at)}
                  </>
                ) : (
                  'Never'
                )}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => onEdit(user)}>
                    View/Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onSetRole(user.id, user.is_admin ? 'user' : 'admin')}
                  >
                    {user.is_admin ? 'Demote to User' : 'Promote to Admin'}
                  </DropdownMenuItem>
                                    <DropdownMenuItem
                    className="text-red-500"
                    onClick={() => onDelete(user)}
                  >
                    Delete User
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
