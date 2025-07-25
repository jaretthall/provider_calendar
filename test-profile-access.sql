-- Test profile access for specific user
-- Run this to debug why the profile query returns null

-- Check if the user profile exists
SELECT 
    'User Profile Check:' as test,
    id,
    email,
    role,
    is_active
FROM user_profiles
WHERE id = 'dfa75225-f29a-4374-846d-c055972b8d90';

-- Check current RLS policies on user_profiles
SELECT 
    'Current Policies:' as test,
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- Test if we can query as authenticated (this simulates what the app does)
-- Note: This needs to be run with proper auth context
SELECT 
    'Testing authenticated access...' as test;

-- Alternative: Temporarily disable RLS to test (BE CAREFUL - only for debugging)
-- ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
-- Then test your app
-- ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;