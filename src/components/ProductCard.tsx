import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/index.ts';
import { formatCurrency, calculateTimeRemaining } from '../utils/helpers.ts';
import { Clock, Star, Zap } from 'lucide-react';

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

  return (
    <Link 
      to={`/products/${product.id}`}
      className={`group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${className}`}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Flash Sale Badge */}
        {isFlashSaleActive && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1">
            <Zap size={12} />
            <span>Flash Sale</span>
          </div>
        )}

        {/* Stock Badge */}
        {product.stock <= 5 && product.stock > 0 && (
          <div className="absolute top-3 right-3 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            Sisa {product.stock}
          </div>
        )}

        {/* Out of Stock */}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Stok Habis
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Game Title */}
        <div className="flex items-center space-x-2 mb-2">
          <span className="bg-primary-50 text-primary-600 px-2 py-1 rounded-md text-xs font-medium">
            {product.gameTitle}
          </span>
          {product.hasRental && (
            <span className="bg-green-50 text-green-600 px-2 py-1 rounded-md text-xs font-medium">
              Rental
            </span>
          )}
        </div>

        {/* Product Name */}
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {product.name}
        </h3>

        {/* Account Level */}
        {product.accountLevel && (
          <p className="text-sm text-gray-600 mb-2 flex items-center space-x-1">
            <Star size={14} className="text-yellow-400" />
            <span>Level {product.accountLevel}</span>
          </p>
        )}

        {/* Price */}
        <div className="flex items-center justify-between">
          <div>
            {product.originalPrice && product.originalPrice > product.price ? (
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-primary-600">
                    {formatCurrency(product.price)}
                  </span>
                  <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-xs font-medium">
                    -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                  </span>
                </div>
                <span className="text-sm text-gray-400 line-through">
                  {formatCurrency(product.originalPrice)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {/* Rating (placeholder) */}
          <div className="flex items-center space-x-1 text-yellow-400">
            <Star size={14} fill="currentColor" />
            <span className="text-sm text-gray-600">4.8</span>
          </div>
        </div>

        {/* Flash Sale Timer */}
        {showFlashSaleTimer && isFlashSaleActive && timeRemaining && (
          <div className="mt-3 p-2 bg-red-50 rounded-lg">
            <div className="flex items-center space-x-1 text-red-600 text-sm font-medium mb-1">
              <Clock size={14} />
              <span>Berakhir dalam:</span>
            </div>
            <div className="flex space-x-2 text-xs">
              <div className="bg-red-500 text-white px-2 py-1 rounded">
                {timeRemaining.days.toString().padStart(2, '0')}d
              </div>
              <div className="bg-red-500 text-white px-2 py-1 rounded">
                {timeRemaining.hours.toString().padStart(2, '0')}h
              </div>
              <div className="bg-red-500 text-white px-2 py-1 rounded">
                {timeRemaining.minutes.toString().padStart(2, '0')}m
              </div>
              <div className="bg-red-500 text-white px-2 py-1 rounded">
                {timeRemaining.seconds.toString().padStart(2, '0')}s
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
};

export default ProductCard;
