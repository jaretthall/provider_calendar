-- Debug Database Contents
-- Run this in your Supabase SQL Editor to see what data exists

-- =====================================================
-- CHECK WHAT DATA EXISTS IN EACH TABLE
-- =====================================================

-- Check providers
SELECT 'PROVIDERS' as table_name, count(*) as total_count FROM providers;
SELECT 'Provider Details:' as info;
SELECT id, name, color, is_active, created_at FROM providers ORDER BY name;

-- Check clinic types
SELECT 'CLINIC TYPES' as table_name, count(*) as total_count FROM clinic_types;
SELECT 'Clinic Type Details:' as info;
SELECT id, name, color, is_active, created_at FROM clinic_types ORDER BY name;

-- Check medical assistants
SELECT 'MEDICAL ASSISTANTS' as table_name, count(*) as total_count FROM medical_assistants;
SELECT 'Medical Assistant Details:' as info;
SELECT id, name, color, is_active, created_at FROM medical_assistants ORDER BY name;

-- Check shifts
SELECT 'SHIFTS' as table_name, count(*) as total_count FROM shifts;
SELECT 'Shift Details:' as info;
SELECT 
    id, 
    provider_id, 
    clinic_type_id, 
    title,
    start_date, 
    end_date, 
    is_vacation,
    created_at 
FROM shifts 
ORDER BY start_date, created_at;

-- =====================================================
-- CHECK FOR ORPHANED REFERENCES
-- =====================================================

-- Check if there are any shifts with invalid provider references
SELECT 'ORPHANED PROVIDER REFERENCES:' as check_type;
SELECT s.id as shift_id, s.provider_id, 'Provider not found' as issue
FROM shifts s
LEFT JOIN providers p ON s.provider_id = p.id
WHERE p.id IS NULL;

-- Check if there are any shifts with invalid clinic type references
SELECT 'ORPHANED CLINIC TYPE REFERENCES:' as check_type;
SELECT s.id as shift_id, s.clinic_type_id, 'Clinic type not found' as issue
FROM shifts s
LEFT JOIN clinic_types ct ON s.clinic_type_id = ct.id
WHERE s.clinic_type_id IS NOT NULL AND ct.id IS NULL;

-- =====================================================
-- SHOW TABLE CONSTRAINTS
-- =====================================================

-- Show foreign key constraints
SELECT 'FOREIGN KEY CONSTRAINTS:' as info;
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('shifts', 'providers', 'clinic_types', 'medical_assistants')
ORDER BY tc.table_name, tc.constraint_name; 