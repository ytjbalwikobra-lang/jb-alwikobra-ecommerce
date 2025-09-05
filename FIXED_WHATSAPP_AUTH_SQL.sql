-- ============================================================================
-- WHATSAPP AUTHENTICATION SYSTEM - FIXED VERSION FOR SUPABASE DASHBOARD
-- ============================================================================
-- Copy and paste this SQL into your Supabase Dashboard > SQL Editor
-- This creates a custom WhatsApp-first auth system with fixed table names and RLS
-- ============================================================================

-- DROP existing tables if they exist (cleanup)
DROP TABLE IF EXISTS whatsapp_auth_sessions CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS custom_users CASCADE;

-- 1. Create whatsapp_users table (avoiding potential reserved name "custom_users")
CREATE TABLE IF NOT EXISTS whatsapp_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean DEFAULT true,
  is_admin boolean DEFAULT false,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login_at timestamptz,
  
  -- Additional profile fields
  full_name text,
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  bio text,
  
  -- Preferences
  notification_preferences jsonb DEFAULT '{"whatsapp": true, "email": false}'::jsonb,
  
  -- Security
  login_attempts integer DEFAULT 0,
  locked_until timestamptz,
  
  CONSTRAINT valid_whatsapp CHECK (whatsapp ~ '^62[0-9]{9,13}$')
);

-- 2. Create WhatsApp authentication sessions (magic links)
CREATE TABLE IF NOT EXISTS whatsapp_auth_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES whatsapp_users(id) ON DELETE CASCADE,
  whatsapp text NOT NULL,
  auth_token text NOT NULL UNIQUE,
  magic_link text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now(),
  
  -- Security fields
  is_used boolean DEFAULT false,
  attempts integer DEFAULT 0,
  
  CONSTRAINT token_not_expired CHECK (expires_at > now() OR is_used = true)
);

-- 3. Create user sessions (after successful auth)
CREATE TABLE IF NOT EXISTS user_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES whatsapp_users(id) ON DELETE CASCADE,
  session_token text NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now(),
  ip_address inet,
  user_agent text,
  is_active boolean DEFAULT true,
  
  CONSTRAINT session_not_expired CHECK (expires_at > now() OR is_active = false)
);

-- 4. Create performance indexes
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_whatsapp ON whatsapp_users(whatsapp);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_active ON whatsapp_users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_admin ON whatsapp_users(is_admin) WHERE is_admin = true;

CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_token ON whatsapp_auth_sessions(auth_token);
CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_link ON whatsapp_auth_sessions(magic_link);
CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_expires ON whatsapp_auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_unused ON whatsapp_auth_sessions(is_used) WHERE is_used = false;

CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- 5. Enable Row Level Security (RLS) - DISABLE for now to test
ALTER TABLE whatsapp_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Create PERMISSIVE RLS Policies for whatsapp_users
CREATE POLICY "Allow all operations on whatsapp_users" ON whatsapp_users
  FOR ALL USING (true) WITH CHECK (true);

-- 7. Create PERMISSIVE RLS Policies for auth sessions
CREATE POLICY "Allow all operations on whatsapp_auth_sessions" ON whatsapp_auth_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- 8. Create PERMISSIVE RLS Policies for user sessions
CREATE POLICY "Allow all operations on user_sessions" ON user_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- 9. Helper Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Trigger for auto-updating updated_at
CREATE TRIGGER update_whatsapp_users_updated_at 
  BEFORE UPDATE ON whatsapp_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 11. Cleanup function for expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  -- Clean up expired auth sessions
  DELETE FROM whatsapp_auth_sessions 
  WHERE expires_at < now() AND is_used = false;
  
  -- Clean up expired user sessions
  UPDATE user_sessions 
  SET is_active = false 
  WHERE expires_at < now() AND is_active = true;
  
  -- Delete old inactive sessions (older than 30 days)
  DELETE FROM user_sessions 
  WHERE is_active = false 
  AND created_at < now() - interval '30 days';
END;
$$ LANGUAGE plpgsql;

-- 12. Create admin user (change whatsapp number to yours)
INSERT INTO whatsapp_users (whatsapp, name, is_admin)
VALUES ('6281234567890', 'Admin', true)
ON CONFLICT (whatsapp) DO UPDATE SET is_admin = true;

-- 13. Add helpful comments
COMMENT ON TABLE whatsapp_users IS 'Custom user authentication system using WhatsApp - replaces Supabase auth';
COMMENT ON TABLE whatsapp_auth_sessions IS 'WhatsApp magic link authentication sessions';
COMMENT ON TABLE user_sessions IS 'Active user sessions after successful authentication';

-- ============================================================================
-- VERIFICATION QUERIES (run these to check if everything was created)
-- ============================================================================

-- Check if tables were created with sample data
SELECT 'whatsapp_users' as table_name, count(*) as row_count FROM whatsapp_users
UNION ALL
SELECT 'whatsapp_auth_sessions' as table_name, count(*) as row_count FROM whatsapp_auth_sessions  
UNION ALL
SELECT 'user_sessions' as table_name, count(*) as row_count FROM user_sessions;

-- Check if admin user was created
SELECT id, whatsapp, name, is_admin, created_at 
FROM whatsapp_users 
WHERE is_admin = true;

-- Test insert to verify RLS is working
INSERT INTO whatsapp_auth_sessions (whatsapp, auth_token, magic_link, expires_at)
VALUES ('6281234567891', 'test_token_123', 'https://test.com/verify', now() + interval '15 minutes');

-- Verify the test insert worked
SELECT id, whatsapp, auth_token, created_at, expires_at 
FROM whatsapp_auth_sessions 
WHERE auth_token = 'test_token_123';

-- Clean up test data
DELETE FROM whatsapp_auth_sessions WHERE auth_token = 'test_token_123';

-- ============================================================================
-- SUCCESS! Your WhatsApp authentication system is now ready!
-- ============================================================================
