-- Fix MA assignments for current and future dates (July 29 onward)
-- Focus on dates that matter for current scheduling

-- First, check what provider shifts exist from July 29 onward
SELECT 
    'Provider Shifts July 29 Onward' as info,
    s.start_date,
    p.name as provider_name,
    ct.name as clinic_name,
    s.start_time,
    s.end_time,
    s.provider_id,
    s.clinic_type_id
FROM shifts s
JOIN providers p ON p.id = s.provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
WHERE s.start_date >= '2025-07-29'
AND s.start_date <= '2025-08-05'  -- Next week
ORDER BY s.start_date, ct.name, p.name;

-- Check current MA assignments for these dates
SELECT 
    'Current MA Assignments July 29+' as current_state,
    ma.name as ma_name,
    p.name as assigned_provider,
    ct.name as clinic,
    s.start_date,
    CASE 
        WHEN ps.id IS NOT NULL THEN 'PROVIDER SHIFT EXISTS ✅'
        ELSE 'NO PROVIDER SHIFT ❌'
    END as status
FROM shifts s
JOIN medical_assistants ma ON ma.id = ANY(s.medical_assistant_ids)
LEFT JOIN providers p ON p.id = s.assigned_to_provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
LEFT JOIN shifts ps ON (
    ps.provider_id = s.assigned_to_provider_id 
    AND ps.start_date = s.start_date
    AND ps.clinic_type_id = s.clinic_type_id
)
WHERE s.medical_assistant_ids IS NOT NULL 
AND array_length(s.medical_assistant_ids, 1) > 0
AND s.provider_id IS NULL
AND s.start_date >= '2025-07-29'
ORDER BY s.start_date, ma.name;

-- Clean up any old MA assignments for July 29+ that point to non-working providers
DELETE FROM shifts 
WHERE medical_assistant_ids IS NOT NULL 
AND array_length(medical_assistant_ids, 1) > 0
AND provider_id IS NULL
AND start_date >= '2025-07-29'
AND assigned_to_provider_id NOT IN (
    -- Only keep assignments to providers who actually have shifts on those dates
    SELECT DISTINCT ps.provider_id
    FROM shifts ps
    WHERE ps.provider_id = shifts.assigned_to_provider_id
    AND ps.start_date = shifts.start_date
    AND ps.clinic_type_id = shifts.clinic_type_id
);