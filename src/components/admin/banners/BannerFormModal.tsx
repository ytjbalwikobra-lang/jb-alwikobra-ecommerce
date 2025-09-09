import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Switch } from '../../../components/ui/switch';
import { Banner } from '../../../types';
import { useToast } from '../../../components/Toast';
import { BannerService } from '../../../services/bannerService';
import React, { useState, useEffect } from 'react';
import AdminImageUploader from '../AdminImageUploader';

interface BannerFormModalProps {
  banner: Banner | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EMPTY_FORM = {
  title: '',
  subtitle: '',
  linkUrl: '',
  ctaText: '',
  sortOrder: 1,
  isActive: true,
  images: [] as string[],
};

export function BannerFormModal({ banner, isOpen, onClose, onSuccess }: BannerFormModalProps) {
  const { push } = useToast();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && banner) {
      setFormData({
        title: banner.title,
        subtitle: banner.subtitle || '',
        linkUrl: banner.linkUrl || '',
        ctaText: banner.ctaText || '',
        sortOrder: banner.sortOrder,
        isActive: banner.isActive,
        images: [banner.imageUrl],
      });
    } else {
      setFormData(EMPTY_FORM);
    }
  }, [banner, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.images.length) {
      push('Image is required', 'error');
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        imageUrl: formData.images[0],
      };
      if (banner) {
        await BannerService.update(banner.id, payload);
      } else {
        await BannerService.create(payload);
      }
      push(`Banner ${banner ? 'updated' : 'created'} successfully`, 'success');
      onSuccess();
    } catch (error: any) {
      push(`Error: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{banner ? 'Edit Banner' : 'Create New Banner'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label>Image</Label>
            <AdminImageUploader images={formData.images} onChange={(imgs) => handleChange('images', imgs)} max={1} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={formData.title} onChange={(e) => handleChange('title', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtitle</Label>
              <Input id="subtitle" value={formData.subtitle} onChange={(e) => handleChange('subtitle', e.target.value)} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkUrl">Link URL</Label>
            <Input id="linkUrl" value={formData.linkUrl} onChange={(e) => handleChange('linkUrl', e.target.value)} placeholder="/products/some-product" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ctaText">CTA Text</Label>
            <Input id="ctaText" value={formData.ctaText} onChange={(e) => handleChange('ctaText', e.target.value)} placeholder="e.g., Shop Now" />
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
              {isSubmitting ? 'Saving...' : 'Save Banner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
