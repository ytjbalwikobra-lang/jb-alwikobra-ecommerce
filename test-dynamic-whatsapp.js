#!/usr/bin/env node

/**
 * Test WhatsApp Verification with Database-driven API Configuration
 * Tests the new dynamic WhatsApp system
 */

const fetch = require('node-fetch');

// Configuration
const API_BASE = process.env.API_BASE || 'http://localhost:3000';
const TEST_PHONE = '6281234567999';

// Colors for console output
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

function log(color, ...args) {
  console.log(color + args.join(' ') + colors.reset);
}

// Test the admin WhatsApp settings API
async function testAdminAPI() {
  log(colors.blue + colors.bright, '🔧 Testing Admin WhatsApp Settings API...');

  try {
    // Test getting providers
    log(colors.cyan, '📋 Getting providers...');
    const providersResponse = await fetch(`${API_BASE}/api/admin/whatsapp-settings?action=providers`);
    const providersData = await providersResponse.json();
    
    if (providersResponse.ok) {
      log(colors.green, '✅ Providers loaded:', providersData.providers?.length || 0);
      providersData.providers?.forEach(provider => {
        log(colors.cyan, `   - ${provider.display_name} (${provider.name}): ${provider.base_url}`);
      });
    } else {
      log(colors.red, '❌ Failed to get providers:', providersData.error);
      return false;
    }

    // Test getting API keys
    log(colors.cyan, '🔑 Getting API keys...');
    const keysResponse = await fetch(`${API_BASE}/api/admin/whatsapp-settings?action=keys`);
    const keysData = await keysResponse.json();
    
    if (keysResponse.ok) {
      log(colors.green, '✅ API keys loaded:', keysData.keys?.length || 0);
      keysData.keys?.forEach(key => {
        log(colors.cyan, `   - ${key.key_name}: ${key.api_key} (${key.is_active ? 'Active' : 'Inactive'})`);
      });
    } else {
      log(colors.red, '❌ Failed to get API keys:', keysData.error);
    }

    // Test adding a mock API key
    log(colors.cyan, '➕ Adding test API key...');
    const addKeyResponse = await fetch(`${API_BASE}/api/admin/whatsapp-settings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider_name: 'mock',
        key_name: 'Test Key',
        api_key: 'mock-key-for-testing',
        is_primary: true
      })
    });
    
    const addKeyData = await addKeyResponse.json();
    
    if (addKeyResponse.ok) {
      log(colors.green, '✅ Test API key added successfully');
      return addKeyData.key.id;
    } else {
      log(colors.yellow, '⚠️  API key add failed (might already exist):', addKeyData.error);
      return null;
    }

  } catch (error) {
    log(colors.red, '❌ Admin API test failed:', error.message);
    return false;
  }
}

// Test the signup flow with WhatsApp verification
async function testSignupFlow() {
  log(colors.blue + colors.bright, '📱 Testing Signup with WhatsApp Verification...');

  try {
    // Step 1: Signup
    log(colors.cyan, '1️⃣  Testing signup...');
    const signupResponse = await fetch(`${API_BASE}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone: TEST_PHONE,
        password: 'testpass123'
      })
    });

    const signupData = await signupResponse.json();
    
    if (signupResponse.ok) {
      log(colors.green, '✅ Signup successful:', signupData.message);
      log(colors.cyan, '📱 User ID:', signupData.user_id);
      log(colors.cyan, '📱 WhatsApp sent:', signupData.whatsapp_sent ? 'Yes' : 'No');
      
      // Step 2: Test verification (use a mock code)
      log(colors.cyan, '2️⃣  Testing phone verification...');
      const verifyResponse = await fetch(`${API_BASE}/api/auth/verify-phone`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: signupData.user_id,
          verification_code: '123456' // Mock code
        })
      });

      const verifyData = await verifyResponse.json();
      
      if (verifyResponse.ok) {
        log(colors.green, '✅ Phone verification successful');
        
        // Step 3: Complete profile
        log(colors.cyan, '3️⃣  Testing profile completion...');
        const completeResponse = await fetch(`${API_BASE}/api/auth/complete-profile`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${verifyData.session_token}`
          },
          body: JSON.stringify({
            email: 'test@example.com',
            name: 'Test User'
          })
        });

        const completeData = await completeResponse.json();
        
        if (completeResponse.ok) {
          log(colors.green, '✅ Profile completion successful');
          log(colors.green, '🎉 Complete signup flow works!');
          return true;
        } else {
          log(colors.red, '❌ Profile completion failed:', completeData.error);
        }
      } else {
        log(colors.red, '❌ Phone verification failed:', verifyData.error);
      }
    } else {
      log(colors.red, '❌ Signup failed:', signupData.error);
    }

    return false;

  } catch (error) {
    log(colors.red, '❌ Signup flow test failed:', error.message);
    return false;
  }
}

// Test message logs
async function testMessageLogs() {
  log(colors.blue + colors.bright, '📊 Testing Message Logs...');

  try {
    const logsResponse = await fetch(`${API_BASE}/api/admin/whatsapp-settings?action=logs&limit=10`);
    const logsData = await logsResponse.json();
    
    if (logsResponse.ok) {
      log(colors.green, '✅ Message logs loaded:', logsData.logs?.length || 0);
      
      logsData.logs?.slice(0, 3).forEach((logEntry, index) => {
        log(colors.cyan, `   ${index + 1}. ${logEntry.phone_number} - ${logEntry.success ? 'Success' : 'Failed'} - ${logEntry.context_type || 'Unknown'}`);
      });
      
      return true;
    } else {
      log(colors.red, '❌ Failed to get logs:', logsData.error);
      return false;
    }

  } catch (error) {
    log(colors.red, '❌ Message logs test failed:', error.message);
    return false;
  }
}

// Test statistics
async function testStatistics() {
  log(colors.blue + colors.bright, '📈 Testing Statistics...');

  try {
    const statsResponse = await fetch(`${API_BASE}/api/admin/whatsapp-settings?action=stats`);
    const statsData = await statsResponse.json();
    
    if (statsResponse.ok) {
      const stats = statsData.stats;
      log(colors.green, '✅ Statistics loaded:');
      log(colors.cyan, `   📊 Total Messages: ${stats.totalMessages}`);
      log(colors.cyan, `   ✅ Successful: ${stats.successfulMessages}`);
      log(colors.cyan, `   📅 Today: ${stats.todayMessages}`);
      log(colors.cyan, `   📈 Success Rate: ${stats.successRate}%`);
      log(colors.cyan, `   ⚡ Avg Response Time: ${stats.avgResponseTime}ms`);
      
      return true;
    } else {
      log(colors.red, '❌ Failed to get statistics:', statsData.error);
      return false;
    }

  } catch (error) {
    log(colors.red, '❌ Statistics test failed:', error.message);
    return false;
  }
}

// Main test function
async function runTests() {
  console.log('');
  log(colors.magenta + colors.bright, '=' * 80);
  log(colors.magenta + colors.bright, '🧪 DYNAMIC WHATSAPP VERIFICATION TEST SUITE');
  log(colors.magenta + colors.bright, '=' * 80);
  console.log('');

  const results = {
    adminAPI: false,
    signupFlow: false,
    messageLogs: false,
    statistics: false
  };

  // Test admin API
  results.adminAPI = await testAdminAPI();
  console.log('');

  // Test signup flow
  results.signupFlow = await testSignupFlow();
  console.log('');

  // Test message logs
  results.messageLogs = await testMessageLogs();
  console.log('');

  // Test statistics
  results.statistics = await testStatistics();
  console.log('');

  // Summary
  log(colors.magenta + colors.bright, '=' * 80);
  log(colors.magenta + colors.bright, '📊 TEST RESULTS SUMMARY');
  log(colors.magenta + colors.bright, '=' * 80);

  const passed = Object.values(results).filter(Boolean).length;
  const total = Object.keys(results).length;

  Object.entries(results).forEach(([test, passed]) => {
    const icon = passed ? '✅' : '❌';
    const color = passed ? colors.green : colors.red;
    log(color, `${icon} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
  });

  console.log('');
  
  if (passed === total) {
    log(colors.green + colors.bright, `🎉 All tests passed! (${passed}/${total})`);
    log(colors.green, '✅ Dynamic WhatsApp system is working correctly');
    log(colors.green, '✅ Database-driven API configuration is functional');
    log(colors.green, '✅ Message logging and statistics are working');
  } else {
    log(colors.yellow + colors.bright, `⚠️  Some tests failed (${passed}/${total})`);
    log(colors.yellow, '💡 Make sure to:');
    log(colors.yellow, '   1. Deploy the WhatsApp database schema');
    log(colors.yellow, '   2. Add API keys via admin panel');
    log(colors.yellow, '   3. Start the mock WhatsApp API server');
  }

  console.log('');
  log(colors.blue, '📝 Next steps:');
  log(colors.blue, '   1. Deploy WHATSAPP_API_SETTINGS_SCHEMA.sql to Supabase');
  log(colors.blue, '   2. Add real Woo-wa API keys via admin panel');
  log(colors.blue, '   3. Test with real phone numbers');
  log(colors.blue, '   4. Monitor logs and statistics in production');
  
  console.log('');
}

// Run the tests
runTests().catch(console.error);
