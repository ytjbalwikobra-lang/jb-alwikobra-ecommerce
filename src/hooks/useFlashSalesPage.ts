import { useState, useEffect } from 'react';
import { Product } from '../types';

interface UseFlashSalesPageReturn {
  flashSaleProducts: Product[];
  loading: boolean;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  pageSize: number;
  totalPages: number;
  paginatedProducts: Product[];
}

export const useFlashSalesPage = (): UseFlashSalesPageReturn => {
  const [flashSaleProducts, setFlashSaleProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Load flash sale products
  useEffect(() => {
    let mounted = true;
    
    const fetchFlashSales = async () => {
      try {
        // Prefer adminService join mapping for consistent flash sale products
        const { adminService } = await import('../services/adminService');
        
        if (!mounted) return;
        
        const flashSalesResult = await adminService.getFlashSales({ 
          onlyActive: true, 
          notEndedOnly: true 
        });
        
        if (!mounted) return;
        
        const products = (flashSalesResult.data || [])
          .map((sale: { product?: Product }) => sale.product)
          .filter((product): product is Product => Boolean(product));
          
        setFlashSaleProducts(products);
      } catch (error) {
        console.error('Error fetching flash sales:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchFlashSales();
    
    return () => {
      mounted = false;
    };
  }, []);

  // Calculate pagination values
  const totalPages = Math.max(1, Math.ceil(flashSaleProducts.length / pageSize));
  
  // Ensure current page stays in range when data changes
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  // Get current page products
  const paginatedProducts = flashSaleProducts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return {
    flashSaleProducts,
    loading,
    currentPage,
    setCurrentPage,
    pageSize,
    totalPages,
    paginatedProducts
  };
};
