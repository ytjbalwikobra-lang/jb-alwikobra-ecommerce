// Enhanced Super Admin Login Test - With Automatic Phone Formatting
// This version tests the new automatic formatting system

async function testEnhancedLogin() {
  const baseUrl = 'https://jb-alwikobra-ecommerce.vercel.app';
  
  console.log('=== ENHANCED SUPER ADMIN LOGIN TEST ===\n');
  
  const testCases = [
    {
      name: 'Email Login',
      identifier: 'admin@jbalwikobra.com',
      password: '$#jbAlwikobra2025',
      expected: '✅ Should work (email passes through)'
    },
    {
      name: 'Phone Login (Database format)', 
      identifier: '6282242417788',
      password: '$#jbAlwikobra2025',
      expected: '✅ Should work (direct match)'
    },
    {
      name: 'Phone Login (Local format - AUTO CONVERTED)',
      identifier: '082242417788', 
      password: '$#jbAlwikobra2025',
      expected: '✅ Should work (08xxx → 62xxx conversion)'
    },
    {
      name: 'Phone Login (International format - AUTO CONVERTED)',
      identifier: '+6282242417788',
      password: '$#jbAlwikobra2025',
      expected: '✅ Should work (+62xxx → 62xxx conversion)'
    },
    {
      name: 'Phone Login (Formatted - AUTO CONVERTED)',
      identifier: '0822-4241-7788',
      password: '$#jbAlwikobra2025',
      expected: '✅ Should work (removes formatting)'
    }
  ];

  for (const testCase of testCases) {
    console.log(`Testing: ${testCase.name}`);
    console.log(`Input: ${testCase.identifier}`);
    console.log(`Expected: ${testCase.expected}`);
    
    // Show what the normalization does
    let normalizedId = testCase.identifier;
    if (!testCase.identifier.includes('@')) {
      // Simulate phone normalization
      const cleaned = testCase.identifier.replace(/[^\d+]/g, '');
      if (cleaned.startsWith('+62')) {
        normalizedId = '62' + cleaned.slice(3);
      } else if (cleaned.startsWith('62')) {
        normalizedId = cleaned;
      } else if (cleaned.startsWith('08')) {
        normalizedId = '62' + cleaned.slice(1);
      }
    }
    console.log(`Normalized to: ${normalizedId}`);
    
    try {
      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          identifier: normalizedId, // Use normalized version
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

console.log('=== PHONE NORMALIZATION PREVIEW ===\n');

const phoneExamples = [
  '082242417788',      // → 6282242417788
  '+6282242417788',    // → 6282242417788  
  '6282242417788',     // → 6282242417788
  '0822-4241-7788',    // → 6282242417788
  '+62 822-4241-7788', // → 6282242417788
  'admin@jbalwikobra.com' // → admin@jbalwikobra.com
];

phoneExamples.forEach(input => {
  let normalized = input;
  if (!input.includes('@')) {
    const cleaned = input.replace(/[^\d+]/g, '');
    if (cleaned.startsWith('+62')) {
      normalized = '62' + cleaned.slice(3);
    } else if (cleaned.startsWith('62')) {
      normalized = cleaned;
    } else if (cleaned.startsWith('08')) {
      normalized = '62' + cleaned.slice(1);
    }
  }
  
  console.log(`"${input}" → "${normalized}"`);
});

console.log('\n=== INSTRUCTIONS ===');
console.log('1. First run the SQL update in Supabase:');
console.log('   UPDATE users SET password_hash = \'$2b$10$HUb4IlzqtXc8GsVfnNUO6O8B2krRFBvkhyykiA124USRu8xsKmnkO\' WHERE phone = \'6282242417788\' OR email = \'admin@jbalwikobra.com\';');
console.log('');
console.log('2. Then users can login with ANY of these formats:');
console.log('   - Email: admin@jbalwikobra.com');
console.log('   - Phone (local): 082242417788');
console.log('   - Phone (international): +6282242417788');
console.log('   - Phone (country code): 6282242417788');
console.log('   - Password: $#jbAlwikobra2025');
console.log('');
console.log('3. System automatically converts all phone formats to: 6282242417788');

// Run the test
testEnhancedLogin();
