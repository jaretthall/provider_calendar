# Fix 400 Errors - Comprehensive Solution

## **Problem:** 
- ✅ Login works 
- ❌ App stays in read-only mode
- ❌ 400 errors when fetching data from Supabase tables

## **Root Cause Analysis:**
The 400 errors indicate that anonymous reads are being blocked, most likely because:
1. RLS policies haven't been applied yet
2. Anonymous access isn't enabled 
3. Tables might have wrong structure

---

## **SOLUTION 1: Apply RLS Policies (Most Likely Fix)**

### Step 1: Run the RLS Policies
1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy and paste** the entire content from `supabase-anonymous-read-policies.sql`
3. **Click "Run"**
4. **Verify success** - should see "Success" message

### Step 2: Test the Fix
1. **Refresh your app** (hard refresh: Ctrl+F5)
2. **Check console** - should see successful fetch messages
3. **Verify status** - should show green "Connected to Supabase Database"

---

## **SOLUTION 2: Enable Anonymous Access**

If RLS policies don't fix it:

1. **Go to Supabase Dashboard** → Authentication → Settings
2. **Find "Enable anonymous sign-ins"**
3. **Turn it ON** if it's off
4. **Save changes**
5. **Refresh your app**

---

## **SOLUTION 3: Debug Tables (Run Diagnostics)**

If still having issues:

1. **Go to Supabase Dashboard** → SQL Editor
2. **Copy and paste** the content from `supabase-debug-tables.sql`
3. **Run each query** and check results:

### Expected Results:
- **Query 1:** Should show 5 tables (providers, clinic_types, medical_assistants, shifts, user_settings)
- **Query 6:** Should show RLS policies for each table
- **Query 7:** All tables should have `rowsecurity = true`
- **Query 8:** Should return record counts (may be 0)
- **Query 9:** `auth_role` should be 'anon' for anonymous users

### If Problems Found:
- **Missing tables:** Run `supabase-schema.sql` first
- **Missing policies:** Run `supabase-anonymous-read-policies.sql`
- **Auth role issues:** Check anonymous access settings

---

## **SOLUTION 4: Verify Environment Variables**

Check your `.env` file has correct values:

```env
VITE_SUPABASE_URL=https://qctkdofzceywnhnslybv.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important:** Make sure there are no extra spaces or quotes around values!

---

## **SOLUTION 5: Emergency Fallback**

If nothing else works, temporarily disable Supabase:

1. **Open browser console** (F12)
2. **Run this command:**
   ```javascript
   localStorage.setItem('tempoSupabaseDisabled', 'true');
   location.reload();
   ```
3. **App will work in localStorage mode** while you debug

To re-enable after fixing:
```javascript
localStorage.removeItem('tempoSupabaseDisabled');
location.reload();
```

---

## **Most Common Issue & Fix**

**90% of the time, the issue is RLS policies not being applied.**

### Quick Fix:
1. **Supabase Dashboard** → SQL Editor
2. **Paste this and run:**
   ```sql
   -- Quick fix for anonymous reads
   DROP POLICY IF EXISTS "Enable read access for all users" ON public.providers;
   CREATE POLICY "Enable read access for all users" ON public.providers FOR SELECT USING (true);
   
   DROP POLICY IF EXISTS "Enable read access for all users" ON public.clinic_types;
   CREATE POLICY "Enable read access for all users" ON public.clinic_types FOR SELECT USING (true);
   
   DROP POLICY IF EXISTS "Enable read access for all users" ON public.medical_assistants;
   CREATE POLICY "Enable read access for all users" ON public.medical_assistants FOR SELECT USING (true);
   
   DROP POLICY IF EXISTS "Enable read access for all users" ON public.shifts;
   CREATE POLICY "Enable read access for all users" ON public.shifts FOR SELECT USING (true);
   ```
3. **Refresh app** - should work!

---

## **After Successful Fix:**

### You Should See:
- 🟢 Green "Connected to Supabase Database" indicator
- ✅ No 400 errors in console
- 📊 Data loading properly across all browsers
- 🔐 Admin authentication working for edits

### Test Both Modes:
1. **Anonymous mode:** View data without login
2. **Admin mode:** Login and make edits

---

**Try Solution 1 first - it fixes 90% of cases! Let me know which step works for you.** 