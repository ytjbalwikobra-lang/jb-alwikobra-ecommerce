import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables:', {
    url: !!supabaseUrl,
    serviceKey: !!supabaseServiceKey
  });
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check environment variables
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Missing environment variables');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const { identifier, password } = req.body; // identifier can be phone or email

    if (!identifier || !password) {
      return res.status(400).json({ 
        error: 'Phone/email and password are required' 
      });
    }

    // Check if identifier is phone or email
    const isPhone = /^62[0-9]{9,13}$/.test(identifier);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier);

    if (!isPhone && !isEmail) {
      return res.status(400).json({ 
        error: 'Please provide a valid phone number (62xxx) or email address' 
      });
    }

    // Find user by phone or email
    let query = supabase
      .from('users')
      .select('*')
      .eq('is_active', true);

    if (isPhone) {
      query = query.eq('phone', identifier);
    } else {
      query = query.eq('email', identifier);
    }

    const { data: user, error: userError } = await query.single();

    if (userError || !user) {
      return res.status(401).json({ 
        error: 'Invalid credentials' 
      });
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(423).json({ 
        error: 'Account is temporarily locked. Please try again later.' 
      });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      // Increment login attempts
      const newAttempts = (user.login_attempts || 0) + 1;
      const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null; // Lock for 15 minutes after 5 attempts

      await supabase
        .from('users')
        .update({ 
          login_attempts: newAttempts,
          locked_until: lockUntil
        })
        .eq('id', user.id);

      return res.status(401).json({ 
        error: 'Invalid credentials',
        remaining_attempts: lockUntil ? 0 : Math.max(0, 5 - newAttempts)
      });
    }

    // Check if phone is verified (for phone login)
    if (isPhone && !user.phone_verified) {
      return res.status(403).json({ 
        error: 'Phone number not verified. Please complete verification first.',
        requires_verification: true,
        user_id: user.id
      });
    }

    // Reset login attempts on successful login
    await supabase
      .from('users')
      .update({ 
        login_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString()
      })
      .eq('id', user.id);

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const { error: sessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: getClientIP(req),
        user_agent: req.headers['user-agent']
      });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return res.status(500).json({ error: 'Failed to create session' });
    }

    // Return user data (without password hash)
    const { password_hash, login_attempts, locked_until, is_admin, ...safeUser } = user;
    
    // Transform user data to match frontend expectations
    const transformedUser = {
      ...safeUser,
      isAdmin: is_admin || false  // Convert is_admin to isAdmin
    };

    return res.status(200).json({
      success: true,
      user: transformedUser,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
      profile_completed: user.profile_completed
    });

  } catch (error) {
    console.error('Login error:', error);
    
    // Return proper JSON error response
    return res.status(500).json({ 
      error: 'Internal server error',
      message: 'A server error occurred during authentication',
      success: false
    });
  }
}

function generateSessionToken(): string {
  return require('crypto').randomBytes(32).toString('hex');
}

function getClientIP(req: VercelRequest): string {
  return (req.headers['x-forwarded-for'] as string)?.split(',')[0] || 
         req.headers['x-real-ip'] as string || 
         'unknown';
}
