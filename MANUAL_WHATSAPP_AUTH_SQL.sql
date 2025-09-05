-- ============================================================================
-- WHATSAPP AUTHENTICATION SYSTEM - MANUAL SQL FOR SUPABASE DASHBOARD
-- ============================================================================
-- Copy and paste this SQL into your Supabase Dashboard > SQL Editor
-- This creates a custom WhatsApp-first auth system without touching existing data
-- ============================================================================

-- 1. Create custom users table for WhatsApp authentication
CREATE TABLE IF NOT EXISTS custom_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp text NOT NULL UNIQUE,
  email text UNIQUE,
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
  
  CONSTRAINT valid_whatsapp CHECK (whatsapp ~ '^62[0-9]{9,13}$'),
  CONSTRAINT valid_email CHECK (email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- 2. Create WhatsApp authentication sessions (magic links)
CREATE TABLE IF NOT EXISTS whatsapp_auth_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES custom_users(id) ON DELETE CASCADE,
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
  user_id uuid REFERENCES custom_users(id) ON DELETE CASCADE,
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
CREATE INDEX IF NOT EXISTS idx_custom_users_whatsapp ON custom_users(whatsapp);
CREATE INDEX IF NOT EXISTS idx_custom_users_email ON custom_users(email);
CREATE INDEX IF NOT EXISTS idx_custom_users_active ON custom_users(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_custom_users_admin ON custom_users(is_admin) WHERE is_admin = true;

CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_token ON whatsapp_auth_sessions(auth_token);
CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_link ON whatsapp_auth_sessions(magic_link);
CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_expires ON whatsapp_auth_sessions(expires_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_unused ON whatsapp_auth_sessions(is_used) WHERE is_used = false;

CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_auth_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for custom_users
CREATE POLICY "Users can view their own profile" ON custom_users
  FOR SELECT USING (id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can update their own profile" ON custom_users
  FOR UPDATE USING (id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Public signup allowed" ON custom_users
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can view all users" ON custom_users
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM custom_users 
      WHERE id = (current_setting('app.current_user_id', true))::uuid 
      AND is_admin = true
    )
  );

-- 7. Create RLS Policies for auth sessions
CREATE POLICY "Public auth session creation" ON whatsapp_auth_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own auth sessions" ON whatsapp_auth_sessions
  FOR SELECT USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- 8. Create RLS Policies for user sessions
CREATE POLICY "Public session creation" ON user_sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can view their own sessions" ON user_sessions
  FOR SELECT USING (user_id = (current_setting('app.current_user_id', true))::uuid);

CREATE POLICY "Users can update their own sessions" ON user_sessions
  FOR UPDATE USING (user_id = (current_setting('app.current_user_id', true))::uuid);

-- 9. Helper Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 10. Trigger for auto-updating updated_at
CREATE TRIGGER update_custom_users_updated_at 
  BEFORE UPDATE ON custom_users 
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
INSERT INTO custom_users (whatsapp, name, email, is_admin)
VALUES ('6281234567890', 'Admin', 'admin@jbalwikobra.com', true)
ON CONFLICT (whatsapp) DO UPDATE SET is_admin = true;

-- 13. Add helpful comments
COMMENT ON TABLE custom_users IS 'Custom user authentication system using WhatsApp - replaces Supabase auth';
COMMENT ON TABLE whatsapp_auth_sessions IS 'WhatsApp magic link authentication sessions';
COMMENT ON TABLE user_sessions IS 'Active user sessions after successful authentication';

-- ============================================================================
-- VERIFICATION QUERIES (run these to check if everything was created)
-- ============================================================================

-- Check if tables were created
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('custom_users', 'whatsapp_auth_sessions', 'user_sessions');

-- Check if indexes were created  
SELECT indexname 
FROM pg_indexes 
WHERE tablename IN ('custom_users', 'whatsapp_auth_sessions', 'user_sessions');

-- Check if admin user was created
SELECT id, whatsapp, name, is_admin, created_at 
FROM custom_users 
WHERE is_admin = true;

-- ============================================================================
-- SUCCESS! Your WhatsApp authentication system is now ready!
-- ============================================================================
