-- First, create users table if it doesn't exist (for custom auth system)
CREATE TABLE IF NOT EXISTS users (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  phone text UNIQUE NOT NULL,
  name text,
  email text,
  phone_verified boolean DEFAULT false,
  phone_verified_at timestamptz,
  is_active boolean DEFAULT true,
  is_admin boolean DEFAULT false,
  profile_completed boolean DEFAULT false,
  profile_completed_at timestamptz,
  password_hash text,
  login_attempts integer DEFAULT 0,
  locked_until timestamptz,
  last_login_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create function for updating updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Enable RLS for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create trigger for users updated_at
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users
  FOR SELECT USING (id = current_setting('app.current_user_id')::uuid);

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE USING (id = current_setting('app.current_user_id')::uuid);

-- Service role can manage all users
CREATE POLICY "Service role can manage users" ON users
  FOR ALL USING (current_setting('app.service_role', true) = 'true');

-- Create phone_verifications table for SMS/WhatsApp verification
-- This table tracks verification codes sent to users during registration

CREATE TABLE IF NOT EXISTS phone_verifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  phone text NOT NULL,
  verification_code text NOT NULL,
  expires_at timestamptz NOT NULL,
  is_used boolean DEFAULT false,
  verified_at timestamptz,
  ip_address text,
  user_agent text,
  attempt_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_phone_verifications_user_id ON phone_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_phone ON phone_verifications(phone);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_code ON phone_verifications(verification_code);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_expires ON phone_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_phone_verifications_used ON phone_verifications(is_used);

-- Enable RLS (Row Level Security)
ALTER TABLE phone_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for phone_verifications
-- Only service role can manage verification codes for security
CREATE POLICY "Service role can manage phone verifications" ON phone_verifications
  FOR ALL USING (current_setting('app.service_role', true) = 'true');

-- Users can only see their own verification records (for debugging)
CREATE POLICY "Users can view their own phone verifications" ON phone_verifications
  FOR SELECT USING (user_id = current_setting('app.current_user_id')::uuid);

-- Create function to clean up expired verification codes
CREATE OR REPLACE FUNCTION cleanup_expired_phone_verifications()
RETURNS void AS $$
BEGIN
  -- Delete expired and unused verification codes older than 1 hour
  DELETE FROM phone_verifications 
  WHERE expires_at < now() - interval '1 hour'
    AND is_used = false;
    
  -- Delete old used verification codes (keep for 24 hours for audit)
  DELETE FROM phone_verifications 
  WHERE verified_at < now() - interval '24 hours'
    AND is_used = true;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_phone_verifications_updated_at 
  BEFORE UPDATE ON phone_verifications 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add constraints for security
ALTER TABLE phone_verifications 
  ADD CONSTRAINT chk_verification_code_length 
  CHECK (length(verification_code) >= 4 AND length(verification_code) <= 10);

ALTER TABLE phone_verifications 
  ADD CONSTRAINT chk_phone_format 
  CHECK (phone ~ '^\+[1-9]\d{1,14}$');

ALTER TABLE phone_verifications 
  ADD CONSTRAINT chk_attempt_count 
  CHECK (attempt_count >= 0 AND attempt_count <= 10);

COMMENT ON TABLE phone_verifications IS 'Phone verification codes for user registration and login';
COMMENT ON COLUMN phone_verifications.verification_code IS 'SMS/WhatsApp verification code (4-10 digits)';
COMMENT ON COLUMN phone_verifications.expires_at IS 'Verification code expiration time (typically 15 minutes)';
COMMENT ON COLUMN phone_verifications.attempt_count IS 'Number of verification attempts (max 10)';
COMMENT ON FUNCTION cleanup_expired_phone_verifications() IS 'Cleanup function for expired verification codes - run via cron';
