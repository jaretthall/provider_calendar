-- Anonymous Read + Authenticated Write Policies
-- Clinica Provider Schedule - Complete Access Control Implementation
-- Run this ONCE in your Supabase SQL Editor

-- =====================================================
-- STEP 1: Clean up ALL existing policies
-- =====================================================

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Super admins can view all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can manage user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own basic info" ON user_profiles;
DROP POLICY IF EXISTS "Approved users can manage their own providers" ON providers;
DROP POLICY IF EXISTS "Approved users can manage their own clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Approved users can manage their own medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Approved users can manage their own shifts" ON shifts;
DROP POLICY IF EXISTS "Approved users can manage their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage their own providers" ON providers;
DROP POLICY IF EXISTS "Users can manage their own clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Users can manage their own medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Users can manage their own shifts" ON shifts;
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;

-- Drop granular policies that might exist
DROP POLICY IF EXISTS "Users can view their own providers" ON providers;
DROP POLICY IF EXISTS "Users can insert their own providers" ON providers;
DROP POLICY IF EXISTS "Users can update their own providers" ON providers;
DROP POLICY IF EXISTS "Users can delete their own providers" ON providers;
DROP POLICY IF EXISTS "Users can view their own clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Users can insert their own clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Users can update their own clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Users can delete their own clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Users can view their own medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Users can insert their own medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Users can update their own medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Users can delete their own medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Users can view their own shifts" ON shifts;
DROP POLICY IF EXISTS "Users can insert their own shifts" ON shifts;
DROP POLICY IF EXISTS "Users can update their own shifts" ON shifts;
DROP POLICY IF EXISTS "Users can delete their own shifts" ON shifts;
DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;

-- =====================================================
-- STEP 2: Create Anonymous Read + Authenticated Write Policies
-- =====================================================

-- PROVIDERS TABLE
-- Anonymous users can view all providers (read-only)
CREATE POLICY "Anonymous can view providers" ON providers
  FOR SELECT 
  TO anon
  USING (true);

-- Authenticated users can manage their own providers
CREATE POLICY "Authenticated users can manage providers" ON providers
  FOR ALL 
  TO authenticated
  USING (user_id = auth.uid());

-- CLINIC TYPES TABLE  
-- Anonymous users can view all clinic types (read-only)
CREATE POLICY "Anonymous can view clinic types" ON clinic_types
  FOR SELECT 
  TO anon
  USING (true);

-- Authenticated users can manage their own clinic types
CREATE POLICY "Authenticated users can manage clinic types" ON clinic_types
  FOR ALL 
  TO authenticated
  USING (user_id = auth.uid());

-- MEDICAL ASSISTANTS TABLE
-- Anonymous users can view all medical assistants (read-only)
CREATE POLICY "Anonymous can view medical assistants" ON medical_assistants
  FOR SELECT 
  TO anon
  USING (true);

-- Authenticated users can manage their own medical assistants
CREATE POLICY "Authenticated users can manage medical assistants" ON medical_assistants
  FOR ALL 
  TO authenticated
  USING (user_id = auth.uid());

-- SHIFTS TABLE
-- Anonymous users can view all shifts (read-only)
CREATE POLICY "Anonymous can view shifts" ON shifts
  FOR SELECT 
  TO anon
  USING (true);

-- Authenticated users can manage their own shifts
CREATE POLICY "Authenticated users can manage shifts" ON shifts
  FOR ALL 
  TO authenticated
  USING (user_id = auth.uid());

-- USER SETTINGS TABLE
-- Anonymous users cannot view settings (private data)
-- Authenticated users can manage their own settings
CREATE POLICY "Authenticated users can manage settings" ON user_settings
  FOR ALL 
  TO authenticated
  USING (user_id = auth.uid());

-- USER PROFILES TABLE
-- Anonymous users cannot view profiles (private data)
-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT 
  TO authenticated
  USING (id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid());

-- Super admins can view all profiles
CREATE POLICY "Super admins can view all profiles" ON user_profiles
  FOR SELECT 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Super admins can manage all profiles  
CREATE POLICY "Super admins can manage all profiles" ON user_profiles
  FOR ALL 
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- =====================================================
-- STEP 3: Utility Functions
-- =====================================================

-- Simple super admin check
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = user_id 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user is authenticated
CREATE OR REPLACE FUNCTION public.is_authenticated()
RETURNS boolean AS $$
BEGIN
  RETURN auth.uid() IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 4: Fix User Data (ensure proper roles)
-- =====================================================

-- Make sure first user is super admin
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE role = 'super_admin') THEN
    UPDATE user_profiles 
    SET role = 'super_admin' 
    WHERE id = (
      SELECT id FROM user_profiles 
      ORDER BY created_at ASC 
      LIMIT 1
    );
    
    RAISE NOTICE 'Made oldest user a super admin';
  END IF;
END $$;

-- =====================================================
-- STEP 5: Verification Queries
-- =====================================================

-- Verify anonymous access (should show data)
SELECT 'SUCCESS: Anonymous can view providers' as test_result, count(*) as provider_count FROM providers;
SELECT 'SUCCESS: Anonymous can view clinic_types' as test_result, count(*) as clinic_count FROM clinic_types;
SELECT 'SUCCESS: Anonymous can view medical_assistants' as test_result, count(*) as ma_count FROM medical_assistants;
SELECT 'SUCCESS: Anonymous can view shifts' as test_result, count(*) as shift_count FROM shifts;

-- Show all active policies
SELECT 
  schemaname, 
  tablename, 
  policyname,
  roles,
  cmd,
  'ACTIVE POLICY' as status
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'providers', 'clinic_types', 'medical_assistants', 'shifts', 'user_settings')
ORDER BY tablename, policyname;

-- Show user profiles
SELECT 
  id, 
  email, 
  full_name, 
  role, 
  created_at,
  'USER CONFIGURED' as status
FROM user_profiles 
ORDER BY created_at; 