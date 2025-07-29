-- Check what the original MA assignments were supposed to be
-- Based on the JSON backup data we extracted earlier

-- Let's see what MA assignments we can reconstruct from the original data
-- First, let's check if we have any historical MA assignments in existing provider shifts

SELECT 
    'Historical MA Assignments in Provider Shifts' as data_source,
    p.name as provider_name,
    s.start_date,
    ct.name as clinic_name,
    s.medical_assistant_ids,
    array_length(s.medical_assistant_ids, 1) as ma_count
FROM shifts s
JOIN providers p ON p.id = s.provider_id  
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.medical_assistant_ids IS NOT NULL 
AND array_length(s.medical_assistant_ids, 1) > 0
AND s.start_date >= '2025-07-20'
AND s.start_date <= '2025-07-30'
ORDER BY s.start_date, p.name;

-- Check for any pattern or logic we can follow
-- Let's see what the current assignments look like after our fix
SELECT 
    'Current Fixed Assignments' as current_state,
    ma.name as ma_name,
    p.name as provider_name,
    ct.name as clinic_name,
    s.start_date
FROM shifts s
JOIN medical_assistants ma ON ma.id = ANY(s.medical_assistant_ids)
JOIN providers p ON p.id = s.assigned_to_provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.medical_assistant_ids IS NOT NULL 
AND array_length(s.medical_assistant_ids, 1) > 0
AND s.provider_id IS NULL
AND s.start_date = '2025-07-24'
ORDER BY ma.name;