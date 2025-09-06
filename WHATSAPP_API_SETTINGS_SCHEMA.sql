-- ============================================================================
-- WHATSAPP API SETTINGS DATABASE SCHEMA
-- ============================================================================
-- Dynamic WhatsApp API configuration with multiple providers support
-- ============================================================================

-- 1. Create WhatsApp API providers table
CREATE TABLE whatsapp_providers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE, -- Provider name (woo-wa, fonnte, baileys, etc.)
  display_name text NOT NULL,
  base_url text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- API endpoints configuration
  send_message_endpoint text DEFAULT '/send_message',
  async_send_message_endpoint text DEFAULT '/async_send_message',
  send_image_endpoint text DEFAULT '/send_image_url',
  send_file_endpoint text DEFAULT '/send_file_url',
  check_number_endpoint text DEFAULT '/check_number',
  
  -- API structure configuration
  phone_field_name text DEFAULT 'phone_no',
  key_field_name text DEFAULT 'key',
  message_field_name text DEFAULT 'message',
  
  -- Response format configuration
  success_status_field text DEFAULT 'status',
  success_status_value text DEFAULT 'sent',
  message_id_field text DEFAULT 'id_message',
  
  -- Rate limiting
  rate_limit_per_minute integer DEFAULT 60,
  rate_limit_per_hour integer DEFAULT 1000,
  
  -- Additional settings
  settings jsonb DEFAULT '{}'::jsonb
);

-- 2. Create WhatsApp API keys table (for dynamic key management)
CREATE TABLE whatsapp_api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id uuid REFERENCES whatsapp_providers(id) ON DELETE CASCADE,
  key_name text NOT NULL, -- User-friendly name for the key
  api_key text NOT NULL,
  is_active boolean DEFAULT true,
  is_primary boolean DEFAULT false, -- Primary key for this provider
  
  -- Usage tracking
  usage_count integer DEFAULT 0,
  last_used_at timestamptz,
  
  -- Rate limiting tracking
  requests_today integer DEFAULT 0,
  requests_this_hour integer DEFAULT 0,
  last_reset_date date DEFAULT CURRENT_DATE,
  last_reset_hour timestamptz DEFAULT date_trunc('hour', now()),
  
  -- Key metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  expires_at timestamptz, -- Optional expiry for keys
  
  -- Additional settings per key
  settings jsonb DEFAULT '{}'::jsonb,
  
  UNIQUE(provider_id, key_name)
);

-- 3. Create WhatsApp message logs table
CREATE TABLE whatsapp_message_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  api_key_id uuid REFERENCES whatsapp_api_keys(id) ON DELETE SET NULL,
  provider_id uuid REFERENCES whatsapp_providers(id) ON DELETE CASCADE,
  
  -- Message details
  phone_number text NOT NULL,
  message_type text DEFAULT 'text', -- text, image, file
  message_content text,
  media_url text,
  
  -- API response tracking
  request_body jsonb,
  response_body jsonb,
  response_status integer,
  success boolean DEFAULT false,
  message_id text, -- ID returned by provider
  
  -- Timing
  sent_at timestamptz DEFAULT now(),
  delivered_at timestamptz,
  read_at timestamptz,
  
  -- Error tracking
  error_message text,
  retry_count integer DEFAULT 0,
  
  -- Context (what triggered this message)
  context_type text, -- verification, welcome, notification, etc.
  context_id text, -- Related entity ID
  
  -- Performance metrics
  response_time_ms integer,
  
  created_at timestamptz DEFAULT now()
);

-- 4. Create indexes for performance
CREATE INDEX idx_whatsapp_providers_active ON whatsapp_providers(is_active) WHERE is_active = true;
CREATE INDEX idx_whatsapp_providers_name ON whatsapp_providers(name);

CREATE INDEX idx_whatsapp_api_keys_provider ON whatsapp_api_keys(provider_id);
CREATE INDEX idx_whatsapp_api_keys_active ON whatsapp_api_keys(is_active) WHERE is_active = true;
CREATE INDEX idx_whatsapp_api_keys_primary ON whatsapp_api_keys(provider_id, is_primary) WHERE is_primary = true;
CREATE INDEX idx_whatsapp_api_keys_usage ON whatsapp_api_keys(usage_count);

CREATE INDEX idx_whatsapp_message_logs_phone ON whatsapp_message_logs(phone_number);
CREATE INDEX idx_whatsapp_message_logs_sent_at ON whatsapp_message_logs(sent_at);
CREATE INDEX idx_whatsapp_message_logs_success ON whatsapp_message_logs(success);
CREATE INDEX idx_whatsapp_message_logs_context ON whatsapp_message_logs(context_type, context_id);
CREATE INDEX idx_whatsapp_message_logs_provider ON whatsapp_message_logs(provider_id);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE whatsapp_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_message_logs ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies (allow all for now, can be restricted later)
CREATE POLICY "Allow all operations on whatsapp_providers" ON whatsapp_providers
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on whatsapp_api_keys" ON whatsapp_api_keys
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on whatsapp_message_logs" ON whatsapp_message_logs
  FOR ALL USING (true) WITH CHECK (true);

-- 7. Helper functions
CREATE OR REPLACE FUNCTION update_updated_at_whatsapp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. Triggers for auto-updating updated_at
CREATE TRIGGER update_whatsapp_providers_updated_at 
  BEFORE UPDATE ON whatsapp_providers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_whatsapp();

CREATE TRIGGER update_whatsapp_api_keys_updated_at 
  BEFORE UPDATE ON whatsapp_api_keys 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_whatsapp();

-- 9. Rate limiting reset function
CREATE OR REPLACE FUNCTION reset_rate_limits()
RETURNS void AS $$
BEGIN
  -- Reset daily counters
  UPDATE whatsapp_api_keys 
  SET 
    requests_today = 0,
    last_reset_date = CURRENT_DATE
  WHERE last_reset_date < CURRENT_DATE;
  
  -- Reset hourly counters
  UPDATE whatsapp_api_keys 
  SET 
    requests_this_hour = 0,
    last_reset_hour = date_trunc('hour', now())
  WHERE last_reset_hour < date_trunc('hour', now());
END;
$$ LANGUAGE plpgsql;

-- 10. Insert default Woo-wa provider configuration
INSERT INTO whatsapp_providers (
  name,
  display_name,
  base_url,
  send_message_endpoint,
  async_send_message_endpoint,
  send_image_endpoint,
  send_file_endpoint,
  check_number_endpoint,
  phone_field_name,
  key_field_name,
  message_field_name,
  success_status_field,
  success_status_value,
  message_id_field,
  settings
) VALUES (
  'woo-wa',
  'Woo-wa (NotifAPI)',
  'https://notifapi.com',
  '/send_message',
  '/async_send_message',
  '/send_image_url',
  '/send_file_url',
  '/check_number',
  'phone_no',
  'key',
  'message',
  'status',
  'sent',
  'id_message',
  '{
    "supports_async": true,
    "supports_media": true,
    "supports_groups": true,
    "webhook_support": true,
    "max_message_length": 4096
  }'::jsonb
);

-- 11. Insert additional provider configurations
INSERT INTO whatsapp_providers (
  name,
  display_name,
  base_url,
  phone_field_name,
  key_field_name,
  message_field_name,
  success_status_field,
  success_status_value,
  settings
) VALUES 
(
  'fonnte',
  'Fonnte',
  'https://api.fonnte.com',
  'target',
  'token',
  'message',
  'status',
  'success',
  '{
    "supports_async": false,
    "supports_media": true,
    "supports_groups": true,
    "webhook_support": true,
    "max_message_length": 4096
  }'::jsonb
),
(
  'mock',
  'Mock API (Testing)',
  'http://localhost:3002',
  'phone_no',
  'key',
  'message',
  'status',
  'sent',
  '{
    "supports_async": false,
    "supports_media": false,
    "supports_groups": false,
    "webhook_support": false,
    "max_message_length": 4096,
    "is_mock": true
  }'::jsonb
);

-- 12. Function to get active API key for a provider
CREATE OR REPLACE FUNCTION get_active_api_key(provider_name text)
RETURNS TABLE(
  api_key text,
  key_id uuid,
  provider_config jsonb
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ak.api_key,
    ak.id as key_id,
    row_to_json(p.*)::jsonb as provider_config
  FROM whatsapp_api_keys ak
  JOIN whatsapp_providers p ON ak.provider_id = p.id
  WHERE p.name = provider_name
    AND p.is_active = true
    AND ak.is_active = true
    AND (ak.expires_at IS NULL OR ak.expires_at > now())
    AND (p.settings->>'daily_limit' IS NULL OR ak.requests_today < COALESCE((p.settings->>'daily_limit')::int, 999999))
  ORDER BY ak.is_primary DESC, ak.usage_count ASC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- 13. Function to log WhatsApp message
CREATE OR REPLACE FUNCTION log_whatsapp_message(
  p_api_key_id uuid,
  p_phone_number text,
  p_message_type text,
  p_message_content text,
  p_request_body jsonb,
  p_response_body jsonb,
  p_response_status integer,
  p_success boolean,
  p_message_id text DEFAULT NULL,
  p_context_type text DEFAULT NULL,
  p_context_id text DEFAULT NULL,
  p_response_time_ms integer DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  log_id uuid;
  provider_id_val uuid;
BEGIN
  -- Get provider ID from API key
  SELECT ak.provider_id INTO provider_id_val
  FROM whatsapp_api_keys ak
  WHERE ak.id = p_api_key_id;
  
  -- Insert log
  INSERT INTO whatsapp_message_logs (
    api_key_id,
    provider_id,
    phone_number,
    message_type,
    message_content,
    request_body,
    response_body,
    response_status,
    success,
    message_id,
    context_type,
    context_id,
    response_time_ms
  ) VALUES (
    p_api_key_id,
    provider_id_val,
    p_phone_number,
    p_message_type,
    p_message_content,
    p_request_body,
    p_response_body,
    p_response_status,
    p_success,
    p_message_id,
    p_context_type,
    p_context_id,
    p_response_time_ms
  ) RETURNING id INTO log_id;
  
  -- Update usage counter
  UPDATE whatsapp_api_keys 
  SET 
    usage_count = usage_count + 1,
    requests_today = requests_today + 1,
    requests_this_hour = requests_this_hour + 1,
    last_used_at = now()
  WHERE id = p_api_key_id;
  
  RETURN log_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Test 1: Check if tables were created
SELECT 'whatsapp_providers' as table_name, count(*) as row_count FROM whatsapp_providers
UNION ALL
SELECT 'whatsapp_api_keys' as table_name, count(*) as row_count FROM whatsapp_api_keys
UNION ALL
SELECT 'whatsapp_message_logs' as table_name, count(*) as row_count FROM whatsapp_message_logs;

-- Test 2: Check if providers were created
SELECT id, name, display_name, base_url, is_active 
FROM whatsapp_providers 
ORDER BY name;

-- Test 3: Test the get_active_api_key function (will return empty until keys are added)
SELECT * FROM get_active_api_key('woo-wa');

-- ============================================================================
-- 🎉 SUCCESS! WhatsApp API Settings Database ready!
-- ============================================================================

SELECT '🎉 WhatsApp API Settings Database Setup Complete!' as status,
       'Ready for dynamic API key management and provider switching' as message;
