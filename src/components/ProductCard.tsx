/* eslint-disable react/display-name, react/prop-types, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/restrict-template-expressions, @typescript-eslint/no-unused-vars */
import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import { formatCurrency, calculateTimeRemaining } from '../utils/helpers';
import { Zap, ArrowUpRight, Users, Trophy, Crown, Sparkles } from 'lucide-react';
import FlashSaleTimer from './FlashSaleTimer';
import ResponsiveImage from './ResponsiveImage';

interface ProductCardProps {
  product: Product;
  showFlashSaleTimer?: boolean;
  fromCatalogPage?: boolean;
  className?: string;
  priority?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = React.memo(({ 
  product, 
  showFlashSaleTimer = false,
  fromCatalogPage = false,
  className = '',
  priority = false
}) => {
  const timeRemaining = product.flashSaleEndTime
    ? calculateTimeRemaining(product.flashSaleEndTime)
    : null;

  const isFlashSaleActive = showFlashSaleTimer && timeRemaining && !timeRemaining.isExpired;
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const showBest = showFlashSaleTimer || product.tier === 'premium';

  // Determine which price to show on the card
  // - On flash sale cards with an active sale: show sale price (product.price)
  // - Everywhere else (catalog, normal cards): show original/base price
  const displayPrice = (() => {
    const hasValidDiscount = product.originalPrice && product.originalPrice > product.price;
    if (isFlashSaleActive && hasValidDiscount) return product.price;
    return product.originalPrice && product.originalPrice > 0 ? product.originalPrice : product.price;
  })();

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
    
    // Enhanced fallback styling with premium gradients
    switch (tier) {
      case 'premium':
        // Enhanced Gold with shimmer effect
        return {
          bg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500',
          ring: 'ring-amber-400/60',
          textColor: 'text-amber-50',
          badge: 'bg-amber-400/20 text-amber-100 border-amber-300/60',
          badgeColor: '#FFD700',
          borderColor: '#FFD700'
        };
      case 'pelajar':
        // Enhanced Blue with depth
        return {
          bg: 'bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600',
          ring: 'ring-blue-500/50',
          textColor: 'text-blue-50',
          badge: 'bg-blue-400/20 text-blue-100 border-blue-300/60',
          badgeColor: '#3b82f6',
          borderColor: '#60a5fa'
        };
      default:
        // Enhanced Regular with modern gray tones
        return {
          bg: 'bg-gradient-to-br from-slate-500 via-gray-600 to-zinc-700',
          ring: 'ring-gray-400/50',
          textColor: 'text-gray-50',
          badge: 'bg-gray-300/20 text-gray-100 border-gray-200/60',
          badgeColor: '#9CA3AF',
          borderColor: '#D1D5DB'
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
      state={{ 
        fromFlashSaleCard: !!showFlashSaleTimer,
        fromCatalogPage: fromCatalogPage
      }}
      className={`group block rounded-2xl sm:rounded-3xl ${showFlashSaleTimer ? 'bg-gradient-to-br from-red-500 via-pink-500 to-rose-500 ring-2 ring-red-400/50 shadow-lg shadow-red-500/25' : tierStyle.bg} text-white shadow-lg ring-1 ${tierStyle.ring} transform-gpu transition-all duration-500 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-pink-500/20 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${className}`}
    >
      <div className="p-3 sm:p-4">
        {/* Image */}
        <div className="relative aspect-[4/5] overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-black/30 to-black/10 ring-1 ring-white/20 backdrop-blur-sm">
          <ResponsiveImage
            src={images[0]}
            alt={product.name}
            className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
            priority={priority || showFlashSaleTimer}
            fetchPriority={priority || showFlashSaleTimer ? 'high' : 'auto'}
            quality={85}
            aspectRatio={4/5}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          
          {/* Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/10 pointer-events-none"></div>
          
          {/* Flash Sale or Best Badge */}
          {showBest && (
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 inline-flex items-center gap-1 sm:gap-1.5 rounded-full bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2 sm:px-3 py-1 sm:py-1.5 backdrop-blur-sm border border-red-400/50 shadow-lg shadow-red-500/50 animate-pulse">
              <Zap size={10} className="sm:w-3 sm:h-3 animate-bounce" />
              <span className="text-xs">{isFlashSaleActive ? 'FLASH SALE' : 'REKOMENDASI'}</span>
            </div>
          )}

          {/* Game Monogram */}
          <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-7 sm:w-9 h-7 sm:h-9 rounded-lg sm:rounded-xl bg-gradient-to-br from-white via-white to-gray-50 text-gray-900 text-xs font-bold flex items-center justify-center ring-2 ring-white/50 backdrop-blur-sm shadow-lg transition-all duration-300 group-hover:scale-110">
            {getMonogram()}
          </div>

          {/* Stock Status */}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/70 to-black/60 flex items-center justify-center rounded-xl sm:rounded-2xl backdrop-blur-sm">
              <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold shadow-lg border border-red-400/50">STOK HABIS</span>
            </div>
          )}

          {/* Image Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 flex items-center gap-1 bg-black/40 backdrop-blur-sm rounded-full px-2 py-1">
              {images.slice(0,3).map((_, i) => (
                <span key={i} className={`h-1 sm:h-1.5 w-1 sm:w-1.5 rounded-full transition-all duration-300 ${i === 0 ? 'bg-white' : 'bg-white/60'}`}></span>
              ))}
              {images.length > 3 && (
                <span className="text-white/80 text-xs ml-1 font-medium">+{images.length - 3}</span>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="mt-3 sm:mt-4 space-y-2 sm:space-y-3">
          {/* Title */}
          <h3 className="text-sm sm:text-lg font-bold leading-tight text-white line-clamp-2 transition-all duration-300 group-hover:text-pink-100" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>
            {product.name}
          </h3>


          {/* Tags Row - Mobile optimized, hidden for flash sale cards */}
          {!showFlashSaleTimer && (
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              {/* Game Title */}
              <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs font-semibold bg-gradient-to-r from-white/20 to-white/10 text-white border border-white/40 backdrop-blur-sm transition-all duration-300 hover:bg-white/25 hover:border-white/60">
                {gameTitle}
              </span>

              {/* Tier Badge */}
              {(product.tierData || product.tier) && (
                <span 
                  className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs font-semibold border backdrop-blur-sm transition-all duration-300 hover:scale-105"
                  style={{
                    background: tierStyle.badgeColor ? `linear-gradient(135deg, ${tierStyle.badgeColor}35, ${tierStyle.badgeColor}20)` : 'linear-gradient(135deg, rgba(255,255,255,0.25), rgba(255,255,255,0.10))',
                    borderColor: tierStyle.borderColor ? `${tierStyle.borderColor}80` : 'rgba(255,255,255,0.4)',
                    color: '#ffffff',
                    textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                    boxShadow: tierStyle.badgeColor ? `0 4px 12px ${tierStyle.badgeColor}30` : '0 4px 12px rgba(255,255,255,0.15)'
                  }}
                >
                  <TierIcon size={10} className="sm:w-3 sm:h-3" />
                  <span className="text-xs">{tierName}</span>
                </span>
              )}

              {/* Account Level - Hide on small mobile */}
              {product.accountLevel && (
                <span className="hidden sm:inline-flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs font-semibold bg-gradient-to-r from-purple-500/30 to-purple-600/20 text-white border border-purple-400/60 backdrop-blur-sm shadow-lg shadow-purple-500/20 transition-all duration-300 hover:scale-105">
                  {product.accountLevel}
                </span>
              )}
            </div>
          )}

          {/* Rental Tag - Mobile optimized, only on normal product cards */}
          {!showFlashSaleTimer && (product.hasRental || (product as any).rentalOptions?.length > 0) && (
            <div className="mt-1.5 sm:mt-2">
              <span
                className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-md sm:rounded-lg text-xs font-semibold border backdrop-blur-sm transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(52, 211, 153, 0.15))',
                  borderColor: 'rgba(52, 211, 153, 0.6)',
                  color: '#ffffff',
                  textShadow: '0 1px 3px rgba(0,0,0,0.4)',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
                }}
              >
                <Sparkles size={10} className="sm:w-3 sm:h-3" />
                <span className="text-xs">Tersedia untuk Rental</span>
              </span>
            </div>
          )}

          {/* Flash Sale Timer moved under price */}

          {/* Price Section - Mobile optimized */}
          <div className="flex items-end justify-between pt-2">
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center rounded-lg sm:rounded-xl bg-gradient-to-r from-white to-gray-50 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base font-bold text-gray-900 shadow-lg shadow-black/20 border border-white/40 ring-1 ring-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                  {formatCurrency(displayPrice)}
                </span>
                {isFlashSaleActive && product.originalPrice && product.originalPrice > product.price && (
                  <span className="text-xs font-semibold px-1.5 sm:px-2 py-1 rounded-md sm:rounded-lg bg-gradient-to-r from-red-500/40 to-red-600/30 text-white border border-red-400/60 backdrop-blur-sm shadow-lg shadow-red-500/30 animate-pulse">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                )}
              </div>
              
              {/* Original Price */}
              {isFlashSaleActive && product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xs line-through text-white/80 mt-1 font-medium transition-all duration-300 group-hover:text-white/60" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                  {formatCurrency(product.originalPrice)}
                </span>
              )}

              {/* Flash Sale Timer (under price) */}
              {showFlashSaleTimer && product.flashSaleEndTime && (
                <div className="pt-2 sm:pt-3">
                  <FlashSaleTimer 
                    endTime={product.flashSaleEndTime} 
                    compact={false}
                    className="bg-gradient-to-r from-white to-gray-50 text-red-600 font-bold shadow-lg border border-white/40"
                  />
                </div>
              )}
            </div>

            {/* Action Button - Mobile optimized */}
            <div className="flex-shrink-0 ml-2">
              <div className="inline-flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-white/20 to-white/10 backdrop-blur-sm border border-white/30 transition-all duration-500 group-hover:bg-gradient-to-br group-hover:from-pink-500 group-hover:to-purple-500 group-hover:text-white group-hover:shadow-lg group-hover:shadow-pink-500/50 group-hover:scale-110 group-hover:border-pink-400/60 active:scale-95">
                <ArrowUpRight size={14} className="sm:w-[18px] sm:h-[18px] transition-transform duration-300 group-hover:rotate-12" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
});

export default ProductCard;
