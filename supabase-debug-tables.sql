-- Debug Queries to Check Table Structure and Permissions
-- Run these in Supabase SQL Editor to diagnose the 400 errors

-- 1. Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('providers', 'clinic_types', 'medical_assistants', 'shifts', 'user_settings');

-- 2. Check table structure for providers
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'providers';

-- 3. Check table structure for clinic_types
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'clinic_types';

-- 4. Check table structure for medical_assistants
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'medical_assistants';

-- 5. Check table structure for shifts
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'shifts';

-- 6. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts');

-- 7. Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts') 
AND schemaname = 'public';

-- 8. Test simple select on each table (this should work with anonymous access)
SELECT 'providers' as table_name, COUNT(*) as record_count FROM providers
UNION ALL
SELECT 'clinic_types' as table_name, COUNT(*) as record_count FROM clinic_types  
UNION ALL
SELECT 'medical_assistants' as table_name, COUNT(*) as record_count FROM medical_assistants
UNION ALL
SELECT 'shifts' as table_name, COUNT(*) as record_count FROM shifts;

-- 9. Check current user and role
SELECT 
  current_user as current_user,
  session_user as session_user,
  current_role as current_role,
  auth.role() as auth_role,
  auth.uid() as auth_uid;

-- ═══════════════════════════════════════════════════════════════
-- EXPECTED RESULTS:
-- ═══════════════════════════════════════════════════════════════
-- 1. All 5 tables should exist
-- 2-5. Each table should have the expected columns (id, name, color, etc.)
-- 6. Should show RLS policies for anonymous SELECT and authenticated INSERT/UPDATE/DELETE
-- 7. All tables should have rowsecurity = true
-- 8. Should return count of records in each table (may be 0)
-- 9. auth_role should be 'anon' for anonymous access

-- ═══════════════════════════════════════════════════════════════
-- IF ERRORS OCCUR:
-- ═══════════════════════════════════════════════════════════════
-- - If tables don't exist: Run supabase-schema.sql first
-- - If RLS policies missing: Run supabase-anonymous-read-policies.sql  
-- - If permission denied: Check that anonymous access is enabled
-- - If 400 errors persist: Check API URL and keys in .env file 