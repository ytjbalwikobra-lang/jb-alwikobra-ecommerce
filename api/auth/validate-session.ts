// Session Validation API
// This validates user sessions and returns current user info

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
    const { sessionToken } = req.body;

    if (!sessionToken) {
      return res.status(401).json({ error: 'Session token is required' });
    }

    // Verify JWT token
    let decoded: any;
    try {
      decoded = jwt.verify(sessionToken, jwtSecret);
    } catch (jwtError) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Check if session exists in database and is active
    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select('*')
      .eq('session_token', sessionToken)
      .eq('is_active', true)
      .single();

    if (sessionError || !session) {
      return res.status(401).json({ error: 'Session not found or inactive' });
    }

    // Check if session is expired
    const now = new Date();
    const expiresAt = new Date(session.expires_at);
    
    if (now > expiresAt) {
      // Mark session as inactive
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('session_token', sessionToken);
        
      return res.status(401).json({ error: 'Session expired' });
    }

    // Get current user data
    const { data: user, error: userError } = await supabase
      .from('whatsapp_users')
      .select('*')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Update last activity
    await supabase
      .from('user_sessions')
      .update({ last_activity_at: new Date().toISOString() })
      .eq('session_token', sessionToken);

    res.status(200).json({
      success: true,
      user: {
        id: user.id,
        whatsapp: user.whatsapp,
        name: user.name,
        email: user.email,
        fullName: user.full_name,
        isAdmin: user.is_admin,
        avatarUrl: user.avatar_url,
        dateOfBirth: user.date_of_birth,
        gender: user.gender,
        bio: user.bio,
        notificationPreferences: user.notification_preferences,
        lastLoginAt: user.last_login_at,
        createdAt: user.created_at
      },
      session: {
        expiresAt: session.expires_at,
        lastActivity: session.last_activity_at
      }
    });

  } catch (error) {
    console.error('Session validation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
