// WhatsApp Authentication Confirmation Verification
// Verifies the confirmation token and creates the user account

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;

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
      return res.status(400).json({ error: 'Confirmation token is required' });
    }

    // Find pending confirmation
    const { data: confirmation, error: findError } = await supabase
      .from('auth_confirmations')
      .select('*')
      .eq('confirmation_token', token)
      .eq('confirmed', false)
      .single();

    if (findError || !confirmation) {
      return res.status(400).json({ 
        error: 'Token konfirmasi tidak valid atau sudah expired' 
      });
    }

    // Check if token is expired
    const now = new Date();
    const expiresAt = new Date(confirmation.expires_at);
    
    if (now > expiresAt) {
      return res.status(400).json({ 
        error: 'Token konfirmasi sudah expired. Silakan daftar ulang.' 
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabase.auth.admin.getUserByEmail(confirmation.email);
    
    if (existingUser.user) {
      // Mark as confirmed
      await supabase
        .from('auth_confirmations')
        .update({ 
          confirmed: true, 
          confirmed_at: new Date().toISOString() 
        })
        .eq('confirmation_token', token);

      return res.status(200).json({
        success: true,
        message: 'Akun sudah ada dan telah dikonfirmasi',
        userExists: true
      });
    }

    // Generate temporary password for the user
    const tempPassword = generateSecurePassword();

    // Create user account via Supabase Admin API
    const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
      email: confirmation.email,
      password: tempPassword,
      email_confirm: true, // Skip email confirmation since we're doing WhatsApp
      user_metadata: {
        name: confirmation.name,
        whatsapp: confirmation.whatsapp,
        confirmed_via: 'whatsapp',
        confirmed_at: new Date().toISOString()
      }
    });

    if (createError) {
      console.error('User creation error:', createError);
      return res.status(500).json({ 
        error: 'Gagal membuat akun pengguna' 
      });
    }

    // Mark confirmation as completed
    await supabase
      .from('auth_confirmations')
      .update({ 
        confirmed: true, 
        confirmed_at: new Date().toISOString(),
        user_id: newUser.user.id
      })
      .eq('confirmation_token', token);

    // Send welcome message with temporary password
    await sendWelcomeMessage(confirmation.whatsapp, confirmation.name, confirmation.email, tempPassword);

    res.status(200).json({
      success: true,
      message: 'Akun berhasil dikonfirmasi! Password sementara telah dikirim via WhatsApp.',
      userId: newUser.user.id
    });

  } catch (error) {
    console.error('Confirmation verification error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

function generateSecurePassword(): string {
  // Generate a secure random password
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 12; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

async function sendWelcomeMessage(whatsapp: string, name: string, email: string, tempPassword: string) {
  const apiKey = process.env.REACT_APP_WHATSAPP_API_KEY;
  const apiUrl = process.env.REACT_APP_WHATSAPP_API_URL;

  if (!apiKey || !apiUrl) {
    console.error('WhatsApp API not configured');
    return;
  }

  const formattedPhone = whatsapp.startsWith('8') ? `62${whatsapp}` : whatsapp;

  const message = `🎉 *Selamat Datang di JB Alwikobra!*

Halo ${name}! 👋

Akun Anda telah berhasil dikonfirmasi dan aktif! 🎮

📧 *Email:* ${email}
🔐 *Password Sementara:* \`${tempPassword}\`

⚠️ *PENTING:* 
Silakan login dan ubah password Anda segera untuk keamanan.

🚀 *Sekarang Anda bisa:*
✅ Berbelanja game account premium
✅ Menyimpan wishlist favorit  
✅ Tracking riwayat pesanan
✅ Mendapat notifikasi WhatsApp otomatis

🔗 *Login sekarang:*
${process.env.REACT_APP_SITE_URL || 'https://jbalwikobra.com'}/auth

---
🎮 *JB Alwikobra E-commerce*
Premium Game Accounts & Services`;

  try {
    await fetch(`${apiUrl}/send_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_no: formattedPhone,
        key: apiKey,
        message: message
      })
    });
  } catch (error) {
    console.error('Failed to send welcome message:', error);
  }
}
