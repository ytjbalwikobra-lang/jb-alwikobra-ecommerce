/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-return */
import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

// Admin service role client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * OPTIMIZED ADMIN API
 * Reduces database calls by using consolidated queries and caching
 */

// In-memory cache to reduce DB calls
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class AdminCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  public readonly SHORT_TTL = 60 * 1000; // 1 minute

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }

  set<T>(key: string, data: T, ttl = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  clear(pattern?: string): void {
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
}

const adminCache = new AdminCache();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    switch (action) {
      case 'dashboard':
        return await handleDashboardOptimized(req, res);
      case 'orders':
        if (req.method === 'GET') {
          res.setHeader('Cache-Control', 'public, max-age=15, s-maxage=60, stale-while-revalidate=60');
        }
        return await handleOrdersOptimized(req, res);
      case 'users':
        return await handleUsersOptimized(req, res);
      case 'update-order':
        return await handleUpdateOrder(req, res);
      case 'whatsapp-settings':
        return await handleWhatsAppSettings(req, res);
      case 'upload-game-logo':
        return await handleUploadGameLogo(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function getCurrentUser(req: VercelRequest): Promise<any> {
  try {
    const auth = req.headers['authorization'] || '';
    const token = Array.isArray(auth) ? auth[0] : auth;
    const bearer = token.startsWith('Bearer ') ? token.slice(7) : null;
    if (!bearer) return null;

    // Check cache first
    const cacheKey = `user_session_${bearer}`;
    const cached = adminCache.get(cacheKey);
    if (cached) return cached;

    // Single query with join
    const { data: session } = await supabase
      .from('user_sessions')
      .select(`
        user_id, 
        expires_at, 
        is_active,
        user:users(id, is_admin)
      `)
      .eq('session_token', bearer)
      .single();

    if (!session || session.is_active === false) return null;
    if (session.expires_at && new Date(session.expires_at) < new Date()) return null;

    const user = session.user;
    adminCache.set(cacheKey, user, adminCache.SHORT_TTL);
    return user || null;
  } catch {
    return null;
  }
}

/**
 * OPTIMIZED: Dashboard with single RPC call
 */
async function handleDashboardOptimized(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const period = req.query.period as string || 'weekly';
    const cacheKey = `dashboard_${period}`;
    
    // Check cache
    const cached = adminCache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        cached: true
      });
    }

    // Try optimized RPC function first
    try {
      const { data: dashboardData, error: dashboardError } = await supabase
        .rpc('get_dashboard_data');

      if (!dashboardError && dashboardData) {
        // Get daily revenue for chart
        const days = period === 'monthly' ? 30 : period === 'yearly' ? 365 : 7;
        const { data: dailyData } = await supabase
          .rpc('get_daily_revenue', { days_back: days });

        const result = {
          orders: {
            count: dashboardData.analytics?.orders_7d || 0,
            revenue: dashboardData.analytics?.revenue_7d || 0,
            averageValue: dashboardData.analytics?.avg_order_value || 0
          },
          users: dashboardData.users || 0,
          products: dashboardData.products || 0,
          flashSales: dashboardData.flashSales || 0,
          analytics: {
            totalOrders: dashboardData.analytics?.total_orders || 0,
            paidOrders: dashboardData.analytics?.paid_orders || 0,
            pendingOrders: dashboardData.analytics?.pending_orders || 0,
            cancelledOrders: dashboardData.analytics?.cancelled_orders || 0,
            totalRevenue: dashboardData.analytics?.revenue_total || 0
          },
          trends: {
            revenueTrend: 0, // Could be calculated if needed
            orderTrend: 0
          },
          dailyRevenue: dailyData || [],
          period
        };

        adminCache.set(cacheKey, result, adminCache.SHORT_TTL);
        return res.json({
          success: true,
          data: result
        });
      }
    } catch (rpcError) {
      console.warn('RPC dashboard failed, using fallback');
    }

    // Fallback: Optimized queries with minimal data transfer
    const endDate = new Date();
    const days = period === 'monthly' ? 30 : period === 'yearly' ? 365 : 7;
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000);

    // Parallel queries with minimal data
    const [
      ordersResult,
      productsResult,
      usersResult,
      flashSalesResult
    ] = await Promise.all([
      // Only get required fields from orders
      supabase
        .from('orders')
        .select('amount, status, created_at')
        .gte('created_at', startDate.toISOString()),
      
      // Count only active products
      supabase
        .from('products')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      
      // Count all users
      supabase
        .from('users')
        .select('id', { count: 'exact', head: true }),
      
      // Count active flash sales
      supabase
        .from('flash_sales')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true)
    ]);

    const orders = ordersResult.data || [];
    const paidOrders = orders.filter(o => o.status === 'PAID');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (Number(o.amount) || 0), 0);

    const result = {
      orders: {
        count: paidOrders.length,
        revenue: totalRevenue,
        averageValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0
      },
      users: usersResult.count || 0,
      products: productsResult.count || 0,
      flashSales: flashSalesResult.count || 0,
      analytics: {
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        pendingOrders: orders.filter(o => o.status === 'pending').length,
        cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
        totalRevenue
      },
      trends: {
        revenueTrend: 0,
        orderTrend: 0
      },
      dailyRevenue: [],
      period
    };

    adminCache.set(cacheKey, result, adminCache.SHORT_TTL);
    return res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}

/**
 * OPTIMIZED: Orders with single query and pagination
 */
async function handleOrdersOptimized(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;
    const orderType = req.query.orderType as string;
    const search = req.query.search as string;
    
    const offset = (page - 1) * limit;
    const cacheKey = `orders_${page}_${limit}_${status}_${orderType}_${search}`;
    
    // Check cache
    const cached = adminCache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        ...cached,
        cached: true
      });
    }

    // Single optimized query with count
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

    const result = {
      orders: orders || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

    adminCache.set(cacheKey, result, adminCache.SHORT_TTL);
    return res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Orders error:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

/**
 * OPTIMIZED: Users with minimal data transfer
 */
async function handleUsersOptimized(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    
    const offset = (page - 1) * limit;
    const cacheKey = `users_${page}_${limit}_${search}`;
    
    // Check cache
    const cached = adminCache.get(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        ...cached,
        cached: true
      });
    }

    // Single query with only required fields
    let query = supabase
      .from('users')
      .select(`
        id,
        name,
        email,
        phone,
        is_admin,
        created_at
      `, { count: 'exact' });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data: users, error, count } = await query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const result = {
      users: users || [],
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit)
      }
    };

    adminCache.set(cacheKey, result, adminCache.SHORT_TTL);
    return res.json({
      success: true,
      ...result
    });

  } catch (error) {
    console.error('Users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

/**
 * Update order - clears cache
 */
async function handleUpdateOrder(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const me = await getCurrentUser(req);
  if (!me || !me.is_admin) {
    return res.status(403).json({ error: 'Admin only' });
  }

  try {
    const { orderId, updates } = req.body;
    
    const { error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId);

    if (error) throw error;

    // Clear relevant caches
    adminCache.clear('orders');
    adminCache.clear('dashboard');

    return res.json({ success: true });
  } catch (error) {
    console.error('Update order error:', error);
    return res.status(500).json({ error: 'Failed to update order' });
  }
}

/**
 * WhatsApp settings with caching
 */
async function handleWhatsAppSettings(req: VercelRequest, res: VercelResponse) {
  const me = await getCurrentUser(req);
  if (!me || !me.is_admin) {
    return res.status(403).json({ error: 'Admin only' });
  }

  if (req.method === 'GET') {
    const cacheKey = 'whatsapp_settings';
    const cached = adminCache.get(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, cached: true });
    }

    try {
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      adminCache.set(cacheKey, data);
      return res.json({ success: true, data });
    } catch (error) {
      console.error('WhatsApp settings error:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const updates = req.body;
      
      const { error } = await supabase
        .from('whatsapp_settings')
        .upsert(updates);

      if (error) throw error;

      // Clear cache
      adminCache.clear('whatsapp_settings');

      return res.json({ success: true });
    } catch (error) {
      console.error('WhatsApp settings update error:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

/**
 * Upload game logo - unchanged but added here for completeness
 */
async function handleUploadGameLogo(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const me = await getCurrentUser(req);
  if (!me || !me.is_admin) {
    return res.status(403).json({ error: 'Admin only' });
  }

  try {
    const { name, contentType, dataBase64, slug } = req.body as any;
    if (!name || !contentType || !dataBase64 || !slug) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Derive extension
    const extFromName = String(name).split('.').pop()?.toLowerCase() || '';
    const extFromType = contentType === 'image/svg+xml' ? 'svg' : contentType.split('/')[1] || '';
    const ext = (extFromName || extFromType || 'png').replace(/[^a-z0-9]/g, '');

    const bucket = 'game-logos';
    const safeSlug = String(slug).trim().toLowerCase().replace(/[^a-z0-9-]/g, '-');
    const path = `logos/${safeSlug}-${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;

    const buffer = Buffer.from(dataBase64, 'base64');
    const { error } = await (supabase as any).storage.from(bucket).upload(path, buffer, {
      contentType,
      upsert: false,
      cacheControl: '3600'
    });
    if (error) return res.status(400).json({ error: error.message });

    const { data } = (supabase as any).storage.from(bucket).getPublicUrl(path);
    return res.status(200).json({ success: true, path, publicUrl: data?.publicUrl || null });
  } catch (error) {
    console.error('upload-game-logo error:', error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
