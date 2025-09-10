import React from 'react';
import { Heart, Share2 } from 'lucide-react';

interface ProductSecondaryActionsProps {
  productId: string;
  isInWishlist: boolean;
  onWishlistToggle: () => void;
  onShare: () => void;
}

export const ProductSecondaryActions: React.FC<ProductSecondaryActionsProps> = ({
  isInWishlist,
  onWishlistToggle,
  onShare
}) => {
  return (
    <div className="flex items-center space-x-4 text-gray-300">
      <button 
        onClick={onWishlistToggle}
        className={`flex items-center space-x-1 transition-colors ${
          isInWishlist 
            ? 'text-red-400 hover:text-red-300' 
            : 'hover:text-red-400'
        }`}
      >
        <Heart 
          size={16} 
          className={isInWishlist ? 'fill-current' : ''} 
        />
        <span>Favorit</span>
      </button>
      <button 
        onClick={onShare}
        className="flex items-center space-x-1 hover:text-pink-400 transition-colors"
      >
        <Share2 size={16} />
        <span>Bagikan</span>
      </button>
    </div>
  );
};
