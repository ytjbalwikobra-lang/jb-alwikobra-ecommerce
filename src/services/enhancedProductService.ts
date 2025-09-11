/**
 * Enhanced ProductService with World-Class Caching Integration
 * Wraps the existing ProductService with advanced caching, request deduplication, and intelligent prefetching
 */

import { ProductService as BaseProductService } from './productService';
import { globalCache } from './globalCacheManager';
import { Product, FlashSale, Tier, GameTitle } from '../types/index';

export interface ProductCacheConfig {
  /** TTL for product data (default: 5 minutes) */
  productTTL?: number;
  /** TTL for static data like tiers/game titles (default: 30 minutes) */
  staticDataTTL?: number;
  /** TTL for flash sales (default: 1 minute) */
  flashSalesTTL?: number;
  /** Enable intelligent prefetching */
  enablePrefetching?: boolean;
}

/**
 * Enhanced ProductService with advanced caching capabilities
 */
export class EnhancedProductService {
  private static instance: EnhancedProductService;
  private baseService: typeof BaseProductService;
  private config: Required<ProductCacheConfig>;
  
  // Cache tags for intelligent invalidation
  private static readonly CACHE_TAGS = {
    PRODUCTS: 'products',
    FLASH_SALES: 'flash-sales',
    TIERS: 'tiers',
    GAME_TITLES: 'game-titles',
    POPULAR_GAMES: 'popular-games',
    CAPABILITIES: 'capabilities'
  } as const;

  private constructor(config: ProductCacheConfig = {}) {
    this.baseService = BaseProductService;
    this.config = {
      productTTL: config.productTTL ?? 5 * 60 * 1000, // 5 minutes
      staticDataTTL: config.staticDataTTL ?? 30 * 60 * 1000, // 30 minutes
      flashSalesTTL: config.flashSalesTTL ?? 60 * 1000, // 1 minute
      enablePrefetching: config.enablePrefetching ?? true
    };
  }

  static getInstance(config?: ProductCacheConfig): EnhancedProductService {
    if (!this.instance) {
      this.instance = new EnhancedProductService(config);
    }
    return this.instance;
  }

  /**
   * Get all products with intelligent caching and prefetching
   */
  async getAllProducts(): Promise<Product[]> {
    const cacheKey = 'products:all';
    
    return globalCache.getOrSet(
      cacheKey,
      () => this.baseService.getAllProducts(),
      {
        ttl: this.config.productTTL,
        tags: [EnhancedProductService.CACHE_TAGS.PRODUCTS],
        prefetch: this.config.enablePrefetching
      }
    );
  }

  /**
   * Get flash sales with high-frequency caching
   */
  async getFlashSales(): Promise<FlashSale[]> {
    const cacheKey = 'flash-sales:active';
    
    return globalCache.getOrSet(
      cacheKey,
      () => this.baseService.getFlashSales(),
      {
        ttl: this.config.flashSalesTTL,
        tags: [EnhancedProductService.CACHE_TAGS.FLASH_SALES]
      }
    );
  }

  /**
   * Get tiers with long-term caching (static data)
   */
  async getTiers(): Promise<Tier[]> {
    const cacheKey = 'tiers:all';
    
    return globalCache.getOrSet(
      cacheKey,
      () => this.baseService.getTiers(),
      {
        ttl: this.config.staticDataTTL,
        tags: [EnhancedProductService.CACHE_TAGS.TIERS]
      }
    );
  }

  /**
   * Get game titles with long-term caching
   */
  async getGameTitles(): Promise<GameTitle[]> {
    const cacheKey = 'game-titles:all';
    
    return globalCache.getOrSet(
      cacheKey,
      () => this.baseService.getGameTitles(),
      {
        ttl: this.config.staticDataTTL,
        tags: [EnhancedProductService.CACHE_TAGS.GAME_TITLES]
      }
    );
  }

  /**
   * Get popular games with intelligent prefetching
   */
  async getPopularGames(limit = 10): Promise<any[]> {
    const cacheKey = `popular-games:${limit}`;
    
    return globalCache.getOrSet(
      cacheKey,
      () => this.baseService.getPopularGames(limit),
      {
        ttl: this.config.productTTL,
        tags: [EnhancedProductService.CACHE_TAGS.POPULAR_GAMES]
      }
    );
  }

  /**
   * Create product with cache invalidation
   */
  async createProduct(product: Omit<Product, "id" | "createdAt" | "updatedAt"> & Record<string, any>): Promise<Product> {
    const result = await this.baseService.createProduct(product);
    
    // Invalidate related caches
    await this.invalidateProductCaches();
    
    return result;
  }

  /**
   * Update product with cache invalidation
   */
  async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const result = await this.baseService.updateProduct(id, updates);
    
    // Invalidate related caches
    await this.invalidateProductCaches();
    await globalCache.invalidateByTags([EnhancedProductService.CACHE_TAGS.PRODUCTS]);
    
    return result;
  }

  /**
   * Create flash sale with cache invalidation
   */
  async createFlashSale(sale: {
    product_id: string;
    sale_price: number;
    original_price?: number;
    start_time?: string;
    end_time: string;
    stock?: number;
    is_active?: boolean;
  }): Promise<FlashSale> {
    const result = await this.baseService.createFlashSale(sale);
    
    // Invalidate flash sales cache
    await globalCache.invalidateByTags([EnhancedProductService.CACHE_TAGS.FLASH_SALES]);
    
    return result;
  }

  /**
   * Update flash sale with cache invalidation
   */
  async updateFlashSale(id: string, updates: Partial<FlashSale>): Promise<FlashSale> {
    const result = await this.baseService.updateFlashSale(id, updates);
    
    // Invalidate flash sales cache
    await globalCache.invalidateByTags([EnhancedProductService.CACHE_TAGS.FLASH_SALES]);
    
    return result;
  }

  /**
   * Delete flash sale with cache invalidation
   */
  async deleteFlashSale(id: string): Promise<void> {
    await this.baseService.deleteFlashSale(id);
    
    // Invalidate flash sales cache
    await globalCache.invalidateByTags([EnhancedProductService.CACHE_TAGS.FLASH_SALES]);
  }

  /**
   * Schema capabilities detection with caching
   */
  async detectSchemaCapabilities(): Promise<{
    hasRelationalSchema: boolean;
    hasRentalOptions: boolean;
    hasFlashSales: boolean;
  }> {
    const cacheKey = 'schema:capabilities';
    
    return globalCache.getOrSet(
      cacheKey,
      () => this.baseService.detectSchemaCapabilities(),
      {
        ttl: this.config.staticDataTTL,
        tags: [EnhancedProductService.CACHE_TAGS.CAPABILITIES]
      }
    );
  }

  /**
   * Prefetch commonly accessed related data
   */
  private async prefetchRelatedData(): Promise<void> {
    if (!this.config.enablePrefetching) return;

    // Prefetch in background without blocking
    Promise.all([
      this.getTiers().catch((e) => { if (process.env.NODE_ENV === 'development') console.debug('prefetch tiers failed', e); return []; }),
      this.getGameTitles().catch((e) => { if (process.env.NODE_ENV === 'development') console.debug('prefetch game titles failed', e); return []; }),
      this.getFlashSales().catch((e) => { if (process.env.NODE_ENV === 'development') console.debug('prefetch flash sales failed', e); return []; }),
      this.getPopularGames(10).catch((e) => { if (process.env.NODE_ENV === 'development') console.debug('prefetch popular games failed', e); return []; })
    ]).catch((e) => {
      // Silently handle prefetch errors
      if (process.env.NODE_ENV === 'development') console.debug('prefetch group failed', e);
      return [] as any;
    });
  }

  /**
   * Invalidate all product-related caches
   */
  private async invalidateProductCaches(): Promise<void> {
    await Promise.all([
      globalCache.invalidateByTags([EnhancedProductService.CACHE_TAGS.PRODUCTS]),
      globalCache.invalidateByTags([EnhancedProductService.CACHE_TAGS.POPULAR_GAMES])
    ]);
  }

  /**
   * Warm up critical caches
   */
  async warmupCache(): Promise<void> {
    try {
      await Promise.all([
        this.getTiers(),
        this.getGameTitles(),
        this.getFlashSales(),
        this.getPopularGames(10),
        this.getAllProducts()
      ]);
    } catch (error) {
      console.warn('Cache warmup partially failed:', error);
    }
  }

  /**
   * Get cache statistics for monitoring
   */
  getCacheStats(): {
    hitRate: number;
    entries: number;
    tags: string[];
  } {
    const stats = globalCache.getStats();
    return {
      hitRate: stats.hitRate,
      entries: stats.entries,
  tags: Object.values(EnhancedProductService.CACHE_TAGS)
    };
  }

  /**
   * Clear all product-related caches
   */
  async clearCache(): Promise<void> {
    await Promise.all(
      Object.values(EnhancedProductService.CACHE_TAGS).map(tag =>
        globalCache.invalidateByTags([tag])
      )
    );
  }

  /**
   * Reset capability detection and clear related cache
   */
  static async resetCapabilities(): Promise<void> {
    BaseProductService.resetCapabilities();
    await globalCache.invalidateByTags([EnhancedProductService.CACHE_TAGS.CAPABILITIES]);
  }
}

// Create and export singleton instance
export const enhancedProductService = EnhancedProductService.getInstance();

// Re-export the base service for compatibility
export { ProductService } from './productService';
