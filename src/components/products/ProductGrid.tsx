import React from 'react';
import { Product } from '../../types';
import ProductCard from '../ProductCard';

interface ProductGridProps {
  products: Product[];
  loading: boolean;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({ 
  products, 
  loading, 
  className = '' 
}) => {
  if (loading) {
    return (
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-700 h-64 rounded-xl mb-4"></div>
            <div className="bg-gray-700 h-4 rounded mb-2"></div>
            <div className="bg-gray-700 h-4 rounded w-2/3"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
          <span className="text-gray-400 text-2xl">📦</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Tidak ada produk ditemukan</h3>
        <p className="text-gray-400">Coba ubah filter pencarian Anda</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 ${className}`}>
      {products.map((product, index) => (
        <ProductCard
          key={product.id}
          product={product}
          priority={index < 4}
          className="w-full h-auto"
        />
      ))}
    </div>
  );
};
