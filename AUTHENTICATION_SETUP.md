# Authentication System Setup Guide

## 🎉 Phase 1 Complete: Authentication Infrastructure

The Clinica Provider Schedule application now includes a complete authentication system with role-based access control.

## 📋 Setup Instructions

### 1. Apply Database Schema

1. Open your Supabase project dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `supabase-auth-setup.sql` 
4. Run the script to create:
   - User roles and profiles table
   - Row-Level Security policies
   - Audit logging system
   - Automatic triggers

### 2. Configure Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Get these values from:**
- Project URL: Supabase Dashboard → Settings → API
- Anon Key: Supabase Dashboard → Settings → API

### 3. Start the Application

```bash
npm run dev
```

## 🔐 Authentication Features

### User Roles
- **Admin**: Full CRUD operations, settings management, import/export
- **View-Only**: Read access to schedules and data only

### First User Setup
- The first user to sign up automatically becomes an admin
- Subsequent users are assigned view-only role by default

### Security Features
- Row-Level Security (RLS) policies protect all data
- JWT token-based authentication
- User sessions managed by Supabase Auth
- Audit trail for all data changes

## 🔄 Dual-Mode Operation

The application currently operates in **dual-mode**:
- **With Supabase configured**: Full authentication system
- **Without Supabase**: Falls back to localStorage mode (development)

## 🧪 Testing the System

1. **Visit the application** - You'll see a login form
2. **Sign up** with email/password - You become admin
3. **Test admin features**: Create providers, shifts, settings
4. **Sign up another user** - They get view-only access
5. **Test permissions**: View-only users can't edit/create

## 📊 What's Working

✅ **Authentication UI**: Login, signup, password reset forms  
✅ **Role-based Access**: Permission checking throughout app  
✅ **Database Security**: RLS policies protect data  
✅ **User Management**: Profile creation and role assignment  
✅ **Audit Trail**: All changes logged automatically  
✅ **Session Management**: Secure login/logout handling  

## 🚀 Next: Phase 2 - Data Migration

Phase 1 provides the authentication foundation. Phase 2 will:
- Replace localStorage with Supabase queries
- Add real-time data synchronization  
- Implement offline-first functionality
- Create seamless data migration tools

## 🔧 Troubleshooting

### Authentication Not Working
- Check `.env` file has correct Supabase credentials
- Verify SQL script ran successfully in Supabase
- Check browser console for any errors

### Permission Errors
- Ensure Row-Level Security policies are applied
- Check user profile was created correctly
- Verify user role assignment in `user_profiles` table

### Development Mode
- Without `.env` file, app runs in localStorage mode
- Good for development, but no authentication features

---

**Status**: Phase 1 Complete ✅  
**Version**: 0.3.0  
**Ready for**: Phase 2 Data Migration 