import React from 'react';
import { useProductsPage } from '../hooks/useProductsPage';
import { ProductFilters, ProductGrid, ProductPagination } from '../components/products';
import SeoBreadcrumbs from '../components/SeoBreadcrumbs';
import ErrorBoundary from '../components/ErrorBoundary';

/**
 * Refactored ProductsPage component following best practices:
 * - Separated business logic into custom hook (useProductsPage)
 * - Modularized UI into reusable components
 * - Improved error handling and loading states
 * - Better TypeScript typing
 * - Removed ESLint suppressions
 * - Clean separation of concerns
 */
const ProductsPage: React.FC = () => {
  const {
    // Data
    filteredProducts,
    tiers,
    gameTitles,
    loading,
    error,
    
    // Pagination
    currentPage,
    totalPages,
    paginatedProducts,
    
    // Filters
    searchTerm,
    selectedGame,
    selectedTier,
    sortBy,
    showFilters,
    
    // Actions
    setSearchTerm,
    setSelectedGame,
    setSelectedTier,
    setSortBy,
    setCurrentPage,
    setShowFilters,
    goToNextPage,
    goToPrevPage,
    resetFilters,
    
    // Constants
    sortOptions
  } = useProductsPage({ productsPerPage: 8 });

  if (error) {
    return (
      <div className="min-h-screen bg-app-dark flex items-center justify-center">
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Breadcrumbs */}
          <SeoBreadcrumbs
            items={[
              { name: 'Beranda', item: '/' },
              { name: 'Produk', item: '/products' }
            ]}
          />

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Semua Produk</h1>
            <p className="text-gray-300">
              Temukan akun game impian Anda dari koleksi terlengkap kami
            </p>
          </div>

          {/* Filters */}
          <ProductFilters
            searchTerm={searchTerm}
            selectedGame={selectedGame}
            selectedTier={selectedTier}
            sortBy={sortBy}
            showFilters={showFilters}
            tiers={tiers}
            gameTitles={gameTitles}
            sortOptions={sortOptions}
            onSearchTermChange={setSearchTerm}
            onSelectedGameChange={setSelectedGame}
            onSelectedTierChange={setSelectedTier}
            onSortByChange={setSortBy}
            onShowFiltersChange={setShowFilters}
            onResetFilters={resetFilters}
          />

          {/* Results Summary */}
          <div className="mb-6">
            <p className="text-gray-400">
              {loading ? 'Memuat...' : `${filteredProducts.length} produk ditemukan`}
            </p>
          </div>

          {/* Product Grid */}
          <ProductGrid 
            products={paginatedProducts}
            loading={loading}
            className="mb-8"
          />

          {/* Pagination */}
          <ProductPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalProducts={filteredProducts.length}
            productsPerPage={8}
            onPageChange={setCurrentPage}
            onNextPage={goToNextPage}
            onPrevPage={goToPrevPage}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ProductsPage;
