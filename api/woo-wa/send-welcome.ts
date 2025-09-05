// Welcome message sender via Woo-wa API
// Used for new user registration welcome messages

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface WelcomeRequest {
  name: string;
  whatsapp: string;
  email?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, whatsapp, email }: WelcomeRequest = req.body;

    if (!name || !whatsapp) {
      return res.status(400).json({ 
        error: 'Name and WhatsApp number are required' 
      });
    }

    const result = await sendWelcomeMessage(name, whatsapp, email);

    if (result.success) {
      res.status(200).json({
        success: true,
        message: 'Welcome message sent successfully',
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send welcome message',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Welcome message error:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

async function sendWelcomeMessage(name: string, whatsapp: string, email?: string) {
  const apiKey = process.env.REACT_APP_WHATSAPP_API_KEY;
  const apiUrl = process.env.REACT_APP_WHATSAPP_API_URL;

  if (!apiKey || !apiUrl) {
    return { success: false, error: 'WhatsApp API not configured' };
  }

  const formattedPhone = whatsapp.startsWith('8') ? `62${whatsapp}` : whatsapp;

  const message = `🎮 *Selamat Datang di JB Alwikobra!*

Halo ${name}! 👋

Terima kasih telah bergabung dengan JB Alwikobra E-commerce - tempat terpercaya untuk game account premium!

🚀 *Sekarang Anda bisa:*
✅ Berbelanja game account terbaik
✅ Menyimpan wishlist favorit
✅ Tracking riwayat pesanan
✅ Mendapat notifikasi WhatsApp otomatis

🎯 *Fitur Unggulan:*
• Game account berkualitas tinggi
• Proses cepat & aman
• Support 24/7 via WhatsApp
• Garansi kepuasan pelanggan

📱 *Mulai belanja sekarang:*
${process.env.REACT_APP_SITE_URL || 'https://jbalwikobra.com'}

${email ? `📧 Email terdaftar: ${email}` : ''}

---
🎮 *JB Alwikobra E-commerce*
Premium Game Accounts & Services

Ada pertanyaan? Balas pesan ini! 💬`;

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