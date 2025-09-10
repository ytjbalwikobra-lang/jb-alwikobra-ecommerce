import { useState, useEffect, useCallback, useRef } from 'react';
import React from 'react';
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
 * Hook for optimized products data including products, tiers, and game titles
 */
export function useOptimizedProductsData() {
  const [productsData, setProductsData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadProductsData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      const cacheKey = 'products_data_combined';
      const cached = globalAPICache.get(cacheKey);
      if (cached) {
        setProductsData(cached);
        setLoading(false);
        return;
      }

      // Dynamic import and parallel loading
      const { ProductService } = await import('../services/productService');
      
      const [productsResult, tiersResult, gameTitlesResult] = await Promise.all([
        ProductService.getAllProducts(),
        ProductService.getTiers(),
        ProductService.getGameTitles()
      ]);

      // Sort tiers: Pelajar → Reguler → Premium
      const sortedTiers = [...tiersResult].sort((a, b) => {
        const order = { 'pelajar': 1, 'reguler': 2, 'premium': 3 };
        const aOrder = order[a.slug] || 999;
        const bOrder = order[b.slug] || 999;
        return aOrder - bOrder;
      });

      const combinedData = {
        products: productsResult || [],
        tiers: sortedTiers || [],
        gameTitles: gameTitlesResult || []
      };

      // Cache the result for 5 minutes
      globalAPICache.set(cacheKey, combinedData, 5 * 60 * 1000);

      setProductsData(combinedData);

    } catch (err) {
      console.error('Products data loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load products data');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void loadProductsData();
  }, [loadProductsData]);

  return {
    data: productsData,
    loading,
    error,
    refresh: loadProductsData
  };
}

/**
 * Hook for optimized feed data including posts, user products, and notifications
 */
export function useOptimizedFeedData(page = 1, filter = 'all', limit = 10) {
  const [feedData, setFeedData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadFeedData = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Use individual API calls with caching for now
      const feedEndpoint = `/api/feed?page=${page}&limit=${limit}&type=${filter}`;
      
      // Check cache first
      const cached = globalAPICache.get(feedEndpoint);
      if (cached) {
        setFeedData(cached);
        setLoading(false);
        return;
      }

      // Load feed data
      const token = localStorage.getItem('session_token') || '';
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

      const feedResponse = await fetch(feedEndpoint, { headers });
      const feedResult = await feedResponse.json();

      // Load eligible products if authenticated
      let eligibleResult = null;
      if (token) {
        try {
          const eligibleResponse = await fetch('/api/feed?action=eligible-products', { headers });
          eligibleResult = await eligibleResponse.json();
        } catch (e) {
          console.warn('Could not load eligible products:', e);
        }
      }

      // Mark notifications as read if authenticated
      if (token) {
        try {
          fetch('/api/feed?action=notifications-read', { 
            method: 'POST', 
            headers 
          }).catch(() => {/* silent fail */});
        } catch (e) {
          // silent fail
        }
      }

      const combinedData = {
        posts: feedResult?.data || [],
        total: feedResult?.total || 0,
        pagination: {
          page,
          limit,
          totalPages: Math.ceil((feedResult?.total || 0) / limit)
        },
        eligibleProducts: eligibleResult?.products || [],
        notReviewedProducts: eligibleResult?.notReviewedProducts || [],
        hasPurchases: !!eligibleResult?.hasPurchases
      };

      // Cache the result
      globalAPICache.set(feedEndpoint, combinedData, 2 * 60 * 1000); // 2 minute cache

      setFeedData(combinedData);

    } catch (err) {
      console.error('Feed data loading error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load feed data');
    } finally {
      setLoading(false);
    }
  }, [page, filter, limit]);

  React.useEffect(() => {
    loadFeedData();
  }, [loadFeedData]);

  return {
    data: feedData,
    loading,
    error,
    refresh: loadFeedData
  };
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
