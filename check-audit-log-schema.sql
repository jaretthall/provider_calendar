-- Check the structure of the existing audit_log table
-- Run this in your Supabase SQL editor to see what columns exist

SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'audit_log'
ORDER BY ordinal_position;

-- Also check if there are any existing records
SELECT
    'Sample audit_log records (if any):' as info;

SELECT *
FROM public.audit_log
LIMIT 5;