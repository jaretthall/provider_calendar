-- Fix provider_id column to allow NULL values for non-provider shifts
-- This allows shifts from other departments (Front Staff, Billing, Behavioral Health)

-- First, check current constraint
SELECT 
    column_name,
    is_nullable,
    data_type 
FROM information_schema.columns 
WHERE table_name = 'shifts' 
  AND column_name = 'provider_id';

-- Make provider_id column nullable
ALTER TABLE shifts 
ALTER COLUMN provider_id DROP NOT NULL;

-- Verify the change
SELECT 
    column_name,
    is_nullable,
    data_type 
FROM information_schema.columns 
WHERE table_name = 'shifts' 
  AND column_name = 'provider_id';

-- Verify that we have the new staff columns (from previous migration)
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'shifts' 
  AND column_name IN ('front_staff_ids', 'billing_ids', 'behavioral_health_ids');

-- Update RLS policies to handle null provider_id
-- For anonymous read access
DROP POLICY IF EXISTS "shifts_anonymous_read" ON shifts;
CREATE POLICY "shifts_anonymous_read" ON shifts
  FOR SELECT
  USING (true);

-- For authenticated user write access  
DROP POLICY IF EXISTS "shifts_user_write" ON shifts;
CREATE POLICY "shifts_user_write" ON shifts
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Test query to verify the schema supports null provider_id
SELECT 
    'Schema check' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'shifts' 
              AND column_name = 'provider_id' 
              AND is_nullable = 'YES'
        ) THEN '✅ provider_id is now nullable'
        ELSE '❌ provider_id is still NOT NULL'
    END as result;

-- Test that new staff columns exist
SELECT 
    'New columns check' as test,
    CASE 
        WHEN (
            SELECT COUNT(*) FROM information_schema.columns 
            WHERE table_name = 'shifts' 
              AND column_name IN ('front_staff_ids', 'billing_ids', 'behavioral_health_ids')
        ) = 3 THEN '✅ All new staff columns exist'
        ELSE '❌ Missing some staff columns'
    END as result;

COMMENT ON COLUMN shifts.provider_id IS 'Provider ID - nullable for non-provider shifts (Front Staff, Billing, Behavioral Health)';