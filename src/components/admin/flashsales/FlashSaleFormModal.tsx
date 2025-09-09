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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../components/ui/select';
import { FlashSaleWithProduct, Product } from '../../../types';
import { useToast } from '../../../components/Toast';
import { adminService } from '../../../services/adminService';
import React, { useState, useEffect } from 'react';
import { formatNumberID, parseNumberID } from '../../../utils/helpers';

interface FlashSaleFormModalProps {
  sale: FlashSaleWithProduct | null;
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const getInitialFormState = (sale: FlashSaleWithProduct | null, products: Product[]) => {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const fmt = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  if (sale) {
    return {
      productId: sale.product?.id || '',
      salePrice: sale.salePrice,
      originalPrice: sale.originalPrice,
      startTime: sale.startTime ? fmt(new Date(sale.startTime)) : '',
      endTime: fmt(new Date(sale.endTime)),
      stock: sale.stock ?? undefined,
      isActive: sale.isActive,
    };
  }

  return {
    productId: '',
    salePrice: 0,
    originalPrice: 0,
    startTime: fmt(now),
    endTime: fmt(in24h),
    stock: undefined,
    isActive: true,
  };
};


export function FlashSaleFormModal({ sale, products, isOpen, onClose, onSuccess }: FlashSaleFormModalProps) {
  const { push } = useToast();
  const [formData, setFormData] = useState(getInitialFormState(sale, products));
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormState(sale, products));
    }
  }, [sale, products, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleProductChange = (productId: string) => {
    const product = products.find(p => p.id === productId);
    handleChange('productId', productId);
    if (product) {
      const originalPrice = product.originalPrice && Number(product.originalPrice) > 0 ? Number(product.originalPrice) : Number(product.price);
      handleChange('originalPrice', originalPrice);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      product_id: formData.productId,
      sale_price: formData.salePrice,
      original_price: formData.originalPrice,
      start_time: formData.startTime ? new Date(formData.startTime).toISOString() : new Date().toISOString(),
      end_time: new Date(formData.endTime).toISOString(),
      stock: formData.stock,
      is_active: formData.isActive,
    };

    try {
      if (sale) {
        await adminService.updateFlashSale(sale.id, payload);
      } else {
        await adminService.createFlashSale(payload);
      }
      push(`Flash sale ${sale ? 'updated' : 'created'} successfully`, 'success');
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
          <DialogTitle>{sale ? 'Edit Flash Sale' : 'Create New Flash Sale'}</DialogTitle>
          <DialogDescription>
            Set up a limited-time discount for a product.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product</Label>
            <Select value={formData.productId} onValueChange={handleProductChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="salePrice">Sale Price</Label>
              <Input
                id="salePrice"
                value={formatNumberID(formData.salePrice)}
                onChange={(e) => handleChange('salePrice', parseNumberID(e.target.value))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="originalPrice">Original Price</Label>
              <Input
                id="originalPrice"
                value={formatNumberID(formData.originalPrice)}
                onChange={(e) => handleChange('originalPrice', parseNumberID(e.target.value))}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => handleChange('startTime', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => handleChange('endTime', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock (optional)</Label>
              <Input
                id="stock"
                type="number"
                value={formData.stock ?? ''}
                onChange={(e) => handleChange('stock', e.target.value ? parseInt(e.target.value, 10) : undefined)}
                placeholder="Unlimited"
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch id="isActive" checked={formData.isActive} onCheckedChange={(c) => handleChange('isActive', c)} />
              <Label htmlFor="isActive">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Flash Sale'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
