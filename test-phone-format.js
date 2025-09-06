// Test phone number format normalization
// This script tests that phone numbers are properly formatted for the API

function normalizePhoneNumber(phone) {
  return phone.startsWith('+') ? phone.slice(1) : phone;
}

function testPhoneFormatting() {
  const testCases = [
    { input: '+6281234567890', expected: '6281234567890' },
    { input: '6281234567890', expected: '6281234567890' },
    { input: '+62123456789', expected: '62123456789' },
    { input: '62123456789', expected: '62123456789' },
    { input: '+6512345678', expected: '6512345678' },
    { input: '6512345678', expected: '6512345678' }
  ];

  console.log('Testing phone number format normalization...\n');

  testCases.forEach((testCase, index) => {
    const result = normalizePhoneNumber(testCase.input);
    const success = result === testCase.expected;
    
    console.log(`Test ${index + 1}: ${success ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`  Input: ${testCase.input}`);
    console.log(`  Expected: ${testCase.expected}`);
    console.log(`  Result: ${result}`);
    console.log('');
  });

  console.log('Phone format test completed!');
}

testPhoneFormatting();
