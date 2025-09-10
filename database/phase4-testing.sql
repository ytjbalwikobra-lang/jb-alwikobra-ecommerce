-- PHASE 4: TESTING & VALIDATION SCRIPTS
-- Test all Phase 3 stored procedures and optimizations

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

-- 10. Verify All Indexes Were Created
SELECT 'Checking created indexes' AS test_name;
SELECT schemaname, tablename, indexname, indexdef 
FROM pg_indexes 
WHERE schemaname = 'public' 
AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 11. Database Statistics
SELECT 'Database statistics' AS test_name;
SELECT 
  schemaname,
  tablename, 
  n_tup_ins as inserts,
  n_tup_upd as updates,
  n_tup_del as deletes,
  n_live_tup as live_rows,
  n_dead_tup as dead_rows,
  last_vacuum,
  last_autovacuum,
  last_analyze,
  last_autoanalyze
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- SUCCESS CRITERIA:
-- ✅ All stored procedures return data without errors
-- ✅ Query plans show index usage (Index Scan, not Seq Scan)
-- ✅ Execution times are under 100ms for most queries
-- ✅ All expected indexes are present
-- ✅ No errors or warnings in results
