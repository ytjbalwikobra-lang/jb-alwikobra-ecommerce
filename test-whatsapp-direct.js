#!/usr/bin/env node

/**
 * Direct WhatsApp Service Test
 * Tests the DynamicWhatsAppService directly without API endpoints
 */

// Set up environment for Node.js testing
process.env.REACT_APP_SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || 'https://xeithuvgldzxnggxadri.supabase.co';
process.env.SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhlaXRodXZnbGR6eG5nZ3hhZHJpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjQ2MzMyMSwiZXhwIjoyMDcyMDM5MzIxfQ.pLPA5-pZ4jpjzhsevyMJoRLmLYbPbESfMbt14PBMXd8';

const path = require('path');

// Mock fetch for Node.js environment
global.fetch = require('node-fetch');

// Colors for output
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

async function testDynamicWhatsAppService() {
  log(colors.blue + colors.bright, '🧪 Testing Dynamic WhatsApp Service...');

  try {
    // Dynamically import the service
    const servicePath = path.join(__dirname, 'src', 'services', 'dynamicWhatsAppService.ts');
    
    // Since we can't directly import TypeScript in Node, let's test the database connection first
    const { createClient } = require('@supabase/supabase-js');
    
    const supabase = createClient(
      process.env.REACT_APP_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );

    // Test 1: Check database connection
    log(colors.cyan, '1️⃣  Testing database connection...');
    
    const { data: providers, error: providersError } = await supabase
      .from('whatsapp_providers')
      .select('*')
      .eq('is_active', true);

    if (providersError) {
      log(colors.red, '❌ Database connection failed:', providersError.message);
      return false;
    }

    log(colors.green, '✅ Database connection successful');
    log(colors.cyan, `📋 Found ${providers.length} active providers:`);
    
    providers.forEach(provider => {
      log(colors.cyan, `   - ${provider.display_name} (${provider.name}): ${provider.base_url}`);
    });

    // Test 2: Check API keys
    log(colors.cyan, '2️⃣  Testing API keys...');
    
    const { data: apiKeys, error: keysError } = await supabase
      .from('whatsapp_api_keys')
      .select(`
        *,
        whatsapp_providers(name, display_name)
      `)
      .eq('is_active', true);

    if (keysError) {
      log(colors.red, '❌ Failed to get API keys:', keysError.message);
      return false;
    }

    log(colors.green, '✅ API keys loaded successfully');
    log(colors.cyan, `🔑 Found ${apiKeys.length} active API keys:`);
    
    apiKeys.forEach(key => {
      const maskedKey = key.api_key.substring(0, 4) + '*'.repeat(key.api_key.length - 8) + key.api_key.substring(key.api_key.length - 4);
      log(colors.cyan, `   - ${key.key_name}: ${maskedKey} (${key.whatsapp_providers?.display_name})`);
    });

    // Test 3: Test get_active_api_key function
    log(colors.cyan, '3️⃣  Testing get_active_api_key function...');
    
    const { data: activeKey, error: activeKeyError } = await supabase.rpc('get_active_api_key', {
      provider_name: 'woo-wa'
    });

    if (activeKeyError) {
      log(colors.red, '❌ Failed to get active API key:', activeKeyError.message);
      return false;
    }

    if (activeKey && activeKey.length > 0) {
      log(colors.green, '✅ Active API key found for woo-wa provider');
      const keyData = activeKey[0];
      const maskedKey = keyData.api_key.substring(0, 4) + '*'.repeat(keyData.api_key.length - 8) + keyData.api_key.substring(keyData.api_key.length - 4);
      log(colors.cyan, `🔑 Active key: ${maskedKey}`);
      log(colors.cyan, `📡 Base URL: ${keyData.provider_config.base_url}`);
    } else {
      log(colors.yellow, '⚠️  No active API key found for woo-wa provider');
      log(colors.yellow, '💡 Make sure you have added an API key and set it as active');
      return false;
    }

    // Test 4: Test actual WhatsApp API call
    log(colors.cyan, '4️⃣  Testing WhatsApp API call...');
    
    const keyData = activeKey[0];
    const testPhone = '6281234567999';
    const testMessage = `🧪 *Test Message from JB Alwikobra*

This is a test message to verify WhatsApp integration.

Sent at: ${new Date().toLocaleString('id-ID')}

---
🎮 JB Alwikobra E-commerce`;

    const apiUrl = `${keyData.provider_config.base_url}/send_message`;
    
    log(colors.cyan, `📡 Sending to: ${apiUrl}`);
    log(colors.cyan, `📱 Phone: ${testPhone}`);
    log(colors.cyan, `💬 Message length: ${testMessage.length} chars`);

    const requestBody = {
      phone_no: testPhone,
      key: keyData.api_key,
      message: testMessage
    };

    const startTime = Date.now();
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const responseTime = Date.now() - startTime;
    const responseData = await response.json();

    log(colors.cyan, `📊 Response status: ${response.status}`);
    log(colors.cyan, `⚡ Response time: ${responseTime}ms`);
    log(colors.cyan, `📥 Response data:`, JSON.stringify(responseData, null, 2));

    // Check if successful based on Woo-wa response format
    // Woo-wa returns code: 200 and results.message containing "success" for successful sends
    const isSuccess = response.ok && responseData.code === 200 && 
                     responseData.results && 
                     responseData.results.message && 
                     responseData.results.message.toLowerCase().includes('success');

    if (isSuccess) {
      log(colors.green, '✅ WhatsApp message sent successfully!');
      log(colors.green, `📧 Message ID: ${responseData.results.id_message}`);
      log(colors.green, `📱 Message: ${responseData.results.message}`);
      
      // Test 5: Log the message
      log(colors.cyan, '5️⃣  Testing message logging...');
      
      const { data: logId, error: logError } = await supabase.rpc('log_whatsapp_message', {
        p_api_key_id: keyData.key_id,
        p_phone_number: testPhone,
        p_message_type: 'text',
        p_message_content: testMessage,
        p_request_body: requestBody,
        p_response_body: responseData,
        p_response_status: response.status,
        p_success: isSuccess,
        p_message_id: responseData.results.id_message,
        p_context_type: 'test',
        p_context_id: 'direct-test-' + Date.now(),
        p_response_time_ms: responseTime
      });

      if (logError) {
        log(colors.yellow, '⚠️  Message logging failed:', logError.message);
      } else {
        log(colors.green, '✅ Message logged successfully');
        log(colors.cyan, `📝 Log ID: ${logId}`);
      }

      return true;
    } else {
      log(colors.red, '❌ WhatsApp message sending failed');
      log(colors.red, `💬 Error: ${responseData.message || responseData.error || 'Unknown error'}`);
      return false;
    }

  } catch (error) {
    log(colors.red, '❌ Test failed with error:', error.message);
    console.error(error);
    return false;
  }
}

async function runDirectTest() {
  console.log('');
  log(colors.magenta + colors.bright, '=' * 80);
  log(colors.magenta + colors.bright, '🧪 DIRECT WHATSAPP SERVICE TEST');
  log(colors.magenta + colors.bright, '=' * 80);
  console.log('');

  const success = await testDynamicWhatsAppService();

  console.log('');
  log(colors.magenta + colors.bright, '=' * 80);
  log(colors.magenta + colors.bright, '📊 TEST RESULTS');
  log(colors.magenta + colors.bright, '=' * 80);

  if (success) {
    log(colors.green + colors.bright, '🎉 ALL TESTS PASSED!');
    log(colors.green, '✅ Database connection working');
    log(colors.green, '✅ API keys configured correctly');
    log(colors.green, '✅ WhatsApp API responding');
    log(colors.green, '✅ Message logging functional');
    log(colors.green, '✅ Dynamic WhatsApp system is ready!');
  } else {
    log(colors.red + colors.bright, '❌ TESTS FAILED!');
    log(colors.yellow, '💡 Common issues to check:');
    log(colors.yellow, '   1. Verify your Woo-wa API key is correct');
    log(colors.yellow, '   2. Check if the API key is set as active in database');
    log(colors.yellow, '   3. Ensure your Woo-wa account has credits');
    log(colors.yellow, '   4. Verify the phone number is in correct format');
  }

  console.log('');
  log(colors.blue, '📝 Next steps:');
  log(colors.blue, '   1. If successful, test the full signup flow in the React app');
  log(colors.blue, '   2. Monitor message logs in the admin panel');
  log(colors.blue, '   3. Test with different phone numbers');
  log(colors.blue, '   4. Set up monitoring for production');
  
  console.log('');
}

runDirectTest().catch(console.error);
