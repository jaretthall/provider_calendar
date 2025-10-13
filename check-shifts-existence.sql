-- Check if shifts table exists and has any data
SELECT 'CHECKING SHIFTS TABLE:' as info;

-- Count total shifts
SELECT COUNT(*) as total_shifts FROM shifts;

-- Show all shifts if any exist
SELECT * FROM shifts ORDER BY created_at DESC LIMIT 10;

-- Check table structure
SELECT 'TABLE STRUCTURE:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'shifts' 
ORDER BY ordinal_position; 