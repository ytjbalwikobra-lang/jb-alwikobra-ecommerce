#!/bin/bash

# Test Phone Verification Flow di Production
# jbalwikobra.com

BASE_URL="https://www.jbalwikobra.com"
PHONE="+628$(date +%s | tail -c 10)"  # Generate unique phone number
PASSWORD="TestPass123!"
NAME="Test User $(date +%H%M%S)"

echo "🧪 Testing Phone Verification Flow"
echo "📱 Phone: $PHONE"
echo "👤 Name: $NAME"
echo ""

# Step 1: Test Signup
echo "1️⃣ Testing Signup..."
SIGNUP_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth?action=signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"phone\": \"$PHONE\",
    \"password\": \"$PASSWORD\",
    \"name\": \"$NAME\"
  }")

echo "📤 Signup Response: $SIGNUP_RESPONSE"

# Parse user ID if signup successful
USER_ID=$(echo $SIGNUP_RESPONSE | grep -o '"userId":"[^"]*"' | cut -d'"' -f4)

if [ -n "$USER_ID" ]; then
  echo "✅ Signup successful! User ID: $USER_ID"
  echo ""
  
  # Step 2: Test Phone Verification with dummy code
  echo "2️⃣ Testing Phone Verification with dummy code..."
  VERIFY_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth?action=verify-phone" \
    -H "Content-Type: application/json" \
    -d "{
      \"userId\": \"$USER_ID\",
      \"code\": \"123456\"
    }")
  
  echo "📤 Verify Response: $VERIFY_RESPONSE"
  
  # Step 3: Check if verification creates a record
  echo ""
  echo "3️⃣ Testing with different verification codes to see responses..."
  
  for code in "000000" "111111" "999999"; do
    echo "🔐 Testing code: $code"
    RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth?action=verify-phone" \
      -H "Content-Type: application/json" \
      -d "{
        \"userId\": \"$USER_ID\",
        \"code\": \"$code\"
      }")
    echo "📤 Response: $RESPONSE"
  done
  
else
  echo "❌ Signup failed. Checking error details..."
  echo "Error: $SIGNUP_RESPONSE"
  
  # Try with existing phone number to see different error
  echo ""
  echo "🔄 Testing with potentially existing phone..."
  EXISTING_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth?action=signup" \
    -H "Content-Type: application/json" \
    -d "{
      \"phone\": \"+6281234567890\",
      \"password\": \"$PASSWORD\",
      \"name\": \"$NAME\"
    }")
  echo "📤 Existing phone response: $EXISTING_RESPONSE"
fi

# Step 4: Test WhatsApp related endpoints
echo ""
echo "4️⃣ Testing WhatsApp related endpoints..."

echo "🟢 Testing test-whatsapp endpoint..."
WA_TEST_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth?action=test-whatsapp" \
  -H "Content-Type: application/json" \
  -d "{
    \"phone\": \"$PHONE\",
    \"message\": \"Test verification from API test\"
  }")

echo "📤 WhatsApp test response: $WA_TEST_RESPONSE"

echo ""
echo "✅ Test completed!"
echo "📋 Summary:"
echo "   - Tested signup with phone: $PHONE"
echo "   - Tested phone verification flow"
echo "   - Tested WhatsApp integration"
echo "   - All responses logged above"
