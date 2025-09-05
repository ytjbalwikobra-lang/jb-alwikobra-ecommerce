-- Custom WhatsApp-First Authentication System
-- This replaces Supabase Auth with a simpler, WhatsApp-based system

-- Drop existing auth_confirmations table if it exists
DROP TABLE IF EXISTS auth_confirmations;

-- Create users table for custom authentication
CREATE TABLE IF NOT EXISTS whatsapp_users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text UNIQUE NOT NULL,
  whatsapp text UNIQUE NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  is_active boolean DEFAULT true,
  email_verified boolean DEFAULT false,
  whatsapp_verified boolean DEFAULT false,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create authentication tokens table
CREATE TABLE IF NOT EXISTS whatsapp_auth_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES whatsapp_users(id) ON DELETE CASCADE,
  token text UNIQUE NOT NULL,
  token_type text NOT NULL CHECK (token_type IN ('login', 'signup', 'reset')),
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create user sessions table
CREATE TABLE IF NOT EXISTS whatsapp_user_sessions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES whatsapp_users(id) ON DELETE CASCADE,
  session_token text UNIQUE NOT NULL,
  expires_at timestamptz NOT NULL,
  ip_address text,
  user_agent text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_activity_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_email ON whatsapp_users(email);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_whatsapp ON whatsapp_users(whatsapp);
CREATE INDEX IF NOT EXISTS idx_whatsapp_users_role ON whatsapp_users(role);
CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_tokens_token ON whatsapp_auth_tokens(token);
CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_tokens_user_id ON whatsapp_auth_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_auth_tokens_expires ON whatsapp_auth_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_whatsapp_user_sessions_token ON whatsapp_user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_whatsapp_user_sessions_user_id ON whatsapp_user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_whatsapp_user_sessions_expires ON whatsapp_user_sessions(expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE whatsapp_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_auth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_user_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON whatsapp_users
  FOR SELECT USING (id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can update their own data" ON whatsapp_users
  FOR UPDATE USING (id = current_setting('app.current_user_id')::uuid);

-- Create policies for tokens (admin/service access only)
CREATE POLICY "Service access only for tokens" ON whatsapp_auth_tokens
  FOR ALL USING (current_setting('app.service_role', true) = 'true');

-- Create policies for sessions
CREATE POLICY "Users can view their own sessions" ON whatsapp_user_sessions
  FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_whatsapp_users_updated_at 
  BEFORE UPDATE ON whatsapp_users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired tokens and sessions
CREATE OR REPLACE FUNCTION cleanup_expired_auth_data()
RETURNS void AS $$
BEGIN
  -- Clean up expired tokens
  DELETE FROM whatsapp_auth_tokens 
  WHERE expires_at < now() AND used_at IS NULL;
  
  -- Clean up expired sessions
  DELETE FROM whatsapp_user_sessions 
  WHERE expires_at < now() OR is_active = false;
  
  -- Update last_activity for active sessions
  UPDATE whatsapp_user_sessions 
  SET last_activity_at = now() 
  WHERE is_active = true AND last_activity_at < now() - interval '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Insert default admin user (you can change these details)
INSERT INTO whatsapp_users (
  email, 
  whatsapp, 
  name, 
  role, 
  is_active, 
  email_verified, 
  whatsapp_verified
) VALUES (
  'admin@jbalwikobra.com',
  '6281234567890',
  'Admin JB Alwikobra',
  'admin',
  true,
  true,
  true
) ON CONFLICT (email) DO NOTHING;

-- Create view for user profile (excludes sensitive data)
CREATE OR REPLACE VIEW user_profiles AS
SELECT 
  id,
  email,
  whatsapp,
  name,
  role,
  is_active,
  email_verified,
  whatsapp_verified,
  last_login_at,
  created_at
FROM whatsapp_users
WHERE is_active = true;

COMMENT ON TABLE whatsapp_users IS 'Custom user authentication table for WhatsApp-first auth system';
COMMENT ON TABLE whatsapp_auth_tokens IS 'Authentication tokens for login/signup via WhatsApp';
COMMENT ON TABLE whatsapp_user_sessions IS 'Active user sessions with token-based authentication';
COMMENT ON FUNCTION cleanup_expired_auth_data() IS 'Cleanup function for expired tokens and sessions - run via cron';

-- Show created tables
SELECT 
  schemaname,
  tablename,
  tableowner
FROM pg_tables 
WHERE tablename LIKE 'whatsapp_%'
ORDER BY tablename;
