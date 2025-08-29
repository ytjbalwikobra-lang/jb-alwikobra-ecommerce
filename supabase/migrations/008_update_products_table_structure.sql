-- Update products table to use foreign keys for better normalization

-- Add new columns for foreign key relationships
ALTER TABLE products ADD COLUMN tier_id UUID;
ALTER TABLE products ADD COLUMN game_title_id UUID;

-- Add foreign key constraints
ALTER TABLE products ADD CONSTRAINT fk_products_tier 
    FOREIGN KEY (tier_id) REFERENCES tiers(id) ON DELETE SET NULL;
    
ALTER TABLE products ADD CONSTRAINT fk_products_game_title 
    FOREIGN KEY (game_title_id) REFERENCES game_titles(id) ON DELETE SET NULL;

-- Add indexes for foreign keys
CREATE INDEX idx_products_tier_id ON products(tier_id);
CREATE INDEX idx_products_game_title_id ON products(game_title_id);

-- Migrate existing data to new structure
-- Update tier_id based on current tier column
UPDATE products SET tier_id = (
    SELECT id FROM tiers WHERE tiers.slug = products.tier
) WHERE products.tier IS NOT NULL;

-- Update game_title_id based on current game_title column
UPDATE products SET game_title_id = (
    SELECT id FROM game_titles WHERE game_titles.name = products.game_title
) WHERE products.game_title IS NOT NULL;

-- For products without matching game_title, assign to Mobile Legends as default
UPDATE products SET game_title_id = (
    SELECT id FROM game_titles WHERE slug = 'mobile-legends'
) WHERE products.game_title_id IS NULL;

-- For products without matching tier, assign to reguler as default
UPDATE products SET tier_id = (
    SELECT id FROM tiers WHERE slug = 'reguler'
) WHERE products.tier_id IS NULL;

-- Create backup of old data (for reference)
CREATE TABLE products_backup AS SELECT * FROM products;

-- Drop old enum type and columns (keep as backup first)
-- ALTER TABLE products DROP COLUMN tier;
-- ALTER TABLE products DROP COLUMN game_title;
-- ALTER TABLE products DROP COLUMN category;

-- Note: We'll keep the old columns for now to ensure data integrity
-- They can be dropped after verification that the migration worked correctly
