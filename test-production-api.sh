#!/bin/bash

# 🔧 QUICK DEBUG - Test Production API Endpoint
# Ganti YOUR_DOMAIN dengan domain production Anda

DOMAIN="your-production-domain.vercel.app"
PRODUCT_ID="REAL-UUID-FROM-SUPABASE"

echo "🧪 Testing production create-invoice endpoint..."
echo "📍 URL: https://$DOMAIN/api/xendit/create-invoice"
echo ""

curl -X POST "https://$DOMAIN/api/xendit/create-invoice" \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "debug-prod-'$(date +%s)'",
    "amount": 25000,
    "order": {
      "product_id": "'$PRODUCT_ID'",
      "customer_name": "Debug Customer",
      "customer_email": "debug@test.com",
      "customer_phone": "081234567890",
      "order_type": "purchase",
      "amount": 25000
    }
  }' \
  -w "\n\n📊 Response Status: %{http_code}\n⏱️  Total Time: %{time_total}s\n" \
  -v

echo ""
echo "🔍 Yang harus dicek:"
echo "1. Response status 200 ✅"
echo "2. Invoice URL returned ✅" 
echo "3. Cek Vercel function logs untuk error ❌"
echo "4. Cek Supabase orders table untuk row baru ❌"
