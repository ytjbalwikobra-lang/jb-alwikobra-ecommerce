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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Memuat produk...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Terjadi kesalahan: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700"
          >
            Refresh Halaman
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
