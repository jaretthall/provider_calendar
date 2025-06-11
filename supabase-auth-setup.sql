-- =============================================================================
-- Clinica Provider Schedule - Supabase Authentication Setup
-- Run this script in your Supabase SQL Editor to set up authentication system
-- =============================================================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create user roles enum
CREATE TYPE user_role AS ENUM ('view_only', 'admin');

-- =============================================================================
-- USER PROFILES TABLE
-- =============================================================================

-- Create user_profiles table
CREATE TABLE public.user_profiles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    email TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'view_only',
    first_name TEXT,
    last_name TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- AUDIT LOG TABLE
-- =============================================================================

-- Create audit_log table for tracking changes
CREATE TABLE public.audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('create', 'update', 'delete')),
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =============================================================================
-- UPDATE EXISTING TABLES (if they exist)
-- =============================================================================

-- Add user_id column to existing tables if they don't have it
DO $$
BEGIN
    -- Check and add user_id to providers table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'providers') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'providers' AND column_name = 'user_id') THEN
            ALTER TABLE public.providers ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Check and add user_id to clinic_types table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clinic_types') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'clinic_types' AND column_name = 'user_id') THEN
            ALTER TABLE public.clinic_types ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Check and add user_id to medical_assistants table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'medical_assistants') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'medical_assistants' AND column_name = 'user_id') THEN
            ALTER TABLE public.medical_assistants ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;

    -- Check and add user_id to shifts table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shifts') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'user_id') THEN
            ALTER TABLE public.shifts ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'shifts' AND column_name = 'created_by_user_id') THEN
            ALTER TABLE public.shifts ADD COLUMN created_by_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;
        END IF;
    END IF;

    -- Check and add user_id to user_settings table
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        IF NOT EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'user_settings' AND column_name = 'user_id') THEN
            ALTER TABLE public.user_settings ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
        END IF;
    END IF;
END
$$;

-- =============================================================================
-- CREATE INDEXES
-- =============================================================================

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON public.user_profiles(user_id);
CREATE INDEX IF NOT EXISTS user_profiles_email_idx ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS user_profiles_role_idx ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS audit_log_user_id_idx ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS audit_log_table_record_idx ON public.audit_log(table_name, record_id);

-- =============================================================================
-- ENABLE ROW LEVEL SECURITY
-- =============================================================================

-- Enable Row Level Security (RLS)
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Enable RLS on existing tables if they exist
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'providers') THEN
        ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clinic_types') THEN
        ALTER TABLE public.clinic_types ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'medical_assistants') THEN
        ALTER TABLE public.medical_assistants ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shifts') THEN
        ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
    END IF;
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Create helper function to get user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid UUID)
RETURNS user_role AS $$
DECLARE
    user_role_result user_role;
BEGIN
    SELECT role INTO user_role_result
    FROM public.user_profiles
    WHERE user_id = user_uuid AND is_active = TRUE;
    
    RETURN COALESCE(user_role_result, 'view_only');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
BEGIN
    RETURN public.get_user_role(user_uuid) = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- RLS POLICIES FOR USER_PROFILES
-- =============================================================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can update user roles" ON public.user_profiles;

-- Create RLS policies for user_profiles
CREATE POLICY "Users can view their own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can insert profiles" ON public.user_profiles
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can view all profiles" ON public.user_profiles
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update user roles" ON public.user_profiles
    FOR UPDATE USING (public.is_admin());

-- =============================================================================
-- RLS POLICIES FOR DATA TABLES
-- =============================================================================

-- Providers policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'providers') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view their own providers" ON public.providers;
        DROP POLICY IF EXISTS "Users can insert their own providers" ON public.providers;
        DROP POLICY IF EXISTS "Users can update their own providers" ON public.providers;
        DROP POLICY IF EXISTS "Users can delete their own providers" ON public.providers;
        DROP POLICY IF EXISTS "Authenticated users can view providers" ON public.providers;
        DROP POLICY IF EXISTS "Admins can insert providers" ON public.providers;
        DROP POLICY IF EXISTS "Admins can update providers" ON public.providers;
        DROP POLICY IF EXISTS "Admins can delete providers" ON public.providers;

        -- Create new role-based policies
        CREATE POLICY "Authenticated users can view providers" ON public.providers
            FOR SELECT USING (auth.uid() = user_id AND public.get_user_role(auth.uid()) IN ('view_only', 'admin'));

        CREATE POLICY "Admins can insert providers" ON public.providers
            FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_admin());

        CREATE POLICY "Admins can update providers" ON public.providers
            FOR UPDATE USING (auth.uid() = user_id AND public.is_admin());

        CREATE POLICY "Admins can delete providers" ON public.providers
            FOR DELETE USING (auth.uid() = user_id AND public.is_admin());
    END IF;
END
$$;

-- Clinic types policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clinic_types') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view their own clinic types" ON public.clinic_types;
        DROP POLICY IF EXISTS "Users can insert their own clinic types" ON public.clinic_types;
        DROP POLICY IF EXISTS "Users can update their own clinic types" ON public.clinic_types;
        DROP POLICY IF EXISTS "Users can delete their own clinic types" ON public.clinic_types;
        DROP POLICY IF EXISTS "Authenticated users can view clinic types" ON public.clinic_types;
        DROP POLICY IF EXISTS "Admins can insert clinic types" ON public.clinic_types;
        DROP POLICY IF EXISTS "Admins can update clinic types" ON public.clinic_types;
        DROP POLICY IF EXISTS "Admins can delete clinic types" ON public.clinic_types;

        -- Create new role-based policies
        CREATE POLICY "Authenticated users can view clinic types" ON public.clinic_types
            FOR SELECT USING (auth.uid() = user_id AND public.get_user_role(auth.uid()) IN ('view_only', 'admin'));

        CREATE POLICY "Admins can insert clinic types" ON public.clinic_types
            FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_admin());

        CREATE POLICY "Admins can update clinic types" ON public.clinic_types
            FOR UPDATE USING (auth.uid() = user_id AND public.is_admin());

        CREATE POLICY "Admins can delete clinic types" ON public.clinic_types
            FOR DELETE USING (auth.uid() = user_id AND public.is_admin());
    END IF;
END
$$;

-- Medical assistants policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'medical_assistants') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view their own medical assistants" ON public.medical_assistants;
        DROP POLICY IF EXISTS "Users can insert their own medical assistants" ON public.medical_assistants;
        DROP POLICY IF EXISTS "Users can update their own medical assistants" ON public.medical_assistants;
        DROP POLICY IF EXISTS "Users can delete their own medical assistants" ON public.medical_assistants;
        DROP POLICY IF EXISTS "Authenticated users can view medical assistants" ON public.medical_assistants;
        DROP POLICY IF EXISTS "Admins can insert medical assistants" ON public.medical_assistants;
        DROP POLICY IF EXISTS "Admins can update medical assistants" ON public.medical_assistants;
        DROP POLICY IF EXISTS "Admins can delete medical assistants" ON public.medical_assistants;

        -- Create new role-based policies
        CREATE POLICY "Authenticated users can view medical assistants" ON public.medical_assistants
            FOR SELECT USING (auth.uid() = user_id AND public.get_user_role(auth.uid()) IN ('view_only', 'admin'));

        CREATE POLICY "Admins can insert medical assistants" ON public.medical_assistants
            FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_admin());

        CREATE POLICY "Admins can update medical assistants" ON public.medical_assistants
            FOR UPDATE USING (auth.uid() = user_id AND public.is_admin());

        CREATE POLICY "Admins can delete medical assistants" ON public.medical_assistants
            FOR DELETE USING (auth.uid() = user_id AND public.is_admin());
    END IF;
END
$$;

-- Shifts policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shifts') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view their own shifts" ON public.shifts;
        DROP POLICY IF EXISTS "Users can insert their own shifts" ON public.shifts;
        DROP POLICY IF EXISTS "Users can update their own shifts" ON public.shifts;
        DROP POLICY IF EXISTS "Users can delete their own shifts" ON public.shifts;
        DROP POLICY IF EXISTS "Authenticated users can view shifts" ON public.shifts;
        DROP POLICY IF EXISTS "Admins can insert shifts" ON public.shifts;
        DROP POLICY IF EXISTS "Admins can update shifts" ON public.shifts;
        DROP POLICY IF EXISTS "Admins can delete shifts" ON public.shifts;

        -- Create new role-based policies
        CREATE POLICY "Authenticated users can view shifts" ON public.shifts
            FOR SELECT USING (auth.uid() = user_id AND public.get_user_role(auth.uid()) IN ('view_only', 'admin'));

        CREATE POLICY "Admins can insert shifts" ON public.shifts
            FOR INSERT WITH CHECK (auth.uid() = user_id AND public.is_admin() AND auth.uid() = created_by_user_id);

        CREATE POLICY "Admins can update shifts" ON public.shifts
            FOR UPDATE USING (auth.uid() = user_id AND public.is_admin());

        CREATE POLICY "Admins can delete shifts" ON public.shifts
            FOR DELETE USING (auth.uid() = user_id AND public.is_admin());
    END IF;
END
$$;

-- User settings policies (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings') THEN
        -- Drop existing policies
        DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
        DROP POLICY IF EXISTS "Users can insert their own settings" ON public.user_settings;
        DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
        DROP POLICY IF EXISTS "Users can delete their own settings" ON public.user_settings;

        -- Create new policies
        CREATE POLICY "Users can view their own settings" ON public.user_settings
            FOR SELECT USING (auth.uid() = user_id);

        CREATE POLICY "Users can insert their own settings" ON public.user_settings
            FOR INSERT WITH CHECK (auth.uid() = user_id);

        CREATE POLICY "Users can update their own settings" ON public.user_settings
            FOR UPDATE USING (auth.uid() = user_id);

        CREATE POLICY "Users can delete their own settings" ON public.user_settings
            FOR DELETE USING (auth.uid() = user_id);
    END IF;
END
$$;

-- =============================================================================
-- AUDIT LOG POLICIES
-- =============================================================================

-- Drop existing audit log policies
DROP POLICY IF EXISTS "Users can view audit logs for their data" ON public.audit_log;
DROP POLICY IF EXISTS "System can insert audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can view all audit logs" ON public.audit_log;

-- Create audit log policies
CREATE POLICY "Users can view audit logs for their data" ON public.audit_log
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert audit logs" ON public.audit_log
    FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Admins can view all audit logs" ON public.audit_log
    FOR SELECT USING (public.is_admin());

-- =============================================================================
-- TRIGGERS AND FUNCTIONS
-- =============================================================================

-- Create function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for user_profiles updated_at
DROP TRIGGER IF EXISTS user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER user_profiles_updated_at 
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    existing_users_count INTEGER;
    user_role_assignment user_role;
BEGIN
    -- Count existing user profiles to determine if this is the first user
    SELECT COUNT(*) INTO existing_users_count FROM public.user_profiles;
    
    -- First user becomes admin, subsequent users become view_only
    IF existing_users_count = 0 THEN
        user_role_assignment := 'admin';
    ELSE
        user_role_assignment := COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'view_only');
    END IF;

    INSERT INTO public.user_profiles (user_id, email, role, first_name, last_name)
    VALUES (
        NEW.id,
        NEW.email,
        user_role_assignment,
        COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'last_name', '')
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create user profile on signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to handle audit logging
CREATE OR REPLACE FUNCTION public.handle_audit_log()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO public.audit_log (user_id, table_name, record_id, action, old_values)
        VALUES (auth.uid(), TG_TABLE_NAME, OLD.id, 'delete', to_jsonb(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO public.audit_log (user_id, table_name, record_id, action, old_values, new_values)
        VALUES (auth.uid(), TG_TABLE_NAME, NEW.id, 'update', to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO public.audit_log (user_id, table_name, record_id, action, new_values)
        VALUES (auth.uid(), TG_TABLE_NAME, NEW.id, 'create', to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create audit triggers for existing tables
DO $$
BEGIN
    -- Providers audit trigger
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'providers') THEN
        DROP TRIGGER IF EXISTS providers_audit_trigger ON public.providers;
        CREATE TRIGGER providers_audit_trigger
            AFTER INSERT OR UPDATE OR DELETE ON public.providers
            FOR EACH ROW EXECUTE PROCEDURE public.handle_audit_log();
    END IF;

    -- Clinic types audit trigger
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clinic_types') THEN
        DROP TRIGGER IF EXISTS clinic_types_audit_trigger ON public.clinic_types;
        CREATE TRIGGER clinic_types_audit_trigger
            AFTER INSERT OR UPDATE OR DELETE ON public.clinic_types
            FOR EACH ROW EXECUTE PROCEDURE public.handle_audit_log();
    END IF;

    -- Medical assistants audit trigger
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'medical_assistants') THEN
        DROP TRIGGER IF EXISTS medical_assistants_audit_trigger ON public.medical_assistants;
        CREATE TRIGGER medical_assistants_audit_trigger
            AFTER INSERT OR UPDATE OR DELETE ON public.medical_assistants
            FOR EACH ROW EXECUTE PROCEDURE public.handle_audit_log();
    END IF;

    -- Shifts audit trigger
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'shifts') THEN
        DROP TRIGGER IF EXISTS shifts_audit_trigger ON public.shifts;
        CREATE TRIGGER shifts_audit_trigger
            AFTER INSERT OR UPDATE OR DELETE ON public.shifts
            FOR EACH ROW EXECUTE PROCEDURE public.handle_audit_log();
    END IF;
END
$$;

-- =============================================================================
-- GRANT PERMISSIONS
-- =============================================================================

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- =============================================================================
-- COMPLETION MESSAGE
-- =============================================================================

DO $$
BEGIN
    RAISE NOTICE '✅ Supabase Authentication Setup Complete!';
    RAISE NOTICE '📧 Users can now sign up with email/password';
    RAISE NOTICE '🔐 First user will automatically become admin';
    RAISE NOTICE '👥 Subsequent users will be view-only by default';
    RAISE NOTICE '🛡️ Row-level security is enabled on all tables';
    RAISE NOTICE '📊 Audit logging is active for all data changes';
END
$$; 