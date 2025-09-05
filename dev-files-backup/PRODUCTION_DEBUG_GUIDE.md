# 🚨 CRITICAL PRODUCTION DEBUG

## 🔍 **STEP 1: CEK VERCEL FUNCTION LOGS**

**PALING PENTING! Ini akan tunjukkan error sesungguhnya.**

1. Buka https://vercel.com/dashboard
2. Pilih project `jb-alwikobra-ecommerce`
3. Tab **Functions** → **View Function Logs**
4. Filter by: `api/xendit/create-invoice`
5. Look for recent logs dengan pattern:
   ```
   [createOrderIfProvided] Missing SUPABASE_SERVICE_ROLE_KEY env var
   [createOrderIfProvided] Error checking existing order: 
   [createOrderIfProvided] Insert error:
   ```

## 🔧 **STEP 2: VERIFY ENVIRONMENT VARIABLES**

**Di Vercel Dashboard → Project Settings → Environment Variables:**

Check ada SEMUA ini:
```
✅ SUPABASE_URL=https://xxxxx.supabase.co
✅ SUPABASE_SERVICE_ROLE_KEY=eyJhbGc... (SERVICE ROLE KEY!)
✅ XENDIT_SECRET_KEY=xnd_development_... atau xnd_production_...
✅ REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co  
✅ REACT_APP_SUPABASE_ANON_KEY=eyJhbGc... (ANON KEY)
```

**❌ COMMON MISTAKE:**
- SUPABASE_SERVICE_ROLE_KEY pakai anon key (salah!)
- Missing environment variables
- Environment variables hanya di Preview/Development, tidak di Production

## 🔍 **STEP 3: TEST API MANUAL**

Ganti `YOUR_DOMAIN` dan `REAL_UUID`:

```bash
curl -X POST https://YOUR_DOMAIN.vercel.app/api/xendit/create-invoice \
  -H "Content-Type: application/json" \
  -d '{
    "external_id": "debug-test-001",
    "amount": 50000,
    "order": {
      "product_id": "REAL_UUID_FROM_SUPABASE",
      "customer_name": "Debug Test",
      "customer_email": "debug@test.com", 
      "customer_phone": "081234567890",
      "order_type": "purchase",
      "amount": 50000
    }
  }' -v
```

**Expected Response:**
```json
{
  "invoice_url": "https://checkout.xendit.co/web/xxxxx",
  "external_id": "debug-test-001"
}
```

## 🗄️ **STEP 4: CHECK DATABASE**

**Di Supabase SQL Editor, jalankan:**

```sql
-- Cek migration applied
SELECT column_name FROM information_schema.columns 
WHERE table_name='orders' AND column_name='client_external_id';

-- Cek recent orders
SELECT id, external_id, client_external_id, customer_name, created_at 
FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- Test manual insert (untuk test permission)
INSERT INTO orders (
  external_id, client_external_id, customer_name, 
  customer_email, amount, status
) VALUES (
  'manual-test', 'manual-client', 'Test Manual',
  'test@manual.com', 50000, 'pending'
);
```

## 🎯 **LIKELY ROOT CAUSES:**

### 1. **Missing SUPABASE_SERVICE_ROLE_KEY** (90% likely)
- Environment variable tidak ada di Vercel
- Atau pakai anon key instead of service role key

### 2. **Environment Variables Scope Issue**
- Variables hanya di Development, tidak di Production
- Vercel perlu redeploy setelah add env vars

### 3. **Database Migration Not Applied**
- `client_external_id` column tidak ada
- Unique constraint tidak ada

### 4. **RLS Policy Blocking**
- Service role tidak bisa insert ke orders table
- RLS policy terlalu restrictive

## ⚡ **QUICK FIXES:**

### Fix 1: Environment Variables
```
1. Vercel Dashboard → Project Settings → Environment Variables
2. Add SUPABASE_SERVICE_ROLE_KEY (bukan anon key!)
3. Set untuk Production environment
4. Redeploy atau trigger new deployment
```

### Fix 2: Database Permission
```sql
-- Di Supabase SQL Editor
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
-- Test insert lagi
-- Jika berhasil, berarti RLS issue
```

### Fix 3: Manual Order Test
```sql
-- Test basic insert permission
INSERT INTO orders (external_id, amount, status) 
VALUES ('test-permission', 50000, 'pending');
```

---

**🚨 ACTION PLAN:**

1. **CHECK VERCEL LOGS FIRST** - This will show exact error
2. **VERIFY SERVICE_ROLE_KEY** - Most common issue  
3. **RUN DATABASE TESTS** - Confirm migration & permission
4. **TEST API AGAIN** - After fixes applied

**Report back dengan screenshot Vercel logs atau error message!**
