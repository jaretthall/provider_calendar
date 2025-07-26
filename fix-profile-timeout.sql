-- Fix Profile Query Timeout Issues
-- This script optimizes the user_profiles table and ensures proper access

-- 1. Check current RLS policies on user_profiles
select 'Current RLS policies on user_profiles:' as status;
select 
    policyname,
    cmd,
    qual,
    with_check
from pg_policies 
where tablename = 'user_profiles'
order by policyname;

-- 2. Drop existing policies to recreate them properly
drop policy if exists "Allow users to view their own profile" on public.user_profiles;
drop policy if exists "Allow users to update their own profile" on public.user_profiles;
drop policy if exists "Allow authenticated users to view user_profiles" on public.user_profiles;
drop policy if exists "Users can view their own profile" on public.user_profiles;
drop policy if exists "Users can update their own profile" on public.user_profiles;

-- 3. Create optimized RLS policies
-- Allow users to see their own profile
create policy "Users can view own profile"
on public.user_profiles for select
using (auth.uid() = user_id);

-- Allow authenticated users to see all profiles (for user management)
create policy "Authenticated users can view all profiles"
on public.user_profiles for select
using (auth.role() = 'authenticated');

-- Allow users to update their own profile
create policy "Users can update own profile"
on public.user_profiles for update
using (auth.uid() = user_id);

-- Allow profile creation on signup
create policy "Enable insert for authenticated users only"
on public.user_profiles for insert
with check (auth.uid() = user_id);

-- 4. Create an index on user_id for faster lookups
drop index if exists idx_user_profiles_user_id;
create index idx_user_profiles_user_id on public.user_profiles(user_id);

-- 5. Analyze the table to update statistics
analyze public.user_profiles;

-- 6. Test the query that's timing out
select 'Testing profile query performance:' as status;
explain analyze
select * from public.user_profiles
where user_id = auth.uid()
limit 1;

-- 7. Grant necessary permissions
grant usage on schema public to authenticated;
grant all on public.user_profiles to authenticated;

-- 8. Create a function to get user profile with better performance
create or replace function get_user_profile(p_user_id uuid)
returns setof public.user_profiles
language sql
security definer
stable
as $$
    select * from public.user_profiles
    where user_id = p_user_id
    limit 1;
$$;

-- Grant execute permission on the function
grant execute on function get_user_profile(uuid) to authenticated;

select 'Profile optimization complete!' as message;