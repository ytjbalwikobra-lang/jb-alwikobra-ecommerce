import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { Textarea } from '../../../components/ui/textarea';
import { GameTitle } from '../../../types';
import { useToast } from '../../../components/Toast';
import { adminService } from '../../../services/adminService';
import React, { useState, useEffect } from 'react';
import AdminImageUploader from '../AdminImageUploader';
import { gameLogoStorage } from '../../../services/storageService';

interface GameTitleFormModalProps {
  gameTitle: GameTitle | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const getInitialFormState = (gameTitle: GameTitle | null) => {
  if (gameTitle) {
    return {
      name: gameTitle.name,
      slug: gameTitle.slug,
      description: gameTitle.description || '',
      icon: gameTitle.icon || 'Zap',
      color: gameTitle.color || '#f472b6',
      images: gameTitle.logoUrl ? [gameTitle.logoUrl] : [],
      isActive: gameTitle.isActive !== false,
      sortOrder: gameTitle.sortOrder || 0,
    };
  }
  return {
    name: '',
    slug: '',
    description: '',
    icon: 'Zap',
    color: '#f472b6',
    images: [],
    isActive: true,
    sortOrder: 0,
  };
};

export function GameTitleFormModal({ gameTitle, isOpen, onClose, onSuccess }: GameTitleFormModalProps) {
  const { push } = useToast();
  const [formData, setFormData] = useState(getInitialFormState(gameTitle));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormState(gameTitle));
    }
  }, [gameTitle, isOpen]);

  const handleChange = (field: string, value: any) => {
    let newSlug = formData.slug;
    if (field === 'name') {
      newSlug = value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    }
    setFormData((prev) => ({ ...prev, [field]: value, ...(field === 'name' && { slug: newSlug }) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let logoUrl = gameTitle?.logoUrl || null;

      // Check if a new image was uploaded
      if (formData.images.length > 0 && formData.images[0] !== gameTitle?.logoUrl) {
        const blob = await fetch(formData.images[0]).then(r => r.blob());
        const file = new File([blob], "upload.png", { type: blob.type });
        const path = await gameLogoStorage.uploadGameLogo(file, formData.slug);
        logoUrl = gameLogoStorage.getGameLogoUrl(path);
      } else if (formData.images.length === 0 && gameTitle?.logoUrl) {
        // Image was removed
        await gameLogoStorage.deleteGameLogoByUrl(gameTitle.logoUrl);
        logoUrl = null;
      }

      const payload = {
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        icon: formData.icon,
        color: formData.color,
        logo_url: logoUrl,
        is_active: formData.isActive,
        sort_order: formData.sortOrder,
      };

      if (gameTitle) {
        await adminService.updateGameTitle(gameTitle.id, payload);
      } else {
        await adminService.createGameTitle(payload);
      }
      push(`Game Title ${gameTitle ? 'updated' : 'created'} successfully`, 'success');
      onSuccess();
    } catch (error: any) {
      push(`Error: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{gameTitle ? 'Edit Game Title' : 'Create New Game Title'}</DialogTitle>
          <DialogDescription>
            Manage the games available in your catalog.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Logo</Label>
            <AdminImageUploader images={formData.images} onChange={(imgs) => handleChange('images', imgs)} max={1} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={formData.description} onChange={(e) => handleChange('description', e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (lucide-react name)</Label>
              <Input id="icon" value={formData.icon} onChange={(e) => handleChange('icon', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input id="color" type="color" value={formData.color} onChange={(e) => handleChange('color', e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sortOrder">Sort Order</Label>
              <Input id="sortOrder" type="number" value={formData.sortOrder} onChange={(e) => handleChange('sortOrder', parseInt(e.target.value, 10))} />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch id="isActive" checked={formData.isActive} onCheckedChange={(c) => handleChange('isActive', c)} />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Game Title'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
