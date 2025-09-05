-- 🔍 DEBUG CONSTRAINT ISSUE - Cek detail constraint yang dibuat

-- 1. Cek semua indexes di orders table
SELECT 
  indexname, 
  indexdef,
  indisunique as is_unique
FROM pg_indexes 
JOIN pg_class ON pg_indexes.indexname = pg_class.relname
JOIN pg_index ON pg_class.oid = pg_index.indexrelid
WHERE schemaname='public' AND tablename='orders'
ORDER BY indexname;

-- 2. Cek constraints yang ada
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name,
  tc.table_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'orders' 
  AND tc.constraint_type IN ('UNIQUE', 'PRIMARY KEY')
ORDER BY tc.constraint_name;

-- 3. Cek specific index yang kita buat
SELECT 
  i.relname as index_name,
  a.attname as column_name,
  ix.indisunique as is_unique,
  ix.indisprimary as is_primary,
  pg_get_indexdef(ix.indexrelid) as index_definition
FROM pg_class t
JOIN pg_index ix ON t.oid = ix.indrelid
JOIN pg_class i ON i.oid = ix.indexrelid
JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(ix.indkey)
WHERE t.relname = 'orders'
  AND i.relname = 'uq_orders_client_external_id';

-- 4. Test alternative constraint approach
-- Drop existing index jika ada issue
DROP INDEX IF EXISTS uq_orders_client_external_id;

-- 5. Buat constraint dengan ALTER TABLE approach
ALTER TABLE orders 
ADD CONSTRAINT uq_orders_client_external_id_alt 
UNIQUE (client_external_id);

-- 6. Verify constraint baru
SELECT 
  tc.constraint_name, 
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'orders' 
  AND tc.constraint_type = 'UNIQUE'
  AND kcu.column_name = 'client_external_id';

-- 7. Test upsert dengan constraint baru
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
  'test-constraint-001',
  'Test Constraint Customer',
  'test@constraint.com',
  '081234567890',
  'purchase',
  25000,
  'pending',
  'xendit'
)
ON CONFLICT (client_external_id) 
DO UPDATE SET 
  customer_name = EXCLUDED.customer_name,
  amount = EXCLUDED.amount;

-- 8. Verify
SELECT * FROM orders WHERE client_external_id = 'test-constraint-001';

-- 9. Cleanup
DELETE FROM orders WHERE client_external_id = 'test-constraint-001';
