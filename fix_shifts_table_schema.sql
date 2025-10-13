-- Fix shifts table schema - remove incorrect color column
-- The color column should only exist in medical_assistants table, not shifts table

-- First, check if the color column exists in shifts table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'shifts' 
AND column_name = 'color';

-- If the color column exists in shifts table, remove it
-- (This will only execute if the column exists)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'shifts' 
        AND column_name = 'color'
    ) THEN
        ALTER TABLE shifts DROP COLUMN color;
        RAISE NOTICE 'Removed incorrect color column from shifts table';
    ELSE
        RAISE NOTICE 'Color column does not exist in shifts table - no action needed';
    END IF;
END $$;

-- Verify the shifts table schema is correct
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'shifts'
ORDER BY ordinal_position;

-- Verify the medical_assistants table has the color column
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'medical_assistants' 
AND column_name = 'color';