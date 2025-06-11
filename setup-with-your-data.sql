-- Create Database Tables with YOUR Actual Data
-- Run this in your Supabase SQL Editor to create tables with your real providers and MAs
-- Data extracted from: clinica_schedule_export_2025-06-11.json

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- CREATE BASIC TABLES
-- ============================================================================

-- Create providers table
CREATE TABLE IF NOT EXISTS public.providers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL CHECK (length(name) >= 1),
    color TEXT NOT NULL CHECK (length(color) >= 1),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create clinic_types table
CREATE TABLE IF NOT EXISTS public.clinic_types (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL CHECK (length(name) >= 1),
    color TEXT NOT NULL CHECK (length(color) >= 1),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create medical_assistants table
CREATE TABLE IF NOT EXISTS public.medical_assistants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL CHECK (length(name) >= 1),
    color TEXT NOT NULL CHECK (length(color) >= 1),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create shifts table
CREATE TABLE IF NOT EXISTS public.shifts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    provider_id UUID REFERENCES public.providers(id) ON DELETE CASCADE NOT NULL,
    clinic_type_id UUID REFERENCES public.clinic_types(id) ON DELETE SET NULL,
    medical_assistant_ids UUID[],
    title TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    is_vacation BOOLEAN NOT NULL DEFAULT false,
    notes TEXT,
    color TEXT NOT NULL,
    recurring_rule JSONB,
    series_id UUID,
    original_recurring_shift_id UUID,
    is_exception_instance BOOLEAN NOT NULL DEFAULT false,
    exception_for_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CHECK (start_date <= end_date),
    CHECK (start_time IS NULL OR end_time IS NULL OR start_time < end_time),
    CHECK (NOT is_vacation OR clinic_type_id IS NULL) -- vacation shifts shouldn't have clinic types
);

-- ============================================================================
-- ENABLE RLS AND CREATE ANONYMOUS READ POLICIES
-- ============================================================================

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users to read all data (for static viewer)
CREATE POLICY "Allow anonymous read" ON public.providers FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON public.clinic_types FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON public.medical_assistants FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON public.shifts FOR SELECT USING (true);

-- ============================================================================
-- INSERT YOUR ACTUAL DATA
-- ============================================================================

-- Function to convert Tailwind CSS classes to hex colors
CREATE OR REPLACE FUNCTION tailwind_to_hex(tailwind_class TEXT) 
RETURNS TEXT AS $$
BEGIN
    RETURN CASE tailwind_class
        WHEN 'bg-yellow-400' THEN '#FBBF24'
        WHEN 'bg-blue-500' THEN '#3B82F6'
        WHEN 'bg-orange-400' THEN '#FB923C'
        WHEN 'bg-teal-600' THEN '#0D9488'
        WHEN 'bg-emerald-400' THEN '#34D399'
        WHEN 'bg-slate-500' THEN '#64748B'
        WHEN 'bg-fuchsia-400' THEN '#E879F9'
        WHEN 'bg-fuchsia-500' THEN '#D946EF'
        WHEN 'bg-rose-500' THEN '#F43F5E'
        WHEN 'bg-lime-500' THEN '#84CC16'
        WHEN 'bg-cyan-400' THEN '#22D3EE'
        WHEN 'bg-red-600' THEN '#DC2626'
        WHEN 'bg-amber-400' THEN '#FBBF24'
        WHEN 'bg-blue-600' THEN '#2563EB'
        WHEN 'bg-lime-600' THEN '#65A30D'
        WHEN 'bg-purple-600' THEN '#9333EA'
        WHEN 'bg-rose-400' THEN '#FB7185'
        ELSE '#6B7280' -- Default gray
    END;
END;
$$ LANGUAGE plpgsql;

-- Insert YOUR actual providers
INSERT INTO public.providers (id, name, color, is_active, created_at, updated_at) VALUES 
('11111111-1111-1111-1111-111111111111'::uuid, 'Philip Sutherland', tailwind_to_hex('bg-yellow-400'), true, '2025-06-08T16:52:22.644Z', '2025-06-08T19:23:15.747Z'),
('22222222-2222-2222-2222-222222222222'::uuid, 'Julia Friederich', tailwind_to_hex('bg-blue-500'), true, '2025-06-08T16:52:22.644Z', '2025-06-09T01:10:59.328Z'),
('e1038770-1388-48c7-94cc-5c0bf8858f9c'::uuid, 'Kelly Arnold', tailwind_to_hex('bg-orange-400'), true, '2025-06-08T16:54:45.739Z', '2025-06-08T19:24:16.716Z'),
('87be6a08-213c-4a40-a702-2f2287d32d10'::uuid, 'John Pound', tailwind_to_hex('bg-teal-600'), true, '2025-06-08T16:54:53.365Z', '2025-06-08T19:23:59.660Z'),
('8f791bb6-25a0-4005-9994-2466d6113359'::uuid, 'Heidi Kelly', tailwind_to_hex('bg-emerald-400'), true, '2025-06-08T16:55:13.293Z', '2025-06-08T19:24:32.759Z'),
('2a868e2f-e53f-4f12-acf2-a524f2a3d19b'::uuid, 'Jim Knox', tailwind_to_hex('bg-slate-500'), true, '2025-06-08T19:24:46.904Z', '2025-06-08T19:24:46.904Z'),
('a8f02578-8096-456e-a7cc-d8afb5b8a649'::uuid, 'Izzy Swaggerty', tailwind_to_hex('bg-fuchsia-400'), true, '2025-06-08T19:25:03.916Z', '2025-06-08T19:25:03.916Z'),
('7259ac59-a651-49ac-b104-b23a9eae467d'::uuid, 'Bibiana Garcia', tailwind_to_hex('bg-fuchsia-500'), true, '2025-06-08T19:26:36.665Z', '2025-06-09T00:31:46.575Z'),
('6ec5142d-89c9-4256-bd8d-147f8d40a2a3'::uuid, 'Joy Ferro', tailwind_to_hex('bg-rose-500'), true, '2025-06-09T00:32:27.757Z', '2025-06-09T00:32:27.757Z'),
('9e96bded-2580-4b0c-be5d-b5eff14f67a4'::uuid, 'Ludjelie Manigat', tailwind_to_hex('bg-lime-500'), true, '2025-06-09T00:33:09.058Z', '2025-06-09T00:33:09.058Z'),
('b996b0a3-51aa-4495-9207-731cd34dbccb'::uuid, 'Tiffany Good', tailwind_to_hex('bg-cyan-400'), true, '2025-06-09T00:40:46.512Z', '2025-06-09T00:40:46.512Z')
ON CONFLICT (id) DO NOTHING;

-- Insert YOUR actual clinic types
INSERT INTO public.clinic_types (id, name, color, is_active, created_at, updated_at) VALUES 
('33333333-3333-3333-3333-333333333333'::uuid, 'Clinica Centro', tailwind_to_hex('bg-red-600'), true, '2025-06-08T16:52:22.644Z', '2025-06-09T00:26:40.597Z'),
('44444444-4444-4444-4444-444444444444'::uuid, 'Urgente', tailwind_to_hex('bg-amber-400'), true, '2025-06-08T16:52:22.644Z', '2025-06-09T00:26:50.566Z')
ON CONFLICT (id) DO NOTHING;

-- Insert YOUR actual medical assistants
INSERT INTO public.medical_assistants (id, name, color, is_active, created_at, updated_at) VALUES 
('ee792997-3cdf-491d-8503-1676c2bc034c'::uuid, 'Juan', tailwind_to_hex('bg-blue-600'), true, '2025-06-09T00:27:17.544Z', '2025-06-09T00:29:35.771Z'),
('277fe18d-474d-4f6a-9c79-cb680854b0d2'::uuid, 'Oscar', tailwind_to_hex('bg-lime-600'), true, '2025-06-09T00:27:38.434Z', '2025-06-09T00:29:20.863Z'),
('374bbe82-203c-4c40-b690-4576e4e673c8'::uuid, 'Lupita', tailwind_to_hex('bg-purple-600'), true, '2025-06-09T00:28:21.015Z', '2025-06-09T00:28:21.015Z'),
('6bc808d3-e63e-453f-b2c7-f7cf3a6d237c'::uuid, 'Maira', tailwind_to_hex('bg-rose-400'), true, '2025-06-09T00:28:34.922Z', '2025-06-09T00:28:34.922Z'),
('ef783fed-638b-4e62-84a2-bd60dc3369bd'::uuid, 'Quiana', tailwind_to_hex('bg-cyan-400'), true, '2025-06-09T00:28:53.172Z', '2025-06-09T00:28:53.172Z'),
('ab9e0cb9-485a-43dd-92cb-9fe60b779271'::uuid, 'Kenneth', tailwind_to_hex('bg-lime-500'), true, '2025-06-09T00:29:04.581Z', '2025-06-09T00:29:04.581Z')
ON CONFLICT (id) DO NOTHING;

-- Create a few sample shifts for today and this week to test the viewer
INSERT INTO public.shifts (provider_id, clinic_type_id, start_date, end_date, start_time, end_time, color, is_vacation, medical_assistant_ids)
VALUES 
-- Philip Sutherland at Clinica Centro today
('11111111-1111-1111-1111-111111111111'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, CURRENT_DATE, CURRENT_DATE, '08:00'::time, '16:00'::time, tailwind_to_hex('bg-yellow-400'), false, ARRAY['ee792997-3cdf-491d-8503-1676c2bc034c'::uuid]),

-- Julia Friederich at Urgente today
('22222222-2222-2222-2222-222222222222'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, CURRENT_DATE, CURRENT_DATE, '09:00'::time, '17:00'::time, tailwind_to_hex('bg-blue-500'), false, ARRAY['277fe18d-474d-4f6a-9c79-cb680854b0d2'::uuid]),

-- Kelly Arnold vacation tomorrow
('e1038770-1388-48c7-94cc-5c0bf8858f9c'::uuid, NULL, CURRENT_DATE + 1, CURRENT_DATE + 1, NULL, NULL, tailwind_to_hex('bg-orange-400'), true, NULL),

-- John Pound at Clinica Centro tomorrow
('87be6a08-213c-4a40-a702-2f2287d32d10'::uuid, '33333333-3333-3333-3333-333333333333'::uuid, CURRENT_DATE + 1, CURRENT_DATE + 1, '08:00'::time, '16:00'::time, tailwind_to_hex('bg-teal-600'), false, ARRAY['374bbe82-203c-4c40-b690-4576e4e673c8'::uuid]),

-- Heidi Kelly at Urgente day after tomorrow
('8f791bb6-25a0-4005-9994-2466d6113359'::uuid, '44444444-4444-4444-4444-444444444444'::uuid, CURRENT_DATE + 2, CURRENT_DATE + 2, '10:00'::time, '18:00'::time, tailwind_to_hex('bg-emerald-400'), false, ARRAY['6bc808d3-e63e-453f-b2c7-f7cf3a6d237c'::uuid])
ON CONFLICT DO NOTHING;

-- Drop the helper function
DROP FUNCTION tailwind_to_hex(TEXT);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Show what was created
SELECT 'YOUR PROVIDERS:' as info;
SELECT name, color FROM providers ORDER BY name;

SELECT 'YOUR CLINIC TYPES:' as info;
SELECT name, color FROM clinic_types ORDER BY name;

SELECT 'YOUR MEDICAL ASSISTANTS:' as info;
SELECT name, color FROM medical_assistants ORDER BY name;

SELECT 'SAMPLE SHIFTS CREATED:' as info;
SELECT 
    s.start_date,
    p.name as provider,
    COALESCE(c.name, 'VACATION') as clinic,
    COALESCE(s.start_time::text, 'All day') as start_time,
    s.is_vacation
FROM shifts s 
JOIN providers p ON s.provider_id = p.id 
LEFT JOIN clinic_types c ON s.clinic_type_id = c.id 
ORDER BY s.start_date, s.start_time;

-- Final summary
SELECT 
    (SELECT COUNT(*) FROM providers) as providers_count,
    (SELECT COUNT(*) FROM clinic_types) as clinic_types_count,
    (SELECT COUNT(*) FROM medical_assistants) as medical_assistants_count,
    (SELECT COUNT(*) FROM shifts) as shifts_count;

SELECT '🎉 SUCCESS! Database created with your actual data. Now update static-viewer.html with your Supabase credentials!' as final_message; 