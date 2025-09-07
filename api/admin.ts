import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
// import { compressResponse } from './_utils/compressionUtils.ts';

// Admin service role client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

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
        return await handleDashboard(req, res);
      case 'orders':
        return await handleOrders(req, res);
      case 'users':
        return await handleUsers(req, res);
      case 'update-order':
        return await handleUpdateOrder(req, res);
      case 'whatsapp-settings':
        return await handleWhatsAppSettings(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleDashboard(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get time period parameters
    const period = req.query.period as string || 'weekly';
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    
    // Calculate date range based on period
    const currentTime = new Date();
    let periodStart: Date;
    let periodEnd: Date = currentTime;
    
    if (startDate && endDate) {
      periodStart = new Date(startDate);
      periodEnd = new Date(endDate);
    } else {
      switch (period) {
        case 'weekly':
          periodStart = new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'monthly':
          periodStart = new Date(currentTime.getFullYear(), currentTime.getMonth() - 1, currentTime.getDate());
          break;
        case 'quarterly':
          periodStart = new Date(currentTime.getFullYear(), currentTime.getMonth() - 3, currentTime.getDate());
          break;
        case 'yearly':
          periodStart = new Date(currentTime.getFullYear() - 1, currentTime.getMonth(), currentTime.getDate());
          break;
        default:
          periodStart = new Date(currentTime.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
    }

    // Try to use optimized RPC function first
    try {
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_dashboard_data');

      if (!rpcError && rpcData) {
        // Get daily revenue data for the specified period
        const days_back = Math.ceil((periodEnd.getTime() - periodStart.getTime()) / (24 * 60 * 60 * 1000));
        const { data: dailyData, error: dailyError } = await supabase
          .rpc('get_daily_revenue', { days_back });

        const analytics = rpcData.analytics || {};
        
        // Calculate trends by comparing with previous period
        const prevPeriodStart = new Date(periodStart.getTime() - (periodEnd.getTime() - periodStart.getTime()));
        const { data: prevData } = await supabase
          .from('orders')
          .select('amount, created_at')
          .eq('status', 'PAID')
          .gte('created_at', prevPeriodStart.toISOString())
          .lt('created_at', periodStart.toISOString());

        const prevOrders = prevData || [];
        const prevRevenue = prevOrders.reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0);
        
        const currentRevenue = analytics.revenue_7d || 0;
        const currentOrders = analytics.orders_7d || 0;
        
        const revenueTrend = prevRevenue > 0 ? ((currentRevenue - prevRevenue) / prevRevenue) * 100 : 0;
        const orderTrend = prevOrders.length > 0 ? ((currentOrders - prevOrders.length) / prevOrders.length) * 100 : 0;

        return res.json({
          success: true,
          data: {
            orders: {
              count: currentOrders,
              revenue: currentRevenue,
              averageValue: analytics.avg_order_value || 0
            },
            users: rpcData.users || 0,
            products: rpcData.products || 0,
            flashSales: rpcData.flashSales || 0,
            analytics: {
              statusDistribution: {
                pending: analytics.pending_orders || 0,
                paid: analytics.paid_orders || 0,
                cancelled: analytics.cancelled_orders || 0
              },
              dailyRevenue: dailyData || [],
              monthlyOrders: analytics.orders_30d || 0,
              monthlyRevenue: analytics.revenue_30d || 0,
              trends: {
                orderTrend: Math.round(orderTrend),
                revenueTrend: Math.round(revenueTrend),
                userTrend: 0 // TODO: Implement user trend calculation
              }
            }
          }
        });
      }
    } catch (rpcError) {
      console.warn('RPC function not available, falling back to legacy method:', rpcError);
    }

    // Fallback to legacy method if RPC fails
    // Get analytics data
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Initialize default values
    let orders: any[] = [];
    let usersCount = 0;
    let productsCount = 0;
    let flashSalesCount = 0;

  // Orders count and revenue (with error handling) - ONLY paid orders (lowercase to match UI/DB semantics)
    try {
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
    .select('amount, created_at, status')
    .eq('status', 'paid')
        .gte('created_at', sevenDaysAgo.toISOString());

      if (ordersError) {
        console.warn('Orders query error:', ordersError);
      } else {
        orders = ordersData || [];
      }
    } catch (error) {
      console.warn('Orders query failed:', error);
    }

    // Users count (with error handling) - Only count, no data
    try {
      const { count, error: usersError } = await supabase
        .from('users')
        .select('id', { count: 'exact', head: true });

      if (usersError) {
        console.warn('Users count error:', usersError);
      } else {
        usersCount = count || 0;
      }
    } catch (error) {
      console.warn('Users count failed:', error);
    }

  // Products count (active & not archived) (with error handling) - Only count, no data
    try {
      const { count, error: productsError } = await supabase
        .from('products')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .is('archived_at', null);

      if (productsError) {
        console.warn('Products count error:', productsError);
      } else {
        productsCount = count || 0;
      }
    } catch (error) {
      console.warn('Products count failed:', error);
    }

  // Flash sales count (active and not ended) (with fallback if table doesn't exist) - Only count, no data
    try {
      const { count, error: flashSalesError } = await supabase
        .from('flash_sales')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .gte('end_time', new Date().toISOString());

      if (flashSalesError) {
        console.warn('Flash sales table not found or error:', flashSalesError);
        flashSalesCount = 0;
      } else {
        flashSalesCount = count || 0;
      }
    } catch (error) {
      console.warn('Flash sales query failed:', error);
      flashSalesCount = 0;
    }

    const totalRevenue = orders?.reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0) || 0;
    const averageOrderValue = orders?.length > 0 ? totalRevenue / orders.length : 0;

    // Get additional analytics data
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
  // Monthly orders data for chart - ONLY paid orders
    let monthlyOrders: any[] = [];
    try {
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('orders')
    .select('amount, created_at, status')
    .eq('status', 'paid')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: true });

      if (!monthlyError) {
        monthlyOrders = monthlyData || [];
      }
    } catch (error) {
      console.warn('Monthly orders query failed:', error);
    }

    // Status distribution - check all orders not just 7 days - only get status field
    let allOrders: any[] = [];
    try {
      const { data: allOrdersData, error: allOrdersError } = await supabase
        .from('orders')
        .select('status')
        .order('created_at', { ascending: false });

      if (!allOrdersError) {
        allOrders = allOrdersData || [];
      }
    } catch (error) {
      console.warn('All orders query failed:', error);
    }

    const statusDistribution = allOrders?.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Daily revenue for last 7 days
    const dailyRevenue: Array<{date: string; revenue: number; orders: number}> = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.setHours(0, 0, 0, 0));
      const dayEnd = new Date(date.setHours(23, 59, 59, 999));
      
      const dayOrders = orders?.filter(order => {
        const orderDate = new Date(order.created_at);
        return orderDate >= dayStart && orderDate <= dayEnd;
      }) || [];
      
      const dayRevenue = dayOrders.reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0);
      
      dailyRevenue.push({
        date: dayStart.toISOString().split('T')[0],
        revenue: dayRevenue,
        orders: dayOrders.length
      });
    }

    return res.json({
      success: true,
      data: {
        orders: {
          count: orders?.length || 0,
          revenue: totalRevenue,
          averageValue: averageOrderValue
        },
        users: usersCount || 0,
        products: productsCount || 0,
        flashSales: flashSalesCount || 0,
        analytics: {
          statusDistribution,
          dailyRevenue,
          monthlyOrders: monthlyOrders.length,
          monthlyRevenue: monthlyOrders.reduce((sum, order) => sum + (parseFloat(order.amount) || 0), 0),
          averageOrderValue
        }
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
}

async function handleOrders(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { page = '1', limit = '20', status, order_type, search } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    // Build the query with filters
    let ordersQuery = supabase
      .from('orders')
      .select(`
        *,
        products (
          name,
          image
        )
      `);

    // Apply filters
    if (status && status !== 'all') {
      ordersQuery = ordersQuery.eq('status', status);
    }
    if (order_type && order_type !== 'all') {
      ordersQuery = ordersQuery.eq('order_type', order_type);
    }
    if (search) {
      ordersQuery = ordersQuery.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%,id.ilike.%${search}%`);
    }

    // Apply pagination and ordering
    const { data: orders, error } = await ordersQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit as string) - 1);

    if (error) throw error;

    // Get total count with same filters - only get id for count
    let countQuery = supabase
      .from('orders')
      .select('id', { count: 'exact', head: true });

    // Apply same filters to count query
    if (status && status !== 'all') {
      countQuery = countQuery.eq('status', status);
    }
    if (order_type && order_type !== 'all') {
      countQuery = countQuery.eq('order_type', order_type);
    }
    if (search) {
      countQuery = countQuery.or(`customer_name.ilike.%${search}%,customer_email.ilike.%${search}%,customer_phone.ilike.%${search}%,id.ilike.%${search}%`);
    }

    const { count, error: countError } = await countQuery;

    if (countError) throw countError;

    return res.json({
      success: true,
      data: {
        orders: orders || [],
        pagination: {
          total: count || 0,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil((count || 0) / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Orders error:', error);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
}

async function handleUsers(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    return await getUsersList(req, res);
  } else if (req.method === 'PUT') {
    return await updateUser(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function getUsersList(req: VercelRequest, res: VercelResponse) {

  try {
    const { page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { data: users, error } = await supabase
      .from('users')
      .select('id, phone, email, name, is_admin, is_active, phone_verified, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit as string) - 1);

    if (error) throw error;

    // Get total count - only get id for count
    const { count, error: countError } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    if (countError) throw countError;

    return res.status(200).json({
      success: true,
      data: {
        users: users || [],
        pagination: {
          total: count || 0,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          totalPages: Math.ceil((count || 0) / parseInt(limit as string))
        }
      }
    });
  } catch (error) {
    console.error('Users error:', error);
    return res.status(500).json({ error: 'Failed to fetch users' });
  }
}

async function updateUser(req: VercelRequest, res: VercelResponse) {
  try {
    const { userId, is_admin, is_active } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const updateData: any = {};
    if (typeof is_admin === 'boolean') updateData.is_admin = is_admin;
    if (typeof is_active === 'boolean') updateData.is_active = is_active;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Update user error:', error);
    return res.status(500).json({ error: 'Failed to update user' });
  }
}

async function handleUpdateOrder(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId: rawOrderId, id, status, notes } = req.body as any;
    const orderId = rawOrderId || id;

  if (!orderId || !status) {
      return res.status(400).json({ error: 'Order ID and status are required' });
    }

    const { data: order, error } = await supabase
      .from('orders')
      .update({
        status,
        admin_notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    return res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    console.error('Update order error:', error);
    return res.status(500).json({ error: 'Failed to update order' });
  }
}

async function handleWhatsAppSettings(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { data: settings, error } = await supabase
        .from('whatsapp_api_keys')
        .select('*')
        .eq('is_active', true)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      return res.status(200).json({
        settings: settings || null
      });
    } catch (error) {
      console.error('Get WhatsApp settings error:', error);
      return res.status(500).json({ error: 'Failed to fetch settings' });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { api_key, provider_name } = req.body;

      if (!api_key || !provider_name) {
        return res.status(400).json({ error: 'API key and provider name are required' });
      }

      // Update or insert settings
      const { data: settings, error } = await supabase
        .from('whatsapp_api_keys')
        .upsert({
          api_key,
          provider_name,
          is_active: true,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      return res.status(200).json({
        success: true,
        settings
      });
    } catch (error) {
      console.error('Update WhatsApp settings error:', error);
      return res.status(500).json({ error: 'Failed to update settings' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
