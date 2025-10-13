-- DEBUG DATA INTEGRITY ISSUES
-- Based on Supabase Troubleshooting Guide recommendations
-- Run this to diagnose the root cause of "Selected clinic type does not exist" errors

-- =====================================================
-- 1. Check for the specific issue patterns mentioned in troubleshooting guide
-- =====================================================

SELECT '=== COMMON SUPABASE ISSUES DIAGNOSTIC ===' as debug_section;

-- Check #1: "Why is my select returning an empty data array" issue
SELECT 'EMPTY DATA ARRAY CHECK' as check_name;
SELECT 
    'Data visible to anonymous users?' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ YES - ' || COUNT(*) || ' providers visible'
        ELSE '❌ NO - RLS blocking access'
    END as result
FROM providers;

-- Same check for clinic types (your main issue)
SELECT 
    'Clinic types visible to anonymous users?' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ YES - ' || COUNT(*) || ' clinic types visible' 
        ELSE '❌ NO - RLS blocking access'
    END as result
FROM clinic_types;

-- Check #2: Permission denied errors (42501)
SELECT 'RLS POLICY ANALYSIS' as check_name;
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    -- Check for common problematic patterns
    CASE 
        WHEN roles = '{anon}' AND cmd = 'SELECT' THEN '✅ Anonymous read allowed'
        WHEN roles = '{authenticated}' AND cmd = 'ALL' THEN '✅ Authenticated write allowed'
        WHEN qual LIKE '%auth.uid()%' THEN '⚠️ User-specific policy (potential issue)'
        WHEN qual = 'true' THEN '✅ Permissive policy'
        ELSE '❓ Custom policy: ' || qual
    END as policy_status
FROM pg_policies 
WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts')
ORDER BY tablename, cmd;

-- Check #3: Foreign key constraint vs RLS timing issue
SELECT 'FOREIGN KEY TIMING ISSUE CHECK' as check_name;
-- This checks if the data exists but RLS makes it invisible during FK validation
WITH fk_check AS (
    SELECT 
        s.id as shift_id,
        s.provider_id,
        s.clinic_type_id,
        p.name as provider_name,
        ct.name as clinic_name,
        -- Check if provider exists in raw table
        CASE WHEN p.id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as provider_status,
        -- Check if clinic exists in raw table  
        CASE WHEN ct.id IS NOT NULL THEN 'EXISTS' ELSE 'MISSING' END as clinic_status
    FROM shifts s
    LEFT JOIN providers p ON s.provider_id = p.id
    LEFT JOIN clinic_types ct ON s.clinic_type_id = ct.id
    WHERE s.is_vacation = false  -- Only check non-vacation shifts
)
SELECT 
    COUNT(*) as total_shifts,
    COUNT(CASE WHEN provider_status = 'MISSING' THEN 1 END) as missing_providers,
    COUNT(CASE WHEN clinic_status = 'MISSING' THEN 1 END) as missing_clinics,
    CASE 
        WHEN COUNT(CASE WHEN provider_status = 'MISSING' THEN 1 END) = 0 
         AND COUNT(CASE WHEN clinic_status = 'MISSING' THEN 1 END) = 0 
        THEN '✅ All foreign keys valid'
        ELSE '❌ Foreign key integrity issues found'
    END as fk_integrity_status
FROM fk_check;

-- Check #4: Service role vs anonymous access pattern
SELECT 'ACCESS PATTERN ANALYSIS' as check_name;
SELECT 
    tablename,
    COUNT(CASE WHEN roles @> ARRAY['anon'] THEN 1 END) as anonymous_policies,
    COUNT(CASE WHEN roles @> ARRAY['authenticated'] THEN 1 END) as authenticated_policies,
    COUNT(CASE WHEN roles @> ARRAY['service_role'] THEN 1 END) as service_role_policies,
    -- Identify potential conflicts
    CASE 
        WHEN COUNT(CASE WHEN roles @> ARRAY['anon'] THEN 1 END) > 0 
         AND COUNT(CASE WHEN roles @> ARRAY['authenticated'] THEN 1 END) > 0
        THEN '⚠️ Mixed anonymous + authenticated (potential conflict)'
        WHEN COUNT(*) = 0 THEN '❌ NO POLICIES (will block all access)'
        ELSE '✅ Consistent access pattern'
    END as pattern_status
FROM pg_policies 
WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts')
GROUP BY tablename;

-- Check #5: Data that exists but app can't see it (classic RLS issue)
SELECT 'INVISIBLE DATA CHECK' as check_name;
-- Count data using service role (bypasses RLS) vs anonymous access
SELECT 
    'providers' as table_name,
    (SELECT COUNT(*) FROM providers) as total_records,
    'If this shows 0, RLS is blocking anonymous access' as note
UNION ALL
SELECT 
    'clinic_types' as table_name,
    (SELECT COUNT(*) FROM clinic_types) as total_records,
    'This is your main issue source if 0' as note
UNION ALL
SELECT 
    'shifts' as table_name, 
    (SELECT COUNT(*) FROM shifts) as total_records,
    'Shifts referencing invisible clinic types cause validation errors' as note;

-- Final recommendation based on troubleshooting guide
SELECT '=== TROUBLESHOOTING RECOMMENDATION ===' as debug_section;
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'clinic_types') = 0 
        THEN '❌ NO RLS POLICIES: Run fix-final-rls-policies.sql first'
        WHEN (SELECT COUNT(*) FROM clinic_types) = 0
        THEN '❌ NO DATA: Run comprehensive-database-fix.sql to populate data'
        WHEN (SELECT COUNT(*) FROM shifts s LEFT JOIN clinic_types ct ON s.clinic_type_id = ct.id WHERE s.clinic_type_id IS NOT NULL AND ct.id IS NULL) > 0
        THEN '❌ FOREIGN KEY INTEGRITY: Orphaned shift references found'
        ELSE '✅ Issue may be elsewhere - check app-level validation logic'
    END as primary_recommendation; 