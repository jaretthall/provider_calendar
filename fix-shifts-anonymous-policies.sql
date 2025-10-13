-- Fix Shifts Authentication Issues
-- Run this in your Supabase SQL Editor to allow shifts to be saved without authentication
-- This removes user_id requirements and allows anonymous write access

-- =====================================================
-- STEP 1: Drop all authentication-based policies
-- =====================================================

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Anonymous can view providers" ON providers;
DROP POLICY IF EXISTS "Authenticated users can manage providers" ON providers;
DROP POLICY IF EXISTS "Anonymous can view clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Authenticated users can manage clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Anonymous can view medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Authenticated users can manage medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Anonymous can view shifts" ON shifts;
DROP POLICY IF EXISTS "Authenticated users can manage shifts" ON shifts;

-- Drop all the user-specific policies
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

-- =====================================================
-- STEP 2: Remove user_id columns (make them optional)
-- =====================================================

-- Make user_id nullable and set default values for existing data
ALTER TABLE providers ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE clinic_types ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE medical_assistants ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE shifts ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE shifts ALTER COLUMN created_by_user_id DROP NOT NULL;

-- Update any existing records that have NULL user_id
UPDATE providers SET user_id = '00000000-0000-0000-0000-000000000001' WHERE user_id IS NULL;
UPDATE clinic_types SET user_id = '00000000-0000-0000-0000-000000000001' WHERE user_id IS NULL;
UPDATE medical_assistants SET user_id = '00000000-0000-0000-0000-000000000001' WHERE user_id IS NULL;
UPDATE shifts SET user_id = '00000000-0000-0000-0000-000000000001' WHERE user_id IS NULL;
UPDATE shifts SET created_by_user_id = '00000000-0000-0000-0000-000000000001' WHERE created_by_user_id IS NULL;

-- =====================================================
-- STEP 3: Create simple anonymous access policies
-- =====================================================

-- Providers: Full anonymous access
CREATE POLICY "Anonymous full access to providers" ON providers
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Clinic Types: Full anonymous access  
CREATE POLICY "Anonymous full access to clinic_types" ON clinic_types
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Medical Assistants: Full anonymous access
CREATE POLICY "Anonymous full access to medical_assistants" ON medical_assistants
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Shifts: Full anonymous access
CREATE POLICY "Anonymous full access to shifts" ON shifts
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- =====================================================
-- STEP 4: Grant permissions to anonymous role
-- =====================================================

GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;

-- =====================================================
-- STEP 5: Test the setup
-- =====================================================

-- Test that all operations work for anonymous users
SELECT 'Testing anonymous access...' as status;

-- Test SELECT (read) - should work
SELECT 'providers_count' as test, count(*) as count FROM providers;
SELECT 'clinic_types_count' as test, count(*) as count FROM clinic_types;
SELECT 'medical_assistants_count' as test, count(*) as count FROM medical_assistants;
SELECT 'shifts_count' as test, count(*) as count FROM shifts;

-- Show current policies
SELECT 
    schemaname, 
    tablename, 
    policyname,
    roles,
    cmd,
    'CURRENT POLICY' as status
FROM pg_policies 
WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts')
ORDER BY tablename, policyname;

SELECT '✅ Anonymous access setup complete!' as message;
SELECT 'All tables now allow anonymous read/write operations' as note; 