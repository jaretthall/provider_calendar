-- Test to identify the MA badge display issue
-- Check field naming and data structure

-- 1. Check the actual column name in the database
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'shifts' 
AND column_name LIKE '%provider%'
ORDER BY column_name;

-- 2. Check what the frontend would receive (sample data)
-- This simulates what the API returns to the frontend
SELECT 
    id,
    provider_id as "providerId",
    medical_assistant_ids as "medicalAssistantIds", 
    assigned_to_provider_id as "assignedToProviderId",
    start_date as "startDate",
    clinic_type_id as "clinicTypeId"
FROM shifts 
WHERE medical_assistant_ids IS NOT NULL 
AND array_length(medical_assistant_ids, 1) > 0 
AND assigned_to_provider_id IS NOT NULL
AND start_date = '2025-07-24'
LIMIT 5;

-- 3. Check if we need to ensure the API properly maps snake_case to camelCase
-- Show raw database data
SELECT 
    id,
    provider_id,
    medical_assistant_ids, 
    assigned_to_provider_id,
    start_date,
    clinic_type_id
FROM shifts 
WHERE start_date = '2025-07-24'
AND (
    (medical_assistant_ids IS NOT NULL AND array_length(medical_assistant_ids, 1) > 0)
    OR provider_id IS NOT NULL
)
ORDER BY provider_id NULLS LAST;

-- 4. Test the exact scenario: Ana Guerrero assigned to Joy Elizabeth Ferro on July 24
SELECT 
    'Ana Guerrero -> Joy Elizabeth Ferro July 24' as scenario,
    s.id,
    s.provider_id,
    s.medical_assistant_ids,
    s.assigned_to_provider_id,
    ma.name as ma_name
FROM shifts s
LEFT JOIN medical_assistants ma ON ma.id = ANY(s.medical_assistant_ids)
WHERE s.start_date = '2025-07-24'
AND (
    s.assigned_to_provider_id = '71cd1d47-7d3d-4975-8bb3-6f5072f99c55'  -- Joy's MA assignment
    OR s.provider_id = '71cd1d47-7d3d-4975-8bb3-6f5072f99c55'  -- Joy's provider shift
);