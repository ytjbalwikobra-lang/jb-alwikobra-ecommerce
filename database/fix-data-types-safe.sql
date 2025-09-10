-- SAFE FIX: CAST ALL COLUMNS TO TEXT TO AVOID TYPE MISMATCHES
-- This approach casts database columns to TEXT to match function expectations

-- Drop and recreate get_feed_with_context with explicit casting
DROP FUNCTION IF EXISTS get_feed_with_context(UUID, TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_feed_with_context(
  input_user_id UUID DEFAULT NULL,
  feed_type TEXT DEFAULT 'all',
  page_offset INTEGER DEFAULT 0,
  page_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  post_id UUID,
  post_type TEXT,
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
  product_name TEXT,
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
    fp.type::TEXT AS post_type,  -- Explicit cast to TEXT
    fp.title::TEXT,
    fp.content::TEXT,
    fp.rating,
    fp.image_url::TEXT,
    fp.likes_count,
    fp.comments_count,
    fp.is_pinned,
    fp.created_at,
    au.id AS author_id,
    COALESCE(au.raw_user_meta_data->>'name', au.email)::TEXT AS author_name,
    (au.raw_user_meta_data->>'avatar_url')::TEXT AS author_avatar,
    COALESCE((au.raw_user_meta_data->>'is_admin')::boolean, false) AS author_is_admin,
    p.id AS product_id,
    p.name::TEXT AS product_name,  -- Explicit cast to TEXT
    p.image::TEXT AS product_image,
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
    AND (feed_type = 'all' OR fp.type::TEXT = feed_type)
  ORDER BY fp.is_pinned DESC, fp.created_at DESC
  LIMIT page_limit OFFSET page_offset;
END;
$$;

-- Drop and recreate get_products_catalog with explicit casting
DROP FUNCTION IF EXISTS get_products_catalog(INTEGER, INTEGER, TEXT, TEXT);

CREATE OR REPLACE FUNCTION get_products_catalog(
  page_offset INTEGER DEFAULT 0,
  page_limit INTEGER DEFAULT 20,
  filter_category TEXT DEFAULT NULL,
  filter_game TEXT DEFAULT NULL
)
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
  description TEXT,
  price NUMERIC,
  original_price NUMERIC,
  image TEXT,
  category TEXT,
  game_title TEXT,
  account_level TEXT,
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
    p.name::TEXT AS product_name,  -- Explicit cast
    p.description::TEXT,
    p.price,
    p.original_price,
    p.image::TEXT,
    p.category::TEXT AS category,  -- Explicit cast
    p.game_title::TEXT AS game_title,  -- Explicit cast
    p.account_level::TEXT AS account_level,  -- Explicit cast
    p.is_flash_sale,
    p.flash_sale_end_time,
    p.has_rental,
    p.stock,
    p.is_active,
    p.created_at,
    COUNT(*) OVER() AS total_count
  FROM products p
  WHERE p.is_active = true
    AND (filter_category IS NULL OR p.category::TEXT = filter_category)
    AND (filter_game IS NULL OR p.game_title::TEXT = filter_game)
  ORDER BY p.created_at DESC
  LIMIT page_limit OFFSET page_offset;
END;
$$;

-- Drop and recreate get_active_flash_sales with explicit casting
DROP FUNCTION IF EXISTS get_active_flash_sales();

CREATE OR REPLACE FUNCTION get_active_flash_sales()
RETURNS TABLE (
  product_id UUID,
  product_name TEXT,
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
    p.name::TEXT AS product_name,  -- Explicit cast
    p.original_price,
    p.price AS sale_price,
    CASE 
      WHEN p.original_price > 0 THEN 
        ROUND(((p.original_price - p.price) / p.original_price * 100)::numeric, 2)
      ELSE 0
    END AS discount_percentage,
    p.image::TEXT,
    p.flash_sale_end_time AS end_time,
    p.stock
  FROM products p
  WHERE p.is_flash_sale = true
    AND p.flash_sale_end_time > NOW()
    AND p.is_active = true
  ORDER BY p.flash_sale_end_time ASC;
END;
$$;

-- Test all functions
SELECT 'Testing get_feed_with_context (with casts)' AS test_name;
SELECT * FROM get_feed_with_context(
  input_user_id := NULL,
  feed_type := 'all',
  page_offset := 0,
  page_limit := 1
) LIMIT 1;

SELECT 'Testing get_products_catalog (with casts)' AS test_name;
SELECT * FROM get_products_catalog(
  page_offset := 0,
  page_limit := 1,
  filter_category := NULL,
  filter_game := NULL
) LIMIT 1;

SELECT 'Testing get_active_flash_sales (with casts)' AS test_name;
SELECT * FROM get_active_flash_sales() LIMIT 1;
