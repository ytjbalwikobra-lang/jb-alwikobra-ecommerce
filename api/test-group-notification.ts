import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, productName, amount, customerName, customerPhone, status, paymentMethod } = req.body;

  if (!orderId || !productName || !amount || !customerName || !customerPhone || !status) {
    return res.status(400).json({ 
      error: 'Missing required fields: orderId, productName, amount, customerName, customerPhone, status' 
    });
  }

  try {
    // Test group notification using Woo-wa.com API
    const API_KEY = 'f104a4c19ea118dd464e9de20605c4e5';
    const GROUP_ID = '120363421819020887@g.us'; // ORDERAN WEBSITE group
    const API_BASE_URL = 'https://notifapi.com';

    // Generate order group notification message
    const statusEmoji = {
      pending: '🟡',
      paid: '🟢',
      completed: '🎉',
      cancelled: '🔴'
    };

    const statusText = {
      pending: 'ORDER BARU - MENUNGGU BAYAR',
      paid: 'PEMBAYARAN BERHASIL',
      completed: 'ORDER SELESAI',
      cancelled: 'ORDER DIBATALKAN'
    };

    const currentDate = new Date().toLocaleString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const message = `${statusEmoji[status as keyof typeof statusEmoji]} *${statusText[status as keyof typeof statusText]}*

📋 *DETAIL ORDER:*
• ID: #${orderId}
• Produk: ${productName}
• Total: Rp ${amount.toLocaleString('id-ID')}
• Customer: ${customerName}
• Phone: ${customerPhone}
${paymentMethod ? `• Payment: ${paymentMethod}` : ''}
• Waktu: ${currentDate}

${status === 'paid' 
  ? '🎮 *ACTION REQUIRED:* Segera proses akun game untuk customer!'
  : status === 'pending'
  ? '💳 *STATUS:* Menunggu konfirmasi pembayaran customer'
  : status === 'completed'
  ? '✅ *STATUS:* Akun sudah berhasil dikirim ke customer'
  : '❌ *STATUS:* Order dibatalkan atau refund'
}

---
📊 *ORDERAN WEBSITE - JB ALWIKOBRA*`;

    // Send to WhatsApp group
    const response = await fetch(`${API_BASE_URL}/send_message_group_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        group_id: GROUP_ID,
        key: API_KEY,
        message: message
      })
    });

    const data = await response.json();

    if (response.ok && data.status === 'success') {
      res.status(200).json({
        success: true,
        message: 'Group notification sent successfully!',
        response: data,
        groupId: GROUP_ID,
        orderData: { orderId, productName, amount, customerName, customerPhone, status }
      });
    } else {
      res.status(400).json({
        success: false,
        error: data.message || data.error || 'Failed to send group notification',
        response: data
      });
    }

  } catch (error) {
    console.error('Error sending group notification:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server error'
    });
  }
}
