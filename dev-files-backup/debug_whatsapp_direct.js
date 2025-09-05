// Direct WhatsApp API test
async function testWhatsAppAPI() {
  const API_BASE_URL = 'https://notifapi.com';
  const API_KEY = 'f104a4c19ea118dd464e9de20605c4e5';
  const GROUP_ID = '120363421819020887@g.us'; // ORDERAN WEBSITE group

  const testMessage = `🧪 **DIRECT API TEST** 

📅 **Time:** ${new Date().toLocaleString('id-ID')}
💬 **Message:** Testing WhatsApp API directly from debug script
🔧 **Status:** Connection test
⚡ **Source:** Debug script

This is a direct API test to verify WhatsApp notifications work.

#DirectTest #${Date.now()}`;

  console.log('🚀 Testing WhatsApp API...');
  console.log('API URL:', `${API_BASE_URL}/send_message_group_id`);
  console.log('Group ID:', GROUP_ID);
  console.log('Message preview:', testMessage.substring(0, 100) + '...');

  try {
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

    console.log('📤 Response status:', response.status);
    const result = await response.json();
    console.log('📤 Response body:', JSON.stringify(result, null, 2));

    if (response.ok && result.code === 200) {
      console.log(`✅ WhatsApp message sent successfully!`);
      console.log(`📱 Message ID: ${result.results?.id_message}`);
      return { success: true, messageId: result.results?.id_message };
    } else {
      console.error('❌ WhatsApp API failed:', result);
      return { success: false, error: result };
    }
  } catch (error) {
    console.error('💥 Network error:', error);
    return { success: false, error: error.message };
  }
}

// Run the test
testWhatsAppAPI().then(result => {
  console.log('\n🏁 Final result:', result);
});
