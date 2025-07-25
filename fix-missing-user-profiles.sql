-- Fix missing user profiles for existing auth users
-- This manually creates profiles for users who don't have them

-- Insert user profiles for any auth users who don't have profiles yet
INSERT INTO user_profiles (id, email, full_name, first_name, last_name, role, is_active, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    COALESCE(u.raw_user_meta_data->>'full_name', ''),
    COALESCE(u.raw_user_meta_data->>'first_name', ''),
    COALESCE(u.raw_user_meta_data->>'last_name', ''),
    'admin' as role, -- Set all users as admin for now
    true as is_active,
    u.created_at,
    now() as updated_at
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.id
WHERE p.id IS NULL -- Only create profiles for users who don't have them
AND u.email_confirmed_at IS NOT NULL; -- Only for confirmed users

-- Show the result
SELECT 'User profiles created for:' as status, count(*) as count
FROM user_profiles;

-- Show all current user profiles
SELECT 
    id,
    email,
    role,
    is_active,
    created_at,
    'Current user profile' as status
FROM user_profiles
ORDER BY created_at;