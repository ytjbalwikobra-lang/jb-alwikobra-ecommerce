-- PHASE 4: CORRECTED TESTING & VALIDATION SCRIPTS
-- Fixed for Supabase environment - uses information_schema instead of pg_stat views

-- 1. Test Admin Dashboard Stats
SELECT 'Testing get_admin_dashboard_stats()' AS test_name;
SELECT * FROM get_admin_dashboard_stats();

-- 2. Test Feed with Context (sample pagination)
SELECT 'Testing get_feed_with_context()' AS test_name;
SELECT * FROM get_feed_with_context(
  input_user_id := NULL,
  feed_type := 'all',
  page_offset := 0,
  page_limit := 5
);

-- 3. Test Products Catalog
SELECT 'Testing get_products_catalog()' AS test_name;
SELECT * FROM get_products_catalog(
  page_offset := 0,
  page_limit := 5,
  filter_category := NULL,
  filter_game := NULL
);

-- 4. Test Active Flash Sales
SELECT 'Testing get_active_flash_sales()' AS test_name;
SELECT * FROM get_active_flash_sales();

-- 5. Test User Activity Summary
SELECT 'Testing get_user_activity_summary()' AS test_name;
SELECT * FROM get_user_activity_summary();

-- 6. Test Materialized View
SELECT 'Testing dashboard_analytics view' AS test_name;
SELECT * FROM dashboard_analytics;

-- 7. Performance Test: Check Index Usage
SELECT 'Testing index usage' AS test_name;
EXPLAIN (ANALYZE, BUFFERS) 
SELECT * FROM feed_posts 
WHERE is_deleted = false 
ORDER BY is_pinned DESC, created_at DESC 
LIMIT 10;

-- 8. Test Orders Query Performance
SELECT 'Testing orders query performance' AS test_name;
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM orders 
WHERE status = 'PAID' 
AND created_at >= NOW() - INTERVAL '30 days'
ORDER BY created_at DESC;

-- 9. Test Products Query Performance
SELECT 'Testing products query performance' AS test_name;
EXPLAIN (ANALYZE, BUFFERS)
SELECT * FROM products 
WHERE is_active = true 
AND category = 'Mobile Legends'
ORDER BY created_at DESC;

-- 10. Verify Indexes Were Created (using information_schema)
SELECT 'Checking created indexes' AS test_name;
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 11. Alternative Index Check (if pg_indexes doesn't work)
SELECT 'Alternative index check' AS test_name;
SELECT 
  t.table_name,
  i.index_name,
  i.is_unique,
  array_agg(c.column_name ORDER BY c.ordinal_position) as columns
FROM information_schema.tables t
LEFT JOIN information_schema.statistics i ON t.table_name = i.table_name
LEFT JOIN information_schema.key_column_usage c ON i.index_name = c.constraint_name
WHERE t.table_schema = 'public'
  AND t.table_name IN ('feed_posts', 'products', 'orders', 'feed_post_likes')
  AND i.index_name LIKE 'idx_%'
GROUP BY t.table_name, i.index_name, i.is_unique
ORDER BY t.table_name, i.index_name;

-- 12. Simple Table Info (instead of pg_stat_user_tables)
SELECT 'Table information' AS test_name;
SELECT 
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('feed_posts', 'products', 'orders', 'feed_post_likes', 'users')
ORDER BY table_name;

-- 13. Function Existence Check
SELECT 'Checking stored procedures exist' AS test_name;
SELECT 
  routine_name,
  routine_type,
  data_type as return_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name IN (
    'get_admin_dashboard_stats',
    'get_feed_with_context', 
    'get_products_catalog',
    'get_active_flash_sales',
    'get_user_activity_summary'
  )
ORDER BY routine_name;

-- 14. Simple Record Counts
SELECT 'Table record counts' AS test_name;
SELECT 
  'feed_posts' as table_name,
  COUNT(*) as record_count
FROM feed_posts
UNION ALL
SELECT 
  'products' as table_name,
  COUNT(*) as record_count  
FROM products
UNION ALL
SELECT 
  'orders' as table_name,
  COUNT(*) as record_count
FROM orders
UNION ALL
SELECT 
  'users' as table_name,
  COUNT(*) as record_count
FROM auth.users;

-- SUCCESS CRITERIA:
-- ✅ All stored procedures return data without errors
-- ✅ Query plans show index usage (Index Scan, not Seq Scan)
-- ✅ Execution times are under 100ms for most queries
-- ✅ All expected functions are present
-- ✅ No errors or warnings in results
