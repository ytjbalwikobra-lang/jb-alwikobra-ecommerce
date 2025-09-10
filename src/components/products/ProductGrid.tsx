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
      <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-800 h-48 md:h-64 rounded-xl mb-3 md:mb-4 border border-gray-700 shadow-lg"></div>
            <div className="bg-gray-800 h-3 md:h-4 rounded mb-2"></div>
            <div className="bg-gray-800 h-3 md:h-4 rounded w-2/3 mb-2"></div>
            <div className="bg-gray-800 h-4 md:h-6 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <div className="w-32 h-32 bg-gradient-to-br from-gray-700 to-gray-800 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
          <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Tidak ada produk ditemukan</h3>
        <p className="text-gray-400 text-lg mb-6 max-w-md mx-auto">
          Coba ubah kata kunci pencarian atau filter yang Anda gunakan
        </p>
        <div className="flex flex-wrap gap-2 justify-center text-sm">
          <span className="px-3 py-1 bg-gray-800 text-gray-300 rounded-full">Tips:</span>
          <span className="px-3 py-1 bg-pink-600/20 text-pink-300 rounded-full">Coba kata kunci lain</span>
          <span className="px-3 py-1 bg-blue-600/20 text-blue-300 rounded-full">Reset filter</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 ${className}`}>
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
