-- Simple Phone Verification Test
-- Test flow verifikasi phone dengan data yang clean

-- Cleanup existing test data
DELETE FROM phone_verifications WHERE phone = '+6281234567890';
DELETE FROM users WHERE phone = '+6281234567890';

-- 1. Insert user baru
INSERT INTO public.users (phone, email, name, phone_verified) 
VALUES ('+6281234567890', 'test@example.com', 'Test User', false)
RETURNING id, phone, email, name, phone_verified, created_at;

-- 2. Insert verification code
INSERT INTO phone_verifications (phone, verification_code, expires_at, attempt_count)
VALUES ('+6281234567890', '123456', now() + interval '10 minutes', 0)
RETURNING id, phone, verification_code, expires_at, attempt_count, created_at;

-- 3. Check data yang baru dimasukkan
SELECT 
  u.id as user_id,
  u.phone,
  u.email,
  u.name,
  u.phone_verified,
  u.created_at as user_created_at,
  pv.id as verification_id,
  pv.verification_code,
  pv.expires_at,
  pv.attempt_count,
  pv.verified_at,
  pv.created_at as verification_created_at
FROM users u
LEFT JOIN phone_verifications pv ON u.phone = pv.phone
WHERE u.phone = '+6281234567890';

-- 4. Simulasi verifikasi berhasil
UPDATE phone_verifications 
SET 
  verified_at = now(),
  attempt_count = attempt_count + 1,
  is_used = true
WHERE phone = '+6281234567890' 
  AND verification_code = '123456'
  AND expires_at > now()
  AND verified_at IS NULL
RETURNING id, phone, verification_code, verified_at, attempt_count, is_used;

-- 5. Update user sebagai verified
UPDATE users 
SET 
  phone_verified = true,
  phone_verified_at = now(),
  updated_at = now()
WHERE phone = '+6281234567890'
RETURNING id, phone, phone_verified, phone_verified_at, updated_at;

-- 6. Final check - pastikan semua data sesuai
SELECT 
  u.id,
  u.phone,
  u.email,
  u.name,
  u.phone_verified,
  u.phone_verified_at,
  u.created_at,
  u.updated_at,
  pv.verification_code,
  pv.verified_at,
  pv.attempt_count,
  pv.is_used
FROM users u
LEFT JOIN phone_verifications pv ON u.phone = pv.phone
WHERE u.phone = '+6281234567890';

-- 7. Test constraint phone_or_email_required
-- Ini harus gagal karena tidak ada phone atau email
-- INSERT INTO public.users (name) VALUES ('Test No Contact');

-- 8. Test constraint dengan phone valid lainnya
INSERT INTO public.users (phone, name, phone_verified) 
VALUES ('+6281234567891', 'Test User 2', false)
ON CONFLICT (phone) DO NOTHING
RETURNING id, phone, name, phone_verified;
