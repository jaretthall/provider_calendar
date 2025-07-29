-- Check if Joy Elizabeth Ferro has a provider shift on July 24, 2025
-- This is crucial - MA badges only show if there's a provider shift to attach them to

SELECT 
    'Joy Elizabeth Ferro Provider Shift July 24' as check_type,
    s.id,
    s.provider_id,
    s.start_date,
    s.start_time,
    s.end_time,
    s.clinic_type_id,
    ct.name as clinic_name,
    p.name as provider_name
FROM shifts s
JOIN providers p ON p.id = s.provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.provider_id = '71cd1d47-7d3d-4975-8bb3-6f5072f99c55'  -- Joy Elizabeth Ferro
AND s.start_date = '2025-07-24';

-- Also check what provider shifts exist around that date
SELECT 
    'All Joy Elizabeth Ferro Provider Shifts July 23-25' as check_type,
    s.id,
    s.provider_id,
    s.start_date,
    s.start_time,
    s.end_time,
    s.clinic_type_id,
    ct.name as clinic_name
FROM shifts s
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.provider_id = '71cd1d47-7d3d-4975-8bb3-6f5072f99c55'  -- Joy Elizabeth Ferro
AND s.start_date >= '2025-07-23'
AND s.start_date <= '2025-07-25'
ORDER BY s.start_date;

-- Check all provider shifts for July 24 to see who's working
SELECT 
    'All Provider Shifts July 24' as check_type,
    p.name as provider_name,
    s.start_time,
    s.end_time,
    ct.name as clinic_name
FROM shifts s
JOIN providers p ON p.id = s.provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.start_date = '2025-07-24'
ORDER BY s.start_time, p.name;