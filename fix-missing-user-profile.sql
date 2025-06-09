-- Fix Missing User Profile
-- Run this AFTER running the debug script above

-- Insert missing user profile for your account
-- Replace 'your-email@example.com' with your actual email
INSERT INTO user_profiles (
  id, 
  email, 
  full_name, 
  role, 
  status, 
  approved_at, 
  approved_by, 
  notes,
  created_at,
  updated_at
)
SELECT 
  u.id,
  u.email,
  'Super Administrator',
  'super_admin',
  'approved',
  NOW(),
  u.id,
  'Manually created super admin profile',
  u.created_at,
  NOW()
FROM auth.users u
WHERE u.email = 'your-email@example.com'  -- REPLACE WITH YOUR EMAIL
AND NOT EXISTS (
  SELECT 1 FROM user_profiles up WHERE up.id = u.id
);

-- Alternative: Auto-create profile for ANY auth user without a profile
-- Uncomment the lines below if you want to create profiles for all auth users

-- INSERT INTO user_profiles (
--   id, 
--   email, 
--   full_name, 
--   role, 
--   status, 
--   created_at,
--   updated_at
-- )
-- SELECT 
--   u.id,
--   u.email,
--   COALESCE(u.raw_user_meta_data->>'full_name', 'User'),
--   CASE 
--     WHEN NOT EXISTS (SELECT 1 FROM user_profiles) THEN 'super_admin'
--     ELSE 'scheduler'
--   END,
--   CASE 
--     WHEN NOT EXISTS (SELECT 1 FROM user_profiles) THEN 'approved'
--     ELSE 'pending'
--   END,
--   u.created_at,
--   NOW()
-- FROM auth.users u
-- WHERE NOT EXISTS (
--   SELECT 1 FROM user_profiles up WHERE up.id = u.id
-- );

-- Verify the fix worked
SELECT 
  up.id, 
  up.email, 
  up.full_name, 
  up.role, 
  up.status,
  up.created_at
FROM user_profiles up
JOIN auth.users au ON up.id = au.id
ORDER BY up.created_at DESC; 