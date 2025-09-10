import React from 'react';
import { Zap } from 'lucide-react';

export const FlashSaleHero: React.FC = () => {
  return (
    <section className="bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <div className="w-16 h-16 bg-black/20 rounded-xl flex items-center justify-center border border-white/20">
            <Zap className="text-white" size={32} />
          </div>
          <h1 id="flash-sale-h1" className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
            Flash Sale
          </h1>
        </div>
        <p className="text-xl text-pink-100 mb-8 max-w-3xl mx-auto">
          Diskon hingga 70% untuk akun game terpilih! Buruan, stok terbatas dan waktu terbatas!
        </p>
      </div>
    </section>
  );
};
