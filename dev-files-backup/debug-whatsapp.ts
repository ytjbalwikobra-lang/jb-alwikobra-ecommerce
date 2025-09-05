export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    // Test the WhatsApp API directly
    const API_BASE_URL = 'https://notifapi.com';
    const API_KEY = 'f104a4c19ea118dd464e9de20605c4e5';
    const GROUP_ID = '120363421819020887@g.us'; // ORDERAN WEBSITE group

    const testMessage = `🧪 **TEST NOTIFICATION** 

📅 **Time:** ${new Date().toLocaleString('id-ID')}
💬 **Message:** Testing WhatsApp notification system
🔧 **Status:** API connection test

This is a test message to verify WhatsApp notifications are working.

#TestNotification #${Date.now()}`;

    console.log('🚀 Sending test WhatsApp notification...');
    console.log('API URL:', `${API_BASE_URL}/send_message_group_id`);
    console.log('Group ID:', GROUP_ID);
    console.log('Message length:', testMessage.length);

    const response = await fetch(`${API_BASE_URL}/send_message_group_id`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        group_id: GROUP_ID,
        key: API_KEY,
        message: testMessage
      })
    });

    const result = await response.json();
    
    console.log('📤 WhatsApp API Response:', {
      status: response.status,
      ok: response.ok,
      result: result
    });

    if (response.ok && result.code === 200) {
      console.log(`✅ Test notification sent successfully: ${result.results?.id_message}`);
      return res.status(200).json({ 
        success: true, 
        message: 'Test notification sent successfully',
        messageId: result.results?.id_message,
        response: result
      });
    } else {
      console.error('❌ Failed to send test notification:', result);
      return res.status(400).json({ 
        success: false, 
        message: 'Failed to send test notification',
        error: result
      });
    }
  } catch (error: any) {
    console.error('💥 Error in WhatsApp test:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error',
      error: error?.message || String(error)
    });
  }
}
