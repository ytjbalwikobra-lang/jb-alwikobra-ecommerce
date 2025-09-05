#!/bin/bash

# Test script to simulate a paid order webhook and verify WhatsApp group notification

echo "🧪 Testing WhatsApp Group Notification for Paid Orders"
echo "=================================================="

# Step 1: Create a test order (simulate what happens during checkout)
echo "📋 Step 1: Creating test order..."

TEST_ORDER_DATA='{
  "external_id": "test-whatsapp-group-001",
  "amount": 75000,
  "description": "Test Order for WhatsApp Group Notification",
  "payer_email": "test@example.com",
  "order": {
    "product_id": null,
    "customer_name": "Test Customer",
    "customer_email": "test@example.com", 
    "customer_phone": "081234567890",
    "order_type": "purchase",
    "amount": 75000
  }
}'

# Note: In production, this would be called during checkout process
# curl -X POST "http://localhost:3000/api/xendit/create-invoice" \
#   -H "Content-Type: application/json" \
#   -d "$TEST_ORDER_DATA"

echo "✅ Test order created (simulated)"
echo ""

# Step 2: Simulate webhook payment notification
echo "💳 Step 2: Simulating payment webhook..."

WEBHOOK_PAYLOAD='{
  "id": "test-invoice-123",
  "external_id": "test-whatsapp-group-001", 
  "status": "PAID",
  "paid_at": "'$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")'",
  "amount": 75000,
  "currency": "IDR",
  "payment_channel": "VIRTUAL_ACCOUNT",
  "payer_email": "test@example.com"
}'

echo "🔔 Webhook payload:"
echo "$WEBHOOK_PAYLOAD" | jq .
echo ""

# Send webhook to trigger group notification
echo "📤 Sending webhook to trigger group notification..."

# Note: This would normally be sent by Xendit
# curl -X POST "http://localhost:3000/api/xendit/webhook" \
#   -H "Content-Type: application/json" \
#   -H "x-callback-token: your-webhook-token" \
#   -d "$WEBHOOK_PAYLOAD"

echo "✅ Webhook sent (simulated)"
echo ""

# Step 3: Test direct group notification
echo "📱 Step 3: Testing direct group notification API..."

GROUP_NOTIFICATION_TEST='{
  "orderId": "test-whatsapp-group-001",
  "customerName": "Test Customer", 
  "productName": "Roblox Premium Account + 1000 Robux",
  "amount": "75000"
}'

curl -X POST "http://localhost:3000/api/test-order-group" \
  -H "Content-Type: application/json" \
  -d "$GROUP_NOTIFICATION_TEST"

echo ""
echo ""
echo "🎯 Expected Result:"
echo "- WhatsApp group 'ORDERAN WEBSITE' should receive notification"
echo "- Message should contain customer info, product, amount, and 'PAID' status"
echo "- Team should be able to process the order immediately"
echo ""
echo "📱 Check WhatsApp group for the notification message!"
echo "=================================================="
