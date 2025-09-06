// Ultra-optimized ProductService with minimal data fetching
import { supabase } from './supabase.ts';
import { Product, Tier, GameTitle } from '../types/index.ts';
import { clientCache } from './clientCacheService.ts';

interface ProductFilters {
  search?: string;
  gameTitle?: string;
  tier?: string;
  status?: 'active' | 'archived' | 'all';
}

interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class UltraOptimizedProductService {
  // Cache TTL constants
  private static readonly PRODUCTS_TTL = 2 * 60 * 1000; // 2 minutes
  private static readonly METADATA_TTL = 10 * 60 * 1000; // 10 minutes for tiers/games
  private static readonly COUNT_TTL = 30 * 1000; // 30 seconds for counts

  // Get products with minimal fields and pagination
  static async getProducts(
    page: number = 1,
    limit: number = 20,
    filters: ProductFilters = {}
  ): Promise<PaginatedResponse<Product>> {
    const cacheKey = `products:${page}:${limit}:${JSON.stringify(filters)}`;
    
    return clientCache.get(
      cacheKey,
      async () => {
        if (!supabase) throw new Error('Supabase not available');

        // Build query with only essential fields
        let query = supabase
          .from('products')
          .select(`
            id, name, price, original_price, account_level, images,
            is_active, archived_at, created_at, game_title_id, tier_id,
            tiers!inner(id, name, color),
            game_titles!inner(id, name, icon)
          `, { count: 'exact' });

        // Apply filters
        if (filters.status === 'active') {
          query = query.eq('is_active', true).is('archived_at', null);
        } else if (filters.status === 'archived') {
          query = query.or('is_active.eq.false,archived_at.not.is.null');
        }

        if (filters.search?.trim()) {
          query = query.or(`name.ilike.%${filters.search.trim()}%,description.ilike.%${filters.search.trim()}%`);
        }

        if (filters.gameTitle && filters.gameTitle !== 'all') {
          query = query.eq('game_title_id', filters.gameTitle);
        }

        if (filters.tier && filters.tier !== 'all') {
          query = query.eq('tier_id', filters.tier);
        }

        // Apply pagination
        const offset = (page - 1) * limit;
        query = query
          .order('created_at', { ascending: false })
          .range(offset, offset + limit - 1);

        const { data: productData, error, count } = await query;

        if (error) throw error;

        // Map to Product interface with minimal processing
        const products: Product[] = (productData || []).map(product => ({
          id: product.id,
          name: product.name,
          description: '', // Don't fetch description unless needed
          price: product.price,
          originalPrice: product.original_price,
          image: product.images?.[0] || '',
          images: product.images || [],
          category: '', // Legacy field
          gameTitle: product.game_titles?.name || '',
          tier: 'reguler', // Default
          tierId: product.tier_id,
          gameTitleId: product.game_title_id,
          tierData: product.tiers,
          gameTitleData: product.game_titles,
          accountLevel: product.account_level || '',
          isFlashSale: false,
          hasRental: false,
          stock: 1,
          isActive: product.is_active !== false,
          archivedAt: product.archived_at,
          createdAt: product.created_at,
          updatedAt: product.created_at,
        }));

        return {
          data: products,
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
        };
      },
      this.PRODUCTS_TTL
    );
  }

  // Get product count only (for dashboard)
  static async getProductCount(): Promise<number> {
    return clientCache.get(
      'products:count',
      async () => {
        if (!supabase) return 0;
        
        const { count, error } = await supabase
          .from('products')
          .select('id', { count: 'exact', head: true })
          .eq('is_active', true)
          .is('archived_at', null);

        if (error) {
          console.warn('Product count error:', error);
          return 0;
        }
        
        return count || 0;
      },
      this.COUNT_TTL
    );
  }

  // Get tiers with minimal fields
  static async getTiers(): Promise<Tier[]> {
    return clientCache.get(
      'tiers:list',
      async () => {
        if (!supabase) return [];
        
        const { data, error } = await supabase
          .from('tiers')
          .select('id, name, slug, color, background_gradient')
          .order('name');

        if (error) {
          console.warn('Tiers fetch error:', error);
          return [];
        }

        return data || [];
      },
      this.METADATA_TTL
    );
  }

  // Get game titles with minimal fields
  static async getGameTitles(): Promise<GameTitle[]> {
    return clientCache.get(
      'games:list',
      async () => {
        if (!supabase) return [];
        
        const { data, error } = await supabase
          .from('game_titles')
          .select('id, name, slug, icon')
          .eq('is_active', true)
          .order('name');

        if (error) {
          console.warn('Game titles fetch error:', error);
          return [];
        }

        return data || [];
      },
      this.METADATA_TTL
    );
  }

  // Get single product with full details (only when needed)
  static async getProductById(id: string): Promise<Product | null> {
    return clientCache.get(
      `product:${id}`,
      async () => {
        if (!supabase) return null;
        
        const { data, error } = await supabase
          .from('products')
          .select(`
            id, name, description, price, original_price, account_level, 
            account_details, images, is_active, archived_at, created_at,
            game_title_id, tier_id,
            tiers(id, name, slug, color, background_gradient),
            game_titles(id, name, slug, icon)
          `)
          .eq('id', id)
          .single();

        if (error) {
          console.warn('Product fetch error:', error);
          return null;
        }

        // Map to full Product interface
        return {
          id: data.id,
          name: data.name,
          description: data.description || '',
          price: data.price,
          originalPrice: data.original_price,
          image: data.images?.[0] || '',
          images: data.images || [],
          category: '',
          gameTitle: data.game_titles?.name || '',
          tier: 'reguler',
          tierId: data.tier_id,
          gameTitleId: data.game_title_id,
          tierData: data.tiers,
          gameTitleData: data.game_titles,
          accountLevel: data.account_level || '',
          accountDetails: data.account_details || '',
          isFlashSale: false,
          hasRental: false,
          stock: 1,
          isActive: data.is_active !== false,
          archivedAt: data.archived_at,
          createdAt: data.created_at,
          updatedAt: data.created_at,
        };
      },
      this.PRODUCTS_TTL
    );
  }

  // Clear cache on product changes
  static clearProductCache(): void {
    clientCache.invalidatePattern('products:');
    clientCache.invalidatePattern('product:');
  }

  // Clear metadata cache
  static clearMetadataCache(): void {
    clientCache.invalidate('tiers:list');
    clientCache.invalidate('games:list');
  }
}
