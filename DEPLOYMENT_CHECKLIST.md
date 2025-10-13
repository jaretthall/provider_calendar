# 🚀 Authentication System Deployment Checklist

## 📝 **Core Code Changes Made**
The main application files that changed:

### Frontend Code Changes:
1. **`contexts/AuthContext.tsx`** - Updated to support anonymous users + real Supabase auth
2. **`components/Header.tsx`** - Added Sign Out button, restricted Import to admins
3. **`components/ViewShiftDetailsModal.tsx`** - Restricted edit/create buttons for anonymous users  
4. **`App.tsx`** - Removed forced login screen, allow anonymous access
5. **`.env`** - Supabase configuration

### Database Changes:
- Created `user_profiles` table
- Created `user_settings` table  
- Enabled RLS on all tables
- Created anonymous read + authenticated write policies

## 🔄 **Safe Deployment Steps**

### Step 1: Test Current System
- [ ] Test anonymous browsing (no login required)
- [ ] Test admin login/logout 
- [ ] Test anonymous users cannot edit/create
- [ ] Test admin users can edit/create
- [ ] Test Import restricted to admins
- [ ] Test Settings restricted to admins

### Step 2: Prepare Production Database
Run these SQL files in **PRODUCTION** Supabase SQL Editor:

1. **`create-user-profiles-table.sql`** - Create user profiles table
2. **`create-user-settings-table.sql`** - Create user settings table  
3. **`enable-rls-existing-tables.sql`** - Enable RLS on all tables
4. **`debug-hanging-profile.sql`** - Set up proper RLS policies

### Step 3: Commit & Deploy Code
```bash
# Commit only the essential files
git add contexts/AuthContext.tsx
git add components/Header.tsx  
git add components/ViewShiftDetailsModal.tsx
git add App.tsx
git add .env

# Commit with clear message
git commit -m "feat: implement anonymous read + authenticated write access

🎯 Anonymous users can:
- View all calendar data without signing in
- Cannot edit/create/delete anything

🔐 Authenticated users can:
- Full admin access after signing in  
- Create/edit/delete all data
- Access import and settings

🚀 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push to feature branch
git push origin feature/supabase-auth
```

### Step 4: Create Pull Request
- Create PR from `feature/supabase-auth` → `master`
- Include this checklist in PR description
- Test on staging/preview if available

### Step 5: Deploy to Production
- Make sure production `.env` has correct Supabase credentials
- Deploy code changes
- Verify authentication works

## ⚠️ **Rollback Plan**
If anything goes wrong:
1. Revert the code deployment 
2. Disable RLS on tables temporarily: `ALTER TABLE tablename DISABLE ROW LEVEL SECURITY;`
3. Debug and fix issues
4. Re-enable RLS when ready

## 🎯 **Success Criteria**
After deployment, verify:
- [ ] Anonymous users can browse calendar without login
- [ ] Anonymous users see "Sign In" button
- [ ] Anonymous users cannot edit anything
- [ ] Admin users can sign in successfully  
- [ ] Admin users see "Sign Out" button
- [ ] Admin users have full edit access
- [ ] Import/Settings restricted to admins only