/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import React from 'react';

/**
 * GLOBAL API CACHE SERVICE
 * 
 * Advanced caching layer that intercepts ALL API calls and provides:
 * - Intelligent caching with different TTL strategies
 * - Request deduplication (prevents multiple identical calls)
 * - Background refresh for stale data
 * - Cache warming and preloading
 * - Memory management with LRU eviction
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  ttl: number;
  loading: boolean;
  error?: Error;
  requestId?: string;
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalRequests: number;
}

interface RequestDeduplicationEntry {
  promise: Promise<any>;
  timestamp: number;
}

class GlobalAPICache {
  private cache = new Map<string, CacheEntry>();
  private loadingRequests = new Map<string, RequestDeduplicationEntry>();
  private stats: CacheStats = { hits: 0, misses: 0, evictions: 0, totalRequests: 0 };
  private maxSize = 500; // Maximum cache entries
  private accessOrder = new Map<string, number>(); // For LRU eviction

  // TTL configurations for different data types
  private readonly TTL_CONFIGS = {
    // Static data - rarely changes
    'game-titles': 30 * 60 * 1000, // 30 minutes
    'tiers': 30 * 60 * 1000,
    'website-settings': 60 * 60 * 1000, // 1 hour
    
    // Semi-static data - changes occasionally  
    'dashboard': 2 * 60 * 1000, // 2 minutes
    'admin-stats': 2 * 60 * 1000,
    'products': 5 * 60 * 1000, // 5 minutes
    
    // Dynamic data - changes frequently
    'orders': 30 * 1000, // 30 seconds
    'feed': 60 * 1000, // 1 minute
    'notifications': 30 * 1000,
    'users': 2 * 60 * 1000, // 2 minutes
    
    // Real-time data - minimal caching
    'session': 10 * 1000, // 10 seconds
    'auth': 30 * 1000,
    
    // Default fallback
    'default': 5 * 60 * 1000 // 5 minutes
  };

  /**
   * Get cache key and determine TTL based on URL pattern
   */
  private getCacheConfig(url: string): { key: string; ttl: number } {
    const urlObj = new URL(url, window.location.origin);
    const path = urlObj.pathname;
    const action = urlObj.searchParams.get('action') || '';
    
    let cacheType = 'default';
    const key = `${path}?${urlObj.search}`;
    
    // Determine cache type based on URL patterns
    if (path.includes('/admin')) {
      if (action.includes('dashboard') || action.includes('stats')) {
        cacheType = 'admin-stats';
      } else if (action.includes('users')) {
        cacheType = 'users';
      } else if (action.includes('orders')) {
        cacheType = 'orders';
      } else if (action.includes('products')) {
        cacheType = 'products';
      }
    } else if (path.includes('/feed')) {
      if (action.includes('notifications')) {
        cacheType = 'notifications';
      } else {
        cacheType = 'feed';
      }
    } else if (path.includes('/auth')) {
      if (action.includes('session') || action.includes('validate')) {
        cacheType = 'session';
      } else {
        cacheType = 'auth';
      }
    }
    
    // Special cases for static data
    if (action.includes('game-titles') || action.includes('tiers')) {
      cacheType = action.includes('game-titles') ? 'game-titles' : 'tiers';
    }
    if (action.includes('settings')) {
      cacheType = 'website-settings';
    }
    
    return {
      key: this.normalizeKey(key),
      ttl: this.TTL_CONFIGS[cacheType] || this.TTL_CONFIGS.default
    };
  }

  /**
   * Normalize cache key for consistency
   */
  private normalizeKey(key: string): string {
    try {
      const url = new URL(key, window.location.origin);
      // Sort search params for consistent keys
      const params = new URLSearchParams(url.search);
      const sortedParams = new URLSearchParams();
      Array.from(params.keys())
        .sort()
        .forEach(key => {
          sortedParams.append(key, params.get(key) || '');
        });
      
      return `${url.pathname}?${sortedParams.toString()}`;
    } catch {
      return key;
    }
  }

  /**
   * LRU eviction - remove least recently used entries
   */
  private evictLRU(): void {
    if (this.cache.size <= this.maxSize) return;

    const entries = Array.from(this.accessOrder.entries())
      .sort((a, b) => a[1] - b[1]) // Sort by access time
      .slice(0, Math.floor(this.maxSize * 0.1)); // Remove oldest 10%

    entries.forEach(([key]) => {
      this.cache.delete(key);
      this.accessOrder.delete(key);
      this.stats.evictions++;
    });
  }

  /**
   * Mark key as accessed for LRU tracking
   */
  private markAccessed(key: string): void {
    this.accessOrder.set(key, Date.now());
  }

  /**
   * Check if cached data is fresh
   */
  private isFresh(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp < entry.ttl;
  }

  /**
   * Check if cached data is stale but usable
   */
  private isStale(entry: CacheEntry): boolean {
    const age = Date.now() - entry.timestamp;
    return age > entry.ttl && age < entry.ttl * 2; // Up to 2x TTL
  }

  /**
   * Main API call interceptor with advanced caching
   */
  async fetch(url: string, options: RequestInit = {}): Promise<any> {
    this.stats.totalRequests++;
    
    const { key, ttl } = this.getCacheConfig(url);
    const method = options.method || 'GET';
    
    // Only cache GET requests
    if (method !== 'GET') {
      // Clear related cache entries for mutations
      this.invalidatePattern(key);
      return this.performRequest(url, options);
    }

    // Check cache first
    const cached = this.cache.get(key);
    
    if (cached) {
      this.markAccessed(key);
      
      if (this.isFresh(cached) && !cached.loading) {
        this.stats.hits++;
        return cached.data;
      }
      
      if (this.isStale(cached) && !cached.loading) {
        // Return stale data immediately, refresh in background
        this.stats.hits++;
        this.backgroundRefresh(url, options, key, ttl);
        return cached.data;
      }
    }

    // Check for ongoing request (deduplication)
    const ongoing = this.loadingRequests.get(key);
    if (ongoing && Date.now() - ongoing.timestamp < 30000) { // 30s timeout
      return ongoing.promise;
    }

    // Create new request
    const promise = this.performCachedRequest(url, options, key, ttl);
    
    // Store in deduplication map
    this.loadingRequests.set(key, {
      promise,
      timestamp: Date.now()
    });

    try {
      const result = await promise;
      return result;
    } finally {
      this.loadingRequests.delete(key);
    }
  }

  /**
   * Perform request with caching
   */
  private async performCachedRequest(url: string, options: RequestInit, key: string, ttl: number): Promise<any> {
    this.stats.misses++;
    
    // Mark as loading
    this.cache.set(key, {
      data: null,
      timestamp: Date.now(),
      ttl,
      loading: true
    });

    try {
      const result = await this.performRequest(url, options);
      
      // Cache successful result
      this.cache.set(key, {
        data: result,
        timestamp: Date.now(),
        ttl,
        loading: false
      });

      this.markAccessed(key);
      this.evictLRU();
      
      return result;
    } catch (error) {
      // Cache error for short time to prevent retry storms
      this.cache.set(key, {
        data: null,
        timestamp: Date.now(),
        ttl: 30 * 1000, // 30 seconds
        loading: false,
        error: error as Error
      });
      
      throw error;
    }
  }

  /**
   * Background refresh for stale data
   */
  private backgroundRefresh(url: string, options: RequestInit, key: string, ttl: number): void {
    // Don't await this - it's background
    this.performCachedRequest(url, options, key, ttl).catch(() => {
      // Silent fail for background refresh
    });
  }

  /**
   * Actual network request
   */
  private async performRequest(url: string, options: RequestInit): Promise<any> {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Invalidate cache entries matching pattern
   */
  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
        this.accessOrder.delete(key);
      }
    }
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(url: string): void {
    const { key } = this.getCacheConfig(url);
    this.cache.delete(key);
    this.accessOrder.delete(key);
  }

  /**
   * Preload critical data
   */
  async preload(urls: string[]): Promise<void> {
    const promises = urls.map(url => 
      this.fetch(url).catch(() => {
        // Silent fail for preloading
      })
    );
    
    await Promise.allSettled(promises);
  }

  /**
   * Warm cache with homepage data
   */
  async warmCache(): Promise<void> {
    const criticalUrls = [
      '/api/admin?action=dashboard-stats',
      '/api/admin?action=game-titles',
      '/api/admin?action=tiers',
      '/api/admin?action=settings'
    ];
    
    await this.preload(criticalUrls);
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats & { hitRate: number; cacheSize: number } {
    const hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;
      
    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      cacheSize: this.cache.size
    };
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
    this.accessOrder.clear();
    this.loadingRequests.clear();
    this.stats = { hits: 0, misses: 0, evictions: 0, totalRequests: 0 };
  }

  /**
   * Manual cache control
   */
  set(url: string, data: any, customTTL?: number): void {
    const { key, ttl } = this.getCacheConfig(url);
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: customTTL || ttl,
      loading: false
    });
    this.markAccessed(key);
  }

  /**
   * Manual cache retrieval
   */
  get(url: string): any {
    const { key } = this.getCacheConfig(url);
    const cached = this.cache.get(key);
    
    if (cached && this.isFresh(cached)) {
      this.markAccessed(key);
      return cached.data;
    }
    
    return null;
  }
}

// Export singleton instance
export const globalAPICache = new GlobalAPICache();

/**
 * Enhanced fetch wrapper that uses global cache
 */
export const cachedFetch = (url: string, options?: RequestInit): Promise<any> => {
  return globalAPICache.fetch(url, options);
};

/**
 * Hook for API calls with global caching
 */
export const useCachedAPI = (url: string, options?: RequestInit) => {
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  const optionsString = React.useMemo(() => JSON.stringify(options), [options]);

  React.useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await cachedFetch(url, options);
        
        if (mounted) {
          setData(result);
        }
      } catch (err) {
        if (mounted) {
          setError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void fetchData();

    return () => {
      mounted = false;
    };
  }, [url, optionsString, options]);

  return { data, loading, error };
};

// Initialize cache warming on app start
if (typeof window !== 'undefined') {
  // Warm cache after a short delay
  setTimeout(() => {
    void globalAPICache.warmCache();
  }, 1000);
}

export default globalAPICache;
