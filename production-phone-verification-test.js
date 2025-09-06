// Production Phone Verification Test - jbalwikobra.com
// Test langsung ke production API untuk memastikan phone verification bekerja

const PRODUCTION_URL = 'https://www.jbalwikobra.com';
const TEST_PHONE = '+6281234567890'; // GANTI dengan nomor WhatsApp asli untuk test
const TEST_PASSWORD = 'TestPassword123!';

console.log('🚀 PRODUCTION PHONE VERIFICATION TEST');
console.log('=====================================');
console.log('🌐 Target:', PRODUCTION_URL);
console.log('📱 Test Phone:', TEST_PHONE);
console.log('⚠️  PASTIKAN NOMOR WHATSAPP AKTIF!');
console.log('');

class ProductionPhoneVerificationTester {
  constructor() {
    this.baseUrl = PRODUCTION_URL;
    this.testPhone = TEST_PHONE;
    this.testPassword = TEST_PASSWORD;
    this.testUserId = null;
  }

  async testSignup() {
    console.log('📝 Step 1: Testing signup API...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/auth?action=signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: this.testPhone,
          password: this.testPassword
        })
      });

      const data = await response.json();
      console.log('📊 Signup Response Status:', response.status);
      console.log('📊 Signup Response Data:', data);

      if (data.success && data.user_id) {
        this.testUserId = data.user_id;
        console.log('✅ Signup successful! User ID:', this.testUserId);
        console.log('📬 Check your WhatsApp for verification code');
        return { success: true, userId: this.testUserId };
      } else {
        console.log('❌ Signup failed:', data.error || 'Unknown error');
        return { success: false, error: data.error };
      }

    } catch (error) {
      console.error('❌ Signup request failed:', error);
      return { success: false, error: error.message };
    }
  }

  async testVerification(verificationCode) {
    if (!this.testUserId) {
      console.log('❌ No user ID available. Run signup first.');
      return { success: false, error: 'No user ID' };
    }

    console.log(`🔐 Step 2: Testing verification with code: ${verificationCode}`);
    
    try {
      const response = await fetch(`${this.baseUrl}/api/auth?action=verify-phone`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: this.testUserId,
          verification_code: verificationCode
        })
      });

      const data = await response.json();
      console.log('📊 Verification Response Status:', response.status);
      console.log('📊 Verification Response Data:', data);

      if (data.success) {
        console.log('✅ Phone verification successful!');
        console.log('🎯 Session token received:', data.session_token?.substring(0, 20) + '...');
        console.log('👤 User data:', data.user);
        return { success: true, data };
      } else {
        console.log('❌ Verification failed:', data.error || 'Unknown error');
        return { success: false, error: data.error };
      }

    } catch (error) {
      console.error('❌ Verification request failed:', error);
      return { success: false, error: error.message };
    }
  }

  async testCompleteProfile(sessionToken) {
    console.log('📝 Step 3: Testing profile completion...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/auth?action=complete-profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionToken}`
        },
        body: JSON.stringify({
          name: 'Test User Production',
          email: 'test.production@example.com'
        })
      });

      const data = await response.json();
      console.log('📊 Profile Completion Response Status:', response.status);
      console.log('📊 Profile Completion Response Data:', data);

      if (data.success) {
        console.log('✅ Profile completion successful!');
        console.log('👤 Updated user:', data.user);
        return { success: true, data };
      } else {
        console.log('❌ Profile completion failed:', data.error || 'Unknown error');
        return { success: false, error: data.error };
      }

    } catch (error) {
      console.error('❌ Profile completion request failed:', error);
      return { success: false, error: error.message };
    }
  }

  async testWhatsAppDelivery() {
    console.log('📧 Testing WhatsApp delivery...');
    
    try {
      const response = await fetch(`${this.baseUrl}/api/auth?action=test-whatsapp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: this.testPhone,
          message: `🧪 Production Test Message

Timestamp: ${new Date().toLocaleString('id-ID')}
Source: Production verification tester

Jika Anda menerima pesan ini, WhatsApp service production berfungsi dengan baik! ✅`
        })
      });

      const data = await response.json();
      console.log('📊 WhatsApp Test Response Status:', response.status);
      console.log('📊 WhatsApp Test Response Data:', data);

      if (data.success) {
        console.log('✅ WhatsApp delivery test successful!');
        return { success: true, data };
      } else {
        console.log('❌ WhatsApp delivery failed:', data.error || 'Unknown error');
        return { success: false, error: data.error };
      }

    } catch (error) {
      console.error('❌ WhatsApp delivery test failed:', error);
      return { success: false, error: error.message };
    }
  }

  async runFullTest() {
    console.log('🎯 Running FULL PRODUCTION TEST...');
    console.log('==================================');

    // Test 1: WhatsApp delivery
    await this.testWhatsAppDelivery();
    console.log('');

    // Test 2: Signup
    const signupResult = await this.testSignup();
    console.log('');

    if (!signupResult.success) {
      console.log('❌ Test stopped - signup failed');
      return;
    }

    // Test 3: Manual verification (user needs to input code)
    console.log('⌨️  MANUAL STEP REQUIRED:');
    console.log('📱 Check your WhatsApp for verification code');
    console.log('💬 Look for message from JB Alwikobra');
    console.log('');
    console.log('🔧 To continue test, run:');
    console.log(`tester.testVerification('YOUR_CODE_HERE')`);
    console.log('');
    console.log('📋 Or copy-paste this command with your code:');
    console.log(`tester.testVerification('123456') // Replace 123456 with actual code`);

    return signupResult;
  }
}

// Create global tester instance
const tester = new ProductionPhoneVerificationTester();

// Export global functions
if (typeof window !== 'undefined') {
  // Browser environment
  window.tester = tester;
  window.testProductionPhone = () => tester.runFullTest();
  window.testProductionWhatsApp = () => tester.testWhatsAppDelivery();
  window.testProductionSignup = () => tester.testSignup();
  
  console.log('📋 Production Phone Verification Tester loaded!');
  console.log('🌐 Available commands:');
  console.log('• testProductionPhone() - Full production test');
  console.log('• testProductionWhatsApp() - Test WhatsApp only');
  console.log('• testProductionSignup() - Test signup only');
  console.log('• tester.testVerification("CODE") - Test verification with code');
  console.log('');
  console.log('🚀 Start with: testProductionPhone()');
} else {
  // Node environment
  tester.runFullTest().catch(console.error);
}

export default ProductionPhoneVerificationTester;
