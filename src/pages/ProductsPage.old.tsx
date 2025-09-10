/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return, @typescript-eslint/no-floating-promises, @typescript-eslint/no-unsafe-argument, @typescript-eslint/restrict-plus-operands, @typescript-eslint/no-unused-vars, react-hooks/exhaustive-deps, no-empty */
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Product, Tier, GameTitle } from '../types';
import ProductCard from '../components/ProductCard';
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react';
import SeoBreadcrumbs from '../components/SeoBreadcrumbs';

const ProductsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [gameTitles, setGameTitles] = useState<GameTitle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedGame, setSelectedGame] = useState(searchParams.get('game') || '');
  const [selectedTier, setSelectedTier] = useState(searchParams.get('tier') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state dengan logic untuk restore dari sessionStorage
  const [currentPage, setCurrentPage] = useState(() => {
    // Cek apakah user kembali dari detail produk
    const savedState = sessionStorage.getItem('productsPageState');
    if (savedState && location.state?.fromProductDetail) {
      try {
        const parsedState = JSON.parse(savedState);
        return parsedState.currentPage || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  });
  const productsPerPage = 8; // 8 products per page (2 columns x 4 rows)

  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'price-low', label: 'Harga Terendah' },
    { value: 'price-high', label: 'Harga Tertinggi' },
    { value: 'name-az', label: 'Nama A-Z' },
    { value: 'name-za', label: 'Nama Z-A' }
  ];

  useEffect(() => {
    let mounted = true;
    
    const fetchData = async () => {
      try {
        // Dynamic import of ProductService
        const { ProductService } = await import('../services/productService');
        
        if (!mounted) return;
        
        const [productsData, tiersData, gameTitlesData] = await Promise.all([
          ProductService.getAllProducts(),
          ProductService.getTiers(),
          ProductService.getGameTitles()
        ]);
        
        if (!mounted) return;
        
        setProducts(productsData);
        
        // Sort tiers: Pelajar → Reguler → Premium
        const sortedTiers = [...tiersData].sort((a, b) => {
          const order = { 'pelajar': 1, 'reguler': 2, 'premium': 3 };
          const aOrder = order[a.slug] || 999;
          const bOrder = order[b.slug] || 999;
          return aOrder - bOrder;
        });
        setTiers(sortedTiers);
        
        setGameTitles(gameTitlesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchData();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Restore filter state jika user kembali dari detail produk
  useEffect(() => {
    const savedState = sessionStorage.getItem('productsPageState');
    if (savedState && location.state?.fromProductDetail) {
      try {
        const parsedState = JSON.parse(savedState);
        if (parsedState.searchTerm !== undefined) setSearchTerm(parsedState.searchTerm);
        if (parsedState.selectedGame !== undefined) setSelectedGame(parsedState.selectedGame);
        if (parsedState.selectedTier !== undefined) setSelectedTier(parsedState.selectedTier);
        if (parsedState.sortBy !== undefined) setSortBy(parsedState.sortBy);
      } catch (error) {
        console.error('Error parsing saved state:', error);
      }
    }
  }, [location.state]);

  // Simpan state pagination dan filter setiap kali berubah
  useEffect(() => {
    const state = {
      currentPage,
      searchTerm,
      selectedGame,
      selectedTier,
      sortBy
    };
    sessionStorage.setItem('productsPageState', JSON.stringify(state));
  }, [currentPage, searchTerm, selectedGame, selectedTier, sortBy]);

  useEffect(() => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.gameTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Game filter
    if (selectedGame) {
      filtered = filtered.filter(product => {
        const gameName = product.gameTitleData?.name || product.gameTitle;
        return gameName?.toLowerCase() === selectedGame.toLowerCase();
      });
    }

    // Tier filter
    if (selectedTier) {
      filtered = filtered.filter(product => {
        const tierSlug = product.tierData?.slug || product.tier;
        return tierSlug?.toLowerCase() === selectedTier.toLowerCase();
      });
    }

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name-az':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name-za':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedGame, selectedTier, sortBy]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedGame, selectedTier, sortBy]);

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedGame) params.set('game', selectedGame);
    if (selectedTier) params.set('tier', selectedTier);
    if (sortBy !== 'newest') params.set('sortBy', sortBy);
    
    setSearchParams(params);
  }, [searchTerm, selectedGame, selectedTier, sortBy, setSearchParams]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGame('');
    setSelectedTier('');
    setSortBy('newest');
    setCurrentPage(1);
  };

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
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8 text-gray-200">
        {/* Header */}
        <div className="mb-4 sm:mb-6 lg:mb-8">
          <SeoBreadcrumbs
            items={[
              { name: 'Beranda', item: '/' },
              { name: 'Produk', item: '/products' }
            ]}
          />
          <h1 id="katalog-produk" className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Katalog Produk</h1>
        </div>

        <div className="lg:grid lg:grid-cols-4 lg:gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block">
            <div className="bg-black rounded-xl border border-pink-500/40 p-6 sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Filter</h3>
                <button
                  onClick={clearFilters}
                  className="text-sm text-pink-300 hover:text-pink-200"
                >
                  Reset
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cari Produk
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-pink-500/40 bg-black text-gray-100 placeholder-gray-500 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    placeholder="Nama akun, game..."
                  />
                </div>
              </div>

              {/* Game Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Game
                </label>
                <select
                  value={selectedGame}
                  onChange={(e) => setSelectedGame(e.target.value)}
                  className="w-full p-2 border border-pink-500/40 bg-black text-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Semua Game</option>
                  {gameTitles.map(game => (
                    <option key={game.slug} value={game.name}>{game.name}</option>
                  ))}
                </select>
              </div>

              {/* Tier Filter */}
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Kategori</label>
                <select
                  value={selectedTier}
                  onChange={(e) => setSelectedTier(e.target.value)}
                  className="w-full p-2 border border-pink-500/40 bg-black text-gray-100 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                >
                  <option value="">Semua Kategori</option>
                  {tiers.map(tier => (
                    <option key={tier.slug} value={tier.slug}>{tier.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Mobile Category Filter - Horizontal Scroll */}
            <div className="lg:hidden mb-4">
              <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                <button
                  onClick={() => setSelectedTier('')}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedTier === ''
                      ? 'bg-pink-600 text-white'
                      : 'bg-black border border-pink-500/40 text-gray-200 hover:bg-pink-600/20'
                  }`}
                >
                  Semua
                </button>
                {tiers.map(tier => (
                  <button
                    key={tier.slug}
                    onClick={() => setSelectedTier(tier.slug)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                      selectedTier === tier.slug
                        ? 'text-white'
                        : 'text-gray-200 hover:bg-pink-600/20'
                    }`}
                    style={{
                      backgroundColor: selectedTier === tier.slug ? tier.color : 'black',
                      borderColor: tier.color + '40',
                      borderWidth: '1px',
                      borderStyle: 'solid'
                    }}
                  >
                    {tier.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
        className="w-full flex items-center justify-center space-x-2 bg-black border border-pink-500/40 rounded-lg px-4 py-2 text-gray-200"
              >
                <SlidersHorizontal size={20} />
                <span>Filter Lainnya</span>
              </button>
            </div>

            {/* Mobile Filters */}
            {showFilters && (
              <div className="lg:hidden bg-black rounded-xl border border-pink-500/40 p-4 mb-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Cari</label>
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full p-2 border border-pink-500/40 bg-black text-gray-100 rounded-lg"
                      placeholder="Nama akun..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Game</label>
                    <select
                      value={selectedGame}
                      onChange={(e) => setSelectedGame(e.target.value)}
                      className="w-full p-2 border border-pink-500/40 bg-black text-gray-100 rounded-lg"
                    >
                      <option value="">Semua Game</option>
                      {gameTitles.map(game => (
                        <option key={game.slug} value={game.name}>{game.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Urutkan</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full p-2 border border-pink-500/40 bg-black text-gray-100 rounded-lg"
                    >
                      {sortOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-gray-200 border border-pink-500/40 rounded-lg hover:bg-white/5"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
                  >
                    Terapkan
                  </button>
                </div>
              </div>
            )}

            {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-black rounded-xl border border-pink-500/40 p-4 mb-4">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
        <span className="text-sm text-gray-300">
                  Menampilkan {startIndex + 1}-{Math.min(endIndex, filteredProducts.length)} dari {filteredProducts.length} produk
                  {totalPages > 1 && (
                    <span className="ml-2 text-pink-300">
                      (Halaman {currentPage} dari {totalPages})
                    </span>
                  )}
                </span>
              </div>

              <div className="flex items-center space-x-4">
                {/* Sort - Desktop */}
                <div className="hidden lg:flex items-center space-x-2">
                  <label className="text-sm text-gray-300">Urutkan:</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-pink-500/40 bg-black text-gray-100 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    {sortOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Grid Layout dengan Pagination */}
            {filteredProducts.length > 0 ? (
              <>
                {/* Products Grid - Responsive: 2 cols mobile, 3 cols tablet and desktop */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
                  {currentProducts.map((product) => (
                    <div key={product.id} className="w-full">
                      <ProductCard 
                        product={product} 
                        fromCatalogPage={true}
                        className="w-full h-full" 
                      />
                    </div>
                  ))}
                </div>

                {/* Pagination - Better mobile spacing */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2 mt-8 px-4 sm:px-0">
                    {/* Previous Button */}
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`flex items-center px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm ${
                        currentPage === 1
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-black border border-pink-500/40 text-gray-200 hover:bg-pink-600 hover:text-white'
                      }`}
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      <span className="hidden sm:inline">Sebelumnya</span>
                      <span className="sm:hidden">Prev</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                        // Show first page, last page, current page, and pages around current
                        const showPage = 
                          page === 1 || 
                          page === totalPages || 
                          (page >= currentPage - 1 && page <= currentPage + 1);
                        
                        if (!showPage) {
                          // Show ellipsis for gaps
                          if (page === currentPage - 2 || page === currentPage + 2) {
                            return (
                              <span key={page} className="px-1 sm:px-2 py-1 text-gray-500 text-sm">
                                ...
                              </span>
                            );
                          }
                          return null;
                        }

                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm ${
                              currentPage === page
                                ? 'bg-pink-600 text-white'
                                : 'bg-black border border-pink-500/40 text-gray-200 hover:bg-pink-600 hover:text-white'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`flex items-center px-2 sm:px-3 py-2 rounded-lg transition-colors text-sm ${
                        currentPage === totalPages
                          ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          : 'bg-black border border-pink-500/40 text-gray-200 hover:bg-pink-600 hover:text-white'
                      }`}
                    >
                      <span className="hidden sm:inline">Selanjutnya</span>
                      <span className="sm:hidden">Next</span>
                      <ChevronRight size={16} className="ml-1" />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-black/60 rounded-xl border border-pink-500/30">
                <div className="w-24 h-24 bg-black border border-pink-500/40 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="text-pink-400" size={32} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Tidak ada produk ditemukan
                </h3>
                <p className="text-gray-300 mb-4">
                  Coba ubah kata kunci pencarian atau filter Anda
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-pink-600 text-white px-6 py-2 rounded-lg hover:bg-pink-700 transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
