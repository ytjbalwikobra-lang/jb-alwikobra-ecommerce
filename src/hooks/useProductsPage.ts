/**
 * Custom hook for ProductsPage data and state management
 * Centralizes all business logic and state management
 */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { Product, Tier, GameTitle } from '../types';

interface SortOption {
  value: string;
  label: string;
}

interface UseProductsPageOptions {
  productsPerPage?: number;
}

interface SavedPageState {
  currentPage?: number;
  searchTerm?: string;
  selectedGame?: string;
  selectedTier?: string;
  sortBy?: string;
}

interface LocationState {
  fromProductDetail?: boolean;
}

interface SortOption {
  value: string;
  label: string;
}

interface UseProductsPageOptions {
  productsPerPage?: number;
}

interface UseProductsPageResult {
  // Data
  products: Product[];
  filteredProducts: Product[];
  tiers: Tier[];
  gameTitles: GameTitle[];
  loading: boolean;
  error: string | null;
  
  // Pagination
  currentPage: number;
  totalPages: number;
  paginatedProducts: Product[];
  
  // Filters
  searchTerm: string;
  selectedGame: string;
  selectedTier: string;
  sortBy: string;
  showFilters: boolean;
  
  // Actions
  setSearchTerm: (term: string) => void;
  setSelectedGame: (game: string) => void;
  setSelectedTier: (tier: string) => void;
  setSortBy: (sort: string) => void;
  setCurrentPage: (page: number) => void;
  setShowFilters: (show: boolean) => void;
  goToNextPage: () => void;
  goToPrevPage: () => void;
  resetFilters: () => void;
  refresh: () => Promise<void>;
  
  // Constants
  sortOptions: SortOption[];
}

export const useProductsPage = (
  options: UseProductsPageOptions = {}
): UseProductsPageResult => {
  const { productsPerPage = 8 } = options;
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [gameTitles, setGameTitles] = useState<GameTitle[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedGame, setSelectedGame] = useState(searchParams.get('game') || '');
  const [selectedTier, setSelectedTier] = useState(searchParams.get('tier') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state with session storage restoration
  const [currentPage, setCurrentPage] = useState<number>(() => {
    const savedState = sessionStorage.getItem('productsPageState');
    if (savedState && (location.state as LocationState)?.fromProductDetail) {
      try {
        const parsedState = JSON.parse(savedState) as SavedPageState;
        return parsedState.currentPage || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  });

  const sortOptions: SortOption[] = [
    { value: 'newest', label: 'Terbaru' },
    { value: 'oldest', label: 'Terlama' },
    { value: 'price-low', label: 'Harga Terendah' },
    { value: 'price-high', label: 'Harga Tertinggi' },
    { value: 'name-az', label: 'Nama A-Z' },
    { value: 'name-za', label: 'Nama Z-A' }
  ];

  // Data fetching
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { ProductService } = await import('../services/productService');
      
      const [productsData, tiersData, gameTitlesData] = await Promise.all([
        ProductService.getAllProducts(),
        ProductService.getTiers(),
        ProductService.getGameTitles()
      ]);

      setProducts(productsData);
      setTiers(tiersData);
      setGameTitles(gameTitlesData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching products data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Initial data fetch
  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  // Restore state from session storage if returning from product detail
  useEffect(() => {
    const savedState = sessionStorage.getItem('productsPageState');
    if (savedState && (location.state as LocationState)?.fromProductDetail) {
      try {
        const parsedState = JSON.parse(savedState) as SavedPageState;
        if (typeof parsedState.searchTerm === 'string') setSearchTerm(parsedState.searchTerm);
        if (typeof parsedState.selectedGame === 'string') setSelectedGame(parsedState.selectedGame);
        if (typeof parsedState.selectedTier === 'string') setSelectedTier(parsedState.selectedTier);
        if (typeof parsedState.sortBy === 'string') setSortBy(parsedState.sortBy);
      } catch (error) {
        console.error('Error parsing saved state:', error);
      }
    }
  }, [location.state]);

  // Save state to session storage
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

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (selectedGame) params.set('game', selectedGame);
    if (selectedTier) params.set('tier', selectedTier);
    if (sortBy !== 'newest') params.set('sortBy', sortBy);
    
    setSearchParams(params);
  }, [searchTerm, selectedGame, selectedTier, sortBy, setSearchParams]);

  // Filter and sort products
  useEffect(() => {
    let filtered = [...products];

    // Apply filters
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(lowerSearchTerm) ||
        product.gameTitle.toLowerCase().includes(lowerSearchTerm) ||
        (product.description && product.description.toLowerCase().includes(lowerSearchTerm))
      );
    }

    if (selectedGame) {
      filtered = filtered.filter(product =>
        product.gameTitle.toLowerCase() === selectedGame.toLowerCase()
      );
    }

    if (selectedTier) {
      filtered = filtered.filter(product =>
        product.tier && product.tier.toLowerCase() === selectedTier.toLowerCase()
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name-az':
          return a.name.localeCompare(b.name);
        case 'name-za':
          return b.name.localeCompare(a.name);
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'newest':
        default:
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, searchTerm, selectedGame, selectedTier, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage;
    return filteredProducts.slice(startIndex, startIndex + productsPerPage);
  }, [filteredProducts, currentPage, productsPerPage]);

  // Navigation functions
  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedGame('');
    setSelectedTier('');
    setSortBy('newest');
    setCurrentPage(1);
  }, []);

  return {
    // Data
    products,
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
    refresh,
    
    // Constants
    sortOptions
  };
};
