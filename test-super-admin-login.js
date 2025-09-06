// Test Super Admin Login - All Scenarios
// Run this after executing the SQL script

async function testLogin() {
  const baseUrl = 'https://jb-alwikobra-ecommerce.vercel.app';
  
  console.log('=== TESTING SUPER ADMIN LOGIN ===\n');
  
  const testCases = [
    {
      name: 'Email Login',
      identifier: 'admin@jbalwikobra.com',
      password: '$#jbAlwikobra2025'
    },
    {
      name: 'Phone Login (Indonesia format)', 
      identifier: '6282242417788',
      password: '$#jbAlwikobra2025'
    },
    {
      name: 'Phone Login (Local format)',
      identifier: '082242417788', 
      password: '$#jbAlwikobra2025'
    },
    {
      name: 'Phone Login (International format)',
      identifier: '+6282242417788',
      password: '$#jbAlwikobra2025'
    }
  ];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Identifier: ${testCase.identifier}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: testCase.identifier,
          password: testCase.password
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        console.log('✅ SUCCESS!');
        console.log('User:', result.user?.name || result.user?.email);
        console.log('Is Admin:', result.user?.is_admin);
      } else {
        console.log('❌ FAILED:', result.error);
      }
    } catch (error) {
      console.log('❌ ERROR:', error.message);
    }
    
    console.log('---\n');
  }
}

// Test the corrected password hash
const bcrypt = require('bcryptjs');
const password = '$#jbAlwikobra2025';
const newHash = '$2b$10$HUb4IlzqtXc8GsVfnNUO6O8B2krRFBvkhyykiA124USRu8xsKmnkO';

console.log('=== PASSWORD VERIFICATION ===');
bcrypt.compare(password, newHash).then(isMatch => {
  console.log('New hash matches:', isMatch);
  console.log('');
  
  // Run login tests
  testLogin();
});

// Also provide SQL to update existing user
console.log('=== SQL TO UPDATE EXISTING USER ===');
console.log(`
-- Update the password hash for existing user:
UPDATE users 
SET password_hash = '$2b$10$HUb4IlzqtXc8GsVfnNUO6O8B2krRFBvkhyykiA124USRu8xsKmnkO'
WHERE phone = '6282242417788' OR email = 'admin@jbalwikobra.com';

-- Check the updated user:
SELECT phone, email, name, is_admin, is_active, phone_verified, profile_completed 
FROM users 
WHERE phone = '6282242417788' OR email = 'admin@jbalwikobra.com';
`);
