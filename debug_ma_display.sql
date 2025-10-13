-- Debug MA badge display issues
-- This script checks if the provider shifts exist for the dates where MAs are assigned

-- 1. Check if provider shifts exist for the same dates/providers where MAs are assigned
SELECT 
    'Provider Shifts Check' as check_type,
    p.name as provider_name,
    ps.start_date as provider_shift_date,
    ps.start_time as provider_shift_time,
    ps.end_time as provider_shift_end,
    ct.name as provider_clinic,
    COUNT(mas.id) as ma_assignments_on_same_date
FROM shifts ps
JOIN providers p ON p.id = ps.provider_id
LEFT JOIN clinic_types ct ON ct.id = ps.clinic_type_id
LEFT JOIN shifts mas ON (
    mas.assigned_to_provider_id = ps.provider_id 
    AND mas.start_date = ps.start_date
    AND mas.medical_assistant_ids IS NOT NULL 
    AND array_length(mas.medical_assistant_ids, 1) > 0
)
WHERE ps.provider_id IN (
    '71cd1d47-7d3d-4975-8bb3-6f5072f99c55', -- Joy Elizabeth Ferro
    'df2de625-08e1-474a-a48a-b92b9576f71e'  -- Jim Knox
)
AND ps.start_date IN ('2025-07-24', '2025-07-25')
GROUP BY p.name, ps.start_date, ps.start_time, ps.end_time, ct.name
ORDER BY ps.start_date, p.name;

-- 2. Check for exact matches between MA shifts and provider shifts
SELECT 
    'Exact Matches' as check_type,
    ma.name as ma_name,
    p.name as provider_name,
    mas.start_date as ma_shift_date,
    mas.start_time as ma_shift_time,
    ps.start_date as provider_shift_date,
    ps.start_time as provider_shift_time,
    CASE 
        WHEN ps.id IS NOT NULL THEN 'PROVIDER SHIFT EXISTS'
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
AND mas.start_date IN ('2025-07-24', '2025-07-25')
ORDER BY mas.start_date, ma.name;

-- 3. Check if there are any provider shifts at all for those specific providers on those dates
SELECT 
    'All Provider Shifts' as check_type,
    p.name as provider_name,
    s.start_date,
    s.start_time,
    s.end_time,
    ct.name as clinic_name,
    s.is_vacation
FROM shifts s
JOIN providers p ON p.id = s.provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.provider_id IN (
    '71cd1d47-7d3d-4975-8bb3-6f5072f99c55', -- Joy Elizabeth Ferro
    'df2de625-08e1-474a-a48a-b92b9576f71e'  -- Jim Knox
)
AND s.start_date >= '2025-07-20'
AND s.start_date <= '2025-07-30'
ORDER BY s.start_date, p.name;

-- 4. Show the MA assignments again for reference
SELECT 
    'MA Assignments Reference' as check_type,
    ma.name as ma_name,
    p.name as provider_name,
    ct.name as clinic_name,
    s.start_date,
    s.start_time,
    s.end_time
FROM shifts s
JOIN medical_assistants ma ON ma.id = ANY(s.medical_assistant_ids)
LEFT JOIN providers p ON p.id = s.assigned_to_provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.medical_assistant_ids IS NOT NULL 
AND array_length(s.medical_assistant_ids, 1) > 0 
AND s.provider_id IS NULL
AND s.start_date IN ('2025-07-24', '2025-07-25')
AND ma.name = 'Ana Guerrero'
ORDER BY s.start_date;