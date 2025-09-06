-- Check constraints dan indexes pada phone_verifications table
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'phone_verifications' 
  AND tc.table_schema = 'public'
ORDER BY tc.constraint_type, kcu.column_name;

-- Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes 
WHERE tablename = 'phone_verifications' 
  AND schemaname = 'public';
