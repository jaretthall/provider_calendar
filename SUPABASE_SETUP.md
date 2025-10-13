# Supabase Integration Guide

## 🚀 **Clinica Provider Schedule + Supabase**

This guide will help you transform the Clinica Provider Schedule from a localStorage-only application into a full cloud-powered solution with **real-time collaboration**, **user authentication**, and **data persistence**.

---

## 📋 **Prerequisites**

- Node.js 18+ installed
- A Supabase account (free tier available)
- Basic understanding of environment variables

---

## 🏗️ **Step 1: Supabase Project Setup**

### 1.1 Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Fill in your project details:
   - **Name**: `clinica-provider-schedule`
   - **Database Password**: Choose a strong password
   - **Region**: Select closest to your users
4. Click "Create new project"
5. Wait for the project to be ready (~2 minutes)

### 1.2 Get Your Project Credentials
1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://your-project.supabase.co`)
   - **Anon Public Key** (starts with `eyJhbGciOiJIUzI1NI`)

---

## 🗄️ **Step 2: Database Setup**

### 2.1 Run the Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-schema.sql` from this project
3. Click **Run** to execute the schema
4. Verify all tables were created successfully

### 2.2 Verify Database Structure
Check that these tables were created:
- `providers`
- `clinic_types`
- `medical_assistants` 
- `shifts`
- `user_settings`

---

## ⚙️ **Step 3: Application Configuration**

### 3.1 Environment Variables
Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```

**Important:** 
- Replace `your-project` with your actual Supabase project ID
- Replace `your-anon-public-key-here` with your actual anon key
- Never commit this file to version control (it's already in `.gitignore`)

### 3.2 Verify Installation
1. Start your development server: `npm run dev`
2. Open the application
3. You should see the new Supabase-powered authentication

---

## 🔐 **Step 4: Authentication Setup**

### 4.1 Configure Auth Settings
1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Configure these settings:
   - **Site URL**: `http://localhost:5173` (for development)
   - **Redirect URLs**: Add your production domain when ready
   - **Email Auth**: Enabled by default
   - **Email Confirmation**: Recommended for production

### 4.2 Test Authentication
1. Click "Admin" in the app header (new Supabase login)
2. Choose "Create Account" to sign up with email/password
3. Check your email for verification (if enabled)
4. Sign in with your credentials

---

## 🎯 **Features Unlocked**

### ✅ **What You Get with Supabase**

**🔐 Real Authentication**
- Email/password signup and signin
- Password reset functionality  
- Secure session management
- User isolation (each user sees only their data)

**☁️ Cloud Data Storage**
- All data stored securely in PostgreSQL
- Automatic backups and scaling
- Real-time data synchronization
- Cross-device access

**👥 Multi-User Support** 
- Each user has isolated data
- No data conflicts between users
- Proper user management

**🔄 Hybrid Mode**
- Graceful fallback to localStorage if Supabase not configured
- No breaking changes to existing functionality
- Easy migration path

---

## 🔄 **Data Migration**

### Migrate from localStorage
If you have existing data in localStorage:

1. **Export your data** using the existing export feature
2. **Sign up** for a Supabase account in the app
3. **Import your data** using the import feature
4. Your data is now synced to the cloud!

---

## 🏭 **Production Deployment**

### Environment Variables for Production
```bash
# Production .env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-production-anon-key
```

### Supabase Production Settings
1. **Authentication** → **Settings**
   - Update **Site URL** to your production domain
   - Add production domain to **Redirect URLs**
   - Enable **Email Confirmation** for security

2. **Database** → **Settings**
   - Consider upgrading to Pro plan for production workloads
   - Set up database backups if not on Pro plan

---

## 🛠️ **Development vs Production Modes**

### Development (No Supabase)
- Uses localStorage
- Simple admin toggle
- All features work locally
- No user isolation

### Production (With Supabase)
- Real authentication
- Cloud data storage
- User isolation
- Real-time sync
- Cross-device access

---

## 📊 **Database Schema Overview**

### Core Tables
```sql
providers          -- Healthcare providers (doctors, nurses)
clinic_types       -- Clinic specialties (emergency, pediatrics)
medical_assistants -- Support staff
shifts             -- Work shifts and vacations
user_settings      -- User preferences
```

### Security Features
- **Row Level Security (RLS)** enabled on all tables
- Users can only access their own data
- Automatic user_id assignment
- Secure policy enforcement

---

## 🚨 **Troubleshooting**

### Common Issues

**"Supabase not configured" message**
- Check your `.env.local` file exists
- Verify environment variable names are correct
- Restart your development server

**Authentication not working**
- Verify your Supabase project URL and anon key
- Check browser console for error messages
- Ensure email confirmation is handled properly

**Data not syncing**
- Check browser network tab for failed requests
- Verify RLS policies are working correctly
- Check Supabase dashboard logs

**Import/Export issues**
- Ensure you're signed in when importing data
- Check data format matches expected schema
- Verify user permissions

---

## 🔧 **Advanced Configuration**

### Custom Email Templates
1. Go to **Authentication** → **Email Templates**
2. Customize signup, password reset emails
3. Add your branding and styling

### Real-time Subscriptions
The app automatically subscribes to real-time changes when multiple users are collaborating on schedules.

### Database Functions
Custom PostgreSQL functions are included for:
- Conflict detection
- Data validation
- Performance optimization

---

## 📈 **Scaling Considerations**

### Performance
- Database indexes on frequently queried fields
- Efficient RLS policies
- Optimized queries for large datasets

### Storage
- Supabase free tier: 500MB database
- Pro tier: 8GB+ with auto-scaling
- Archive old data as needed

### Users
- Free tier: Up to 50,000 monthly active users
- Pro tier: 100,000+ MAU

---

## 🔄 **Migration Path**

### Phase 1: Setup (Current)
- Supabase project created
- Database schema deployed
- Environment configured
- Authentication working

### Phase 2: Data Integration 
- Replace localStorage hooks with Supabase hooks
- Enable real-time subscriptions
- Test data synchronization

### Phase 3: Production Ready
- Deploy to production
- Configure custom domain
- Set up monitoring
- User onboarding

---

## 📞 **Support**

### Resources
- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

### Getting Help
- Supabase Discord community
- GitHub issues for this project
- Supabase support (Pro plan)

---

**🎉 Congratulations!** You've successfully set up Supabase integration. Your Clinica Provider Schedule is now a full-featured, cloud-powered healthcare scheduling solution! 