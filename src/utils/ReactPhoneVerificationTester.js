// Test Phone Verification Flow untuk Frontend React
// Test ini akan menggunakan API yang sudah ada dan UI component

// Commented out temporarily to fix compilation
// import { authService } from '../services/authService';

export class ReactPhoneVerificationTester {
  constructor() {
    this.testPhone = '+6281234567890';
    this.testEmail = 'test@example.com';
    this.testName = 'Test User';
    this.testPassword = 'TestPassword123!';
  }

  // Test 1: Signup flow lengkap
  async testSignupFlow() {
    console.log('🚀 Testing React Signup Flow');
    console.log('===========================================');

    try {
      // Step 1: Test signup dengan phone
      console.log('\n📱 Step 1: Testing signup with phone number...');
      const signupResult = await authService.signup(this.testPhone, this.testPassword);
      
      if (signupResult.error) {
        console.error('❌ Signup failed:', signupResult.error);
        return;
      }

      console.log('✅ Signup successful!');
      console.log('   - User ID:', signupResult.userId);
      console.log('   - Message:', signupResult.message);
      console.log('   - Expires at:', signupResult.expires_at);

      const userId = signupResult.userId;

      // Step 2: Test wrong verification code
      console.log('\n🔐 Step 2: Testing wrong verification code...');
      const wrongVerifyResult = await authService.verifyPhone(userId, '999999');
      
      if (wrongVerifyResult.error) {
        console.log('✅ Wrong code correctly rejected:', wrongVerifyResult.error);
      } else {
        console.log('❌ Wrong code was accepted (should not happen)');
      }

      // Step 3: Manual input untuk kode yang benar
      console.log('\n⌨️  Step 3: Manual verification code input needed');
      console.log('   📋 Check your WhatsApp for verification code');
      console.log('   📱 Phone:', this.testPhone);
      console.log('   💬 Look for message from JB Alwikobra');
      console.log('');
      console.log('   🔧 To test with real code, use:');
      console.log(`   window.testVerification('${userId}', 'YOUR_CODE_HERE')`);

      // Export helper function to global scope
      window.testVerification = async (userId, code) => {
        return this.testVerificationCode(userId, code);
      };

      return { success: true, userId };

    } catch (error) {
      console.error('❌ Signup flow test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Test 2: Verification dengan kode yang benar
  async testVerificationCode(userId, verificationCode) {
    console.log(`\n🔐 Testing verification with code: ${verificationCode}`);
    
    try {
      const verifyResult = await authService.verifyPhone(userId, verificationCode);
      
      if (verifyResult.error) {
        console.error('❌ Verification failed:', verifyResult.error);
        return { success: false, error: verifyResult.error };
      }

      console.log('✅ Phone verification successful!');
      console.log('   - Session token:', verifyResult.session_token?.substring(0, 20) + '...');
      console.log('   - User data:', verifyResult.user);
      console.log('   - Next step:', verifyResult.next_step);

      // Test complete profile jika diperlukan
      if (verifyResult.next_step === 'complete_profile') {
        console.log('\n📝 Step 4: Testing profile completion...');
        await this.testCompleteProfile(verifyResult.session_token);
      }

      return { success: true, data: verifyResult };

    } catch (error) {
      console.error('❌ Verification test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Test 3: Complete profile
  async testCompleteProfile(sessionToken) {
    try {
      // Set session token untuk authService
      localStorage.setItem('session_token', sessionToken);

      const profileResult = await authService.completeProfile({
        name: this.testName,
        email: this.testEmail
      });

      if (profileResult.error) {
        console.error('❌ Profile completion failed:', profileResult.error);
        return;
      }

      console.log('✅ Profile completion successful!');
      console.log('   - Updated user:', profileResult.user);
      console.log('   - Profile completed:', profileResult.user.profile_completed);

    } catch (error) {
      console.error('❌ Profile completion test failed:', error);
    }
  }

  // Test 4: WhatsApp delivery test
  async testWhatsAppDelivery() {
    console.log('\n📧 Testing WhatsApp message delivery...');
    
    try {
      const response = await fetch('/api/auth?action=test-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: this.testPhone,
          message: `🧪 Test message from React frontend
          
Timestamp: ${new Date().toLocaleString('id-ID')}
Source: Frontend verification tester

Jika Anda menerima pesan ini, WhatsApp service berfungsi dengan baik! ✅`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ WhatsApp delivery test successful!');
        console.log('   - Provider:', result.data?.provider);
        console.log('   - Message ID:', result.data?.messageId);
        console.log('   - Response:', result.data);
      } else {
        console.log('❌ WhatsApp delivery failed:', result.error);
      }

      return result;

    } catch (error) {
      console.error('❌ WhatsApp delivery test error:', error);
      return { success: false, error: error.message };
    }
  }

  // Test 5: Full end-to-end test
  async testFullFlow() {
    console.log('🎯 Starting FULL END-TO-END Phone Verification Test');
    console.log('=====================================================');

    // Test WhatsApp delivery first
    await this.testWhatsAppDelivery();
    
    // Test signup flow
    const signupResult = await this.testSignupFlow();
    
    if (signupResult.success) {
      console.log('\n🎉 All tests completed successfully!');
      console.log('📋 Next steps:');
      console.log('   1. Check your WhatsApp for verification code');
      console.log('   2. Use window.testVerification(userId, code) to complete test');
      console.log('   3. Or manually test in the UI');
    }

    return signupResult;
  }

  // Test 6: Session validation
  async testSessionValidation() {
    console.log('\n🔒 Testing session validation...');
    
    try {
      const result = await authService.validateSession();
      
      if (result.valid) {
        console.log('✅ Session validation successful!');
        console.log('   - User:', result.user);
        console.log('   - Expires at:', result.expires_at);
      } else {
        console.log('❌ Session validation failed:', result.error);
      }

      return result;

    } catch (error) {
      console.error('❌ Session validation test error:', error);
      return { valid: false, error: error.message };
    }
  }

  // Test 7: Login flow after verification
  async testLogin() {
    console.log('\n🔐 Testing login flow...');
    
    try {
      const loginResult = await authService.login(this.testPhone, this.testPassword);
      
      if (loginResult.error) {
        console.error('❌ Login failed:', loginResult.error);
        return;
      }

      console.log('✅ Login successful!');
      console.log('   - User:', loginResult.user);
      console.log('   - Session token:', loginResult.session_token?.substring(0, 20) + '...');

      return loginResult;

    } catch (error) {
      console.error('❌ Login test failed:', error);
    }
  }

  // Utility: Clean up test data
  async cleanupTestData() {
    console.log('\n🧹 Cleaning up test data...');
    
    try {
      // Logout if logged in
      await authService.logout();
      
      // Clear local storage
      localStorage.removeItem('session_token');
      localStorage.removeItem('user');
      
      console.log('✅ Test data cleaned up');

    } catch (error) {
      console.error('❌ Cleanup failed:', error);
    }
  }
}

// Export untuk global usage
window.ReactPhoneVerificationTester = ReactPhoneVerificationTester;

// Create instance and export helper functions
const tester = new ReactPhoneVerificationTester();

window.testPhoneVerification = () => tester.testFullFlow();
window.testWhatsApp = () => tester.testWhatsAppDelivery();
window.testSignup = () => tester.testSignupFlow();
window.testSession = () => tester.testSessionValidation();
window.testLogin = () => tester.testLogin();
window.cleanupTest = () => tester.cleanupTestData();

console.log('📋 Phone Verification Tester loaded!');
console.log('Available commands:');
console.log('• testPhoneVerification() - Full end-to-end test');
console.log('• testWhatsApp() - Test WhatsApp delivery');
console.log('• testSignup() - Test signup flow only');
console.log('• testSession() - Test session validation');
console.log('• testLogin() - Test login flow');
console.log('• cleanupTest() - Clean up test data');

export default ReactPhoneVerificationTester;
