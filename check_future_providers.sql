-- Check what provider shifts actually exist for July 29 onward
SELECT 
    'Available Provider Shifts July 29+' as info,
    s.start_date,
    p.name as provider_name,
    ct.name as clinic_name,
    s.start_time,
    s.end_time
FROM shifts s
JOIN providers p ON p.id = s.provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.start_date >= '2025-07-29'
AND s.start_date <= '2025-08-05'
ORDER BY s.start_date, ct.name, p.name;

-- Check specifically for July 31st providers (where Ana Guerrero is currently misassigned)
SELECT 
    'July 31st Working Providers' as july31_check,
    p.name as provider_name,
    ct.name as clinic_name,
    s.start_time,
    s.provider_id,
    s.clinic_type_id
FROM shifts s
JOIN providers p ON p.id = s.provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.start_date = '2025-07-31'
ORDER BY ct.name, p.name;