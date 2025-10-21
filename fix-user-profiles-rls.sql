-- Check current RLS status on user_profiles
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'user_profiles';

-- Check existing policies
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'user_profiles';

-- Drop existing policies if any
DROP POLICY IF EXISTS "Enable read for authenticated users" ON user_profiles;
DROP POLICY IF EXISTS "Enable insert for admins" ON user_profiles;
DROP POLICY IF EXISTS "Enable update for admins" ON user_profiles;
DROP POLICY IF EXISTS "Enable delete for admins" ON user_profiles;
DROP POLICY IF EXISTS "Enable all for service role" ON user_profiles;

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows service role to bypass RLS completely
CREATE POLICY "Service role has full access"
ON user_profiles
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Create a policy that allows authenticated users to read all profiles
CREATE POLICY "Users can view all profiles"
ON user_profiles
FOR SELECT
TO authenticated
USING (true);

-- Create a policy that allows admins to insert new profiles
CREATE POLICY "Admins can insert profiles"
ON user_profiles
FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Create a policy that allows admins to update profiles
CREATE POLICY "Admins can update profiles"
ON user_profiles
FOR UPDATE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Create a policy that allows admins to delete profiles
CREATE POLICY "Admins can delete profiles"
ON user_profiles
FOR DELETE
TO authenticated
USING (
    EXISTS (
        SELECT 1 FROM user_profiles
        WHERE user_id = auth.uid()
        AND role = 'admin'
    )
);

-- Verify the policies are created
SELECT
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'user_profiles'
ORDER BY policyname;