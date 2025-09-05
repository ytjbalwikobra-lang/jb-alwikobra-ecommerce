// WhatsApp Magic Link Verification API
// This verifies the magic link and creates a user session

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
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
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Auth token is required' });
    }

    // Find the auth session
    const { data: authSession, error: sessionError } = await supabase
      .from('whatsapp_auth_sessions')
      .select(`
        *,
        whatsapp_users (*)
      `)
      .eq('auth_token', token)
      .eq('is_used', false)
      .single();

    if (sessionError || !authSession) {
      return res.status(400).json({ 
        error: 'Invalid or expired auth token' 
      });
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(authSession.expires_at);
    
    if (now > expiresAt) {
      return res.status(400).json({ 
        error: 'Auth token has expired. Please request a new login link.' 
      });
    }

    // Mark auth session as used
    await supabase
      .from('whatsapp_auth_sessions')
      .update({ 
        is_used: true, 
        used_at: new Date().toISOString() 
      })
      .eq('auth_token', token);

    // Get user data
    const user = authSession.whatsapp_users;
    
    if (!user || !user.is_active) {
      return res.status(400).json({ 
        error: 'User account is not active' 
      });
    }

    // Create JWT session token
    const sessionToken = jwt.sign(
      {
        userId: user.id,
        whatsapp: user.whatsapp,
        name: user.name,
        isAdmin: user.is_admin,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
      },
      jwtSecret
    );

    // Store session in database
    const sessionExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const { error: userSessionError } = await supabase
      .from('user_sessions')
      .insert({
        user_id: user.id,
        session_token: sessionToken,
        expires_at: sessionExpiresAt.toISOString(),
        ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        user_agent: req.headers['user-agent']
      });

    if (userSessionError) {
      console.error('User session creation error:', userSessionError);
      // Continue anyway, session is still valid via JWT
    }

    // Update user's last login
    await supabase
      .from('whatsapp_users')
      .update({ 
        last_login_at: new Date().toISOString(),
        login_attempts: 0 // Reset failed attempts
      })
      .eq('id', user.id);

    // Send welcome back message
    await sendWelcomeBackMessage(user.whatsapp, user.name);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        whatsapp: user.whatsapp,
        name: user.name,
        email: user.email,
        isAdmin: user.is_admin,
        avatarUrl: user.avatar_url,
        lastLoginAt: new Date().toISOString()
      },
      sessionToken,
      expiresAt: sessionExpiresAt.toISOString()
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function sendWelcomeBackMessage(whatsapp: string, name: string) {
  const apiKey = process.env.REACT_APP_WHATSAPP_API_KEY;
  const apiUrl = process.env.REACT_APP_WHATSAPP_API_URL;

  if (!apiKey || !apiUrl) {
    return;
  }

  const message = `✅ *Login Berhasil!*

Halo ${name}! 👋

Anda telah berhasil masuk ke akun JB Alwikobra.

🚀 *Mulai berbelanja sekarang:*
${process.env.REACT_APP_SITE_URL || 'https://jbalwikobra.com'}

🎮 *Produk Terbaru:*
• Game account premium
• Flash sale deals
• Exclusive offers

📱 *Tips:* Simpan situs kami di bookmark untuk akses lebih cepat!

---
🎮 *JB Alwikobra E-commerce*
Selamat berbelanja! 🛒`;

  try {
    await fetch(`${apiUrl}/send_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_no: whatsapp,
        key: apiKey,
        message: message
      })
    });
  } catch (error) {
    console.error('Failed to send welcome back message:', error);
  }
}
