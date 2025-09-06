-- Realistic Phone Verification Test
-- Test yang meniru behavior API auth.ts yang sebenarnya

-- 1. Setup: Cleanup existing test data
DELETE FROM phone_verifications WHERE phone = '+6281234567890';
DELETE FROM users WHERE phone = '+6281234567890';

-- 2. Create user (seperti di handleSignup)
INSERT INTO public.users (phone, is_active, phone_verified, profile_completed) 
VALUES ('+6281234567890', true, false, false)
RETURNING id, phone, phone_verified, profile_completed, created_at;

-- Get user_id untuk step berikutnya
\set user_id (SELECT id FROM users WHERE phone = '+6281234567890')

-- 3. Generate verification code (seperti di handleSignup)
-- API akan delete existing verifications untuk user ini
DELETE FROM phone_verifications WHERE user_id = (SELECT id FROM users WHERE phone = '+6281234567890');

-- Insert verification record (dengan user_id)
INSERT INTO phone_verifications (
  user_id, 
  phone, 
  verification_code, 
  expires_at, 
  ip_address, 
  user_agent
)
VALUES (
  (SELECT id FROM users WHERE phone = '+6281234567890'),
  '+6281234567890',
  '123456',
  now() + interval '15 minutes',
  '127.0.0.1'::inet,
  'Test User Agent'
)
RETURNING id, user_id, phone, verification_code, expires_at, created_at;

-- 4. Check initial state (user belum verified)
SELECT 
  u.id as user_id,
  u.phone,
  u.phone_verified,
  u.profile_completed,
  pv.verification_code,
  pv.expires_at,
  pv.verified_at,
  pv.is_used,
  pv.attempt_count
FROM users u
JOIN phone_verifications pv ON u.id = pv.user_id
WHERE u.phone = '+6281234567890';

-- 5. Test wrong verification code (seperti di handleVerifyPhone)
-- Ini harus return empty karena code salah
SELECT * FROM phone_verifications
WHERE user_id = (SELECT id FROM users WHERE phone = '+6281234567890')
  AND verification_code = '999999'  -- Wrong code
  AND is_used = false;

-- 6. Test correct verification code (seperti di handleVerifyPhone)
SELECT 
  pv.*,
  u.id as user_id
FROM phone_verifications pv
JOIN users u ON pv.user_id = u.id
WHERE pv.user_id = (SELECT id FROM users WHERE phone = '+6281234567890')
  AND pv.verification_code = '123456'  -- Correct code
  AND pv.is_used = false
  AND pv.expires_at > now();

-- 7. Mark verification as used (seperti di handleVerifyPhone)
UPDATE phone_verifications 
SET 
  is_used = true,
  verified_at = now()
WHERE user_id = (SELECT id FROM users WHERE phone = '+6281234567890')
  AND verification_code = '123456'
  AND is_used = false
RETURNING id, phone, verification_code, verified_at, is_used;

-- 8. Update user as phone verified (seperti di handleVerifyPhone)
UPDATE users 
SET 
  phone_verified = true,
  phone_verified_at = now(),
  updated_at = now()
WHERE phone = '+6281234567890'
RETURNING id, phone, phone_verified, phone_verified_at;

-- 9. Final verification check - user should be phone verified
SELECT 
  u.id,
  u.phone,
  u.phone_verified,
  u.phone_verified_at,
  u.profile_completed,
  pv.verification_code,
  pv.verified_at,
  pv.is_used,
  pv.attempt_count
FROM users u
LEFT JOIN phone_verifications pv ON u.id = pv.user_id
WHERE u.phone = '+6281234567890';

-- 10. Test expired verification (untuk coverage)
-- Insert expired verification
INSERT INTO phone_verifications (
  user_id, 
  phone, 
  verification_code, 
  expires_at
)
VALUES (
  (SELECT id FROM users WHERE phone = '+6281234567890'),
  '+6281234567890',
  '654321',
  now() - interval '1 minute'  -- Already expired
);

-- Try to verify expired code (should return empty)
SELECT * FROM phone_verifications
WHERE user_id = (SELECT id FROM users WHERE phone = '+6281234567890')
  AND verification_code = '654321'
  AND is_used = false
  AND expires_at > now();  -- This will be false

-- 11. Check all verification records for this user
SELECT 
  id,
  phone,
  verification_code,
  expires_at,
  verified_at,
  is_used,
  attempt_count,
  created_at,
  CASE 
    WHEN expires_at > now() THEN 'Valid'
    ELSE 'Expired'
  END as status
FROM phone_verifications 
WHERE user_id = (SELECT id FROM users WHERE phone = '+6281234567890')
ORDER BY created_at DESC;
