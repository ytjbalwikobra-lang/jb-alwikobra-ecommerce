import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductService } from '../services/productService.ts';
import { Product } from '../types/index.ts';
import ProductCard from '../components/ProductCard.tsx';
import HorizontalScroller from '../components/HorizontalScroller.tsx';
import { 
  Zap, 
  Clock, 
  Flame,
  TrendingUp,
  Timer
} from 'lucide-react';

const FlashSalesPage: React.FC = () => {
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashSales = async () => {
      try {
        const flashSales = await ProductService.getFlashSales();
        setFlashSaleProducts(flashSales.map(sale => sale.product));
      } catch (error) {
        console.error('Error fetching flash sales:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashSales();
  }, []);

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
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Flash Sale
            </h1>
          </div>
          <p className="text-xl text-pink-100 mb-8 max-w-3xl mx-auto">
            Diskon hingga 70% untuk akun game terpilih! Buruan, stok terbatas dan waktu terbatas!
          </p>
          
          {/* Live indicator */}
          <div className="inline-flex items-center space-x-2 bg-black/20 border border-white/20 px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">LIVE SEKARANG</span>
          </div>
        </div>
      </section>

      {/* Flash Sale Stats */}
      <section className="py-8 bg-black border-b border-pink-500/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-pink-400 mb-2">
                <Flame size={20} />
                <span className="text-2xl font-bold">{flashSaleProducts.length}</span>
              </div>
              <p className="text-sm text-gray-400">Produk Flash Sale</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-green-400 mb-2">
                <TrendingUp size={20} />
                <span className="text-2xl font-bold">70%</span>
              </div>
              <p className="text-sm text-gray-400">Diskon Maksimal</p>
            </div>
            {/* Rating removed as per requirements */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-purple-400 mb-2">
                <Timer size={20} />
                <span className="text-2xl font-bold">24</span>
              </div>
              <p className="text-sm text-gray-400">Jam Tersisa</p>
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
                <h2 className="text-3xl font-bold text-white mb-4">
                  Produk Flash Sale Hari Ini
                </h2>
                <p className="text-gray-300 max-w-2xl mx-auto">
                  Jangan sampai terlewat! Akun game berkualitas dengan harga spesial yang tidak akan Anda temukan di tempat lain.
                </p>
              </div>

        <HorizontalScroller ariaLabel="Produk Flash Sale">
                {flashSaleProducts.map((product) => (
          <div key={product.id} className="min-w-[300px] snap-start">
                    <ProductCard
                      product={product}
                      showFlashSaleTimer={true}
            className="w-[300px]"
                    />
                  </div>
                ))}
              </HorizontalScroller>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-pink-500/10 border border-pink-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="text-pink-500" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">
                Flash Sale Sedang Tidak Tersedia
              </h3>
              <p className="text-gray-300 mb-8 max-w-md mx-auto">
                Saat ini belum ada produk flash sale. Tetap pantau halaman ini atau berlangganan newsletter untuk mendapat notifikasi flash sale terbaru!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/products"
                  className="bg-pink-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors"
                >
                  Lihat Semua Produk
                </Link>
                <button className="bg-black border-2 border-pink-600 text-pink-400 px-8 py-3 rounded-lg font-semibold hover:bg-white/5 transition-colors">Notifikasi Flash Sale</button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How Flash Sale Works */}
      <section className="py-16 bg-black/60 border-t border-pink-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
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
            Jangan Sampai Ketinggalan Flash Sale Berikutnya!
          </h2>
          <p className="text-pink-100 mb-8 max-w-2xl mx-auto">
            Berlangganan newsletter kami untuk mendapat notifikasi flash sale terbaru dan penawaran eksklusif lainnya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Masukkan email Anda"
              className="flex-1 px-4 py-3 rounded-lg border border-pink-300/40 bg-black/30 text-white placeholder:pink-100/70 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-pink-600"
            />
            <button className="bg-black border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors whitespace-nowrap">
              Berlangganan
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FlashSalesPage;
