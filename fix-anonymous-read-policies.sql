-- Enable anonymous read access for static viewer
-- This allows the static-viewer-enhanced.html to read data without authentication

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow anonymous read access" ON providers;
DROP POLICY IF EXISTS "Allow anonymous read access" ON clinic_types;
DROP POLICY IF EXISTS "Allow anonymous read access" ON medical_assistants;
DROP POLICY IF EXISTS "Allow anonymous read access" ON shifts;

-- Create anonymous read policies for all required tables
CREATE POLICY "Allow anonymous read access" ON providers
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow anonymous read access" ON clinic_types
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow anonymous read access" ON medical_assistants
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow anonymous read access" ON shifts
    FOR SELECT 
    USING (true);

-- Ensure RLS is enabled on all tables
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_types ENABLE ROW LEVEL SECURITY; 
ALTER TABLE medical_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Test the policies by running the same queries again
SELECT 'providers' as table_name, count(*) as record_count FROM providers;
SELECT 'clinic_types' as table_name, count(*) as record_count FROM clinic_types;
SELECT 'medical_assistants' as table_name, count(*) as record_count FROM medical_assistants;
SELECT 'shifts' as table_name, count(*) as record_count FROM shifts; 