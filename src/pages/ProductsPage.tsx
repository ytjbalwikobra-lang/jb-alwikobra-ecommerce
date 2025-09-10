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
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black flex items-center justify-center p-4">
        <div className="text-center max-w-md mx-auto space-y-6">
          {/* Error icon */}
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-2xl flex items-center justify-center border border-red-500/30">
            <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {/* Error message */}
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-white">Gagal Memuat Produk</h2>
            <p className="text-red-400 text-lg font-medium">Terjadi kesalahan: {error}</p>
            <p className="text-gray-400 text-sm">Silakan coba refresh halaman untuk memuat ulang produk.</p>
          </div>
          
          {/* Action button */}
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-xl hover:from-pink-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-pink-500/25"
          >
            🔄 Refresh Halaman
          </button>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 via-transparent to-purple-500/5 pointer-events-none"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Breadcrumbs */}
          <SeoBreadcrumbs
            items={[
              { name: 'Beranda', item: '/' },
              { name: 'Produk', item: '/products' }
            ]}
          />

          {/* Enhanced Page Header */}
          <div className="text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-3">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Semua Produk
                </h1>
                <p className="text-gray-400 text-lg sm:text-xl max-w-2xl">
                  Temukan akun game impian Anda dari koleksi terlengkap kami
                </p>
              </div>
              
              {/* Stats card */}
              <div className="bg-gradient-to-br from-gray-900/80 to-black/80 rounded-2xl p-6 border border-pink-500/20 backdrop-blur-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-pink-400">{filteredProducts.length}+</div>
                  <div className="text-sm text-gray-400">Produk Tersedia</div>
                </div>
              </div>
            </div>
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

          {/* Enhanced Results Summary */}
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-900/50 to-black/50 rounded-xl p-4 border border-gray-700/50 backdrop-blur-sm">
            <div className="flex items-center space-x-3">
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 border-2 border-pink-500/30 border-t-pink-500 rounded-full animate-spin"></div>
                  <span className="text-gray-300 font-medium">Memuat produk...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-gray-300 font-medium">
                    Menampilkan <span className="text-pink-400 font-bold">{filteredProducts.length}</span> produk
                  </span>
                </div>
              )}
            </div>
            {!loading && filteredProducts.length > 0 && (
              <div className="flex items-center space-x-2 text-gray-400 text-sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                <span>Halaman {currentPage} dari {totalPages}</span>
              </div>
            )}
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
