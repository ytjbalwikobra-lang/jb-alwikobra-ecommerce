import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Switch } from '../../ui/switch';
import { ProfileRow } from '../../../pages/admin/AdminUsers';
import { useEffect, useState } from 'react';

interface UserFormModalProps {
  user: ProfileRow | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (user: ProfileRow) => void;
}

export function UserFormModal({ user, isOpen, onClose, onSave }: UserFormModalProps) {
  const [formData, setFormData] = useState<ProfileRow | null>(null);

  useEffect(() => {
    setFormData(user);
  }, [user]);

  if (!formData) return null;

  const handleSave = () => {
    onSave(formData);
  };

  const handleChange = (field: keyof ProfileRow, value: any) => {
    setFormData(prev => prev ? { ...prev, [field]: value } : null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user?.id ? 'Edit User' : 'Create User'}</DialogTitle>
          <DialogDescription>
            {user?.id ? `Editing details for ${user.name}` : 'Creating a new user.'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email || ''}
              onChange={(e) => handleChange('email', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              Phone
            </Label>
            <Input
              id="phone"
              value={formData.phone || ''}
              onChange={(e) => handleChange('phone', e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="flex items-center space-x-2 justify-end">
            <Label htmlFor="is_admin">Admin</Label>
            <Switch
              id="is_admin"
              checked={formData.is_admin}
              onCheckedChange={(checked) => handleChange('is_admin', checked)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
