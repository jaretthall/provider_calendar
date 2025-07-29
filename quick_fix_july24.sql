-- Quick fix for July 24 MA assignments
-- Assign MAs to providers who actually work that day

-- Delete existing July 24 MA assignments (they're pointing to non-working providers)
DELETE FROM shifts 
WHERE medical_assistant_ids IS NOT NULL 
AND array_length(medical_assistant_ids, 1) > 0
AND provider_id IS NULL
AND start_date = '2025-07-24';

-- Create new MA assignments for July 24 that match actual working providers
INSERT INTO shifts (id, medical_assistant_ids, assigned_to_provider_id, clinic_type_id, start_date, end_date, start_time, end_time, is_vacation, notes, created_at, updated_at)
VALUES 
-- Ana Guerrero → Elizabeth Swaggerty @ Centro (Elizabeth works July 24)
(gen_random_uuid(), ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'::uuid], '97e08d3e-6d42-47a4-9fe1-853a01c5bde6'::uuid, 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid, '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'Ana Guerrero with Elizabeth Swaggerty @ Centro', NOW(), NOW()),

-- Yaniris Soto → Jim Knox @ Urgente (Jim works July 24)
(gen_random_uuid(), ARRAY['2946a856-5a23-408c-af54-3a6e2d314a71'::uuid], 'df2de625-08e1-474a-a48a-b92b9576f71e'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'Yaniris Soto with Jim Knox @ Urgente', NOW(), NOW()),

-- Lupita Ferreira → Ludjelie Manigat @ Urgente (Ludjelie works July 24)  
(gen_random_uuid(), ARRAY['cf5e7c66-d229-48bf-b8e5-ee21df8fa349'::uuid], '2437699b-6a55-4803-98e5-ac5c0a3d82a8'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'Lupita Ferreira with Ludjelie Manigat @ Urgente', NOW(), NOW()),

-- Kenneth Acevedo → Philip Sutherland @ Urgente (Philip works July 24)
(gen_random_uuid(), ARRAY['9c70c00c-8d5d-405d-b06a-32bf0d36f944'::uuid], '11111111-1111-1111-1111-111111111111'::uuid, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'::uuid, '2025-07-24', '2025-07-24', '08:00', '17:00', false, 'Kenneth Acevedo with Philip Sutherland @ Urgente', NOW(), NOW());

-- Verify the fix - all should show "MATCH - BADGE WILL SHOW"
SELECT 
    'July 24 MA Assignment Verification' as check_type,
    ma.name as ma_name,
    p.name as assigned_provider,
    ct.name as clinic,
    mas.start_time,
    CASE 
        WHEN ps.id IS NOT NULL THEN 'MATCH - BADGE WILL SHOW ✅'
        ELSE 'NO MATCH - BADGE WONT SHOW ❌'
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