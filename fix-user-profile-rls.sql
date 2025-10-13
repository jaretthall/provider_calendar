-- Fix RLS policies for user_profiles table
-- The current policies might be too restrictive

-- First, check if RLS is enabled
SELECT 
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'user_profiles';

-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;

-- Create simpler, more permissive policies for testing

-- Allow authenticated users to read their own profile
CREATE POLICY "Users can read own profile" ON user_profiles
  FOR SELECT 
  TO authenticated
  USING (id = auth.uid());

-- Allow authenticated users to update their own profile  
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow service role to do everything (for triggers)
CREATE POLICY "Service role has full access" ON user_profiles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Test the policies
SELECT 
    policyname,
    cmd,
    roles
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Check if user profiles exist
SELECT 
    id,
    email,
    role,
    is_active,
    'Profile exists' as status
FROM user_profiles
ORDER BY created_at;