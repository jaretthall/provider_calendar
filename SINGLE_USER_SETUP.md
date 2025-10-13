# Single-User Clinica Provider Schedule Setup

## 🎯 **Simplified Single-User Architecture**

This setup eliminates the complexity of multi-user management and provides a simple, single-login system where one user manages all scheduling data.

---

## ✅ **Benefits of Single-User Setup**

- ✅ **No user management complexity**
- ✅ **No Row Level Security (RLS) policies**
- ✅ **Single login for entire team**
- ✅ **All data in one place**
- ✅ **Much simpler Supabase setup**
- ✅ **No user approval workflows**
- ✅ **Perfect for small clinics**

---

## 🚀 **Setup Options**

### Option 1: LocalStorage Only (Simplest)

**Perfect for:** Single computer/browser usage, demos, testing

1. **No setup required** - just run the app
2. **All data stored locally** in browser
3. **Export/import** for backups
4. **Works offline**

```bash
npm run dev
```

That's it! Use the app with localStorage - no authentication needed.

---

### Option 2: Supabase Single-User (Recommended for Production)

**Perfect for:** Multi-device access, data backup, team sharing

#### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create account
2. Create new project (takes ~2 minutes)
3. Note your **Project URL** and **Public API Key**

#### Step 2: Run Single-User Schema
1. In Supabase dashboard, go to **SQL Editor**
2. Copy and paste contents of `supabase-simple-single-user.sql`
3. Click **Run** to create tables and policies

#### Step 3: Configure Environment
Create `.env.local` file:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### Step 4: Create Your User Account
1. Run the app: `npm run dev`
2. Click "Admin Login" → "Need an account? Sign up"
3. Create your account with email/password
4. You're ready to go!

---

## 🔐 **How Authentication Works**

### LocalStorage Mode
- No login required
- All data stored in browser
- Use "Export Data" to backup

### Supabase Mode
- **Anyone with credentials can manage all data**
- Perfect for sharing login with team
- Data automatically syncs across devices
- **Anonymous users can VIEW schedules** (read-only)
- **Authenticated users can EDIT everything**

---

## 📊 **Data Management**

### Single User Owns All Data
- All providers, clinics, shifts belong to the organization
- No data isolation between users
- Perfect for clinic teams sharing access
- Simple backup and data management

### Sharing Access
You can share the login credentials with your team:
- **Email:** your-clinic@email.com
- **Password:** YourSecurePassword2025!

Everyone uses the same login to manage schedules.

---

## 🔄 **Migration from Multi-User Setup**

If you have an existing multi-user setup:

1. **Export your current data** using the Export function
2. **Run the single-user schema** (`supabase-simple-single-user.sql`)
3. **Import your data** back into the simplified system
4. **Share the single login** with your team

---

## ⚙️ **Development Commands**

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type checking
npm run type-check
```

---

## 🎉 **You're All Set!**

The single-user setup gives you:

- ✅ **Immediate productivity** - no complex user management
- ✅ **Team collaboration** - shared login for everyone
- ✅ **Data security** - Supabase handles all the infrastructure
- ✅ **Scalability** - can handle thousands of shifts and providers
- ✅ **Reliability** - automatic backups with Supabase

---

## 🆘 **Need Help?**

### Common Issues

1. **"Provider already exists" error**
   - Clear browser localStorage: `localStorage.clear()`
   - Restart the dev server

2. **Supabase connection issues**
   - Check your `.env.local` file
   - Verify project URL and API key
   - Make sure you ran the SQL schema

3. **Data not syncing**
   - Make sure you're signed in to Supabase
   - Check browser console for errors

### For Support
- Check the application logs in browser console
- Review this documentation
- Test with a fresh browser/incognito mode

---

**Current Version:** v1.0.5
**Last Updated:** January 2025
**Status:** ✅ Production Ready (Single-User) 