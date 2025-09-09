import { Button } from '../../../components/ui/button';
import { Plus } from 'lucide-react';

interface FlashSalesPageHeaderProps {
  onAdd: () => void;
}

export function FlashSalesPageHeader({ onAdd }: FlashSalesPageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-3xl font-bold tracking-tight">Flash Sales</h1>
      <Button onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" />
        Create Flash Sale
      </Button>
    </div>
  );
}
