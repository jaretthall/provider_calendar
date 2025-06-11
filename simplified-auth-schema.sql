-- Simplified Authentication Schema for Clinica Provider Schedule
-- This removes the approval workflow complexity

-- Drop existing complex policies
DROP POLICY IF EXISTS "Approved users can manage their own providers" ON providers;
DROP POLICY IF EXISTS "Approved users can manage their own clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Approved users can manage their own medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Approved users can manage their own shifts" ON shifts;
DROP POLICY IF EXISTS "Approved users can manage their own settings" ON user_settings;

-- Simplify user_profiles table - remove approval workflow
ALTER TABLE user_profiles 
DROP COLUMN IF EXISTS status,
DROP COLUMN IF EXISTS approved_by,
DROP COLUMN IF EXISTS approved_at,
DROP COLUMN IF EXISTS notes;

-- Simplify role check to just 'super_admin' or 'scheduler'
ALTER TABLE user_profiles 
DROP CONSTRAINT IF EXISTS user_profiles_status_check;

-- Update the user creation function to not require approval
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    CASE 
      WHEN NOT EXISTS (SELECT 1 FROM user_profiles) THEN 'super_admin'
      ELSE 'scheduler'
    END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create simplified policies - no approval required
CREATE POLICY "Users can manage their own providers" ON providers
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own clinic types" ON clinic_types
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own medical assistants" ON medical_assistants
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own shifts" ON shifts
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL USING (user_id = auth.uid());

-- Simplified permission functions
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = user_id 
    AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing users to remove status requirement
UPDATE user_profiles 
SET role = CASE 
  WHEN NOT EXISTS (SELECT 1 FROM user_profiles WHERE role = 'super_admin') THEN 'super_admin'
  ELSE 'scheduler'
END
WHERE role = 'scheduler';

-- Add first user as super admin if none exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM user_profiles WHERE role = 'super_admin') THEN
    UPDATE user_profiles 
    SET role = 'super_admin' 
    WHERE id = (SELECT id FROM user_profiles ORDER BY created_at ASC LIMIT 1);
  END IF;
END $$; 