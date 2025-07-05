-- DIAGNOSTIC: Current RLS and Authentication Setup
-- Run this in your Supabase SQL Editor to see exactly what's configured
-- This will prove or disprove assumptions about authentication requirements

-- =====================================================
-- 1. CURRENT RLS POLICIES - What's actually configured?
-- =====================================================

SELECT 'CURRENT RLS POLICIES' as section_title;

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    qual as using_condition,
    with_check as check_condition,
    -- Analyze what each policy actually does
    CASE 
        WHEN qual = 'true' THEN '✅ ALLOWS ALL ACCESS'
        WHEN qual LIKE '%auth.uid()%' THEN '🔐 REQUIRES AUTHENTICATION'
        WHEN qual LIKE '%anon%' OR roles = '{anon}' THEN '👤 ANONYMOUS ACCESS'
        WHEN roles = '{authenticated}' THEN '🔐 AUTHENTICATED ONLY'
        ELSE '❓ CUSTOM: ' || qual
    END as policy_analysis
FROM pg_policies 
WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts', 'user_profiles', 'user_settings')
ORDER BY tablename, cmd, policyname;

-- =====================================================
-- 2. RLS ENABLEMENT STATUS
-- =====================================================

SELECT 'RLS ENABLEMENT STATUS' as section_title;

SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN '✅ RLS ENABLED'
        ELSE '❌ RLS DISABLED'
    END as status
FROM pg_tables 
WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts', 'user_profiles', 'user_settings')
AND schemaname = 'public'
ORDER BY tablename;

-- =====================================================
-- 3. TEST ANONYMOUS ACCESS - Can anon users read data?
-- =====================================================

SELECT 'ANONYMOUS ACCESS TEST' as section_title;

-- Test if anonymous users can access each table
SELECT 'providers' as table_name, 
       COUNT(*) as record_count,
       CASE WHEN COUNT(*) > 0 THEN '✅ ANONYMOUS READ WORKS' ELSE '❌ ANONYMOUS READ BLOCKED' END as access_status
FROM providers
UNION ALL
SELECT 'clinic_types' as table_name, 
       COUNT(*) as record_count,
       CASE WHEN COUNT(*) > 0 THEN '✅ ANONYMOUS READ WORKS' ELSE '❌ ANONYMOUS READ BLOCKED' END as access_status
FROM clinic_types
UNION ALL
SELECT 'medical_assistants' as table_name, 
       COUNT(*) as record_count,
       CASE WHEN COUNT(*) > 0 THEN '✅ ANONYMOUS READ WORKS' ELSE '❌ ANONYMOUS READ BLOCKED' END as access_status
FROM medical_assistants
UNION ALL
SELECT 'shifts' as table_name, 
       COUNT(*) as record_count,
       CASE WHEN COUNT(*) > 0 THEN '✅ ANONYMOUS READ WORKS' ELSE '❌ ANONYMOUS READ BLOCKED' END as access_status
FROM shifts;

-- =====================================================
-- 4. CURRENT AUTH STATE - What user context is active?
-- =====================================================

SELECT 'CURRENT AUTH CONTEXT' as section_title;

SELECT 
    current_user as database_user,
    session_user as session_user,
    current_role as current_role,
    -- These functions may not exist if auth isn't fully set up
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'role') 
        THEN (SELECT auth.role()::text) 
        ELSE 'auth.role() function not available'
    END as auth_role,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'uid') 
        THEN COALESCE((SELECT auth.uid()::text), 'NULL (anonymous)')
        ELSE 'auth.uid() function not available'
    END as auth_uid;

-- =====================================================
-- 5. POLICY CONFLICTS - Are there overlapping policies?
-- =====================================================

SELECT 'POLICY CONFLICT ANALYSIS' as section_title;

WITH policy_counts AS (
    SELECT 
        tablename,
        cmd,
        COUNT(*) as policy_count
    FROM pg_policies 
    WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts')
    GROUP BY tablename, cmd
)
SELECT 
    tablename,
    cmd as operation,
    policy_count,
    CASE 
        WHEN policy_count > 1 THEN '⚠️ MULTIPLE POLICIES - POTENTIAL CONFLICT'
        WHEN policy_count = 1 THEN '✅ SINGLE POLICY'
        ELSE '❌ NO POLICIES'
    END as conflict_risk
FROM policy_counts
ORDER BY tablename, cmd;

-- =====================================================
-- 6. SPECIFIC SHIFTS ANALYSIS - Your PS shift issue
-- =====================================================

SELECT 'PS SHIFT INVESTIGATION' as section_title;

-- Look for shifts around January 17th (adjust date as needed)
SELECT 
    s.id,
    p.name as provider_name,
    ct.name as clinic_type,
    s.start_date,
    s.start_time,
    s.end_time,
    s.created_at,
    s.updated_at,
    CASE 
        WHEN p.name ILIKE '%philip%' OR p.name ILIKE '%ps%' THEN '🎯 PS SHIFT'
        ELSE 'Other provider'
    END as shift_identification
FROM shifts s
LEFT JOIN providers p ON s.provider_id = p.id
LEFT JOIN clinic_types ct ON s.clinic_type_id = ct.id
WHERE s.start_date BETWEEN '2025-01-15' AND '2025-01-20'  -- Adjust date range as needed
ORDER BY s.start_date, s.created_at;

-- =====================================================
-- 7. TABLE SCHEMA VERIFICATION
-- =====================================================

SELECT 'TABLE SCHEMAS' as section_title;

-- Verify table structures match expectations
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name IN ('providers', 'clinic_types', 'medical_assistants', 'shifts')
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;

-- =====================================================
-- SUMMARY AND RECOMMENDATIONS
-- =====================================================

SELECT '
📊 DIAGNOSTIC COMPLETE!

WHAT TO LOOK FOR IN THE RESULTS:

1. RLS POLICIES: 
   - Do you see policies requiring auth.uid()?
   - Are there multiple conflicting policies per table?
   - Do policies allow anonymous access?

2. ANONYMOUS ACCESS TEST:
   - Can you read data without authentication?
   - Are some tables accessible and others not?

3. AUTH CONTEXT:
   - What role is currently active?
   - Is auth.uid() NULL (anonymous) or set?

4. CONFLICTS:
   - Are there multiple policies causing conflicts?

5. PS SHIFT DATA:
   - Do you see your PS shift in the database?
   - When was it created vs when you tried to create it again?

Based on these results, we can determine if authentication 
is actually required or if there are other issues.
' as diagnostic_instructions; 