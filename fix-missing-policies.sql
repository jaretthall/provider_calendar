-- Create Providers Table
CREATE TABLE providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    specialty TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create Clinic Types Table
CREATE TABLE clinic_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create Medical Assistants Table
CREATE TABLE medical_assistants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    provider_id UUID REFERENCES providers(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Create Shifts Table
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_id UUID REFERENCES providers(id),
    medical_assistant_id UUID REFERENCES medical_assistants(id),
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    clinic_type_id UUID REFERENCES clinic_types(id),
    status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on all tables
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_assistants ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Create Policies for Providers
CREATE POLICY "Anonymous can view providers" ON providers
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can manage providers" ON providers
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create Policies for Clinic Types
CREATE POLICY "Anonymous can view clinic types" ON clinic_types
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can manage clinic types" ON clinic_types
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create Policies for Medical Assistants
CREATE POLICY "Anonymous can view medical assistants" ON medical_assistants
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can manage medical assistants" ON medical_assistants
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create Policies for Shifts
CREATE POLICY "Anonymous can view shifts" ON shifts
  FOR SELECT 
  TO anon
  USING (true);

CREATE POLICY "Authenticated users can manage shifts" ON shifts
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create indexes for foreign key columns to optimize joins
CREATE INDEX idx_medical_assistants_provider_id ON medical_assistants(provider_id);
CREATE INDEX idx_shifts_provider_id ON shifts(provider_id);
CREATE INDEX idx_shifts_medical_assistant_id ON shifts(medical_assistant_id);
CREATE INDEX idx_shifts_clinic_type_id ON shifts(clinic_type_id);