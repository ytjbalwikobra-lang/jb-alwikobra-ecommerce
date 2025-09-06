// Test the React app's WhatsApp API endpoint
const fetch = require('node-fetch');

const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m'
};

function log(color, ...args) {
  console.log(color + args.join(' ') + colors.reset);
}

async function testReactWhatsAppAPI() {
  log(colors.cyan, '\n🧪 TESTING REACT APP WHATSAPP API');
  log(colors.cyan, '='.repeat(50));

  const baseUrl = 'http://localhost:3000';
  const testPhone = '6281234567999';
  
  try {
    log(colors.cyan, '\n1️⃣  Testing dynamic WhatsApp API endpoint...');
    
    const response = await fetch(`${baseUrl}/api/test-whatsapp-dynamic`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: testPhone,
        testType: 'verification'
      }),
    });

    const data = await response.json();
    
    log(colors.cyan, `📊 Response status: ${response.status}`);
    log(colors.cyan, `📥 Response:`, JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      log(colors.green, '\n🎉 SUCCESS! React app WhatsApp API is working!');
      log(colors.green, `📱 Message sent via: ${data.details?.provider || 'Unknown provider'}`);
      log(colors.green, `📧 Message ID: ${data.details?.messageId || 'Not provided'}`);
      log(colors.green, `⚡ Response time: ${data.details?.responseTime || 'Not provided'}`);
      log(colors.green, `📝 Log ID: ${data.details?.logId || 'Not provided'}`);
    } else {
      log(colors.red, '\n❌ FAILED! API endpoint not working properly');
      log(colors.red, `💬 Error: ${data.error || data.message || 'Unknown error'}`);
    }

    log(colors.cyan, '\n2️⃣  Now you can test through the browser...');
    log(colors.cyan, '🌐 Open: http://localhost:3000/admin/whatsapp-test');
    log(colors.cyan, '📱 Enter a real phone number and click "Test API"');

  } catch (error) {
    log(colors.red, '\n❌ Test failed with error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      log(colors.yellow, '💡 Make sure your React dev server is running on port 3000');
      log(colors.yellow, '   Run: npm start');
    } else if (error.message.includes('fetch')) {
      log(colors.yellow, '💡 The API endpoint might not be available in development mode');
      log(colors.yellow, '   Try testing directly through the browser at /admin/whatsapp-test');
    }
  }

  log(colors.cyan, '\n' + '='.repeat(50));
  log(colors.cyan, '📋 TESTING CHECKLIST:');
  log(colors.cyan, '1. ✅ Direct WhatsApp API test passed');
  log(colors.cyan, '2. 📝 React app API endpoint test');
  log(colors.cyan, '3. 🌐 Browser testing at /admin/whatsapp-test');
  log(colors.cyan, '4. 📱 Test with your real phone number');
}

testReactWhatsAppAPI();
