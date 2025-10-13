-- Fix RLS policies for user_profiles table
-- This creates proper policies that allow authentication to work

-- 1. Re-enable RLS (for security)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Service role has full access" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can read profiles" ON user_profiles;

-- 3. Create new, working policies

-- CRITICAL: Allow authenticated users to read their own profile
CREATE POLICY "Enable read access for users based on user_id" ON user_profiles
  FOR SELECT 
  USING (
    auth.uid() = id  -- User can read their own profile
  );

-- Allow authenticated users to update their own profile
CREATE POLICY "Enable update for users based on user_id" ON user_profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow new users to insert their own profile (for signup)
CREATE POLICY "Enable insert for users based on user_id" ON user_profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- OPTIONAL: If you want admins to see all profiles, add this policy
CREATE POLICY "Enable admins to read all profiles" ON user_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid()
      AND role = 'admin'
    )
  );

-- 4. Verify the new policies
SELECT 
    'New RLS Policies:' as status,
    policyname,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- 5. Test with a specific user
SELECT 
    'Testing if user can read their own profile:' as test,
    id,
    email,
    role
FROM user_profiles
WHERE id = 'dfa75225-f29a-4374-846d-c055972b8d90';

SELECT 'RLS is now ENABLED with proper policies. Please test login again!' as status;