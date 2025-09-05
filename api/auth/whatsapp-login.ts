// WhatsApp Authentication API - Send Magic Link
// This handles user signup/login by sending magic links via WhatsApp

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

// Use service key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

interface AuthRequest {
  whatsapp: string;
  name?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { whatsapp, name }: AuthRequest = req.body;

    if (!whatsapp) {
      return res.status(400).json({ error: 'WhatsApp number is required' });
    }

    // Validate WhatsApp format (Indonesian)
    const whatsappRegex = /^62[0-9]{9,13}$/;
    if (!whatsappRegex.test(whatsapp)) {
      return res.status(400).json({ 
        error: 'Invalid WhatsApp format. Use format: 62xxxxxxxxx' 
      });
    }

    // Step 1: Check if user exists or create new user
    let user;
    const { data: existingUser } = await supabase
      .from('whatsapp_users')
      .select('*')
      .eq('whatsapp', whatsapp)
      .single();

    if (existingUser) {
      // User exists - update last login
      const { data: updatedUser, error: updateError } = await supabase
        .from('whatsapp_users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', existingUser.id)
        .select()
        .single();
      
      if (updateError) {
        console.error('Error updating user:', updateError);
        return res.status(500).json({ error: 'Failed to update user' });
      }
      
      user = updatedUser;
    } else {
      // New user - create account
      if (!name) {
        return res.status(400).json({ error: 'Name is required for new users' });
      }
      
      const { data: newUser, error: createError } = await supabase
        .from('whatsapp_users')
        .insert({
          whatsapp,
          name,
          is_active: true,
          last_login_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (createError) {
        console.error('Error creating user:', createError);
        return res.status(500).json({ error: 'Failed to create user' });
      }
      
      user = newUser;
    }    // Generate magic link
    const authToken = crypto.randomBytes(32).toString('hex');
    const magicLink = `${process.env.REACT_APP_SITE_URL || 'https://jbalwikobra.com'}/auth/verify?token=${authToken}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Store auth session
    const { error: sessionError } = await supabase
      .from('whatsapp_auth_sessions')
      .insert({
        user_id: user.id,
        whatsapp,
        auth_token: authToken,
        magic_link: magicLink,
        expires_at: expiresAt.toISOString(),
        ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
        user_agent: req.headers['user-agent']
      });

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return res.status(500).json({ error: 'Failed to create auth session' });
    }

    // Send WhatsApp magic link
    const whatsappResult = await sendWhatsAppMagicLink(whatsapp, user.name, magicLink, !existingUser);

    if (whatsappResult.success) {
      res.status(200).json({
        success: true,
        message: 'Magic link sent to WhatsApp',
        isNewUser: !existingUser,
        userId: user.id
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send WhatsApp message',
        details: whatsappResult.error
      });
    }

  } catch (error) {
    console.error('WhatsApp auth error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function sendWhatsAppMagicLink(whatsapp: string, name: string, magicLink: string, isNewUser: boolean) {
  const apiKey = process.env.REACT_APP_WHATSAPP_API_KEY;
  const apiUrl = process.env.REACT_APP_WHATSAPP_API_URL;

  if (!apiKey || !apiUrl) {
    return { success: false, error: 'WhatsApp API not configured' };
  }

  const welcomeText = isNewUser ? 
    `🎉 *Selamat datang di JB Alwikobra!*\n\nHalo ${name}! Akun Anda telah berhasil dibuat.` :
    `👋 *Selamat datang kembali!*\n\nHalo ${name}!`;

  const message = `${welcomeText}

🔐 *Klik link berikut untuk masuk:*
${magicLink}

⏰ *Link ini berlaku selama 15 menit*

Setelah masuk, Anda dapat:
✅ Berbelanja game account premium
✅ Menyimpan wishlist favorit
✅ Tracking riwayat pesanan  
✅ Mendapat notifikasi otomatis

🔒 *Keamanan:* Link ini hanya berlaku sekali dan akan expire otomatis.

---
🎮 *JB Alwikobra E-commerce*
Premium Game Accounts & Services`;

  try {
    const response = await fetch(`${apiUrl}/send_message`, {
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

    const result = await response.json();

    if (result.status === 'sent' || result.results?.status === 'sent') {
      return {
        success: true,
        messageId: result.results?.id_message || result.id_message || result.message_id
      };
    } else {
      return {
        success: false,
        error: result.message || 'Failed to send WhatsApp message'
      };
    }

  } catch (error) {
    console.error('WhatsApp API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error'
    };
  }
}
