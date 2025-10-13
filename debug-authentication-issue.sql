-- Debug Authentication Issues
-- Run this script to diagnose authentication problems

-- 1. Check if auth schema exists and is accessible
select 'Checking auth schema...' as step;

-- Check if we can access auth users table
select 
    count(*) as total_auth_users,
    count(case when email_confirmed_at is not null then 1 end) as confirmed_users,
    count(case when email_confirmed_at is null then 1 end) as unconfirmed_users
from auth.users;

-- 2. Check user_profiles table structure
select 'Checking user_profiles table...' as step;

-- Check if user_profiles table exists and its structure
select 
    column_name,
    data_type,
    is_nullable,
    column_default
from information_schema.columns 
where table_name = 'user_profiles' 
  and table_schema = 'public'
order by ordinal_position;

-- 3. Check current user_profiles data
select 'Checking user_profiles data...' as step;

select 
    id,
    user_id,
    email,
    role,
    first_name,
    last_name,
    is_active,
    created_at
from public.user_profiles
order by created_at desc
limit 10;

-- 4. Check auth.users data
select 'Checking auth.users data...' as step;

select 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at,
    last_sign_in_at
from auth.users
order by created_at desc
limit 10;

-- 5. Check for orphaned users (users in auth.users but not in user_profiles)
select 'Checking for orphaned users...' as step;

select 
    au.id as auth_user_id,
    au.email,
    au.email_confirmed_at,
    up.id as profile_id,
    case 
        when up.id is null then '❌ Missing Profile'
        else '✅ Has Profile'
    end as profile_status
from auth.users au
left join public.user_profiles up on au.id = up.user_id
order by au.created_at desc;

-- 6. Check RLS policies on user_profiles
select 'Checking RLS policies...' as step;

select 
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
from pg_policies 
where tablename = 'user_profiles'
order by policyname;

-- 7. Test profile creation function if it exists
select 'Checking for profile creation triggers...' as step;

select 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
from information_schema.triggers
where event_object_table = 'users'
  and event_object_schema = 'auth';

-- 8. Manual test: create a test user profile if none exist
-- UNCOMMENT AND MODIFY THE LINES BELOW TO CREATE A TEST USER
-- (Replace 'your-email@example.com' with your actual email)

/*
-- First, get the auth user ID for your email
select id, email from auth.users where email = 'your-email@example.com';

-- Then create a profile (replace the user_id with the ID from above)
INSERT INTO public.user_profiles (user_id, email, role, first_name, last_name, is_active)
VALUES (
    'PUT_YOUR_AUTH_USER_ID_HERE',
    'your-email@example.com',
    'admin',
    'Your',
    'Name',
    true
);
*/

select 'Authentication debug complete!' as message;