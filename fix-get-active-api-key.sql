-- Fix the get_active_api_key function to handle missing daily_limit
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

-- Test the function
SELECT * FROM get_active_api_key('woo-wa');
