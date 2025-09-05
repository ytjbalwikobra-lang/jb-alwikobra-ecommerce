-- Create table for WhatsApp authentication confirmations
-- This replaces the email confirmation system with WhatsApp

CREATE TABLE IF NOT EXISTS auth_confirmations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL,
  whatsapp text NOT NULL,
  name text NOT NULL,
  confirmation_token text NOT NULL UNIQUE,
  confirmed boolean DEFAULT false,
  confirmed_at timestamptz,
  user_id uuid REFERENCES auth.users(id),
  expires_at timestamptz NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_auth_confirmations_token ON auth_confirmations(confirmation_token);
CREATE INDEX IF NOT EXISTS idx_auth_confirmations_email ON auth_confirmations(email);
CREATE INDEX IF NOT EXISTS idx_auth_confirmations_expires ON auth_confirmations(expires_at);

-- Enable RLS (Row Level Security)
ALTER TABLE auth_confirmations ENABLE ROW LEVEL SECURITY;

-- Create policy for admin access only
CREATE POLICY "Admin access only" ON auth_confirmations
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create function to clean up expired confirmations
CREATE OR REPLACE FUNCTION cleanup_expired_confirmations()
RETURNS void AS $$
BEGIN
  DELETE FROM auth_confirmations 
  WHERE expires_at < now() AND confirmed = false;
END;
$$ LANGUAGE plpgsql;

-- Optional: Create a scheduled function to run cleanup
-- This would need to be set up in Supabase dashboard or via cron
-- SELECT cron.schedule('cleanup-expired-confirmations', '0 */6 * * *', 'SELECT cleanup_expired_confirmations();');
