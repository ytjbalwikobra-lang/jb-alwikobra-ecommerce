# 🧪 PRODUCTION TEST SCRIPT

## 📋 Pre-Test Checklist
- ✅ Migration SQL sudah dijalankan di Supabase
- ✅ Code sudah di-push ke main branch  
- ✅ Vercel deployment selesai
- ✅ Environment variables sudah set di Vercel

## 🔗 URLs untuk Testing
Replace `your-domain.vercel.app` dengan domain production Anda:

### 1. Test Website Loading
```
https://your-domain.vercel.app/
```

### 2. Test API Endpoints
```bash
# Test create-invoice endpoint
curl -X POST https://your-domain.vercel.app/api/xendit/create-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "test-prod-001",
    "amount": 50000,
    "order": {
      "product_id": "REAL-UUID-FROM-SUPABASE",
      "customer_name": "Test Customer Production",
      "customer_email": "test@production.com",
      "customer_phone": "081234567890",
      "order_type": "purchase",
      "amount": 50000
    }
  }'
```

## 🛒 Manual Testing Steps

### Step 1: Test Product Listing
1. Buka website production
2. Pastikan ada products yang tampil
3. Cek console browser untuk error

### Step 2: Test Product Detail & Checkout
1. Klik salah satu product → Detail page
2. Isi form checkout dengan data valid:
   - Nama: Test Customer
   - Email: test@production.com  
   - Phone: 081234567890
3. Klik "Beli Sekarang"
4. **PENTING**: Buka browser console (F12) untuk liat logs
5. Pastikan redirect ke Xendit invoice

### Step 3: Verify Order Creation
1. Buka Supabase dashboard → Table Editor → orders
2. Cek apakah ada order baru dengan:
   - ✅ `client_external_id` terisi
   - ✅ `xendit_invoice_id` terisi
   - ✅ `product_id` sesuai
   - ✅ Customer data lengkap

### Step 4: Test Payment (Optional)
1. Bayar invoice di Xendit (gunakan test payment)
2. Tunggu webhook callback
3. Refresh orders table di Supabase
4. Pastikan:
   - ✅ Order status berubah ke "paid" 
   - ✅ Product archived (is_active = false)

## 🔍 Monitoring Locations

### Browser Console Logs
Look for these log patterns:
```
[ProductDetail] Starting checkout...
[ProductDetail] Product ID: uuid-here
[paymentService] Creating invoice...
[paymentService] Invoice created: {...}
```

### Vercel Function Logs
Di Vercel dashboard → Functions → Logs:
```
[createOrderIfProvided] Creating order for external_id: test-prod-001
[createOrderIfProvided] Order created successfully: uuid-here
[create-invoice] Invoice creation successful
```

### Supabase Logs
Di Supabase dashboard → Logs → API:
- INSERT operations pada orders table
- UPDATE operations saat webhook

## ⚠️ Common Issues & Solutions

### Order Tidak Tercatat?
1. Cek Vercel function logs untuk error
2. Verify SUPABASE_SERVICE_ROLE_KEY di environment variables
3. Pastikan product_id adalah UUID yang valid di database

### Products Tidak Tampil?
1. Cek apakah ada data di products table
2. Verify RLS policies allows public read
3. Insert sample data jika database kosong

### Payment Error?
1. Cek XENDIT_SECRET_KEY di environment variables
2. Pastikan webhook URL: `https://domain.vercel.app/api/xendit/webhook`
3. Verify Xendit account settings

## 📊 Success Criteria

### ✅ Complete Success
- Website loads tanpa error
- Product listing tampil
- Checkout flow berhasil buat invoice
- Order tercatat di database dengan complete data
- Payment webhook update order status
- Product auto-archived after payment

### ⚠️ Partial Success  
- Website & checkout works
- Order creation needs debugging
- Manual verification required

### ❌ Failure
- Website tidak load
- Checkout error
- No orders created
- Requires immediate debugging

---

**Ready to test! 🚀**

Setelah Vercel deployment selesai, jalankan test ini step by step.
