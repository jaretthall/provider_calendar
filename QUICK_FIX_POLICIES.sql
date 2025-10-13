-- FIXED POLICIES FOR ANONYMOUS READ + AUTHENTICATED WRITE
-- This allows everyone to see all data, but only authenticated users can edit

-- =====================================================
-- STEP 1: Drop all existing policies
-- =====================================================

DROP POLICY IF EXISTS "Users can view their own providers" ON providers;
DROP POLICY IF EXISTS "Users can insert their own providers" ON providers;
DROP POLICY IF EXISTS "Users can update their own providers" ON providers;
DROP POLICY IF EXISTS "Users can delete their own providers" ON providers;

DROP POLICY IF EXISTS "Users can view their own clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Users can insert their own clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Users can update their own clinic types" ON clinic_types;
DROP POLICY IF EXISTS "Users can delete their own clinic types" ON clinic_types;

DROP POLICY IF EXISTS "Users can view their own medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Users can insert their own medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Users can update their own medical assistants" ON medical_assistants;
DROP POLICY IF EXISTS "Users can delete their own medical assistants" ON medical_assistants;

DROP POLICY IF EXISTS "Users can view their own shifts" ON shifts;
DROP POLICY IF EXISTS "Users can insert their own shifts" ON shifts;
DROP POLICY IF EXISTS "Users can update their own shifts" ON shifts;
DROP POLICY IF EXISTS "Users can delete their own shifts" ON shifts;

DROP POLICY IF EXISTS "Users can view their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can insert their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can update their own settings" ON user_settings;
DROP POLICY IF EXISTS "Users can delete their own settings" ON user_settings;

-- =====================================================
-- STEP 2: Create Anonymous Read + Authenticated Write Policies
-- =====================================================

-- PROVIDERS TABLE
-- Anyone (anonymous + authenticated) can read ALL providers
CREATE POLICY "Anyone can view all providers" ON providers
  FOR SELECT 
  USING (true);

-- Only authenticated users can write (insert/update/delete)
CREATE POLICY "Authenticated users can manage providers" ON providers
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update providers" ON providers
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete providers" ON providers
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- CLINIC TYPES TABLE
CREATE POLICY "Anyone can view all clinic types" ON clinic_types
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage clinic types" ON clinic_types
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update clinic types" ON clinic_types
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete clinic types" ON clinic_types
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- MEDICAL ASSISTANTS TABLE
CREATE POLICY "Anyone can view all medical assistants" ON medical_assistants
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage medical assistants" ON medical_assistants
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update medical assistants" ON medical_assistants
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete medical assistants" ON medical_assistants
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- SHIFTS TABLE
CREATE POLICY "Anyone can view all shifts" ON shifts
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can manage shifts" ON shifts
  FOR INSERT 
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update shifts" ON shifts
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete shifts" ON shifts
  FOR DELETE 
  USING (auth.role() = 'authenticated');

-- USER SETTINGS TABLE (keep private per user)
CREATE POLICY "Users can manage their own settings" ON user_settings
  FOR ALL 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- STEP 3: Test the policies
-- =====================================================

-- This should work for both anonymous and authenticated users
SELECT 'Testing anonymous read access' as test;
SELECT count(*) as provider_count FROM providers;
SELECT count(*) as clinic_count FROM clinic_types;
SELECT count(*) as ma_count FROM medical_assistants;
SELECT count(*) as shift_count FROM shifts;

-- Show active policies
SELECT tablename, policyname, roles, cmd 
FROM pg_policies 
WHERE tablename IN ('providers', 'clinic_types', 'medical_assistants', 'shifts', 'user_settings')
ORDER BY tablename, policyname;
