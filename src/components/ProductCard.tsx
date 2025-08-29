import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/index.ts';
import { formatCurrency, calculateTimeRemaining } from '../utils/helpers.ts';
import { Zap, ArrowUpRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  showFlashSaleTimer?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showFlashSaleTimer = false,
  className = ''
}) => {
  const timeRemaining = product.flashSaleEndTime
    ? calculateTimeRemaining(product.flashSaleEndTime)
    : null;

  const isFlashSaleActive = product.isFlashSale && timeRemaining && !timeRemaining.isExpired;
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const showBest = isFlashSaleActive || product.tier === 'premium';
  const monogram = (product.gameTitle || 'JB').split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase();

  return (
    <Link
      to={`/products/${product.id}`}
  className={`group block rounded-3xl bg-gradient-to-br from-pink-600 to-rose-600 text-white shadow-none hover:shadow-none ring-1 ring-pink-500/40 transition-all duration-300 ${className}`}
    >
      <div className="p-3">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-pink-900/20 ring-1 ring-white/10">
          <img
            src={images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {showBest && (
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/20 text-white text-xs font-medium px-2.5 py-1 backdrop-blur">
              <Zap size={12} />
              <span>{isFlashSaleActive ? 'Flash Sale' : 'Best Seller'}</span>
            </div>
          )}
          {/* Game/Brand */}
          <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white text-gray-900 text-xs font-bold flex items-center justify-center ring-1 ring-black/10">
            {monogram}
          </div>

          {/* OOS overlay */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">Stok Habis</span>
            </div>
          )}

          {/* Dots */}
          {images.length > 1 && (
            <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
              {images.slice(0,5).map((_, i) => (
                <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/50'}`}></span>
              ))}
            </div>
          )}
        </div>

        {/* Text */}
        <div className="mt-4">
          <h3 className="text-[17px] font-semibold leading-snug text-white">{product.name}</h3>
          {/* Badges row: game title, rental, level, tier */}
      <div className="mt-1 flex flex-wrap items-center gap-2">
            {product.gameTitle && (
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-black text-white border border-white/40 shadow-sm">
                {product.gameTitle}
              </span>
            )}
            {product.hasRental && (
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-black text-white border border-emerald-400/60 shadow-sm">
                Rental
              </span>
            )}
            {product.accountLevel && (
        <span className="px-3 py-1 rounded-full text-sm font-semibold bg-black text-white border border-violet-400/60 shadow-sm">
                Level {product.accountLevel}
              </span>
            )}
            {product.tier && (
              <span
                className={
          `px-3 py-1 rounded-full text-sm font-semibold bg-black text-white border shadow-sm ${
                    product.tier === 'premium'
            ? 'border-yellow-400/60'
                      : product.tier === 'pelajar'
            ? 'border-blue-400/60'
            : 'border-gray-400/60'
                  }`
                }
              >
                {product.tier === 'premium' ? 'Premium' : product.tier === 'pelajar' ? 'Pelajar' : 'Reguler'}
              </span>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 flex items-end justify-between">
          <div className="flex flex-col">
            <span className="inline-flex items-center rounded-full bg-white px-3 py-1.5 text-sm font-semibold text-gray-900">
              {formatCurrency(product.price)}
            </span>
            {isFlashSaleActive && product.originalPrice && product.originalPrice > product.price && (
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs line-through text-white/90">
                  {formatCurrency(product.originalPrice)}
                </span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-white/20 text-white">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              </div>
            )}
          </div>
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-900 group-hover:bg-black group-hover:text-white transition-colors">
            <ArrowUpRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
