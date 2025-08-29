import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/index.ts';
import { formatCurrency, calculateTimeRemaining } from '../utils/helpers.ts';
import { Zap, ArrowUpRight, Users, Trophy, Crown, Sparkles } from 'lucide-react';
import FlashSaleTimer from './FlashSaleTimer.tsx';

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

  const isFlashSaleActive = (product.isFlashSale || showFlashSaleTimer) && timeRemaining && !timeRemaining.isExpired;
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const showBest = isFlashSaleActive || showFlashSaleTimer || product.tier === 'premium';

  // Robust monogram: derive from game title name or slug, producing tokens initials (e.g., Free Fire -> FF, Mobile Legends -> ML)
  const getMonogram = (): string => {
    const name = product.gameTitleData?.name || product.gameTitle || '';
    const slug = product.gameTitleData?.slug || (product.gameTitle ? product.gameTitle.toLowerCase().replace(/\s+/g, '-') : '');
    const source = name || slug;
    if (!source) return 'JB';
    const normalized = source.replace(/[-_]+/g, ' ').trim();
    const parts = normalized.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    if (parts.length === 1) {
      const word = parts[0];
      const caps = word.match(/[A-Z]/g);
      if (caps && caps.length >= 2) return (caps[0] + caps[1]).toUpperCase();
      return word.slice(0, 2).toUpperCase();
    }
    return 'JB';
  };

  // Tier styling with dynamic data
  const getTierStyles = (tierData?: any, tier?: string) => {
    // Use dynamic tier data if available
    if (tierData?.backgroundGradient) {
      return {
        bg: `bg-gradient-to-br ${tierData.backgroundGradient}`,
        ring: `ring-${tierData.color?.replace('#', '')}/40`,
        textColor: 'text-white',
        badge: `bg-opacity-20 border border-opacity-60`,
        badgeColor: tierData.color,
        borderColor: tierData.borderColor
      };
    }
    
    // Fallback to static styling
    switch (tier) {
      case 'premium':
        return {
          bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
          ring: 'ring-amber-500/40',
          textColor: 'text-amber-100',
          badge: 'bg-amber-400/20 text-amber-200 border-amber-400/60',
          badgeColor: '#f59e0b',
          borderColor: '#fbbf24'
        };
      case 'pelajar':
        return {
          bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
          ring: 'ring-blue-500/40',
          textColor: 'text-blue-100',
          badge: 'bg-blue-400/20 text-blue-200 border-blue-400/60',
          badgeColor: '#3b82f6',
          borderColor: '#60a5fa'
        };
      default:
        return {
          bg: 'bg-gradient-to-br from-pink-600 to-rose-600',
          ring: 'ring-pink-500/40',
          textColor: 'text-white',
          badge: 'bg-gray-400/20 text-gray-200 border-gray-400/60',
          badgeColor: '#6b7280',
          borderColor: '#9ca3af'
        };
    }
  };

  const tierStyle = getTierStyles(product.tierData, product.tier);

  // Get tier icon with dynamic data
  const getTierIcon = (tierData?: any, tier?: string) => {
    if (tierData?.icon) {
      switch (tierData.icon) {
        case 'Crown': return Crown;
        case 'Users': return Users;
        case 'Trophy': return Trophy;
        default: return Trophy;
      }
    }
    
    // Fallback
    switch (tier) {
      case 'premium': return Crown;
      case 'pelajar': return Users;
      default: return Trophy;
    }
  };

  const TierIcon = getTierIcon(product.tierData, product.tier);

  // Get game title for display
  const gameTitle = product.gameTitleData?.name || product.gameTitle;
  const gameTitleSlug = product.gameTitleData?.slug || product.gameTitle?.toLowerCase().replace(/\s+/g, '-');

  // Get tier name for display
  const tierName = product.tierData?.name || (
    product.tier === 'premium' ? 'PREMIUM' : 
    product.tier === 'pelajar' ? 'PELAJAR' : 'REGULER'
  );

  return (
    <Link
      to={`/products/${product.id}`}
      state={{ fromFlashSaleCard: !!showFlashSaleTimer }}
      className={`group block rounded-3xl ${showFlashSaleTimer ? 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 ring-2 ring-red-400/50 shadow-lg shadow-red-500/25' : tierStyle.bg} text-white shadow-lg hover:shadow-xl ring-1 ${tierStyle.ring} transition-all duration-300 hover:scale-[1.02] ${className}`}
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
            <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-red-500/90 text-white text-xs font-bold px-3 py-1.5 backdrop-blur border border-red-400/50 shadow-lg animate-pulse">
              <Zap size={12} />
              <span>{isFlashSaleActive ? 'FLASH SALE' : 'TERLARIS'}</span>
            </div>
          )}

          {/* Game Monogram */}
          <div className="absolute top-3 right-3 w-9 h-9 rounded-xl bg-white/95 text-gray-900 text-xs font-bold flex items-center justify-center ring-2 ring-white/20 backdrop-blur">
            {getMonogram()}
          </div>

          {/* Stock Status */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-black/70 flex items-center justify-center rounded-2xl">
              <span className="bg-red-500 text-white px-4 py-2 rounded-xl text-sm font-bold">STOK HABIS</span>
            </div>
          )}

          {/* Low Stock Warning removed: qty is always 1 */}

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
          <h3 className="text-lg font-bold leading-tight text-white line-clamp-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
            {product.name}
          </h3>

          {/* Tags Row - hidden for flash sale cards */}
          {!showFlashSaleTimer && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Game Title */}
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white/15 text-white border border-white/30 backdrop-blur-sm">
                {gameTitle}
              </span>

              {/* Tier Badge */}
              {(product.tierData || product.tier) && (
                <span 
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border backdrop-blur-sm"
                  style={{
                    backgroundColor: tierStyle.badgeColor ? `${tierStyle.badgeColor}25` : 'rgba(255,255,255,0.15)',
                    borderColor: tierStyle.borderColor ? `${tierStyle.borderColor}80` : 'rgba(255,255,255,0.3)',
                    color: '#ffffff',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                  }}
                >
                  <TierIcon size={12} />
                  {tierName}
                </span>
              )}

              {/* Rental Available */}
              {product.hasRental && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/25 text-white border border-emerald-400/60 backdrop-blur-sm">
                  <Sparkles size={12} />
                  RENTAL
                </span>
              )}

              {/* Account Level */}
              {product.accountLevel && (
                <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/25 text-white border border-purple-400/60 backdrop-blur-sm">
                  {product.accountLevel}
                </span>
              )}
            </div>
          )}

          {/* Flash Sale Timer moved under price */}

          {/* Price Section */}
          <div className="flex items-end justify-between pt-2">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-xl bg-white/95 backdrop-blur-sm px-4 py-2 text-base font-bold text-gray-900 shadow-lg border border-white/20">
                  {formatCurrency(product.price)}
                </span>
                {isFlashSaleActive && product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs font-semibold px-2 py-1 rounded-lg bg-red-500/30 text-white border border-red-400/60 backdrop-blur-sm shadow-sm">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>
              
              {/* Original Price */}
              {isFlashSaleActive && product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs line-through text-white/80 mt-1 font-medium" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                  {formatCurrency(product.originalPrice)}
                </span>
              )}

              {/* Flash Sale Timer (under price) */}
              {showFlashSaleTimer && product.flashSaleEndTime && (
                <div className="pt-3">
                  <FlashSaleTimer 
                    endTime={product.flashSaleEndTime} 
                    compact={false}
                    className="bg-white/95 text-red-600 font-bold"
                  />
                </div>
              )}
            </div>

            {/* Action Button */}
            <div className="flex-shrink-0">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm border border-white/20 transition-all duration-200 group-hover:bg-white group-hover:text-gray-900 group-hover:shadow-lg">
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
