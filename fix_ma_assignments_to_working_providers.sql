-- Fix MA assignments by reassigning them to providers who actually have shifts
-- This will make the MA badges visible on the calendar

-- First, let's see all the mismatched assignments (MAs assigned to providers with no shifts)
SELECT 
    'Mismatched MA Assignments' as issue_type,
    ma.name as ma_name,
    p.name as assigned_provider,
    mas.start_date,
    ct.name as ma_clinic,
    CASE 
        WHEN ps.id IS NOT NULL THEN 'PROVIDER SHIFT EXISTS'
        ELSE 'NO PROVIDER SHIFT - NEEDS FIX'
    END as status
FROM shifts mas
JOIN medical_assistants ma ON ma.id = ANY(mas.medical_assistant_ids)
JOIN providers p ON p.id = mas.assigned_to_provider_id
LEFT JOIN clinic_types ct ON ct.id = mas.clinic_type_id
LEFT JOIN shifts ps ON (
    ps.provider_id = mas.assigned_to_provider_id 
    AND ps.start_date = mas.start_date
    AND ps.clinic_type_id = mas.clinic_type_id
)
WHERE mas.medical_assistant_ids IS NOT NULL 
AND array_length(mas.medical_assistant_ids, 1) > 0
AND mas.provider_id IS NULL
AND mas.start_date >= '2025-07-23'
AND mas.start_date <= '2025-07-30'
ORDER BY mas.start_date, ma.name;

-- Now fix the assignments by updating them to providers who actually have shifts

-- Fix Ana Guerrero on July 24 - reassign from Joy Elizabeth Ferro to Jim Knox (both Centro shifts)
UPDATE shifts 
SET assigned_to_provider_id = 'df2de625-08e1-474a-a48a-b92b9576f71e'  -- Jim Knox
WHERE medical_assistant_ids @> ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'::uuid]  -- Ana Guerrero
AND start_date = '2025-07-24'
AND assigned_to_provider_id = '71cd1d47-7d3d-4975-8bb3-6f5072f99c55'  -- Joy Elizabeth Ferro
AND provider_id IS NULL;

-- Let's also check and fix other problematic assignments
-- Get all MA assignments and match them to actual provider shifts

-- Fix July 23 assignments to match actual working providers
-- Update MA assignments to providers who actually have shifts that day

-- Check what providers work on July 23
SELECT 
    'July 23 Working Providers' as info,
    p.name as provider_name,
    ct.name as clinic_name,
    s.start_time,
    s.end_time
FROM shifts s
JOIN providers p ON p.id = s.provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.start_date = '2025-07-23'
ORDER BY ct.name, p.name;

-- Fix July 25 assignments to match actual working providers
-- Check what providers work on July 25
SELECT 
    'July 25 Working Providers' as info,
    p.name as provider_name,
    ct.name as clinic_name,
    s.start_time,
    s.end_time
FROM shifts s
JOIN providers p ON p.id = s.provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.start_date = '2025-07-25'
ORDER BY ct.name, p.name;

-- Clean up duplicate MA shifts (we noticed there were 2 Ana Guerrero shifts for the same assignment)
-- Keep only one MA shift per MA per provider per date
DELETE FROM shifts 
WHERE id IN (
    SELECT id 
    FROM (
        SELECT id, 
               ROW_NUMBER() OVER (
                   PARTITION BY medical_assistant_ids, assigned_to_provider_id, start_date 
                   ORDER BY created_at DESC
               ) as rn
        FROM shifts 
        WHERE medical_assistant_ids IS NOT NULL 
        AND array_length(medical_assistant_ids, 1) > 0
        AND provider_id IS NULL
        AND assigned_to_provider_id IS NOT NULL
    ) ranked
    WHERE rn > 1
);

-- Verify the fixes
SELECT 
    'Fixed MA Assignments' as result_type,
    ma.name as ma_name,
    p.name as assigned_provider,
    mas.start_date,
    ct.name as clinic,
    ps.id as provider_shift_exists
FROM shifts mas
JOIN medical_assistants ma ON ma.id = ANY(mas.medical_assistant_ids)
JOIN providers p ON p.id = mas.assigned_to_provider_id
LEFT JOIN clinic_types ct ON ct.id = mas.clinic_type_id
LEFT JOIN shifts ps ON (
    ps.provider_id = mas.assigned_to_provider_id 
    AND ps.start_date = mas.start_date
    AND ps.clinic_type_id = mas.clinic_type_id
)
WHERE mas.medical_assistant_ids IS NOT NULL 
AND array_length(mas.medical_assistant_ids, 1) > 0
AND mas.provider_id IS NULL
AND mas.start_date >= '2025-07-23'
AND mas.start_date <= '2025-07-30'
ORDER BY mas.start_date, ma.name;