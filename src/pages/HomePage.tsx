import React from 'react';
import BannerCarousel from '../components/BannerCarousel';
import { useHomePage } from '../hooks/useHomePage';
import { 
  HeroSection, 
  FlashSalesSection, 
  PopularGamesSection, 
  FeaturesSection, 
  CTASection 
} from '../components/home';
import ErrorBoundary from '../components/ErrorBoundary';

/**
 * Refactored HomePage component following best practices:
 * - Separated business logic into custom hook
 * - Modularized UI into reusable components
 * - Improved error handling and loading states
 * - Better TypeScript typing
 * - Removed ESLint suppressions
 */
const HomePage: React.FC = () => {
  const { flashSaleProducts, popularGames, loading, error } = useHomePage();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center">
        <div className="text-center space-y-6">
          {/* Modern loading spinner */}
          <div className="relative">
            <div className="w-16 h-16 mx-auto">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-pink-500/20 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-transparent border-t-pink-500 rounded-full animate-spin"></div>
              <div className="absolute top-2 left-2 w-12 h-12 border-4 border-transparent border-t-purple-500 rounded-full animate-spin animate-reverse"></div>
            </div>
          </div>
          
          {/* Loading text with gradient */}
          <div className="space-y-2">
            <p className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Memuat Produk Gaming
            </p>
            <p className="text-gray-400 text-sm">Sedang menyiapkan koleksi terbaik untuk Anda...</p>
          </div>
          
          {/* Loading dots animation */}
          <div className="flex justify-center space-x-2">
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto space-y-6">
          {/* Error icon */}
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl flex items-center justify-center border border-red-500/30">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          
          {/* Error message */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">Oops! Ada Masalah</h2>
            <p className="text-red-400 text-lg font-medium">Terjadi kesalahan: {error}</p>
            <p className="text-gray-400 text-sm">Silakan coba refresh halaman atau hubungi dukungan jika masalah berlanjut.</p>
          </div>
          
          {/* Action button */}
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40"
          >
            🔄 Refresh Halaman
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-app-dark">
        {/* Top Banner Slideshow */}
        <section className="py-3 sm:py-4 md:py-6">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
            <BannerCarousel />
          </div>
        </section>

        <HeroSection />
        
        <FlashSalesSection products={flashSaleProducts} />
        
        <PopularGamesSection games={popularGames} />
        
        <FeaturesSection />
        
        <CTASection />
      </div>
    </ErrorBoundary>
  );
};

export default HomePage;
