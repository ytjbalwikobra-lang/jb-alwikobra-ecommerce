-- CHECKLIST MIGRATION SUPABASE PRODUCTION
-- Jalankan migrations ini di Supabase SQL Editor SECARA BERURUTAN

-- ===== MIGRATION WAJIB UNTUK ORDER SYSTEM =====

-- 1. PALING PENTING: Tambah kolom client_external_id untuk idempotency
-- File: 20250831_add_client_external_id.sql
ALTER TABLE IF EXISTS orders
  ADD COLUMN IF NOT EXISTS client_external_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS uq_orders_client_external_id
  ON orders(client_external_id)
  WHERE client_external_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_orders_client_external_id
  ON orders(client_external_id);

-- 2. PENTING: Kolom invoice metadata untuk Xendit
-- File: 004_add_invoice_metadata.sql
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS xendit_invoice_id TEXT,
  ADD COLUMN IF NOT EXISTS xendit_invoice_url TEXT,
  ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'IDR',
  ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS payment_channel TEXT,
  ADD COLUMN IF NOT EXISTS payer_email TEXT,
  ADD COLUMN IF NOT EXISTS payer_phone TEXT;

CREATE INDEX IF NOT EXISTS idx_orders_xendit_invoice_id ON orders(xendit_invoice_id);

-- 3. PENTING: RLS Policy untuk Admin bisa baca orders
-- File: 20250831_fix_orders_select_policy.sql
ALTER TABLE IF EXISTS public.orders ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='orders' AND policyname='orders_read_auth'
  ) THEN
    CREATE POLICY orders_read_auth ON public.orders FOR SELECT TO authenticated USING (true);
  END IF;
END $$;

-- 4. PENTING: Kolom archiving untuk products
-- File: 20250830_archive_products.sql
ALTER TABLE IF EXISTS products
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_products_is_active_archived 
  ON products(is_active, archived_at) 
  WHERE is_active = false;

-- 5. RLS untuk hide archived products dari public
-- File: 20250830_rls_archive_filter.sql
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname='public' AND tablename='products' AND policyname='Products select non-archived'
  ) THEN
    CREATE POLICY "Products select non-archived" ON public.products
      FOR SELECT USING (is_active IS NULL OR is_active = true);
  END IF;
END $$;

-- ===== OPTIONAL ENHANCEMENTS =====

-- 6. Website settings table (sudah ada tapi pastikan)
CREATE TABLE IF NOT EXISTS website_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name TEXT DEFAULT 'JB Alwikobra',
  logo_url TEXT,
  favicon_url TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  whatsapp_number TEXT DEFAULT '6281234567890',
  address TEXT,
  facebook_url TEXT,
  instagram_url TEXT,
  tiktok_url TEXT,
  hero_title TEXT,
  hero_subtitle TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default settings jika belum ada
INSERT INTO website_settings (id, site_name, whatsapp_number) 
SELECT uuid_generate_v4(), 'JB Alwikobra', '6281234567890'
WHERE NOT EXISTS (SELECT 1 FROM website_settings);

-- 7. Banners table (optional)
CREATE TABLE IF NOT EXISTS banners (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  cta_text TEXT,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ===== VERIFICATION QUERIES =====

-- Cek apakah semua kolom sudah ada
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema='public' AND table_name='orders'
AND column_name IN ('client_external_id', 'xendit_invoice_id', 'xendit_invoice_url')
ORDER BY column_name;

-- Cek apakah unique index ada
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE schemaname='public' AND tablename='orders' 
AND indexname LIKE '%client_external_id%';

-- Cek RLS policies
SELECT schemaname, tablename, policyname, cmd, permissive
FROM pg_policies 
WHERE schemaname='public' AND tablename IN ('orders', 'products')
ORDER BY tablename, policyname;

-- Cek apakah ada sample data
SELECT COUNT(*) as total_products FROM products;
SELECT COUNT(*) as total_orders FROM orders;
SELECT * FROM website_settings LIMIT 1;
