-- CORRECTED FIX FOR DATA TYPE MISMATCHES
-- Based on actual error: column 2 (post_type) expects VARCHAR but gets TEXT

-- Drop and recreate get_feed_with_context with ACTUAL correct data types
DROP FUNCTION IF EXISTS get_feed_with_context(UUID, TEXT, INTEGER, INTEGER);

CREATE OR REPLACE FUNCTION get_feed_with_context(
  input_user_id UUID DEFAULT NULL,
  feed_type TEXT DEFAULT 'all',
  page_offset INTEGER DEFAULT 0,
  page_limit INTEGER DEFAULT 10
)
RETURNS TABLE (
  post_id UUID,
  post_type TEXT,  -- Changed back to TEXT (database column is TEXT)
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
  product_name TEXT,  -- Trying TEXT first
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

-- Test just this function first
SELECT 'Testing get_feed_with_context with TEXT types' AS test_name;
SELECT * FROM get_feed_with_context(
  input_user_id := NULL,
  feed_type := 'all',
  page_offset := 0,
  page_limit := 1
) LIMIT 1;
