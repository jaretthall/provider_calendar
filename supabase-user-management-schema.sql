-- User Management Schema Extension for Clinica Provider Schedule
-- Run this AFTER the main supabase-schema.sql

-- Create user profiles table for managing app users
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'scheduler' CHECK (role IN ('super_admin', 'scheduler')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'suspended')),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  approved_by uuid REFERENCES auth.users,
  approved_at timestamp with time zone,
  last_login timestamp with time zone,
  notes text
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
-- Super admins can see all user profiles
CREATE POLICY "Super admins can view all user profiles" ON user_profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND status = 'approved'
    )
  );

-- Super admins can insert/update user profiles
CREATE POLICY "Super admins can manage user profiles" ON user_profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND role = 'super_admin' 
      AND status = 'approved'
    )
  );

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (id = auth.uid());

-- Users can update their own basic info (not role/status)
CREATE POLICY "Users can update own basic info" ON user_profiles
  FOR UPDATE USING (id = auth.uid()) 
  WITH CHECK (id = auth.uid() AND role = (SELECT role FROM user_profiles WHERE id = auth.uid()) AND status = (SELECT status FROM user_profiles WHERE id = auth.uid()));

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, full_name, role, status)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'scheduler',
    'pending'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at on user_profiles
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE PROCEDURE public.update_updated_at_column();

-- Create a super admin user (you'll need to run this after creating your account)
-- Replace 'your-email@example.com' with your actual email
-- INSERT INTO user_profiles (id, email, full_name, role, status, approved_at)
-- SELECT id, email, 'Super Admin', 'super_admin', 'approved', now()
-- FROM auth.users 
-- WHERE email = 'your-email@example.com'
-- ON CONFLICT (id) DO UPDATE SET 
--   role = 'super_admin', 
--   status = 'approved', 
--   approved_at = now();

-- Update existing table policies to check user approval status
-- Providers table policy update
DROP POLICY IF EXISTS "Users can manage their own providers" ON providers;
CREATE POLICY "Approved users can manage their own providers" ON providers
  FOR ALL USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND status = 'approved'
    )
  );

-- Clinic types table policy update
DROP POLICY IF EXISTS "Users can manage their own clinic types" ON clinic_types;
CREATE POLICY "Approved users can manage their own clinic types" ON clinic_types
  FOR ALL USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND status = 'approved'
    )
  );

-- Medical assistants table policy update
DROP POLICY IF EXISTS "Users can manage their own medical assistants" ON medical_assistants;
CREATE POLICY "Approved users can manage their own medical assistants" ON medical_assistants
  FOR ALL USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND status = 'approved'
    )
  );

-- Shifts table policy update
DROP POLICY IF EXISTS "Users can manage their own shifts" ON shifts;
CREATE POLICY "Approved users can manage their own shifts" ON shifts
  FOR ALL USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND status = 'approved'
    )
  );

-- User settings table policy update
DROP POLICY IF EXISTS "Users can manage their own settings" ON user_settings;
CREATE POLICY "Approved users can manage their own settings" ON user_settings
  FOR ALL USING (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() 
      AND status = 'approved'
    )
  );

-- Create function to check if user is approved super admin
CREATE OR REPLACE FUNCTION public.is_super_admin(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = user_id 
    AND role = 'super_admin' 
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check if user is approved
CREATE OR REPLACE FUNCTION public.is_approved_user(user_id uuid DEFAULT auth.uid())
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = user_id 
    AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for user management (super admins only)
CREATE OR REPLACE VIEW user_management_view AS
SELECT 
  up.id,
  up.email,
  up.full_name,
  up.role,
  up.status,
  up.created_at,
  up.updated_at,
  up.approved_at,
  up.last_login,
  up.notes,
  approver.email as approved_by_email
FROM user_profiles up
LEFT JOIN user_profiles approver ON up.approved_by = approver.id
WHERE is_super_admin();

-- Grant access to the view for authenticated users (RLS will handle permissions)
GRANT SELECT ON user_management_view TO authenticated;

COMMENT ON TABLE user_profiles IS 'User profiles with role-based access control and approval workflow';
COMMENT ON FUNCTION is_super_admin IS 'Check if current user is an approved super admin';
COMMENT ON FUNCTION is_approved_user IS 'Check if current user is approved to use the application';
COMMENT ON VIEW user_management_view IS 'User management view accessible only to super admins'; 