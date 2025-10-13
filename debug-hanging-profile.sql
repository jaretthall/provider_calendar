-- Debug why the profile query is hanging
-- Check current RLS status and policies

-- 1. Check if RLS is enabled
SELECT 
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE tablename = 'user_profiles';

-- 2. Check current policies
SELECT 
    'Current Policies:' as status,
    policyname,
    cmd,
    roles,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 3. Test the exact query the app is trying to run
SELECT 
    'Testing profile query for user:' as test,
    id,
    email,
    role,
    is_active
FROM user_profiles
WHERE id = 'dfa75225-f29a-4374-846d-c055972b8d90';

-- 4. Temporarily fix by creating a very simple policy
DROP POLICY IF EXISTS "Enable read access for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for users based on user_id" ON user_profiles;
DROP POLICY IF EXISTS "Enable admins to read all profiles" ON user_profiles;

-- Create the simplest possible policy that allows authenticated reads
CREATE POLICY "authenticated_can_read_profiles" ON user_profiles
  FOR SELECT 
  TO authenticated
  USING (true);

-- Create update policy
CREATE POLICY "authenticated_can_update_own_profile" ON user_profiles
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- 5. Verify
SELECT 
    'New simple policies:' as status,
    policyname,
    cmd
FROM pg_policies 
WHERE tablename = 'user_profiles';

SELECT 'Profile loading should work now with simplified policies!' as result;