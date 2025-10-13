-- Quick check for MA-provider assignment data integrity
-- Run this to understand why MA badges aren't showing

-- 1. Check if we have recent MA shifts with provider assignments
SELECT 
    'Recent MA assignments' as check_type,
    COUNT(*) as count,
    array_agg(DISTINCT assigned_to_provider_id) as provider_ids
FROM shifts 
WHERE medical_assistant_ids IS NOT NULL 
AND array_length(medical_assistant_ids, 1) > 0 
AND assigned_to_provider_id IS NOT NULL 
AND provider_id IS NULL
AND start_date >= CURRENT_DATE - INTERVAL '7 days';

-- 2. Check specific case from logs (Joy Elizabeth Ferro on July 24)
SELECT 
    'Joy Ferro July 24 MA assignments' as check_type,
    ma.name as ma_name,
    s.start_date,
    s.medical_assistant_ids,
    s.assigned_to_provider_id
FROM shifts s
JOIN medical_assistants ma ON ma.id = ANY(s.medical_assistant_ids)
WHERE s.assigned_to_provider_id = '71cd1d47-7d3d-4975-8bb3-6f5072f99c55'  -- Joy Elizabeth Ferro
AND s.start_date = '2025-07-24'
AND s.medical_assistant_ids IS NOT NULL 
AND s.provider_id IS NULL;

-- 3. Check if provider shift exists for comparison
SELECT 
    'Joy Ferro July 24 provider shift' as check_type,
    p.name as provider_name,
    s.start_date,
    s.provider_id,
    s.clinic_type_id
FROM shifts s
JOIN providers p ON p.id = s.provider_id
WHERE s.provider_id = '71cd1d47-7d3d-4975-8bb3-6f5072f99c55'  -- Joy Elizabeth Ferro
AND s.start_date = '2025-07-24';