-- Simple Database Check
-- Run this in your Supabase SQL Editor

-- Check how many records exist in each table
SELECT 'providers' as table_name, count(*) as record_count FROM providers
UNION ALL
SELECT 'clinic_types' as table_name, count(*) as record_count FROM clinic_types  
UNION ALL
SELECT 'medical_assistants' as table_name, count(*) as record_count FROM medical_assistants
UNION ALL
SELECT 'shifts' as table_name, count(*) as record_count FROM shifts;

-- Show actual provider data
SELECT 'ACTUAL PROVIDERS IN DATABASE:' as info;
SELECT id, name FROM providers LIMIT 10;

-- Show actual clinic type data  
SELECT 'ACTUAL CLINIC TYPES IN DATABASE:' as info;
SELECT id, name FROM clinic_types LIMIT 10; 