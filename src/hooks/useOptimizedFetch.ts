import { useState, useEffect, useCallback, useRef } from 'react';
import { globalAPICache } from '../services/globalAPICache';
import { batchRequestService } from '../services/batchRequestService';

export interface OptimizedFetchOptions {
  // Caching options
  enableCache?: boolean;
  
  // Batching options
  enableBatching?: boolean;
  
  // Standard fetch options
  method?: string;
  headers?: Record<string, string>;
  body?: Record<string, any>;
}

export interface OptimizedFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Optimized fetch hook with caching and batching capabilities
 * Reduces API calls through intelligent caching and request batching
 */
export function useOptimizedFetch<T = any>(
  endpoint: string,
  options: OptimizedFetchOptions = {}
): OptimizedFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const {
    enableCache = true,
    enableBatching = true,
    method = 'GET',
    headers = {},
    body,
  } = options;

  const fetchData = useCallback(async (): Promise<T | null> => {
    try {
      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();
      
      setLoading(true);
      setError(null);

      const cacheKey = `${endpoint}${JSON.stringify(body || {})}`;

      // Check cache first if enabled
      if (enableCache && method === 'GET') {
        const cached = globalAPICache.get(cacheKey);
        if (cached) {
          setData(cached as T);
          setLoading(false);
          return cached as T;
        }
      }

      let result: T;

      // Use batching service if enabled and endpoint supports it
      if (enableBatching && method === 'GET' && isBatchableEndpoint(endpoint)) {
        result = await batchRequestService.request(
          getBatchEndpoint(endpoint),
          body || {}
        );
      } else {
        // Direct API call
        const response = await fetch(endpoint, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        result = await response.json() as T;
      }

      // Cache the result if caching is enabled
      if (enableCache && method === 'GET') {
        globalAPICache.set(cacheKey, result);
      }

      setData(result);
      setLoading(false);
      return result;

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return null; // Request was cancelled
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
      console.error('Optimized fetch error:', errorMessage);
      return null;
    }
  }, [endpoint, method, headers, body, enableCache, enableBatching]);

  const refresh = useCallback(async () => {
    // Clear cache before refresh
    if (enableCache) {
      const cacheKey = `${endpoint}${JSON.stringify(body || {})}`;
      globalAPICache.invalidate(cacheKey);
    }
    await fetchData();
  }, [fetchData, enableCache, endpoint, body]);

  // Initial data fetch
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (mounted) {
        await fetchData();
      }
    };

    void loadData();

    return () => {
      mounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refresh,
  };
}

/**
 * Hook for optimized admin dashboard data with multiple requests
 */
export function useOptimizedAdminData() {
  const [dashboardData, setDashboardData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cacheKey = 'admin_dashboard_complete';
      const cached = globalAPICache.get(cacheKey);
      
      if (cached) {
        setDashboardData(cached as Record<string, any>);
        setLoading(false);
        return;
      }

      // Make individual batched requests for admin data
      const [statsResult, ordersResult, productsResult] = await Promise.all([
        batchRequestService.request('admin/stats'),
        batchRequestService.request('admin/orders', { limit: 10 }),
        batchRequestService.request('admin/products', { limit: 10 }),
      ]);
      
      const combinedData = {
        stats: statsResult,
        recentOrders: ordersResult,
        recentProducts: productsResult,
      };

      // Cache for 5 minutes
      globalAPICache.set(cacheKey, combinedData);
      
      setDashboardData(combinedData);
      setLoading(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchAdminData();
  }, [fetchAdminData]);

  return {
    data: dashboardData,
    loading,
    error,
    refresh: fetchAdminData,
  };
}

/**
 * Hook for optimized product listing
 */
export function useOptimizedProducts(page: number = 1, category?: string) {
  const endpoint = `/api/feed?page=${page}${category ? `&category=${category}` : ''}`;
  
  return useOptimizedFetch(endpoint, {
    enableCache: true,
    enableBatching: true,
  });
}

/**
 * Helper functions
 */
function isBatchableEndpoint(endpoint: string): boolean {
  const batchablePatterns = [
    '/api/feed',
    '/api/admin/stats',
    '/api/admin/orders',
    '/api/admin/products',
    '/api/products',
    '/api/categories',
    '/api/banners',
  ];
  
  return batchablePatterns.some(pattern => endpoint.includes(pattern));
}

function getBatchEndpoint(endpoint: string): string {
  // Convert API endpoint to batch endpoint identifier
  if (endpoint.includes('/api/feed')) return 'feed';
  if (endpoint.includes('/api/admin/stats')) return 'admin/stats';
  if (endpoint.includes('/api/admin/orders')) return 'admin/orders';
  if (endpoint.includes('/api/admin/products')) return 'admin/products';
  if (endpoint.includes('/api/products')) return 'products';
  if (endpoint.includes('/api/categories')) return 'categories';
  if (endpoint.includes('/api/banners')) return 'banners';
  
  return endpoint.replace('/api/', '');
}

export default useOptimizedFetch;
