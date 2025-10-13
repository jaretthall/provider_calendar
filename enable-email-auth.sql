-- SQL to check and enable email authentication
-- Run this in Supabase SQL Editor to see current auth configuration

-- Check current auth configuration
SELECT 
    'Current Auth Config:' as status,
    raw_app_meta_data,
    raw_user_meta_data
FROM auth.users
LIMIT 1;

-- Show auth provider configuration
-- Note: This requires admin access and might not work with anon key
SELECT 
    'Auth providers need to be configured in Supabase Dashboard' as note,
    'Go to Authentication → Providers → Enable Email' as action;

-- Alternative: Update auth configuration via SQL (if you have admin access)
-- This typically needs to be done through the Supabase Dashboard UI
SELECT 'Email authentication must be enabled in Supabase Dashboard → Authentication → Providers' as instruction;