-- Test Phone Verification Flow
-- Sekarang setelah constraint bermasalah diperbaiki, mari test complete flow

-- 1. Test insert user dengan phone number yang valid
INSERT INTO public.users (phone, email, name) 
VALUES ('+6281234567890', 'test@example.com', 'Test User')
ON CONFLICT (phone) DO UPDATE SET 
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  updated_at = now()
RETURNING id, phone, email, name, created_at;

-- 2. Test insert ke phone_verifications table
-- Karena tidak ada unique constraint pada phone, kita bisa langsung insert
-- Atau hapus yang lama jika ingin test clean
DELETE FROM phone_verifications WHERE phone = '+6281234567890';

INSERT INTO phone_verifications (phone, verification_code, expires_at, attempt_count)
VALUES ('+6281234567890', '123456', now() + interval '10 minutes', 1)
RETURNING *;

-- 3. Check apakah data berhasil masuk
SELECT 
  u.id as user_id,
  u.phone,
  u.email,
  u.name,
  u.phone_verified,
  pv.verification_code,
  pv.expires_at,
  pv.attempt_count,
  pv.verified_at
FROM users u
LEFT JOIN phone_verifications pv ON u.phone = pv.phone
WHERE u.phone = '+6281234567890';

-- 4. Test verifikasi (simulasi user memasukkan code yang benar)
UPDATE phone_verifications 
SET 
  verified_at = now(),
  attempt_count = attempt_count + 1
WHERE phone = '+6281234567890' 
  AND verification_code = '123456'
  AND expires_at > now()
  AND verified_at IS NULL
RETURNING *;

-- 5. Update user sebagai verified
UPDATE users 
SET 
  phone_verified = true,
  updated_at = now()
WHERE phone = '+6281234567890'
RETURNING id, phone, phone_verified, updated_at;

-- 6. Check final state
SELECT 
  u.id,
  u.phone,
  u.email,
  u.name,
  u.phone_verified,
  u.created_at,
  pv.verification_code,
  pv.verified_at,
  pv.attempt_count
FROM users u
LEFT JOIN phone_verifications pv ON u.phone = pv.phone
WHERE u.phone = '+6281234567890';

-- 7. Cleanup untuk test ulang (optional)
-- DELETE FROM phone_verifications WHERE phone = '+6281234567890';
-- DELETE FROM users WHERE phone = '+6281234567890';
