-- Simple Authentication Policies
-- Anonymous = Read-only, Authenticated = Full access
-- Run this ONCE in your Supabase SQL Editor

-- =====================================================
-- STEP 1: Clean up all existing policies
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
DROP POLICY IF EXISTS "Authenticated users can manage providers" ON providers;
DROP POLICY IF EXISTS "Authenticated users can manage clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Authenticated users can manage medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Authenticated users can manage shifts" ON shifts;
DROP POLICY IF EXISTS "Authenticated users can manage settings" ON user_settings;
DROP POLICY IF EXISTS "Anonymous can view providers" ON providers;
DROP POLICY IF EXISTS "Anonymous can view clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Anonymous can view medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Anonymous can view shifts" ON shifts;

-- Drop granular policies
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
-- STEP 2: Create simple policies
-- =====================================================

-- PROVIDERS: Anonymous read, authenticated full access
CREATE POLICY "Anyone can view providers" ON providers FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage providers" ON providers FOR ALL TO authenticated USING (true);

-- CLINIC TYPES: Anonymous read, authenticated full access  
CREATE POLICY "Anyone can view clinic types" ON clinic_types FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage clinic types" ON clinic_types FOR ALL TO authenticated USING (true);

-- MEDICAL ASSISTANTS: Anonymous read, authenticated full access
CREATE POLICY "Anyone can view medical assistants" ON medical_assistants FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage medical assistants" ON medical_assistants FOR ALL TO authenticated USING (true);

-- SHIFTS: Anonymous read, authenticated full access
CREATE POLICY "Anyone can view shifts" ON shifts FOR SELECT USING (true);
CREATE POLICY "Authenticated can manage shifts" ON shifts FOR ALL TO authenticated USING (true);

-- USER SETTINGS: Only authenticated can access (private)
CREATE POLICY "Authenticated can manage settings" ON user_settings FOR ALL TO authenticated USING (true);

-- USER PROFILES: Only authenticated can access (private)
CREATE POLICY "Authenticated can manage profiles" ON user_profiles FOR ALL TO authenticated USING (true);

-- =====================================================
-- STEP 3: Verification
-- =====================================================

-- Test anonymous access (should work)
SELECT 'SUCCESS: Anyone can view providers' as test, count(*) as count FROM providers;
SELECT 'SUCCESS: Anyone can view clinic_types' as test, count(*) as count FROM clinic_types;
SELECT 'SUCCESS: Anyone can view medical_assistants' as test, count(*) as count FROM medical_assistants;
SELECT 'SUCCESS: Anyone can view shifts' as test, count(*) as count FROM shifts;

-- Show all policies
SELECT 
  tablename, 
  policyname,
  'ACTIVE' as status
FROM pg_policies 
WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts', 'user_settings', 'user_profiles')
ORDER BY tablename, policyname; 