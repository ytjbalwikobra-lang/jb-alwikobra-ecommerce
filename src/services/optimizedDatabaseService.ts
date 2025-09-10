/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import { supabase } from './supabase';

/**
 * Optimized Database Service
 * Reduces cached egress by:
 * - Combining multiple queries into single calls
 * - Selecting only required fields
 * - Caching frequently accessed data
 * - Using materialized views for complex queries
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class OptimizedDatabaseService {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly SHORT_TTL = 60 * 1000; // 1 minute
  private readonly LONG_TTL = 30 * 60 * 1000; // 30 minutes

  /**
   * Generic cache getter with TTL
   */
  private getCached<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  /**
   * Generic cache setter
   */
  private setCache<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  /**
   * Clear specific cache entries
   */
  clearCache(pattern?: string): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    
    // Use Array.from to handle iterator properly
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * OPTIMIZED: Single query for homepage data
   * Previously: 3-4 separate queries
   * Now: 1 combined query + cached settings
   */
  async getHomepageData() {
    const cacheKey = 'homepage_data';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Single query for products with joins
      const { data: products, error } = await supabase
        .from('products')
        .select(`
          id,
          name,
          price,
          original_price,
          image,
          images,
          tier_id,
          game_title_id,
          flash_sale_end_time,
          stock,
          account_level,
          has_rental,
          tier_data:tiers(name, icon, color, border_color, background_gradient),
          game_title_data:game_titles(name, slug)
        `)
        .eq('is_active', true)
        .is('archived_at', null)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      // Get flash sales in single query
      const { data: flashSales } = await supabase
        .from('flash_sales')
        .select(`
          id,
          product_id,
          discount_price,
          end_time,
          is_active,
          product:products(id, name, price, image, tier_id, game_title_id)
        `)
        .eq('is_active', true)
        .gt('end_time', new Date().toISOString())
        .limit(10);

      const result = {
        products: products || [],
        flashSales: flashSales || [],
        timestamp: Date.now()
      };

      this.setCache(cacheKey, result, this.SHORT_TTL);
      return result;
    } catch (error) {
      console.error('Homepage data error:', error);
      return { products: [], flashSales: [], timestamp: Date.now() };
    }
  }

  /**
   * OPTIMIZED: Combined product listing with filters
   * Previously: Multiple queries for products, counts, and related data
   * Now: Single optimized query with count
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
    
    const cacheKey = `products_${JSON.stringify(params)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Build single query with filters
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
          tier_data:tiers(name, icon, color),
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

      // Apply pagination
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
   * OPTIMIZED: Product detail with all related data
   * Previously: 3-4 separate queries
   * Now: 1 main query + 1 rental options query
   */
  async getProductDetail(id: string) {
    const cacheKey = `product_detail_${id}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Single comprehensive query
      const { data: product, error } = await supabase
        .from('products')
        .select(`
          *,
          tier_data:tiers(name, icon, color, border_color, background_gradient),
          game_title_data:game_titles(name, slug, description),
          rental_options(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;

      this.setCache(cacheKey, product, this.DEFAULT_TTL);
      return product;
    } catch (error) {
      console.error('Product detail error:', error);
      return null;
    }
  }

  /**
   * OPTIMIZED: Admin dashboard data using materialized view
   * Previously: 5-8 separate queries
   * Now: 1 RPC call to materialized view + minimal additional queries
   */
  async getAdminDashboard(period = 'weekly') {
    const cacheKey = `admin_dashboard_${period}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      // Use materialized view RPC function
      const { data: dashboardData, error: dashboardError } = await supabase
        .rpc('get_dashboard_data');

      if (dashboardError) {
        console.warn('Dashboard RPC failed, falling back to individual queries');
        return this.getAdminDashboardFallback(period);
      }

      // Get additional period-specific data
      const days = period === 'monthly' ? 30 : period === 'yearly' ? 365 : 7;
      const { data: dailyData } = await supabase
        .rpc('get_daily_revenue', { days_back: days });

      const result = {
        ...dashboardData,
        dailyRevenue: dailyData || [],
        period
      };

      this.setCache(cacheKey, result, this.SHORT_TTL);
      return result;
    } catch (error) {
      console.error('Admin dashboard error:', error);
      return this.getAdminDashboardFallback(period);
    }
  }

  /**
   * Fallback dashboard data with optimized queries
   */
  private async getAdminDashboardFallback(period: string) {
    try {
      const endDate = new Date();
      const days = period === 'monthly' ? 30 : period === 'yearly' ? 365 : 7;
      const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

      // Single query for orders with required fields only
      const { data: orders } = await supabase
        .from('orders')
        .select('amount, status, created_at')
        .gte('created_at', startDate.toISOString());

      // Count queries (head: true for minimal data transfer)
      const [
        { count: totalProducts },
        { count: totalUsers },
        { count: totalFlashSales }
      ] = await Promise.all([
        supabase.from('products').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('flash_sales').select('id', { count: 'exact', head: true }).eq('is_active', true)
      ]);

      return {
        analytics: {
          total_orders: orders?.length || 0,
          paid_orders: orders?.filter(o => o.status === 'PAID').length || 0,
          pending_orders: orders?.filter(o => o.status === 'pending').length || 0,
          cancelled_orders: orders?.filter(o => o.status === 'cancelled').length || 0,
          revenue_total: orders?.filter(o => o.status === 'PAID').reduce((sum, o) => sum + (Number(o.amount) || 0), 0) || 0
        },
        products: totalProducts || 0,
        users: totalUsers || 0,
        flashSales: totalFlashSales || 0,
        period
      };
    } catch (error) {
      console.error('Dashboard fallback error:', error);
      return {
        analytics: { total_orders: 0, paid_orders: 0, pending_orders: 0, cancelled_orders: 0, revenue_total: 0 },
        products: 0,
        users: 0,
        flashSales: 0,
        period
      };
    }
  }

  /**
   * OPTIMIZED: Orders listing with minimal data transfer
   */
  async getOrdersList(params: {
    page?: number;
    limit?: number;
    status?: string;
    orderType?: string;
    search?: string;
  }) {
    const { page = 1, limit = 20, status, orderType, search } = params;
    const offset = (page - 1) * limit;

    try {
      // Optimized query with only required fields
      let query = supabase
        .from('orders')
        .select(`
          id,
          customer_name,
          customer_email,
          customer_phone,
          order_type,
          amount,
          status,
          payment_method,
          rental_duration,
          created_at,
          products(name)
        `, { count: 'exact' });

      // Apply filters
      if (status && status !== 'all') {
        query = query.eq('status', status);
      }
      if (orderType && orderType !== 'all') {
        query = query.eq('order_type', orderType);
      }
      if (search) {
        query = query.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%`);
      }

      const { data: orders, error, count } = await query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        orders: orders || [],
        pagination: {
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Orders list error:', error);
      return { orders: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }
  }

  /**
   * OPTIMIZED: Website settings with long cache
   */
  async getWebsiteSettings() {
    const cacheKey = 'website_settings';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const { data, error } = await supabase
        .from('website_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      const settings = data || {
        id: 'default',
        site_name: 'JB Alwikobra',
        hero_title: 'Jual Beli & Rental Akun Game',
        hero_subtitle: 'Aman, cepat, terpercaya'
      };

      this.setCache(cacheKey, settings, this.LONG_TTL);
      return settings;
    } catch (error) {
      console.error('Settings error:', error);
      return {
        id: 'default',
        site_name: 'JB Alwikobra',
        hero_title: 'Jual Beli & Rental Akun Game',
        hero_subtitle: 'Aman, cepat, terpercaya'
      };
    }
  }

  /**
   * OPTIMIZED: Get game titles and tiers in single call
   */
  async getGameTitlesAndTiers() {
    const cacheKey = 'game_titles_tiers';
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const [
        { data: gameTitles },
        { data: tiers }
      ] = await Promise.all([
        supabase.from('game_titles').select('id, name, slug').order('name'),
        supabase.from('tiers').select('id, name, icon, color').order('name')
      ]);

      const result = {
        gameTitles: gameTitles || [],
        tiers: tiers || []
      };

      this.setCache(cacheKey, result, this.LONG_TTL);
      return result;
    } catch (error) {
      console.error('Game titles and tiers error:', error);
      return { gameTitles: [], tiers: [] };
    }
  }

  /**
   * OPTIMIZED: Feed posts with minimal data
   */
  async getFeedPosts(params: {
    page?: number;
    limit?: number;
    type?: string;
  }) {
    const { page = 1, limit = 10, type = 'all' } = params;
    const offset = (page - 1) * limit;

    try {
      let query = supabase
        .from('feed_posts')
        .select(`
          id,
          title,
          content,
          image_url,
          type,
          is_pinned,
          likes_count,
          comments_count,
          created_at,
          user:users(name)
        `, { count: 'exact' })
        .eq('is_deleted', false);

      if (type !== 'all') {
        query = query.eq('type', type);
      }

      const { data: posts, error, count } = await query
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        posts: posts || [],
        pagination: {
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit)
        }
      };
    } catch (error) {
      console.error('Feed posts error:', error);
      return { posts: [], pagination: { total: 0, page, limit, totalPages: 0 } };
    }
  }

  /**
   * Invalidate cache when data changes
   */
  invalidateProductCache(): void {
    this.clearCache('product');
    this.clearCache('homepage');
  }

  invalidateOrderCache(): void {
    this.clearCache('order');
    this.clearCache('admin_dashboard');
  }

  invalidateUserCache(): void {
    this.clearCache('user');
    this.clearCache('admin_dashboard');
  }
}

// Export singleton instance
export const optimizedDB = new OptimizedDatabaseService();
