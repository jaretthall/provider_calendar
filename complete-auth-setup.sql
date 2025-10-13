-- Complete Authentication Setup for Clinica Provider Schedule
-- This file handles everything: drops dependencies, simplifies schema, creates policies
-- Run this ONCE in your Supabase SQL Editor

-- =====================================================
-- STEP 1: Clean up existing complex dependencies
-- =====================================================

-- Drop all existing policies that depend on the status column
DROP POLICY IF EXISTS "Super admins can view all user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can manage user profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own basic info" ON user_profiles;
DROP POLICY IF EXISTS "Approved users can manage their own providers" ON providers;
DROP POLICY IF EXISTS "Approved users can manage their own clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Approved users can manage their own medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Approved users can manage their own shifts" ON shifts;
DROP POLICY IF EXISTS "Approved users can manage their own settings" ON user_settings;

-- Drop the view that depends on status column
DROP VIEW IF EXISTS user_management_view;

-- Drop functions that check for approval status
DROP FUNCTION IF EXISTS public.is_approved_user(uuid);

-- =====================================================
-- STEP 2: Simplify user_profiles table structure
-- =====================================================

-- Now we can safely drop the columns
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS status CASCADE,
DROP COLUMN IF EXISTS approved_by CASCADE,
DROP COLUMN IF EXISTS approved_at CASCADE,
DROP COLUMN IF EXISTS notes CASCADE;

-- Simplify the role constraint
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_status_check;

-- =====================================================
-- STEP 3: Update user creation function
-- =====================================================

-- Update the user creation function to auto-assign roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    -- First user becomes super_admin, others become scheduler
    CASE 
      WHEN NOT EXISTS (SELECT 1 FROM user_profiles) THEN 'super_admin'
      ELSE 'scheduler'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 4: Create simplified policies (no approval needed)
-- =====================================================

-- Drop any existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can view all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Super admins can manage all profiles" ON user_profiles;
DROP POLICY IF EXISTS "Users can manage their own providers" ON providers;
DROP POLICY IF EXISTS "Users can manage their own clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Users can manage their own medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Users can manage their own shifts" ON shifts;
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;

-- User profiles policies - simple version
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Super admins can view all profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage all profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin'
    )
  );

-- Main data table policies - simple version (no approval required)
CREATE POLICY "Users can manage their own providers" ON providers
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own clinic types" ON clinic_types
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own medical assistants" ON medical_assistants
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own shifts" ON shifts
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING (user_id = auth.uid());

-- =====================================================
-- STEP 5: Create simplified utility functions
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

-- =====================================================
-- STEP 6: Fix existing user data
-- =====================================================

-- Make sure the first user (you) is a super admin
DO $$
BEGIN
  -- If no super admin exists, make the oldest user a super admin
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
-- STEP 7: Verification queries
-- =====================================================

-- Check your user profile
SELECT 
  id, 
  email, 
  full_name, 
  role, 
  created_at,
  'SUCCESS: User profile configured' as status
FROM user_profiles 
ORDER BY created_at;

-- Check policies are working
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  'SUCCESS: Policy active' as status
FROM pg_policies 
WHERE tablename IN ('user_profiles', 'providers', 'clinic_types', 'medical_assistants', 'shifts', 'user_settings')
ORDER BY tablename, policyname; 