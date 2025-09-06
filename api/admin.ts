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
    // Get analytics data
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Orders count and revenue
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select('total_amount, created_at')
      .gte('created_at', sevenDaysAgo.toISOString());

    if (ordersError) throw ordersError;

    // Users count
    const { count: usersCount, error: usersError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    if (usersError) throw usersError;

    // Products count
    const { count: productsCount, error: productsError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    if (productsError) throw productsError;

    // Flash sales count
    const { count: flashSalesCount, error: flashSalesError } = await supabase
      .from('flash_sales')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    if (flashSalesError) throw flashSalesError;

    const totalRevenue = orders?.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0) || 0;

    return res.status(200).json({
      success: true,
      data: {
        orders: {
          count: orders?.length || 0,
          revenue: totalRevenue
        },
        users: usersCount || 0,
        products: productsCount || 0,
        flashSales: flashSalesCount || 0
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
    const { page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        *,
        products (
          name,
          image
        )
      `)
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit as string) - 1);

    if (error) throw error;

    // Get total count
    const { count, error: countError } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    if (countError) throw countError;

    return res.status(200).json({
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
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { page = '1', limit = '20' } = req.query;
    const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

    const { data: users, error } = await supabase
      .from('users')
      .select('id, phone, email, name, is_admin, is_active, phone_verified, created_at')
      .order('created_at', { ascending: false })
      .range(offset, offset + parseInt(limit as string) - 1);

    if (error) throw error;

    // Get total count
    const { count, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

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

async function handleUpdateOrder(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { orderId, status, notes } = req.body;

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
