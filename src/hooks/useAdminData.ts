/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-floating-promises */
import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAdminDataOptions<T> {
  endpoint: string;
  params?: Record<string, any>;
  dependencies?: any[];
  cacheKey?: string;
  cacheTTL?: number; // Time to live in milliseconds
  onError?: (error: Error) => void;
  onSuccess?: (data: T) => void;
  transform?: (data: any) => T;
  immediate?: boolean; // Whether to fetch immediately on mount
}

interface UseAdminDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  mutate: (newData: T | ((prevData: T | null) => T)) => void;
  invalidate: () => void;
}

// Simple in-memory cache
const dataCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export const clearAdminCache = (pattern?: string) => {
  if (!pattern) {
    dataCache.clear();
    return;
  }
  // Avoid direct iterator to prevent need for downlevelIteration
  Array.from(dataCache.keys()).forEach((k) => {
    if (k.includes(pattern)) dataCache.delete(k);
  });
};

export const useAdminData = <T = any>({
  endpoint,
  params = {},
  dependencies = [],
  cacheKey,
  cacheTTL = 60000, // 1 minute default
  onError,
  onSuccess,
  transform,
  immediate = true
}: UseAdminDataOptions<T>): UseAdminDataReturn<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Generate cache key
  const finalCacheKey = cacheKey || `${endpoint}-${JSON.stringify(params)}`;

  // Check cache
  const getCachedData = useCallback((): T | null => {
    const cached = dataCache.get(finalCacheKey);
    if (cached && (Date.now() - cached.timestamp) < cached.ttl) {
      return cached.data;
    }
    return null;
  }, [finalCacheKey]);

  // Set cache
  const setCachedData = useCallback((newData: T) => {
    dataCache.set(finalCacheKey, {
      data: newData,
      timestamp: Date.now(),
      ttl: cacheTTL
    });
  }, [finalCacheKey, cacheTTL]);

  // Fetch data
  const fetchData = useCallback(async () => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first
    const cachedData = getCachedData();
    if (cachedData) {
      setData(cachedData);
      setError(null);
      onSuccess?.(cachedData);
      return;
    }

    setLoading(true);
    setError(null);

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      // Build URL with params
      const url = new URL(`/api/admin`, window.location.origin);
      url.searchParams.append('action', endpoint);
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });

      const response = await fetch(url.toString(), {
        signal: abortControllerRef.current.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Request failed');
      }

      // Transform data if needed
      const transformedData = transform ? transform(result.data) : result.data;
      
      setData(transformedData);
      setCachedData(transformedData);
      onSuccess?.(transformedData);
      
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled, ignore
      }
      
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      onError?.(error);
      
      // Try to use stale cache data as fallback
      const staleData = dataCache.get(finalCacheKey);
      if (staleData) {
        setData(staleData.data);
        console.warn(`Using stale cache for ${finalCacheKey}:`, error);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, params, getCachedData, setCachedData, transform, onSuccess, onError, finalCacheKey]);

  // Refetch function
  const refetch = useCallback(async () => {
    // Clear cache for this key
    dataCache.delete(finalCacheKey);
    await fetchData();
  }, [fetchData, finalCacheKey]);

  // Mutate function for optimistic updates
  const mutate = useCallback((newData: T | ((prevData: T | null) => T)) => {
    const updatedData = typeof newData === 'function' 
      ? (newData as (prevData: T | null) => T)(data) 
      : newData;
    setData(updatedData);
    setCachedData(updatedData);
  }, [data, setCachedData]);

  // Invalidate cache
  const invalidate = useCallback(() => {
    dataCache.delete(finalCacheKey);
  }, [finalCacheKey]);

  // Fetch on mount and dependency changes
  useEffect(() => {
    if (immediate) {
      fetchData();
    }

    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [immediate, ...dependencies]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    data,
    loading,
    error,
    refetch,
    mutate,
    invalidate
  };
};

// Hook for mutations (create, update, delete)
interface UseAdminMutationOptions<TData = any, TVariables = any> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables) => void;
  invalidateKeys?: string[]; // Cache keys to invalidate after successful mutation
}

interface UseAdminMutationReturn<TData = any, TVariables = any> {
  mutate: (variables: TVariables) => Promise<TData>;
  loading: boolean;
  error: Error | null;
}

export const useAdminMutation = <TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseAdminMutationOptions<TData, TVariables> = {}
): UseAdminMutationReturn<TData, TVariables> => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      
      // Invalidate specified cache keys
      if (options.invalidateKeys) {
        options.invalidateKeys.forEach(key => {
          clearAdminCache(key);
        });
      }

      options.onSuccess?.(result, variables);
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Mutation failed');
      setError(error);
      options.onError?.(error, variables);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [mutationFn, options]);

  return {
    mutate,
    loading,
    error
  };
};

// Utility hook for pagination
interface UsePaginationOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  onPageChange?: (page: number, pageSize: number) => void;
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  reset: () => void;
}

export const usePagination = ({
  defaultPage = 1,
  defaultPageSize = 10,
  onPageChange
}: UsePaginationOptions = {}): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(defaultPage);
  const [pageSize, setPageSize] = useState(defaultPageSize);

  const setPage = useCallback((page: number) => {
    setCurrentPage(page);
    onPageChange?.(page, pageSize);
  }, [pageSize, onPageChange]);

  const setPageSizeHandler = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
    onPageChange?.(1, size);
  }, [onPageChange]);

  const reset = useCallback(() => {
    setCurrentPage(defaultPage);
    setPageSize(defaultPageSize);
    onPageChange?.(defaultPage, defaultPageSize);
  }, [defaultPage, defaultPageSize, onPageChange]);

  return {
    currentPage,
    pageSize,
    setPage,
    setPageSize: setPageSizeHandler,
    reset
  };
};
