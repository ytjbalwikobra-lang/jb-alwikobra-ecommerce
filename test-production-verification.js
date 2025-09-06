// Test Phone Verification System - Production jbalwikobra.com
// This script tests the complete phone verification flow

const API_BASE = 'https://www.jbalwikobra.com/api';

// Test data - GANTI DENGAN NOMOR WHATSAPP ASLI UNTUK TEST
const testPhone = '+6285123456789'; 
let testUserId = null;

console.log('🧪 Starting Phone Verification Test for Production jbalwikobra.com');
console.log('📱 Test phone:', testPhone);
console.log('⚠️  PASTIKAN NOMOR WHATSAPP AKTIF UNTUK MENERIMA KODE VERIFIKASI');
console.log('');

async function testFlow() {
  try {
    // Step 1: Test signup/send verification
    console.log('📝 Step 1: Testing signup with phone verification...');
    
    const signupResponse = await fetch(`${API_BASE}/auth?action=signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: testPhone
      })
    });

    console.log(`Response Status: ${signupResponse.status}`);
    const signupData = await signupResponse.text();
    console.log(`Response Body: ${signupData}`);
    
    if (signupResponse.ok) {
      const result = JSON.parse(signupData);
      console.log('✅ Signup successful!');
      console.log('📊 Response data:', result);
      
      if (result.user_id) {
        testUserId = result.user_id;
        console.log(`👤 User ID: ${testUserId}`);
        console.log('📱 Kode verifikasi dikirim ke WhatsApp');
        console.log('⏳ Silakan cek WhatsApp Anda dan gunakan kode untuk test verification');
      }
      
    } else {
      console.log('❌ Signup failed!');
      console.log('Error response:', signupData);
      return;
    }
    
    console.log('');
    
    // Step 2: Test verification endpoint format
    console.log('📝 Step 2: Format test verification...');
    console.log('💡 Untuk test verification manual, gunakan command ini:');
    console.log(`
curl -X POST ${API_BASE}/auth?action=verify-phone \\
  -H "Content-Type: application/json" \\
  -d '{
    "user_id": "${testUserId}",
    "verification_code": "KODE_DARI_WHATSAPP"
  }'
    `);
    
    console.log('');
    
    // Step 3: Test WhatsApp service directly
    console.log('📝 Step 3: Testing WhatsApp service endpoint...');
    
    const whatsappResponse = await fetch(`${API_BASE}/auth?action=test-whatsapp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phoneNumber: testPhone,
        message: "🧪 Test manual dari script verification - JB Alwikobra"
      })
    });

    console.log(`WhatsApp Test Status: ${whatsappResponse.status}`);
    const whatsappData = await whatsappResponse.text();
    console.log(`WhatsApp Response: ${whatsappData}`);
    
    if (whatsappResponse.ok) {
      console.log('✅ WhatsApp service working!');
      const whatsappResult = JSON.parse(whatsappData);
      console.log('📱 WhatsApp test result:', whatsappResult);
    } else {
      console.log('❌ WhatsApp service failed!');
    }
    
    console.log('');
    console.log('🎯 SUMMARY:');
    console.log('1. Signup endpoint: ' + (signupResponse.ok ? '✅ Working' : '❌ Failed'));
    console.log('2. WhatsApp service: ' + (whatsappResponse.ok ? '✅ Working' : '❌ Failed'));
    console.log('3. Phone verification table: ✅ Should be populated');
    console.log('4. Manual verification: 🔄 Test dengan kode dari WhatsApp');
    
  } catch (error) {
    console.log('💥 Test failed with error:', error.message);
  }
}

// Helper function to test verification with manual code input
async function testVerificationWithCode(userId, code) {
  console.log(`🔐 Testing verification with code: ${code}`);
  
  const verifyResponse = await fetch(`${API_BASE}/auth?action=verify-phone`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      user_id: userId,
      verification_code: code
    })
  });

  console.log(`Verification Status: ${verifyResponse.status}`);
  const verifyData = await verifyResponse.text();
  console.log(`Verification Response: ${verifyData}`);
  
  return verifyResponse.ok;
}

// Run the test
console.log('🚀 Memulai test sistem verifikasi phone...');
testFlow();

// Export helper for manual testing
global.testVerificationWithCode = testVerificationWithCode;
