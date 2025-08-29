import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ProductService } from '../services/productService.ts';
import { Product, Tier, GameTitle } from '../types/index.ts';
import ProductCard from '../components/ProductCard.tsx';
import HorizontalScroller from '../components/HorizontalScroller.tsx';
import { Search, SlidersHorizontal } from 'lucide-react';

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
  // Removed grid/list toggle; always use horizontal cards
  const [showFilters, setShowFilters] = useState(false);

  const sortOptions = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'price-low', label: 'Harga Terendah' },
    { value: 'price-high', label: 'Harga Tertinggi' },
    { value: 'name-az', label: 'Nama A-Z' },
    { value: 'name-za', label: 'Nama Z-A' }
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsData, tiersData, gameTitlesData] = await Promise.all([
          ProductService.getAllProducts(),
          ProductService.getTiers(),
          ProductService.getGameTitles()
        ]);
        setProducts(productsData);
        setTiers(tiersData);
        setGameTitles(gameTitlesData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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

  useEffect(() => {
    // Update URL params
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedGame) params.set('game', selectedGame);
    if (selectedTier) params.set('tier', selectedTier);
    if (sortBy !== 'newest') params.set('sortBy', sortBy);
    
    setSearchParams(params);
  }, [searchTerm, selectedGame, selectedTier, sortBy, setSearchParams]);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedGame('');
    setSelectedTier('');
    setSortBy('newest');
  };

  // Group filtered products by game title for sectioned display
  const gamesMap: Record<string, Product[]> = React.useMemo(() => {
    const map: Record<string, Product[]> = {};
    filteredProducts.forEach((p) => {
      const name = p.gameTitleData?.name || p.gameTitle || 'Lainnya';
      if (!map[name]) map[name] = [];
      map[name].push(p);
    });
    // If selectedGame is set but yields no results, map will be empty
    return map;
  }, [filteredProducts]);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-gray-200">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Katalog Produk</h1>
          <p className="text-gray-300">
            Temukan akun game impian Anda dari {products.length} produk tersedia
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs">
            {tiers.map(tier => (
              <span 
                key={tier.slug} 
                className="px-2 py-1 rounded border"
                style={{ 
                  borderColor: tier.borderColor + '30', 
                  backgroundColor: tier.color + '10', 
                  color: tier.color 
                }}
              >
                {tier.name}
              </span>
            ))}
          </div>
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
            {/* Mobile Filter Toggle */}
      <div className="lg:hidden mb-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
        className="w-full flex items-center justify-center space-x-2 bg-black border border-pink-500/40 rounded-lg px-4 py-2 text-gray-200"
              >
                <SlidersHorizontal size={20} />
                <span>Filter & Urutkan</span>
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
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Kategori</label>
                    <select
                      value={selectedTier}
                      onChange={(e) => setSelectedTier(e.target.value)}
                      className="w-full p-2 border border-pink-500/40 bg-black text-gray-100 rounded-lg"
                    >
                      <option value="">Semua Kategori</option>
                      {tiers.map(tier => (
                        <option key={tier.slug} value={tier.slug}>{tier.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
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
                  Menampilkan {filteredProducts.length} dari {products.length} produk
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

            {/* Game Sections with Horizontal Product Lists */}
            {Object.keys(gamesMap).length > 0 ? (
              Object.entries(gamesMap).map(([gameName, prods]) => (
                <section key={gameName} className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">{gameName}</h2>
                    {/* Quick filter to only this game */}
                    <button
                      onClick={() => setSelectedGame(gameName)}
                      className="text-sm text-pink-300 hover:text-pink-200"
                    >
                      Lihat {gameName} saja
                    </button>
                  </div>
                  <HorizontalScroller ariaLabel={`Produk ${gameName}`}>
                    {prods.map((product) => (
                      <div key={product.id} className="min-w-[320px] snap-start">
                        <ProductCard product={product} className="w-[320px]" />
                      </div>
                    ))}
                  </HorizontalScroller>
                </section>
              ))
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

            {/* Sections rendered above */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
