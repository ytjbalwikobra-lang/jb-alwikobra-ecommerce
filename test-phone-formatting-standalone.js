// Test Phone Number Automatic Formatting - Standalone Version

// Phone normalization function (copied from utils)
function normalizeIndonesianPhone(input) {
  const cleaned = input.replace(/[^\d+]/g, '');
  
  const result = {
    normalized: '',
    isValid: false,
    originalFormat: 'invalid',
    displayFormat: input
  };

  if (!cleaned) return result;

  if (cleaned.startsWith('+62')) {
    const number = cleaned.slice(3);
    if (number.length >= 9 && number.length <= 13 && /^8[1-9]\d{7,11}$/.test(number)) {
      result.normalized = '62' + number;
      result.isValid = true;
      result.originalFormat = 'international';
      result.displayFormat = formatDisplayPhone(result.normalized);
      return result;
    }
  } else if (cleaned.startsWith('62')) {
    const number = cleaned.slice(2);
    if (number.length >= 9 && number.length <= 13 && /^8[1-9]\d{7,11}$/.test(number)) {
      result.normalized = cleaned;
      result.isValid = true;
      result.originalFormat = 'country-code';
      result.displayFormat = formatDisplayPhone(result.normalized);
      return result;
    }
  } else if (cleaned.startsWith('08')) {
    const number = cleaned.slice(1);
    if (number.length >= 9 && number.length <= 13 && /^8[1-9]\d{7,11}$/.test(number)) {
      result.normalized = '62' + number;
      result.isValid = true;
      result.originalFormat = 'local';
      result.displayFormat = formatDisplayPhone(result.normalized);
      return result;
    }
  }

  return result;
}

function formatDisplayPhone(normalizedPhone) {
  if (!normalizedPhone.startsWith('62')) return normalizedPhone;
  
  const number = normalizedPhone.slice(2);
  
  if (number.length >= 10) {
    return `+62 ${number.slice(0, 3)}-${number.slice(3, 7)}-${number.slice(7)}`;
  } else if (number.length >= 7) {
    return `+62 ${number.slice(0, 3)}-${number.slice(3)}`;
  } else {
    return `+62 ${number}`;
  }
}

function isPhoneNumber(input) {
  const cleaned = input.replace(/[^\d+]/g, '');
  return /^(\+?62|0?8)\d{8,12}$/.test(cleaned);
}

function normalizeLoginIdentifier(identifier) {
  if (isPhoneNumber(identifier)) {
    const result = normalizeIndonesianPhone(identifier);
    return result.isValid ? result.normalized : identifier;
  }
  
  return identifier.trim().toLowerCase();
}

// ===== TESTS =====

console.log('=== PHONE NUMBER AUTOMATIC FORMATTING TEST ===\n');

const testCases = [
  '08123456789',
  '082242417788',  // Super admin phone
  '+6282242417788',
  '6282242417788',
  'admin@jbalwikobra.com',
  '08574567890',
  '+62123456789',
  '62123456789',
  '0812 3456 789',
  '+62 812-3456-789',
  '123456789',  // Invalid
  '+1234567890' // Invalid
];

testCases.forEach(input => {
  console.log(`Input: "${input}"`);
  
  const phoneResult = normalizeIndonesianPhone(input);
  const loginId = normalizeLoginIdentifier(input);
  
  console.log(`  Normalized: ${phoneResult.normalized || 'N/A'}`);
  console.log(`  Valid: ${phoneResult.isValid ? '✅' : '❌'}`);
  console.log(`  Format: ${phoneResult.originalFormat}`);
  console.log(`  Display: ${phoneResult.displayFormat}`);
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

console.log('=== SUPER ADMIN LOGIN SCENARIOS ===\n');

const superAdminTests = [
  { input: '082242417788', desc: 'Local format (what user might type)' },
  { input: '+6282242417788', desc: 'International format' },
  { input: '6282242417788', desc: 'Country code format (in database)' },
  { input: 'admin@jbalwikobra.com', desc: 'Email format' }
];

superAdminTests.forEach(test => {
  const normalized = normalizeLoginIdentifier(test.input);
  const dbMatch = normalized === '6282242417788' || normalized === 'admin@jbalwikobra.com';
  
  console.log(`${test.desc}:`);
  console.log(`  Input: "${test.input}"`);
  console.log(`  Normalized: "${normalized}"`);
  console.log(`  DB Match: ${dbMatch ? '✅ YES' : '❌ NO'}`);
  console.log('');
});

console.log('=== HOW IT WORKS ===');
console.log('1. User types any format: 08xxx, +62xxx, 62xxx');
console.log('2. System normalizes to: 62xxx (for API/DB)');
console.log('3. Display shows: +62 8xx-xxxx-xxxx');
console.log('4. Login succeeds with any input format!');
