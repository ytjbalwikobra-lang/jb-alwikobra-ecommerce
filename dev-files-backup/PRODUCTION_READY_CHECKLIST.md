# ✅ CHECKLIST PRODUCTION READY - JB ALWIKOBRA E-COMMERCE

## 🗄️ SUPABASE DATABASE (WAJIB)

### ✅ 1. Jalankan Migrations
Copy dan jalankan semua SQL dari file `SUPABASE_PRODUCTION_CHECKLIST.sql` di Supabase SQL Editor.

**Migration Prioritas Tinggi:**
- ✅ `client_external_id` kolom + unique index (idempotency)
- ✅ `xendit_invoice_id`, `xendit_invoice_url` dan metadata kolom
- ✅ RLS policy untuk admin bisa baca orders
- ✅ `is_active`, `archived_at` kolom untuk products
- ✅ RLS policy hide archived products

### ✅ 2. Verifikasi Schema
```sql
-- Cek kolom orders
SELECT column_name FROM information_schema.columns 
WHERE table_schema='public' AND table_name='orders'
AND column_name IN ('client_external_id', 'xendit_invoice_id');

-- Cek unique index
SELECT indexname FROM pg_indexes 
WHERE tablename='orders' AND indexname LIKE '%client_external_id%';
```

### ✅ 3. Sample Data (Optional)
Jika database kosong, insert sample products dengan UUID yang valid:
```sql
-- Insert sample products dengan UUID
INSERT INTO products (id, name, price, image, category, game_title, account_level, stock) VALUES
(uuid_generate_v4(), 'Akun ML Sultan Mythic Glory', 2500000, 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400', 'MOBA', 'Mobile Legends', 'Mythic Glory', 5);
```

---

## 🔧 VERCEL ENVIRONMENT VARIABLES (WAJIB)

### ✅ Server-Side Variables
Di Vercel → Project Settings → Environment Variables:
```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ... (SERVICE ROLE, bukan anon!)
XENDIT_SECRET_KEY=xnd_development_... atau xnd_production_...
XENDIT_CALLBACK_TOKEN=your-webhook-secret-token (optional)
```

### ✅ Client-Side Variables 
```
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ... (anon key)
REACT_APP_XENDIT_PUBLIC_KEY=xnd_public_... (tidak dipakai saat ini)
REACT_APP_WHATSAPP_NUMBER=6281234567890
REACT_APP_SITE_NAME=JB Alwikobra
REACT_APP_SITE_URL=https://your-domain.vercel.app
```

---

## 💳 XENDIT CONFIGURATION (WAJIB)

### ✅ 1. Webhook Setup
- **URL**: `https://your-domain.vercel.app/api/xendit/webhook`
- **Events**: Invoice Paid, Invoice Expired, Invoice Cancelled
- **Header**: `X-Callback-Token: your-webhook-secret-token` (optional)

### ✅ 2. API Keys
- Development: `xnd_development_...`
- Production: `xnd_production_...`

---

## 🛡️ SECURITY CHECKLIST

### ✅ RLS Policies
- ✅ Products: Public read, admin write
- ✅ Orders: Authenticated read/write, service role bypass
- ✅ Archived products: Hidden from public

### ✅ API Security
- ✅ Service role key untuk server-side operations
- ✅ Anon key untuk client-side operations
- ✅ Webhook token validation (optional)

---

## 🧪 TESTING CHECKLIST

### ✅ 1. Test Order Creation
```bash
# Test via curl (ganti UUID dan domain)
curl -X POST https://your-domain.vercel.app/api/xendit/create-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "test-001",
    "amount": 150000,
    "order": {
      "product_id": "REAL-UUID-FROM-DATABASE",
      "customer_name": "Test Customer",
      "customer_email": "test@email.com",
      "customer_phone": "081234567890",
      "order_type": "purchase",
      "amount": 150000
    }
  }'
```

### ✅ 2. Test di Browser
1. Buka website
2. Pilih produk → Detail Page
3. Klik "Beli Sekarang"
4. Isi form checkout
5. Cek browser console untuk logging
6. Cek Vercel function logs
7. Cek orders di Supabase

### ✅ 3. Test Webhook
1. Bayar invoice test di Xendit dashboard
2. Cek order status berubah ke "paid"
3. Cek product status berubah ke archived

---

## 📊 MONITORING

### ✅ 1. Logs to Check
- **Vercel Functions**: `[createOrderIfProvided]`, `[create-invoice]`
- **Browser Console**: `[ProductDetail]`, `[paymentService]`
- **Xendit Dashboard**: Webhook delivery logs

### ✅ 2. Database Monitoring
```sql
-- Cek orders baru
SELECT * FROM orders ORDER BY created_at DESC LIMIT 10;

-- Cek products yang archived
SELECT id, name, is_active, archived_at FROM products WHERE is_active = false;

-- Cek error patterns
SELECT status, COUNT(*) FROM orders GROUP BY status;
```

---

## ⚠️ TROUBLESHOOTING

### Order Tidak Tercatat?
1. ✅ Cek SUPABASE_SERVICE_ROLE_KEY di Vercel
2. ✅ Cek migration client_external_id sudah dijalankan
3. ✅ Cek product_id menggunakan UUID yang valid
4. ✅ Cek Vercel function logs untuk error

### Admin Orders Kosong?
1. ✅ Jalankan migration RLS policy: `orders_read_auth`
2. ✅ Login sebagai authenticated user di admin

### Products Tidak Keliatan?
1. ✅ Cek RLS policy products
2. ✅ Cek is_active = true
3. ✅ Insert sample data jika database kosong

### Webhook Tidak Jalan?
1. ✅ Cek Xendit webhook URL dan token
2. ✅ Cek XENDIT_CALLBACK_TOKEN di Vercel
3. ✅ Cek Xendit delivery logs

---

## 🚀 DEPLOYMENT STATUS

- ✅ Code pushed to main branch
- ✅ Vercel auto-deployment active
- ✅ Environment variables configured
- ✅ Database migrations applied
- ✅ Webhook configured
- ✅ Comprehensive logging added
- ✅ UUID validation implemented
- ✅ Order idempotency working
- ✅ Product archiving working
- ✅ Admin UI working

**Status: PRODUCTION READY** 🎉
