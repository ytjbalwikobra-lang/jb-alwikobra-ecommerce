import { useState } from 'react';
import { useWishlist } from '../contexts/WishlistContext';
import { formatCurrency } from '../utils/helpers';

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  available: boolean;
}

interface WishlistStats {
  totalItems: number;
  availableItems: number;
  totalValue: string;
}

export interface UseWishlistPageReturn {
  wishlistItems: WishlistItem[];
  stats: WishlistStats;
  isConfirmOpen: boolean;
  clearWishlist: () => void;
  removeFromWishlist: (id: string) => void;
  showClearConfirm: () => void;
  hideClearConfirm: () => void;
}

export const useWishlistPage = (): UseWishlistPageReturn => {
  const { wishlistItems, clearWishlist: clearWishlistAction, removeFromWishlist } = useWishlist();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const stats: WishlistStats = {
    totalItems: wishlistItems.length,
    availableItems: wishlistItems.filter(item => item.available).length,
    totalValue: formatCurrency(wishlistItems.reduce((sum, item) => sum + item.price, 0))
  };

  const clearWishlist = () => {
    clearWishlistAction();
    setIsConfirmOpen(false);
  };

  const showClearConfirm = () => setIsConfirmOpen(true);
  const hideClearConfirm = () => setIsConfirmOpen(false);

  return {
    wishlistItems,
    stats,
    isConfirmOpen,
    clearWishlist,
    removeFromWishlist,
    showClearConfirm,
    hideClearConfirm
  };
};
