-- Check if the assigned_to_provider_id column exists in the shifts table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'shifts' 
AND column_name = 'assigned_to_provider_id';

-- Check the current structure of the shifts table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'shifts'
ORDER BY ordinal_position;

-- Check if there are any MA shifts with assigned_to_provider_id set
SELECT COUNT(*) as "MA shifts with provider assignments"
FROM shifts 
WHERE medical_assistant_ids IS NOT NULL 
AND array_length(medical_assistant_ids, 1) > 0 
AND assigned_to_provider_id IS NOT NULL;

-- Check specific example of MA assignments
SELECT 
    s.id,
    s.start_date,
    s.start_time,
    s.end_time,
    s.medical_assistant_ids,
    s.assigned_to_provider_id,
    p.name as provider_name,
    ma.name as ma_name
FROM shifts s
LEFT JOIN providers p ON p.id = s.assigned_to_provider_id
LEFT JOIN medical_assistants ma ON ma.id = ANY(s.medical_assistant_ids)
WHERE s.medical_assistant_ids IS NOT NULL 
AND array_length(s.medical_assistant_ids, 1) > 0 
AND s.assigned_to_provider_id IS NOT NULL
LIMIT 10;