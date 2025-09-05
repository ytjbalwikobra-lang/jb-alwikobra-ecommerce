// Test endpoint for WhatsApp API key
// Usage: POST /api/test-whatsapp with { "phone": "6281234567890" }

import type { VercelRequest, VercelResponse } from '@vercel/node';

interface TestResult {
  provider: string;
  success: boolean;
  response?: any;
  error?: string;
  endpoint?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { apiKey, phoneNumber } = req.body;

  if (!apiKey || !phoneNumber) {
    return res.status(400).json({ 
      error: 'API key and phone number are required' 
    });
  }

  const testMessage = `🧪 Test WhatsApp API dari JB Alwikobra E-commerce

Ini adalah test notifikasi menggunakan Woo-wa.com
API Key: ${apiKey.substring(0, 8)}...
Waktu: ${new Date().toLocaleString('id-ID')}

Jika Anda menerima pesan ini, konfigurasi berhasil! ✅`;

  const results: TestResult[] = [];

  // Test Woo-wa.com API (NotifAPI)
  await testWoowaAPI(apiKey, phoneNumber, testMessage, results);

  // Return results
  res.status(200).json({
    success: results.some(result => result.success),
    results,
    message: results.some(result => result.success) 
      ? 'API key berhasil ditest dengan Woo-wa.com!' 
      : 'API key tidak berhasil. Periksa konfigurasi atau status device.'
  });
}

async function testWoowaAPI(
  apiKey: string, 
  phoneNumber: string, 
  message: string, 
  results: TestResult[]
) {
  const API_BASE_URL = 'https://notifapi.com';
  
  try {
    console.log('🧪 Testing Woo-wa.com API...');

    // First check device status
    const statusResponse = await fetch(`${API_BASE_URL}/qr_status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: apiKey
      })
    });

    const statusData = await statusResponse.json();
    console.log('📱 Device status:', statusData);

    // Check if device is connected
    if (statusData.account_status !== 'authenticated' && statusData.status !== 'authenticated') {
      results.push({
        provider: 'Woo-wa.com (NotifAPI)',
        success: false,
        error: 'WhatsApp device not connected. Please scan QR code first.',
        response: statusData,
        endpoint: API_BASE_URL
      });
      return;
    }

    // Try to send test message
    const messageResponse = await fetch(`${API_BASE_URL}/send_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_no: phoneNumber,
        key: apiKey,
        message: message
      })
    });

    const messageData = await messageResponse.json();
    console.log('📩 Message response:', messageData);

    if (messageResponse.ok && messageData.status === 'success') {
      results.push({
        provider: 'Woo-wa.com (NotifAPI)',
        success: true,
        response: messageData,
        endpoint: API_BASE_URL
      });
    } else {
      results.push({
        provider: 'Woo-wa.com (NotifAPI)',
        success: false,
        error: messageData.message || messageData.error || 'Failed to send message',
        response: messageData,
        endpoint: API_BASE_URL
      });
    }

    // Also test async send for comparison
    const asyncResponse = await fetch(`${API_BASE_URL}/async_send_message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        phone_no: phoneNumber,
        key: apiKey,
        message: `${message}

(Async method test)`
      })
    });

    const asyncData = await asyncResponse.json();
    console.log('📩 Async message response:', asyncData);

  } catch (error) {
    console.error('❌ Error testing Woo-wa API:', error);
    results.push({
      provider: 'Woo-wa.com (NotifAPI)',
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      endpoint: API_BASE_URL
    });
  }
}
