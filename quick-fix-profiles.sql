-- Quick fix: Allow authenticated users to read all profiles
-- This is less secure but will fix the immediate issue

-- Drop the restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON user_profiles;

-- Create a more permissive policy for testing
CREATE POLICY "Authenticated users can view all profiles" ON user_profiles
  FOR SELECT 
  TO authenticated
  USING (true);

-- Keep the update restriction
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Verify the changes
SELECT 
    tablename,
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

SELECT 'Policies updated - authenticated users can now read all profiles' as status;