-- Quick Fix: Approve Your Account and Make You Super Admin
-- Replace 'your-email@example.com' with your actual email

UPDATE user_profiles 
SET 
  role = 'super_admin',
  status = 'approved',
  approved_at = NOW(),
  approved_by = id,
  full_name = 'Super Administrator',
  notes = 'Self-approved initial super admin'
WHERE email = 'your-email@example.com';  -- REPLACE THIS WITH YOUR EMAIL

-- Verify it worked
SELECT id, email, full_name, role, status, approved_at 
FROM user_profiles 
WHERE email = 'your-email@example.com';  -- REPLACE THIS WITH YOUR EMAIL 