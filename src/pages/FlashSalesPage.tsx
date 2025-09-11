import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Product, ProductTier } from '../types';
import ProductCard from '../components/ProductCard';
import { 
  Zap, 
  Clock, 
  Flame,
  TrendingUp,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  Search
} from 'lucide-react';

// --- Sorting helpers extracted outside component to avoid any ESLint false-positives ---
const discountPct = (p: Product) =>
  p.originalPrice && p.isFlashSale
    ? ((p.originalPrice - p.price) / p.originalPrice) * 100
    : 0;

const FLASH_SORT_COMPARATORS: Record<
  'price-asc' | 'price-desc' | 'discount-desc' | 'name-asc',
  (a: Product, b: Product) => number
> = {
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  'discount-desc': (a, b) => discountPct(b) - discountPct(a),
  'name-asc': (a, b) => a.name.localeCompare(b.name),
};

// Pagination configuration
const ITEMS_PER_PAGE = 12;

// Updated grid layouts with mobile-first approach and proper spacing
const GRID_LAYOUTS = {
  '2': 'grid-cols-2 gap-3 sm:gap-4',
  '3': 'grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3',
  '4': 'grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4',
  '6': 'grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6'
} as const;

type GridLayout = keyof typeof GRID_LAYOUTS;

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  startIndex: number;
  endIndex: number;
}

interface FlashSalesFilters {
  searchQuery: string;
  sortBy: 'price-asc' | 'price-desc' | 'discount-desc' | 'name-asc';
  gameFilter: string;
}

const FlashSalesPage: React.FC = () => {
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [gridLayout, setGridLayout] = useState<GridLayout>('4');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<FlashSalesFilters>({
    searchQuery: '',
    sortBy: 'discount-desc',
    gameFilter: ''
  });

  // Fetch flash sale products
  useEffect(() => {
    let mounted = true;
    
    const fetchFlashSales = async () => {
      try {
        setLoading(true);
        // Dynamic import of ProductService
  const { ProductService } = await import('../services/productService');
        
        if (!mounted) return;
        
        const flashSales = await ProductService.getFlashSales();
        
        if (!mounted) return;
        
        setFlashSaleProducts(flashSales.map(sale => sale.product));
      } catch (error) {
        console.error('Error fetching flash sales:', error);
        // Fallback mock data for development
        if (mounted) {
          const mockProducts: Product[] = Array.from({ length: 25 }, (_, i) => ({
            id: `flash-${i + 1}`,
            name: `Akun ${['Mobile Legends', 'Free Fire', 'PUBG Mobile', 'Genshin Impact', 'Call of Duty'][i % 5]} Premium #${i + 1}`,
            description: `Akun premium dengan rank tinggi dan item eksklusif. Harga flash sale terbatas!`,
            price: Math.floor(Math.random() * 500000) + 50000,
            originalPrice: Math.floor(Math.random() * 800000) + 200000,
            image: `https://images.unsplash.com/photo-${1542751110 + i}-97427bbecf20?w=400&h=300&fit=crop`,
            images: [`https://images.unsplash.com/photo-${1542751110 + i}-97427bbecf20?w=400&h=300&fit=crop`],
            category: 'gaming-accounts',
            tier: ['reguler', 'pelajar', 'premium'][i % 3] as ProductTier,
            gameTitle: ['Mobile Legends', 'Free Fire', 'PUBG Mobile', 'Genshin Impact', 'Call of Duty'][i % 5],
            isActive: true,
            stock: Math.floor(Math.random() * 10) + 1,
            isFlashSale: true,
            flashSaleEndTime: new Date(Date.now() + Math.random() * 86400000).toISOString(),
            hasRental: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }));
          setFlashSaleProducts(mockProducts);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    fetchFlashSales();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...flashSaleProducts];

    // Apply search filter
    if (filters.searchQuery.trim()) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(query) ||
        product.gameTitle?.toLowerCase().includes(query) ||
        product.description?.toLowerCase().includes(query)
      );
    }

    // Apply game filter
    if (filters.gameFilter) {
      filtered = filtered.filter(product => product.gameTitle === filters.gameFilter);
    }

    // Apply sorting using extracted comparator map
    filtered.sort(FLASH_SORT_COMPARATORS[filters.sortBy] ?? (() => 0));

    return filtered;
  }, [flashSaleProducts, filters]);

  // Pagination logic
  const paginationInfo = useMemo((): PaginationInfo => {
    const totalItems = filteredProducts.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);

    return {
      currentPage,
      totalPages,
      totalItems,
      itemsPerPage: ITEMS_PER_PAGE,
      startIndex,
      endIndex
    };
  }, [filteredProducts.length, currentPage]);

  // Get current page products
  const currentProducts = useMemo(() => {
    return filteredProducts.slice(paginationInfo.startIndex, paginationInfo.endIndex);
  }, [filteredProducts, paginationInfo.startIndex, paginationInfo.endIndex]);

  // Get unique game titles for filter
  const gameOptions = useMemo(() => {
    const games = new Set(flashSaleProducts.map(p => p.gameTitle).filter(Boolean));
    return Array.from(games).sort();
  }, [flashSaleProducts]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  // Pagination handlers
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handlePreviousPage = useCallback(() => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  }, [currentPage, handlePageChange]);

  const handleNextPage = useCallback(() => {
    if (currentPage < paginationInfo.totalPages) {
      handlePageChange(currentPage + 1);
    }
  }, [currentPage, paginationInfo.totalPages, handlePageChange]);

  // Filter handlers
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, searchQuery: e.target.value }));
  }, []);

  const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, sortBy: e.target.value as FlashSalesFilters['sortBy'] }));
  }, []);

  const handleGameFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, gameFilter: e.target.value }));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-ios-background text-ios-text">
        <section className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="ios-skeleton h-10 w-56 mb-8"></div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-ios-surface rounded-2xl border border-ios-border p-3">
                  <div className="ios-skeleton h-32 w-full mb-3 rounded-xl"></div>
                  <div className="ios-skeleton h-4 w-3/4 mb-2"></div>
                  <div className="ios-skeleton h-4 w-1/2 mb-3"></div>
                  <div className="flex gap-2">
                    <div className="ios-skeleton h-8 w-20 rounded-lg"></div>
                    <div className="ios-skeleton h-8 w-24 rounded-lg"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ios-background text-ios-text">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-pink-600 via-pink-500 to-rose-500 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-black/20 rounded-xl flex items-center justify-center border border-white/20">
              <Zap className="text-white" size={32} />
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white">
              Flash Sale
            </h1>
          </div>
          <p className="text-lg lg:text-xl text-pink-100 mb-8 max-w-3xl mx-auto">
            Diskon hingga 70% untuk akun game terpilih! Buruan, stok terbatas dan waktu terbatas!
          </p>
        </div>
      </section>

      {/* Flash Sale Stats */}
  <section className="py-6 bg-ios-surface border-b border-ios-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center">
            <div className="grid grid-cols-2 gap-8 lg:gap-12">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-pink-400 mb-2">
                  <Flame size={20} />
                  <span className="text-2xl font-bold">{flashSaleProducts.length}</span>
                </div>
                <p className="text-sm text-ios-text-secondary">Total Produk</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-green-400 mb-2">
                  <TrendingUp size={20} />
                  <span className="text-2xl font-bold">70%</span>
                </div>
                <p className="text-sm text-ios-text-secondary">Diskon Maksimal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
  <section className="py-6 bg-ios-surface/60 border-b border-ios-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ios-text-secondary" size={20} />
              <input
                type="text"
                placeholder="Cari produk flash sale..."
                value={filters.searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-4 py-2 bg-ios-surface border border-ios-border rounded-lg text-ios-text placeholder-ios-text-secondary focus:ring-2 focus:ring-ios-accent focus:border-transparent"
              />
            </div>

            {/* Filters and Controls */}
            <div className="flex items-center gap-4">
              {/* Grid Layout Toggle */}
              <div className="flex items-center space-x-1 bg-ios-surface rounded-lg p-1 border border-ios-border">
                {(['2', '3', '4', '6'] as GridLayout[]).map((layout) => (
                  <button
                    key={layout}
                    onClick={() => setGridLayout(layout)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                      gridLayout === layout
                        ? 'bg-pink-600 text-white'
                        : 'text-ios-text-secondary hover:text-ios-text'
                    }`}
                  >
                    {layout}
                  </button>
                ))}
              </div>

              {/* Filters Toggle */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                  showFilters
                    ? 'bg-pink-600 border-pink-600 text-white'
                    : 'bg-ios-surface border-ios-border text-ios-text hover:bg-ios-surface/80'
                }`}
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Filter</span>
              </button>

              {/* Results Info */}
              <div className="text-sm text-ios-text-secondary">
                {paginationInfo.totalItems} produk
              </div>
            </div>
          </div>

          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-ios-surface rounded-lg border border-ios-border">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                    Game
                  </label>
                  <select
                    value={filters.gameFilter}
                    onChange={handleGameFilterChange}
                    className="w-full px-3 py-2 bg-ios-surface border border-ios-border rounded-lg text-ios-text focus:ring-2 focus:ring-ios-accent"
                  >
                    <option value="">Semua Game</option>
                    {gameOptions.map((game) => (
                      <option key={game} value={game}>
                        {game}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ios-text-secondary mb-2">
                    Urutkan
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={handleSortChange}
                    className="w-full px-3 py-2 bg-ios-surface border border-ios-border rounded-lg text-ios-text focus:ring-2 focus:ring-ios-accent"
                  >
                    <option value="discount-desc">Diskon Terbesar</option>
                    <option value="price-asc">Harga Terendah</option>
                    <option value="price-desc">Harga Tertinggi</option>
                    <option value="name-asc">Nama A-Z</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Flash Sale Products Grid */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredProducts.length > 0 ? (
            <div className="space-y-8">
              {/* Products Grid with improved mobile spacing */}
              <div className={`grid ${GRID_LAYOUTS[gridLayout]}`}>
                {currentProducts.map((product) => (
                  <div key={product.id} className="ios-card">
                    <ProductCard
                      product={product}
                      showFlashSaleTimer={true}
                      className="h-full"
                    />
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {paginationInfo.totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8">
                  <div className="text-sm text-ios-text-secondary">
                    Menampilkan {paginationInfo.startIndex + 1}-{paginationInfo.endIndex} dari {paginationInfo.totalItems} produk
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {/* Previous Button */}
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className="flex items-center space-x-1 px-3 py-2 bg-ios-surface border border-ios-border rounded-lg text-ios-text hover:bg-ios-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft size={16} />
                      <span className="hidden sm:inline">Previous</span>
                    </button>

                    {/* Page Numbers */}
                    <div className="flex items-center space-x-1">
                      {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                        let pageNum;
                        if (paginationInfo.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= paginationInfo.totalPages - 2) {
                          pageNum = paginationInfo.totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(pageNum)}
              className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                              pageNum === currentPage
                                ? 'bg-pink-600 text-white'
                : 'bg-ios-surface text-ios-text hover:bg-ios-surface/80 border border-ios-border'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    {/* Next Button */}
                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === paginationInfo.totalPages}
                      className="flex items-center space-x-1 px-3 py-2 bg-ios-surface border border-ios-border rounded-lg text-ios-text hover:bg-ios-surface/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <span className="hidden sm:inline">Next</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-pink-500/10 border border-pink-500/40 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="text-pink-500" size={40} />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {filters.searchQuery || filters.gameFilter ? 'Tidak Ada Hasil' : 'Belum Ada Flash Sale'}
              </h3>
              <p className="text-gray-400 max-w-md mx-auto">
                {filters.searchQuery || filters.gameFilter 
                  ? 'Coba ubah kata kunci pencarian atau filter untuk menemukan produk yang Anda cari.'
                  : 'Flash sale sedang tidak tersedia saat ini. Pantau terus untuk penawaran menarik berikutnya!'
                }
              </p>
              <div className="mt-6 space-x-4">
                {(filters.searchQuery || filters.gameFilter) && (
                  <button 
                    onClick={() => setFilters({ searchQuery: '', sortBy: 'discount-desc', gameFilter: '' })}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
                  >
                    Reset Filter
                  </button>
                )}
                <Link 
                  to="/" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-semibold transition-colors"
                >
                  Lihat Produk Lainnya
                  <ArrowUpRight size={18} />
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How Flash Sale Works */}
      <section className="py-16 bg-black/60 border-t border-pink-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Cara Kerja Flash Sale
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Dapatkan akun game impian dengan harga terbaik melalui sistem flash sale kami
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-black border border-pink-500/40 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Clock className="text-pink-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Waktu Terbatas
              </h3>
              <p className="text-gray-300">
                Flash sale berlangsung dalam waktu terbatas. Pantau countdown timer untuk tidak melewatkan kesempatan.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black border border-pink-500/40 rounded-xl flex items-center justify-center mx-auto mb-4">
                <span className="text-pink-400 font-bold text-xl">STOK</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Stok Terbatas
              </h3>
              <p className="text-gray-300">
                Jumlah akun yang dijual dengan harga flash sale sangat terbatas. First come, first served!
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-black border border-pink-500/40 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="text-pink-400" size={24} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                Pembayaran Instan
              </h3>
              <p className="text-gray-300">
                Gunakan Xendit payment gateway untuk pembayaran yang cepat dan aman. Akun langsung dikirim setelah pembayaran.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-pink-600 to-rose-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Jual Akun Anda Sekarang!
          </h2>
          <p className="text-pink-100 mb-8 max-w-2xl mx-auto">
            Punya akun game yang tidak terpakai? Jual di platform kami dan dapatkan harga terbaik dengan proses yang mudah dan aman.
          </p>
          <div className="flex justify-center">
            <Link 
              to="/sell"
              className="bg-white/20 backdrop-blur-sm border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/30 transition-colors inline-flex items-center space-x-2 shadow-lg"
            >
              <span>Mulai Jual Akun</span>
              <ArrowUpRight size={20} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FlashSalesPage;
