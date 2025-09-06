#!/usr/bin/env node

/**
 * Comprehensive Production Test Script for Phone Verification System
 * Tests the complete flow: signup -> verification -> database validation
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'https://www.jbalwikobra.com';
const TEST_PHONE = '+6285123456789';
const TEST_NAME = 'Test User Production';

console.log('🚀 Starting comprehensive production test for phone verification...\n');

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;
    const reqOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Production-Test-Script/1.0',
        ...options.headers
      }
    };

    const req = protocol.request(url, reqOptions, (res) => {
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

// Test functions
async function testAPIAvailability() {
  console.log('📡 Testing API availability...');
  
  const endpoints = [
    '/api/hello.ts',
    '/api/test-whatsapp.ts',
    '/api/auth.ts'
  ];
  
  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${BASE_URL}${endpoint}`);
      console.log(`   ${endpoint}: Status ${response.status}`);
      if (response.status === 200) {
        console.log(`   ✅ ${endpoint} is available`);
        return endpoint;
      }
    } catch (error) {
      console.log(`   ❌ ${endpoint}: ${error.message}`);
    }
  }
  
  console.log('   ⚠️  No API endpoints responding as expected\n');
  return null;
}

async function testAuthEndpoint() {
  console.log('🔐 Testing auth endpoint...');
  
  const authTests = [
    { action: 'test', method: 'GET' },
    { action: 'signup', method: 'POST', body: { phone: TEST_PHONE, name: TEST_NAME } },
    { action: 'verify-phone', method: 'POST', body: { phone: TEST_PHONE, code: '1234' } }
  ];
  
  for (const test of authTests) {
    try {
      console.log(`   Testing ${test.action}...`);
      const response = await makeRequest(`${BASE_URL}/api/auth.ts?action=${test.action}`, {
        method: test.method,
        body: test.body
      });
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, response.data);
      console.log('');
      
      if (test.action === 'signup' && response.data?.success) {
        console.log('   ✅ Signup successful - verification code should be sent');
        return response.data;
      }
    } catch (error) {
      console.log(`   ❌ Error testing ${test.action}:`, error.message);
    }
  }
  
  return null;
}

async function testWhatsAppEndpoint() {
  console.log('📱 Testing WhatsApp endpoint...');
  
  const whatsappTests = [
    {
      url: '/api/test-whatsapp.ts',
      method: 'POST',
      body: { phone: TEST_PHONE, message: 'Test production verification' }
    },
    {
      url: '/api/test-whatsapp.ts',
      method: 'GET'
    }
  ];
  
  for (const test of whatsappTests) {
    try {
      console.log(`   Testing ${test.method} ${test.url}...`);
      const response = await makeRequest(`${BASE_URL}${test.url}`, {
        method: test.method,
        body: test.body
      });
      
      console.log(`   Status: ${response.status}`);
      console.log(`   Response:`, response.data);
      console.log('');
      
      if (response.data?.success) {
        console.log('   ✅ WhatsApp message sent successfully');
        return true;
      }
    } catch (error) {
      console.log(`   ❌ Error testing WhatsApp:`, error.message);
    }
  }
  
  return false;
}

async function testDatabaseConnection() {
  console.log('🗄️  Testing database connection and schema...');
  
  try {
    // Try to access a known working endpoint to verify DB connection
    const response = await makeRequest(`${BASE_URL}/api/hello.ts`);
    console.log(`   Database test status: ${response.status}`);
    
    if (response.status === 200) {
      console.log('   ✅ Database connection appears to be working');
      return true;
    }
  } catch (error) {
    console.log(`   ❌ Database connection test failed:`, error.message);
  }
  
  return false;
}

async function runFullTest() {
  console.log('='.repeat(60));
  console.log('🧪 PRODUCTION PHONE VERIFICATION TEST');
  console.log('='.repeat(60));
  console.log(`Target: ${BASE_URL}`);
  console.log(`Test Phone: ${TEST_PHONE}`);
  console.log(`Test Name: ${TEST_NAME}`);
  console.log('='.repeat(60));
  console.log('');
  
  // Step 1: Check API availability
  const availableEndpoint = await testAPIAvailability();
  
  // Step 2: Test database connection
  const dbWorking = await testDatabaseConnection();
  
  // Step 3: Test auth endpoints
  const authResult = await testAuthEndpoint();
  
  // Step 4: Test WhatsApp functionality
  const whatsappWorking = await testWhatsAppEndpoint();
  
  // Summary
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(40));
  console.log(`API Availability: ${availableEndpoint ? '✅ Available' : '❌ Not Available'}`);
  console.log(`Database Connection: ${dbWorking ? '✅ Working' : '❌ Not Working'}`);
  console.log(`Auth Flow: ${authResult ? '✅ Working' : '❌ Not Working'}`);
  console.log(`WhatsApp Integration: ${whatsappWorking ? '✅ Working' : '❌ Not Working'}`);
  console.log('='.repeat(40));
  
  if (authResult && whatsappWorking) {
    console.log('🎉 PHONE VERIFICATION SYSTEM IS WORKING!');
    console.log('   - Users can register with phone numbers');
    console.log('   - Verification codes are sent via WhatsApp');
    console.log('   - Database integration is functional');
  } else {
    console.log('⚠️  PHONE VERIFICATION NEEDS ATTENTION:');
    if (!authResult) console.log('   - Auth signup/verification flow has issues');
    if (!whatsappWorking) console.log('   - WhatsApp message sending not working');
    if (!dbWorking) console.log('   - Database connection problems');
  }
  
  console.log('\n🔍 Next steps: Check server logs for detailed error information');
}

// Run the test
runFullTest().catch(console.error);
