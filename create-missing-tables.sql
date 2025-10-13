-- Create missing tables for the static viewer
-- These tables are required for the static-viewer-enhanced.html to work

-- Create providers table
CREATE TABLE IF NOT EXISTS providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clinic_types table  
CREATE TABLE IF NOT EXISTS clinic_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create medical_assistants table
CREATE TABLE IF NOT EXISTS medical_assistants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_assistants ENABLE ROW LEVEL SECURITY;

-- Create anonymous read policies for all tables
CREATE POLICY "Allow anonymous read access" ON providers
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow anonymous read access" ON clinic_types
    FOR SELECT 
    USING (true);

CREATE POLICY "Allow anonymous read access" ON medical_assistants
    FOR SELECT 
    USING (true);

-- Insert some sample data to test
INSERT INTO providers (name, color) VALUES 
    ('Philip Sutherland', '#f59e0b'),
    ('Julia Friederich', '#3b82f6'),
    ('Kelly Arnold', '#ef4444'),
    ('John Pound', '#10b981'),
    ('Heidi Kelly', '#8b5cf6')
ON CONFLICT DO NOTHING;

INSERT INTO clinic_types (name, color) VALUES 
    ('Centro', '#f59e0b'),
    ('Emergency', '#ef4444'),
    ('Pediatrics', '#10b981'),
    ('General', '#3b82f6')
ON CONFLICT DO NOTHING;

INSERT INTO medical_assistants (name, color) VALUES 
    ('Juan', '#06b6d4'),
    ('Maria', '#ec4899'),
    ('Carlos', '#84cc16'),
    ('Ana', '#f97316')
ON CONFLICT DO NOTHING;

-- Test that everything works
SELECT 'providers' as table_name, count(*) as record_count FROM providers;
SELECT 'clinic_types' as table_name, count(*) as record_count FROM clinic_types;
SELECT 'medical_assistants' as table_name, count(*) as record_count FROM medical_assistants;
SELECT 'shifts' as table_name, count(*) as record_count FROM shifts; 