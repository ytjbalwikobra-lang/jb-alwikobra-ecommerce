import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/index.ts';
import { formatCurrency, calculateTimeRemaining } from '../utils/helpers.ts';
import { Zap, ArrowUpRight, Users, Trophy, Crown, Sparkles } from 'lucide-react';

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

  // Tier styling
  const getTierStyles = (tier?: string) => {
    switch (tier) {
      case 'premium':
        return {
          bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
          ring: 'ring-amber-500/40',
          textColor: 'text-amber-100',
          badge: 'bg-amber-400/20 text-amber-200 border-amber-400/60'
        };
      case 'pelajar':
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
          ring: 'ring-blue-500/40',
          textColor: 'text-blue-100',
          badge: 'bg-blue-400/20 text-blue-200 border-blue-400/60'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-pink-600 to-rose-600',
          ring: 'ring-pink-500/40',
          textColor: 'text-white',
          badge: 'bg-gray-400/20 text-gray-200 border-gray-400/60'
        };
    }
  };

  const tierStyle = getTierStyles(product.tier);

  // Get tier icon
  const getTierIcon = (tier?: string) => {
    switch (tier) {
      case 'premium':
        return Crown;
      case 'pelajar':
        return Users;
      default:
        return Trophy;
    }
  };

  const TierIcon = getTierIcon(product.tier);

  return (
    <Link
      to={`/products/${product.id}`}
      className={`group block rounded-3xl ${tierStyle.bg} text-white shadow-lg hover:shadow-xl ring-1 ${tierStyle.ring} transition-all duration-300 hover:scale-[1.02] ${className}`}
    >
      <div className="p-4">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-black/20 ring-1 ring-white/10">
          <img
            src={images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
          />
          
          {/* Flash Sale or Best Badge */}
          {showBest && (
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 backdrop-blur border border-red-400/50">
              <Zap size={12} />
              <span>{isFlashSaleActive ? 'FLASH SALE' : 'TERLARIS'}</span>
            </div>
          )}

          {/* Game Monogram */}
          <div className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/95 text-gray-900 text-xs font-bold flex items-center justify-center ring-2 ring-white/20 backdrop-blur">
            {monogram}
          </div>

          {/* Stock Status */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-2xl">
              <span className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold">STOK HABIS</span>
            </div>
          )}

          {/* Low Stock Warning */}
          {product.stock > 0 && product.stock <= 3 && (
            <div className="absolute bottom-3 left-3 bg-orange-500/90 text-white px-3 py-1 rounded-full text-xs font-bold">
              TERSISA {product.stock}
            </div>
          )}

          {/* Image Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1">
              {images.slice(0,3).map((_, i) => (
                <span key={i} className={`h-1.5 w-1.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-white/60'}`}></span>
              ))}
              {images.length > 3 && (
                <span className="text-white/80 text-xs ml-1">+{images.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-4 space-y-3">
          {/* Title */}
          <h3 className="text-lg font-bold leading-tight text-white line-clamp-2">
            {product.name}
          </h3>

          {/* Tags Row */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Game Title */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/10 text-white border border-white/20">
              {product.gameTitle}
            </span>

            {/* Tier Badge */}
            {product.tier && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border ${tierStyle.badge}`}>
                <TierIcon size={10} />
                {product.tier === 'premium' ? 'PREMIUM' : product.tier === 'pelajar' ? 'PELAJAR' : 'REGULER'}
              </span>
            )}

            {/* Rental Available */}
            {product.hasRental && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-200 border border-emerald-400/50">
                <Sparkles size={10} />
                RENTAL
              </span>
            )}

            {/* Account Level */}
            {product.accountLevel && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-500/20 text-purple-200 border border-purple-400/50">
                {product.accountLevel}
              </span>
            )}
          </div>

          {/* Price Section */}
          <div className="flex items-end justify-between pt-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-xl bg-white px-4 py-2 text-base font-bold text-gray-900">
                  {formatCurrency(product.price)}
                </span>
                {isFlashSaleActive && product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-red-500/20 text-red-200 border border-red-400/50">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>
              
              {/* Original Price */}
              {isFlashSaleActive && product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs line-through text-white/70 mt-1">
                  {formatCurrency(product.originalPrice)}
                </span>
              )}
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur transition-colors group-hover:bg-white group-hover:text-gray-900">
                <ArrowUpRight size={18} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
