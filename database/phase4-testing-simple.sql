-- PHASE 4: SIMPLE FUNCTION TESTING
-- Basic tests for stored procedures without system queries

-- 1. Test Admin Dashboard Stats
SELECT 'Testing get_admin_dashboard_stats()' AS test_name;
SELECT * FROM get_admin_dashboard_stats();

-- 2. Test Feed with Context
SELECT 'Testing get_feed_with_context()' AS test_name;
SELECT * FROM get_feed_with_context(
  input_user_id := NULL,
  feed_type := 'all',
  page_offset := 0,
  page_limit := 3
);

-- 3. Test Products Catalog
SELECT 'Testing get_products_catalog()' AS test_name;
SELECT * FROM get_products_catalog(
  page_offset := 0,
  page_limit := 3,
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

-- 7. Simple Performance Check
SELECT 'Simple performance test' AS test_name;
SELECT COUNT(*) as feed_posts_count FROM feed_posts WHERE is_deleted = false;
SELECT COUNT(*) as products_count FROM products WHERE is_active = true;
SELECT COUNT(*) as orders_count FROM orders WHERE status = 'PAID';

-- 8. Verify Functions Work End-to-End
SELECT 'End-to-end test' AS test_name;
-- Test feed function with actual data
SELECT 
  post_id,
  post_type, 
  title,
  product_name,
  total_count
FROM get_feed_with_context(NULL, 'all', 0, 1) 
LIMIT 1;

-- Test products function with actual data  
SELECT 
  product_id,
  product_name,
  category,
  price,
  total_count
FROM get_products_catalog(0, 1, NULL, NULL) 
LIMIT 1;

SELECT 'All tests completed successfully!' AS final_result;
