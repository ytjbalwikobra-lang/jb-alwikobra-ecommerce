#!/bin/bash

# Phone Verification API Test Script
# Test complete flow melalui API endpoints

echo "🧪 Phone Verification API Test Script"
echo "======================================"

# Configuration
API_BASE="http://localhost:3000/api"
TEST_PHONE="+6281234567890"
TEST_PASSWORD="TestPassword123!"
TEST_EMAIL="test@example.com"
TEST_NAME="Test User"

echo "📱 Test Phone: $TEST_PHONE"
echo "🌐 API Base: $API_BASE"
echo ""

# Test 1: Signup
echo "📋 Step 1: Testing Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "$API_BASE/auth?action=signup" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$TEST_PHONE\",\"password\":\"$TEST_PASSWORD\"}")

echo "Signup Response: $SIGNUP_RESPONSE"

# Extract user_id from response
USER_ID=$(echo $SIGNUP_RESPONSE | grep -o '"user_id":"[^"]*"' | cut -d'"' -f4)
echo "Extracted User ID: $USER_ID"
echo ""

if [ -z "$USER_ID" ]; then
  echo "❌ Signup failed or user_id not found"
  exit 1
fi

# Test 2: Test wrong verification code
echo "📋 Step 2: Testing wrong verification code..."
WRONG_VERIFY_RESPONSE=$(curl -s -X POST "$API_BASE/auth?action=verify-phone" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"$USER_ID\",\"verification_code\":\"999999\"}")

echo "Wrong verification response: $WRONG_VERIFY_RESPONSE"
echo ""

# Test 3: WhatsApp delivery test
echo "📋 Step 3: Testing WhatsApp delivery..."
WHATSAPP_RESPONSE=$(curl -s -X POST "$API_BASE/auth?action=test-whatsapp" \
  -H "Content-Type: application/json" \
  -d "{\"phoneNumber\":\"$TEST_PHONE\",\"message\":\"Test message from API test script\"}")

echo "WhatsApp test response: $WHATSAPP_RESPONSE"
echo ""

# Test 4: Manual verification prompt
echo "📋 Step 4: Manual verification needed"
echo "⚠️  Check your WhatsApp for verification code"
echo "📱 Phone: $TEST_PHONE"
echo ""
echo "To continue testing with real verification code, run:"
echo "  curl -X POST '$API_BASE/auth?action=verify-phone' \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"user_id\":\"$USER_ID\",\"verification_code\":\"YOUR_CODE_HERE\"}'"
echo ""

# Test 5: Session validation (should fail since not verified yet)
echo "📋 Step 5: Testing session validation (should fail)..."
SESSION_RESPONSE=$(curl -s -X POST "$API_BASE/auth?action=validate-session" \
  -H "Content-Type: application/json" \
  -d "{\"session_token\":\"dummy_token\"}")

echo "Session validation response: $SESSION_RESPONSE"
echo ""

# Helper function for manual verification
cat << 'EOF' > temp_verify_script.sh
#!/bin/bash
# Helper script untuk manual verification
if [ -z "$1" ]; then
  echo "Usage: ./temp_verify_script.sh <verification_code>"
  exit 1
fi

VERIFICATION_CODE=$1
USER_ID="$USER_ID"
API_BASE="$API_BASE"

echo "🔐 Testing verification with code: $VERIFICATION_CODE"
VERIFY_RESPONSE=$(curl -s -X POST "$API_BASE/auth?action=verify-phone" \
  -H "Content-Type: application/json" \
  -d "{\"user_id\":\"$USER_ID\",\"verification_code\":\"$VERIFICATION_CODE\"}")

echo "Verification response: $VERIFY_RESPONSE"

# Extract session token
SESSION_TOKEN=$(echo $VERIFY_RESPONSE | grep -o '"session_token":"[^"]*"' | cut -d'"' -f4)

if [ ! -z "$SESSION_TOKEN" ]; then
  echo "✅ Verification successful!"
  echo "Session token: ${SESSION_TOKEN:0:20}..."
  
  # Test complete profile
  echo "📝 Testing profile completion..."
  PROFILE_RESPONSE=$(curl -s -X POST "$API_BASE/auth?action=complete-profile" \
    -H "Content-Type: application/json" \
    -d "{\"session_token\":\"$SESSION_TOKEN\",\"name\":\"$TEST_NAME\",\"email\":\"$TEST_EMAIL\"}")
  
  echo "Profile completion response: $PROFILE_RESPONSE"
  
  # Test login
  echo "🔐 Testing login..."
  LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth?action=login" \
    -H "Content-Type: application/json" \
    -d "{\"identifier\":\"$TEST_PHONE\",\"password\":\"$TEST_PASSWORD\"}")
  
  echo "Login response: $LOGIN_RESPONSE"
else
  echo "❌ Verification failed"
fi
EOF

chmod +x temp_verify_script.sh

echo "📋 Manual verification script created: temp_verify_script.sh"
echo "Usage: ./temp_verify_script.sh <verification_code>"
echo ""

echo "🎉 Basic API tests completed!"
echo "📝 Summary:"
echo "  ✅ Signup API tested"
echo "  ✅ Wrong verification tested"
echo "  ✅ WhatsApp delivery tested"
echo "  ⏳ Manual verification pending"
echo ""
echo "🔧 Next steps:"
echo "  1. Check WhatsApp for verification code"
echo "  2. Run: ./temp_verify_script.sh <your_code>"
echo "  3. Complete profile and login will be tested automatically"
