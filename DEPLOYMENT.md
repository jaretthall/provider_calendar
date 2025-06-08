# Production Deployment Guide

## Overview
This guide provides instructions for deploying the Clinica Provider Schedule application to production environments.

## Production Build Configuration ✅ COMPLETED

### Build Optimizations Implemented
- **Manual chunk splitting** for optimal caching and loading
- **Asset optimization** with inline limits and hashing
- **Minification** with esbuild for fast builds
- **Modern browser targeting** for better performance
- **Source map control** for production debugging options

### Available Scripts

```bash
# Development
npm run dev                    # Start development server

# Production Builds
npm run build                  # Standard production build
npm run build:production       # Explicit production build with NODE_ENV
npm run build:analyze         # Build with analysis mode

# Preview & Testing
npm run preview               # Preview development build
npm run preview:production    # Build and preview production version

# Utilities
npm run clean                 # Clean dist directory
npm run type-check           # Run TypeScript type checking
```

## Environment Variables

The application supports the following environment variables:

- `GEMINI_API_KEY` - API key for PDF generation features (optional)
- `NODE_ENV` - Environment mode (development/production)

Create appropriate environment files:
- `.env.local` - Local development overrides
- `.env.production` - Production environment variables

## Deployment Steps

### 1. Prepare for Production

```bash
# Clean previous builds
npm run clean

# Run type checking
npm run type-check

# Build for production
npm run build:production
```

### 2. Static File Hosting (Recommended)

The application is built as a static SPA that can be deployed to:

#### Netlify
```bash
# Build command
npm run build:production

# Publish directory
dist
```

#### Vercel
```bash
# Build command
npm run build:production

# Output directory
dist
```

#### GitHub Pages
```bash
# Build the application
npm run build:production

# Deploy dist/ folder to gh-pages branch
```

#### Traditional Web Server (Apache/Nginx)

Serve the `dist/` directory contents with proper MIME types and SPA routing.

**Nginx Configuration Example:**
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /path/to/dist;
    index index.html;
    
    # Handle SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Performance Optimization Features

#### Chunk Splitting
- **React chunk**: React and React-DOM (~45kb gzipped)
- **DnD chunk**: Drag and drop functionality (~25kb gzipped)  
- **PDF chunk**: PDF generation libraries (~150kb gzipped)
- **Utils chunk**: Utility libraries (~5kb gzipped)

#### Asset Optimization
- Assets under 4KB are inlined as base64
- Hashed filenames for optimal caching
- Separate directories for different asset types

#### Modern Browser Support
- ES2020+ features for smaller bundles
- Tree shaking for unused code elimination
- Optimized dependency bundling

## Production Checklist

### Pre-deployment
- [ ] Run `npm run type-check` - No TypeScript errors
- [ ] Run `npm run build:production` - Successful build
- [ ] Test with `npm run preview:production` - Application works correctly
- [ ] Check bundle size warnings - Under recommended limits
- [ ] Verify all features work in production build

### Security Considerations
- [ ] No sensitive data in environment variables committed to repo
- [ ] HTTPS enabled for production domain
- [ ] Content Security Policy configured if needed
- [ ] API keys properly secured

### Performance Monitoring
- [ ] Monitor initial page load time (target: <3 seconds)
- [ ] Monitor largest contentful paint (target: <2.5 seconds)
- [ ] Monitor cumulative layout shift (target: <0.1)
- [ ] Test on various devices and network conditions

## Troubleshooting

### Build Issues
- **Memory errors**: Increase Node.js memory limit with `--max-old-space-size=4096`
- **Type errors**: Run `npm run type-check` to identify issues
- **Missing dependencies**: Ensure all packages are installed with `npm install`

### Runtime Issues
- **Blank page**: Check browser console for JavaScript errors
- **404 errors**: Ensure SPA routing is configured correctly
- **Performance**: Use browser dev tools to identify bottlenecks

## Monitoring & Maintenance

### Regular Tasks
- Update dependencies monthly
- Monitor application performance
- Review error logs
- Update content and data as needed

### Analytics Integration
The application can be integrated with:
- Google Analytics for usage tracking
- Sentry for error monitoring
- Performance monitoring tools

## Version Management

Current production version: **v0.1.0**

Update version numbers in:
- `package.json` 
- `components/Footer.tsx`

## Support

For deployment issues:
1. Check this documentation
2. Review Vite documentation for build configuration
3. Test locally with production build before deploying
4. Monitor application logs and performance metrics

---

*This deployment guide ensures the Clinica Provider Schedule application is properly configured for production environments with optimal performance and reliability.* 