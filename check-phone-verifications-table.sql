-- Check struktur tabel phone_verifications
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'phone_verifications' 
  AND table_schema = 'public'
ORDER BY ordinal_position;
