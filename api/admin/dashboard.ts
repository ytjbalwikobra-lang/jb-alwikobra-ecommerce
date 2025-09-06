import { getSupabaseAdmin } from '../_utils/supabaseAdmin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

    // Get dashboard statistics with admin privileges
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

    // Calculate revenue from paid/completed orders
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
  } catch (error: any) {
    console.error('Admin dashboard API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
