-- Fix Ana Guerrero's assignment for July 31st
-- Change from Joy Elizabeth Ferro (who doesn't work) to Jim Knox (who does work @ Urgente)

UPDATE shifts 
SET assigned_to_provider_id = 'df2de625-08e1-474a-a48a-b92b9576f71e'  -- Jim Knox
WHERE medical_assistant_ids @> ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'::uuid]  -- Ana Guerrero
AND start_date = '2025-07-31'
AND assigned_to_provider_id = '71cd1d47-7d3d-4975-8bb3-6f5072f99c55'  -- Joy Elizabeth Ferro (old)
AND provider_id IS NULL;

-- Verify the fix
SELECT 
    'Ana Guerrero July 31st Fix Verification' as check_type,
    ma.name as ma_name,
    p.name as assigned_provider,
    ct.name as clinic,
    s.start_date,
    CASE 
        WHEN ps.id IS NOT NULL THEN 'MATCH - BADGE WILL SHOW ✅'
        ELSE 'NO MATCH - BADGE WONT SHOW ❌'
    END as status
FROM shifts s
JOIN medical_assistants ma ON ma.id = ANY(s.medical_assistant_ids)
JOIN providers p ON p.id = s.assigned_to_provider_id
LEFT JOIN clinic_types ct ON ct.id = s.clinic_type_id
LEFT JOIN shifts ps ON (
    ps.provider_id = s.assigned_to_provider_id 
    AND ps.start_date = s.start_date
    AND ps.clinic_type_id = s.clinic_type_id
)
WHERE s.medical_assistant_ids @> ARRAY['0ad107d1-ba52-4e86-8d07-ec9dea9485b4'::uuid]  -- Ana Guerrero
AND s.start_date = '2025-07-31'
AND s.provider_id IS NULL;