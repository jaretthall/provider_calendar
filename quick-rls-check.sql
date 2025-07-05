-- QUICK RLS DIAGNOSTIC - Run these ONE AT A TIME
-- Copy each query separately into Supabase SQL Editor

-- QUERY 1: Current RLS Policies
SELECT 
    tablename,
    policyname,
    cmd as operation,
    qual as using_condition,
    CASE 
        WHEN qual = 'true' THEN 'ALLOWS ALL ACCESS'
        WHEN qual LIKE '%auth.uid()%' THEN 'REQUIRES AUTHENTICATION'
        WHEN qual LIKE '%anon%' OR roles = '{anon}' THEN 'ANONYMOUS ACCESS'
        WHEN roles = '{authenticated}' THEN 'AUTHENTICATED ONLY'
        ELSE 'CUSTOM: ' || qual
    END as policy_type
FROM pg_policies 
WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts')
ORDER BY tablename, cmd;

-- QUERY 2: Anonymous Access Test
SELECT 'providers' as table_name, COUNT(*) as record_count FROM providers
UNION ALL
SELECT 'clinic_types' as table_name, COUNT(*) as record_count FROM clinic_types
UNION ALL
SELECT 'medical_assistants' as table_name, COUNT(*) as record_count FROM medical_assistants  
UNION ALL
SELECT 'shifts' as table_name, COUNT(*) as record_count FROM shifts;

-- QUERY 3: Current Auth Context
SELECT 
    current_user as database_user,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'role') 
        THEN (SELECT auth.role()::text) 
        ELSE 'auth.role() not available'
    END as auth_role,
    CASE 
        WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'uid') 
        THEN COALESCE((SELECT auth.uid()::text), 'NULL (anonymous)')
        ELSE 'auth.uid() not available'
    END as auth_uid;

-- QUERY 4: PS Shift Search
SELECT 
    s.id,
    p.name as provider_name,
    s.start_date,
    s.created_at,
    'PS SHIFT' as note
FROM shifts s
LEFT JOIN providers p ON s.provider_id = p.id
WHERE (p.name ILIKE '%philip%' OR p.name ILIKE '%ps%') 
   AND s.start_date = '2025-01-17';  -- Adjust date as needed 