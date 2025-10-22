-- Check RLS status on shifts table
SELECT
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'shifts';

-- Check all policies on shifts table
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'shifts'
ORDER BY policyname;

-- Check if there are any policies that allow authenticated users to insert shifts
SELECT
    policyname,
    cmd,
    roles
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'shifts'
AND cmd = 'INSERT'
AND 'authenticated' = ANY(roles);