import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types/index.ts';
import ProductCard from '../components/ProductCard.tsx';
import HorizontalScroller from '../components/HorizontalScroller.tsx';
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
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [popularGames, setPopularGames] = useState<Array<{ id: string; name: string; slug: string; logoUrl?: string | null; count: number }>>([]);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        // Lazy load ProductService to reduce initial bundle
        const { ProductService } = await import('../services/productService.ts');
        
        if (!mounted) return;

        const [flashSales, popular] = await Promise.all([
          ProductService.getFlashSales(),
          ProductService.getPopularGames(20)
        ]);

        if (mounted) {
          setFlashSaleProducts(flashSales.map(sale => sale.product));
          setPopularGames(popular);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    return () => { mounted = false; };
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

  // Popular game categories are now loaded from database via ProductService.getPopularGames

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
    <div className="min-h-screen bg-app-dark">
      {/* Top Banner Slideshow */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BannerCarousel />
        </div>
      </section>

      {/* Hero Section */}
  <section className="py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Marketplace Akun Game
                <span className="text-pink-400"> #1 di Indonesia</span>
            </h1>
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Jual, beli, dan rental akun game favorit Anda dengan mudah, aman, dan terpercaya. 
              Dapatkan akun impian dengan harga terbaik!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/flash-sales"
                  className="bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Zap size={20} />
                <span>Flash Sale Hari Ini</span>
              </Link>
              <Link
                to="/products"
                  className="bg-transparent text-pink-300 border-2 border-pink-500/60 px-8 py-4 rounded-xl font-semibold hover:bg-pink-500/10 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingBag size={20} />
                <span>Lihat Semua Produk</span>
              </Link>
              <Link
                to="/sell"
                className="bg-white text-pink-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingBag size={20} />
                <span>Jual Akun Game Anda</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sales Section */}
      {flashSaleProducts.length > 0 && (
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Zap className="text-white" size={24} />
                </div>
                <div>
                    <h2 className="text-3xl font-bold text-white">Flash Sale</h2>
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
              {flashSaleProducts.slice(0, 10).map((product) => (
        <div key={product.id} className="flex-shrink-0 w-[280px] sm:w-[320px] snap-start">
                  <ProductCard
                    product={product}
                    showFlashSaleTimer={true}
          className="w-full h-auto"
                  />
                </div>
              ))}
            </HorizontalScroller>
          </div>
        </section>
      )}

      {/* Game Categories */}
  <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-white mb-4">Game Populer</h2>
              <p className="text-gray-300 max-w-2xl mx-auto">
              Pilih dari berbagai game populer yang tersedia di platform kami
            </p>
          </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {popularGames.map((game) => (
              <Link
                key={game.id}
                to={`/products?game=${encodeURIComponent(game.name)}`}
                className="bg-black border border-pink-500/40 p-6 rounded-xl hover:shadow-[0_0_25px_4px_rgba(236,72,153,0.15)] transition-all duration-200 text-center group"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl mx-auto mb-4 flex items-center justify-center overflow-hidden">
                  {game.logoUrl ? (
                    <img 
                      src={game.logoUrl} 
                      alt={game.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  ) : (
                    <TrendingUp className="text-white" size={32} />
                  )}
                </div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-pink-400 transition-colors text-base">
                  {game.name}
                </h3>
                <p className="text-sm text-gray-400">{game.count} akun</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
  <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
      <h2 className="text-3xl font-bold text-white mb-4">Kenapa Pilih JB Alwikobra?</h2>
      <p className="text-gray-300 max-w-2xl mx-auto">
              Platform terpercaya dengan layanan terbaik untuk semua kebutuhan gaming Anda
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <Icon className="text-white" size={24} />
                  </div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-300">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
  <section className="py-16 bg-gradient-to-r from-pink-600 to-rose-600">
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
        className="bg-black/80 text-white border border-white/30 px-8 py-4 rounded-xl font-semibold hover:bg-black/60 transition-colors"
            >
              Mulai Belanja Sekarang
            </Link>
            <Link
              to="/sell"
    className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/10 transition-colors"
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
