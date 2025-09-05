// Test UUID validation dalam payment flow
const https = require('https');
const http = require('http');

// Test data dengan berbagai format product_id
const testCases = [
  {
    name: "Valid UUID",
    data: {
      product_id: "123e4567-e89b-12d3-a456-426614174000",
      name: "Test Product Valid UUID",
      email: "test@example.com",
      phone: "081234567890",
      amount: 100000
    }
  },
  {
    name: "Invalid UUID (regular string)",
    data: {
      product_id: "invalid-product-id-string",
      name: "Test Product Invalid UUID",
      email: "test2@example.com", 
      phone: "081234567891",
      amount: 150000
    }
  },
  {
    name: "No product_id",
    data: {
      name: "Test Product No ID",
      email: "test3@example.com",
      phone: "081234567892", 
      amount: 200000
    }
  },
  {
    name: "Empty string product_id",
    data: {
      product_id: "",
      name: "Test Product Empty ID",
      email: "test4@example.com",
      phone: "081234567893",
      amount: 250000
    }
  }
];

function testUUIDValidation(testCase, callback) {
  const postData = JSON.stringify(testCase.data);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/xendit/create-invoice',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log(`\n🧪 Testing: ${testCase.name}`);
  console.log(`📝 Data:`, testCase.data);

  const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
      responseData += chunk;
    });
    
    res.on('end', () => {
      console.log(`📊 Status: ${res.statusCode}`);
      try {
        const response = JSON.parse(responseData);
        console.log(`📄 Response:`, response);
      } catch (e) {
        console.log(`📄 Raw Response:`, responseData);
      }
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      if (callback) callback();
    });
  });

  req.on('error', (e) => {
    console.error(`❌ Error for ${testCase.name}:`, e.message);
    if (callback) callback();
  });

  req.write(postData);
  req.end();
}

// Run tests sequentially
let currentTest = 0;

function runNextTest() {
  if (currentTest < testCases.length) {
    testUUIDValidation(testCases[currentTest], () => {
      currentTest++;
      setTimeout(runNextTest, 1000); // Wait 1 second between tests
    });
  } else {
    console.log('\n✅ All UUID validation tests completed!');
    console.log('\n📋 Summary:');
    console.log('1. Check server console logs for detailed validation info');
    console.log('2. Orders with invalid UUIDs should be created with product_id = null');
    console.log('3. Orders with valid UUIDs should be created with proper product_id');
    console.log('4. No orders should fail due to UUID validation errors');
  }
}

console.log('🚀 Starting UUID validation tests...');
console.log('💡 Make sure development server is running on http://localhost:3000');
console.log('📋 Testing 4 different UUID scenarios:\n');

runNextTest();
