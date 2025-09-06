const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  for (const line of envLines) {
    if (line.includes('=') && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      const value = valueParts.join('=').replace(/['"]/g, '');
      process.env[key.trim()] = value.trim();
    }
  }
}

console.log('🔐 Testing admin login API...');

async function testAdminLogin() {
  // Test the login API directly
  const loginData = {
    identifier: '6282242417788', // Super admin phone
    password: '$#jbAlwikobra2025' // Super admin password
  };

  try {
    console.log('📞 Testing login with phone:', loginData.identifier);
    
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();
    
    console.log('📊 Response status:', response.status);
    console.log('📋 Response data:', JSON.stringify(data, null, 2));
    
    if (data.user) {
      console.log('\n✅ User data analysis:');
      console.log('- ID:', data.user.id);
      console.log('- Phone:', data.user.phone);
      console.log('- Email:', data.user.email);
      console.log('- Name:', data.user.name);
      console.log('- isAdmin:', data.user.isAdmin);
      console.log('- profileCompleted:', data.user.profile_completed || data.user.profileCompleted);
    }
    
  } catch (error) {
    console.error('❌ Login test failed:', error.message);
  }
}

testAdminLogin();
