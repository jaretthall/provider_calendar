-- Create Basic Tables for Static Viewer
-- Run this FIRST in your Supabase SQL Editor to create the necessary tables
-- This is a simplified version without complex authentication

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
-- ENABLE RLS (Required by Supabase)
-- ============================================================================

ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medical_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CREATE ANONYMOUS READ POLICIES (for static viewer)
-- ============================================================================

-- Allow anonymous users to read all data
CREATE POLICY "Allow anonymous read" ON public.providers FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON public.clinic_types FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON public.medical_assistants FOR SELECT USING (true);
CREATE POLICY "Allow anonymous read" ON public.shifts FOR SELECT USING (true);

-- ============================================================================
-- INSERT SAMPLE DATA (for testing)
-- ============================================================================

-- Sample providers
INSERT INTO public.providers (name, color) VALUES 
('Dr. Smith', '#3B82F6'),
('Dr. Johnson', '#EF4444'),
('Dr. Williams', '#10B981')
ON CONFLICT DO NOTHING;

-- Sample clinic types
INSERT INTO public.clinic_types (name, color) VALUES 
('Emergency', '#F59E0B'),
('Pediatrics', '#8B5CF6'),
('Cardiology', '#06B6D4')
ON CONFLICT DO NOTHING;

-- Sample medical assistants
INSERT INTO public.medical_assistants (name, color) VALUES 
('Alice Brown', '#F97316'),
('Bob Wilson', '#84CC16'),
('Carol Davis', '#EC4899')
ON CONFLICT DO NOTHING;

-- Sample shifts (using provider IDs)
INSERT INTO public.shifts (provider_id, clinic_type_id, start_date, end_date, start_time, end_time, color, is_vacation)
SELECT 
    p.id,
    c.id,
    CURRENT_DATE,
    CURRENT_DATE,
    '09:00'::time,
    '17:00'::time,
    p.color,
    false
FROM public.providers p
CROSS JOIN public.clinic_types c
LIMIT 3
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Check that tables were created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('providers', 'clinic_types', 'medical_assistants', 'shifts');

-- Check data counts
SELECT 'providers' as table_name, COUNT(*) as count FROM providers
UNION ALL
SELECT 'clinic_types' as table_name, COUNT(*) as count FROM clinic_types  
UNION ALL
SELECT 'medical_assistants' as table_name, COUNT(*) as count FROM medical_assistants
UNION ALL
SELECT 'shifts' as table_name, COUNT(*) as count FROM shifts;

-- Show sample data
SELECT 'Sample Providers:' as info;
SELECT name, color FROM providers LIMIT 3;

SELECT 'Sample Clinic Types:' as info;
SELECT name, color FROM clinic_types LIMIT 3;

SELECT 'Sample Shifts:' as info;
SELECT s.start_date, p.name as provider, c.name as clinic 
FROM shifts s 
JOIN providers p ON s.provider_id = p.id 
LEFT JOIN clinic_types c ON s.clinic_type_id = c.id 
LIMIT 3; 