/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import { supabase } from './supabase';
import { Product } from '../types/index';

/**
 * OPTIMIZED PRODUCT SERVICE
 * Reduces database calls by:
 * - Using single queries with JOINs instead of multiple calls
 * - Implementing caching for frequently accessed data
 * - Selecting only required fields
 * - Batch operations where possible
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class OptimizedProductService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes
  private readonly SHORT_TTL = 2 * 60 * 1000; // 2 minutes
  private readonly LONG_TTL = 30 * 60 * 1000; // 30 minutes

  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  private setCache<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * OPTIMIZED: Get all products with single JOIN query
   * Previously: Multiple separate queries for products, tiers, game_titles, rental_options
   * Now: Single comprehensive query
   */
  async getAllProducts(filters?: {
    gameTitleId?: string;
    tierId?: string;
    isActive?: boolean;
    hasRental?: boolean;
    sortBy?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const filterKey = JSON.stringify(filters || {});
    const cacheKey = `products_all_${filterKey}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Single comprehensive query with all relationships
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          description,
          price,
          original_price,
          image,
          images,
          tier_id,
          game_title_id,
          stock,
          account_level,
          has_rental,
          flash_sale_end_time,
          is_active,
          created_at,
          tier_data:tiers(
            id,
            name,
            slug,
            color,
            icon,
            border_color,
            background_gradient
          ),
          game_title_data:game_titles(
            id,
            name,
            slug,
            icon,
            color
          ),
          rental_options(
            id,
            duration_hours,
            price_per_hour,
            is_available
          )
        `)
        .is('archived_at', null);

      // Apply filters
      if (filters?.isActive !== undefined) {
        query = query.eq('is_active', filters.isActive);
      }
      if (filters?.gameTitleId && filters.gameTitleId !== 'all') {
        query = query.eq('game_title_id', filters.gameTitleId);
      }
      if (filters?.tierId && filters.tierId !== 'all') {
        query = query.eq('tier_id', filters.tierId);
      }
      if (filters?.hasRental !== undefined) {
        query = query.eq('has_rental', filters.hasRental);
      }
      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      // Apply sorting
      switch (filters?.sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'name':
          query = query.order('name', { ascending: true });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      // Apply pagination
      if (filters?.limit) {
        const offset = filters.offset || 0;
        query = query.range(offset, offset + filters.limit - 1);
      }

      const { data: products, error } = await query;

      if (error) throw error;

      this.setCache(cacheKey, products || [], this.SHORT_TTL);
      return products || [];
    } catch (error) {
      console.error('Get all products error:', error);
      return [];
    }
  }

  /**
   * OPTIMIZED: Get products with pagination and count in single call
   */
  async getProductsPage(params: {
    page?: number;
    limit?: number;
    gameTitle?: string;
    tier?: string;
    sortBy?: string;
    searchTerm?: string;
  }) {
    const { page = 1, limit = 20, gameTitle, tier, sortBy, searchTerm } = params;
    const offset = (page - 1) * limit;
    
    const cacheKey = `products_page_${JSON.stringify(params)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Single query with count and data
      let query = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          original_price,
          image,
          tier_id,
          game_title_id,
          stock,
          account_level,
          has_rental,
          flash_sale_end_time,
          tier_data:tiers(name, icon, color, border_color, background_gradient),
          game_title_data:game_titles(name, slug)
        `, { count: 'exact' })
        .eq('is_active', true)
        .is('archived_at', null);

      // Apply filters
      if (gameTitle && gameTitle !== 'all') {
        query = query.eq('game_title_id', gameTitle);
      }
      if (tier && tier !== 'all') {
        query = query.eq('tier_id', tier);
      }
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      // Apply sorting
      switch (sortBy) {
        case 'price_low':
          query = query.order('price', { ascending: true });
          break;
        case 'price_high':
          query = query.order('price', { ascending: false });
          break;
        case 'newest':
          query = query.order('created_at', { ascending: false });
          break;
        default:
          query = query.order('created_at', { ascending: false });
      }

      const { data: products, error, count } = await query
        .range(offset, offset + limit - 1);

      if (error) throw error;

      const result = {
        products: products || [],
        pagination: {
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };

      this.setCache(cacheKey, result, this.SHORT_TTL);
      return result;
    } catch (error) {
      console.error('Products page error:', error);
      return { products: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }
  }

  /**
   * OPTIMIZED: Get single product with all relationships
   * Previously: 3-4 separate queries
   * Now: 1 comprehensive query
   */
  async getProduct(id: string) {
    const cacheKey = `product_${id}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          tier_data:tiers(
            id,
            name,
            slug,
            description,
            color,
            icon,
            border_color,
            background_gradient,
            price_range_min,
            price_range_max
          ),
          game_title_data:game_titles(
            id,
            name,
            slug,
            description,
            icon,
            color,
            is_popular
          ),
          rental_options(
            id,
            duration_hours,
            price_per_hour,
            discount_percentage,
            is_available,
            description
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      this.setCache(cacheKey, product, this.DEFAULT_TTL);
      return product;
    } catch (error) {
      console.error('Get product error:', error);
      return null;
    }
  }

  /**
   * OPTIMIZED: Get featured products with flash sales
   */
  async getFeaturedProducts(limit = 12) {
    const cacheKey = `featured_products_${limit}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Get products with active flash sales or featured status
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          original_price,
          image,
          tier_id,
          game_title_id,
          flash_sale_end_time,
          has_rental,
          tier_data:tiers(name, icon, color),
          game_title_data:game_titles(name, slug)
        `)
        .eq('is_active', true)
        .is('archived_at', null)
        .or('flash_sale_end_time.gt.now(),is_featured.eq.true')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      this.setCache(cacheKey, products || [], this.SHORT_TTL);
      return products || [];
    } catch (error) {
      console.error('Featured products error:', error);
      return [];
    }
  }

  /**
   * OPTIMIZED: Get game titles and tiers in single call
   */
  async getGameTitlesAndTiers() {
    const cacheKey = 'game_titles_and_tiers';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const [gameTitlesResult, tiersResult] = await Promise.all([
        supabase
          .from('game_titles')
          .select('id, name, slug, icon, color, is_popular')
          .eq('is_active', true)
          .order('sort_order', { ascending: true }),
        
        supabase
          .from('tiers')
          .select('id, name, slug, color, icon, border_color, background_gradient')
          .eq('is_active', true)
          .order('sort_order', { ascending: true })
      ]);

      const result = {
        gameTitles: gameTitlesResult.data || [],
        tiers: tiersResult.data || []
      };

      this.setCache(cacheKey, result, this.LONG_TTL);
      return result;
    } catch (error) {
      console.error('Game titles and tiers error:', error);
      return { gameTitles: [], tiers: [] };
    }
  }

  /**
   * OPTIMIZED: Search products with minimal data transfer
   */
  async searchProducts(query: string, filters?: {
    gameTitle?: string;
    tier?: string;
    limit?: number;
  }) {
    const searchKey = `search_${query}_${JSON.stringify(filters || {})}`;
    const cached = this.getCached(searchKey);
    if (cached) return cached;

    try {
      let dbQuery = supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          original_price,
          image,
          tier_id,
          game_title_id,
          tier_data:tiers(name, color),
          game_title_data:game_titles(name, slug)
        `)
        .eq('is_active', true)
        .is('archived_at', null)
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`);

      if (filters?.gameTitle && filters.gameTitle !== 'all') {
        dbQuery = dbQuery.eq('game_title_id', filters.gameTitle);
      }
      if (filters?.tier && filters.tier !== 'all') {
        dbQuery = dbQuery.eq('tier_id', filters.tier);
      }

      const { data: products, error } = await dbQuery
        .order('created_at', { ascending: false })
        .limit(filters?.limit || 20);

      if (error) throw error;

      this.setCache(searchKey, products || [], this.SHORT_TTL);
      return products || [];
    } catch (error) {
      console.error('Search products error:', error);
      return [];
    }
  }

  /**
   * OPTIMIZED: Create product with batch operations
   */
  async createProduct(productData: Partial<Product>, rentalOptions?: any[]) {
    try {
      // Clear relevant cache
      this.clearCache('products');
      this.clearCache('featured');

      const { data: product, error } = await supabase
        .from('products')
        .insert([productData])
        .select()
        .single();

      if (error) throw error;

      // Add rental options if provided
      if (rentalOptions && rentalOptions.length > 0) {
        const optionsWithProductId = rentalOptions.map(option => ({
          ...option,
          product_id: product.id
        }));

        await supabase
          .from('rental_options')
          .insert(optionsWithProductId);
      }

      return product;
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  }

  /**
   * OPTIMIZED: Update product with batch operations
   */
  async updateProduct(id: string, updates: Partial<Product>, rentalOptions?: any[]) {
    try {
      // Clear relevant cache
      this.clearCache('products');
      this.clearCache('featured');
      this.clearCache(`product_${id}`);

      const { data: product, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      // Update rental options if provided
      if (rentalOptions !== undefined) {
        // Delete existing options
        await supabase
          .from('rental_options')
          .delete()
          .eq('product_id', id);

        // Insert new options
        if (rentalOptions.length > 0) {
          const optionsWithProductId = rentalOptions.map(option => ({
            ...option,
            product_id: id
          }));

          await supabase
            .from('rental_options')
            .insert(optionsWithProductId);
        }
      }

      return product;
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  }

  /**
   * OPTIMIZED: Delete product with cleanup
   */
  async deleteProduct(id: string) {
    try {
      // Clear cache
      this.clearCache('products');
      this.clearCache('featured');
      this.clearCache(`product_${id}`);

      // Soft delete (set archived_at)
      const { error } = await supabase
        .from('products')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  }

  /**
   * Get products by IDs in batch
   */
  async getProductsByIds(ids: string[]) {
    if (ids.length === 0) return [];

    try {
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          original_price,
          image,
          tier_data:tiers(name, color),
          game_title_data:game_titles(name, slug)
        `)
        .in('id', ids)
        .eq('is_active', true);

      if (error) throw error;
      return products || [];
    } catch (error) {
      console.error('Get products by IDs error:', error);
      return [];
    }
  }

  /**
   * Get product statistics
   */
  async getProductStats() {
    const cacheKey = 'product_stats';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const [
        { count: totalProducts },
        { count: activeProducts },
        { count: rentalProducts },
        { count: flashSaleProducts }
      ] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('has_rental', true),
        supabase.from('products').select('id', { count: 'exact', head: true }).gt('flash_sale_end_time', new Date().toISOString())
      ]);

      const stats = {
        total: totalProducts || 0,
        active: activeProducts || 0,
        rental: rentalProducts || 0,
        flashSale: flashSaleProducts || 0
      };

      this.setCache(cacheKey, stats, this.DEFAULT_TTL);
      return stats;
    } catch (error) {
      console.error('Product stats error:', error);
      return { total: 0, active: 0, rental: 0, flashSale: 0 };
    }
  }
}

// Export singleton instance
export const optimizedProductService = new OptimizedProductService();

// Export for backward compatibility
export default optimizedProductService;
