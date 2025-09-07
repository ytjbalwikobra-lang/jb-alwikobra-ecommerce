import { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { DynamicWhatsAppService } from './_utils/dynamicWhatsAppService';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const whatsappService = new DynamicWhatsAppService();

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function getClientIP(req: VercelRequest): string {
  return req.headers['x-forwarded-for'] as string || 
         req.headers['x-real-ip'] as string || 
         'unknown';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { action } = req.query;

    switch (action) {
      case 'login':
        return await handleLogin(req, res);
      case 'signup':
        return await handleSignup(req, res);
      case 'verify-phone':
        return await handleVerifyPhone(req, res);
      case 'complete-profile':
        return await handleCompleteProfile(req, res);
      case 'validate-session':
        return await handleValidateSession(req, res);
      case 'logout':
        return await handleLogout(req, res);
      case 'whatsapp-confirm':
        return await handleWhatsAppConfirm(req, res);
      case 'test-whatsapp':
        return await handleTestWhatsApp(req, res);
      case 'send-welcome':
        return await handleSendWelcome(req, res);
      case 'update-profile':
        return await handleUpdateProfile(req, res);
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Auth API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleUpdateProfile(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const auth = req.headers['authorization'] || '';
    const token = Array.isArray(auth) ? auth[0] : auth;
    const bearer = token.startsWith('Bearer ') ? token.slice(7) : null;
    if (!bearer) return res.status(401).json({ error: 'Unauthorized' });

    // Resolve user by session token
    const { data: session } = await supabase
      .from('user_sessions')
      .select('user_id, expires_at, is_active')
      .eq('session_token', bearer)
      .single();
    if (!session || session.is_active === false || (session.expires_at && new Date(session.expires_at) < new Date())) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    const { name, email, phone } = req.body as any;
    const update: any = {};
    if (typeof name === 'string') update.name = name;
    if (typeof email === 'string') update.email = email;
    if (typeof phone === 'string') update.phone = phone;
    if (Object.keys(update).length === 0) return res.status(400).json({ error: 'No fields to update' });

    const { data: user, error } = await supabase
      .from('users')
      .update(update)
      .eq('id', session.user_id)
      .select('*')
      .single();
    if (error) return res.status(500).json({ error: 'Failed to update profile' });

    const { password_hash, login_attempts, locked_until, ...safeUser } = user as any;
    return res.status(200).json({ success: true, user: safeUser });
  } catch (error) {
    console.error('Update profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleLogin(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Identifier and password are required' });
    }

    // Find user by phone or email
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .or(`phone.eq.${identifier},email.eq.${identifier}`)
      .single();

    if (userError || !user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is active
    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

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
      return res.status(500).json({ error: 'Failed to create session' });
    }

    // Update last login
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', user.id);

    const { password_hash, login_attempts, locked_until, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      user: safeUser,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleSignup(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: 'Phone number is required' });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id, phone_verified')
      .eq('phone', phone)
      .single();

    if (existingUser && existingUser.phone_verified) {
      return res.status(400).json({ error: 'User already exists and verified' });
    }

    let userId = existingUser?.id;

    // Create user if doesn't exist
    if (!existingUser) {
      const { data: newUser, error: userError } = await supabase
        .from('users')
        .insert({
          phone,
          is_active: true,
          phone_verified: false,
          profile_completed: false
        })
        .select()
        .single();

      if (userError) {
        return res.status(500).json({ error: 'Failed to create user' });
      }

      userId = newUser.id;
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Delete any existing verification codes for this user
    await supabase
      .from('phone_verifications')
      .delete()
      .eq('user_id', userId);

    // Create new verification record
    const { error: verificationError } = await supabase
      .from('phone_verifications')
      .insert({
        user_id: userId,
        phone,
        verification_code: verificationCode,
        expires_at: expiresAt.toISOString(),
        ip_address: getClientIP(req),
        user_agent: req.headers['user-agent']
      });

    if (verificationError) {
      return res.status(500).json({ error: 'Failed to create verification' });
    }

    // Send WhatsApp verification
    try {
      const result = await whatsappService.sendVerificationCode(phone, verificationCode);
      if (!result.success) {
        console.error('WhatsApp send failed:', result.error);
      }
    } catch (whatsappError) {
      console.error('WhatsApp error:', whatsappError);
    }

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to WhatsApp',
      user_id: userId,
      expires_at: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleVerifyPhone(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, verification_code } = req.body;

    if (!user_id || !verification_code) {
      return res.status(400).json({ error: 'User ID and verification code are required' });
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
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Check if expired
    if (new Date(verification.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired' });
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
      return res.status(500).json({ error: 'Failed to verify phone' });
    }

    // Create session
    const sessionToken = generateSessionToken();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: expiresAt.toISOString(),
        ip_address: getClientIP(req),
        user_agent: req.headers['user-agent']
      });

    const { password_hash, login_attempts, locked_until, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Phone verified successfully',
      user: safeUser,
      session_token: sessionToken,
      expires_at: expiresAt.toISOString(),
      next_step: 'complete_profile'
    });
  } catch (error) {
    console.error('Verification error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleCompleteProfile(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { user_id, name, email, password } = req.body;

    if (!user_id || !name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Update user profile
    const { data: user, error: userError } = await supabase
      .from('users')
      .update({
        name,
        email,
        password_hash: passwordHash,
        profile_completed: true,
        profile_completed_at: new Date().toISOString()
      })
      .eq('id', user_id)
      .select()
      .single();

    if (userError) {
      return res.status(500).json({ error: 'Failed to complete profile' });
    }

    const { password_hash, login_attempts, locked_until, ...safeUser } = user;

    return res.status(200).json({
      success: true,
      message: 'Profile completed successfully',
      user: safeUser
    });
  } catch (error) {
    console.error('Complete profile error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleValidateSession(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { session_token } = req.body;

    if (!session_token) {
      return res.status(400).json({ error: 'Session token is required' });
    }

    const { data: session, error: sessionError } = await supabase
      .from('user_sessions')
      .select(`
        *,
        users (
          id, phone, email, name, is_admin, is_active, 
          phone_verified, profile_completed
        )
      `)
      .eq('session_token', session_token)
      .eq('is_active', true)
      .single();

    if (sessionError || !session) {
      return res.status(401).json({ error: 'Invalid session' });
    }

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      return res.status(401).json({ error: 'Session expired' });
    }

    return res.status(200).json({
      success: true,
      user: session.users
    });
  } catch (error) {
    console.error('Validate session error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleLogout(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { session_token } = req.body;

    if (session_token) {
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('session_token', session_token);
    }

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleWhatsAppConfirm(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, whatsapp, name } = req.body;

    if (!email || !whatsapp) {
      return res.status(400).json({ error: 'Email and WhatsApp number are required' });
    }

    // For now, return a basic response - this can be extended based on specific needs
    return res.status(200).json({
      success: true,
      message: 'WhatsApp confirmation initiated',
      data: { email, whatsapp, name }
    });
  } catch (error) {
    console.error('WhatsApp confirm error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

async function handleTestWhatsApp(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, phoneNumber } = req.body;

    if (!message || !phoneNumber) {
      return res.status(400).json({ 
        success: false, 
        error: 'Message and phone number are required' 
      });
    }

    const result = await whatsappService.sendMessage({
      phone: phoneNumber,
      message: message
    });
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('WhatsApp test error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send WhatsApp message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function handleSendWelcome(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, phone, email } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ 
        success: false, 
        error: 'Name and phone number are required' 
      });
    }

    const result = await whatsappService.sendWelcomeMessage(name, phone, email);
    
    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Welcome message error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Failed to send welcome message',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
