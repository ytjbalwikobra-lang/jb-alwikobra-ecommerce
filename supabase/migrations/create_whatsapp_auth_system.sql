-- WhatsApp-First Authentication System
-- Complete replacement for Supabase auth using custom user table

-- Create custom users table (independent of Supabase auth)
CREATE TABLE IF NOT EXISTS custom_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  whatsapp text UNIQUE NOT NULL,
  name text NOT NULL,
  password_hash text, -- Optional: for web login backup
  is_verified boolean DEFAULT false,
  is_admin boolean DEFAULT false,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  last_login_at timestamptz,
  login_count integer DEFAULT 0
);

-- WhatsApp authentication sessions (replaces JWT tokens)
CREATE TABLE IF NOT EXISTS whatsapp_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES custom_users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  whatsapp_verification_code text,
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  ip_address text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- WhatsApp verification codes (for login)
CREATE TABLE IF NOT EXISTS whatsapp_verifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp text NOT NULL,
  verification_code text NOT NULL,
  purpose text NOT NULL, -- 'login', 'signup', 'password_reset'
  expires_at timestamptz NOT NULL,
  is_used boolean DEFAULT false,
  user_id uuid REFERENCES custom_users(id),
  created_at timestamptz DEFAULT now()
);

-- User profiles and preferences
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES custom_users(id) ON DELETE CASCADE,
  bio text,
  preferences jsonb DEFAULT '{}',
  notification_settings jsonb DEFAULT '{"whatsapp": true, "email": false}',
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_users_email ON custom_users(email);
CREATE INDEX IF NOT EXISTS idx_custom_users_whatsapp ON custom_users(whatsapp);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_token ON whatsapp_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_whatsapp_sessions_user ON whatsapp_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_verifications_code ON whatsapp_verifications(verification_code);
CREATE INDEX IF NOT EXISTS idx_whatsapp_verifications_whatsapp ON whatsapp_verifications(whatsapp);

-- Enable RLS (Row Level Security)
ALTER TABLE custom_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users can read their own data
CREATE POLICY "Users can view own data" ON custom_users
  FOR SELECT USING (id = auth.uid()::uuid OR id = current_setting('app.current_user_id', true)::uuid);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON custom_users
  FOR UPDATE USING (id = auth.uid()::uuid OR id = current_setting('app.current_user_id', true)::uuid);

-- Sessions policy
CREATE POLICY "Users can manage own sessions" ON whatsapp_sessions
  FOR ALL USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Verification codes policy (more permissive for auth flow)
CREATE POLICY "Verification codes access" ON whatsapp_verifications
  FOR ALL USING (true); -- Handled in application logic

-- User profiles policy
CREATE POLICY "Users can manage own profiles" ON user_profiles
  FOR ALL USING (user_id = current_setting('app.current_user_id', true)::uuid);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating timestamps
CREATE TRIGGER update_custom_users_updated_at BEFORE UPDATE
    ON custom_users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE
    ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to cleanup expired sessions and codes
CREATE OR REPLACE FUNCTION cleanup_expired_auth_data()
RETURNS void AS $$
BEGIN
  -- Clean expired sessions
  DELETE FROM whatsapp_sessions WHERE expires_at < now();
  
  -- Clean expired verification codes
  DELETE FROM whatsapp_verifications WHERE expires_at < now();
  
  -- Clean used verification codes older than 24 hours
  DELETE FROM whatsapp_verifications 
  WHERE is_used = true AND created_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Create admin user function
CREATE OR REPLACE FUNCTION create_admin_user(
  p_email text,
  p_whatsapp text,
  p_name text,
  p_password text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  new_user_id uuid;
  password_hash_val text;
BEGIN
  -- Hash password if provided
  IF p_password IS NOT NULL THEN
    password_hash_val := crypt(p_password, gen_salt('bf'));
  END IF;
  
  -- Insert user
  INSERT INTO custom_users (email, whatsapp, name, password_hash, is_verified, is_admin)
  VALUES (p_email, p_whatsapp, p_name, password_hash_val, true, true)
  RETURNING id INTO new_user_id;
  
  -- Create profile
  INSERT INTO user_profiles (user_id) VALUES (new_user_id);
  
  RETURN new_user_id;
END;
$$ LANGUAGE plpgsql;

-- Insert default admin user (change credentials as needed)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM custom_users WHERE email = 'admin@jbalwikobra.com') THEN
    PERFORM create_admin_user(
      'admin@jbalwikobra.com',
      '6281234567890',
      'Admin JB Alwikobra',
      'admin123'
    );
  END IF;
END $$;
