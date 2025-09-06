import { getSupabaseAdmin } from '../_utils/supabaseAdmin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const supabaseAdmin = getSupabaseAdmin();
    
    // Get orders data with admin privileges
    const { data: orders, error: ordersError } = await supabaseAdmin
      .from('orders')
      .select('*, products:product_id ( id, name )')
      .order('created_at', { ascending: false })
      .limit(500);

    if (ordersError) {
      console.error('Orders fetch error:', ordersError);
      return res.status(500).json({ error: 'Failed to fetch orders', details: ordersError.message });
    }

    return res.status(200).json({ 
      success: true, 
      data: orders || [],
      count: orders?.length || 0
    });
  } catch (error: any) {
    console.error('Admin orders API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
