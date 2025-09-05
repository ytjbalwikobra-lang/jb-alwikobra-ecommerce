-- 🚨 URGENT FIX: Unique Constraint Missing di Production

-- ERROR: there is no unique or exclusion constraint matching the ON CONFLICT specification
-- SOLUTION: Add unique constraint untuk client_external_id

-- 1. Pastikan kolom client_external_id ada
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS client_external_id TEXT;

-- 2. PENTING: Buat unique constraint untuk upsert
CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_client_external_id
  ON orders(client_external_id)
  WHERE client_external_id IS NOT NULL;

-- 3. Buat index biasa untuk performance
CREATE INDEX IF NOT EXISTS idx_orders_client_external_id
  ON orders(client_external_id);

-- 4. Verify constraint sudah ada
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname='public' AND tablename='orders' 
AND indexname LIKE '%client_external_id%';

-- 5. Test upsert functionality (manual test)
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
  'test-upsert-001',
  'Test Upsert Customer',
  'test@upsert.com',
  '081234567890',
  'purchase',
  25000,
  'pending',
  'xendit'
)
ON CONFLICT (client_external_id) 
DO UPDATE SET 
  customer_name = EXCLUDED.customer_name,
  amount = EXCLUDED.amount,
  updated_at = NOW();

-- 6. Verify upsert worked
SELECT * FROM orders WHERE client_external_id = 'test-upsert-001';

-- 7. Test upsert lagi (should update, not insert new)
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
  'test-upsert-001',
  'Test Upsert Updated',
  'updated@upsert.com',
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
  amount = EXCLUDED.amount,
  updated_at = NOW();

-- 8. Verify update worked (should be same ID but updated data)
SELECT * FROM orders WHERE client_external_id = 'test-upsert-001';

-- 9. Cleanup
DELETE FROM orders WHERE client_external_id = 'test-upsert-001';
