import React from 'react';
import { WishlistItem } from './WishlistItem';

interface WishlistGridProps {
  items: Array<{
    id: string;
    name: string;
    price: number;
    image: string;
    rating: number;
    category: string;
    available: boolean;
  }>;
  onRemoveItem: (id: string) => void;
}

export const WishlistGrid: React.FC<WishlistGridProps> = ({ items, onRemoveItem }) => {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <WishlistItem
          key={item.id}
          item={item}
          onRemove={onRemoveItem}
        />
      ))}
    </div>
  );
};
