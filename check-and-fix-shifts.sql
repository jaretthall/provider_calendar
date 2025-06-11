-- Check and Fix Shifts Issue
-- Run this in your Supabase SQL Editor

-- =====================================================
-- STEP 1: Check what shifts currently exist
-- =====================================================

SELECT 'CURRENT SHIFTS IN DATABASE:' as status;
SELECT 
    s.id,
    p.name as provider_name,
    ct.name as clinic_type_name,
    s.start_date,
    s.end_date,
    s.start_time,
    s.end_time,
    s.is_vacation,
    s.title,
    s.created_at
FROM shifts s
LEFT JOIN providers p ON s.provider_id = p.id
LEFT JOIN clinic_types ct ON s.clinic_type_id = ct.id
ORDER BY s.start_date, s.created_at;

-- =====================================================
-- STEP 2: Check for any orphaned references
-- =====================================================

SELECT 'CHECKING FOR ORPHANED SHIFTS:' as status;

-- Shifts with invalid provider references
SELECT 
    'Invalid Provider Reference' as issue_type,
    s.id as shift_id,
    s.provider_id,
    s.start_date
FROM shifts s
LEFT JOIN providers p ON s.provider_id = p.id
WHERE p.id IS NULL;

-- Shifts with invalid clinic type references  
SELECT 
    'Invalid Clinic Type Reference' as issue_type,
    s.id as shift_id,
    s.clinic_type_id,
    s.start_date
FROM shifts s
LEFT JOIN clinic_types ct ON s.clinic_type_id = ct.id
WHERE s.clinic_type_id IS NOT NULL AND ct.id IS NULL;

-- =====================================================
-- STEP 3: Clean up any orphaned shifts (optional)
-- =====================================================

-- DELETE shifts with invalid provider references
DELETE FROM shifts 
WHERE id IN (
    SELECT s.id
    FROM shifts s
    LEFT JOIN providers p ON s.provider_id = p.id
    WHERE p.id IS NULL
);

-- DELETE shifts with invalid clinic type references
DELETE FROM shifts 
WHERE id IN (
    SELECT s.id
    FROM shifts s
    LEFT JOIN clinic_types ct ON s.clinic_type_id = ct.id
    WHERE s.clinic_type_id IS NOT NULL AND ct.id IS NULL
);

SELECT 'Cleaned up orphaned shifts' as cleanup_step;

-- =====================================================
-- STEP 4: Final verification
-- =====================================================

SELECT 'FINAL SHIFT COUNT:' as status, count(*) as total_shifts FROM shifts;

SELECT 'ALL EXISTING DATA COUNTS:' as summary;
SELECT 'providers' as table_name, count(*) as count FROM providers
UNION ALL
SELECT 'clinic_types' as table_name, count(*) as count FROM clinic_types  
UNION ALL
SELECT 'medical_assistants' as table_name, count(*) as count FROM medical_assistants
UNION ALL
SELECT 'shifts' as table_name, count(*) as count FROM shifts
ORDER BY table_name; 