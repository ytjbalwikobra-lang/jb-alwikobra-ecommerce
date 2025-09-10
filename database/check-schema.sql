-- DIAGNOSE ACTUAL COLUMN DATA TYPES
-- Run this first to see what the actual database schema looks like

SELECT 'Checking feed_posts table structure' AS info;
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'feed_posts' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Checking products table structure' AS info;
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Checking orders table structure' AS info;
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' 
    AND table_schema = 'public'
ORDER BY ordinal_position;
