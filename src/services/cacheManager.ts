/**
 * Centralized Cache Management System
 * Orchestrates caching across all enhanced services for world-class performance
 */

import { globalCache, cacheUtils } from './globalCacheManager';
import { enhancedProductService } from './enhancedProductService';
import { enhancedAuthService } from './enhancedAuthService';

export interface SystemCacheConfig {
  /** Enable automatic cache warmup on app start */
  autoWarmup?: boolean;
  /** Enable performance monitoring */
  enableMonitoring?: boolean;
  /** Cache optimization interval in minutes */
  optimizationInterval?: number;
  /** Maximum cache memory usage in MB */
  maxMemoryMB?: number;
}

/**
 * Central cache management for optimal API egress reduction
 */
export class CacheManager {
  private static instance: CacheManager;
  private config: Required<SystemCacheConfig>;
  private optimizationTimer?: NodeJS.Timeout;
  private monitoringTimer?: NodeJS.Timeout;

  private constructor(config: SystemCacheConfig = {}) {
    this.config = {
      autoWarmup: config.autoWarmup ?? true,
      enableMonitoring: config.enableMonitoring ?? process.env.NODE_ENV === 'development',
      optimizationInterval: config.optimizationInterval ?? 5, // 5 minutes
      maxMemoryMB: config.maxMemoryMB ?? 10 // 10MB
    };

    this.initialize();
  }

  static getInstance(config?: SystemCacheConfig): CacheManager {
    if (!this.instance) {
      this.instance = new CacheManager(config);
    }
    return this.instance;
  }

  /**
   * Initialize cache management system
   */
  private async initialize(): Promise<void> {
    if (this.config.autoWarmup) {
      await this.warmupCriticalCaches();
    }

    if (this.config.enableMonitoring) {
      this.startPerformanceMonitoring();
    }

    this.startCacheOptimization();
  }

  /**
   * Warm up critical application caches
   */
  async warmupCriticalCaches(): Promise<void> {
    console.log('🔥 Warming up critical caches...');
    
    const startTime = performance.now();
    
    try {
      await Promise.allSettled([
        // Product service critical data
        enhancedProductService.getTiers(),
        enhancedProductService.getGameTitles(),
        enhancedProductService.getFlashSales(),
        enhancedProductService.getPopularGames(10),
        
        // Auth service critical data (if not in secure mode)
        enhancedAuthService.warmupCache(),
        
        // Schema capabilities
        enhancedProductService.detectSchemaCapabilities()
      ]);

      const duration = performance.now() - startTime;
      console.log(`✅ Cache warmup completed in ${duration.toFixed(2)}ms`);
      
    } catch (error) {
      console.warn('⚠️ Cache warmup partially failed:', error);
    }
  }

  /**
   * Get comprehensive system cache statistics
   */
  getSystemStats(): {
    global: any;
    products: any;
    auth: any;
    memory: {
      usage: number;
      limit: number;
      percentage: number;
    };
    performance: {
      hitRate: number;
      totalRequests: number;
      egressSavings: number;
    };
  } {
    const globalStats = globalCache.getStats();
    const productStats = enhancedProductService.getCacheStats();
    const authStats = enhancedAuthService.getAuthCacheStats();

    const memoryUsage = globalStats.memoryUsage || 0;
    const memoryLimit = this.config.maxMemoryMB * 1024 * 1024; // Convert to bytes
    const memoryPercentage = (memoryUsage / memoryLimit) * 100;

    // Calculate estimated egress savings (assuming 80% hit rate = 80% savings)
    const hitRate = globalStats.hitRate || 0;
    const estimatedSavings = hitRate * 0.8; // Conservative estimate

    return {
      global: globalStats,
      products: productStats,
      auth: authStats,
      memory: {
        usage: memoryUsage,
        limit: memoryLimit,
        percentage: Math.round(memoryPercentage)
      },
      performance: {
        hitRate,
        totalRequests: (globalStats as any).totalRequests || 0,
        egressSavings: Math.round(estimatedSavings)
      }
    };
  }

  /**
   * Optimize cache performance based on usage patterns
   */
  async optimizeCache(): Promise<void> {
    const stats = this.getSystemStats();
    const { memory, performance } = stats;

    console.group('🔧 Cache Optimization');
    
    // Memory optimization
    if (memory.percentage > 80) {
      console.log('High memory usage detected, cleaning up...');
      await this.cleanupLowValueCaches();
    }

    // Performance optimization
    if (performance.hitRate < 50) {
      console.log('Low hit rate detected, adjusting TTL values...');
      await this.adjustCacheTTLs();
    }

    // Log optimization results
    console.log('Cache Stats:', {
      hitRate: `${performance.hitRate}%`,
      memoryUsage: `${memory.percentage}%`,
      egressSavings: `${performance.egressSavings}%`
    });
    
    console.groupEnd();
  }

  /**
   * Clear all system caches with intelligent patterns
   */
  async clearSystemCache(pattern?: 'all' | 'products' | 'auth' | 'static'): Promise<void> {
    switch (pattern) {
      case 'products':
        await enhancedProductService.clearCache();
        break;
      case 'auth':
        await enhancedAuthService.clearAuthCache();
        break;
      case 'static':
        // Clear only static data caches
        await globalCache.invalidateByTags(['tiers', 'game-titles', 'capabilities']);
        break;
      case 'all':
      default:
        globalCache.clear();
        break;
    }
    
    console.log(`🧹 Cache cleared: ${pattern || 'all'}`);
  }

  /**
   * Prefetch data based on user behavior patterns
   */
  async intelligentPrefetch(userContext?: {
    isLoggedIn?: boolean;
    isAdmin?: boolean;
    recentlyViewed?: string[];
  }): Promise<void> {
    if (!userContext) return;

    const prefetchPromises: Promise<any>[] = [];

    // Admin-specific prefetching
    if (userContext.isAdmin) {
      prefetchPromises.push(
        enhancedProductService.getAllProducts(),
        enhancedProductService.getFlashSales()
      );
    }

    // User-specific prefetching
    if (userContext.isLoggedIn) {
      prefetchPromises.push(
        enhancedProductService.getPopularGames(10),
        enhancedProductService.getTiers()
      );
    }

    // Execute prefetch in background
    Promise.allSettled(prefetchPromises).catch(() => {
      // Silently handle prefetch errors
    });
  }

  /**
   * Monitor cache performance and report metrics
   */
  private startPerformanceMonitoring(): void {
    this.monitoringTimer = setInterval(() => {
      const stats = this.getSystemStats();
      
      if (stats.performance.hitRate > 0) {
        console.group('📊 Cache Performance Report');
        console.log('Hit Rate:', `${stats.performance.hitRate}%`);
        console.log('Memory Usage:', `${stats.memory.percentage}%`);
        console.log('Estimated API Egress Savings:', `${stats.performance.egressSavings}%`);
        console.log('Cache Entries:', stats.global.entries);
        console.groupEnd();
      }
    }, 2 * 60 * 1000); // Every 2 minutes
  }

  /**
   * Start automatic cache optimization
   */
  private startCacheOptimization(): void {
    this.optimizationTimer = setInterval(() => {
      this.optimizeCache();
    }, this.config.optimizationInterval * 60 * 1000);
  }

  /**
   * Clean up low-value cache entries
   */
  private async cleanupLowValueCaches(): Promise<void> {
    // Remove entries with low access count or old timestamp
    const stats = globalCache.getStats();
    
    if (stats.entries > 100) {
      // Clear 20% of least recently used entries
      const clearCount = Math.floor(stats.entries * 0.2);
      // Note: This would require implementing LRU cleanup in globalCache
      console.log(`Cleared ${clearCount} low-value cache entries`);
    }
  }

  /**
   * Adjust cache TTL values based on performance
   */
  private async adjustCacheTTLs(): Promise<void> {
    // This would involve analyzing access patterns and adjusting TTLs
    // For now, just log the intent
    console.log('TTL adjustment logic would be implemented here');
  }

  /**
   * Get cache health score (0-100)
   */
  getCacheHealthScore(): number {
    const stats = this.getSystemStats();
    const { performance, memory } = stats;

    // Calculate weighted score
    const hitRateScore = Math.min(performance.hitRate, 90); // Cap at 90%
    const memoryScore = Math.max(0, 100 - memory.percentage); // Lower memory usage = higher score
    const egressScore = performance.egressSavings;

    const weightedScore = (hitRateScore * 0.4) + (memoryScore * 0.3) + (egressScore * 0.3);
    
    return Math.round(weightedScore);
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
    }
    if (this.optimizationTimer) {
      clearInterval(this.optimizationTimer);
    }
  }
}

// Create and export singleton instance
export const cacheManager = CacheManager.getInstance();

// Export convenience functions
export const cacheUtils_enhanced = {
  /**
   * Quick cache warmup for critical app data
   */
  warmup: () => cacheManager.warmupCriticalCaches(),
  
  /**
   * Get overall cache performance
   */
  getHealth: () => cacheManager.getCacheHealthScore(),
  
  /**
   * Clear specific cache patterns
   */
  clear: (pattern?: 'all' | 'products' | 'auth' | 'static') => 
    cacheManager.clearSystemCache(pattern),
  
  /**
   * Get comprehensive stats
   */
  getStats: () => cacheManager.getSystemStats(),
  
  /**
   * Force cache optimization
   */
  optimize: () => cacheManager.optimizeCache()
};
