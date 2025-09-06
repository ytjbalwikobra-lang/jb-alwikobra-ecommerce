-- Migration untuk memastikan tabel users dan phone_verifications ada dan sesuai
-- Berdasarkan CSV schema yang ada, kedua tabel sudah ada di production
-- Migration ini hanya menambahkan kolom/constraint yang missing (jika ada)

-- CRITICAL FIX: Remove NOT NULL constraint from password_hash
-- This allows signup flow: signup -> verify -> complete profile (set password)
DO $$ 
BEGIN
  -- Check if password_hash has NOT NULL constraint and remove it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' 
    AND column_name = 'password_hash' 
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;
  END IF;
END $$;

-- Pastikan function update_updated_at_column ada
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Tambahkan kolom yang mungkin missing di tabel users (jika belum ada)
DO $$ 
BEGIN
  -- Cek dan tambah kolom phone_verified jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone_verified'
  ) THEN
    ALTER TABLE users ADD COLUMN phone_verified boolean DEFAULT false;
  END IF;

  -- Cek dan tambah kolom phone_verified_at jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'phone_verified_at'
  ) THEN
    ALTER TABLE users ADD COLUMN phone_verified_at timestamptz;
  END IF;

  -- Cek dan tambah kolom is_active jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE users ADD COLUMN is_active boolean DEFAULT true;
  END IF;

  -- Cek dan tambah kolom is_admin jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE users ADD COLUMN is_admin boolean DEFAULT false;
  END IF;

  -- Cek dan tambah kolom profile_completed jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'profile_completed'
  ) THEN
    ALTER TABLE users ADD COLUMN profile_completed boolean DEFAULT false;
  END IF;

  -- Cek dan tambah kolom profile_completed_at jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'profile_completed_at'
  ) THEN
    ALTER TABLE users ADD COLUMN profile_completed_at timestamptz;
  END IF;

  -- Cek dan tambah kolom password_hash jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'password_hash'
  ) THEN
    ALTER TABLE users ADD COLUMN password_hash text;
  END IF;

  -- Cek dan tambah kolom login_attempts jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'login_attempts'
  ) THEN
    ALTER TABLE users ADD COLUMN login_attempts integer DEFAULT 0;
  END IF;

  -- Cek dan tambah kolom locked_until jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'locked_until'
  ) THEN
    ALTER TABLE users ADD COLUMN locked_until timestamptz;
  END IF;

  -- Cek dan tambah kolom last_login_at jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE users ADD COLUMN last_login_at timestamptz;
  END IF;

  -- Cek dan tambah kolom updated_at jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'users' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE users ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Tambahkan kolom yang mungkin missing di tabel phone_verifications (jika belum ada)
DO $$ 
BEGIN
  -- Cek dan tambah kolom attempt_count jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'phone_verifications' AND column_name = 'attempt_count'
  ) THEN
    ALTER TABLE phone_verifications ADD COLUMN attempt_count integer DEFAULT 0;
  END IF;

  -- Cek dan tambah kolom updated_at jika belum ada
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'phone_verifications' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE phone_verifications ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Buat indexes yang mungkin belum ada
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_user_id ON phone_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_code ON phone_verifications(verification_code);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires ON phone_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_used ON phone_verifications(is_used);

-- Pastikan RLS enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;

-- Buat function cleanup
CREATE OR REPLACE FUNCTION cleanup_expired_phone_verifications()
RETURNS void AS $$
BEGIN
  DELETE FROM phone_verifications 
  WHERE expires_at < now() - interval '1 hour' AND is_used = false;
    
  DELETE FROM phone_verifications 
  WHERE verified_at < now() - interval '24 hours' AND is_used = true;
END;
$$ LANGUAGE plpgsql;
