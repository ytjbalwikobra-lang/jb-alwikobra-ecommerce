-- ============================================================================
-- TRADITIONAL AUTH WITH WHATSAPP VERIFICATION SYSTEM
-- ============================================================================
-- Traditional login/signup with WhatsApp verification for new users
-- ============================================================================

-- 0. Clean up WhatsApp-only auth system
DO $$ 
BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Allow all operations on whatsapp_users" ON whatsapp_users;
    DROP POLICY IF EXISTS "Allow all operations on whatsapp_auth_sessions" ON whatsapp_auth_sessions;
    DROP POLICY IF EXISTS "Allow all operations on user_sessions" ON user_sessions;
    
    -- Drop existing triggers if they exist
    DROP TRIGGER IF EXISTS update_whatsapp_users_updated_at ON whatsapp_users;
    
    -- Drop existing tables if they exist (cleanup)
    DROP TABLE IF EXISTS whatsapp_auth_sessions CASCADE;
    DROP TABLE IF EXISTS user_sessions CASCADE;
    DROP TABLE IF EXISTS whatsapp_users CASCADE;
EXCEPTION
    WHEN OTHERS THEN
        -- Ignore errors during cleanup
        NULL;
END $$;

-- 1. Create users table (traditional auth with phone/email)
CREATE TABLE users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text UNIQUE, -- Indonesian phone number
  email text UNIQUE, -- Email (added during profile completion)
  password_hash text NOT NULL, -- Hashed password
  name text, -- Full name (added during profile completion)
  is_active boolean DEFAULT true,
  is_admin boolean DEFAULT false,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login_at timestamptz,
  
  -- Phone verification status
  phone_verified boolean DEFAULT false,
  phone_verified_at timestamptz,
  
  -- Profile completion status
  profile_completed boolean DEFAULT false,
  profile_completed_at timestamptz,
  
  -- Additional profile fields
  date_of_birth date,
  gender text CHECK (gender IN ('male', 'female', 'other')),
  bio text,
  
  -- Preferences
  notification_preferences jsonb DEFAULT '{"whatsapp": true, "email": true}'::jsonb,
  
  -- Security
  login_attempts integer DEFAULT 0,
  locked_until timestamptz,
  
  -- At least phone or email must be provided
  CONSTRAINT phone_or_email_required CHECK (phone IS NOT NULL OR email IS NOT NULL),
  CONSTRAINT valid_phone CHECK (phone IS NULL OR phone ~ '^62[0-9]{9,13}$')
);

-- 2. Create phone verification sessions (for new signups)
CREATE TABLE phone_verifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  phone text NOT NULL,
  verification_code text NOT NULL, -- 6-digit code
  expires_at timestamptz NOT NULL,
  verified_at timestamptz,
  attempts integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  
  -- Security fields
  is_used boolean DEFAULT false,
  ip_address inet,
  user_agent text,
  
  CONSTRAINT code_not_expired CHECK (expires_at > now() OR is_used = true)
);

-- 3. Create user sessions (after successful login)
CREATE TABLE user_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
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
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = true;
CREATE INDEX idx_users_admin ON users(is_admin) WHERE is_admin = true;
CREATE INDEX idx_users_phone_verified ON users(phone_verified) WHERE phone_verified = true;
CREATE INDEX idx_users_profile_completed ON users(profile_completed) WHERE profile_completed = true;

CREATE INDEX idx_phone_verifications_phone ON phone_verifications(phone);
CREATE INDEX idx_phone_verifications_code ON phone_verifications(verification_code);
CREATE INDEX idx_phone_verifications_expires ON phone_verifications(expires_at);
CREATE INDEX idx_phone_verifications_unused ON phone_verifications(is_used) WHERE is_used = false;

CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active) WHERE is_active = true;
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies
CREATE POLICY "Allow all operations on users" ON users
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on phone_verifications" ON phone_verifications
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on user_sessions" ON user_sessions
  FOR ALL USING (true) WITH CHECK (true);

-- 7. Helper Functions
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Trigger for auto-updating updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. Cleanup function for expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  -- Clean up expired phone verifications
  DELETE FROM phone_verifications 
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

-- 10. Create admin user (change phone number and set password)
INSERT INTO users (phone, email, name, password_hash, is_admin, phone_verified, profile_completed)
VALUES (
  '6281234567890', 
  'admin@jbalwikobra.com', 
  'Admin', 
  '$2b$10$example.hash.replace.with.real.bcrypt.hash', -- Replace with real bcrypt hash
  true, 
  true, 
  true
)
ON CONFLICT (phone) DO UPDATE SET is_admin = true;

-- 11. Add helpful comments
COMMENT ON TABLE users IS 'Traditional authentication with phone/email and password';
COMMENT ON TABLE phone_verifications IS 'WhatsApp verification codes for new phone numbers';
COMMENT ON TABLE user_sessions IS 'Active user sessions after successful authentication';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test 1: Check if tables were created
SELECT 'users' as table_name, count(*) as row_count FROM users
UNION ALL
SELECT 'phone_verifications' as table_name, count(*) as row_count FROM phone_verifications  
UNION ALL
SELECT 'user_sessions' as table_name, count(*) as row_count FROM user_sessions;

-- Test 2: Check if admin user was created
SELECT id, phone, email, name, is_admin, phone_verified, profile_completed, created_at 
FROM users 
WHERE is_admin = true;

-- Test 3: Verify RLS policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('users', 'phone_verifications', 'user_sessions');

-- ============================================================================
-- 🎉 SUCCESS! Traditional Auth with WhatsApp Verification ready!
-- ============================================================================

SELECT '🎉 Traditional Auth System Setup Complete!' as status,
       'Login: phone/email + password | Signup: phone + password → WhatsApp verify → profile completion' as message;
