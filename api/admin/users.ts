import { getSupabaseAdmin } from '../_utils/supabaseAdmin';

export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    // Get users list
    try {
      const supabaseAdmin = getSupabaseAdmin();
      
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
    } catch (error: any) {
      console.error('Admin users API error:', error);
      return res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  } else if (req.method === 'PUT') {
    // Update user role
    try {
      const { id, isAdmin } = req.body;
      
      if (!id || typeof isAdmin !== 'boolean') {
        return res.status(400).json({ error: 'Missing id or invalid isAdmin value' });
      }

      const supabaseAdmin = getSupabaseAdmin();
      
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
    } catch (error: any) {
      console.error('Admin user update API error:', error);
      return res.status(500).json({ 
        error: 'Internal server error', 
        message: error.message 
      });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
