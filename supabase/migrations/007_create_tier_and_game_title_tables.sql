-- Create new tables for better data normalization and dynamic management

-- Create Tier table (replacing category concept)
CREATE TABLE tiers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20), -- Hex color for UI styling
    border_color VARCHAR(20), -- Border color for badges
    background_gradient VARCHAR(100), -- CSS gradient classes
    icon VARCHAR(50), -- Icon name for UI
    price_range_min INTEGER DEFAULT 0,
    price_range_max INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Game_title table
CREATE TABLE game_titles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    category VARCHAR(50), -- MOBA, Battle Royale, RPG, FPS, Strategy
    icon VARCHAR(50), -- Icon name for UI
    color VARCHAR(20), -- Theme color
    logo_url VARCHAR(500), -- Game logo URL
    is_popular BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX idx_tiers_slug ON tiers(slug);
CREATE INDEX idx_tiers_is_active ON tiers(is_active);
CREATE INDEX idx_tiers_sort_order ON tiers(sort_order);

CREATE INDEX idx_game_titles_slug ON game_titles(slug);
CREATE INDEX idx_game_titles_category ON game_titles(category);
CREATE INDEX idx_game_titles_is_active ON game_titles(is_active);
CREATE INDEX idx_game_titles_is_popular ON game_titles(is_popular);
CREATE INDEX idx_game_titles_sort_order ON game_titles(sort_order);

-- Create triggers for updated_at
CREATE TRIGGER update_tiers_updated_at BEFORE UPDATE ON tiers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_game_titles_updated_at BEFORE UPDATE ON game_titles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert tier data
INSERT INTO tiers (name, slug, description, color, border_color, background_gradient, icon, price_range_min, price_range_max, sort_order) VALUES
('Reguler', 'reguler', 'Akun standar dengan fitur dasar, cocok untuk pemula dan budget terbatas', '#6b7280', '#9ca3af', 'from-pink-600 to-rose-600', 'Trophy', 0, 500000, 1),
('Pelajar', 'pelajar', 'Akun premium dengan harga khusus untuk pelajar dan mahasiswa', '#3b82f6', '#60a5fa', 'from-blue-500 to-indigo-600', 'Users', 500000, 2000000, 2),
('Premium', 'premium', 'Akun premium dengan fitur lengkap dan koleksi terbaik untuk pro player', '#f59e0b', '#fbbf24', 'from-amber-500 to-orange-600', 'Crown', 2000000, NULL, 3);

-- Insert game title data
INSERT INTO game_titles (name, slug, description, category, icon, color, is_popular, sort_order) VALUES
('Mobile Legends', 'mobile-legends', 'MOBA terpopuler di Indonesia dengan hero dan skin legendary', 'MOBA', 'Shield', '#1e40af', TRUE, 1),
('PUBG Mobile', 'pubg-mobile', 'Battle Royale dengan grafis realistis dan gameplay kompetitif', 'Battle Royale', 'Target', '#dc2626', TRUE, 2),
('Free Fire', 'free-fire', 'Battle Royale ringan dengan karakter unik dan gameplay cepat', 'Battle Royale', 'Zap', '#ea580c', TRUE, 3),
('Genshin Impact', 'genshin-impact', 'RPG open world dengan karakter anime dan sistem gacha', 'RPG', 'Sparkles', '#7c3aed', TRUE, 4),
('Call of Duty Mobile', 'call-of-duty-mobile', 'FPS dengan mode Battle Royale dan Multiplayer', 'FPS', 'Crosshair', '#374151', TRUE, 5),
('Valorant', 'valorant', 'FPS taktis dengan agent abilities dan gameplay kompetitif', 'FPS', 'Crosshair', '#ff4655', TRUE, 6),
('Arena of Valor', 'arena-of-valor', 'MOBA dengan hero DC Comics dan gameplay balanced', 'MOBA', 'Sword', '#0ea5e9', FALSE, 7),
('Clash of Clans', 'clash-of-clans', 'Strategy game dengan village building dan clan wars', 'Strategy', 'Castle', '#22c55e', FALSE, 8),
('Clash Royale', 'clash-royale', 'Strategy card game dengan tower defense mechanics', 'Strategy', 'Crown', '#a855f7', FALSE, 9),
('Honkai Impact', 'honkai-impact', 'Action RPG dengan karakter anime dan combat dinamis', 'RPG', 'Zap', '#ec4899', FALSE, 10);

-- Add RLS policies
ALTER TABLE tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_titles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tiers are viewable by everyone" ON tiers FOR SELECT USING (true);
CREATE POLICY "Game titles are viewable by everyone" ON game_titles FOR SELECT USING (true);

-- Admin policies (for future admin panel)
-- CREATE POLICY "Admins can manage tiers" ON tiers FOR ALL USING (auth.role() = 'admin');
-- CREATE POLICY "Admins can manage game_titles" ON game_titles FOR ALL USING (auth.role() = 'admin');
