import { getSupabaseAdmin } from '../_utils/supabaseAdmin';

export default async function handler(req: any, res: any) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { id, status } = req.body;
    
    if (!id || !status) {
      return res.status(400).json({ error: 'Missing id or status' });
    }

    const supabaseAdmin = getSupabaseAdmin();
    
    // Update order status with admin privileges
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
  } catch (error: any) {
    console.error('Admin order update API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message 
    });
  }
}
