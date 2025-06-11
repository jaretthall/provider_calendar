-- Clinica Provider Schedule - Single User Setup
-- This creates a simple setup where one user manages all data
-- Run this in your Supabase SQL Editor

-- Drop existing policies and user management
DROP POLICY IF EXISTS "Anonymous can view providers" ON providers;
DROP POLICY IF EXISTS "Authenticated users can manage providers" ON providers;
DROP POLICY IF EXISTS "Anonymous can view clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Authenticated users can manage clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Anonymous can view medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Authenticated users can manage medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Anonymous can view shifts" ON shifts;
DROP POLICY IF EXISTS "Authenticated users can manage shifts" ON shifts;
DROP POLICY IF EXISTS "Authenticated users can manage settings" ON user_settings;

-- Remove user_id columns (they're not needed for single user)
ALTER TABLE providers DROP COLUMN IF EXISTS user_id;
ALTER TABLE clinic_types DROP COLUMN IF EXISTS user_id;
ALTER TABLE medical_assistants DROP COLUMN IF EXISTS user_id;
ALTER TABLE shifts DROP COLUMN IF EXISTS user_id;
ALTER TABLE user_settings DROP COLUMN IF EXISTS user_id;

-- Create simple policies - anyone authenticated can do anything
CREATE POLICY "Authenticated users have full access to providers" ON providers
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to clinic types" ON clinic_types
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to medical assistants" ON medical_assistants
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to shifts" ON shifts
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users have full access to settings" ON user_settings
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Optional: Enable anonymous read access for viewing schedules
CREATE POLICY "Anonymous can view providers" ON providers
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Anonymous can view clinic types" ON clinic_types
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Anonymous can view medical assistants" ON medical_assistants
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Anonymous can view shifts" ON shifts
  FOR SELECT 
  TO anon
  USING (true);

-- Clean up user management tables (optional)
DROP TABLE IF EXISTS user_profiles;

-- Create a simple settings table
CREATE TABLE IF NOT EXISTS app_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  settings jsonb NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Insert default settings
INSERT INTO app_settings (settings) VALUES ('{
  "defaultCalendarView": "month",
  "weekStartsOn": "Sunday"
}') ON CONFLICT DO NOTHING;

CREATE POLICY "Anyone can access app settings" ON app_settings
  FOR ALL 
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Single-user setup complete! You can now use any Supabase account to manage all data.';
END $$; 