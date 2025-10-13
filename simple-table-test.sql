-- Simple test to see what's happening with the tables

-- First, check if tables exist
SELECT 'Table Check' as test_type;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;

-- Try to select directly from each table (this will fail if table doesn't exist or no access)
SELECT 'Direct Access Test' as test_type;

-- Test providers table
SELECT 'providers_direct' as test, count(*) as count FROM providers;

-- Test clinic_types table  
SELECT 'clinic_types_direct' as test, count(*) as count FROM clinic_types;

-- Test medical_assistants table
SELECT 'medical_assistants_direct' as test, count(*) as count FROM medical_assistants;

-- Test shifts table (we know this works)
SELECT 'shifts_direct' as test, count(*) as count FROM shifts;

-- Check if data was actually inserted
SELECT 'providers_data' as test, name, color FROM providers LIMIT 5;
SELECT 'clinic_types_data' as test, name, color FROM clinic_types LIMIT 5;
SELECT 'medical_assistants_data' as test, name, color FROM medical_assistants LIMIT 5; 