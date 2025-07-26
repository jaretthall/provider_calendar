-- Verify New Staff Tables Creation
-- Run this script after adding the new staff tables to verify everything was created correctly

-- Check if new tables exist
select 
    case when exists (select 1 from information_schema.tables where table_name = 'front_staff' and table_schema = 'public')
        then '✅ front_staff table exists'
        else '❌ front_staff table missing'
    end as front_staff_status,
    
    case when exists (select 1 from information_schema.tables where table_name = 'billing' and table_schema = 'public')
        then '✅ billing table exists'
        else '❌ billing table missing'
    end as billing_status,
    
    case when exists (select 1 from information_schema.tables where table_name = 'behavioral_health' and table_schema = 'public')
        then '✅ behavioral_health table exists'
        else '❌ behavioral_health table missing'
    end as behavioral_health_status;

-- Check if new columns were added to shifts table
select 
    case when exists (select 1 from information_schema.columns where table_name = 'shifts' and column_name = 'front_staff_ids' and table_schema = 'public')
        then '✅ front_staff_ids column exists in shifts'
        else '❌ front_staff_ids column missing in shifts'
    end as front_staff_column_status,
    
    case when exists (select 1 from information_schema.columns where table_name = 'shifts' and column_name = 'billing_ids' and table_schema = 'public')
        then '✅ billing_ids column exists in shifts'
        else '❌ billing_ids column missing in shifts'
    end as billing_column_status,
    
    case when exists (select 1 from information_schema.columns where table_name = 'shifts' and column_name = 'behavioral_health_ids' and table_schema = 'public')
        then '✅ behavioral_health_ids column exists in shifts'
        else '❌ behavioral_health_ids column missing in shifts'
    end as behavioral_health_column_status;

-- Check table structure for one of the new tables (front_staff as example)
select 
    column_name,
    data_type,
    is_nullable,
    column_default
from information_schema.columns 
where table_name = 'front_staff' 
  and table_schema = 'public'
order by ordinal_position;

-- Check RLS policies
select 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
from pg_policies 
where tablename in ('front_staff', 'billing', 'behavioral_health')
order by tablename, policyname;

-- Test basic operations (if you have permission)
-- Uncomment these lines to test if the tables work correctly:

-- INSERT INTO public.front_staff (name, color, user_id) 
-- VALUES ('Test Front Staff', 'bg-blue-500', auth.uid());

-- SELECT COUNT(*) as front_staff_count FROM public.front_staff;

-- DELETE FROM public.front_staff WHERE name = 'Test Front Staff';

select 'Verification complete! Check the results above.' as message;