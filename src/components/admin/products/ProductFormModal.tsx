import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../ui/dialog';
import { Button } from '../../ui/button';
import { Input } from '../../ui/input';
import { Textarea } from '../../ui/textarea';
import { Label } from '../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../ui/select';
import { Switch } from '../../ui/switch';
import { Product, GameTitle, Tier, RentalOption } from '../../../types';
import { formatNumberID, parseNumberID } from '../../../utils/helpers';
import { adminService } from '../../../services/adminService';
import { useToast } from '../../Toast';
import AdminImageUploader from '../AdminImageUploader';

interface ProductFormModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  gameTitles: GameTitle[];
  tiers: Tier[];
}

const EMPTY_FORM_DATA = {
  name: '',
  description: '',
  price: 0,
  gameTitleId: '',
  tierId: '',
  accountLevel: '',
  accountDetails: '',
  hasRental: false,
  rentalOptions: [] as RentalOption[],
  isActive: true,
  images: [] as string[],
  stock: 1,
};

export function ProductFormModal({
  product,
  isOpen,
  onClose,
  onSuccess,
  gameTitles,
  tiers,
}: ProductFormModalProps) {
  const { push } = useToast();
  const [formData, setFormData] = useState(EMPTY_FORM_DATA);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && product) {
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price,
        gameTitleId: product.gameTitleId || '',
        tierId: product.tierId || '',
        accountLevel: product.accountLevel || '',
        accountDetails: product.accountDetails || '',
        hasRental: product.hasRental,
        rentalOptions: product.rentalOptions || [],
        isActive: product.isActive ?? !product.archivedAt,
        images: product.images || [product.image].filter(Boolean),
        stock: product.stock ?? 1,
      });
    } else if (isOpen) {
      setFormData(EMPTY_FORM_DATA);
    }
  }, [product, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        image: formData.images[0] || null,
      };

      if (product) {
        await adminService.updateProduct(product.id, payload);
      } else {
        await adminService.createProduct(payload);
      }
      push(`Product ${product ? 'updated' : 'created'} successfully!`, 'success');
      onSuccess();
    } catch (error: any) {
      push(`Error: ${error.message}`, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{product ? 'Edit Product' : 'Create New Product'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange('name', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                value={formatNumberID(formData.price)}
                onChange={(e) => handleChange('price', parseNumberID(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Images</Label>
            <AdminImageUploader images={formData.images} onChange={(imgs) => handleChange('images', imgs)} max={5} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gameTitleId">Game</Label>
              <Select value={formData.gameTitleId} onValueChange={(v) => handleChange('gameTitleId', v)}>
                <SelectTrigger><SelectValue placeholder="Select a game" /></SelectTrigger>
                <SelectContent>
                  {gameTitles.map((g) => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tierId">Tier</Label>
              <Select value={formData.tierId} onValueChange={(v) => handleChange('tierId', v)}>
                <SelectTrigger><SelectValue placeholder="Select a tier" /></SelectTrigger>
                <SelectContent>
                  {tiers.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(c) => handleChange('isActive', c)}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Product'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
