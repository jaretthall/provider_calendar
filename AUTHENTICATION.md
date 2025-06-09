# Authentication System Guide

## 🔐 **Clinica Provider Schedule Authentication**

Your application now supports **two authentication modes** that automatically switch based on your configuration:

---

## 🎯 **Current Status: Demo Mode Active**

Your application is currently running in **Demo Mode** because Supabase is not configured. This provides:

- ✅ Simple username/password login
- ✅ Immediate access for testing and demos
- ✅ All features work with localStorage
- ✅ No setup required

**Demo Credentials:**
- **Username:** admin
- **Password:** CPS2025!Secure

---

## 🚀 **How to Enable Supabase Authentication**

To switch to the professional Supabase authentication system:

### Step 1: Set up Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Wait for it to initialize (~2 minutes)

### Step 2: Run Database Schema
1. In your Supabase dashboard, go to **SQL Editor**
2. Copy and paste the contents of `supabase-schema.sql` 
3. Click **Run** to create the tables

### Step 3: Get Your Credentials
1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy your **Project URL** and **Anon Public Key**

### Step 4: Configure Environment Variables
Create a `.env.local` file in your project root:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NI...
```

### Step 5: Restart Application
```bash
npm run dev
```

**That's it!** Your application will automatically switch to Supabase mode.

---

## 🔄 **Authentication Mode Comparison**

| Feature | Demo Mode | Supabase Mode |
|---------|-----------|---------------|
| **Setup Required** | ❌ None | ✅ 5 minutes |
| **Login Interface** | Simple form | Professional auth |
| **Data Storage** | localStorage | Cloud database |
| **User Accounts** | Single demo account | Real email/password |
| **Multi-User** | ❌ Single user | ✅ Multiple users |
| **Password Reset** | ❌ Not available | ✅ Email-based |
| **Cross-Device Sync** | ❌ Local only | ✅ Real-time sync |
| **Production Ready** | ❌ Demo only | ✅ Production ready |

---

## 🎨 **What Changes with Supabase Authentication**

### Professional Login Interface
When Supabase is configured, users see:
- Professional healthcare-focused login screen
- Email/password authentication
- Account creation capabilities
- Password reset functionality
- Loading states and error handling

### Enhanced Security
- Real user accounts with secure authentication
- Each user has isolated data
- Session management
- Secure password handling

### Cloud Features
- Data automatically synced to the cloud
- Access from multiple devices
- Real-time updates
- Automatic backups

---

## 🔧 **Switching Back to Demo Mode**

To return to demo mode:
1. Remove or rename your `.env.local` file
2. Restart the development server
3. The application automatically switches back to demo mode

---

## 🛠️ **Technical Details**

### How It Works
The application uses a smart detection system:

```typescript
// Check if Supabase is configured
const isSupabaseEnabled = isSupabaseConfigured();

if (isSupabaseEnabled) {
  // Show Supabase authentication
  return <SupabaseAuthProvider><AuthenticatedApp /></SupabaseAuthProvider>;
} else {
  // Show demo authentication
  return <AuthenticatedApp />;
}
```

### Authentication Flow
1. **App starts** → Check if Supabase environment variables exist
2. **If Supabase configured** → Show professional login screen
3. **If not configured** → Use demo authentication system
4. **User authenticated** → Load main application

### Data Migration
When switching from demo to Supabase mode:
1. Export your data using the Export feature
2. Set up Supabase and sign in
3. Import your data using the Import feature
4. Your data is now in the cloud!

---

## 🎯 **Recommendations**

### For Development/Testing
- Use **Demo Mode** for quick testing and development
- No setup required, immediate access

### For Production/Teams
- Use **Supabase Mode** for real deployments
- Better security and multi-user support
- Professional appearance

### For Demos/Presentations
- Either mode works great
- Demo mode provides instant access
- Supabase mode shows professional capabilities

---

## 🔍 **Troubleshooting**

### "Demo Mode" Still Showing After Supabase Setup
1. Check your `.env.local` file exists in the project root
2. Verify environment variable names are exactly:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Restart your development server
4. Check the browser console for any Supabase connection errors

### Login Not Working in Supabase Mode
1. Verify you ran the database schema (`supabase-schema.sql`)
2. Check your Supabase project is active
3. Try creating a new account instead of signing in

### Data Not Syncing
1. Check your internet connection
2. Verify Supabase project is active in the dashboard
3. Check browser console for any API errors

---

*This authentication system provides the flexibility to start simple and grow into a full production system when ready.* 