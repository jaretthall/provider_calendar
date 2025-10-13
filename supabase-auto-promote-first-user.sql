-- Auto-promote first user to super admin
-- Add this to your supabase-schema.sql or run it separately

-- Function to auto-promote first user
CREATE OR REPLACE FUNCTION public.auto_promote_first_user()
RETURNS trigger AS $$
BEGIN
  -- Check if this is the first user
  IF (SELECT COUNT(*) FROM user_profiles) = 1 THEN
    -- Make them super admin
    NEW.role = 'super_admin';
    NEW.status = 'approved';
    NEW.approved_at = NOW();
    NEW.approved_by = NEW.id;
    NEW.notes = 'Auto-promoted first user to super admin';
    
    -- Log this action
    RAISE NOTICE 'Auto-promoted first user % to super admin', NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to auto-promote first user
DROP TRIGGER IF EXISTS auto_promote_first_user_trigger ON user_profiles;
CREATE TRIGGER auto_promote_first_user_trigger
  BEFORE INSERT ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION auto_promote_first_user();

-- Alternative: If you already have users, run this to promote the oldest user
-- UPDATE user_profiles 
-- SET 
--   role = 'super_admin',
--   status = 'approved',
--   approved_at = NOW(),
--   approved_by = id,
--   notes = 'Auto-promoted oldest user to super admin'
-- WHERE id = (
--   SELECT id FROM user_profiles 
--   ORDER BY created_at ASC 
--   LIMIT 1
-- ) AND role != 'super_admin'; 