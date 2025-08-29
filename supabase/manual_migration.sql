-- JB AlwiKobra E-commerce - Consolidated Migration
-- Safe deployment for all new features
-- Run this in Supabase SQL Editor manually

-- First, check if our new tables already exist
DO $$
BEGIN
    -- Only create tables if they don't exist
    
    -- Create tiers table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'tiers') THEN
        CREATE TABLE tiers (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            slug VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            color VARCHAR(7) NOT NULL, -- Hex color
            border_color VARCHAR(7) NOT NULL,
            background_gradient VARCHAR(200) NOT NULL,
            icon VARCHAR(50) NOT NULL,
            price_range_min INTEGER NOT NULL,
            price_range_max INTEGER NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_tiers_slug ON tiers(slug);
        CREATE INDEX idx_tiers_is_active ON tiers(is_active);
        CREATE INDEX idx_tiers_sort_order ON tiers(sort_order);
        
        RAISE NOTICE 'Tiers table created successfully';
    ELSE
        RAISE NOTICE 'Tiers table already exists, skipping creation';
    END IF;
    
    -- Create game_titles table
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'game_titles') THEN
        CREATE TABLE game_titles (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            slug VARCHAR(50) UNIQUE NOT NULL,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            category VARCHAR(50) NOT NULL,
            icon VARCHAR(50) NOT NULL,
            color VARCHAR(7) NOT NULL, -- Hex color
            logo_url VARCHAR(500),
            is_popular BOOLEAN DEFAULT FALSE,
            is_active BOOLEAN DEFAULT TRUE,
            sort_order INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        -- Create indexes
        CREATE INDEX idx_game_titles_slug ON game_titles(slug);
        CREATE INDEX idx_game_titles_category ON game_titles(category);
        CREATE INDEX idx_game_titles_is_popular ON game_titles(is_popular);
        CREATE INDEX idx_game_titles_is_active ON game_titles(is_active);
        CREATE INDEX idx_game_titles_sort_order ON game_titles(sort_order);
        
        RAISE NOTICE 'Game_titles table created successfully';
    ELSE
        RAISE NOTICE 'Game_titles table already exists, skipping creation';
    END IF;
END $$;

-- Insert sample tier data (only if table is empty)
INSERT INTO tiers (slug, name, description, color, border_color, background_gradient, icon, price_range_min, price_range_max, sort_order)
SELECT * FROM (VALUES
    ('reguler', 'Reguler', 'Tier standar dengan harga terjangkau untuk semua kalangan', '#10b981', '#059669', 'bg-gradient-to-br from-green-50 to-green-100', 'Circle', 100000, 800000, 1),
    ('pelajar', 'Pelajar', 'Tier khusus pelajar dengan diskon dan benefit istimewa', '#3b82f6', '#2563eb', 'bg-gradient-to-br from-blue-50 to-blue-100', 'GraduationCap', 200000, 1200000, 2),
    ('premium', 'Premium', 'Tier premium dengan layanan dan kualitas terbaik', '#f59e0b', '#d97706', 'bg-gradient-to-br from-yellow-50 to-yellow-100', 'Crown', 1000000, 5000000, 3)
) AS v(slug, name, description, color, border_color, background_gradient, icon, price_range_min, price_range_max, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM tiers LIMIT 1);

-- Insert sample game title data (only if table is empty)
INSERT INTO game_titles (slug, name, description, category, icon, color, logo_url, is_popular, sort_order)
SELECT * FROM (VALUES
    ('mobile-legends', 'Mobile Legends', 'MOBA terpopuler di Indonesia', 'MOBA', 'Sword', '#10b981', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100', true, 1),
    ('valorant', 'Valorant', 'FPS tactical shooter dari Riot Games', 'FPS', 'Target', '#dc2626', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100', true, 2),
    ('genshin-impact', 'Genshin Impact', 'Open-world action RPG dengan sistem gacha', 'RPG', 'Star', '#3b82f6', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100', true, 3),
    ('pubg-mobile', 'PUBG Mobile', 'Battle Royale terpopuler', 'Battle Royale', 'Target', '#ea580c', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100', true, 4),
    ('free-fire', 'Free Fire', 'Battle Royale ringan', 'Battle Royale', 'Zap', '#ea580c', 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=100', true, 5)
) AS v(slug, name, description, category, icon, color, logo_url, is_popular, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM game_titles LIMIT 1);

-- Add foreign key columns to products table (if they don't exist)
DO $$
BEGIN
    -- Add tier_id column
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tier_id') THEN
        ALTER TABLE products ADD COLUMN tier_id UUID;
        RAISE NOTICE 'Added tier_id column to products table';
    ELSE
        RAISE NOTICE 'tier_id column already exists in products table';
    END IF;
    
    -- Add game_title_id column
    IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'game_title_id') THEN
        ALTER TABLE products ADD COLUMN game_title_id UUID;
        RAISE NOTICE 'Added game_title_id column to products table';
    ELSE
        RAISE NOTICE 'game_title_id column already exists in products table';
    END IF;
END $$;

-- Migrate existing data to new structure (safe update)
-- Check if tier column exists before migrating
DO $$
BEGIN
    -- Only migrate if tier column exists and tier_id is null
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'tier') THEN
        UPDATE products 
        SET tier_id = (
            SELECT id FROM tiers 
            WHERE tiers.slug = CASE 
                WHEN products.tier = 'premium' THEN 'premium'
                WHEN products.tier = 'pelajar' THEN 'pelajar'
                ELSE 'reguler'
            END
        )
        WHERE tier_id IS NULL;
        RAISE NOTICE 'Migrated tier data from existing tier column';
    ELSE
        -- If no tier column, set all products to 'reguler' as default
        UPDATE products 
        SET tier_id = (SELECT id FROM tiers WHERE slug = 'reguler')
        WHERE tier_id IS NULL;
        RAISE NOTICE 'Set all products to reguler tier (no existing tier column found)';
    END IF;
    
    -- Migrate game_title data if column exists
    IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'game_title') THEN
        UPDATE products 
        SET game_title_id = (
            SELECT id FROM game_titles 
            WHERE LOWER(game_titles.name) = LOWER(products.game_title)
            LIMIT 1
        )
        WHERE game_title_id IS NULL;
        RAISE NOTICE 'Migrated game_title data from existing game_title column';
    ELSE
        -- If no game_title column, set all to Mobile Legends as default
        UPDATE products 
        SET game_title_id = (SELECT id FROM game_titles WHERE slug = 'mobile-legends')
        WHERE game_title_id IS NULL;
        RAISE NOTICE 'Set all products to Mobile Legends (no existing game_title column found)';
    END IF;
END $$;

-- Add foreign key constraints (only if they don't exist)
DO $$
BEGIN
    -- Add tier_id foreign key
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE table_name = 'products' AND constraint_name = 'products_tier_id_fkey'
    ) THEN
        ALTER TABLE products 
        ADD CONSTRAINT products_tier_id_fkey 
        FOREIGN KEY (tier_id) REFERENCES tiers(id) ON DELETE RESTRICT;
        RAISE NOTICE 'Added foreign key constraint for tier_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint for tier_id already exists';
    END IF;
    
    -- Add game_title_id foreign key
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE table_name = 'products' AND constraint_name = 'products_game_title_id_fkey'
    ) THEN
        ALTER TABLE products 
        ADD CONSTRAINT products_game_title_id_fkey 
        FOREIGN KEY (game_title_id) REFERENCES game_titles(id) ON DELETE RESTRICT;
        RAISE NOTICE 'Added foreign key constraint for game_title_id';
    ELSE
        RAISE NOTICE 'Foreign key constraint for game_title_id already exists';
    END IF;
END $$;

-- Create indexes for new foreign keys (if they don't exist)
CREATE INDEX IF NOT EXISTS idx_products_tier_id ON products(tier_id);
CREATE INDEX IF NOT EXISTS idx_products_game_title_id ON products(game_title_id);

-- Ensure all products have valid tier_id and game_title_id
UPDATE products 
SET tier_id = (SELECT id FROM tiers WHERE slug = 'reguler' LIMIT 1)
WHERE tier_id IS NULL;

UPDATE products 
SET game_title_id = (SELECT id FROM game_titles WHERE slug = 'mobile-legends' LIMIT 1)
WHERE game_title_id IS NULL;

-- Enable RLS for new tables
ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_titles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public read access
DROP POLICY IF EXISTS "Tiers are viewable by everyone" ON tiers;
CREATE POLICY "Tiers are viewable by everyone" 
ON tiers FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Game titles are viewable by everyone" ON game_titles;
CREATE POLICY "Game titles are viewable by everyone" 
ON game_titles FOR SELECT 
USING (true);

-- Create optimized view for frontend
CREATE OR REPLACE VIEW products_with_details AS
SELECT 
    p.*,
    t.name as tier_name,
    t.slug as tier_slug,
    t.description as tier_description,
    t.color as tier_color,
    t.border_color as tier_border_color,
    t.background_gradient as tier_background_gradient,
    t.icon as tier_icon,
    t.price_range_min as tier_price_min,
    t.price_range_max as tier_price_max,
    gt.name as game_title_name,
    gt.slug as game_title_slug,
    gt.description as game_title_description,
    gt.category as game_category,
    gt.icon as game_icon,
    gt.color as game_color,
    gt.logo_url as game_logo_url,
    gt.is_popular as game_is_popular
FROM products p
LEFT JOIN tiers t ON p.tier_id = t.id
LEFT JOIN game_titles gt ON p.game_title_id = gt.id;

-- Grant access to the view
GRANT SELECT ON products_with_details TO anon, authenticated;

-- Add some sample products to showcase the new structure
INSERT INTO products (
    name, description, price, original_price, image, 
    tier_id, game_title_id, account_level, account_details, 
    has_rental, stock, is_flash_sale, flash_sale_end_time
)
SELECT 
    'Akun ' || gt.name || ' ' || t.name || ' Showcase',
    'Akun ' || gt.name || ' tier ' || t.name || ' untuk demo dynamic system.',
    (t.price_range_min + t.price_range_max) / 2,
    (t.price_range_min + t.price_range_max) / 2 * 1.2,
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400',
    t.id,
    gt.id,
    'Level Demo',
    'Sample account untuk testing tier: ' || t.name,
    true,
    5,
    false,
    NULL
FROM tiers t
CROSS JOIN game_titles gt
WHERE t.slug IN ('reguler', 'premium') 
  AND gt.slug IN ('mobile-legends', 'valorant')
  AND NOT EXISTS (
    SELECT 1 FROM products p2 
    WHERE p2.name = 'Akun ' || gt.name || ' ' || t.name || ' Showcase'
  )
LIMIT 4;

-- Summary
SELECT 
    'Migration completed successfully!' as status,
    (SELECT COUNT(*) FROM tiers) as tiers_count,
    (SELECT COUNT(*) FROM game_titles) as game_titles_count,
    (SELECT COUNT(*) FROM products WHERE tier_id IS NOT NULL) as products_with_tier,
    (SELECT COUNT(*) FROM products WHERE game_title_id IS NOT NULL) as products_with_game_title;
