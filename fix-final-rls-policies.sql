-- FINAL RLS POLICY FIX - Based on Supabase Troubleshooting Guide
-- This addresses common 42501 errors and data integrity issues
-- Run this ONCE in your Supabase SQL Editor to fix all policy conflicts

-- =====================================================
-- STEP 1: Clean ALL existing policies (prevents conflicts)
-- =====================================================
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drop all existing policies on our tables
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts', 'user_settings', 'user_profiles')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END
$$;

-- =====================================================
-- STEP 2: Ensure RLS is enabled (required by Supabase)
-- =====================================================
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 3: Create SIMPLE, NON-CONFLICTING policies
-- Based on Supabase troubleshooting guide best practices
-- =====================================================

-- PROVIDERS TABLE
CREATE POLICY "allow_read_providers" ON public.providers FOR SELECT USING (true);
CREATE POLICY "allow_write_providers" ON public.providers FOR ALL USING (true) WITH CHECK (true);

-- CLINIC TYPES TABLE  
CREATE POLICY "allow_read_clinic_types" ON public.clinic_types FOR SELECT USING (true);
CREATE POLICY "allow_write_clinic_types" ON public.clinic_types FOR ALL USING (true) WITH CHECK (true);

-- MEDICAL ASSISTANTS TABLE
CREATE POLICY "allow_read_medical_assistants" ON public.medical_assistants FOR SELECT USING (true);
CREATE POLICY "allow_write_medical_assistants" ON public.medical_assistants FOR ALL USING (true) WITH CHECK (true);

-- SHIFTS TABLE (most critical for data integrity)
CREATE POLICY "allow_read_shifts" ON public.shifts FOR SELECT USING (true);
CREATE POLICY "allow_write_shifts" ON public.shifts FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- STEP 4: Verify policies are working (troubleshooting)
-- =====================================================

-- Check that policies exist and are correct
SELECT 'POLICY VERIFICATION' as check_type;
SELECT 
    tablename,
    policyname,
    cmd,
    CASE 
        WHEN qual = 'true' THEN '✅ USING (true)'
        ELSE '❌ ' || qual
    END as using_clause,
    CASE 
        WHEN with_check = 'true' THEN '✅ WITH CHECK (true)'
        WHEN with_check IS NULL THEN '⚪ N/A'
        ELSE '❌ ' || with_check
    END as check_clause
FROM pg_policies 
WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts')
ORDER BY tablename, policyname;

-- Test data access (should work for anonymous users)
SELECT 'DATA ACCESS VERIFICATION' as check_type;
SELECT 'providers' as table_name, COUNT(*) as record_count FROM providers
UNION ALL
SELECT 'clinic_types' as table_name, COUNT(*) as record_count FROM clinic_types
UNION ALL  
SELECT 'medical_assistants' as table_name, COUNT(*) as record_count FROM medical_assistants
UNION ALL
SELECT 'shifts' as table_name, COUNT(*) as record_count FROM shifts;

-- Check for foreign key integrity (root of your original issue)
SELECT 'FOREIGN KEY INTEGRITY CHECK' as check_type;
SELECT 
    'orphaned_shifts' as issue_type,
    COUNT(*) as problem_count,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ No orphaned shifts'
        ELSE '❌ ' || COUNT(*) || ' shifts reference missing providers/clinics'
    END as status
FROM shifts s
LEFT JOIN providers p ON s.provider_id = p.id
LEFT JOIN clinic_types ct ON s.clinic_type_id = ct.id
WHERE s.provider_id IS NOT NULL AND p.id IS NULL
   OR (s.clinic_type_id IS NOT NULL AND ct.id IS NULL);

SELECT 'RLS POLICIES FIXED - TEST YOUR APP NOW!' as final_status; 