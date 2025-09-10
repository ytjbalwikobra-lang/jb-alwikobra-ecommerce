import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
import { useToast } from '../components/Toast.tsx';

// World-class constants for better maintainability
const CONSTANTS = {
  POPULAR_GAMES_LIMIT: 20,
  FLASH_SALE_DISPLAY_LIMIT: 10,
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  ANIMATIONS: {
    LOADING_DURATION: 300,
    SECTION_STAGGER: 100,
  }
} as const;

// Performance optimized interfaces
interface HomePageState {
  flashSaleProducts: Product[];
  popularGames: Array<{ 
    id: string; 
    name: string; 
    slug: string; 
    logoUrl?: string | null; 
    count: number 
  }>;
  loading: boolean;
  error: string | null;
}

// Memoized feature cards for better performance
const FeatureCard = React.memo(({ icon: Icon, title, description }: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}) => (
  <div className="bg-black/60 border border-pink-500/30 p-6 rounded-xl hover:border-pink-400/60 transition-all duration-300 group">
    <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
      <Icon className="text-white" size={24} />
    </div>
    <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
    <p className="text-gray-300 text-sm leading-relaxed">{description}</p>
  </div>
));

FeatureCard.displayName = 'FeatureCard';

// Optimized loading skeleton component
const HomePageSkeleton = React.memo(() => (
  <div className="min-h-screen bg-app-dark animate-pulse">
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="h-48 bg-gray-800 rounded-xl mb-8"></div>
      <div className="h-32 bg-gray-800 rounded-xl mb-8"></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-24 bg-gray-800 rounded-xl"></div>
        ))}
      </div>
    </div>
  </div>
));

HomePageSkeleton.displayName = 'HomePageSkeleton';

const HomePage: React.FC = () => {
  const { showToast } = useToast();
  const [state, setState] = useState<HomePageState>({
    flashSaleProducts: [],
    popularGames: [],
    loading: true,
    error: null
  });

  // Memoized features array for better performance
  const features = useMemo(() => [
    {
      icon: Shield,
      title: 'Aman & Terpercaya',
      description: 'Transaksi aman dengan jaminan uang kembali dan sistem escrow terpercaya'
    },
    {
      icon: Clock,
      title: 'Proses Cepat',
      description: 'Akun dikirim maksimal 24 jam dengan notifikasi real-time'
    },
    {
      icon: Star,
      title: 'Kualitas Terbaik',
      description: 'Semua akun telah diverifikasi dan melalui quality assurance ketat'
    },
    {
      icon: Headphones,
      title: 'Support 24/7',
      description: 'Tim customer service profesional siap membantu kapan saja via WhatsApp'
    }
  ], []);

  // Optimized data fetching with error handling
  const fetchHomeData = useCallback(async (signal: AbortSignal) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Lazy load ProductService for better initial bundle size
      const { ProductService } = await import('../services/productService.ts');
      
      if (signal.aborted) return;

      // Parallel data fetching with proper error boundaries
      const [flashSalesResult, popularGamesResult] = await Promise.allSettled([
        ProductService.getFlashSales(),
        ProductService.getPopularGames(CONSTANTS.POPULAR_GAMES_LIMIT)
      ]);

      if (signal.aborted) return;

      // Handle results with proper error management
      const flashSaleProducts = flashSalesResult.status === 'fulfilled' 
        ? flashSalesResult.value.map(sale => sale.product)
        : [];
      
      const popularGames = popularGamesResult.status === 'fulfilled'
        ? popularGamesResult.value
        : [];

      // Check for partial failures
      const hasErrors = flashSalesResult.status === 'rejected' || popularGamesResult.status === 'rejected';
      
      setState({
        flashSaleProducts,
        popularGames,
        loading: false,
        error: hasErrors ? 'Beberapa data gagal dimuat' : null
      });

      if (hasErrors) {
        showToast('Beberapa konten mungkin tidak tersedia', 'info');
      }

    } catch (error) {
      if (signal.aborted) return;
      
      console.error('HomePage data fetch error:', error);
      setState(prev => ({
        ...prev,
        loading: false,
        error: 'Gagal memuat data. Silakan refresh halaman.'
      }));
      showToast('Gagal memuat halaman. Silakan coba lagi.', 'error');
    }
  }, [showToast]);

  // Effect with cleanup and error handling
  useEffect(() => {
    const controller = new AbortController();
    
    // Add slight delay for better UX
    const timer = setTimeout(() => {
      fetchHomeData(controller.signal);
    }, CONSTANTS.ANIMATIONS.LOADING_DURATION);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [fetchHomeData]);

  // Optimized retry handler
  const handleRetry = useCallback(() => {
    const controller = new AbortController();
    fetchHomeData(controller.signal);
  }, [fetchHomeData]);

  // Render loading state
  if (state.loading) {
    return <HomePageSkeleton />;
  }

  // Render error state with retry option
  if (state.error && state.flashSaleProducts.length === 0 && state.popularGames.length === 0) {
    return (
      <div className="min-h-screen bg-app-dark flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-white mb-2">Oops! Terjadi Kesalahan</h2>
          <p className="text-gray-300 mb-6 max-w-md">{state.error}</p>
          <button
            onClick={handleRetry}
            className="bg-pink-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-pink-700 transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-dark">
      {/* Error banner for partial failures */}
      {state.error && (state.flashSaleProducts.length > 0 || state.popularGames.length > 0) && (
        <div className="bg-yellow-900/50 border-l-4 border-yellow-400 p-4 mx-4 mt-4 rounded">
          <p className="text-yellow-200 text-sm">{state.error}</p>
        </div>
      )}

      {/* Top Banner Slideshow */}
      <section className="py-3 sm:py-4 md:py-6" aria-label="Slideshow banner">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
          <BannerCarousel />
        </div>
      </section>

      {/* Hero Section */}
      <section className="py-14" aria-label="Hero section">
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
                className="bg-pink-600 text-white px-8 py-4 rounded-xl font-semibold hover:bg-pink-700 transition-colors flex items-center justify-center space-x-2 group"
                aria-label="Lihat flash sale hari ini"
              >
                <Zap size={20} className="group-hover:animate-pulse" />
                <span>Flash Sale Hari Ini</span>
              </Link>
              <Link
                to="/products"
                className="bg-transparent text-pink-300 border-2 border-pink-500/60 px-8 py-4 rounded-xl font-semibold hover:bg-pink-500/10 transition-colors flex items-center justify-center space-x-2"
                aria-label="Lihat semua produk"
              >
                <ShoppingBag size={20} />
                <span>Lihat Semua Produk</span>
              </Link>
              <Link
                to="/sell"
                className="bg-white text-pink-600 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2"
                aria-label="Jual akun game Anda"
              >
                <TrendingUp size={20} />
                <span>Jual Akun Game Anda</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Flash Sales Section */}
      {state.flashSaleProducts.length > 0 && (
        <section className="py-16" aria-label="Flash sale products">
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
                className="text-pink-300 hover:text-pink-200 font-medium flex items-center space-x-1 transition-colors"
                aria-label="Lihat semua flash sale"
              >
                <span>Lihat Semua</span>
                <ChevronRight size={20} />
              </Link>
            </div>

            <HorizontalScroller ariaLabel="Produk Flash Sale" itemGapClass="gap-4">
              {state.flashSaleProducts.slice(0, CONSTANTS.FLASH_SALE_DISPLAY_LIMIT).map((product) => (
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

      {/* Features Section */}
      <section className="py-16" aria-label="Platform features">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Mengapa Pilih Kami?</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Platform terdepan dengan jaminan keamanan dan kualitas layanan terbaik
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard 
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Game Categories */}
      <section className="py-16" aria-label="Popular games">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Game Populer</h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Pilih dari berbagai game populer yang tersedia di platform kami
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {state.popularGames.map((game) => (
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
