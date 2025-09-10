// Optimized ProductService with pagination and caching
import { supabase } from './supabase';
import { Product, Tier, GameTitle, ProductTier } from '../types';

// Shape of DB row returned by the select in getProductsPaginated
type ProductDbRow = {
  id: string;
  name: string;
  description: string;
  price: number;
  original_price?: number | null;
  account_level?: string | null;
  account_details?: string | null;
  image?: string | null;
  images?: string[] | string | null;
  is_active?: boolean | null;
  archived_at?: string | null;
  created_at: string;
  updated_at?: string;
  stock?: number | null;
  game_title_id?: string | null;
  tier_id?: string | null;
  has_rental?: boolean | null;
  tiers?:
    | { id: string; name: string; slug: string; color?: string | null; background_gradient?: string | null; icon?: string | null }
    | { id: string; name: string; slug: string; color?: string | null; background_gradient?: string | null; icon?: string | null }[]
    | null;
  game_titles?:
    | { id: string; name: string; slug: string; icon?: string | null; logo_url?: string | null }
    | { id: string; name: string; slug: string; icon?: string | null; logo_url?: string | null }[]
    | null;
};

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProductFilters {
  search?: string;
  gameTitle?: string;
  tier?: string;
  status?: 'active' | 'archived' | 'all';
  includeArchived?: boolean;
}

interface PaginationOptions {
  page?: number;
  limit?: number;
}

// Cache for frequently accessed data
const cache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();

class OptimizedProductService {
  private static CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  private static getCacheKey(key: string, filters?: any): string {
    return filters ? `${key}:${JSON.stringify(filters)}` : key;
  }

  private static getFromCache<T>(key: string): T | null {
    const cached = cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    cache.delete(key);
    return null;
  }

  private static setCache<T>(key: string, data: T, ttl: number = this.CACHE_TTL): void {
    cache.set(key, { data, timestamp: Date.now(), ttl });
  }

  private static clearCachePattern(pattern: string): void {
    // Use Array.from for ES5 compatibility without downlevelIteration
    Array.from(cache.keys()).forEach((key) => {
      if (key.includes(pattern)) cache.delete(key);
    });
  }

  /**
   * Get products with database-level pagination and filtering
   */
  static async getProductsPaginated(
    filters: ProductFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<PaginatedResponse<Product>> {
    const { page = 1, limit = 20 } = pagination;
    const { search, gameTitle, tier, status = 'active' } = filters;
    
    const cacheKey = this.getCacheKey('products_paginated', { filters, pagination });
    const cached = this.getFromCache<PaginatedResponse<Product>>(cacheKey);
    if (cached) return cached;

    try {
      if (!supabase) throw new Error('Supabase not configured');

      // Build the query with proper filtering at database level
      let query = supabase
        .from('products')
        .select(`
          id, name, description, price, original_price, account_level,
          account_details, image, images, is_active, archived_at, created_at, updated_at,
          stock,
          game_title_id, tier_id, has_rental,
          tiers!inner (
            id, name, slug, color, background_gradient, icon
          ),
          game_titles!inner (
            id, name, slug, icon, logo_url
          )
        `, { count: 'exact' });

      // Apply filters at database level
      if (status === 'active') {
        query = query.eq('is_active', true).is('archived_at', null);
      } else if (status === 'archived') {
        query = query.or('is_active.eq.false,archived_at.not.is.null');
      }

      if (search && search.trim()) {
        query = query.or(`name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`);
      }

      if (gameTitle && gameTitle !== 'all') {
        query = query.eq('game_title_id', gameTitle);
      }

      if (tier && tier !== 'all') {
        query = query.eq('tier_id', tier);
      }

      // Apply pagination at database level
      const offset = (page - 1) * limit;
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      const result: PaginatedResponse<Product> = {
        data: (data || []).map((row) => OptimizedProductService.mapDatabaseProduct((row as unknown) as ProductDbRow)),
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      };

      // Cache for 2 minutes for paginated results
      this.setCache(cacheKey, result, 2 * 60 * 1000);
      return result;

    } catch (error) {
      console.error('Error fetching paginated products:', error);
      // Fallback to empty result
      return {
        data: [],
        total: 0,
        page,
        limit,
        totalPages: 0
      };
    }
  }

  /**
   * Get products count by filters (for quick stats)
   */
  static async getProductsCount(filters: ProductFilters = {}): Promise<number> {
    const cacheKey = this.getCacheKey('products_count', filters);
    const cached = this.getFromCache<number>(cacheKey);
    if (cached !== null) return cached;

    try {
      if (!supabase) return 0;

      let query = supabase
        .from('products')
        .select('id', { count: 'exact', head: true });

      const { status } = filters;
      if (status === 'active') {
        query = query.eq('is_active', true).is('archived_at', null);
      } else if (status === 'archived') {
        query = query.or('is_active.eq.false,archived_at.not.is.null');
      }

      const { count, error } = await query;
      if (error) throw error;

      const result = count || 0;
      this.setCache(cacheKey, result, 60 * 1000); // Cache for 1 minute
      return result;

    } catch (error) {
      console.error('Error getting products count:', error);
      return 0;
    }
  }

  /**
   * Get game titles for filters (cached)
   */
  static async getGameTitles(): Promise<GameTitle[]> {
    const cacheKey = 'game_titles';
    const cached = this.getFromCache<GameTitle[]>(cacheKey);
    if (cached) return cached;

    try {
      if (!supabase) return [];

      const { data, error } = await supabase
        .from('game_titles')
        .select('id, name, slug, icon, logo_url, is_active, color, is_popular, created_at, updated_at')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      type GameTitleRow = {
        id: string; name: string; slug: string; icon: string | null; color: string | null;
        logo_url: string | null; is_active: boolean; is_popular: boolean | null;
        created_at?: string; updated_at?: string;
      };
      const result: GameTitle[] = (data as GameTitleRow[] | null || []).map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug,
        icon: item.icon || '',
        color: item.color || '',
        logoUrl: item.logo_url || undefined,
        isActive: item.is_active,
        isPopular: item.is_popular ?? false,
        sortOrder: 0,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      this.setCache(cacheKey, result, 10 * 60 * 1000); // Cache for 10 minutes
      return result;

    } catch (error) {
      console.error('Error fetching game titles:', error);
      return [];
    }
  }

  /**
   * Get tiers for filters (cached)
   */
  static async getTiers(): Promise<Tier[]> {
    const cacheKey = 'tiers';
    const cached = this.getFromCache<Tier[]>(cacheKey);
    if (cached) return cached;

    try {
      if (!supabase) return [];

      const { data, error } = await supabase
        .from('tiers')
        .select('id, name, slug, description, color, background_gradient, icon, is_active, sort_order, created_at, updated_at')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;

      type TierRow = {
        id: string; name: string; slug: string; description: string | null; color: string | null;
        background_gradient: string | null; icon: string | null; is_active: boolean;
        sort_order: number; created_at: string; updated_at: string;
      };
      const result: Tier[] = ((data as TierRow[] | null) || []).map((t) => ({
        id: t.id,
        name: t.name,
        slug: t.slug,
        description: t.description || undefined,
        color: t.color || undefined,
        borderColor: undefined,
        backgroundGradient: t.background_gradient || undefined,
        icon: t.icon || undefined,
        priceRangeMin: undefined,
        priceRangeMax: undefined,
        isActive: t.is_active,
        sortOrder: t.sort_order,
        createdAt: t.created_at,
        updatedAt: t.updated_at
      }));
      this.setCache(cacheKey, result, 10 * 60 * 1000); // Cache for 10 minutes
      return result;

    } catch (error) {
      console.error('Error fetching tiers:', error);
      return [];
    }
  }

  // Minimal shape for the DB row we select above
  // Keep snake_case for raw DB fields
  private static mapDatabaseProduct(product: ProductDbRow): Product {
    const images = Array.isArray(product.images)
      ? product.images
      : product.images
        ? [product.images]
        : [];

    // Some joins may come as arrays; pick the first item if so
    const tierJoin = Array.isArray(product.tiers) ? product.tiers[0] : product.tiers || undefined;
    const gameTitleJoin = Array.isArray(product.game_titles) ? product.game_titles[0] : product.game_titles || undefined;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.original_price ?? undefined,
      image: product.image || images[0] || '',
      images,
      category: undefined,
      gameTitle: gameTitleJoin?.name || '',
      tier: (tierJoin?.slug as ProductTier) || undefined,
      tierId: product.tier_id || undefined,
      gameTitleId: product.game_title_id || undefined,
      tierData: tierJoin
        ? {
            id: tierJoin.id,
            name: tierJoin.name,
            slug: tierJoin.slug,
            color: tierJoin.color || undefined,
            backgroundGradient: tierJoin.background_gradient || undefined,
            icon: tierJoin.icon || undefined,
            description: undefined,
            borderColor: undefined,
            priceRangeMin: undefined,
            priceRangeMax: undefined,
            isActive: true,
            sortOrder: 0,
            createdAt: product.created_at,
            updatedAt: product.updated_at || product.created_at
          }
        : undefined,
      gameTitleData: gameTitleJoin
        ? {
            id: gameTitleJoin.id,
            name: gameTitleJoin.name,
            slug: gameTitleJoin.slug,
            icon: gameTitleJoin.icon || '',
            color: '',
            logoUrl: gameTitleJoin.logo_url || undefined,
            isPopular: false,
            isActive: true,
            sortOrder: 0,
            createdAt: product.created_at,
            updatedAt: product.updated_at || product.created_at
          }
        : undefined,
      accountLevel: product.account_level || undefined,
      accountDetails: product.account_details || undefined,
      isFlashSale: false,
      flashSaleEndTime: undefined,
      hasRental: product.has_rental ?? false,
      rentalOptions: [],
      stock: product.stock ?? 0,
      isActive: product.is_active ?? true,
      archivedAt: product.archived_at ?? null,
      createdAt: product.created_at,
      updatedAt: product.updated_at || product.created_at
    };
  }

  /**
   * Clear cache when products are modified
   */
  static clearProductsCache(): void {
    this.clearCachePattern('products');
  }

  /**
   * Invalidate cache
   */
  static invalidateCache(): void {
    cache.clear();
  }
}

export { OptimizedProductService };
export type { PaginatedResponse, ProductFilters, PaginationOptions };
