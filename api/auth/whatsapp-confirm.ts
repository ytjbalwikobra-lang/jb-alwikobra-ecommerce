// WhatsApp Authentication Confirmation API
// Sends confirmation link via WhatsApp instead of email

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

interface WhatsAppConfirmRequest {
  email: string;
  whatsapp: string;
  name?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { email, whatsapp, name }: WhatsAppConfirmRequest = req.body;

    if (!email || !whatsapp) {
      return res.status(400).json({ 
        error: 'Email and WhatsApp number are required' 
      });
    }

    // Generate confirmation token
    const confirmationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store pending confirmation in database
    const { error: insertError } = await supabase
      .from('auth_confirmations')
      .insert({
        email,
        whatsapp,
        name: name || email.split('@')[0],
        confirmation_token: confirmationToken,
        expires_at: expiresAt.toISOString(),
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Database error:', insertError);
      return res.status(500).json({ error: 'Failed to store confirmation' });
    }

    // Create confirmation URL
    const confirmationUrl = `${process.env.REACT_APP_SITE_URL || 'https://jbalwikobra.com'}/auth/confirm?token=${confirmationToken}`;

    // Send WhatsApp confirmation message
    const whatsappResult = await sendWhatsAppConfirmation(whatsapp, name || email.split('@')[0], confirmationUrl);

    if (whatsappResult.success) {
      res.status(200).json({
        success: true,
        message: 'Konfirmasi telah dikirim via WhatsApp',
        messageId: whatsappResult.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Gagal mengirim konfirmasi via WhatsApp',
        details: whatsappResult.error
      });
    }

  } catch (error) {
    console.error('WhatsApp confirmation error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function sendWhatsAppConfirmation(whatsapp: string, name: string, confirmationUrl: string) {
  const apiKey = process.env.REACT_APP_WHATSAPP_API_KEY;
  const apiUrl = process.env.REACT_APP_WHATSAPP_API_URL;

  if (!apiKey || !apiUrl) {
    return { success: false, error: 'WhatsApp API tidak dikonfigurasi' };
  }

  // Format phone number
  const formattedPhone = whatsapp.startsWith('8') ? `62${whatsapp}` : whatsapp;

  const message = `🎮 *Konfirmasi Akun JB Alwikobra*

Halo ${name}! 👋

Terima kasih telah mendaftar di JB Alwikobra E-commerce. Untuk mengaktifkan akun Anda, silakan klik link konfirmasi di bawah ini:

🔗 *Link Konfirmasi:*
${confirmationUrl}

⏰ *Link berlaku selama 24 jam*

Setelah dikonfirmasi, Anda dapat:
✅ Berbelanja game account premium
✅ Menyimpan wishlist favorit
✅ Tracking riwayat pesanan
✅ Notifikasi WhatsApp otomatis

Jika Anda tidak merasa mendaftar, abaikan pesan ini.

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
        phone_no: formattedPhone,
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
