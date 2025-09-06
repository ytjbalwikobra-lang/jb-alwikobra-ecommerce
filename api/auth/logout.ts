// Logout API
// This invalidates user sessions

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;
const jwtSecret = process.env.JWT_SECRET || 'your-jwt-secret-change-this';

// Use service key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { sessionToken, logoutAll = false } = req.body;

    if (!sessionToken) {
      return res.status(400).json({ error: 'Session token is required' });
    }

    // Verify JWT token to get user ID
    let decoded: any;
    try {
      decoded = jwt.verify(sessionToken, jwtSecret);
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid session token' });
    }

    if (logoutAll) {
      // Logout from all devices
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('user_id', decoded.userId)
        .eq('is_active', true);
    } else {
      // Logout from current session only
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken);
    }

    res.status(200).json({
      success: true,
      message: logoutAll ? 'Logged out from all devices' : 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
