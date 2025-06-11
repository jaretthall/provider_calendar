-- Remove all authentication requirements from Supabase
-- This allows the main React application to work without login

-- Drop all existing RLS policies first
DROP POLICY IF EXISTS "Allow anonymous read access" ON providers;
DROP POLICY IF EXISTS "Allow anonymous read access" ON clinic_types;
DROP POLICY IF EXISTS "Allow anonymous read access" ON medical_assistants;
DROP POLICY IF EXISTS "Allow anonymous read access" ON shifts;

-- Drop any other existing policies that might block access (manual approach)
-- Just drop common policy names that might exist
DROP POLICY IF EXISTS "Users can insert their own profile" ON providers;
DROP POLICY IF EXISTS "Users can update own profile" ON providers;
DROP POLICY IF EXISTS "Users can view own profile" ON providers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON providers;
DROP POLICY IF EXISTS "Enable read access for all users" ON providers;
DROP POLICY IF EXISTS "Enable update for users based on email" ON providers;

DROP POLICY IF EXISTS "Users can insert their own profile" ON clinic_types;
DROP POLICY IF EXISTS "Users can update own profile" ON clinic_types;
DROP POLICY IF EXISTS "Users can view own profile" ON clinic_types;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON clinic_types;
DROP POLICY IF EXISTS "Enable read access for all users" ON clinic_types;
DROP POLICY IF EXISTS "Enable update for users based on email" ON clinic_types;

DROP POLICY IF EXISTS "Users can insert their own profile" ON medical_assistants;
DROP POLICY IF EXISTS "Users can update own profile" ON medical_assistants;
DROP POLICY IF EXISTS "Users can view own profile" ON medical_assistants;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON medical_assistants;
DROP POLICY IF EXISTS "Enable read access for all users" ON medical_assistants;
DROP POLICY IF EXISTS "Enable update for users based on email" ON medical_assistants;

DROP POLICY IF EXISTS "Users can insert their own profile" ON shifts;
DROP POLICY IF EXISTS "Users can update own profile" ON shifts;
DROP POLICY IF EXISTS "Users can view own profile" ON shifts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON shifts;
DROP POLICY IF EXISTS "Enable read access for all users" ON shifts;
DROP POLICY IF EXISTS "Enable update for users based on email" ON shifts;

-- Create comprehensive anonymous access policies for ALL operations
-- Providers table - full access
CREATE POLICY "Anonymous full access" ON providers
    FOR ALL 
    USING (true)
    WITH CHECK (true);

-- Clinic types table - full access  
CREATE POLICY "Anonymous full access" ON clinic_types
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Medical assistants table - full access
CREATE POLICY "Anonymous full access" ON medical_assistants
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Shifts table - full access
CREATE POLICY "Anonymous full access" ON shifts
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Ensure RLS is still enabled (for security) but with permissive policies
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Test that all operations work for anonymous users
SELECT 'Testing anonymous access...' as status;

-- Test SELECT (read)
SELECT 'providers_read' as test, count(*) as count FROM providers;
SELECT 'clinic_types_read' as test, count(*) as count FROM clinic_types;
SELECT 'medical_assistants_read' as test, count(*) as count FROM medical_assistants;
SELECT 'shifts_read' as test, count(*) as count FROM shifts;

-- Test INSERT (create) - this should work for anonymous users now
INSERT INTO providers (id, name, color, is_active) VALUES 
    ('00000000-0000-0000-0000-000000000001', 'Test Provider', '#123456', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- Test UPDATE - update the test record
UPDATE providers SET name = 'Test Provider Updated' WHERE id = '00000000-0000-0000-0000-000000000001';

-- Test DELETE - remove the test record
DELETE FROM providers WHERE id = '00000000-0000-0000-0000-000000000001';

SELECT 'Anonymous access configuration complete!' as status; 