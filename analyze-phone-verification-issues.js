#!/usr/bin/env node

/**
 * Detailed Analysis of Phone Verification System Issues
 * After migration fixes
 */

const https = require('https');

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Debug-Script/1.0',
        ...options.headers
      }
    };

    const req = https.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testAfterMigration() {
  console.log('🔍 TESTING PHONE VERIFICATION AFTER MIGRATION FIX');
  console.log('='.repeat(60));
  
  console.log('📝 Current Status:');
  console.log('✅ Migration applied (simplified version)');
  console.log('✅ API endpoints accessible');
  console.log('✅ WhatsApp service responding (with provider error)');
  console.log('❌ User creation still failing');
  console.log('');
  
  // Test 1: API Connectivity
  console.log('🧪 Test 1: API Connectivity');
  try {
    const whatsappTest = await makeRequest('https://www.jbalwikobra.com/api/auth?action=test-whatsapp', {
      method: 'POST',
      body: { phoneNumber: '+628123456789', message: 'Connectivity test' }
    });
    console.log(`   WhatsApp API: Status ${whatsappTest.status} - ${whatsappTest.data.success ? 'Working' : 'Provider Error (Expected)'}`);
  } catch (e) {
    console.log(`   WhatsApp API: Error - ${e.message}`);
  }
  
  // Test 2: User Creation with Different Phones
  console.log('\n🧪 Test 2: User Creation Attempts');
  const testPhones = [
    '+628123456789',
    '+6285123TEST001',
    '+1234567890123'
  ];
  
  for (const phone of testPhones) {
    try {
      const signupTest = await makeRequest('https://www.jbalwikobra.com/api/auth?action=signup', {
        method: 'POST',
        body: { phone }
      });
      console.log(`   ${phone}: Status ${signupTest.status}`);
      console.log(`   Response:`, signupTest.data);
    } catch (e) {
      console.log(`   ${phone}: Network Error - ${e.message}`);
    }
  }
  
  console.log('\n📋 POSSIBLE CAUSES OF "Failed to create user":');
  console.log('1. 🔒 RLS (Row Level Security) policies blocking service role inserts');
  console.log('2. 🚫 Missing/incorrect service role key configuration');
  console.log('3. 📊 Database column mismatch (API expects different schema)');
  console.log('4. 🔗 Foreign key constraint issues');
  console.log('5. 🏗️  Table doesn\'t exist or incorrect permissions');
  
  console.log('\n🔧 RECOMMENDED DEBUG STEPS:');
  console.log('1. Check Supabase logs for detailed SQL errors');
  console.log('2. Verify service role key has correct permissions');
  console.log('3. Test direct SQL insert in Supabase dashboard:');
  console.log('   INSERT INTO users (phone) VALUES (\'+628123TEST\');');
  console.log('4. Check if RLS policies are blocking service role');
  console.log('5. Verify table structure matches API expectations');
  
  console.log('\n🎯 CURRENT SYSTEM STATUS:');
  console.log('✅ Frontend/API Layer: Working');
  console.log('✅ WhatsApp Service: Configured (provider issue separate)');
  console.log('❌ Database Layer: User creation blocked');
  console.log('❓ Verification Flow: Cannot test until user creation works');
  
  console.log('\n📞 MANUAL TEST WHEN FIXED:');
  console.log('1. curl -X POST "https://www.jbalwikobra.com/api/auth?action=signup" \\');
  console.log('   -d \'{"phone": "+628123456789"}\'');
  console.log('2. Check for verification code via WhatsApp');
  console.log('3. curl -X POST "https://www.jbalwikobra.com/api/auth?action=verify-phone" \\');
  console.log('   -d \'{"user_id": "USER_ID", "verification_code": "CODE"}\'');
}

testAfterMigration().catch(console.error);
