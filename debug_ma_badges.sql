-- Debug MA badge display issues
-- Check if the data is correct and identify why badges aren't showing

-- 1. Check if we have MA shifts with provider assignments
SELECT 
    'MA Shifts with Provider Assignments' as check_type,
    COUNT(*) as count
FROM shifts 
WHERE medical_assistant_ids IS NOT NULL 
AND array_length(medical_assistant_ids, 1) > 0 
AND assigned_to_provider_id IS NOT NULL 
AND provider_id IS NULL;

-- 2. Check specific MA assignments for current dates
SELECT 
    'Current MA Assignments' as check_type,
    ma.name as ma_name,
    p.name as provider_name,
    ct.name as clinic_name,
    s.start_date,
    s.start_time,
    s.end_time,
    s.assigned_to_provider_id,
    s.provider_id,
    s.medical_assistant_ids
FROM shifts s
JOIN medical_assistants ma ON ma.id = ANY(s.medical_assistant_ids)
LEFT JOIN providers p ON p.id = s.assigned_to_provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.medical_assistant_ids IS NOT NULL 
AND array_length(s.medical_assistant_ids, 1) > 0 
AND s.provider_id IS NULL
AND s.start_date >= '2025-07-23'
AND s.start_date <= '2025-07-30'
ORDER BY s.start_date, ma.name;

-- 3. Check if corresponding provider shifts exist on the same dates
SELECT 
    'Provider Shifts for Same Dates' as check_type,
    p.name as provider_name,
    ps.start_date,
    ps.start_time,
    ps.end_time,
    ct.name as clinic_name,
    ps.provider_id,
    ps.medical_assistant_ids as provider_shift_ma_ids
FROM shifts ps
JOIN providers p ON p.id = ps.provider_id
LEFT JOIN clinic_types ct ON ct.id = ps.clinic_type_id
WHERE ps.provider_id IS NOT NULL
AND ps.start_date >= '2025-07-23'
AND ps.start_date <= '2025-07-30'
AND ps.provider_id IN (
    SELECT DISTINCT assigned_to_provider_id 
    FROM shifts 
    WHERE medical_assistant_ids IS NOT NULL 
    AND array_length(medical_assistant_ids, 1) > 0 
    AND assigned_to_provider_id IS NOT NULL
    AND start_date >= '2025-07-23'
    AND start_date <= '2025-07-30'
)
ORDER BY ps.start_date, p.name;

-- 4. Check for exact date/provider matches between MA shifts and provider shifts
SELECT 
    'Exact Matches' as check_type,
    ma.name as ma_name,
    p.name as provider_name,
    mas.start_date as ma_date,
    mas.clinic_type_id as ma_clinic,
    ps.start_date as provider_date,
    ps.clinic_type_id as provider_clinic,
    CASE 
        WHEN ps.id IS NOT NULL THEN 'MATCH FOUND'
        ELSE 'NO MATCHING PROVIDER SHIFT'
    END as match_status
FROM shifts mas
JOIN medical_assistants ma ON ma.id = ANY(mas.medical_assistant_ids)
JOIN providers p ON p.id = mas.assigned_to_provider_id
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

-- 5. Check the getMAsAssignedToProviderOnDate logic manually
-- For Joy Elizabeth Ferro on July 24, 2025 (should show Ana Guerrero)
SELECT 
    'Joy Elizabeth Ferro July 24 Check' as check_type,
    ma.name as ma_name,
    s.start_date,
    s.assigned_to_provider_id,
    s.medical_assistant_ids,
    s.provider_id
FROM shifts s
JOIN medical_assistants ma ON ma.id = ANY(s.medical_assistant_ids)
WHERE s.assigned_to_provider_id = '71cd1d47-7d3d-4975-8bb3-6f5072f99c55'  -- Joy Elizabeth Ferro
AND s.start_date = '2025-07-24'
AND s.medical_assistant_ids IS NOT NULL 
AND array_length(s.medical_assistant_ids, 1) > 0
AND s.provider_id IS NULL;

-- 6. Check if provider shift exists for Joy Elizabeth Ferro on July 24
SELECT 
    'Joy Elizabeth Ferro Provider Shift July 24' as check_type,
    p.name as provider_name,
    s.start_date,
    s.start_time,
    s.end_time,
    ct.name as clinic_name
FROM shifts s
JOIN providers p ON p.id = s.provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.provider_id = '71cd1d47-7d3d-4975-8bb3-6f5072f99c55'  -- Joy Elizabeth Ferro
AND s.start_date = '2025-07-24';