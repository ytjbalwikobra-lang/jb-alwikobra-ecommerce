#!/usr/bin/env node

/**
 * Test script to verify authentication flow works correctly
 * This tests the complete signup -> verify -> complete profile flow
 */

const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:3000';

async function testAuthFlow() {
  console.log('🧪 Testing Authentication Flow\n');

  try {
    // Test 1: Signup
    console.log('📝 Testing signup...');
    const signupResponse = await fetch(`${BASE_URL}/api/auth?action=signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phone: '+628123456789'
      })
    });

    const signupData = await signupResponse.json();
    console.log('Signup Response:', signupData);

    if (!signupResponse.ok) {
      console.error('❌ Signup failed:', signupData.error);
      return;
    }

    const userId = signupData.user_id;
    console.log('✅ Signup successful, user_id:', userId);

    // Test 2: Verify phone (simulate with mock code)
    console.log('\n📱 Testing phone verification...');
    const verifyResponse = await fetch(`${BASE_URL}/api/auth?action=verify-phone`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        user_id: userId,
        verification_code: '123456' // This will fail in real scenario
      })
    });

    const verifyData = await verifyResponse.json();
    console.log('Verify Response:', verifyData);

    if (verifyResponse.ok) {
      console.log('✅ Phone verification successful');
      
      // Test 3: Complete profile
      console.log('\n👤 Testing profile completion...');
      const profileResponse = await fetch(`${BASE_URL}/api/auth?action=complete-profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: userId,
          email: 'test@example.com',
          name: 'Test User',
          password: 'testpassword123'
        })
      });

      const profileData = await profileResponse.json();
      console.log('Profile Response:', profileData);

      if (profileResponse.ok) {
        console.log('✅ Profile completion successful');
      } else {
        console.error('❌ Profile completion failed:', profileData.error);
      }
    } else {
      console.log('⚠️ Phone verification failed (expected with mock code):', verifyData.error);
    }

    // Test 4: Login
    console.log('\n🔐 Testing login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        identifier: '+628123456789',
        password: 'testpassword123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);

    if (loginResponse.ok) {
      console.log('✅ Login successful');
      console.log('Profile completed:', loginData.user.profile_completed);
    } else {
      console.log('❌ Login failed:', loginData.error);
    }

  } catch (error) {
    console.error('💥 Test error:', error);
  }
}

// Check if we have the required environment
if (process.argv.includes('--help')) {
  console.log(`
Usage: node test-auth-flow.js

This script tests the complete authentication flow:
1. Signup with phone number
2. Phone verification 
3. Profile completion
4. Login

Make sure your development server is running on ${BASE_URL}
`);
} else {
  testAuthFlow();
}
