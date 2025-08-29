-- Update RLS untuk JB Alwikobra E-commerce
-- Jalankan ini di Supabase SQL Editor jika database sudah ada

-- Enable RLS pada semua tabel
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE rental_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE flash_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies jika ada
DROP POLICY IF EXISTS "Products are viewable by everyone" ON products;
DROP POLICY IF EXISTS "Rental options are viewable by everyone" ON rental_options;
DROP POLICY IF EXISTS "Flash sales are viewable by everyone" ON flash_sales;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can view only their orders" ON orders;

-- Create policies untuk public read access
CREATE POLICY "Products are viewable by everyone" 
ON products FOR SELECT 
USING (true);

CREATE POLICY "Rental options are viewable by everyone" 
ON rental_options FOR SELECT 
USING (true);

CREATE POLICY "Flash sales are viewable by everyone" 
ON flash_sales FOR SELECT 
USING (true);

-- Create policies untuk orders
CREATE POLICY "Anyone can create orders" 
ON orders FOR INSERT 
WITH CHECK (true);

-- Only authenticated users can see orders that belong to them (by user_id)
CREATE POLICY "Users can view only their orders" 
ON orders FOR SELECT 
USING (auth.uid() IS NOT NULL AND user_id IS NOT NULL AND user_id = auth.uid());

-- Optional: Create policies untuk admin access (uncomment when implementing auth)
-- CREATE POLICY "Admins can manage products" 
-- ON products FOR ALL 
-- USING (auth.jwt() ->> 'role' = 'admin');

-- CREATE POLICY "Admins can manage flash sales" 
-- ON flash_sales FOR ALL 
-- USING (auth.jwt() ->> 'role' = 'admin');

-- CREATE POLICY "Admins can manage rental options" 
-- ON rental_options FOR ALL 
-- USING (auth.jwt() ->> 'role' = 'admin');

-- CREATE POLICY "Admins can manage orders" 
-- ON orders FOR ALL 
-- USING (auth.jwt() ->> 'role' = 'admin');

-- Verify RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'rental_options', 'flash_sales', 'orders');

-- Verify policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('products', 'rental_options', 'flash_sales', 'orders');
