-- Clear existing data and insert with matching UUIDs from shifts
DELETE FROM providers;
DELETE FROM clinic_types;
DELETE FROM medical_assistants;

-- Insert providers with matching UUIDs from shifts data
INSERT INTO providers (id, name, color, is_active) VALUES 
    ('11111111-1111-1111-1111-111111111111', 'Philip Sutherland', '#FBBF24', true),
    ('22222222-2222-2222-2222-222222222222', 'Julia Friederich', '#3B82F6', true),
    ('e1038770-1388-48c7-94cc-5c0bf8858f9c', 'Kelly Arnold', '#FB923C', true),
    ('87be6a08-213c-4a40-a702-2f2287d32d10', 'John Pound', '#0D9488', true),
    ('8f791bb6-25a0-4005-9994-2466d6113359', 'Heidi Kelly', '#34D399', true);

-- Insert clinic types with matching UUIDs from shifts data  
INSERT INTO clinic_types (id, name, color, is_active) VALUES 
    ('33333333-3333-3333-3333-333333333333', 'Centro', '#FBBF24', true),
    ('44444444-4444-4444-4444-444444444444', 'Emergency', '#EF4444', true);

-- Insert medical assistants with matching UUIDs from shifts data
INSERT INTO medical_assistants (id, name, color, is_active) VALUES 
    ('ee792997-3cdf-491d-8503-1676c2bc034c', 'Juan', '#06B6D4', true),
    ('277fe18d-474d-4f6a-9c79-cb680854b0d2', 'Maria', '#EC4899', true),
    ('374bbe82-203c-4c40-b690-4576e4e673c8', 'Carlos', '#84CC16', true),
    ('6bc808d3-e63e-453f-b2c7-f7cf3a6d237c', 'Ana', '#F97316', true);

-- Test that everything is now properly linked
SELECT 'providers_count' as test, count(*) as total FROM providers;
SELECT 'clinic_types_count' as test, count(*) as total FROM clinic_types;
SELECT 'medical_assistants_count' as test, count(*) as total FROM medical_assistants;
SELECT 'shifts_count' as test, count(*) as total FROM shifts;

-- Test a join to make sure relationships work
SELECT 
    s.start_date,
    p.name as provider_name,
    ct.name as clinic_name,
    s.start_time,
    s.end_time
FROM shifts s
LEFT JOIN providers p ON s.provider_id = p.id
LEFT JOIN clinic_types ct ON s.clinic_type_id = ct.id
WHERE s.is_vacation = false
LIMIT 5; 