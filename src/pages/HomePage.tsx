import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Product } from '../types';
import ProductCard from '../components/ProductCard';
import HorizontalScroller from '../components/HorizontalScroller';
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
import BannerCarousel from '../components/BannerCarousel';
import { useToast } from '../components/Toast';
import { 
  IOSContainer, 
  IOSGrid, 
  IOSCard, 
  IOSButton, 
  IOSHero, 
  IOSSectionHeader, 
  IOSSkeleton 
} from '../components/ios/IOSDesignSystem';

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

// Memoized feature cards for better performance with iOS design
const FeatureCard = React.memo(({ icon: Icon, title, description }: {
  icon: React.ComponentType<any>;
  title: string;
  description: string;
}) => (
  <IOSCard className="group hover:border-ios-accent/30 transition-all duration-300">
    <div className="w-12 h-12 bg-gradient-to-r from-ios-accent to-pink-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200">
      <Icon className="text-white" size={24} />
    </div>
    <h3 className="text-lg font-semibold text-ios-text mb-2">{title}</h3>
    <p className="text-ios-text-secondary text-sm leading-relaxed">{description}</p>
  </IOSCard>
));

FeatureCard.displayName = 'FeatureCard';

// Optimized loading skeleton component with iOS design
const HomePageSkeleton = React.memo(() => (
  <div className="min-h-screen bg-ios-background animate-pulse">
    <IOSContainer className="py-8">
      <IOSSkeleton className="h-48 mb-8" />
      <IOSSkeleton className="h-32 mb-8" />
      <IOSGrid columns={4} gap="medium">
        {Array.from({ length: 8 }, (_, i) => (
          <IOSSkeleton key={i} className="h-24" />
        ))}
      </IOSGrid>
    </IOSContainer>
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
  const { ProductService } = await import('../services/productService');
      
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
      <IOSContainer className="min-h-screen flex items-center justify-center">
        <IOSCard className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">😔</div>
          <h2 className="text-2xl font-bold text-ios-text mb-2">Oops! Terjadi Kesalahan</h2>
          <p className="text-ios-text-secondary mb-6">{state.error}</p>
          <IOSButton variant="primary" onClick={handleRetry}>
            Coba Lagi
          </IOSButton>
        </IOSCard>
      </IOSContainer>
    );
  }

  return (
    <IOSContainer className="min-h-screen">
      {/* Error banner for partial failures */}
      {state.error && (state.flashSaleProducts.length > 0 || state.popularGames.length > 0) && (
        <IOSCard variant="outlined" className="bg-yellow-900/50 border-l-4 border-yellow-400 mx-4 mt-4">
          <p className="text-yellow-200 text-sm">{state.error}</p>
        </IOSCard>
      )}

      {/* Top Banner Slideshow */}
      <section className="py-3 sm:py-4 md:py-6" aria-label="Slideshow banner">
        <IOSContainer>
          <BannerCarousel />
        </IOSContainer>
      </section>

      {/* Hero Section */}
      <IOSHero
        title="Marketplace Akun Game #1 di Indonesia"
        subtitle="Jual, beli, dan rental akun game favorit Anda dengan mudah, aman, dan terpercaya. Dapatkan akun impian dengan harga terbaik!"
        backgroundGradient="from-gray-900 via-black to-gray-900"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/flash-sales" aria-label="Lihat flash sale hari ini">
            <IOSButton variant="primary" icon={Zap} size="large" className="bg-pink-600 hover:bg-pink-700 border-2 border-pink-500 shadow-lg">
              Flash Sale Hari Ini
            </IOSButton>
          </Link>
          <Link to="/products" aria-label="Lihat semua produk">
            <IOSButton variant="secondary" icon={ShoppingBag} size="large" className="bg-gray-800 hover:bg-gray-700 border-2 border-gray-600 text-white">
              Lihat Semua Produk
            </IOSButton>
          </Link>
          <Link to="/sell" aria-label="Jual akun game Anda">
            <IOSButton variant="ghost" icon={TrendingUp} size="large" className="bg-white text-black hover:bg-gray-100 border-2 border-white">
              Jual Akun Game Anda
            </IOSButton>
          </Link>
        </div>
      </IOSHero>

      {/* Flash Sales Section */}
      {state.flashSaleProducts.length > 0 && (
        <section className="py-16" aria-label="Flash sale products">
          <IOSContainer>
            <IOSSectionHeader
              title="Flash Sale"
              subtitle="Diskon hingga 70% - Terbatas!"
              action={{
                label: "Lihat Semua",
                onClick: () => window.location.href = "/flash-sales"
              }}
            />

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
          </IOSContainer>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16" aria-label="Platform features">
        <IOSContainer>
          <IOSSectionHeader
            title="Mengapa Pilih Kami?"
            subtitle="Platform terdepan dengan jaminan keamanan dan kualitas layanan terbaik"
          />
          
          <IOSGrid columns={4} gap="medium">
            {features.map((feature, index) => (
              <FeatureCard 
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            ))}
          </IOSGrid>
        </IOSContainer>
      </section>

      {/* Game Categories */}
      <section className="py-16" aria-label="Popular games">
        <IOSContainer>
          <IOSSectionHeader
            title="Game Populer"
            subtitle="Pilih dari berbagai game populer yang tersedia di platform kami"
          />

          <IOSGrid columns={6} gap="medium">
            {state.popularGames.map((game) => (
              <Link
                key={game.id}
                to={`/products?game=${encodeURIComponent(game.name)}`}
              >
                <IOSCard className="text-center group hover:border-ios-accent/30 transition-all duration-200">
                  <div className="w-24 h-24 bg-gradient-to-br from-ios-accent to-pink-600 rounded-xl mx-auto mb-4 flex items-center justify-center overflow-hidden">
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
                  <h3 className="font-semibold text-ios-text mb-1 group-hover:text-ios-accent transition-colors text-base">
                    {game.name}
                  </h3>
                  <p className="text-sm text-ios-text-secondary">{game.count} akun</p>
                </IOSCard>
              </Link>
            ))}
          </IOSGrid>
        </IOSContainer>
      </section>

      {/* CTA Section */}
      <IOSHero
        title="Siap Memulai Petualangan Gaming Anda?"
        subtitle="Bergabunglah dengan ribuan gamer lainnya yang sudah mempercayakan transaksi mereka kepada kami"
        backgroundGradient="from-ios-accent to-rose-600"
      >
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/products">
            <IOSButton variant="secondary" size="large" className="bg-black/80 text-white border border-white/30 hover:bg-black/60">
              Mulai Belanja Sekarang
            </IOSButton>
          </Link>
          <Link to="/sell">
            <IOSButton variant="ghost" size="large" className="bg-white/20 backdrop-blur-sm border-2 border-white text-white hover:bg-white/30 shadow-lg">
              Jual Akun Anda
            </IOSButton>
          </Link>
        </div>
      </IOSHero>
    </IOSContainer>
  );
};

export default HomePage;
