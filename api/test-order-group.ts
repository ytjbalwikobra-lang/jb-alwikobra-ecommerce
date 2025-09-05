import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { orderId, customerName, productName, amount } = req.body;

  if (!orderId || !customerName || !productName || !amount) {
    return res.status(400).json({ 
      error: 'Missing required fields: orderId, customerName, productName, amount' 
    });
  }

  const API_BASE_URL = 'https://notifapi.com';
  const API_KEY = 'f104a4c19ea118dd464e9de20605c4e5';
  const GROUP_ID = '120363421819020887@g.us'; // ORDERAN WEBSITE group

  // Generate order notification message
  const message = `🎮 **ORDERAN BARU - JB ALWIKOBRA**

👤 **Customer:** ${customerName}
📋 **Order ID:** ${orderId}
🎯 **Produk:** ${productName}
💰 **Total:** Rp ${parseInt(amount).toLocaleString('id-ID')}
📅 **Waktu:** ${new Date().toLocaleString('id-ID')}
✅ **Status:** PAID - Siap diproses

---
🚀 **ACTION REQUIRED:**
• Tim processing segera handle order ini
• Estimasi delivery: 1x24 jam
• Update status setelah akun dikirim

📊 **Dashboard:** https://jbalwikobra.com/admin
💬 **Support:** wa.me/6289653510125

#OrderBaru #Paid #${orderId}`;

  try {
    // Send notification to group
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
    console.log('Group notification response:', data);

    if (response.ok && data.code === 200) {
      res.status(200).json({
        success: true,
        message: 'Group notification sent successfully!',
        messageId: data.results?.id_message,
        response: data
      });
    } else {
      res.status(400).json({
        success: false,
        error: 'Failed to send group notification',
        response: data
      });
    }
  } catch (error) {
    console.error('Error sending group notification:', error);
    res.status(500).json({
      success: false,
      error: 'Network error occurred',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
