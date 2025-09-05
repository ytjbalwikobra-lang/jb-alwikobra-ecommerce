-- Remove category column from game_titles table and update related structures

-- Drop the products_with_details view first (if it exists)
DROP VIEW IF EXISTS products_with_details;

-- Remove the category column from game_titles table
ALTER TABLE game_titles DROP COLUMN IF EXISTS category;

-- Recreate the products_with_details view without category
CREATE VIEW products_with_details AS
SELECT 
  p.*,
  t.name as tier_name,
  t.description as tier_description,
  t.color as tier_color,
  t.slug as tier_slug,
  gt.name as game_title_name,
  gt.description as game_title_description,
  gt.image_url as game_title_image,
  
  -- Include tier and game_title objects for easier frontend consumption
  json_build_object(
    'id', t.id,
    'name', t.name,
    'description', t.description,
    'color', t.color,
    'slug', t.slug
  ) as tiers,
  
  json_build_object(
    'id', gt.id,
    'name', gt.name,
    'description', gt.description,
    'image_url', gt.image_url
  ) as game_titles
  
FROM products p
LEFT JOIN tiers t ON p.tier_id = t.id
LEFT JOIN game_titles gt ON p.game_title_id = gt.id;

-- Grant access to the view
GRANT SELECT ON products_with_details TO anon, authenticated;

-- Add helpful comment
COMMENT ON VIEW products_with_details IS 'Comprehensive view of products with tier and game title information (category removed)';
