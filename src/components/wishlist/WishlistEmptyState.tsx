import React from 'react';
import { Heart, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WishlistEmptyState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="mb-6">
        <div className="w-20 h-20 bg-pink-500/20 rounded-full flex items-center justify-center mb-4 mx-auto">
          <Heart size={40} className="text-pink-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Wishlist Kosong</h2>
        <p className="text-gray-400 max-w-md">
          Belum ada produk di wishlist Anda. Mulai tambahkan produk favorit untuk menyimpannya di sini.
        </p>
      </div>
      
      <Link
        to="/products"
        className="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
      >
        <ShoppingBag size={20} />
        <span>Jelajahi Produk</span>
      </Link>
    </div>
  );
};
