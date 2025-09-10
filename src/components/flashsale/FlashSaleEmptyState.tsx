import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, ArrowUpRight } from 'lucide-react';

export const FlashSaleEmptyState: React.FC = () => {
  return (
    <div className="text-center py-16">
      <div className="w-24 h-24 bg-pink-500/10 border border-pink-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
        <Zap className="text-pink-500" size={40} />
      </div>
      <h3 className="text-xl font-bold text-white mb-2">Belum Ada Flash Sale</h3>
      <p className="text-gray-400 max-w-md mx-auto">
        Flash sale sedang tidak tersedia saat ini. Pantau terus untuk penawaran menarik berikutnya!
      </p>
      <div className="mt-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-semibold transition-colors"
        >
          Lihat Produk Lainnya
          <ArrowUpRight size={18} />
        </Link>
      </div>
    </div>
  );
};
