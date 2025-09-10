import React from 'react';
import { Product } from '../../types';
import ProductCard from '../ProductCard';

interface FlashSaleProductGridProps {
  products: Product[];
  currentPage: number;
  pageSize: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const FlashSaleProductGrid: React.FC<FlashSaleProductGridProps> = ({
  products,
  currentPage,
  totalPages,
  onPageChange
}) => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 id="produk-flash-sale" className="text-3xl font-bold text-white mb-4">
          Produk Flash Sale Hari Ini
        </h2>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Jangan sampai terlewat! Akun game berkualitas dengan harga spesial yang tidak akan Anda temukan di tempat lain.
        </p>
      </div>

      {/* TOC for this section */}
      <nav aria-label="Daftar Isi" className="bg-black/40 border border-pink-500/30 rounded-lg p-4">
        <p className="text-sm text-gray-400 mb-2">Daftar Isi</p>
        <ul className="list-disc list-inside text-sm text-pink-300 space-y-1">
          <li><a href="#produk-flash-sale" className="hover:underline">Produk Flash Sale</a></li>
          <li><a href="#cara-kerja" className="hover:underline">Cara Kerja</a></li>
        </ul>
      </nav>

      {/* Grid of products */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <div key={product.id}>
            <ProductCard
              product={product}
              showFlashSaleTimer={true}
              className="w-full h-auto"
            />
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className={`px-3 py-2 rounded-lg border border-white/20 text-white/90 hover:bg-white/10 transition ${
              currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Sebelumnya
          </button>
          
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            const active = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`w-9 h-9 rounded-lg border text-sm font-semibold transition ${
                  active 
                    ? 'bg-pink-600 border-pink-500 text-white' 
                    : 'border-white/20 text-white/80 hover:bg-white/10'
                }`}
              >
                {page}
              </button>
            );
          })}
          
          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className={`px-3 py-2 rounded-lg border border-white/20 text-white/90 hover:bg-white/10 transition ${
              currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            Berikutnya
          </button>
        </div>
      )}
    </div>
  );
};
