-- PRODUCTION PERFORMANCE FIX FOR ADMIN PAGES
-- Run this in Supabase Dashboard -> SQL Editor
-- This will dramatically improve admin page load times

-- 1. Essential indexes for products table (admin products page)
CREATE INDEX IF NOT EXISTS idx_products_admin_list 
ON products (is_active, archived_at, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_game_filter 
ON products (game_title_id, is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_products_tier_filter 
ON products (tier_id, is_active, created_at DESC);

-- Full-text search index for product name and description
CREATE INDEX IF NOT EXISTS idx_products_search 
ON products USING gin(to_tsvector('simple', name || ' ' || COALESCE(description, '')));

-- 2. Essential indexes for orders table (admin orders page)
CREATE INDEX IF NOT EXISTS idx_orders_admin_list 
ON orders (status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_payment_filter 
ON orders (payment_method, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_orders_customer_search 
ON orders USING gin(to_tsvector('simple', 
  COALESCE(customer_name, '') || ' ' || 
  COALESCE(customer_email, '') || ' ' || 
  COALESCE(customer_phone, '')
));

-- 3. Essential indexes for profiles table (admin users page)
CREATE INDEX IF NOT EXISTS idx_profiles_admin_list 
ON profiles (role, created_at DESC);

-- 4. Foreign key indexes for better join performance
CREATE INDEX IF NOT EXISTS idx_products_game_title_join 
ON products (game_title_id) WHERE game_title_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_products_tier_join 
ON products (tier_id) WHERE tier_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_product_join 
ON orders (product_id) WHERE product_id IS NOT NULL;

-- 5. Update table statistics for better query planning
ANALYZE products;
ANALYZE orders;
ANALYZE profiles;
ANALYZE tiers;
ANALYZE game_titles;

-- 6. Check index usage (run this after a few hours to monitor performance)
/*
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan as scans,
  idx_tup_read as tuples_read
FROM pg_stat_user_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY idx_scan DESC;
*/
