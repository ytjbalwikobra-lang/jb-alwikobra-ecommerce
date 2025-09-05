-- Performance Optimization Indexes for Admin Pages
-- Run these in Supabase SQL Editor to improve query performance

-- 1. Products table indexes for filtering and pagination
CREATE INDEX IF NOT EXISTS idx_products_status_created 
ON products (is_active, archived_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_game_title_status 
ON products (game_title_id, is_active, archived_at);

CREATE INDEX IF NOT EXISTS idx_products_tier_status 
ON products (tier_id, is_active, archived_at);

CREATE INDEX IF NOT EXISTS idx_products_name_search 
ON products USING gin(to_tsvector('simple', name || ' ' || description));

-- Composite index for common filter combinations
CREATE INDEX IF NOT EXISTS idx_products_composite_filters 
ON products (game_title_id, tier_id, is_active, archived_at, created_at DESC);

-- 2. Orders table indexes
CREATE INDEX IF NOT EXISTS idx_orders_status_created 
ON orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_payment_method 
ON orders (payment_method, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_type_created 
ON orders (order_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_amount_range 
ON orders (total_amount, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_customer_search 
ON orders USING gin(to_tsvector('simple', customer_name || ' ' || customer_email || ' ' || customer_phone));

-- Composite index for admin filtering
CREATE INDEX IF NOT EXISTS idx_orders_admin_filters 
ON orders (status, payment_method, order_type, created_at DESC);

-- Date range queries
CREATE INDEX IF NOT EXISTS idx_orders_date_range 
ON orders (created_at, status);

-- 3. Profiles table indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role_created 
ON profiles (role, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_profiles_name_search 
ON profiles USING gin(to_tsvector('simple', name));

-- 4. Rental options table (for products join)
CREATE INDEX IF NOT EXISTS idx_rental_options_product_id 
ON rental_options (product_id);

-- 5. Foreign key indexes (if not already exist)
CREATE INDEX IF NOT EXISTS idx_products_game_title_fk 
ON products (game_title_id);

CREATE INDEX IF NOT EXISTS idx_products_tier_fk 
ON products (tier_id);

CREATE INDEX IF NOT EXISTS idx_orders_product_fk 
ON orders (product_id);

-- 6. Performance monitoring views
CREATE OR REPLACE VIEW admin_performance_stats AS
SELECT 
  'products' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE is_active = true AND archived_at IS NULL) as active_rows,
  COUNT(*) FILTER (WHERE is_active = false OR archived_at IS NOT NULL) as archived_rows
FROM products
UNION ALL
SELECT 
  'orders' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_orders,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_orders
FROM orders
UNION ALL
SELECT 
  'profiles' as table_name,
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE role = 'admin') as admin_users,
  COUNT(*) FILTER (WHERE role = 'user' OR role IS NULL) as regular_users
FROM profiles;

-- 7. Query performance analysis function
CREATE OR REPLACE FUNCTION analyze_admin_query_performance()
RETURNS TABLE (
  query_type text,
  estimated_cost numeric,
  recommendation text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    'products_paginated'::text,
    0.0::numeric,
    'Use indexes: idx_products_status_created, idx_products_composite_filters'::text
  UNION ALL
  SELECT 
    'orders_paginated'::text,
    0.0::numeric,
    'Use indexes: idx_orders_admin_filters, idx_orders_date_range'::text
  UNION ALL
  SELECT 
    'profiles_search'::text,
    0.0::numeric,
    'Use indexes: idx_profiles_role_created, idx_profiles_name_search'::text;
END;
$$ LANGUAGE plpgsql;

-- 8. Analyze table statistics for better query planning
ANALYZE products;
ANALYZE orders;
ANALYZE profiles;
ANALYZE rental_options;
ANALYZE tiers;
ANALYZE game_titles;

-- 9. Recommendations for production
-- Add these comments for monitoring:
COMMENT ON INDEX idx_products_status_created IS 'Primary index for admin products list with status filtering';
COMMENT ON INDEX idx_orders_admin_filters IS 'Composite index for admin orders filtering and pagination';
COMMENT ON INDEX idx_profiles_role_created IS 'Index for admin users list with role filtering';

-- 10. Performance monitoring query
-- Run this periodically to check index usage:
/*
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as index_scans,
  idx_tup_read as tuples_read,
  idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;
*/
