import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import { formatCurrency } from '../../utils/helpers';

interface RelatedProductsProps {
  products: Product[];
  cameFromFlashSaleCard: boolean;
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ 
  products, 
  cameFromFlashSaleCard 
}) => {
  // Hidden on flash sale detail
  if (cameFromFlashSaleCard || !products.length) {
    return null;
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-white mb-4">Produk Terkait</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map(product => (
          <Link key={product.id} to={`/products/${product.id}`} className="block group">
            <div className="rounded-xl overflow-hidden border border-white/10 bg-white/5">
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={product.image || product.images?.[0]}
                  alt={product.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-3">
                <div className="font-semibold">{product.name}</div>
                <div className="text-pink-400">
                  {formatCurrency(product.originalPrice && product.originalPrice > 0 ? product.originalPrice : product.price)}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
