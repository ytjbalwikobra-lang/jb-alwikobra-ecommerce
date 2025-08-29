import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ProductService } from '../services/productService.ts';
import { Product } from '../types/index.ts';
import ProductCard from '../components/ProductCard.tsx';
import { 
  Zap, 
  ShoppingBag, 
  Clock, 
  Star,
  TrendingUp,
  Shield,
  Headphones,
  ChevronRight
} from 'lucide-react';
import BannerCarousel from '../components/BannerCarousel.tsx';

const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allProducts, flashSales] = await Promise.all([
          ProductService.getAllProducts(),
          ProductService.getFlashSales()
        ]);

        setProducts(allProducts.slice(0, 8)); // Show only 8 products
        setFlashSaleProducts(flashSales.map(sale => sale.product));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const features = [
    {
      icon: Shield,
      title: 'Aman & Terpercaya',
      description: 'Transaksi aman dengan jaminan uang kembali'
    },
    {
      icon: Clock,
      title: 'Proses Cepat',
      description: 'Akun dikirim maksimal 24 jam setelah pembayaran'
    },
    {
      icon: Star,
      title: 'Kualitas Terbaik',
      description: 'Semua akun sudah diverifikasi dan berkualitas tinggi'
    },
    {
      icon: Headphones,
      title: 'Support 24/7',
      description: 'Tim customer service siap membantu kapan saja'
    }
  ];

  const gameCategories = [
    { name: 'Mobile Legends', count: 45, image: '/api/placeholder/100/100' },
    { name: 'PUBG Mobile', count: 32, image: '/api/placeholder/100/100' },
    { name: 'Free Fire', count: 28, image: '/api/placeholder/100/100' },
    { name: 'Genshin Impact', count: 19, image: '/api/placeholder/100/100' },
    { name: 'Call of Duty', count: 15, image: '/api/placeholder/100/100' },
    { name: 'Valorant', count: 12, image: '/api/placeholder/100/100' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Banner Slideshow */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BannerCarousel />
        </div>
      </section>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-pink-50 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
              Marketplace Akun Game
              <span className="text-primary-600"> #1 di Indonesia</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Jual, beli, dan rental akun game favorit Anda dengan mudah, aman, dan terpercaya. 
              Dapatkan akun impian dengan harga terbaik!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/flash-sales"
                className="bg-primary-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Zap size={20} />
                <span>Flash Sale Hari Ini</span>
              </Link>
              <Link
                to="/products"
                className="bg-white text-primary-600 border-2 border-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-primary-50 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingBag size={20} />
                <span>Lihat Semua Produk</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sales Section */}
      {flashSaleProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Zap className="text-white" size={24} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">Flash Sale</h2>
                  <p className="text-gray-600">Diskon hingga 70% - Terbatas!</p>
                </div>
              </div>
              <Link 
                to="/flash-sales"
                className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
              >
                <span>Lihat Semua</span>
                <ChevronRight size={20} />
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
              {flashSaleProducts.slice(0, 10).map((product) => (
                <div key={product.id} className="min-w-[280px] snap-start">
                  <ProductCard
                    product={product}
                    showFlashSaleTimer={true}
                    className="w-[280px]"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Game Categories */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Game Populer</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pilih dari berbagai game populer yang tersedia di platform kami
            </p>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
            {gameCategories.map((category, index) => (
              <Link
                key={index}
                to={`/products?game=${encodeURIComponent(category.name)}`}
                className="min-w-[160px] bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-center group snap-start"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <TrendingUp className="text-primary-600" size={24} />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-primary-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-gray-500">{category.count} akun</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Produk Terbaru</h2>
              <p className="text-gray-600">Akun game berkualitas tinggi yang baru saja masuk</p>
            </div>
            <Link 
              to="/products"
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
            >
              <span>Lihat Semua</span>
              <ChevronRight size={20} />
            </Link>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
            {products.map((product) => (
              <div key={product.id} className="min-w-[280px] snap-start">
                <ProductCard product={product} className="w-[280px]" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kenapa Pilih JB Alwikobra?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Platform terpercaya dengan layanan terbaik untuk semua kebutuhan gaming Anda
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-primary-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="text-primary-600" size={24} />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary-600 to-pink-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Siap Memulai Petualangan Gaming Anda?
          </h2>
          <p className="text-primary-100 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan gamer lainnya yang sudah mempercayakan transaksi mereka kepada kami
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/products"
              className="bg-white text-primary-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Mulai Belanja Sekarang
            </Link>
            <Link
              to="/sell"
              className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white hover:text-primary-600 transition-colors"
            >
              Jual Akun Anda
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
