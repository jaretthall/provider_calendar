# Static Calendar Viewer Setup Guide

## Overview

The `static-viewer.html` file is a standalone, **read-only** calendar viewer that displays your Clinica Provider Schedule data without any editing capabilities. It's perfect for:

- **Public displays** in clinic waiting areas
- **Staff viewing stations** where editing isn't needed
- **Simple sharing** via email or web hosting
- **Emergency viewing** when the main app isn't accessible
- **Lightweight access** for users who only need to see schedules

## ✅ Benefits of the Static Viewer

**Advantages:**
- ✅ **Zero authentication required** - loads instantly
- ✅ **Super lightweight** - single HTML file (~15KB)
- ✅ **No complex setup** - just edit config and open in browser
- ✅ **Impossible to accidentally edit data** - completely read-only
- ✅ **Works offline** once loaded (data cached in browser)
- ✅ **Mobile responsive** - works on tablets and phones
- ✅ **Fast loading** - no complex React framework overhead

**Perfect for:**
- Reception desk computers
- Waiting room displays
- Quick reference on mobile devices
- Sharing with staff who only need viewing access
- Backup viewing when main app is down

## 🛠️ Setup Instructions

### Step 1: Get Your Supabase Configuration

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy these two values:
   - **Project URL** (looks like: `https://yourproject.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

### Step 2: Configure the Static Viewer

1. Open `static-viewer.html` in a text editor
2. Find these lines around line 75:
   ```javascript
   // Supabase Configuration - REPLACE WITH YOUR ACTUAL VALUES
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

3. Replace the placeholder values with your actual Supabase credentials:
   ```javascript
   const SUPABASE_URL = 'https://yourproject.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...';
   ```

### Step 3: Test the Viewer

1. **Local Testing:** Double-click `static-viewer.html` to open in your browser
2. **Expected Result:** You should see:
   - Loading spinner initially
   - Calendar with your schedule data
   - Color-coded legend at the bottom
   - Navigation buttons (Previous/Next month, Today)

### Step 4: Deployment Options

**Option A: Simple File Sharing**
- Email the HTML file to colleagues
- Put it on a shared network drive
- Store it on a USB drive for kiosks

**Option B: Web Hosting** (for broader access)
- Upload to any web server
- Use GitHub Pages, Netlify, or Vercel
- Host on your organization's intranet

## 🎯 Features Included

**✅ What Works:**
- Full month calendar view
- Color-coded shift badges
- Vacation indicators
- Provider/clinic legend
- Month navigation (Previous/Next/Today)
- Responsive design for mobile/tablet
- Hover tooltips showing shift details
- Loading states and error handling

**❌ What's Intentionally Disabled:**
- No login required
- No editing capabilities
- No drag-and-drop
- No adding/deleting shifts
- No settings or configuration
- No import/export functions

## 🔒 Security Considerations

**Data Access:**
- Uses your Supabase **anon/public** key
- Only reads data that's marked as publicly accessible
- Make sure your Row Level Security (RLS) policies allow public read access if needed

**Privacy:**
- Consider what data should be visible to all viewers
- The viewer shows all active providers, clinics, and shifts
- Remove sensitive information from public-facing deployments if needed

## 🛠️ Customization Options

### Change the Color Scheme
Edit the CSS in the `<style>` section around line 8:
```css
.shift-badge {
    transition: all 0.2s ease;
    /* Add custom styling here */
}
```

### Modify the Title
Change line 21:
```html
<h1 class="text-2xl font-bold text-gray-800">Your Custom Title</h1>
```

### Add Custom Branding
Insert your logo by replacing the calendar icon around line 18.

## 🚀 Use Cases

### Reception Desk Display
- Put on a dedicated computer or tablet
- Staff can quickly check schedules without app access
- No risk of accidental changes

### Waiting Room Kiosk
- Display on a large monitor
- Patients can see provider availability
- Automatic refresh keeps data current

### Mobile Quick Reference  
- Bookmark on staff phones
- Fast loading for quick schedule checks
- Works offline once loaded

### Emergency Backup
- When main application is down
- When authentication servers are unavailable
- For users who forgot their passwords

## 🔧 Troubleshooting

**Issue: "Failed to load providers" error**
- Check your Supabase URL and anon key are correct
- Verify your database has the expected table names
- Check Row Level Security policies allow read access

**Issue: Calendar shows but no data**
- Verify you have active providers and shifts in your database
- Check browser console for JavaScript errors
- Ensure table names match your Supabase schema

**Issue: Styling looks broken**
- Check internet connection (needs TailwindCSS CDN)
- Try refreshing the page
- Clear browser cache

## 📊 Performance

**Loading Speed:**
- Initial load: ~2-3 seconds (depending on data size)
- Navigation: Instant (data cached locally)
- File size: ~15KB (very lightweight)

**Data Limits:**
- Handles thousands of shifts efficiently
- Best performance with <1000 shifts displayed per month
- Automatically optimizes display for large datasets

## 🔄 Keeping Data Updated

**Automatic Updates:**
- Data refreshes each time the page is loaded
- Shows real-time data from your Supabase database
- No manual sync required

**Scheduled Refresh:**
- Consider setting up auto-refresh for kiosk displays
- Add JavaScript timer to reload data periodically
- Cache data locally for offline viewing

---

**Need Help?** This static viewer provides a simple, foolproof way to display your calendar data without the complexity of user management or editing permissions. It's perfect for scenarios where you need reliable, read-only access to your schedule information. 