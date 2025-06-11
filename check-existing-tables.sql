-- Check What Tables Exist in Your Supabase Database
-- Run this in your Supabase SQL Editor to see the current state

-- ============================================================================
-- 1. LIST ALL TABLES IN PUBLIC SCHEMA
-- ============================================================================
SELECT 
    table_name,
    table_type,
    table_schema
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ============================================================================
-- 2. CHECK FOR SPECIFIC CALENDAR APP TABLES
-- ============================================================================
SELECT 
    CASE 
        WHEN table_name = 'providers' THEN '✅ Providers table exists'
        WHEN table_name = 'clinic_types' THEN '✅ Clinic Types table exists'  
        WHEN table_name = 'medical_assistants' THEN '✅ Medical Assistants table exists'
        WHEN table_name = 'shifts' THEN '✅ Shifts table exists'
        WHEN table_name = 'user_profiles' THEN '✅ User Profiles table exists'
        WHEN table_name = 'user_settings' THEN '✅ User Settings table exists'
        ELSE table_name
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('providers', 'clinic_types', 'medical_assistants', 'shifts', 'user_profiles', 'user_settings')
ORDER BY table_name;

-- ============================================================================
-- 3. CHECK TABLE STRUCTURES (if tables exist)
-- ============================================================================

-- Providers table structure
SELECT 'PROVIDERS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'providers'
ORDER BY ordinal_position;

-- Clinic Types table structure  
SELECT 'CLINIC_TYPES TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'clinic_types'
ORDER BY ordinal_position;

-- Medical Assistants table structure
SELECT 'MEDICAL_ASSISTANTS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'medical_assistants'
ORDER BY ordinal_position;

-- Shifts table structure
SELECT 'SHIFTS TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_schema = 'public' AND table_name = 'shifts'
ORDER BY ordinal_position;

-- ============================================================================
-- 4. CHECK ROW LEVEL SECURITY STATUS
-- ============================================================================
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity = true THEN '🔒 RLS Enabled'
        ELSE '🔓 RLS Disabled'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts')
ORDER BY tablename;

-- ============================================================================
-- 5. CHECK EXISTING POLICIES
-- ============================================================================
SELECT 
    tablename,
    policyname,
    permissive,
    roles,
    cmd as operation,
    CASE 
        WHEN qual IS NOT NULL THEN '✅ Has conditions'
        ELSE '❌ No conditions'
    END as has_conditions
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts')
ORDER BY tablename, policyname;

-- ============================================================================
-- 6. CHECK DATA COUNTS (if tables exist and have data)
-- ============================================================================
DO $$
DECLARE
    providers_count INTEGER := 0;
    clinics_count INTEGER := 0;
    mas_count INTEGER := 0;
    shifts_count INTEGER := 0;
BEGIN
    -- Check providers
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'providers') THEN
        SELECT COUNT(*) INTO providers_count FROM providers;
        RAISE NOTICE 'Providers: % records', providers_count;
    ELSE
        RAISE NOTICE 'Providers: Table does not exist';
    END IF;
    
    -- Check clinic_types  
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clinic_types') THEN
        SELECT COUNT(*) INTO clinics_count FROM clinic_types;
        RAISE NOTICE 'Clinic Types: % records', clinics_count;
    ELSE
        RAISE NOTICE 'Clinic Types: Table does not exist';
    END IF;
    
    -- Check medical_assistants
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'medical_assistants') THEN
        SELECT COUNT(*) INTO mas_count FROM medical_assistants;
        RAISE NOTICE 'Medical Assistants: % records', mas_count;
    ELSE
        RAISE NOTICE 'Medical Assistants: Table does not exist';
    END IF;
    
    -- Check shifts
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shifts') THEN
        SELECT COUNT(*) INTO shifts_count FROM shifts;
        RAISE NOTICE 'Shifts: % records', shifts_count;
    ELSE
        RAISE NOTICE 'Shifts: Table does not exist';
    END IF;
END $$;

-- ============================================================================
-- 7. SUMMARY DIAGNOSIS
-- ============================================================================
SELECT 
    CASE 
        WHEN (
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('providers', 'clinic_types', 'medical_assistants', 'shifts')
        ) = 4 THEN '✅ ALL REQUIRED TABLES EXIST - You can run the static viewer!'
        WHEN (
            SELECT COUNT(*) 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('providers', 'clinic_types', 'medical_assistants', 'shifts')
        ) > 0 THEN '⚠️ SOME TABLES EXIST - You may need to run create-tables-for-viewer.sql'
        ELSE '❌ NO TABLES EXIST - You MUST run create-tables-for-viewer.sql first'
    END as diagnosis;

-- ============================================================================
-- 8. NEXT STEPS RECOMMENDATION
-- ============================================================================
SELECT 
    CASE 
        WHEN NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'providers') 
        THEN '🎯 NEXT STEP: Run create-tables-for-viewer.sql to create all tables'
        WHEN EXISTS (SELECT FROM pg_policies WHERE tablename = 'providers' AND policyname LIKE '%anonymous%')
        THEN '🎯 NEXT STEP: Update static-viewer.html with your Supabase credentials and test'
        ELSE '🎯 NEXT STEP: Run enable-anonymous-viewer.sql to allow static viewer access'
    END as recommendation; 