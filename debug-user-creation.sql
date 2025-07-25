-- Debug user creation issues
-- Check what users exist in auth vs profiles

-- Show all users in auth.users (this requires elevated permissions)
-- If this fails, it means we can't see auth users with current permissions
SELECT 
    'AUTH USERS:' as source,
    id,
    email,
    created_at,
    email_confirmed_at,
    last_sign_in_at
FROM auth.users 
ORDER BY created_at DESC;

-- Show all user profiles 
SELECT 
    'USER PROFILES:' as source,
    id,
    email,
    full_name,
    role,
    is_active,
    created_at
FROM user_profiles 
ORDER BY created_at DESC;

-- Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    action_statement,
    'TRIGGER STATUS' as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check if the function exists
SELECT 
    routine_name,
    routine_type,
    'FUNCTION STATUS' as status
FROM information_schema.routines 
WHERE routine_name = 'handle_new_user';

-- Test the trigger function directly (if it exists)
-- This will show us if the function works
SELECT 'Testing function...' as test_status;