-- Quick Fix: Update Password Hash for Super Admin
-- Execute this in Supabase SQL Editor

UPDATE users 
SET password_hash = '$2b$10$HUb4IlzqtXc8GsVfnNUO6O8B2krRFBvkhyykiA124USRu8xsKmnkO'
WHERE phone = '6282242417788' OR email = 'admin@jbalwikobra.com';

-- Verify the update
SELECT 
  phone, 
  email, 
  name, 
  is_admin, 
  is_active, 
  phone_verified, 
  profile_completed,
  created_at
FROM users 
WHERE phone = '6282242417788' OR email = 'admin@jbalwikobra.com';
