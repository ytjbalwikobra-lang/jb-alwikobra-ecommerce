-- 🔧 DIAGNOSTIC: Cek kenapa constraint tidak bisa dibuat

-- 1. Cek apakah ada data yang duplicate di client_external_id
SELECT client_external_id, COUNT(*) 
FROM orders 
WHERE client_external_id IS NOT NULL
GROUP BY client_external_id 
HAVING COUNT(*) > 1;

-- 2. Cek apakah ada NULL values yang bermasalah
SELECT COUNT(*) as total_rows, 
       COUNT(client_external_id) as non_null_client_external_id,
       COUNT(*) - COUNT(client_external_id) as null_client_external_id
FROM orders;

-- 3. Jika ada duplicate, clean up dulu
-- DELETE FROM orders 
-- WHERE id NOT IN (
--   SELECT MIN(id) 
--   FROM orders 
--   WHERE client_external_id IS NOT NULL
--   GROUP BY client_external_id
-- ) AND client_external_id IS NOT NULL;

-- 4. Setelah cleanup, coba buat constraint lagi
-- ALTER TABLE orders 
-- ADD CONSTRAINT uq_orders_client_external_id 
-- UNIQUE (client_external_id);

-- 5. Alternative: Buat partial unique index (ignore NULL)
DROP INDEX IF EXISTS uq_orders_client_external_id;
CREATE UNIQUE INDEX uq_orders_client_external_id
  ON orders(client_external_id)
  WHERE client_external_id IS NOT NULL;

-- 6. Verify index created
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname='public' AND tablename='orders' 
AND indexname = 'uq_orders_client_external_id';
