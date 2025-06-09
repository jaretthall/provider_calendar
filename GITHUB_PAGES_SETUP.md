# GitHub Pages Deployment Guide

This guide explains how to deploy the Clinica Provider Schedule application to GitHub Pages.

## Prerequisites

1. A GitHub account
2. Your code in a GitHub repository
3. Node.js 18+ installed locally

## Setup Steps

### 1. Create GitHub Repository

1. Go to [GitHub](https://github.com) and sign in
2. Click "New repository" or go to https://github.com/new
3. Enter repository name: `Calendar` (or your preferred name)
4. Make sure it's **Public** (GitHub Pages is free for public repos)
5. Click "Create repository"

### 2. Push Your Code

```bash
# In your project directory
git init
git add .
git commit -m "Initial commit: Clinica Provider Schedule v0.2.5"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/Calendar.git
git push -u origin main
```

### 3. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Scroll down to "Pages" in the left sidebar
4. Under "Source", select "GitHub Actions"
5. Click "Save"

### 4. Configure Repository Settings

1. Still in Settings, make sure the repository is **Public**
2. If you need to make it private, you'll need GitHub Pro

### 5. Deploy

The deployment will automatically trigger when you push to the `main` branch. The GitHub Actions workflow will:

1. Install dependencies
2. Build the application using `npm run build:prod`
3. Deploy to GitHub Pages

### 6. Access Your Application

After the deployment completes (usually 2-5 minutes), your application will be available at:

```
https://YOUR_USERNAME.github.io/Calendar/
```

## Application Credentials

**Local Authentication:**
- Username: `admin`
- Password: `CPS2025!Secure`

**Supabase Authentication:**
- If you've set up Supabase, you can also use email/password authentication
- Supports signup, signin, and password reset

## Features Available

- ✅ Full schedule management
- ✅ Provider, clinic, and medical assistant management
- ✅ Drag-and-drop scheduling
- ✅ Import/Export functionality
- ✅ Multiple calendar views (Month, Week, Day)
- ✅ Conflict detection
- ✅ Recurring shifts
- ✅ Vacation tracking
- ✅ Local data persistence
- ✅ Cloud sync (with Supabase setup)

## Updating the Application

To update your deployed application:

1. Make your changes locally
2. Update the version in `package.json` (follow pattern: 0.2.5 → 0.2.6)
3. Commit and push:
   ```bash
   git add .
   git commit -m "Update: description of changes"
   git push
   ```
4. GitHub Actions will automatically redeploy

## Troubleshooting

### Build Fails
- Check the Actions tab in your GitHub repository for error details
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

### Page Not Loading
- Wait 5-10 minutes after deployment
- Check that the repository is public
- Verify GitHub Pages is enabled in repository settings

### Wrong Base Path
- The Vite config automatically sets the base path to `/Calendar/` for production
- If your repository has a different name, update `vite.config.ts`:
  ```typescript
  base: isProduction ? '/YOUR_REPO_NAME/' : '/',
  ```

## Custom Domain (Optional)

To use a custom domain:

1. In your repository settings, go to Pages
2. Add your custom domain in the "Custom domain" field
3. Create a CNAME file in your repository root with your domain name
4. Configure DNS with your domain provider

## Security Notes

- The default password has been updated to `CPS2025!Secure`
- For production use, consider using only Supabase authentication
- All data is stored locally in browser storage unless Supabase is configured
- The application works offline by design

## Support

For issues or questions:
1. Check the Actions tab for deployment logs
2. Review this documentation
3. Ensure your repository is properly configured
4. Verify Node.js and npm versions match requirements 