import React from 'react';
import { useFlashSalesPage } from '../hooks/useFlashSalesPage';
import SeoBreadcrumbs from '../components/SeoBreadcrumbs';
import { FlashSaleHero } from '../components/flashsale/FlashSaleHero';
import { FlashSaleStats } from '../components/flashsale/FlashSaleStats';
import { FlashSaleProductGrid } from '../components/flashsale/FlashSaleProductGrid';
import { FlashSaleEmptyState } from '../components/flashsale/FlashSaleEmptyState';
import { FlashSaleHowItWorks } from '../components/flashsale/FlashSaleHowItWorks';
import { FlashSaleCTA } from '../components/flashsale/FlashSaleCTA';

const FlashSalesPageRefactored: React.FC = () => {
  const {
    flashSaleProducts,
    loading,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    paginatedProducts
  } = useFlashSalesPage();

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
      {/* Breadcrumbs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <SeoBreadcrumbs
          items={[
            { name: 'Beranda', item: '/' },
            { name: 'Flash Sale', item: '/flash-sales' }
          ]}
        />
      </div>

      {/* Hero Section */}
      <FlashSaleHero />

      {/* Flash Sale Stats */}
      <FlashSaleStats 
        totalProducts={flashSaleProducts.length}
        maxDiscount={70}
      />

      {/* Flash Sale Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {flashSaleProducts.length > 0 ? (
            <FlashSaleProductGrid
              products={paginatedProducts}
              currentPage={currentPage}
              pageSize={pageSize}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          ) : (
            <FlashSaleEmptyState />
          )}
        </div>
      </section>

      {/* How Flash Sale Works */}
      <FlashSaleHowItWorks />

      {/* CTA Section */}
      <FlashSaleCTA />
    </div>
  );
};

export default FlashSalesPageRefactored;
