import React from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../../types';
import ProductCard from '../ProductCard';
import HorizontalScroller from '../HorizontalScroller';
import { Zap, ChevronRight } from 'lucide-react';

interface FlashSalesSectionProps {
  products: Product[];
  className?: string;
}

export const FlashSalesSection: React.FC<FlashSalesSectionProps> = ({ 
  products, 
  className = '' 
}) => {
  if (products.length === 0) return null;

  return (
    <section className={`py-16 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Zap className="text-white" size={24} />
            </div>
            <div>
              <h2 id="flash-sale" className="text-3xl font-bold text-white">Flash Sale</h2>
              <p className="text-gray-300">Diskon hingga 70% - Terbatas!</p>
            </div>
          </div>
          <Link 
            to="/flash-sales"
            className="text-pink-300 hover:text-pink-200 font-medium flex items-center space-x-1"
          >
            <span>Lihat Semua</span>
            <ChevronRight size={20} />
          </Link>
        </div>

        <HorizontalScroller ariaLabel="Produk Flash Sale" itemGapClass="gap-4">
          {products.slice(0, 10).map((product, idx) => (
            <div key={product.id} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start">
              <ProductCard
                product={product}
                showFlashSaleTimer={true}
                priority={idx < 2}
                className="w-full h-auto"
              />
            </div>
          ))}
        </HorizontalScroller>
      </div>
    </section>
  );
};
