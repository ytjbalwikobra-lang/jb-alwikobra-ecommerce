import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductService } from '../services/productService.ts';
import { Product } from '../types/index.ts';
import ProductCard from '../components/ProductCard.tsx';
import { 
  Zap, 
  Clock, 
  Flame,
  TrendingUp,
  Star,
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat flash sale...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-500 via-pink-500 to-purple-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <Zap className="text-white" size={32} />
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
              Flash Sale
            </h1>
          </div>
          <p className="text-xl text-red-100 mb-8 max-w-3xl mx-auto">
            Diskon hingga 70% untuk akun game terpilih! Buruan, stok terbatas dan waktu terbatas!
          </p>
          
          {/* Live indicator */}
          <div className="inline-flex items-center space-x-2 bg-white bg-opacity-20 px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
            <span className="text-white font-medium">LIVE SEKARANG</span>
          </div>
        </div>
      </section>

      {/* Flash Sale Stats */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-red-600 mb-2">
                <Flame size={20} />
                <span className="text-2xl font-bold">{flashSaleProducts.length}</span>
              </div>
              <p className="text-sm text-gray-600">Produk Flash Sale</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-green-600 mb-2">
                <TrendingUp size={20} />
                <span className="text-2xl font-bold">70%</span>
              </div>
              <p className="text-sm text-gray-600">Diskon Maksimal</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-blue-600 mb-2">
                <Star size={20} />
                <span className="text-2xl font-bold">4.8</span>
              </div>
              <p className="text-sm text-gray-600">Rating Rata-rata</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-purple-600 mb-2">
                <Timer size={20} />
                <span className="text-2xl font-bold">24</span>
              </div>
              <p className="text-sm text-gray-600">Jam Tersisa</p>
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
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Produk Flash Sale Hari Ini
                </h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Jangan sampai terlewat! Akun game berkualitas dengan harga spesial yang tidak akan Anda temukan di tempat lain.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {flashSaleProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    showFlashSaleTimer={true}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="text-red-500" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Flash Sale Sedang Tidak Tersedia
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Saat ini belum ada produk flash sale. Tetap pantau halaman ini atau berlangganan newsletter untuk mendapat notifikasi flash sale terbaru!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/products"
                  className="bg-primary-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  Lihat Semua Produk
                </Link>
                <button className="bg-white border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors">
                  Notifikasi Flash Sale
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How Flash Sale Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cara Kerja Flash Sale
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Dapatkan akun game impian dengan harga terbaik melalui sistem flash sale kami
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="text-red-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Waktu Terbatas
              </h3>
              <p className="text-gray-600">
                Flash sale berlangsung dalam waktu terbatas. Pantau countdown timer untuk tidak melewatkan kesempatan.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Star className="text-green-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Stok Terbatas
              </h3>
              <p className="text-gray-600">
                Jumlah akun yang dijual dengan harga flash sale sangat terbatas. First come, first served!
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="text-blue-600" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Pembayaran Instan
              </h3>
              <p className="text-gray-600">
                Gunakan Xendit payment gateway untuk pembayaran yang cepat dan aman. Akun langsung dikirim setelah pembayaran.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Jangan Sampai Ketinggalan Flash Sale Berikutnya!
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Berlangganan newsletter kami untuk mendapat notifikasi flash sale terbaru dan penawaran eksklusif lainnya.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Masukkan email Anda"
              className="flex-1 px-4 py-3 rounded-lg border-0 focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
            />
            <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors whitespace-nowrap">
              Berlangganan
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FlashSalesPage;
