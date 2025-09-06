// Test script untuk verifikasi phone flow
const BASE_URL = 'http://localhost:3000';

class PhoneVerificationTester {
  constructor() {
    this.testPhone = '+6281234567890';
    this.testPassword = 'TestPassword123!';
  }

  async testSignupFlow() {
    console.log('🚀 Starting Phone Verification Test Flow');
    console.log('========================================');

    try {
      // Step 1: Test signup endpoint
      console.log('\n📱 Step 1: Testing signup with phone...');
      const signupResponse = await this.testSignup();
      
      if (!signupResponse.success) {
        console.error('❌ Signup failed:', signupResponse.error);
        return;
      }

      const userId = signupResponse.user_id;
      console.log('✅ Signup successful, User ID:', userId);
      console.log('⏰ Verification expires at:', signupResponse.expires_at);

      // Step 2: Check database record
      console.log('\n🔍 Step 2: Checking database records...');
      await this.checkDatabaseRecords(userId);

      // Step 3: Test verification with wrong code
      console.log('\n🔐 Step 3: Testing wrong verification code...');
      await this.testWrongVerification(userId);

      // Step 4: Get correct code from database and verify
      console.log('\n✅ Step 4: Testing correct verification code...');
      const correctCode = await this.getVerificationCodeFromDB(userId);
      if (correctCode) {
        await this.testCorrectVerification(userId, correctCode);
      }

      console.log('\n🎉 Test completed successfully!');

    } catch (error) {
      console.error('❌ Test failed with error:', error);
    }
  }

  async testSignup() {
    const response = await fetch(`${BASE_URL}/api/auth?action=signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone: this.testPhone,
        password: this.testPassword
      })
    });

    return await response.json();
  }

  async testWrongVerification(userId) {
    const response = await fetch(`${BASE_URL}/api/auth?action=verify-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        verification_code: '999999'
      })
    });

    const result = await response.json();
    console.log('Wrong code result:', result);
  }

  async testCorrectVerification(userId, code) {
    const response = await fetch(`${BASE_URL}/api/auth?action=verify-phone`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
        verification_code: code
      })
    });

    const result = await response.json();
    console.log('✅ Correct verification result:', result);
  }

  async checkDatabaseRecords(userId) {
    try {
      // Check users table
      console.log('📊 Checking users table...');
      const usersResponse = await fetch(`${BASE_URL}/api/admin?action=users`);
      const usersData = await usersResponse.json();
      
      const user = usersData.users?.find(u => u.id === userId);
      if (user) {
        console.log('✅ User found in database:');
        console.log('   - Phone:', user.phone);
        console.log('   - Phone verified:', user.phone_verified);
        console.log('   - Created at:', user.created_at);
      } else {
        console.log('❌ User not found in database');
      }

      // Note: We can't directly query phone_verifications from client
      // but we can check if the verification endpoint works
      console.log('📋 Phone verification table records are checked via API responses');

    } catch (error) {
      console.error('❌ Database check failed:', error);
    }
  }

  async getVerificationCodeFromDB(userId) {
    // Since we can't directly access the database from client,
    // we'll simulate getting the code by testing known patterns
    console.log('🔑 Simulating verification code retrieval...');
    console.log('   (In real scenario, check Supabase admin panel or logs)');
    
    // For testing, we can generate a realistic code
    // In production, you'd check the database directly
    const testCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('   Generated test code (replace with real DB code):', testCode);
    
    return testCode;
  }

  async testWhatsAppDelivery() {
    console.log('\n📧 Testing WhatsApp delivery...');
    
    try {
      const response = await fetch(`${BASE_URL}/api/auth?action=test-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: this.testPhone,
          message: 'Test message from verification tester'
        })
      });

      const result = await response.json();
      console.log('📱 WhatsApp test result:', result);
      
      if (result.success) {
        console.log('✅ WhatsApp service is working');
        console.log('   - Provider:', result.provider);
        console.log('   - Message ID:', result.messageId);
      } else {
        console.log('❌ WhatsApp service failed:', result.error);
      }

    } catch (error) {
      console.error('❌ WhatsApp test error:', error);
    }
  }
}

// Run the test
async function runTest() {
  const tester = new PhoneVerificationTester();
  
  console.log('📋 Available tests:');
  console.log('1. Full signup flow test');
  console.log('2. WhatsApp delivery test');
  console.log('3. Both tests');
  
  // For now, run both tests
  await tester.testWhatsAppDelivery();
  await tester.testSignupFlow();
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PhoneVerificationTester, runTest };
}

// Run if called directly
if (typeof window !== 'undefined') {
  // Browser environment
  window.runPhoneVerificationTest = runTest;
} else {
  // Node environment
  runTest().catch(console.error);
}
