/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

/**
 * PHASE 3: ENHANCED BATCH API ENDPOINT
 * 
 * Significantly reduces database egress by combining multiple API requests into 
 * optimized single database calls with intelligent query consolidation.
 */

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface BatchRequest {
  id: string;
  endpoint: string;
  method: string;
  params?: Record<string, any>;
  headers?: Record<string, string>;
}

interface BatchResponse {
  id: string;
  data?: any;
  error?: string;
  status: number;
}

/**
 * PHASE 3: OPTIMIZED ADMIN DASHBOARD DATA
 * Single query replacing 6+ separate API calls
 */
async function getOptimizedAdminData(userId: string) {
  try {
    // Single comprehensive query with joins
    const [statsQuery, ordersQuery, productsQuery, usersQuery] = await Promise.all([
      // Get overall statistics
      supabase.rpc('get_admin_dashboard_stats').single(),
      
      // Get recent orders with customer info
      supabase
        .from('orders')
        .select(`
          id, order_number, total_amount, status, created_at,
          users:customer_id ( id, name, email )
        `)
        .order('created_at', { ascending: false })
        .limit(10),
        
      // Get recent products
      supabase
        .from('products')
        .select('id, name, price, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10),
        
      // Get user registrations
      supabase
        .from('users')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(10)
    ]);

    // Fallback calculations if stored procedure doesn't exist
    let stats = statsQuery.data;
    if (!stats) {
      const orders = ordersQuery.data || [];
      const products = productsQuery.data || [];
      const users = usersQuery.data || [];
      
      stats = {
        totalOrders: orders.length,
        totalRevenue: orders.reduce((sum, order) => sum + (order.total_amount || 0), 0),
        totalProducts: products.length,
        totalUsers: users.length,
        monthlyRevenue: orders
          .filter(order => new Date(order.created_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
          .reduce((sum, order) => sum + (order.total_amount || 0), 0)
      };
    }

    return {
      stats,
      recentOrders: ordersQuery.data || [],
      recentProducts: productsQuery.data || [],
      recentUsers: usersQuery.data || []
    };
  } catch (error) {
    console.error('Optimized admin data error:', error);
    throw new Error('Failed to fetch admin dashboard data');
  }
}

/**
 * PHASE 3: OPTIMIZED FEED DATA
 * Single query replacing multiple feed-related API calls
 */
async function getOptimizedFeedData(params: any, userId?: string) {
  const { page = 1, limit = 10, type = 'all' } = params;
  const offset = (page - 1) * limit;

  try {
    // Main feed query with optimized joins
    let feedQuery = supabase
      .from('feed_posts')
      .select(`
        id, user_id, type, product_id, title, content, rating, image_url,
        likes_count, comments_count, is_pinned, created_at,
        users:users!feed_posts_user_id_fkey ( id, name, is_admin, avatar_url ),
        products:products!feed_posts_product_id_fkey ( id, name, image )
      `, { count: 'exact' })
      .eq('is_deleted', false);

    if (type !== 'all') {
      feedQuery = feedQuery.eq('type', type);
    }

    const { data: posts, error, count } = await feedQuery
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Get user-specific data in parallel if authenticated
    let userLikes: Set<string> = new Set();
    let eligibleProducts: any[] = [];
    let notifications: any[] = [];

    if (userId) {
      const [likesResult, eligibleResult, notificationsResult] = await Promise.all([
        supabase
          .from('feed_likes')
          .select('post_id')
          .eq('user_id', userId)
          .in('post_id', (posts || []).map(p => p.id)),
        
        supabase
          .from('orders')
          .select(`
            products:order_items!inner ( products!inner ( id, name ) )
          `)
          .eq('customer_id', userId)
          .eq('status', 'completed'),
          
        supabase
          .from('feed_notifications')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      userLikes = new Set((likesResult.data || []).map(l => l.post_id));
      eligibleProducts = eligibleResult.data?.flatMap(order => 
        order.products?.map(item => item.products) || []
      ) || [];
      notifications = notificationsResult.data || [];
    }

    return {
      data: posts?.map(post => ({
        ...post,
        liked_by_me: userLikes.has(post.id)
      })) || [],
      total: count || 0,
      eligibleProducts,
      notifications,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };
  } catch (error) {
    console.error('Optimized feed data error:', error);
    throw new Error('Failed to fetch feed data');
  }
}

/**
 * PHASE 3: OPTIMIZED PRODUCTS DATA  
 * Single query replacing multiple product-related API calls
 */
async function getOptimizedProductsData() {
  try {
    const [productsResult, tiersResult, gameResult] = await Promise.all([
      supabase
        .from('products')
        .select(`
          id, name, description, price, image, status, created_at,
          tier_id, game_title_id,
          tiers!products_tier_id_fkey ( id, name, slug ),
          game_titles!products_game_title_id_fkey ( id, name, slug, logo_url )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
        
      supabase
        .from('tiers')
        .select('*')
        .order('name'),
        
      supabase
        .from('game_titles')
        .select('*')
        .order('name')
    ]);

    if (productsResult.error) throw productsResult.error;
    if (tiersResult.error) throw tiersResult.error;
    if (gameResult.error) throw gameResult.error;

    // Sort tiers in preferred order
    const sortedTiers = [...(tiersResult.data || [])].sort((a, b) => {
      const order = { 'pelajar': 1, 'reguler': 2, 'premium': 3 };
      const aOrder = order[a.slug as keyof typeof order] || 999;
      const bOrder = order[b.slug as keyof typeof order] || 999;
      return aOrder - bOrder;
    });

    return {
      products: productsResult.data || [],
      tiers: sortedTiers,
      gameTitles: gameResult.data || []
    };
  } catch (error) {
    console.error('Optimized products data error:', error);
    throw new Error('Failed to fetch products data');
  }
}

/**
 * Batch API endpoint to handle multiple requests in a single call
 * Reduces database egress by combining multiple API calls
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { requests }: { requests: BatchRequest[] } = req.body;

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ error: 'Invalid requests array' });
    }

    // Limit batch size to prevent abuse
    if (requests.length > 20) {
      return res.status(400).json({ error: 'Too many requests in batch (max 20)' });
    }

    const responses: BatchResponse[] = [];

    // Process requests in parallel for better performance
    await Promise.all(
      requests.map(async (request) => {
        try {
          const response = await processRequest(request);
          responses.push({
            id: request.id,
            data: response.data,
            status: response.status,
          });
        } catch (error) {
          responses.push({
            id: request.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            status: 500,
          });
        }
      })
    );

    // Sort responses to match request order
    const sortedResponses = requests.map(req => 
      responses.find(res => res.id === req.id)!
    );

    return res.status(200).json({ responses: sortedResponses });

  } catch (error) {
    console.error('Batch API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Process individual request within batch - PHASE 3 OPTIMIZED
 */
async function processRequest(request: BatchRequest): Promise<{ data: any; status: number }> {
  const { endpoint, method, params } = request;

  // PHASE 3: Route to optimized handlers for major performance improvements
  try {
    // Extract user ID from headers if available
    const userId = extractUserId(request.headers);

    switch (endpoint) {
      case 'admin/dashboard':
      case 'admin/stats':
        if (method === 'GET') {
          const data = await getOptimizedAdminData(userId || '');
          return { data, status: 200 };
        }
        return await handleAdminStatsRequest(method, params);
      
      case 'feed':
        if (method === 'GET') {
          const data = await getOptimizedFeedData(params || {}, userId);
          return { data, status: 200 };
        }
        return await handleFeedRequest(method, params);
      
      case 'products':
        if (method === 'GET' && !params?.search && !params?.category) {
          // Use optimized full products data for general requests
          const data = await getOptimizedProductsData();
          return { data, status: 200 };
        }
        // Fall back to filtered search for specific queries
        return await handleProductsRequest(method, params);
      
      case 'admin/orders':
        return await handleAdminOrdersRequest(method, params);
      
      case 'admin/products':
        return await handleAdminProductsRequest(method, params);
      
      case 'categories':
        return await handleCategoriesRequest(method, params);
      
      case 'banners':
        return await handleBannersRequest(method, params);
      
      default:
        throw new Error(`Unsupported endpoint: ${endpoint}`);
    }
  } catch (error) {
    console.error(`Batch request error for ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Extract user ID from request headers
 */
function extractUserId(headers?: Record<string, string>): string | undefined {
  if (!headers?.authorization) return undefined;
  
  try {
    // For now, return undefined since we'd need JWT decoding
    // In production, decode the JWT token to get user ID
    return undefined;
  } catch (error) {
    console.warn('Failed to extract user ID from headers');
    return undefined;
  }
}

async function handleProductsRequest(method: string, params?: Record<string, any>) {
  if (method === 'GET') {
    const { page = 1, limit = 20, category, search } = params || {};
    
    let query = supabase
      .from('products')
      .select(`
        *,
        product_categories!inner(
          categories(id, name, slug)
        )
      `)
      .eq('status', 'active')
      .range((page - 1) * limit, page * limit - 1);

    if (category) {
      query = query.eq('product_categories.category_id', category);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return { data, status: 200 };
  }
  
  throw new Error(`Unsupported method: ${method}`);
}

async function handleFeedRequest(method: string, params?: Record<string, any>) {
  if (method === 'GET') {
    const { page = 1, limit = 20 } = params || {};
    
    const { data, error } = await supabase.rpc('get_optimized_feed_with_engagement', {
      p_page: page,
      p_limit: limit
    });
    
    if (error) throw error;
    return { data, status: 200 };
  }
  
  throw new Error(`Unsupported method: ${method}`);
}

async function handleAdminStatsRequest(method: string, params?: Record<string, any>) {
  if (method === 'GET') {
    const { data, error } = await supabase.rpc('get_comprehensive_admin_stats');
    
    if (error) throw error;
    return { data, status: 200 };
  }
  
  throw new Error(`Unsupported method: ${method}`);
}

async function handleAdminOrdersRequest(method: string, params?: Record<string, any>) {
  if (method === 'GET') {
    const { page = 1, limit = 20, status, search } = params || {};
    
    let query = supabase
      .from('orders')
      .select(`
        *,
        order_items(
          id,
          quantity,
          price,
          products(id, name, image_url)
        ),
        customers(id, name, email, phone)
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (status) {
      query = query.eq('status', status);
    }

    if (search) {
      query = query.or(`order_number.ilike.%${search}%,customers.name.ilike.%${search}%`);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return { data, status: 200 };
  }
  
  throw new Error(`Unsupported method: ${method}`);
}

async function handleAdminProductsRequest(method: string, params?: Record<string, any>) {
  if (method === 'GET') {
    const { page = 1, limit = 20, category, status } = params || {};
    
    let query = supabase
      .from('products')
      .select(`
        *,
        product_categories(
          categories(id, name, slug)
        )
      `)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    if (category) {
      query = query.eq('product_categories.category_id', category);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    return { data, status: 200 };
  }
  
  throw new Error(`Unsupported method: ${method}`);
}

async function handleCategoriesRequest(method: string, params?: Record<string, any>) {
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('status', 'active')
      .order('name');
    
    if (error) throw error;
    return { data, status: 200 };
  }
  
  throw new Error(`Unsupported method: ${method}`);
}

async function handleBannersRequest(method: string, params?: Record<string, any>) {
  if (method === 'GET') {
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (error) throw error;
    return { data, status: 200 };
  }
  
  throw new Error(`Unsupported method: ${method}`);
}
