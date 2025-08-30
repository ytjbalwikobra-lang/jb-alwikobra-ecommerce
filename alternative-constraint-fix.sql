-- 🚨 ALTERNATIVE FIX - Jika step-by-step masih error

-- Approach 1: Buat unique constraint dengan ALTER TABLE
ALTER TABLE orders 
ADD CONSTRAINT uq_orders_client_external_id 
UNIQUE (client_external_id);

-- Verify constraint ada
SELECT 
  tc.constraint_name, 
  tc.table_name, 
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'orders' 
  AND tc.constraint_type = 'UNIQUE'
  AND kcu.column_name = 'client_external_id';

-- Test upsert dengan constraint
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
