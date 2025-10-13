-- Bootstrap Super Admin User
-- Run this in your Supabase SQL Editor after creating a user in the dashboard

-- Replace 'your-email@example.com' with your actual email address
UPDATE user_profiles 
SET 
  role = 'super_admin',
  status = 'approved',
  approved_at = NOW(),
  approved_by = id,
  full_name = 'Super Administrator',
  notes = 'Bootstrap super admin account'
WHERE email = 'your-email@example.com';

-- Verify the update worked
SELECT id, email, full_name, role, status, approved_at 
FROM user_profiles 
WHERE email = 'your-email@example.com'; 