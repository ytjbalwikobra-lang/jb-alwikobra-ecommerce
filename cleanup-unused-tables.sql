-- Drop Profiles Table and Clean Up Schema
-- This migration removes unused profiles table and related schema

-- 1. Drop profiles table references in functions and views
DROP VIEW IF EXISTS user_profiles CASCADE;

-- 2. Drop admin role checking function that references profiles
DROP FUNCTION IF EXISTS is_admin(uuid) CASCADE;

-- 3. Drop all policies related to profiles table
DROP POLICY IF EXISTS "Profiles select own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles update own" ON public.profiles;
DROP POLICY IF EXISTS "Profiles admin all" ON public.profiles;

-- 4. Drop triggers related to profiles
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS handle_new_user ON auth.users;

-- 5. Drop the profiles table entirely
DROP TABLE IF EXISTS public.profiles CASCADE;

-- 6. Drop the whatsapp_users table (unused, we use users table instead)
DROP TABLE IF EXISTS public.whatsapp_users CASCADE;
DROP TABLE IF EXISTS public.whatsapp_auth_tokens CASCADE;
DROP TABLE IF EXISTS public.whatsapp_user_sessions CASCADE;

-- 7. Clean up any remaining references
DROP INDEX IF EXISTS idx_whatsapp_users_email;
DROP INDEX IF EXISTS idx_whatsapp_users_whatsapp;
DROP INDEX IF EXISTS idx_whatsapp_users_role;
DROP INDEX IF EXISTS idx_whatsapp_auth_tokens_token;

-- 8. Verify users table structure (this is our main table)
-- The users table should have these columns:
-- - id (uuid, primary key)
-- - phone (text, unique)
-- - email (text, unique) 
-- - name (text)
-- - password_hash (text)
-- - is_admin (boolean)
-- - is_active (boolean)
-- - phone_verified (boolean)
-- - profile_completed (boolean)
-- - created_at, updated_at, last_login_at (timestamps)
-- - etc.

COMMENT ON TABLE users IS 'Main users table for authentication and user management';
