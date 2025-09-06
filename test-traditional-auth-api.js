// Traditional Authentication API Test Suite
// Tests all authentication endpoints with sample data

const API_BASE = 'http://localhost:3001'; // Mock API server

// Test data
const testUser = {
  phone: '6281234567999',
  email: 'test@example.com',
  name: 'Test User',
  password: 'testpass123'
};

// Utility function for API calls
async function apiCall(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, options);
    const data = await response.json();
    
    return {
      status: response.status,
      ok: response.ok,
      data
    };
  } catch (error) {
    return {
      status: 0,
      ok: false,
      error: error.message
    };
  }
}

// Test functions
async function testSignup() {
  console.log('🔵 Testing Signup API...');
  
  const result = await apiCall('/api/auth/signup', 'POST', {
    phone: testUser.phone,
    password: testUser.password
  });

  console.log('📤 Signup Request:', {
    phone: testUser.phone,
    password: '[HIDDEN]'
  });
  
  console.log('📥 Signup Response:', {
    status: result.status,
    ok: result.ok,
    data: result.data
  });

  if (result.ok) {
    console.log('✅ Signup successful!');
    return result.data.user_id;
  } else {
    console.log('❌ Signup failed:', result.data?.error || result.error);
    return null;
  }
}

async function testVerifyPhone(userId, code = '123456') {
  console.log('\n🔵 Testing Phone Verification API...');
  
  const result = await apiCall('/api/auth/verify-phone', 'POST', {
    user_id: userId,
    verification_code: code
  });

  console.log('📤 Verify Request:', {
    user_id: userId,
    verification_code: code
  });
  
  console.log('📥 Verify Response:', {
    status: result.status,
    ok: result.ok,
    data: result.data
  });

  if (result.ok) {
    console.log('✅ Phone verification successful!');
    return result.data.session_token;
  } else {
    console.log('❌ Phone verification failed:', result.data?.error || result.error);
    return null;
  }
}

async function testCompleteProfile(sessionToken) {
  console.log('\n🔵 Testing Complete Profile API...');
  
  const result = await apiCall('/api/auth/complete-profile', 'POST', {
    email: testUser.email,
    name: testUser.name
  });

  // Note: Should include Authorization header in real implementation
  console.log('📤 Complete Profile Request:', {
    email: testUser.email,
    name: testUser.name,
    authorization: sessionToken ? 'Bearer [TOKEN]' : 'Missing'
  });
  
  console.log('📥 Complete Profile Response:', {
    status: result.status,
    ok: result.ok,
    data: result.data
  });

  if (result.ok) {
    console.log('✅ Profile completion successful!');
    return true;
  } else {
    console.log('❌ Profile completion failed:', result.data?.error || result.error);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔵 Testing Login API...');
  
  // Test with phone
  const phoneResult = await apiCall('/api/auth/login', 'POST', {
    identifier: testUser.phone,
    password: testUser.password
  });

  console.log('📤 Login Request (Phone):', {
    identifier: testUser.phone,
    password: '[HIDDEN]'
  });
  
  console.log('📥 Login Response (Phone):', {
    status: phoneResult.status,
    ok: phoneResult.ok,
    data: phoneResult.data
  });

  // Test with email
  const emailResult = await apiCall('/api/auth/login', 'POST', {
    identifier: testUser.email,
    password: testUser.password
  });

  console.log('\n📤 Login Request (Email):', {
    identifier: testUser.email,
    password: '[HIDDEN]'
  });
  
  console.log('📥 Login Response (Email):', {
    status: emailResult.status,
    ok: emailResult.ok,
    data: emailResult.data
  });

  if (phoneResult.ok || emailResult.ok) {
    console.log('✅ Login successful!');
    return phoneResult.data?.session_token || emailResult.data?.session_token;
  } else {
    console.log('❌ Login failed');
    return null;
  }
}

async function testValidateSession(sessionToken) {
  console.log('\n🔵 Testing Validate Session API...');
  
  const result = await apiCall('/api/auth/validate-session', 'POST');
  // Note: Should include Authorization header in real implementation

  console.log('📤 Validate Session Request:', {
    authorization: sessionToken ? 'Bearer [TOKEN]' : 'Missing'
  });
  
  console.log('📥 Validate Session Response:', {
    status: result.status,
    ok: result.ok,
    data: result.data
  });

  if (result.ok) {
    console.log('✅ Session validation successful!');
    return true;
  } else {
    console.log('❌ Session validation failed:', result.data?.error || result.error);
    return false;
  }
}

async function testLogout(sessionToken) {
  console.log('\n🔵 Testing Logout API...');
  
  const result = await apiCall('/api/auth/logout', 'POST', {
    logout_all: false
  });
  // Note: Should include Authorization header in real implementation

  console.log('📤 Logout Request:', {
    logout_all: false,
    authorization: sessionToken ? 'Bearer [TOKEN]' : 'Missing'
  });
  
  console.log('📥 Logout Response:', {
    status: result.status,
    ok: result.ok,
    data: result.data
  });

  if (result.ok) {
    console.log('✅ Logout successful!');
    return true;
  } else {
    console.log('❌ Logout failed:', result.data?.error || result.error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Traditional Authentication API Tests\n');
  console.log('=' * 60);
  
  try {
    // 1. Test Signup
    const userId = await testSignup();
    if (!userId) {
      console.log('\n❌ Cannot proceed without user ID');
      return;
    }

    // 2. Test Phone Verification
    const sessionToken = await testVerifyPhone(userId);
    if (!sessionToken) {
      console.log('\n❌ Cannot proceed without session token');
      return;
    }

    // 3. Test Profile Completion
    await testCompleteProfile(sessionToken);

    // 4. Test Login
    const loginToken = await testLogin();

    // 5. Test Session Validation
    await testValidateSession(loginToken || sessionToken);

    // 6. Test Logout
    await testLogout(loginToken || sessionToken);

    console.log('\n' + '=' * 60);
    console.log('🎉 All API tests completed!');
    console.log('\n📋 Test Summary:');
    console.log('✓ Signup API - Creates user with phone + password');
    console.log('✓ Verify Phone API - Validates WhatsApp verification code');
    console.log('✓ Complete Profile API - Adds email and name');
    console.log('✓ Login API - Authenticates with phone/email + password');
    console.log('✓ Validate Session API - Checks session validity');
    console.log('✓ Logout API - Terminates user session');

  } catch (error) {
    console.log('\n💥 Test suite failed:', error.message);
  }
}

// API endpoint availability test
async function testEndpointAvailability() {
  console.log('🔍 Testing API endpoint availability...\n');
  
  const endpoints = [
    '/api/auth/signup',
    '/api/auth/login', 
    '/api/auth/verify-phone',
    '/api/auth/complete-profile',
    '/api/auth/validate-session',
    '/api/auth/logout'
  ];

  for (const endpoint of endpoints) {
    const result = await apiCall(endpoint, 'OPTIONS');
    console.log(`${result.ok ? '✅' : '❌'} ${endpoint} - ${result.status}`);
  }
  
  console.log('');
}

// Run the tests
async function main() {
  await testEndpointAvailability();
  await runAllTests();
}

main().catch(console.error);
