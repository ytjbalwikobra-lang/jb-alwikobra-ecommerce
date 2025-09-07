import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/index.ts';
import ProductCard from '../components/ProductCard.tsx';
import { 
  Zap, 
  Clock, 
  Flame,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react';

const FlashSalesPage: React.FC = () => {
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  useEffect(() => {
    let mounted = true;
    
    const fetchFlashSales = async () => {
      try {
  // Prefer adminService join mapping for consistent flash sale products
  const { adminService } = await import('../services/adminService.ts');
        
        if (!mounted) return;
        
  const flashSalesResult = await adminService.getFlashSales({ onlyActive: true, notEndedOnly: true });
        
        if (!mounted) return;
        
  setFlashSaleProducts((flashSalesResult.data || []).map((sale: any) => sale.product).filter(Boolean));
      } catch (error) {
        console.error('Error fetching flash sales:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchFlashSales();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Ensure current page stays in range when data changes
  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(flashSaleProducts.length / pageSize));
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [flashSaleProducts.length]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-dark text-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Memuat flash sale...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-dark text-gray-200">
      {/* Hero Section */}
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

      {/* Flash Sale Stats */}
      <section className="py-8 bg-black border-b border-pink-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-12">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-pink-400 mb-2">
                  <Flame size={20} />
                  <span className="text-2xl font-bold">{flashSaleProducts.length}</span>
                </div>
                <p className="text-sm text-gray-400">Total Produk</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-green-400 mb-2">
                  <TrendingUp size={20} />
                  <span className="text-2xl font-bold">70%</span>
                </div>
                <p className="text-sm text-gray-400">Diskon Maksimal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sale Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {flashSaleProducts.length > 0 ? (
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

              {/* Grid of products instead of horizontal scroller (2 cols mobile like /products) */}
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {flashSaleProducts
                  .slice((currentPage - 1) * pageSize, (currentPage - 1) * pageSize + pageSize)
                  .map((product) => (
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
              {flashSaleProducts.length > pageSize && (
                <div className="flex items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-2 rounded-lg border border-white/20 text-white/90 hover:bg-white/10 transition ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Sebelumnya
                  </button>
                  {Array.from({ length: Math.ceil(flashSaleProducts.length / pageSize) }).map((_, i) => {
                    const page = i + 1;
                    const active = page === currentPage;
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-9 h-9 rounded-lg border text-sm font-semibold transition ${active ? 'bg-pink-600 border-pink-500 text-white' : 'border-white/20 text-white/80 hover:bg-white/10'}`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(Math.ceil(flashSaleProducts.length / pageSize), p + 1))}
                    disabled={currentPage === Math.ceil(flashSaleProducts.length / pageSize)}
                    className={`px-3 py-2 rounded-lg border border-white/20 text-white/90 hover:bg-white/10 transition ${currentPage === Math.ceil(flashSaleProducts.length / pageSize) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Berikutnya
                  </button>
                </div>
              )}
            </div>
          ) : (
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
          )}
        </div>
      </section>

      {/* How Flash Sale Works */}
      <section className="py-16 bg-black/60 border-t border-pink-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 id="cara-kerja" className="text-3xl font-bold text-white mb-4">
              Cara Kerja Flash Sale
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Dapatkan akun game impian dengan harga terbaik melalui sistem flash sale kami
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black border border-pink-500/40 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="text-pink-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Waktu Terbatas
              </h3>
              <p className="text-gray-300">
                Flash sale berlangsung dalam waktu terbatas. Pantau countdown timer untuk tidak melewatkan kesempatan.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black border border-pink-500/40 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-pink-400 font-bold text-xl">STOK</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Stok Terbatas
              </h3>
              <p className="text-gray-300">
                Jumlah akun yang dijual dengan harga flash sale sangat terbatas. First come, first served!
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black border border-pink-500/40 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="text-pink-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Pembayaran Instan
              </h3>
              <p className="text-gray-300">
                Gunakan Xendit payment gateway untuk pembayaran yang cepat dan aman. Akun langsung dikirim setelah pembayaran.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-rose-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Jual Akun Anda Sekarang!
          </h2>
          <p className="text-pink-100 mb-8 max-w-2xl mx-auto">
            Punya akun game yang tidak terpakai? Jual di platform kami dan dapatkan harga terbaik dengan proses yang mudah dan aman.
          </p>
          <div className="flex justify-center">
            <Link 
              to="/sell"
              className="bg-black border border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors inline-flex items-center space-x-2"
            >
              <span>Mulai Jual Akun</span>
              <ArrowUpRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FlashSalesPage;
