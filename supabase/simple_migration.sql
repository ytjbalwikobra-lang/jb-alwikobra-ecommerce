-- JB AlwiKobra E-commerce - Simple Step-by-Step Migration
-- Run each section one by one in Supabase SQL Editor

-- STEP 1: Create tiers table
CREATE TABLE IF NOT EXISTS tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) NOT NULL,
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

-- STEP 2: Create game_titles table
CREATE TABLE IF NOT EXISTS game_titles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    icon VARCHAR(50) NOT NULL,
    color VARCHAR(7) NOT NULL,
    logo_url VARCHAR(500),
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- STEP 3: Insert sample tier data
INSERT INTO tiers (slug, name, description, color, border_color, background_gradient, icon, price_range_min, price_range_max, sort_order)
VALUES
    ('reguler', 'Reguler', 'Tier standar dengan harga terjangkau untuk semua kalangan', '#10b981', '#059669', 'bg-gradient-to-br from-green-50 to-green-100', 'Circle', 100000, 800000, 1),
    ('pelajar', 'Pelajar', 'Tier khusus pelajar dengan diskon dan benefit istimewa', '#3b82f6', '#2563eb', 'bg-gradient-to-br from-blue-50 to-blue-100', 'GraduationCap', 200000, 1200000, 2),
    ('premium', 'Premium', 'Tier premium dengan layanan dan kualitas terbaik', '#f59e0b', '#d97706', 'bg-gradient-to-br from-yellow-50 to-yellow-100', 'Crown', 1000000, 5000000, 3)
ON CONFLICT (slug) DO NOTHING;

-- STEP 4: Insert sample game title data
INSERT INTO game_titles (slug, name, description, category, icon, color, logo_url, is_popular, sort_order)
VALUES
    ('mobile-legends', 'Mobile Legends', 'MOBA terpopuler di Indonesia', 'MOBA', 'Sword', '#10b981', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=100', true, 1),
    ('valorant', 'Valorant', 'FPS tactical shooter dari Riot Games', 'FPS', 'Target', '#dc2626', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100', true, 2),
    ('genshin-impact', 'Genshin Impact', 'Open-world action RPG dengan sistem gacha', 'RPG', 'Star', '#3b82f6', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100', true, 3),
    ('pubg-mobile', 'PUBG Mobile', 'Battle Royale terpopuler', 'Battle Royale', 'Target', '#ea580c', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=100', true, 4),
    ('free-fire', 'Free Fire', 'Battle Royale ringan', 'Battle Royale', 'Zap', '#ea580c', 'https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=100', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- STEP 5: Add foreign key columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS tier_id UUID;
ALTER TABLE products ADD COLUMN IF NOT EXISTS game_title_id UUID;

-- STEP 6: Set default values for all products
UPDATE products 
SET tier_id = (SELECT id FROM tiers WHERE slug = 'reguler' LIMIT 1)
WHERE tier_id IS NULL;

UPDATE products 
SET game_title_id = (SELECT id FROM game_titles WHERE slug = 'mobile-legends' LIMIT 1)
WHERE game_title_id IS NULL;

-- STEP 7: Add foreign key constraints (safe way)
DO $$
BEGIN
    -- Add tier_id foreign key constraint
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE table_name = 'products' AND constraint_name = 'products_tier_id_fkey'
    ) THEN
        ALTER TABLE products 
        ADD CONSTRAINT products_tier_id_fkey 
        FOREIGN KEY (tier_id) REFERENCES tiers(id) ON DELETE RESTRICT;
    END IF;
    
    -- Add game_title_id foreign key constraint
    IF NOT EXISTS (
        SELECT FROM information_schema.table_constraints 
        WHERE table_name = 'products' AND constraint_name = 'products_game_title_id_fkey'
    ) THEN
        ALTER TABLE products 
        ADD CONSTRAINT products_game_title_id_fkey 
        FOREIGN KEY (game_title_id) REFERENCES game_titles(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- STEP 8: Create indexes
CREATE INDEX IF NOT EXISTS idx_tiers_slug ON tiers(slug);
CREATE INDEX IF NOT EXISTS idx_game_titles_slug ON game_titles(slug);
CREATE INDEX IF NOT EXISTS idx_products_tier_id ON products(tier_id);
CREATE INDEX IF NOT EXISTS idx_products_game_title_id ON products(game_title_id);

-- STEP 9: Enable RLS
ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_titles ENABLE ROW LEVEL SECURITY;

-- STEP 10: Create RLS policies
DROP POLICY IF EXISTS "Tiers are viewable by everyone" ON tiers;
CREATE POLICY "Tiers are viewable by everyone" 
ON tiers FOR SELECT 
USING (true);

DROP POLICY IF EXISTS "Game titles are viewable by everyone" ON game_titles;
CREATE POLICY "Game titles are viewable by everyone" 
ON game_titles FOR SELECT 
USING (true);

-- STEP 11: Create optimized view
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

-- STEP 12: Grant permissions
GRANT SELECT ON products_with_details TO anon, authenticated;

-- STEP 13: Verification query
SELECT 
    'Migration completed successfully!' as status,
    (SELECT COUNT(*) FROM tiers) as tiers_count,
    (SELECT COUNT(*) FROM game_titles) as game_titles_count,
    (SELECT COUNT(*) FROM products WHERE tier_id IS NOT NULL) as products_with_tier,
    (SELECT COUNT(*) FROM products WHERE game_title_id IS NOT NULL) as products_with_game_title;
