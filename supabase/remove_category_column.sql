-- Remove category column from game_titles table
-- Run this in Supabase SQL Editor to remove category column

-- First, check current structure
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'game_titles' 
ORDER BY ordinal_position;

-- Step 1: Drop the dependent view first
DROP VIEW IF EXISTS products_with_details CASCADE;

-- Step 2: Now safely drop the category column
ALTER TABLE game_titles DROP COLUMN IF EXISTS category;

-- Step 2: Now safely drop the category column
ALTER TABLE game_titles DROP COLUMN IF EXISTS category;

-- Step 3: Recreate the view without category references (check existing columns first)
CREATE VIEW products_with_details AS
SELECT 
    p.id,
    p.name,
    p.description,
    p.price,
    p.tier_id,
    p.game_title_id,
    p.created_at,
    p.updated_at,
    -- Tier information
    t.name as tier_name,
    t.slug as tier_slug,
    t.description as tier_description,
    t.color as tier_color,
    -- Game title information (without category)
    gt.name as game_title_name,
    gt.description as game_title_description,
    -- JSON objects for easier frontend consumption
    json_build_object(
        'id', t.id,
        'name', t.name,
        'slug', t.slug,
        'description', t.description,
        'color', t.color
    ) as tiers,
    json_build_object(
        'id', gt.id,
        'name', gt.name,
        'description', gt.description
    ) as game_titles
FROM products p
LEFT JOIN tiers t ON p.tier_id = t.id
LEFT JOIN game_titles gt ON p.game_title_id = gt.id;

-- Verify the column has been removed
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'game_titles' 
ORDER BY ordinal_position;

-- Show updated view structure
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'products_with_details' 
ORDER BY ordinal_position;
