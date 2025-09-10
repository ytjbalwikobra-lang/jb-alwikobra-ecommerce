import React from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WishlistHeaderProps {
  itemCount: number;
  onClearWishlist: () => void;
}

export const WishlistHeader: React.FC<WishlistHeaderProps> = ({
  itemCount,
  onClearWishlist
}) => {
  return (
    <div className="sticky top-0 bg-gray-900/95 backdrop-blur border-b border-pink-500/30 p-4 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Link to="/products" className="text-pink-400 hover:text-pink-300">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-white text-xl font-semibold">Wishlist</h1>
          <span className="bg-pink-500/20 text-pink-400 px-2 py-1 rounded-full text-sm">
            {itemCount}
          </span>
        </div>
        
        {itemCount > 0 && (
          <button
            onClick={onClearWishlist}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-sm transition-colors flex items-center space-x-1"
          >
            <Trash2 size={14} />
            <span>Hapus Semua</span>
          </button>
        )}
      </div>
    </div>
  );
};
