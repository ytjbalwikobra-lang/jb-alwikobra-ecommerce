-- FIX DATA TYPE MISMATCHES IN STORED PROCEDURES
-- Issue: Function expects TEXT but database returns VARCHAR(255)

-- Drop and recreate get_feed_with_context with correct data types
DROP FUNCTION IF EXISTS get_feed_with_context(UUID, TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_feed_with_context(
  input_user_id UUID DEFAULT NULL,
  feed_type TEXT DEFAULT 'all',
  page_offset INTEGER DEFAULT 0,
  page_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  post_id UUID,
  post_type VARCHAR(50),  -- Changed from TEXT
  title TEXT,
  content TEXT,
  rating INTEGER,
  image_url TEXT,
  likes_count INTEGER,
  comments_count INTEGER,
  is_pinned BOOLEAN,
  created_at TIMESTAMPTZ,
  author_id UUID,
  author_name TEXT,
  author_avatar TEXT,
  author_is_admin BOOLEAN,
  product_id UUID,
  product_name VARCHAR(255),  -- Changed from TEXT to match database
  product_image TEXT,
  liked_by_user BOOLEAN,
  total_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    fp.id AS post_id,
    fp.type AS post_type,
    fp.title,
    fp.content,
    fp.rating,
    fp.image_url,
    fp.likes_count,
    fp.comments_count,
    fp.is_pinned,
    fp.created_at,
    au.id AS author_id,
    COALESCE(au.raw_user_meta_data->>'name', au.email) AS author_name,
    au.raw_user_meta_data->>'avatar_url' AS author_avatar,
    COALESCE((au.raw_user_meta_data->>'is_admin')::boolean, false) AS author_is_admin,
    p.id AS product_id,
    p.name AS product_name,
    p.image AS product_image,
    CASE 
      WHEN input_user_id IS NOT NULL AND fpl.user_id IS NOT NULL THEN TRUE 
      ELSE FALSE 
    END AS liked_by_user,
    COUNT(*) OVER() AS total_count
  FROM feed_posts fp
  INNER JOIN auth.users au ON fp.user_id = au.id
  LEFT JOIN products p ON fp.product_id = p.id
  LEFT JOIN feed_post_likes fpl ON (fp.id = fpl.post_id AND fpl.user_id = input_user_id)
  WHERE fp.is_deleted = FALSE
    AND (feed_type = 'all' OR fp.type = feed_type)
  ORDER BY fp.is_pinned DESC, fp.created_at DESC
  LIMIT page_limit OFFSET page_offset;
END;
$$;

-- Also fix get_products_catalog function with correct data types
DROP FUNCTION IF EXISTS get_products_catalog(INTEGER, INTEGER, TEXT, TEXT);

CREATE OR REPLACE FUNCTION get_products_catalog(
  page_offset INTEGER DEFAULT 0,
  page_limit INTEGER DEFAULT 20,
  filter_category TEXT DEFAULT NULL,
  filter_game TEXT DEFAULT NULL
)
RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR(255),  -- Changed from TEXT
  description TEXT,
  price NUMERIC,
  original_price NUMERIC,
  image TEXT,
  category VARCHAR(100),  -- Changed from TEXT
  game_title VARCHAR(100),  -- Changed from TEXT
  account_level VARCHAR(50),  -- Changed from TEXT  
  is_flash_sale BOOLEAN,
  flash_sale_end_time TIMESTAMPTZ,
  has_rental BOOLEAN,
  stock INTEGER,
  is_active BOOLEAN,
  created_at TIMESTAMPTZ,
  total_count BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.description,
    p.price,
    p.original_price,
    p.image,
    p.category,
    p.game_title,
    p.account_level,
    p.is_flash_sale,
    p.flash_sale_end_time,
    p.has_rental,
    p.stock,
    p.is_active,
    p.created_at,
    COUNT(*) OVER() AS total_count
  FROM products p
  WHERE p.is_active = true
    AND (filter_category IS NULL OR p.category = filter_category)
    AND (filter_game IS NULL OR p.game_title = filter_game)
  ORDER BY p.created_at DESC
  LIMIT page_limit OFFSET page_offset;
END;
$$;

-- Fix get_user_activity_summary function
DROP FUNCTION IF EXISTS get_user_activity_summary();

CREATE OR REPLACE FUNCTION get_user_activity_summary()
RETURNS TABLE (
  user_id UUID,
  user_name TEXT,
  total_orders INTEGER,
  total_spent NUMERIC,
  total_reviews INTEGER,
  avg_rating NUMERIC,
  last_activity TIMESTAMPTZ,
  status VARCHAR(20)  -- Changed from TEXT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    au.id AS user_id,
    COALESCE(au.raw_user_meta_data->>'name', au.email) AS user_name,
    COUNT(DISTINCT o.id)::INTEGER AS total_orders,
    COALESCE(SUM(o.amount), 0) AS total_spent,
    COUNT(DISTINCT fp.id)::INTEGER AS total_reviews,
    COALESCE(AVG(fp.rating), 0) AS avg_rating,
    GREATEST(
      COALESCE(MAX(o.created_at), '1970-01-01'::timestamptz),
      COALESCE(MAX(fp.created_at), '1970-01-01'::timestamptz)
    ) AS last_activity,
    CASE 
      WHEN COUNT(o.id) > 0 THEN 'active'::VARCHAR(20)
      ELSE 'inactive'::VARCHAR(20)
    END AS status
  FROM auth.users au
  LEFT JOIN orders o ON au.id = o.user_id
  LEFT JOIN feed_posts fp ON au.id = fp.user_id
  GROUP BY au.id, au.email, au.raw_user_meta_data
  ORDER BY last_activity DESC;
END;
$$;

-- Test the fixed functions
SELECT 'Testing fixed get_feed_with_context()' AS test_name;
SELECT * FROM get_feed_with_context(
  input_user_id := NULL,
  feed_type := 'all',
  page_offset := 0,
  page_limit := 3
) LIMIT 1;

SELECT 'Testing fixed get_products_catalog()' AS test_name;
SELECT * FROM get_products_catalog(
  page_offset := 0,
  page_limit := 3,
  filter_category := NULL,
  filter_game := NULL
) LIMIT 1;

-- Fix get_active_flash_sales function
DROP FUNCTION IF EXISTS get_active_flash_sales();

CREATE OR REPLACE FUNCTION get_active_flash_sales()
RETURNS TABLE (
  product_id UUID,
  product_name VARCHAR(255),  -- Changed from TEXT
  original_price NUMERIC,
  sale_price NUMERIC,
  discount_percentage NUMERIC,
  image TEXT,
  end_time TIMESTAMPTZ,
  stock INTEGER
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.original_price,
    p.price AS sale_price,
    CASE 
      WHEN p.original_price > 0 THEN 
        ROUND(((p.original_price - p.price) / p.original_price * 100)::numeric, 2)
      ELSE 0
    END AS discount_percentage,
    p.image,
    p.flash_sale_end_time AS end_time,
    p.stock
  FROM products p
  WHERE p.is_flash_sale = true
    AND p.flash_sale_end_time > NOW()
    AND p.is_active = true
  ORDER BY p.flash_sale_end_time ASC;
END;
$$;

-- Also fix the original get_user_activity_summary that I changed incorrectly before
DROP FUNCTION IF EXISTS get_user_activity_summary();

CREATE OR REPLACE FUNCTION get_user_activity_summary()
RETURNS TABLE (
  total_users BIGINT,
  active_users_30d BIGINT,
  new_users_7d BIGINT,
  top_user_id UUID,
  top_user_name TEXT,
  top_user_orders BIGINT
) 
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    -- Total users
    (SELECT COUNT(*) FROM auth.users)::BIGINT,
    
    -- Active users in last 30 days (users with orders)
    (SELECT COUNT(DISTINCT user_id) 
     FROM orders 
     WHERE created_at >= NOW() - INTERVAL '30 days' AND user_id IS NOT NULL)::BIGINT,
    
    -- New users in last 7 days
    (SELECT COUNT(*) 
     FROM auth.users 
     WHERE created_at >= NOW() - INTERVAL '7 days')::BIGINT,
    
    -- Top user by order count
    au.id AS top_user_id,
    COALESCE(au.raw_user_meta_data->>'name', au.email) AS top_user_name,
    order_counts.order_count
  FROM (
    SELECT user_id, COUNT(*) as order_count
    FROM orders
    WHERE user_id IS NOT NULL
    GROUP BY user_id
    ORDER BY COUNT(*) DESC
    LIMIT 1
  ) order_counts
  LEFT JOIN auth.users au ON order_counts.user_id = au.id;
END;
$$;

SELECT 'Testing fixed get_feed_with_context()' AS test_name;
SELECT * FROM get_feed_with_context(
  input_user_id := NULL,
  feed_type := 'all',
  page_offset := 0,
  page_limit := 3
) LIMIT 1;

SELECT 'Testing fixed get_products_catalog()' AS test_name;
SELECT * FROM get_products_catalog(
  page_offset := 0,
  page_limit := 3,
  filter_category := NULL,
  filter_game := NULL
) LIMIT 1;

SELECT 'Testing fixed get_active_flash_sales()' AS test_name;
SELECT * FROM get_active_flash_sales() LIMIT 1;

SELECT 'Testing fixed get_user_activity_summary()' AS test_name;
SELECT * FROM get_user_activity_summary() LIMIT 1;
