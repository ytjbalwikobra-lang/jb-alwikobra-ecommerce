// Test the complete signup flow with WhatsApp verification
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

async function testSignupFlow() {
  log(colors.cyan, '\n🧪 TESTING COMPLETE SIGNUP FLOW WITH WHATSAPP');
  log(colors.cyan, '='.repeat(50));

  const baseUrl = 'http://localhost:3000/api'; // Adjust if your API is on different port
  const testPhone = '6281234567999'; // Use a real phone number for actual testing
  
  try {
    // Test 1: Request WhatsApp login (send magic link)
    log(colors.cyan, '\n1️⃣  Testing WhatsApp login request...');
    
    const loginResponse = await fetch(`${baseUrl}/auth/whatsapp-login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        whatsapp: testPhone,
        name: 'Test User'
      }),
    });

    const loginData = await loginResponse.json();
    
    log(colors.cyan, `📊 Response status: ${loginResponse.status}`);
    log(colors.cyan, `📥 Response:`, JSON.stringify(loginData, null, 2));

    if (loginResponse.ok && loginData.success) {
      log(colors.green, '✅ WhatsApp login request successful!');
      log(colors.green, `📱 Magic link sent to: ${testPhone}`);
      log(colors.green, `🔗 Token: ${loginData.token ? 'Generated' : 'Missing'}`);
      
      // Test 2: Try to verify magic link (this will fail without real token from WhatsApp)
      log(colors.cyan, '\n2️⃣  Testing magic link verification...');
      log(colors.yellow, '💡 Note: This will fail without a real magic link token from WhatsApp message');
      
      const verifyResponse = await fetch(`${baseUrl}/auth/verify-magic-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: 'test-token-123' // This is a dummy token for testing
        }),
      });

      const verifyData = await verifyResponse.json();
      
      log(colors.cyan, `📊 Response status: ${verifyResponse.status}`);
      log(colors.cyan, `📥 Response:`, JSON.stringify(verifyData, null, 2));

      if (verifyResponse.ok && verifyData.success) {
        log(colors.green, '✅ Magic link verification successful!');
        log(colors.green, `👤 User logged in: ${verifyData.user?.name}`);
      } else {
        log(colors.yellow, '⚠️  Magic link verification failed (expected with test token)');
        log(colors.cyan, '💡 This is normal since we used a dummy token');
      }
      
    } else {
      log(colors.red, '❌ WhatsApp login request failed');
      log(colors.red, `💬 Error: ${loginData.error || 'Unknown error'}`);
    }

    // Test 3: Check message logs
    log(colors.cyan, '\n3️⃣  Checking recent message logs...');
    
    const logsResponse = await fetch(`${baseUrl}/admin/whatsapp-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (logsResponse.ok) {
      const logsData = await logsResponse.json();
      log(colors.green, '✅ Message logs accessible');
      log(colors.cyan, `📊 Recent messages: ${logsData.statistics?.total_messages || 0}`);
    } else {
      log(colors.yellow, '⚠️  Could not access message logs (check admin authentication)');
    }

  } catch (error) {
    log(colors.red, '❌ Test failed with error:', error.message);
    log(colors.yellow, '💡 Make sure your dev server is running: npm start');
  }

  log(colors.cyan, '\n' + '='.repeat(50));
  log(colors.cyan, '📝 COMPLETE TESTING CHECKLIST:');
  log(colors.cyan, '1. ✅ Direct WhatsApp API working');
  log(colors.cyan, '2. 📝 Test signup flow (run this script)');
  log(colors.cyan, '3. 📱 Test with real phone number');
  log(colors.cyan, '4. 🎮 Test in React app frontend');
  log(colors.cyan, '5. 📊 Monitor admin dashboard');
}

testSignupFlow();
