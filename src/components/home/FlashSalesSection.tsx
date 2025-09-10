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
    <section className={`py-12 md:py-16 bg-gray-900/50 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Zap className="text-white" size={24} />
            </div>
            <div>
              <h2 id="flash-sale" className="text-2xl sm:text-3xl font-bold text-white">Flash Sale</h2>
              <p className="text-gray-300 text-sm sm:text-base">Diskon Terbatas - Berakhir Segera!</p>
            </div>
          </div>
          <Link 
            to="/flash-sales"
            className="text-pink-400 hover:text-pink-300 font-semibold flex items-center space-x-1 transition-colors duration-200 group"
          >
            <span className="text-sm sm:text-base">Lihat Semua</span>
            <ChevronRight size={20} className="transform group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <HorizontalScroller ariaLabel="Produk Flash Sale" itemGapClass="gap-4 md:gap-6">
          {products.slice(0, 10).map((product, idx) => (
            <div key={product.id} className="flex-shrink-0 w-[280px] sm:w-[300px] snap-start">
              <ProductCard
                product={product}
                showFlashSaleTimer={true}
                priority={idx < 2}
                className="w-full h-full" // Ensure card fills the container
              />
            </div>
          ))}
        </HorizontalScroller>
      </div>
    </section>
  );
};
