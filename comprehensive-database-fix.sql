-- COMPREHENSIVE DATABASE FIX - FULLY ALIGNED WITH APPLICATION
-- This script addresses ALL data integrity issues and matches app expectations
-- Run this ONCE in your Supabase SQL Editor

-- =====================================================
-- STEP 1: Clean slate - Remove all existing data
-- =====================================================

-- Delete all shifts first (due to foreign key constraints)
DELETE FROM shifts;

-- Delete all other data
DELETE FROM medical_assistants;
DELETE FROM clinic_types;
DELETE FROM providers;

-- =====================================================
-- STEP 2: Insert data using EXACT format expected by app
-- =====================================================

-- Insert Providers with Tailwind color classes (matching constants.ts)
INSERT INTO providers (id, name, color, is_active, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Philip Sutherland', 'bg-red-500', true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Tiffany Good', 'bg-red-600', true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'Kelly Arnold', 'bg-orange-500', true, NOW(), NOW());

-- Insert Clinic Types matching the Spanish names from your database
INSERT INTO clinic_types (id, name, color, is_active, created_at, updated_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Centro', 'bg-amber-400', true, NOW(), NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Urgente', 'bg-yellow-500', true, NOW(), NOW());

-- Insert Medical Assistants
INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Aida', 'bg-green-500', true, NOW(), NOW());

-- Insert Sample Shifts with proper foreign key references and matching colors
INSERT INTO shifts (
    id, 
    provider_id, 
    clinic_type_id, 
    medical_assistant_ids, 
    title, 
    start_date, 
    end_date, 
    start_time, 
    end_time, 
    is_vacation, 
    notes, 
    color, 
    recurring_rule, 
    series_id, 
    original_recurring_shift_id, 
    is_exception_instance, 
    exception_for_date, 
    created_at, 
    updated_at
) VALUES
-- Today's shifts (using provider colors to match app logic)
('shift001-1111-2222-3333-444444444444', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"ffffffff-ffff-ffff-ffff-ffffffffffff"}', 'Morning Centro', CURRENT_DATE, CURRENT_DATE, '09:00', '17:00', false, 'Philip Sutherland at Centro with Aida', 'bg-red-500', null, null, null, false, null, NOW(), NOW()),

('shift002-1111-2222-3333-444444444444', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"ffffffff-ffff-ffff-ffff-ffffffffffff"}', 'Emergency Shift', CURRENT_DATE, CURRENT_DATE, '10:00', '18:00', false, 'Tiffany Good covering emergency with Aida', 'bg-red-600', null, null, null, false, null, NOW(), NOW()),

-- Tomorrow's shifts
('shift003-1111-2222-3333-444444444444', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"ffffffff-ffff-ffff-ffff-ffffffffffff"}', 'Centro Coverage', CURRENT_DATE + 1, CURRENT_DATE + 1, '08:00', '16:00', false, 'Kelly Arnold at Centro with Aida', 'bg-orange-500', null, null, null, false, null, NOW(), NOW()),

-- Vacation example (using vacation color from constants.ts)
('shift004-1111-2222-3333-444444444444', '11111111-1111-1111-1111-111111111111', null, null, 'Annual Leave', CURRENT_DATE + 2, CURRENT_DATE + 4, null, null, true, 'Philip Sutherland on vacation', 'bg-red-600', null, null, null, false, null, NOW(), NOW()),

-- Next week shift
('shift005-1111-2222-3333-444444444444', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"ffffffff-ffff-ffff-ffff-ffffffffffff"}', 'Urgente Coverage', CURRENT_DATE + 7, CURRENT_DATE + 7, '07:00', '15:00', false, 'Tiffany Good urgente with Aida', 'bg-red-600', null, null, null, false, null, NOW(), NOW());

-- =====================================================
-- STEP 3: Verify everything is working
-- =====================================================

-- Show counts
SELECT 'DATA SUMMARY:' as info;
SELECT 'Providers' as table_name, COUNT(*) as count FROM providers
UNION ALL
SELECT 'Clinic Types' as table_name, COUNT(*) as count FROM clinic_types
UNION ALL
SELECT 'Medical Assistants' as table_name, COUNT(*) as count FROM medical_assistants
UNION ALL
SELECT 'Shifts' as table_name, COUNT(*) as count FROM shifts;

-- Show shifts with names (critical for validation debugging)
SELECT 'SHIFTS WITH DETAILS:' as info;
SELECT 
    s.id,
    p.name as provider,
    ct.name as clinic_type,
    s.start_date,
    s.start_time,
    s.end_time,
    s.is_vacation,
    s.title,
    s.color as shift_color
FROM shifts s
JOIN providers p ON s.provider_id = p.id
LEFT JOIN clinic_types ct ON s.clinic_type_id = ct.id
ORDER BY s.start_date, s.start_time;

-- =====================================================
-- STEP 4: CRITICAL - Verify foreign key integrity
-- =====================================================

SELECT 'FOREIGN KEY INTEGRITY CHECK:' as info;

-- Check for any orphaned shifts (MUST be 0)
SELECT 'Orphaned shifts (should be 0):' as check_type, COUNT(*) as count
FROM shifts s
LEFT JOIN providers p ON s.provider_id = p.id
WHERE p.id IS NULL

UNION ALL

SELECT 'Invalid clinic references (should be 0):' as check_type, COUNT(*) as count
FROM shifts s
LEFT JOIN clinic_types ct ON s.clinic_type_id = ct.id
WHERE s.clinic_type_id IS NOT NULL AND ct.id IS NULL;

-- =====================================================
-- STEP 5: Test the exact data app will see
-- =====================================================

SELECT 'APP DATA VERIFICATION:' as info;

-- Show data exactly as the Supabase hooks will transform it
SELECT 'Providers as app sees them:' as debug_info;
SELECT 
    id,
    name, 
    color,
    is_active as "isActive",
    created_at as "createdAt",
    updated_at as "updatedAt"
FROM providers WHERE is_active = true;

SELECT 'Clinic Types as app sees them:' as debug_info;
SELECT 
    id,
    name, 
    color,
    is_active as "isActive", 
    created_at as "createdAt",
    updated_at as "updatedAt"
FROM clinic_types WHERE is_active = true;

SELECT 'Medical Assistants as app sees them:' as debug_info;
SELECT 
    id,
    name, 
    color,
    is_active as "isActive",
    created_at as "createdAt", 
    updated_at as "updatedAt"
FROM medical_assistants WHERE is_active = true;

SELECT 'Shifts as app sees them:' as debug_info;
SELECT 
    id,
    provider_id as "providerId",
    clinic_type_id as "clinicTypeId", 
    medical_assistant_ids as "medicalAssistantIds",
    title,
    start_date as "startDate",
    end_date as "endDate", 
    start_time as "startTime",
    end_time as "endTime",
    is_vacation as "isVacation",
    notes,
    color,
    recurring_rule as "recurringRule",
    series_id as "seriesId",
    original_recurring_shift_id as "originalRecurringShiftId",
    is_exception_instance as "isExceptionInstance", 
    exception_for_date as "exceptionForDate",
    created_at as "createdAt",
    updated_at as "updatedAt"
FROM shifts;

SELECT 'DATABASE SETUP COMPLETE - READY FOR APP!' as status; 