-- Check products table structure and data
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if foreign key columns exist and their types
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
  AND column_name IN ('game_title_id', 'tier_id');

-- Check if tiers and game_titles tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('tiers', 'game_titles');

-- Check constraints on products table
SELECT 
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'products';

-- Check sample data in products table
SELECT id, name, price, game_title_id, tier_id, game_title 
FROM products 
LIMIT 5;
