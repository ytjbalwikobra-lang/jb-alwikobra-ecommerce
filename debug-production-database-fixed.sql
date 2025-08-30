-- 🔍 FIXED DEBUG QUERIES - Jalankan di Supabase SQL Editor

-- 0. PERTAMA: Cek struktur tabel orders yang sebenarnya
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema='public' AND table_name='orders'
ORDER BY ordinal_position;

-- 1. Cek apakah migration baru sudah applied
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_schema='public' AND table_name='orders'
AND column_name IN ('client_external_id', 'xendit_invoice_id', 'xendit_invoice_url', 'user_id')
ORDER BY column_name;

-- 2. Cek unique index untuk idempotency
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname='public' AND tablename='orders' 
AND indexname LIKE '%client_external_id%';

-- 3. Cek RLS policies yang mungkin blocking
SELECT schemaname, tablename, policyname, cmd, permissive, roles, qual
FROM pg_policies 
WHERE schemaname='public' AND tablename='orders'
ORDER BY policyname;

-- 4. Cek apakah ada orders recent (last 1 hour) - FIXED
SELECT 
  id, 
  client_external_id,
  product_id,
  customer_name,
  customer_email,
  amount,
  status,
  payment_method,
  created_at,
  xendit_invoice_id
FROM orders 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;

-- 5. Cek semua orders (jika tidak ada recent)
SELECT 
  id, 
  client_external_id,
  customer_name,
  customer_email,
  amount,
  status,
  created_at
FROM orders 
ORDER BY created_at DESC
LIMIT 10;

-- 6. Test manual insert untuk cek permission - FIXED
-- (Ini akan error jika service role tidak bisa insert)
INSERT INTO orders (
  id,
  client_external_id,
  product_id, 
  customer_name,
  customer_email,
  customer_phone,
  order_type,
  amount,
  status,
  payment_method,
  created_at
) VALUES (
  uuid_generate_v4(),
  'manual-client-' || extract(epoch from now()),
  (SELECT id FROM products LIMIT 1),
  'Manual Test Customer',
  'manual@test.com',
  '081234567890',
  'purchase',
  50000,
  'pending',
  'xendit',
  NOW()
);

-- 7. Cek hasil manual insert
SELECT * FROM orders WHERE customer_name = 'Manual Test Customer';

-- 8. Cleanup manual test
DELETE FROM orders WHERE customer_name = 'Manual Test Customer';

-- 9. BONUS: Cek apakah ada products dengan UUID valid
SELECT id, name, price FROM products LIMIT 5;
