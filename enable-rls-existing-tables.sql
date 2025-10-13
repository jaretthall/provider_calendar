-- Enable RLS and create policies for EXISTING tables
-- This works with your current table structure

-- Enable RLS on existing tables
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies first
DROP POLICY IF EXISTS "Anonymous can view providers" ON providers;
DROP POLICY IF EXISTS "Authenticated users can manage providers" ON providers;
DROP POLICY IF EXISTS "Anonymous can view clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Authenticated users can manage clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Anonymous can view medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Authenticated users can manage medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Anonymous can view shifts" ON shifts;
DROP POLICY IF EXISTS "Authenticated users can manage shifts" ON shifts;

-- PROVIDERS table policies
CREATE POLICY "Anonymous can view providers" ON providers
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can manage providers" ON providers
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- CLINIC_TYPES table policies  
CREATE POLICY "Anonymous can view clinic types" ON clinic_types
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can manage clinic types" ON clinic_types
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- MEDICAL_ASSISTANTS table policies
CREATE POLICY "Anonymous can view medical assistants" ON medical_assistants
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can manage medical assistants" ON medical_assistants
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- SHIFTS table policies
CREATE POLICY "Anonymous can view shifts" ON shifts
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can manage shifts" ON shifts
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Check RLS is enabled
SELECT 
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts', 'user_settings', 'user_profiles')
ORDER BY tablename;

-- Show all policies
SELECT 
  tablename, 
  policyname,
  roles,
  cmd
FROM pg_policies 
WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts', 'user_settings', 'user_profiles')
ORDER BY tablename, policyname;

SELECT 'RLS enabled and policies created for existing tables!' as status;