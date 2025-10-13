-- Enable anonymous reads, authenticated writes for all tables
-- Run this in your Supabase SQL Editor

-- Providers table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.providers;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.providers;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.providers;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.providers;

CREATE POLICY "Enable read access for all users" ON public.providers
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.providers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.providers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.providers
    FOR DELETE USING (auth.role() = 'authenticated');

-- Clinic Types table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.clinic_types;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.clinic_types;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.clinic_types;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.clinic_types;

CREATE POLICY "Enable read access for all users" ON public.clinic_types
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.clinic_types
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.clinic_types
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.clinic_types
    FOR DELETE USING (auth.role() = 'authenticated');

-- Medical Assistants table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.medical_assistants;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.medical_assistants;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.medical_assistants;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.medical_assistants;

CREATE POLICY "Enable read access for all users" ON public.medical_assistants
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.medical_assistants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.medical_assistants
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.medical_assistants
    FOR DELETE USING (auth.role() = 'authenticated');

-- Shifts table policies
DROP POLICY IF EXISTS "Enable read access for all users" ON public.shifts;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.shifts;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON public.shifts;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON public.shifts;

CREATE POLICY "Enable read access for all users" ON public.shifts
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON public.shifts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.shifts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.shifts
    FOR DELETE USING (auth.role() = 'authenticated');

-- User Settings table policies (keep private for authenticated users)
DROP POLICY IF EXISTS "Users can view own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can insert own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can update own settings" ON public.user_settings;
DROP POLICY IF EXISTS "Users can delete own settings" ON public.user_settings;

CREATE POLICY "Users can view own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own settings" ON public.user_settings
    FOR DELETE USING (auth.uid() = user_id); 