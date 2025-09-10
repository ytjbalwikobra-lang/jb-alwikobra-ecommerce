/**
 * Custom hook for HomePage data management
 * Separates business logic from UI components
 */
import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';

interface PopularGame {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string | null;
  count: number;
}

interface UseHomePageResult {
  flashSaleProducts: Product[];
  popularGames: PopularGame[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useHomePage = (): UseHomePageResult => {
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [popularGames, setPopularGames] = useState<PopularGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Lazy load services to reduce initial bundle
      const [{ adminService }, { ProductService }] = await Promise.all([
        import('../services/adminService'),
        import('../services/productService')
      ]);

      const [flashSales, popular] = await Promise.all([
        adminService.getFlashSales({ onlyActive: true, notEndedOnly: true }),
        ProductService.getPopularGames(20)
      ]);

      // Type-safe extraction of products from flash sales
      const products = (flashSales.data || [])
        .map((sale: { product: Product }) => sale.product)
        .filter((product: Product) => product !== null && product !== undefined);
      
      setFlashSaleProducts(products);
      setPopularGames(popular);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch data';
      setError(errorMessage);
      console.error('Error fetching homepage data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  return {
    flashSaleProducts,
    popularGames,
    loading,
    error,
    refetch: fetchData
  };
};
