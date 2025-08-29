-- Verification queries untuk memastikan migration berhasil
-- Run ini di Supabase SQL Editor untuk double-check

-- 1. Check tiers table
SELECT 'Tiers Table' as table_name, COUNT(*) as record_count FROM tiers;
SELECT * FROM tiers ORDER BY sort_order;

-- 2. Check game_titles table  
SELECT 'Game Titles Table' as table_name, COUNT(*) as record_count FROM game_titles;
SELECT * FROM game_titles ORDER BY sort_order;

-- 3. Check products table structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'products' 
AND column_name IN ('tier_id', 'game_title_id')
ORDER BY column_name;

-- 4. Check products with relations
SELECT 
    p.name,
    p.price,
    t.name as tier_name,
    t.color as tier_color,
    gt.name as game_title,
    gt.category as game_category
FROM products p
LEFT JOIN tiers t ON p.tier_id = t.id
LEFT JOIN game_titles gt ON p.game_title_id = gt.id
LIMIT 10;

-- 5. Check products_with_details view
SELECT 
    name,
    tier_name,
    tier_background_gradient,
    game_title_name,
    game_category
FROM products_with_details 
LIMIT 5;

-- 6. Summary stats
SELECT 
    'MIGRATION SUCCESS!' as status,
    (SELECT COUNT(*) FROM tiers) as total_tiers,
    (SELECT COUNT(*) FROM game_titles) as total_game_titles,
    (SELECT COUNT(*) FROM products) as total_products,
    (SELECT COUNT(*) FROM products WHERE tier_id IS NOT NULL) as products_with_tier_id,
    (SELECT COUNT(*) FROM products WHERE game_title_id IS NOT NULL) as products_with_game_title_id;
