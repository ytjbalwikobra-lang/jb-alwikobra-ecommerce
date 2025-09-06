// Test auth API endpoints locally
console.log('🔧 Testing Auth API Endpoints...');

const testLoginAPI = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'test@example.com',
        password: 'testpassword'
      })
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Response text:', text);
    
    try {
      const json = JSON.parse(text);
      console.log('Parsed JSON:', json);
    } catch (e) {
      console.log('Failed to parse as JSON:', e.message);
    }
    
  } catch (error) {
    console.error('Network error:', error);
  }
};

// Test production endpoint
const testProductionAPI = async () => {
  try {
    const response = await fetch('https://www.jbalwikobra.com/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        identifier: 'test@example.com',
        password: 'testpassword'
      })
    });

    console.log('Production Response status:', response.status);
    console.log('Production Response headers:', Object.fromEntries(response.headers.entries()));
    
    const text = await response.text();
    console.log('Production Response text (first 200 chars):', text.substring(0, 200));
    
  } catch (error) {
    console.error('Production Network error:', error);
  }
};

console.log('Testing production endpoint...');
testProductionAPI();
