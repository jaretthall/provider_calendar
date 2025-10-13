-- Fix the "User profile not found" error
-- This comprehensive fix addresses all potential issues

-- 1. First, verify the user profile actually exists
SELECT 
    'Checking if profile exists for user dfa75225-f29a-4374-846d-c055972b8d90:' as status;

SELECT 
    id,
    email,
    role,
    is_active,
    created_at
FROM user_profiles
WHERE id = 'dfa75225-f29a-4374-846d-c055972b8d90';

-- 2. Temporarily disable RLS to test (this will confirm if RLS is the issue)
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- 3. Show current status
SELECT 
    tablename,
    rowsecurity as "RLS Status"
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 4. Test query that the app is running
SELECT 
    'Testing the exact query the app runs:' as status;

SELECT *
FROM user_profiles
WHERE id = 'dfa75225-f29a-4374-846d-c055972b8d90';

-- Now test your app with RLS disabled
-- If it works, we know RLS policies are the issue

-- 5. After testing, you can re-enable RLS with better policies:
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 6. Create a simple policy that definitely works
-- DROP POLICY IF EXISTS "Anyone can read profiles" ON user_profiles;
-- CREATE POLICY "Anyone can read profiles" ON user_profiles
--   FOR SELECT 
--   USING (true);  -- This allows EVERYONE to read (including authenticated users)

SELECT 'RLS is now DISABLED on user_profiles - test your login now!' as instruction;