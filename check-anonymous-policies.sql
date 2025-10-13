-- Check current RLS policies for anonymous access
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts')
ORDER BY tablename, policyname;

-- Check if RLS is enabled on tables
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts');

-- Test anonymous access to each table
SELECT 'providers' as table_name, count(*) as record_count FROM providers;
SELECT 'clinic_types' as table_name, count(*) as record_count FROM clinic_types;
SELECT 'medical_assistants' as table_name, count(*) as record_count FROM medical_assistants;
SELECT 'shifts' as table_name, count(*) as record_count FROM shifts; 