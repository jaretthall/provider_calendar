-- Manual Password Reset for Admin Users
-- ⚠️  SECURITY WARNING: This is for emergency use only!
-- Password: ZFM4JbK7hRs1#jp

-- Step 1: Generate bcrypt hash for the password
-- You need to generate a bcrypt hash for "ZFM4JbK7hRs1#jp"
-- You can use online bcrypt generators or run this in a Node.js environment:
-- const bcrypt = require('bcrypt');
-- const hash = bcrypt.hashSync('ZFM4JbK7hRs1#jp', 10);
-- console.log(hash);

-- Example bcrypt hash (you should generate your own):
-- $2b$10$example.hash.here.replace.with.actual.hash

-- Step 2: Update passwords in auth.users table
-- Replace 'YOUR_BCRYPT_HASH_HERE' with the actual bcrypt hash

-- Update jarett@clinicamedicos.org
UPDATE auth.users 
SET 
  encrypted_password = '$2b$10$b54eExG5aNtd98LM0VvUAuxY9YlrTzD4IxP7P.IQEWaReJlMJxInG',
  updated_at = now()
WHERE email = 'jarett@clinicamedicos.org';

-- Update admin@clinicamedicos.org  
UPDATE auth.users 
SET 
  encrypted_password = '$2b$10$b54eExG5aNtd98LM0VvUAuxY9YlrTzD4IxP7P.IQEWaReJlMJxInG',
  updated_at = now()
WHERE email = 'admin@clinicamedicos.org';

-- Verify the updates
SELECT id, email, updated_at 
FROM auth.users 
WHERE email IN ('jarett@clinicamedicos.org', 'admin@clinicamedicos.org');

-- ═══════════════════════════════════════════════════════════════
-- IMPORTANT: HOW TO GENERATE THE BCRYPT HASH
-- ═══════════════════════════════════════════════════════════════

-- Option 1: Use online bcrypt generator
-- 1. Go to: https://bcrypt-generator.com/
-- 2. Enter password: ZFM4JbK7hRs1#jp
-- 3. Set rounds to 10
-- 4. Copy the generated hash
-- 5. Replace 'YOUR_BCRYPT_HASH_HERE' above with the hash

-- Option 2: Use Node.js (if you have it installed)
-- Run this in terminal:
-- node -e "console.log(require('bcrypt').hashSync('ZFM4JbK7hRs1#jp', 10))"

-- Option 3: Use Python (if you have bcrypt installed)
-- python -c "import bcrypt; print(bcrypt.hashpw(b'ZFM4JbK7hRs1#jp', bcrypt.gensalt()).decode())"

-- ═══════════════════════════════════════════════════════════════
-- SECURITY NOTES
-- ═══════════════════════════════════════════════════════════════
-- 1. ⚠️  Only use this method in emergencies
-- 2. 🔒 Always use proper password reset flows in production  
-- 3. 📧 Consider setting up email templates for password resets
-- 4. 🔑 Use strong, unique passwords for admin accounts
-- 5. 🛡️  Enable MFA when possible

-- ═══════════════════════════════════════════════════════════════
-- ALTERNATIVE: Enable Password Reset Email (Recommended)
-- ═══════════════════════════════════════════════════════════════
-- 1. Go to Supabase Dashboard → Authentication → Settings
-- 2. Configure Email Templates → Password Reset
-- 3. Set up SMTP settings for email delivery
-- 4. Use auth.api.resetPasswordForEmail() in your app
-- 5. Users get secure reset link via email 