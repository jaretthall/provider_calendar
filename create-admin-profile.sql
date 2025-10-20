-- Create admin and user profiles + audit logging system
-- Run this in your Supabase SQL editor

-- 1. First, check if there are any authenticated users
SELECT
    'Existing authenticated users:' as info,
    id,
    email,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- 2. Create audit log table for tracking user actions
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
    user_email text,
    action text NOT NULL, -- 'CREATE', 'UPDATE', 'DELETE'
    table_name text NOT NULL, -- 'shifts', 'providers', 'clinic_types', etc.
    record_id text, -- ID of the affected record
    old_data jsonb, -- Previous values (for updates/deletes)
    new_data jsonb, -- New values (for creates/updates)
    ip_address text,
    user_agent text,
    session_id text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_action ON public.audit_logs(table_name, action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_record_id ON public.audit_logs(record_id);

-- 3. Create admin user profile (replace YOUR_ADMIN_USER_ID and email)
-- Look at the authenticated users above and copy your user ID
INSERT INTO user_profiles (
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

-- 4. Add unique constraint on email for future upserts
ALTER TABLE public.user_profiles
ADD CONSTRAINT user_profiles_email_key UNIQUE (lower(email));

-- 5. Create Aida's user profile
-- First create the auth user for Aida (this needs to be done via app or API)
-- For now, we'll create a placeholder profile that can be linked later
INSERT INTO user_profiles (
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

-- 6. Create a function to log user actions automatically
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
    INSERT INTO public.audit_logs (
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Create audit log policies for RLS (Row Level Security)
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read audit logs (admins can see all, others see their own)
CREATE POLICY "Users can view relevant audit logs" ON public.audit_logs
    FOR SELECT USING (
        auth.uid() IS NOT NULL AND (
            -- Admins can see all logs
            EXISTS (
                SELECT 1 FROM user_profiles
                WHERE user_id = auth.uid() AND role = 'admin' AND is_active = true
            )
            OR
            -- Users can see their own logs
            user_id = auth.uid()
        )
    );

-- Allow system to insert audit logs
CREATE POLICY "System can insert audit logs" ON public.audit_logs
    FOR INSERT WITH CHECK (true);

-- 8. Create helpful views for common audit queries
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
FROM audit_logs al
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
FROM user_profiles
ORDER BY created_at DESC;

-- 10. Sample queries to check audit logs
-- Uncomment these after you start using the system:

-- Show all recent shift additions
-- SELECT * FROM audit_logs
-- WHERE table_name = 'shifts' AND action = 'CREATE'
-- AND created_at >= NOW() - INTERVAL '24 hours'
-- ORDER BY created_at DESC;

-- Show all actions by a specific user
-- SELECT * FROM audit_logs
-- WHERE user_email = 'Aida@clinicamedicos.org'
-- ORDER BY created_at DESC;

-- Show actions on a specific shift
-- SELECT * FROM audit_logs
-- WHERE table_name = 'shifts' AND record_id = 'SHIFT_ID_HERE'
-- ORDER BY created_at DESC;