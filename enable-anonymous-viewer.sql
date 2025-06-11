-- Enable Anonymous Read Access for Static Viewer
-- Run this in your Supabase SQL Editor to allow the static viewer to work
-- This adds read-only policies for anonymous users while keeping write protection

-- ============================================================================
-- ANONYMOUS READ POLICIES (for static viewer)
-- ============================================================================

-- Providers table - anonymous read access
DROP POLICY IF EXISTS "Enable anonymous read for providers" ON public.providers;
CREATE POLICY "Enable anonymous read for providers" ON public.providers
    FOR SELECT USING (true);

-- Clinic types table - anonymous read access
DROP POLICY IF EXISTS "Enable anonymous read for clinic_types" ON public.clinic_types;
CREATE POLICY "Enable anonymous read for clinic_types" ON public.clinic_types
    FOR SELECT USING (true);

-- Medical assistants table - anonymous read access
DROP POLICY IF EXISTS "Enable anonymous read for medical_assistants" ON public.medical_assistants;
CREATE POLICY "Enable anonymous read for medical_assistants" ON public.medical_assistants
    FOR SELECT USING (true);

-- Shifts table - anonymous read access
DROP POLICY IF EXISTS "Enable anonymous read for shifts" ON public.shifts;
CREATE POLICY "Enable anonymous read for shifts" ON public.shifts
    FOR SELECT USING (true);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check that policies are created
SELECT schemaname, tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts')
AND policyname LIKE '%anonymous%'
ORDER BY tablename, policyname;

-- Test anonymous access (these should return data counts)
SELECT 'providers' as table_name, COUNT(*) as record_count FROM providers
UNION ALL
SELECT 'clinic_types' as table_name, COUNT(*) as record_count FROM clinic_types  
UNION ALL
SELECT 'medical_assistants' as table_name, COUNT(*) as record_count FROM medical_assistants
UNION ALL
SELECT 'shifts' as table_name, COUNT(*) as record_count FROM shifts;

-- ============================================================================
-- NOTES
-- ============================================================================

/*
These policies:
1. ✅ Allow anonymous users to READ all data (for static viewer)
2. ✅ Keep all existing authenticated user policies intact (for main app)
3. ✅ Maintain write protection (only authenticated users can modify data)
4. ✅ Don't affect your existing authentication system

After running this:
- Your main app will continue working exactly as before
- The static viewer will be able to read all data
- Anonymous users still cannot create/edit/delete anything
- All data remains secure for modifications
*/ 