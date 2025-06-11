-- Debug User Profiles Table Issues
-- Run this in your Supabase SQL Editor to diagnose the problem

-- 1. Check if user_profiles table exists
SELECT table_name, table_schema 
FROM information_schema.tables 
WHERE table_name = 'user_profiles';

-- 2. Check table structure if it exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- 3. Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE tablename = 'user_profiles';

-- 4. Check if your user exists in auth.users
SELECT id, email, created_at, email_confirmed_at
FROM auth.users 
ORDER BY created_at DESC;

-- 5. Check if user_profiles records exist
SELECT id, email, role, status, created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- 6. Check for any specific user profile (replace with your user ID)
-- SELECT * FROM user_profiles WHERE id = 'e82e9d4a-dce3-46ab-bc9f-6c1ceecba299'; 