# IMMEDIATE FIX - Stop Infinite Supabase Requests

## **Quick Fix Steps:**

### 1. **First, refresh your browser** 
- Close all browser tabs with the calendar app
- Open a fresh tab and navigate to your app

### 2. **If the infinite loop continues:**

**Option A: Temporarily Disable Supabase (Quick Fix)**
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Run this command:
   ```javascript
   localStorage.setItem('tempoSupabaseDisabled', 'true');
   location.reload();
   ```

This will temporarily force the app to use localStorage mode until we fix the issue.

**Option B: Reset All Storage**
1. Open Developer Tools (F12)
2. Go to Application tab → Storage → Local Storage
3. Clear all localStorage entries
4. Refresh the page

### 3. **Root Cause:**
The issue is that the RLS policies haven't been applied to your Supabase database yet, so the anonymous read requests are being rejected, causing infinite retries.

### 4. **Permanent Fix:**
Apply the RLS policies from `supabase-anonymous-read-policies.sql` to your Supabase database:

1. **Go to Supabase Dashboard** → Your Project → SQL Editor
2. **Copy and paste the entire content** from `supabase-anonymous-read-policies.sql`
3. **Click "Run"**
4. **After successful execution**, run this in browser console:
   ```javascript
   localStorage.removeItem('tempoSupabaseDisabled');
   location.reload();
   ```

### 5. **Verify Fix:**
- App should show green "Connected to Supabase Database" indicator
- No more console errors about ERR_INSUFFICIENT_RESOURCES
- Data should load properly

## **If You're Still Having Issues:**

1. **Check Supabase Dashboard** → Authentication → Settings
2. **Verify** that "Enable anonymous sign-ins" is turned ON
3. **Or contact me** with your Supabase project URL for specific help

---

**The updated code I provided has better retry limits and will prevent infinite loops in the future, but the immediate issue is that anonymous reads are being blocked by the current RLS policies.** 