-- DEFINITIVE FIX BASED ON ACTUAL DATABASE SCHEMA
-- Schema Analysis Results:
-- feed_posts.type = text (not VARCHAR)
-- products.name = character varying(255)
-- products.category = character varying(100)
-- products.game_title = character varying(100)
-- products.account_level = character varying(50)
-- products.image = character varying(500)

-- Drop and recreate get_feed_with_context with EXACT data types
DROP FUNCTION IF EXISTS get_feed_with_context(UUID, TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_feed_with_context(
  input_user_id UUID DEFAULT NULL,
  feed_type TEXT DEFAULT 'all',
  page_offset INTEGER DEFAULT 0,
  page_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  post_id UUID,
  post_type TEXT,  -- feed_posts.type is TEXT
  title TEXT,      -- feed_posts.title is TEXT
  content TEXT,    -- feed_posts.content is TEXT
  rating INTEGER,
  image_url TEXT,  -- feed_posts.image_url is TEXT
  likes_count INTEGER,
  comments_count INTEGER,
  is_pinned BOOLEAN,
  created_at TIMESTAMPTZ,
  author_id UUID,
  author_name TEXT,
  author_avatar TEXT,
  author_is_admin BOOLEAN,
  product_id UUID,
  product_name CHARACTER VARYING(255),  -- products.name is VARCHAR(255)
  product_image CHARACTER VARYING(500), -- products.image is VARCHAR(500)
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

-- Drop and recreate get_products_catalog with EXACT data types
DROP FUNCTION IF EXISTS get_products_catalog(INTEGER, INTEGER, TEXT, TEXT);

CREATE OR REPLACE FUNCTION get_products_catalog(
  page_offset INTEGER DEFAULT 0,
  page_limit INTEGER DEFAULT 20,
  filter_category TEXT DEFAULT NULL,
  filter_game TEXT DEFAULT NULL
)
RETURNS TABLE (
  product_id UUID,
  product_name CHARACTER VARYING(255),  -- products.name is VARCHAR(255)
  description TEXT,                      -- products.description is TEXT
  price NUMERIC,
  original_price NUMERIC,
  image CHARACTER VARYING(500),         -- products.image is VARCHAR(500)
  category CHARACTER VARYING(100),      -- products.category is VARCHAR(100)
  game_title CHARACTER VARYING(100),    -- products.game_title is VARCHAR(100)
  account_level CHARACTER VARYING(50),  -- products.account_level is VARCHAR(50)
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

-- Drop and recreate get_active_flash_sales with EXACT data types
DROP FUNCTION IF EXISTS get_active_flash_sales();

CREATE OR REPLACE FUNCTION get_active_flash_sales()
RETURNS TABLE (
  product_id UUID,
  product_name CHARACTER VARYING(255),  -- products.name is VARCHAR(255)
  original_price NUMERIC,
  sale_price NUMERIC,
  discount_percentage NUMERIC,
  image CHARACTER VARYING(500),         -- products.image is VARCHAR(500)
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

-- Keep get_user_activity_summary as is since it returns calculated fields
-- No need to change this one

-- Test all functions
SELECT 'Testing get_feed_with_context (schema-perfect)' AS test_name;
SELECT * FROM get_feed_with_context(
  input_user_id := NULL,
  feed_type := 'all',
  page_offset := 0,
  page_limit := 1
) LIMIT 1;

SELECT 'Testing get_products_catalog (schema-perfect)' AS test_name;
SELECT * FROM get_products_catalog(
  page_offset := 0,
  page_limit := 1,
  filter_category := NULL,
  filter_game := NULL
) LIMIT 1;

SELECT 'Testing get_active_flash_sales (schema-perfect)' AS test_name;
SELECT * FROM get_active_flash_sales() LIMIT 1;
