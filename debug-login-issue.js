// Debug Super Admin Login Issue
// This script helps identify why login is failing

const bcrypt = require('bcryptjs');

// 1. Test the password hash
console.log('=== PASSWORD HASH TEST ===');
const expectedPassword = '$#jbAlwikobra2025';
const storedHash = '$2b$10$wCfPC4CdjfSSc.lW8Nc5FOoCYCijk8cZgjbFqP.9bJJqrRCVTW60m';

bcrypt.compare(expectedPassword, storedHash).then(isMatch => {
  console.log('Password match:', isMatch);
  if (!isMatch) {
    console.log('❌ Password hash does not match!');
    // Generate a new hash for comparison
    const newHash = bcrypt.hashSync(expectedPassword, 10);
    console.log('New hash should be:', newHash);
  } else {
    console.log('✅ Password hash is correct');
  }
});

// 2. Test phone number format
console.log('\n=== PHONE FORMAT TEST ===');
const inputFormats = [
  '082242417788',    // User input format
  '6282242417788',   // Database format  
  '+6282242417788'   // International format
];

const phoneRegex = /^62[0-9]{9,13}$/;

inputFormats.forEach(phone => {
  const isValid = phoneRegex.test(phone);
  console.log(`${phone} -> Valid: ${isValid}`);
});

// 3. Show what the TraditionalAuthContext should send
console.log('\n=== EXPECTED API CALLS ===');
console.log('Phone login should send:');
console.log('- identifier: "6282242417788" (without +)');
console.log('- password: "$#jbAlwikobra2025"');

console.log('\nEmail login should send:');
console.log('- identifier: "admin@jbalwikobra.com"'); 
console.log('- password: "$#jbAlwikobra2025"');

// 4. Database check SQL
console.log('\n=== DATABASE CHECK SQL ===');
console.log(`
-- Run this in Supabase SQL editor to check if user exists:
SELECT 
  id, 
  phone, 
  email, 
  name,
  password_hash,
  phone_verified,
  profile_completed,
  is_admin,
  is_active,
  login_attempts,
  locked_until,
  created_at
FROM users 
WHERE phone = '6282242417788' OR email = 'admin@jbalwikobra.com';
`);
