-- Test all table access using the same format that worked for medical_assistants

-- Test each table individually with the same format
SELECT 'providers_data' as test, name, color FROM providers LIMIT 10;

SELECT 'clinic_types_data' as test, name, color FROM clinic_types LIMIT 10;

SELECT 'medical_assistants_data' as test, name, color FROM medical_assistants LIMIT 10;

-- Also test simple counts
SELECT 'providers_count' as test, count(*) as total FROM providers;
SELECT 'clinic_types_count' as test, count(*) as total FROM clinic_types;  
SELECT 'medical_assistants_count' as test, count(*) as total FROM medical_assistants;
SELECT 'shifts_count' as test, count(*) as total FROM shifts;

-- Test the exact same format as the static viewer uses
SELECT * FROM providers WHERE is_active = true;
SELECT * FROM clinic_types WHERE is_active = true;
SELECT * FROM medical_assistants WHERE is_active = true;
SELECT * FROM shifts; 