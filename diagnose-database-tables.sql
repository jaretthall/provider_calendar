-- Diagnostic script to check database structure and data

-- 1. Check what tables exist in the public schema
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. Check row counts for all tables that might exist
SELECT 
    schemaname,
    relname as table_name,
    n_tup_ins as "Total Inserts",
    n_tup_upd as "Total Updates", 
    n_tup_del as "Total Deletes",
    n_live_tup as "Live Rows"
FROM pg_stat_user_tables 
WHERE schemaname = 'public'
ORDER BY relname;

-- 3. Try different possible table names
SELECT 'Table existence check' as info;

-- Check if tables exist with different names
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'providers') as providers_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'clinic_types') as clinic_types_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'medical_assistants') as medical_assistants_exists;
SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'shifts') as shifts_exists;

-- 4. If the tables exist, check if they have any data at all
DO $$
DECLARE
    rec RECORD;
    sql_text TEXT;
    result_count INTEGER;
BEGIN
    FOR rec IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('providers', 'clinic_types', 'medical_assistants', 'shifts')
    LOOP
        sql_text := 'SELECT COUNT(*) FROM ' || rec.table_name;
        EXECUTE sql_text INTO result_count;
        RAISE NOTICE 'Table %: % rows', rec.table_name, result_count;
    END LOOP;
END $$; 