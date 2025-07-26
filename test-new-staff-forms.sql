-- Test New Staff Forms
-- This script verifies that the new staff tables work properly

-- 1. Check if tables exist
select 'Checking if new staff tables exist...' as status;

select 
    table_name,
    case when table_name in ('front_staff', 'billing', 'behavioral_health') 
        then '✅ Table exists' 
        else '❌ Table missing' 
    end as status
from information_schema.tables 
where table_schema = 'public' 
  and table_name in ('front_staff', 'billing', 'behavioral_health')
order by table_name;

-- 2. Test inserting a sample record (with proper user_id)
-- Replace 'YOUR_USER_ID' with your actual auth.uid()

-- Get your user ID first
select 'Your user ID:' as info, auth.uid() as user_id;

-- Test front_staff insertion
insert into public.front_staff (name, color, user_id)
values ('Test Front Staff', 'bg-blue-500', auth.uid())
on conflict do nothing;

-- Test billing insertion  
insert into public.billing (name, color, user_id)
values ('Test Billing Staff', 'bg-green-500', auth.uid())
on conflict do nothing;

-- Test behavioral_health insertion
insert into public.behavioral_health (name, color, user_id)
values ('Test BH Staff', 'bg-purple-500', auth.uid())
on conflict do nothing;

-- 3. Verify the insertions worked
select 'Front Staff Records:' as category, count(*) as count from public.front_staff;
select 'Billing Records:' as category, count(*) as count from public.billing;
select 'Behavioral Health Records:' as category, count(*) as count from public.behavioral_health;

-- 4. Show the test records
select 'Test Records Created:' as status;
select 'front_staff' as table_name, name, color from public.front_staff where name like 'Test%'
union all
select 'billing' as table_name, name, color from public.billing where name like 'Test%'
union all
select 'behavioral_health' as table_name, name, color from public.behavioral_health where name like 'Test%';

-- 5. Clean up test records
delete from public.front_staff where name = 'Test Front Staff';
delete from public.billing where name = 'Test Billing Staff';
delete from public.behavioral_health where name = 'Test BH Staff';

select 'Test complete! Forms should work now.' as message;