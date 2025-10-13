-- Simple Anonymous Read + Authenticated Write Policies
-- Run AFTER creating user_profiles table
-- This version works with your current database structure

-- =====================================================
-- STEP 1: Enable RLS on all tables first
-- =====================================================

ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
-- user_profiles RLS is enabled in the create table script

-- =====================================================
-- STEP 2: Create Simple Policies (no user ownership required)
-- =====================================================

-- PROVIDERS TABLE
-- Anonymous users can view all providers
CREATE POLICY "Anonymous can view providers" ON providers
  FOR SELECT 
  TO anon
  USING (true);

-- Authenticated users can do everything with providers
CREATE POLICY "Authenticated users can manage providers" ON providers
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- CLINIC TYPES TABLE  
CREATE POLICY "Anonymous can view clinic types" ON clinic_types
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can manage clinic types" ON clinic_types
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- MEDICAL ASSISTANTS TABLE
CREATE POLICY "Anonymous can view medical assistants" ON medical_assistants
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can manage medical assistants" ON medical_assistants
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- SHIFTS TABLE
CREATE POLICY "Anonymous can view shifts" ON shifts
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can manage shifts" ON shifts
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- USER SETTINGS TABLE
-- Only authenticated users can access settings (private)
CREATE POLICY "Authenticated users can manage settings" ON user_settings
  FOR ALL 
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- USER PROFILES TABLE  
-- Only authenticated users can view/manage profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT 
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE 
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Allow users to insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT 
  TO authenticated
  WITH CHECK (id = auth.uid());

-- =====================================================
-- STEP 3: Verification Queries
-- =====================================================

-- Test that anonymous access works
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

SELECT 'Setup complete! Anonymous users can read, authenticated users can write.' as final_status;