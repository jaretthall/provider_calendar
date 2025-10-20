-- CORRECTED: Create admin and user profiles + use existing audit logging system
-- Run this in your Supabase SQL editor

-- 1. First, check if there are any authenticated users
SELECT
    'Existing authenticated users:' as info,
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Check existing audit_log table structure (using existing table, not creating new one)
SELECT
    'Existing audit_log table structure:' as info;

-- Note: Using existing public.audit_log table instead of creating public.audit_logs

-- 3. Create admin user profile (replace YOUR_ADMIN_USER_ID and email)
-- Look at the authenticated users above and copy your user ID
INSERT INTO public.user_profiles (
    id,
    user_id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    'YOUR_ADMIN_USER_ID_HERE', -- Replace with your auth.users ID from step 1
    'your-admin-email@example.com', -- Replace with your actual email
    'Admin',
    'User',
    'admin',
    true,
    NOW(),
    NOW()
) ON CONFLICT (user_id) DO UPDATE SET
    role = 'admin',
    is_active = true,
    updated_at = NOW();

-- 4. Add unique constraint on email for future upserts (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'user_profiles_email_key'
    ) THEN
        ALTER TABLE public.user_profiles
        ADD CONSTRAINT user_profiles_email_key UNIQUE (lower(email));
    END IF;
END $$;

-- 5. Create Aida's user profile
INSERT INTO public.user_profiles (
    id,
    user_id,
    email,
    first_name,
    last_name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),
    gen_random_uuid(), -- Temporary UUID - will be updated when Aida signs up
    'aida@clinicamedicos.org', -- lowercase for consistency
    'Aida',
    '',
    'admin', -- or 'scheduler' or 'view_only' based on permissions needed
    true,
    NOW(),
    NOW()
) ON CONFLICT ON CONSTRAINT user_profiles_email_key DO UPDATE SET
    is_active = true,
    updated_at = NOW();

-- 6. Create a function to log user actions using existing audit_log table
CREATE OR REPLACE FUNCTION public.log_user_action(
    p_user_id uuid,
    p_user_email text,
    p_action text,
    p_table_name text,
    p_record_id text DEFAULT NULL,
    p_old_data jsonb DEFAULT NULL,
    p_new_data jsonb DEFAULT NULL
) RETURNS void AS $$
BEGIN
    -- Insert into existing audit_log table (check actual column names)
    INSERT INTO public.audit_log (
        user_id,
        user_email,
        action,
        table_name,
        record_id,
        old_data,
        new_data,
        created_at
    ) VALUES (
        p_user_id,
        p_user_email,
        p_action,
        p_table_name,
        p_record_id,
        p_old_data,
        p_new_data,
        NOW()
    );
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create audit log policies for RLS (Row Level Security) on existing table
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Clean policy without inline comments to avoid syntax issues
CREATE POLICY "Users can view relevant audit logs" ON public.audit_log
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            EXISTS (
                SELECT 1 FROM public.user_profiles
                WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
            )
            OR
            user_id = auth.uid()
        )
    );

-- Allow system to insert audit logs
CREATE POLICY "System can insert audit logs" ON public.audit_log
    FOR INSERT WITH CHECK (true);

-- 8. Create helpful views for common audit queries (using existing table)
CREATE OR REPLACE VIEW recent_user_actions AS
SELECT
    al.created_at,
    al.user_email,
    al.action,
    al.table_name,
    al.record_id,
    al.new_data->>'title' as shift_title,
    al.new_data->>'start_date' as shift_date,
    al.new_data->>'provider_id' as provider_id
FROM public.audit_log al
WHERE al.created_at >= NOW() - INTERVAL '7 days'
ORDER BY al.created_at DESC;

-- 9. Show current user profiles
SELECT
    'Current user profiles:' as info,
    email,
    first_name,
    last_name,
    role,
    is_active,
    created_at
FROM public.user_profiles
ORDER BY created_at DESC;

-- 10. Sample queries to check audit logs (using existing table)
-- Uncomment these after you start using the system:

-- Show all recent shift additions
-- SELECT * FROM public.audit_log
-- WHERE table_name = 'shifts' AND action = 'CREATE'
-- AND created_at >= NOW() - INTERVAL '24 hours'
-- ORDER BY created_at DESC;

-- Show all actions by a specific user
-- SELECT * FROM public.audit_log
-- WHERE user_email = 'aida@clinicamedicos.org'
-- ORDER BY created_at DESC;

-- Show actions on a specific shift
-- SELECT * FROM public.audit_log
-- WHERE table_name = 'shifts' AND record_id = 'SHIFT_ID_HERE'
-- ORDER BY created_at DESC;