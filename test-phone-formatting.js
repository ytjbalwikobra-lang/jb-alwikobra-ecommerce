// Test Phone Number Automatic Formatting
// This script demonstrates how the phone formatting works

const { normalizeIndonesianPhone, formatDisplayPhone, normalizeLoginIdentifier } = require('./src/utils/phoneUtils');

console.log('=== PHONE NUMBER AUTOMATIC FORMATTING TEST ===\n');

const testCases = [
  // Local Indonesian formats
  '08123456789',
  '082242417788',
  '08574567890',
  '08111234567',
  
  // International formats
  '+62123456789',
  '+6282242417788',
  '+6281234567890',
  
  // Country code formats
  '62123456789',
  '6282242417788',
  '621234567890',
  
  // Edge cases
  '0812 3456 789',
  '+62 812-3456-789',
  '62-812-3456-789',
  '08-812-3456-789', // Invalid (double 08)
  
  // Non-phone inputs
  'admin@jbalwikobra.com',
  'user@example.com',
  
  // Invalid formats
  '123456789',
  '+1234567890',
  '12345'
];

console.log('Format Legend:');
console.log('✅ = Valid and normalized');
console.log('❌ = Invalid format');
console.log('📧 = Email (passed through)');
console.log('');

testCases.forEach(input => {
  console.log(`Input: "${input}"`);
  
  // Test phone normalization
  const phoneResult = normalizeIndonesianPhone(input);
  console.log(`  Phone Analysis:`);
  console.log(`    Normalized: ${phoneResult.normalized || 'N/A'}`);
  console.log(`    Valid: ${phoneResult.isValid ? '✅' : '❌'}`);
  console.log(`    Format: ${phoneResult.originalFormat}`);
  console.log(`    Display: ${phoneResult.displayFormat}`);
  
  // Test login identifier normalization
  const loginId = normalizeLoginIdentifier(input);
  console.log(`  Login ID: "${loginId}"`);
  
  if (input.includes('@')) {
    console.log(`  Type: 📧 Email`);
  } else if (phoneResult.isValid) {
    console.log(`  Type: ✅ Valid Phone`);
  } else {
    console.log(`  Type: ❌ Invalid`);
  }
  
  console.log('');
});

console.log('=== SUPER ADMIN TEST SCENARIOS ===\n');

const superAdminTests = [
  {
    input: '082242417788',
    description: 'Local format (what user types)'
  },
  {
    input: '+6282242417788', 
    description: 'International format'
  },
  {
    input: '6282242417788',
    description: 'Country code format (stored in DB)'
  },
  {
    input: 'admin@jbalwikobra.com',
    description: 'Email format'
  }
];

superAdminTests.forEach(test => {
  const normalized = normalizeLoginIdentifier(test.input);
  console.log(`${test.description}:`);
  console.log(`  Input: "${test.input}"`);
  console.log(`  Normalized: "${normalized}"`);
  console.log(`  Will match DB: ${normalized === '6282242417788' || normalized === 'admin@jbalwikobra.com' ? '✅' : '❌'}`);
  console.log('');
});

console.log('=== DISPLAY FORMATTING EXAMPLES ===\n');

const displayExamples = [
  '6282242417788',
  '6281234567890',
  '6285555123456'
];

displayExamples.forEach(phone => {
  const formatted = formatDisplayPhone(phone);
  console.log(`Database: ${phone} → Display: ${formatted}`);
});

console.log('\n=== USAGE SUMMARY ===');
console.log('1. User can type: 08xxx, +62xxx, or 62xxx');
console.log('2. System automatically converts to: 62xxx (for API)');
console.log('3. Display shows: +62 8xx-xxxx-xxxx (formatted)');
console.log('4. Login works with any input format');
console.log('5. Email addresses pass through unchanged');
