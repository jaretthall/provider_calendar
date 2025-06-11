-- Clean Database for Fresh Start
-- Run this in your Supabase SQL Editor to delete all data and start fresh
-- This safely removes all data while respecting foreign key constraints

-- =====================================================
-- STEP 1: Show current data counts (before cleanup)
-- =====================================================

SELECT 'BEFORE CLEANUP - Current data counts:' as status;
SELECT 'providers' as table_name, count(*) as record_count FROM providers
UNION ALL
SELECT 'clinic_types' as table_name, count(*) as record_count FROM clinic_types  
UNION ALL
SELECT 'medical_assistants' as table_name, count(*) as record_count FROM medical_assistants
UNION ALL
SELECT 'shifts' as table_name, count(*) as record_count FROM shifts
UNION ALL
SELECT 'user_settings' as table_name, count(*) as record_count FROM user_settings
ORDER BY table_name;

-- =====================================================
-- STEP 2: Delete all data in correct order (respecting foreign keys)
-- =====================================================

-- Delete shifts first (they reference providers and clinic_types)
DELETE FROM shifts;
SELECT 'Deleted all shifts' as step_1;

-- Delete dependent tables
DELETE FROM medical_assistants;
SELECT 'Deleted all medical assistants' as step_2;

DELETE FROM clinic_types;
SELECT 'Deleted all clinic types' as step_3;

DELETE FROM providers;
SELECT 'Deleted all providers' as step_4;

-- Delete user settings (optional - this contains user preferences)
DELETE FROM user_settings;
SELECT 'Deleted all user settings' as step_5;

-- Delete any audit logs if they exist
DELETE FROM audit_log WHERE true;
SELECT 'Deleted audit logs (if table exists)' as step_6;

-- =====================================================
-- STEP 3: Reset any auto-increment sequences (if needed)
-- =====================================================

-- Note: Since we're using UUIDs, no sequence reset needed
SELECT 'No sequence reset needed (using UUIDs)' as step_7;

-- =====================================================
-- STEP 4: Verify cleanup completed
-- =====================================================

SELECT 'AFTER CLEANUP - Data counts should all be 0:' as status;
SELECT 'providers' as table_name, count(*) as record_count FROM providers
UNION ALL
SELECT 'clinic_types' as table_name, count(*) as record_count FROM clinic_types  
UNION ALL
SELECT 'medical_assistants' as table_name, count(*) as record_count FROM medical_assistants
UNION ALL
SELECT 'shifts' as table_name, count(*) as record_count FROM shifts
UNION ALL
SELECT 'user_settings' as table_name, count(*) as record_count FROM user_settings
ORDER BY table_name;

-- =====================================================
-- STEP 5: Verify table structure is intact
-- =====================================================

SELECT 'Verifying table structure...' as status;

-- Check that tables still exist and are accessible
SELECT table_name, 'Table exists and accessible' as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('providers', 'clinic_types', 'medical_assistants', 'shifts', 'user_settings')
ORDER BY table_name;

-- Check that foreign key constraints are still in place
SELECT 
    tc.table_name,
    tc.constraint_name,
    'Foreign key constraint intact' as status
FROM information_schema.table_constraints AS tc 
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('shifts')
ORDER BY tc.table_name, tc.constraint_name;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

SELECT '✅ DATABASE CLEANUP COMPLETE!' as message;
SELECT 'All data deleted, tables intact, ready for fresh data' as next_steps;
SELECT 'You can now create new providers, clinic types, MAs, and shifts' as instructions; 