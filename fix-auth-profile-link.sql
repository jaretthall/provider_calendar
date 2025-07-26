-- Fix Authentication Profile Link
-- This script ensures auth.users are properly linked to user_profiles

-- 1. Show current auth users and their profile status
select 
    au.id as auth_user_id,
    au.email,
    au.email_confirmed_at,
    up.id as profile_id,
    up.user_id as profile_user_id,
    case 
        when up.id is null then '❌ Missing Profile'
        when up.user_id != au.id then '⚠️ Mismatched IDs'
        else '✅ Properly Linked'
    end as status
from auth.users au
left join public.user_profiles up on au.id = up.user_id
order by au.created_at desc;

-- 2. Create missing profiles for existing auth users
insert into public.user_profiles (user_id, email, role, first_name, last_name, is_active)
select 
    au.id as user_id,
    au.email,
    'admin'::user_role, -- Make them admin by default
    coalesce(au.raw_user_meta_data->>'first_name', split_part(au.email, '@', 1)) as first_name,
    coalesce(au.raw_user_meta_data->>'last_name', '') as last_name,
    true as is_active
from auth.users au
left join public.user_profiles up on au.id = up.user_id
where up.id is null;

-- 3. Verify the fix
select 
    'After fix:' as status,
    count(*) as total_auth_users,
    count(up.id) as users_with_profiles
from auth.users au
left join public.user_profiles up on au.id = up.user_id;

-- 4. Show the updated profiles
select * from public.user_profiles order by created_at desc;