import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, verification_code } = req.body;

    if (!user_id || !verification_code) {
      return res.status(400).json({ 
        error: 'User ID and verification code are required' 
      });
    }

    // Find verification record
    const { data: verification, error: verificationError } = await supabase
      .from('phone_verifications')
      .select('*')
      .eq('user_id', user_id)
      .eq('verification_code', verification_code)
      .eq('is_used', false)
      .single();

    if (verificationError || !verification) {
      return res.status(400).json({ 
        error: 'Invalid verification code' 
      });
    }

    // Check if expired
    if (new Date(verification.expires_at) < new Date()) {
      return res.status(400).json({ 
        error: 'Verification code has expired. Please request a new one.' 
      });
    }

    // Check attempts (max 3)
    if (verification.attempts >= 3) {
      return res.status(429).json({ 
        error: 'Too many verification attempts. Please request a new code.' 
      });
    }

    // Mark verification as used
    await supabase
      .from('phone_verifications')
      .update({ 
        is_used: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', verification.id);

    // Update user as phone verified
    const { data: user, error: userError } = await supabase
      .from('users')
      .update({ 
        phone_verified: true,
        phone_verified_at: new Date().toISOString()
      })
      .eq('id', user_id)
      .select()
      .single();

    if (userError) {
      console.error('User update error:', userError);
      return res.status(500).json({ error: 'Failed to verify phone' });
    }

    // Create session for the newly verified user
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
    const { password_hash, login_attempts, locked_until, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Phone verified successfully! Please complete your profile.',
      user: safeUser,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
      next_step: 'complete_profile' // User needs to add email and name
    });

  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
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
