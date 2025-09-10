import React from 'react';
import { Flame, TrendingUp } from 'lucide-react';

interface FlashSaleStatsProps {
  totalProducts: number;
  maxDiscount: number;
}

export const FlashSaleStats: React.FC<FlashSaleStatsProps> = ({
  totalProducts,
  maxDiscount
}) => {
  return (
    <section className="py-8 bg-black border-b border-pink-500/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center">
          <div className="grid grid-cols-2 gap-12">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-pink-400 mb-2">
                <Flame size={20} />
                <span className="text-2xl font-bold">{totalProducts}</span>
              </div>
              <p className="text-sm text-gray-400">Total Produk</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-green-400 mb-2">
                <TrendingUp size={20} />
                <span className="text-2xl font-bold">{maxDiscount}%</span>
              </div>
              <p className="text-sm text-gray-400">Diskon Maksimal</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
