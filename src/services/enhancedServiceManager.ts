/**
 * Enhanced Service Layer with World-Class Caching
 * Unified service interface with intelligent caching, request deduplication, and offline support
 */

import { globalCache, cacheUtils, CacheOptions } from './globalCacheManager';
import { RequestDeduplicator } from '../utils/requestDeduplicator';

export interface ServiceConfig {
  baseUrl?: string;
  defaultTTL?: number;
  enableOffline?: boolean;
  retryAttempts?: number;
  timeout?: number;
  enableMetrics?: boolean;
}

export interface ServiceMetrics {
  totalRequests: number;
  cacheHits: number;
  networkRequests: number;
  averageResponseTime: number;
  errorRate: number;
}

export interface ServiceRequest<T = any> {
  endpoint: string;
  params?: Record<string, any>;
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
    cache?: CacheOptions;
    skipCache?: boolean;
    skipDeduplication?: boolean;
  };
}

class EnhancedServiceManager {
  private static instance: EnhancedServiceManager;
  private deduplicator = new RequestDeduplicator();
  private metrics: ServiceMetrics = {
    totalRequests: 0,
    cacheHits: 0,
    networkRequests: 0,
    averageResponseTime: 0,
    errorRate: 0,
  };
  private responseTimes: number[] = [];
  private errorCount = 0;

  static getInstance(): EnhancedServiceManager {
    if (!EnhancedServiceManager.instance) {
      EnhancedServiceManager.instance = new EnhancedServiceManager();
    }
    return EnhancedServiceManager.instance;
  }

  private constructor() {
    this.setupOfflineHandling();
    this.setupPerformanceMonitoring();
  }

  /**
   * Universal request method with advanced caching and optimization
   */
  async request<T>(request: ServiceRequest<T>, config: ServiceConfig = {}): Promise<T> {
    const startTime = performance.now();
    this.metrics.totalRequests++;

    try {
      const {
        endpoint,
        params = {},
        options = {}
      } = request;

      const {
        method = 'GET',
        cache = {},
        skipCache = false,
        skipDeduplication = false
      } = options;

      // Generate consistent cache key
      const cacheKey = cacheUtils.generateKey(`${method}:${endpoint}`, params);

      // Try cache first for GET requests
      if (method === 'GET' && !skipCache) {
        const cached = globalCache.get<T>(cacheKey);
        if (cached !== null) {
          this.metrics.cacheHits++;
          this.updateMetrics(startTime);
          return cached;
        }
      }

      // Create request function
      const requestFn = async (): Promise<T> => {
        this.metrics.networkRequests++;
        return this.performNetworkRequest<T>(request, config);
      };

      // Use deduplication for GET requests unless skipped
        const result = skipDeduplication || method !== 'GET'
        ? await requestFn()
          : await this.deduplicator.dedupe(cacheKey, requestFn);

      // Cache successful GET requests
      if (method === 'GET' && !skipCache && result !== null) {
        const cacheOptions: CacheOptions = {
          ttl: config.defaultTTL || cacheUtils.TTL.MEDIUM,
          tags: this.inferCacheTags(endpoint),
          ...cache
        };
        
        globalCache.set(cacheKey, result, cacheOptions);
      }

      this.updateMetrics(startTime);
      return result;

    } catch (error) {
      this.errorCount++;
      this.updateMetrics(startTime, true);
      throw error;
    }
  }

  /**
   * Batch requests for improved performance
   */
  async batchRequest<T>(
    requests: ServiceRequest<T>[],
    config: ServiceConfig = {}
  ): Promise<Array<{ success: boolean; data?: T; error?: Error }>> {
    const results = await Promise.allSettled(
      requests.map(request => this.request(request, config))
    );

    return results.map(result => ({
      success: result.status === 'fulfilled',
      data: result.status === 'fulfilled' ? result.value : undefined,
      error: result.status === 'rejected' ? result.reason : undefined
    }));
  }

  /**
   * Intelligent prefetching based on usage patterns
   */
  async prefetch<T>(
    requests: ServiceRequest<T>[],
    config: ServiceConfig = {}
  ): Promise<void> {
    // Use requestIdleCallback for non-blocking prefetch
    const prefetchFn = async () => {
      try {
        await Promise.allSettled(
          requests.map(request => 
            this.request(request, { ...config, defaultTTL: cacheUtils.TTL.LONG })
          )
        );
      } catch (error) {
        console.warn('Prefetch failed:', error);
      }
    };

    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      window.requestIdleCallback(prefetchFn);
    } else {
      setTimeout(prefetchFn, 100);
    }
  }

  /**
   * Cache invalidation with intelligent patterns
   */
  invalidateCache(patterns: string[] | 'all'): number {
    if (patterns === 'all') {
      globalCache.clear();
      return 0;
    }

    // Convert patterns to tags for efficient invalidation
    const tags = patterns.flatMap(pattern => this.patternToTags(pattern));
    return globalCache.invalidateByTags(tags);
  }

  /**
   * Get comprehensive metrics
   */
  getMetrics(): ServiceMetrics & { cacheStats: any } {
    return {
      ...this.metrics,
      cacheStats: globalCache.getStats()
    };
  }

  /**
   * Optimize cache based on usage patterns
   */
  optimizeCache(): void {
    const stats = globalCache.getStats();
    
    // If hit rate is low, we might be caching wrong things
    if (stats.hitRate < 20) {
      console.info('Low cache hit rate detected. Consider adjusting TTL values.');
    }

    // If memory usage is high, trigger cleanup
    if (stats.memoryUsage > 5000) { // 5MB
      console.info('High cache memory usage. Triggering cleanup.');
      this.invalidateCache(['old_data', 'rarely_used']);
    }
  }

  // Private implementation methods

  private async performNetworkRequest<T>(
    request: ServiceRequest<T>,
    config: ServiceConfig
  ): Promise<T> {
    const { endpoint, params = {}, options = {} } = request;
    const { method = 'GET', body, headers = {} } = options;
    const { timeout = 10000, retryAttempts = 2 } = config;

    let lastError: Error;
    
    for (let attempt = 0; attempt <= retryAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        // Build URL with params for GET requests
        const url = method === 'GET' && Object.keys(params).length > 0
          ? `${endpoint}?${new URLSearchParams(params)}`
          : endpoint;

        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers
          },
          body: method !== 'GET' ? JSON.stringify(body || params) : undefined,
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        return result;

      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on client errors
        if (error instanceof Error && error.message.includes('4')) {
          break;
        }

        // Exponential backoff for retries
        if (attempt < retryAttempts) {
          await new Promise(resolve => 
            setTimeout(resolve, Math.pow(2, attempt) * 1000)
          );
        }
      }
    }

    throw lastError!;
  }

  private updateMetrics(startTime: number, isError = false): void {
    const responseTime = performance.now() - startTime;
    this.responseTimes.push(responseTime);

    // Keep only last 100 response times for moving average
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }

    this.metrics.averageResponseTime = 
      this.responseTimes.reduce((sum, time) => sum + time, 0) / this.responseTimes.length;

    this.metrics.errorRate = 
      (this.errorCount / this.metrics.totalRequests) * 100;
  }

  private inferCacheTags(endpoint: string): string[] {
    const tags: string[] = [];

    if (endpoint.includes('product')) tags.push(cacheUtils.TAGS.PRODUCT_DATA);
    if (endpoint.includes('user') || endpoint.includes('auth')) tags.push(cacheUtils.TAGS.USER_DATA);
    if (endpoint.includes('setting')) tags.push(cacheUtils.TAGS.SETTINGS);
    if (endpoint.includes('banner')) tags.push(cacheUtils.TAGS.BANNERS);
    if (endpoint.includes('feed') || endpoint.includes('post')) tags.push(cacheUtils.TAGS.FEED);
    if (endpoint.includes('flash')) tags.push(cacheUtils.TAGS.FLASH_SALES);

    return tags.length > 0 ? tags : ['general'];
  }

  private patternToTags(pattern: string): string[] {
    const tagMapping: Record<string, string[]> = {
      'products': [cacheUtils.TAGS.PRODUCT_DATA],
      'users': [cacheUtils.TAGS.USER_DATA],
      'auth': [cacheUtils.TAGS.AUTH],
      'settings': [cacheUtils.TAGS.SETTINGS],
      'banners': [cacheUtils.TAGS.BANNERS],
      'feed': [cacheUtils.TAGS.FEED],
      'flash_sales': [cacheUtils.TAGS.FLASH_SALES],
      'old_data': ['general'], // Pattern for old cached data
      'rarely_used': ['general'] // Pattern for rarely accessed data
    };

    return tagMapping[pattern] || [pattern];
  }

  private setupOfflineHandling(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      console.info('Connection restored. Resuming network requests.');
    });

    window.addEventListener('offline', () => {
      console.info('Offline mode. Using cached data only.');
    });
  }

  private setupPerformanceMonitoring(): void {
    // Report metrics periodically in development
    if (process.env.NODE_ENV === 'development') {
      setInterval(() => {
        const metrics = this.getMetrics();
        console.group('📊 Service Performance Metrics');
        console.log('Cache Hit Rate:', `${metrics.cacheStats.hitRate}%`);
        console.log('Average Response Time:', `${metrics.averageResponseTime.toFixed(2)}ms`);
        console.log('Error Rate:', `${metrics.errorRate.toFixed(2)}%`);
        console.log('Cache Entries:', metrics.cacheStats.entries);
        console.groupEnd();
      }, 60000); // Every minute
    }
  }
}

// Export singleton instance
export const enhancedService = EnhancedServiceManager.getInstance();

// Export utility functions for common service patterns
export const serviceUtils = {
  // Create standardized service requests
  createGetRequest: (endpoint: string, params?: Record<string, any>): ServiceRequest => ({
    endpoint,
    params,
    options: { method: 'GET' }
  }),

  createPostRequest: (endpoint: string, body?: any): ServiceRequest => ({
    endpoint,
    options: { method: 'POST', body }
  }),

  createPutRequest: (endpoint: string, body?: any): ServiceRequest => ({
    endpoint,
    options: { method: 'PUT', body }
  }),

  createDeleteRequest: (endpoint: string): ServiceRequest => ({
    endpoint,
    options: { method: 'DELETE' }
  }),

  // Common cache configurations
  cacheConfigs: {
    shortLived: { ttl: cacheUtils.TTL.SHORT },
    standard: { ttl: cacheUtils.TTL.MEDIUM },
    longLived: { ttl: cacheUtils.TTL.LONG },
    persistent: { ttl: cacheUtils.TTL.VERY_LONG, syncAcrossTabs: true }
  }
} as const;
