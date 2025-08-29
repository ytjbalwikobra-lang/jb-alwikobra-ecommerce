-- Add missing foreign key constraints
-- Run this in Supabase SQL Editor to fix the relationship issue

-- Check current constraints
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'products' 
    AND tc.constraint_type = 'FOREIGN KEY';

-- Add foreign key constraints safely
DO $$
BEGIN
    -- Add tier_id foreign key if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'products' 
        AND constraint_name = 'products_tier_id_fkey'
    ) THEN
        ALTER TABLE products 
        ADD CONSTRAINT products_tier_id_fkey 
        FOREIGN KEY (tier_id) REFERENCES tiers(id) ON DELETE RESTRICT;
        RAISE NOTICE 'Added tier_id foreign key constraint';
    ELSE
        RAISE NOTICE 'tier_id foreign key constraint already exists';
    END IF;
    
    -- Add game_title_id foreign key if not exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'products' 
        AND constraint_name = 'products_game_title_id_fkey'
    ) THEN
        ALTER TABLE products 
        ADD CONSTRAINT products_game_title_id_fkey 
        FOREIGN KEY (game_title_id) REFERENCES game_titles(id) ON DELETE RESTRICT;
        RAISE NOTICE 'Added game_title_id foreign key constraint';
    ELSE
        RAISE NOTICE 'game_title_id foreign key constraint already exists';
    END IF;
END $$;

-- Verify constraints are added
SELECT 
    tc.table_name, 
    tc.constraint_name, 
    tc.constraint_type, 
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'products' 
    AND tc.constraint_type = 'FOREIGN KEY';
