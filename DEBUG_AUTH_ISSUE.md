# Debug Authentication Issue

## **Quick Diagnosis:**

### **Step 1: Check Authentication State**
1. **Open browser console** (F12)
2. **Run this command** to check authentication:
   ```javascript
   // Check if you're authenticated
   console.log('Auth check:', {
     supabaseUser: window.supabase?.auth?.getUser?.(),
     localAuth: localStorage.getItem('tempoIsAuthenticated'),
     currentUser: localStorage.getItem('tempoCurrentUser')
   });
   ```

### **Step 2: Check Console for Auth Messages**
Look for these messages in console:
- ✅ "🔄 Auth state changed" (should show when you login)
- ✅ "Successfully fetched [table]" (data loading)
- ❌ "Authentication required to make changes" (when trying to edit)

### **Step 3: Apply Write Policies (Most Likely Fix)**
If you see "Authentication required" errors, run this in **Supabase SQL Editor**:

```sql
-- Apply INSERT/UPDATE/DELETE policies for authenticated users
CREATE POLICY "Enable insert for authenticated users only" ON public.providers
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.providers
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.providers
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON public.clinic_types
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.clinic_types
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.clinic_types
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON public.medical_assistants
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.medical_assistants
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.medical_assistants
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users only" ON public.shifts
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON public.shifts
    FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON public.shifts
    FOR DELETE USING (auth.role() = 'authenticated');
```

### **Step 4: Test After Applying Policies**
1. **Hard refresh** (Ctrl+F5)
2. **Login again** if needed
3. **Try editing a provider**
4. **Check console** for success messages

---

## **Expected Behavior:**

### **Before Fix:**
- ✅ Can login to Supabase
- ✅ Can see data (green indicator)
- ✅ Can import data
- ❌ Cannot edit/create/delete individual items

### **After Fix:**
- ✅ Can login to Supabase
- ✅ Can see data (green indicator)  
- ✅ Can import data
- ✅ **Can edit/create/delete individual items**

---

## **Alternative Debug Method:**

If the policies don't work, temporarily add debug logging:

1. **Open browser console**
2. **Try to edit something**
3. **Look for error messages** about authentication or permissions
4. **Check if currentUser is detected:**
   ```javascript
   // This should show your user info if authenticated
   window.supabase?.auth?.getUser?.().then(({data}) => console.log('Current user:', data.user));
   ```

**Most likely, the issue is just missing RLS write policies. Apply Step 3 first!** 