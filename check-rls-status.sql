-- Check if RLS is enabled on all tables
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts', 'user_settings', 'user_profiles')
ORDER BY tablename;

-- Check all active RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts', 'user_settings', 'user_profiles')
ORDER BY tablename, policyname;