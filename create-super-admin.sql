-- Create Super Admin User
-- Phone: 082242417788 (normalized to 6282242417788)
-- Email: admin@jbalwikobra.com  
-- Password: $#jbAlwikobra2025 (hashed)

-- Simple approach: Insert/Update with only the core columns that definitely exist
-- Based on signup.ts and complete-profile.ts, these columns exist: phone, password_hash, phone_verified, profile_completed

-- Insert the basic user record
INSERT INTO users (
  phone, 
  password_hash, 
  phone_verified, 
  profile_completed
) VALUES (
  '6282242417788',  -- Indonesian phone format (08xxx -> 62xxx)
  '$2b$10$HUb4IlzqtXc8GsVfnNUO6O8B2krRFBvkhyykiA124USRu8xsKmnkO', -- Correct hashed password for: $#jbAlwikobra2025
  true,             -- Phone verified
  true              -- Profile completed  
)
ON CONFLICT (phone) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  phone_verified = true,
  profile_completed = true;

-- Now update with additional fields one by one (safer approach)
-- Update email (from complete-profile.ts we know this exists)
UPDATE users 
SET email = 'admin@jbalwikobra.com'
WHERE phone = '6282242417788';

-- Update name (from complete-profile.ts we know this exists)  
UPDATE users 
SET name = 'Super Admin JB Alwikobra'
WHERE phone = '6282242417788';

-- Update is_admin (from validate-session.ts we know this exists)
UPDATE users 
SET is_admin = true
WHERE phone = '6282242417788';

-- Update is_active (from login.ts we know this exists)
UPDATE users 
SET is_active = true
WHERE phone = '6282242417788';

-- Verify the super admin was created/updated
SELECT 
  id,
  phone,
  email,
  name,
  is_admin,
  is_active,
  phone_verified,
  profile_completed,
  created_at
FROM users 
WHERE phone = '6282242417788';

-- Display success message
SELECT 'Super admin user created/updated successfully!' as result;
