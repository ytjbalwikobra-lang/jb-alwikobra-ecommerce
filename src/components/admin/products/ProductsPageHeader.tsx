import { Plus } from 'lucide-react';
import { Button } from '../../ui/button';

interface ProductsPageHeaderProps {
  onAddProduct: () => void;
}

export function ProductsPageHeader({ onAddProduct }: ProductsPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <p className="text-muted-foreground">
          Manage your products here.
        </p>
      </div>
      <Button onClick={onAddProduct}>
        <Plus className="mr-2 h-4 w-4" />
        Add Product
      </Button>
    </div>
  );
}
