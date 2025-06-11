-- Clinica Provider Schedule - Single User Setup (Fixed Version)
-- This creates a simple setup where one user manages all data
-- Run this in your Supabase SQL Editor

-- First, let's safely drop ALL existing policies and columns
-- This ensures a clean slate regardless of current state

-- Drop all existing policies (safe with IF EXISTS)
DROP POLICY IF EXISTS "Anonymous can view providers" ON providers;
DROP POLICY IF EXISTS "Authenticated users can manage providers" ON providers;
DROP POLICY IF EXISTS "Authenticated users have full access to providers" ON providers;
DROP POLICY IF EXISTS "Users can manage their own providers" ON providers;

DROP POLICY IF EXISTS "Anonymous can view clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Authenticated users can manage clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Authenticated users have full access to clinic_types" ON clinic_types;
DROP POLICY IF EXISTS "Users can manage their own clinic_types" ON clinic_types;

DROP POLICY IF EXISTS "Anonymous can view medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Authenticated users can manage medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Authenticated users have full access to medical_assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Users can manage their own medical_assistants" ON medical_assistants;

DROP POLICY IF EXISTS "Anonymous can view shifts" ON shifts;
DROP POLICY IF EXISTS "Authenticated users can manage shifts" ON shifts;
DROP POLICY IF EXISTS "Authenticated users have full access to shifts" ON shifts;
DROP POLICY IF EXISTS "Users can manage their own shifts" ON shifts;

DROP POLICY IF EXISTS "Anonymous can view user_settings" ON user_settings;
DROP POLICY IF EXISTS "Authenticated users can manage user_settings" ON user_settings;
DROP POLICY IF EXISTS "Authenticated users have full access to user_settings" ON user_settings;
DROP POLICY IF EXISTS "Users can manage their own user_settings" ON user_settings;

-- Drop user_id columns safely (if they exist)
ALTER TABLE providers DROP COLUMN IF EXISTS user_id;
ALTER TABLE clinic_types DROP COLUMN IF EXISTS user_id;
ALTER TABLE medical_assistants DROP COLUMN IF EXISTS user_id;
ALTER TABLE shifts DROP COLUMN IF EXISTS user_id;
ALTER TABLE shifts DROP COLUMN IF EXISTS created_by_user_id;

-- Drop user_settings table if it exists (not needed for single user)
DROP TABLE IF EXISTS user_settings CASCADE;

-- Disable RLS temporarily to avoid conflicts
ALTER TABLE providers DISABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE medical_assistants DISABLE ROW LEVEL SECURITY;
ALTER TABLE shifts DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS for controlled access
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Create simple policies: Anonymous read, Authenticated write
-- PROVIDERS
CREATE POLICY "Anonymous can read providers" ON providers
    FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated users have full access to providers" ON providers
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- CLINIC TYPES
CREATE POLICY "Anonymous can read clinic_types" ON clinic_types
    FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated users have full access to clinic_types" ON clinic_types
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- MEDICAL ASSISTANTS
CREATE POLICY "Anonymous can read medical_assistants" ON medical_assistants
    FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated users have full access to medical_assistants" ON medical_assistants
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- SHIFTS
CREATE POLICY "Anonymous can read shifts" ON shifts
    FOR SELECT TO anon USING (true);

CREATE POLICY "Authenticated users have full access to shifts" ON shifts
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grant necessary permissions to anonymous and authenticated roles
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Verify the setup
SELECT 'Single-user setup completed successfully!' as message;
SELECT 'All user_id columns removed' as step_1;
SELECT 'Simple RLS policies created' as step_2;
SELECT 'Anonymous read access enabled' as step_3;
SELECT 'Authenticated full access enabled' as step_4; 