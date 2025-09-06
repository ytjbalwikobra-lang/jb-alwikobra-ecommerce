import { getSupabaseAdmin } from '../_utils/supabaseAdmin';

export default async function handler(req: any, res: any) {
  const { method, query, body } = req;
  const { action } = query;

  try {
    const supabaseAdmin = getSupabaseAdmin();

    switch (action) {
      case 'dashboard':
        if (method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed for dashboard' });
        }
        return await handleDashboard(supabaseAdmin, res);

      case 'orders':
        if (method !== 'GET') {
          return res.status(405).json({ error: 'Method not allowed for orders' });
        }
        return await handleOrders(supabaseAdmin, res);

      case 'users':
        if (method === 'GET') {
          return await handleGetUsers(supabaseAdmin, res);
        } else if (method === 'PUT') {
          return await handleUpdateUser(supabaseAdmin, body, res);
        } else {
          return res.status(405).json({ error: 'Method not allowed for users' });
        }

      case 'update-order':
        if (method !== 'PUT') {
          return res.status(405).json({ error: 'Method not allowed for update-order' });
        }
        return await handleUpdateOrder(supabaseAdmin, body, res);

      default:
        return res.status(400).json({ error: 'Invalid action parameter' });
    }
  } catch (error: any) {
    console.error('Admin API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}

// Dashboard statistics
async function handleDashboard(supabaseAdmin: any, res: any) {
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    { count: productsCount, error: productsError },
    { count: flashSalesCount, error: flashError },
    { data: recentOrders, error: ordersError }
  ] = await Promise.all([
    supabaseAdmin.from('products').select('id', { count: 'exact', head: true }),
    supabaseAdmin.from('flash_sales').select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .gte('end_time', now.toISOString()),
    supabaseAdmin.from('orders').select('amount, status, created_at')
      .gte('created_at', sevenDaysAgo)
  ]);

  if (productsError || flashError || ordersError) {
    const errors = [productsError, flashError, ordersError].filter(Boolean);
    console.error('Dashboard fetch errors:', errors);
    return res.status(500).json({ 
      error: 'Failed to fetch dashboard data', 
      details: errors.map(e => e?.message).join(', ')
    });
  }

  const orders = recentOrders || [];
  const revenue = orders
    .filter((o: any) => ['paid', 'completed'].includes(o.status))
    .reduce((sum: number, o: any) => sum + Number(o.amount || 0), 0);

  return res.status(200).json({
    success: true,
    data: {
      products: productsCount || 0,
      flashSales: flashSalesCount || 0,
      orders7days: orders.length,
      revenue7days: revenue
    }
  });
}

// Orders list
async function handleOrders(supabaseAdmin: any, res: any) {
  let data: any[] | null = null;
  let errorMessage = '';

  try {
    // Try to get orders with product relations
    const { data: ordersWithProducts, error } = await supabaseAdmin
      .from('orders')
      .select('*, products:product_id ( id, name )')
      .order('created_at', { ascending: false })
      .limit(500);
    
    if (error) throw error;
    data = ordersWithProducts;
  } catch (e: any) {
    // Fallback to basic orders if relations fail
    errorMessage = e?.message || String(e);
    const { data: basicOrders, error: basicError } = await supabaseAdmin
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    
    if (basicError) {
      console.error('Orders fetch error:', basicError);
      return res.status(500).json({ error: 'Failed to fetch orders', details: basicError.message });
    }
    data = basicOrders;
  }

  return res.status(200).json({ 
    success: true, 
    data: data || [],
    warning: errorMessage ? `Product relations unavailable: ${errorMessage}` : undefined
  });
}

// Get users list
async function handleGetUsers(supabaseAdmin: any, res: any) {
  const { data: usersData, error: usersError } = await supabaseAdmin
    .from('users')
    .select('id, name, email, phone, is_admin, is_active, phone_verified, created_at, updated_at, last_login_at')
    .order('created_at', { ascending: false });

  if (usersError) {
    console.error('Users fetch error:', usersError);
    return res.status(500).json({ error: 'Failed to fetch users', details: usersError.message });
  }

  return res.status(200).json({ 
    success: true, 
    data: usersData || []
  });
}

// Update user role
async function handleUpdateUser(supabaseAdmin: any, body: any, res: any) {
  const { id, isAdmin } = body;
  
  if (!id || typeof isAdmin !== 'boolean') {
    return res.status(400).json({ error: 'Missing id or invalid isAdmin value' });
  }

  const { error } = await supabaseAdmin
    .from('users')
    .update({ is_admin: isAdmin })
    .eq('id', id);

  if (error) {
    console.error('User update error:', error);
    return res.status(500).json({ error: 'Failed to update user', details: error.message });
  }

  return res.status(200).json({ 
    success: true, 
    message: 'User role updated successfully'
  });
}

// Update order status
async function handleUpdateOrder(supabaseAdmin: any, body: any, res: any) {
  const { id, status } = body;
  
  if (!id || !status) {
    return res.status(400).json({ error: 'Missing id or status' });
  }

  const { error } = await supabaseAdmin
    .from('orders')
    .update({ status })
    .eq('id', id);

  if (error) {
    console.error('Order update error:', error);
    return res.status(500).json({ error: 'Failed to update order', details: error.message });
  }

  return res.status(200).json({ 
    success: true, 
    message: 'Order status updated successfully'
  });
}
