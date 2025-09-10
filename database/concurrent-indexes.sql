-- PHASE 3: CONCURRENT INDEXES CREATION
-- Run these indexes separately after the main optimization script
-- These should be executed one by one in Supabase SQL editor

-- IMPORTANT: Run each CREATE INDEX command separately in Supabase SQL editor
-- Do NOT run them all at once to avoid transaction block issues

-- 1. Feed posts optimization index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feed_posts_optimized 
ON feed_posts (is_deleted, type, is_pinned DESC, created_at DESC);

-- 2. Orders user and status index  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_user_status 
ON orders (user_id, status, created_at DESC);  -- Changed from customer_id to user_id

-- 3. Feed likes user-post index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_feed_likes_user_post 
ON feed_likes (user_id, post_id);

-- 4. Order items product index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_product 
ON order_items (product_id, order_id);

-- 5. Products with relationships index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_products_active_with_relations 
ON products (status, tier_id, game_title_id, created_at DESC);

-- 6. Users activity index for dashboard analytics
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at 
ON users (created_at DESC);

-- 7. Orders amount and date index for revenue calculations
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_revenue_optimized 
ON orders (status, total_amount, created_at DESC);

-- 8. Flash sales active index
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_flash_sales_active 
ON flash_sales (is_active, end_time DESC) WHERE is_active = true;

/*
DEPLOYMENT INSTRUCTIONS:
1. First run the main phase3-optimizations.sql script
2. Then run each CREATE INDEX command above individually in Supabase SQL editor
3. Wait for each index to complete before running the next one
4. Monitor index creation progress in Supabase dashboard

These concurrent indexes will improve query performance significantly while being created without locking the tables.
*/
