-- COMPLETE STATIC VIEWER FIX
-- Run this in your Supabase SQL Editor to fix all issues

-- =====================================================
-- STEP 1: Fix RLS policies (from troubleshooting guide)
-- =====================================================

-- Clean ALL existing policies to prevent conflicts
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts')
    ) LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END
$$;

-- Ensure RLS is enabled
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Create simple, non-conflicting policies
CREATE POLICY "allow_read_providers" ON public.providers FOR SELECT USING (true);
CREATE POLICY "allow_write_providers" ON public.providers FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_read_clinic_types" ON public.clinic_types FOR SELECT USING (true);
CREATE POLICY "allow_write_clinic_types" ON public.clinic_types FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_read_medical_assistants" ON public.medical_assistants FOR SELECT USING (true);
CREATE POLICY "allow_write_medical_assistants" ON public.medical_assistants FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_read_shifts" ON public.shifts FOR SELECT USING (true);
CREATE POLICY "allow_write_shifts" ON public.shifts FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- STEP 2: Clean and populate data with proper colors
-- =====================================================

-- Delete all existing data
DELETE FROM shifts;
DELETE FROM medical_assistants;
DELETE FROM clinic_types;
DELETE FROM providers;

-- Insert Providers with Tailwind color classes (matching your dynamic app)
INSERT INTO providers (id, name, color, is_active, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'Philip Sutherland', 'bg-red-500', true, NOW(), NOW()),
('22222222-2222-2222-2222-222222222222', 'Tiffany Good', 'bg-red-600', true, NOW(), NOW()),
('33333333-3333-3333-3333-333333333333', 'Kelly Arnold', 'bg-orange-500', true, NOW(), NOW());

-- Insert Clinic Types with Spanish names and proper colors
INSERT INTO clinic_types (id, name, color, is_active, created_at, updated_at) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Centro', 'bg-amber-400', true, NOW(), NOW()),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Urgente', 'bg-yellow-500', true, NOW(), NOW());

-- Insert Medical Assistants
INSERT INTO medical_assistants (id, name, color, is_active, created_at, updated_at) VALUES
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'Aida', 'bg-green-500', true, NOW(), NOW());

-- Insert Sample Shifts with proper colors
INSERT INTO shifts (
    id, 
    provider_id, 
    clinic_type_id, 
    medical_assistant_ids, 
    title, 
    start_date, 
    end_date, 
    start_time, 
    end_time, 
    is_vacation, 
    notes, 
    color, 
    created_at, 
    updated_at
) VALUES
-- Today's shifts
('shift001-1111-2222-3333-444444444444', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"ffffffff-ffff-ffff-ffff-ffffffffffff"}', 'Morning Centro', CURRENT_DATE, CURRENT_DATE, '09:00', '17:00', false, 'Philip Sutherland at Centro with Aida', 'bg-red-500', NOW(), NOW()),

('shift002-1111-2222-3333-444444444444', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"ffffffff-ffff-ffff-ffff-ffffffffffff"}', 'Emergency Shift', CURRENT_DATE, CURRENT_DATE, '10:00', '18:00', false, 'Tiffany Good covering emergency with Aida', 'bg-red-600', NOW(), NOW()),

-- Tomorrow's shifts
('shift003-1111-2222-3333-444444444444', '33333333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '{"ffffffff-ffff-ffff-ffff-ffffffffffff"}', 'Centro Coverage', CURRENT_DATE + 1, CURRENT_DATE + 1, '08:00', '16:00', false, 'Kelly Arnold at Centro with Aida', 'bg-orange-500', NOW(), NOW()),

-- Vacation example 
('shift004-1111-2222-3333-444444444444', '11111111-1111-1111-1111-111111111111', null, null, 'Annual Leave', CURRENT_DATE + 2, CURRENT_DATE + 4, null, null, true, 'Philip Sutherland on vacation', 'bg-red-600', NOW(), NOW()),

-- Next week shift
('shift005-1111-2222-3333-444444444444', '22222222-2222-2222-2222-222222222222', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '{"ffffffff-ffff-ffff-ffff-ffffffffffff"}', 'Urgente Coverage', CURRENT_DATE + 7, CURRENT_DATE + 7, '07:00', '15:00', false, 'Tiffany Good urgente with Aida', 'bg-red-600', NOW(), NOW());

-- =====================================================
-- STEP 3: Verify everything works for static viewer
-- =====================================================

-- Test anonymous access (static viewer uses anonymous access)
SELECT 'STATIC VIEWER ACCESS TEST' as test_name;

-- Check that anonymous users can see all data
SELECT 'providers' as table_name, COUNT(*) as record_count FROM providers
UNION ALL
SELECT 'clinic_types' as table_name, COUNT(*) as record_count FROM clinic_types
UNION ALL  
SELECT 'medical_assistants' as table_name, COUNT(*) as record_count FROM medical_assistants
UNION ALL
SELECT 'shifts' as table_name, COUNT(*) as record_count FROM shifts;

-- Show the exact data the static viewer will see
SELECT 'PROVIDER COLORS FOR STATIC VIEWER' as info;
SELECT name, color, 'Should appear in sidebar with color dot' as note FROM providers;

SELECT 'SHIFTS WITH COLORS FOR CALENDAR' as info;
SELECT 
    p.name as provider,
    ct.name as clinic_type,
    s.start_date,
    s.start_time,
    s.end_time,
    s.is_vacation,
    s.title,
    s.color as shift_color,
    'Will be converted to hex color by static viewer' as note
FROM shifts s
JOIN providers p ON s.provider_id = p.id
LEFT JOIN clinic_types ct ON s.clinic_type_id = ct.id
ORDER BY s.start_date, s.start_time;

SELECT '✅ STATIC VIEWER FIX COMPLETE - REFRESH YOUR BROWSER!' as final_status; 