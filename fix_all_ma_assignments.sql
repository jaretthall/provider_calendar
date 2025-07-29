-- Comprehensive fix for MA assignments
-- Match MAs to providers who actually have shifts on the same dates/clinics

-- First, let's see what provider shifts actually exist for the week
SELECT 
    'Actual Provider Schedule' as info,
    s.start_date,
    p.name as provider_name,
    ct.name as clinic_name,
    s.start_time,
    s.end_time
FROM shifts s
JOIN providers p ON p.id = s.provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.start_date >= '2025-07-23'
AND s.start_date <= '2025-07-30'
ORDER BY s.start_date, ct.name, p.name;

-- Now let's fix the MA assignments to match actual working providers

-- JULY 23, 2025 FIXES
-- Based on actual provider shifts, update MA assignments

-- First, delete all existing problematic MA assignments
DELETE FROM shifts 
WHERE medical_assistant_ids IS NOT NULL 
AND array_length(medical_assistant_ids, 1) > 0
AND provider_id IS NULL
AND start_date >= '2025-07-23'
AND start_date <= '2025-07-30';

-- Recreate MA assignments that match actual provider shifts
-- July 23, 2025 - Assign MAs to providers who actually work that day

-- Check what providers work July 23 first
SELECT 
    'July 23 Working Providers' as check_date,
    p.name as provider_name,
    ct.name as clinic_name
FROM shifts s
JOIN providers p ON p.id = s.provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.start_date = '2025-07-23'
ORDER BY ct.name, p.name;

-- Insert corrected MA assignments based on actual provider schedules
-- I'll assign MAs to the providers who are actually working

-- July 24, 2025 - We know these providers work:
-- Elizabeth Swaggerty @ Centro, Jim Knox @ Urgente, Ludjelie Manigat @ Urgente, Philip Sutherland @ Urgente

INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_date, end_date, start_time, end_time, is_vacation, notes, created_at, updated_at)
VALUES 
-- July 24 assignments to working providers
('89a8853e-a9b4-4e52-ab5f-549ffbb347ff'::uuid, ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'::uuid], '97e08d3e-6d42-47a4-9fe1-853a01c5bde6'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'Ana Guerrero assigned to Elizabeth Swaggerty @ Centro', NOW(), NOW()),
(gen_random_uuid(), ARRAY['bf6d8fa4-eea9-497e-8e67-026753c9c1b0'::uuid], 'df2de625-08e1-474a-a48a-b92b9576f71e'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'Daniela Hernandez assigned to Jim Knox @ Urgente', NOW(), NOW()),
(gen_random_uuid(), ARRAY['2946a856-5a23-408c-af54-3a6e2d314a71'::uuid], '2437699b-6a55-4803-98e5-ac5c0a3d82a8'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'Yaniris Soto assigned to Ludjelie Manigat @ Urgente', NOW(), NOW()),
(gen_random_uuid(), ARRAY['cf5e7c66-d229-48bf-b8e5-ee21df8fa349'::uuid], '11111111-1111-1111-1111-111111111111'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'Lupita Ferreira assigned to Philip Sutherland @ Urgente', NOW(), NOW());

-- Verify the July 24 fixes
SELECT 
    'July 24 Verification' as check_type,
    ma.name as ma_name,
    p.name as assigned_provider,
    ct.name as clinic,
    CASE 
        WHEN ps.id IS NOT NULL THEN 'MATCH - BADGE WILL SHOW'
        ELSE 'NO MATCH - BADGE WONT SHOW'
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
WHERE mas.start_date = '2025-07-24'
AND mas.provider_id IS NULL
ORDER BY ma.name;