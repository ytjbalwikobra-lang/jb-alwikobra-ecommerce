-- Create Super Admin User
-- Phone: 082242417788 (normalized to 62822417788)
-- Email: admin@jbalwikobra.com
-- Password: $#jbAlwikobra2025 (hashed)

-- First, check if the user table has the correct structure
-- This assumes the 'users' table from the traditional auth system

-- Insert or update the super admin user
INSERT INTO users (
  phone, 
  email,
  password_hash, 
  phone_verified, 
  profile_completed,
  is_admin,
  is_active,
  full_name,
  created_at,
  updated_at
) VALUES (
  '6282242417788',  -- Indonesian phone format (08xxx -> 62xxx)
  'admin@jbalwikobra.com',
  '$2b$10$wCfPC4CdjfSSc.lW8Nc5FOoCYCijk8cZgjbFqP.9bJJqrRCVTW60m', -- Hashed password for: $#jbAlwikobra2025
  true,             -- Phone verified
  true,             -- Profile completed  
  true,             -- Is admin
  true,             -- Is active
  'Super Admin JB Alwikobra',
  NOW(),
  NOW()
)
ON CONFLICT (phone) DO UPDATE SET
  email = EXCLUDED.email,
  password_hash = EXCLUDED.password_hash,
  phone_verified = true,
  profile_completed = true,
  is_admin = true,
  is_active = true,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Also handle conflict on email if it exists
INSERT INTO users (
  phone, 
  email,
  password_hash, 
  phone_verified, 
  profile_completed,
  is_admin,
  is_active,
  full_name,
  created_at,
  updated_at
) VALUES (
  '6282242417788',
  'admin@jbalwikobra.com',
  '$2b$10$wCfPC4CdjfSSc.lW8Nc5FOoCYCijk8cZgjbFqP.9bJJqrRCVTW60m',
  true,
  true,
  true,
  true,
  'Super Admin JB Alwikobra',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE SET
  phone = EXCLUDED.phone,
  password_hash = EXCLUDED.password_hash,
  phone_verified = true,
  profile_completed = true,
  is_admin = true,
  is_active = true,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- Verify the super admin was created/updated
SELECT 
  id,
  phone,
  email,
  full_name,
  is_admin,
  is_active,
  phone_verified,
  profile_completed,
  created_at
FROM users 
WHERE email = 'admin@jbalwikobra.com' 
   OR phone = '6282242417788';

-- Display success message
SELECT 'Super admin user created/updated successfully!' as result;
