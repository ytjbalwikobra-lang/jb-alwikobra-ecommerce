-- 🚨 SIMPLE PRODUCTION TEST - Jalankan step by step

-- STEP 1: Cek tabel orders exist dan structurenya
SELECT table_name FROM information_schema.tables 
WHERE table_schema='public' AND table_name='orders';

-- STEP 2: Cek kolom yang ada di orders  
SELECT column_name FROM information_schema.columns 
WHERE table_schema='public' AND table_name='orders'
ORDER BY ordinal_position;

-- STEP 3: Cek apakah ada migration columns
SELECT 
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='orders' AND column_name='client_external_id'
  ) THEN '✅ client_external_id EXISTS' 
  ELSE '❌ client_external_id MISSING' END as client_external_id_status,
  
  CASE WHEN EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='orders' AND column_name='xendit_invoice_id'
  ) THEN '✅ xendit_invoice_id EXISTS' 
  ELSE '❌ xendit_invoice_id MISSING' END as xendit_invoice_id_status;

-- STEP 4: Test basic SELECT permission
SELECT COUNT(*) as total_orders FROM orders;

-- STEP 5: Test INSERT permission (paling penting!)
-- Jika ini error = permission issue or RLS blocking
INSERT INTO orders (
  customer_name,
  customer_email, 
  customer_phone,
  order_type,
  amount,
  status,
  payment_method
) VALUES (
  'Test Permission',
  'test@permission.com',
  '081234567890',
  'purchase',
  10000,
  'pending',
  'xendit'
);

-- STEP 6: Verify insert worked
SELECT id, customer_name, created_at FROM orders 
WHERE customer_name = 'Test Permission';

-- STEP 7: Cleanup
DELETE FROM orders WHERE customer_name = 'Test Permission';
