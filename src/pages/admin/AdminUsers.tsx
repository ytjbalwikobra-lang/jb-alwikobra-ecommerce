import React, { useState, useEffect, useCallback } from 'react';
import { useToast } from '../../components/Toast';
import { adminService } from '../../services/adminService';
import { Card, CardContent } from '../../components/ui/card';
import { UsersPageHeader } from '../../components/admin/users/UsersPageHeader';
import { UsersTable } from '../../components/admin/users/UsersTable';
import { UserFormModal } from '../../components/admin/users/UserFormModal';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../../components/ui/alert-dialog";
import { usePageTitle } from '../../hooks/usePageTitle';

export type ProfileRow = {
  id: string;
  name: string | null;
  is_admin: boolean;
  email?: string | null;
  phone?: string | null;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
  phone_verified?: boolean;
  is_active?: boolean;
};

const useAdminUsers = () => {
  const [users, setUsers] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingUser, setEditingUser] = useState<ProfileRow | null>(null);
  const [deletingUser, setDeletingUser] = useState<ProfileRow | null>(null);
  const { push } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await adminService.getUsers();
      if (result.error) throw new Error(result.error.message);
      setUsers(result.data || []);
    } catch (error: any) {
      push(error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [push]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSetRole = async (userId: string, role: 'admin' | 'user') => {
    try {
      const response = await fetch('/api/admin?action=users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userId, isAdmin: role === 'admin' }),
      });
      const result = await response.json();
      if (!result.success) throw new Error(result.error);
      push('User role updated.', 'success');
      fetchUsers();
    } catch (error: any) {
      push(`Error updating role: ${error.message}`, 'error');
    }
  };

  const handleSaveUser = async (userToSave: ProfileRow) => {
    // This is a simulation. In a real app, you'd call an API.
    console.log('Saving user (simulation):', userToSave);
    push('User details updated (simulation).', 'success');
    setEditingUser(null);
    fetchUsers();
  };
  
  const handleDeleteUserConfirm = async () => {
    if (!deletingUser) return;
    // This is a simulation. In a real app, you'd call an API.
    console.log('Deleting user (simulation):', deletingUser.id);
    push('User deleted (simulation).', 'success');
    setDeletingUser(null);
    fetchUsers();
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      user.id.toLowerCase().includes(searchLower)
    );
  });

  return {
    users: filteredUsers,
    loading,
    searchTerm,
    editingUser,
    deletingUser,
    setSearchTerm,
    fetchUsers,
    handleSetRole,
    handleSaveUser,
    setEditingUser,
    setDeletingUser,
    handleDeleteUserConfirm,
  };
};

const AdminUsers: React.FC = () => {
  usePageTitle();
  const {
    users,
    loading,
    searchTerm,
    editingUser,
    deletingUser,
    setSearchTerm,
    fetchUsers,
    handleSetRole,
    handleSaveUser,
    setEditingUser,
    setDeletingUser,
    handleDeleteUserConfirm,
  } = useAdminUsers();

  return (
    <>
      <UsersPageHeader
        onRefresh={fetchUsers}
        onSearch={setSearchTerm}
        searchTerm={searchTerm}
      />
      <Card>
        <CardContent className="p-0">
          {loading && <div className="p-6 text-center">Loading...</div>}
          {!loading && (
            <UsersTable
              users={users}
              onEdit={setEditingUser}
              onDelete={setDeletingUser}
              onSetRole={handleSetRole}
            />
          )}
        </CardContent>
      </Card>

      <UserFormModal
        isOpen={!!editingUser}
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveUser}
      />

      <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the user
              and remove their data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUserConfirm}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default AdminUsers;