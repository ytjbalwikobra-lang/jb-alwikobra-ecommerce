-- SCHEMA VERIFICATION SCRIPT
-- Run this first to verify your database schema before applying Phase 3 optimizations

-- Check orders table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position;

-- Check products table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- Check feed_posts table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'feed_posts' 
ORDER BY ordinal_position;

-- Check users table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Check feed_likes table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'feed_likes' 
ORDER BY ordinal_position;

-- Check order_items table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'order_items' 
ORDER BY ordinal_position;

-- Check tiers table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tiers' 
ORDER BY ordinal_position;

-- Check game_titles table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'game_titles' 
ORDER BY ordinal_position;

-- Sample data check to verify relationships
SELECT 'orders' as table_name, COUNT(*) as row_count FROM orders
UNION ALL
SELECT 'products', COUNT(*) FROM products
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'feed_posts', COUNT(*) FROM feed_posts;

-- Check if flash_sales table exists
SELECT COUNT(*) as flash_sales_table_exists
FROM information_schema.tables 
WHERE table_name = 'flash_sales';

/*
INSTRUCTIONS:
1. Run this script in Supabase SQL Editor first
2. Review the column names and data types
3. Adjust the phase3-optimizations.sql file if needed
4. Common column name variations:
   - customer_id vs user_id
   - amount vs total_amount
   - is_active vs status = 'active'
   - avatar_url vs avatar
*/
