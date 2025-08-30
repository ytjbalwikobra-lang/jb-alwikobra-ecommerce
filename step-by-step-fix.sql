-- 🔧 STEP BY STEP FIX - Jalankan satu per satu

-- STEP 1: Cek apakah kolom client_external_id sudah ada
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema='public' AND table_name='orders' 
AND column_name='client_external_id';

-- STEP 2: Add kolom jika belum ada
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS client_external_id TEXT;

-- STEP 3: Cek lagi setelah add
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_schema='public' AND table_name='orders' 
AND column_name='client_external_id';

-- STEP 4: Cek apakah ada index existing
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname='public' AND tablename='orders' 
AND indexname LIKE '%client_external_id%';

-- STEP 5: Buat unique constraint (CRITICAL STEP)
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_client_external_id
  ON orders(client_external_id)
  WHERE client_external_id IS NOT NULL;

-- STEP 6: Verify unique constraint berhasil dibuat
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname='public' AND tablename='orders' 
AND indexname = 'uq_orders_client_external_id';

-- STEP 7: Test simple insert dulu (tanpa conflict)
INSERT INTO orders (
  client_external_id,
  customer_name,
  customer_email,
  customer_phone,
  order_type,
  amount,
  status,
  payment_method
) VALUES (
  'test-simple-001',
  'Test Simple Customer',
  'test@simple.com',
  '081234567890',
  'purchase',
  25000,
  'pending',
  'xendit'
);

-- STEP 8: Verify insert berhasil
SELECT * FROM orders WHERE client_external_id = 'test-simple-001';

-- STEP 9: Test upsert dengan constraint yang sudah ada
INSERT INTO orders (
  client_external_id,
  customer_name,
  customer_email,
  customer_phone,
  order_type,
  amount,
  status,
  payment_method
) VALUES (
  'test-simple-001',
  'Test Updated Customer',
  'updated@simple.com',
  '081234567890',
  'purchase',
  35000,
  'pending',
  'xendit'
)
ON CONFLICT (client_external_id) 
DO UPDATE SET 
  customer_name = EXCLUDED.customer_name,
  customer_email = EXCLUDED.customer_email,
  amount = EXCLUDED.amount;

-- STEP 10: Verify upsert worked (should be same ID, updated data)
SELECT * FROM orders WHERE client_external_id = 'test-simple-001';

-- STEP 11: Cleanup
DELETE FROM orders WHERE client_external_id = 'test-simple-001';
