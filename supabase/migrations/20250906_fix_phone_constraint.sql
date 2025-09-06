-- Fix valid_phone constraint issue
-- Focus only on public schema tables since auth.users is protected

-- SAFE VERSION: Only work with public schema
-- Check if there's a public.users table and fix constraint there

-- First check what tables exist in public schema
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'users';

-- Drop constraint from public.users if it exists  
DO $$
BEGIN
    -- Check if public.users table exists and has the problematic constraint
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'valid_phone' 
        AND table_name = 'users' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.users DROP CONSTRAINT valid_phone;
        RAISE NOTICE 'Dropped valid_phone constraint from public.users';
    ELSE
        RAISE NOTICE 'No valid_phone constraint found on public.users';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error working with public.users: %', SQLERRM;
END $$;

-- Check current constraints on public.users
SELECT 
    tc.constraint_name,
    tc.table_name,
    tc.table_schema,
    cc.check_clause
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_name = 'users' 
AND tc.table_schema = 'public'
AND tc.constraint_type = 'CHECK';

-- Note: auth.users table is managed by Supabase and requires superuser permissions
-- If the constraint is on auth.users, you need to contact Supabase support or use their dashboard

-- For testing, try to insert into the correct table after fixing constraints
-- Test insert examples (run after constraint is fixed):
-- INSERT INTO auth.users (phone) VALUES ('+6281234567890'); -- May need superuser
-- INSERT INTO public.users (phone) VALUES ('+6281234567890'); -- If public.users exists

-- Alternative: If you need to test phone validation, create a test table:
/*
CREATE TABLE test_phone_validation (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    phone text,
    created_at timestamptz DEFAULT now()
);

-- Add a reasonable phone constraint for testing
ALTER TABLE test_phone_validation ADD CONSTRAINT valid_phone_test
CHECK (
    phone IS NULL OR 
    phone ~ '^[\+]?[0-9\s\-\(\)\.]{8,20}$'
);

-- Test various phone formats
INSERT INTO test_phone_validation (phone) VALUES ('+6281234567890');
INSERT INTO test_phone_validation (phone) VALUES ('081234567890');
INSERT INTO test_phone_validation (phone) VALUES ('+1-234-567-8900');
*/
