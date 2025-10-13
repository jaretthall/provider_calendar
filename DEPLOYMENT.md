# Clinica Provider Schedule - Production Deployment Guide

## 🚀 Production Build Status: **READY**

The Clinica Provider Schedule application is now production-ready with optimized builds, proper environment handling, and comprehensive deployment options.

---

## 📋 Prerequisites

### System Requirements
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Browser Support**: Chrome 80+, Firefox 78+, Safari 14+, Edge 88+

### Environment Variables
Ensure your `.env` file contains the following variables:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🔧 Build Scripts

### Development
```bash
npm run dev                 # Start development server
npm run type-check         # Run TypeScript type checking
```

### Production Build
```bash
npm run build:prod         # Build for production (optimized)
npm run preview:prod       # Build and preview production locally
npm run clean              # Clean dist directory
```

### Analysis & Testing
```bash
npm run build:analyze      # Build with bundle analysis
npm run lint               # Run type checking
npm run serve              # Serve production build on port 8080
```

---

## 🏗️ Production Build Features

### Performance Optimizations
- ✅ **Code Splitting**: Automatic vendor chunk separation
- ✅ **Tree Shaking**: Dead code elimination
- ✅ **Minification**: ES build with optimized output
- ✅ **Asset Optimization**: Images, CSS, and JS optimization
- ✅ **Compression**: Gzip-optimized bundles
- ✅ **Modern Targets**: ES2020+ for better performance

### Bundle Analysis
```
dist/assets/css/index-[hash].css      ~10.5 kB │ gzip: ~2.4 kB
dist/assets/js/vendor-react-[hash].js ~12.0 kB │ gzip: ~4.3 kB
dist/assets/js/vendor-dnd-[hash].js   ~43.1 kB │ gzip: ~14.3 kB
dist/assets/js/vendor-supabase-[hash].js ~113 kB │ gzip: ~31 kB
dist/assets/js/vendor-pdf-[hash].js   ~554 kB │ gzip: ~163 kB
dist/assets/js/index-[hash].js        ~321 kB │ gzip: ~91 kB
```

### Security Features
- ✅ **Console Removal**: All console.log statements removed in production
- ✅ **Debug Removal**: Debugger statements stripped
- ✅ **Source Maps**: Disabled for production security
- ✅ **Environment Isolation**: Proper variable handling

---

## 🌐 Deployment Options

### Option 1: Static Hosting (Recommended)
**Best for:** Vercel, Netlify, GitHub Pages, AWS S3 + CloudFront

1. **Build the application:**
   ```bash
   npm run build:prod
   ```

2. **Deploy the `dist` folder** to your static hosting provider

3. **Configure routing** (for SPA):
   - Add redirect rules for client-side routing
   - Example for Netlify: `_redirects` file with `/* /index.html 200`

### Option 2: Docker Deployment
**Best for:** Docker containers, Kubernetes, cloud platforms

1. **Create Dockerfile:**
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY . .
   RUN npm run build:prod
   
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/nginx.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and run:**
   ```bash
   docker build -t clinica-schedule .
   docker run -p 80:80 clinica-schedule
   ```

### Option 3: Node.js Server
**Best for:** Traditional hosting, VPS, shared hosting

1. **Install serve globally:**
   ```bash
   npm install -g serve
   ```

2. **Build and serve:**
   ```bash
   npm run build:prod
   serve -s dist -p 8080
   ```

---

## 🔒 Security Configuration

### Environment Variables
- Never commit `.env` files to version control
- Use platform-specific environment variable systems in production
- Ensure Supabase RLS (Row Level Security) is properly configured

### Content Security Policy (CSP)
Add to your hosting platform or server configuration:
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' esm.sh; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' *.supabase.co
```

---

## 📊 Performance Monitoring

### Core Web Vitals Targets
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Bundle Size Monitoring
- Total bundle size: ~1.1MB (gzipped: ~306KB)
- Main thread blocking time: < 50ms
- Time to Interactive: < 3.5s

---

## 🚀 Platform-Specific Deployment

### Vercel
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Build settings:
   - Build Command: `npm run build:prod`
   - Output Directory: `dist`
   - Install Command: `npm ci`

### Netlify
1. Connect repository to Netlify
2. Build settings:
   - Build command: `npm run build:prod`
   - Publish directory: `dist`
3. Add `_redirects` file: `/* /index.html 200`

### AWS S3 + CloudFront
1. Build: `npm run build:prod`
2. Upload `dist` contents to S3 bucket
3. Configure CloudFront distribution
4. Set up Route 53 for custom domain

### DigitalOcean App Platform
1. Connect repository
2. Set build command: `npm run build:prod`
3. Set output directory: `dist`
4. Configure environment variables

---

## 🔧 Server Configuration

### Nginx (if using custom server)
```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/clinica-schedule/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## 🧪 Production Testing Checklist

### Pre-Deployment
- [ ] Run `npm run build:prod` successfully
- [ ] Test `npm run preview:prod` locally
- [ ] Verify all environment variables are set
- [ ] Check console for errors (should be none)
- [ ] Test core functionality (calendar views, CRUD operations)
- [ ] Verify Supabase connection works
- [ ] Test PDF export functionality
- [ ] Check mobile responsiveness

### Post-Deployment
- [ ] Verify application loads correctly
- [ ] Test authentication flow (if using Supabase auth)
- [ ] Verify data persistence
- [ ] Check all calendar views (Month, Week, Day)
- [ ] Test drag-and-drop functionality
- [ ] Confirm PDF export works
- [ ] Monitor performance metrics
- [ ] Check error tracking

---

## 📈 Monitoring & Maintenance

### Recommended Tools
- **Error Tracking**: Sentry, LogRocket
- **Performance**: Google PageSpeed Insights, GTmetrix
- **Uptime**: UptimeRobot, Pingdom
- **Analytics**: Google Analytics, Plausible

### Update Strategy
- Monitor security updates for dependencies
- Test updates in staging environment first
- Keep Supabase client up to date
- Regular performance audits

---

## 🆘 Troubleshooting

### Common Issues

**Build fails with PostCSS error:**
- Ensure `@tailwindcss/postcss` is installed
- Check `postcss.config.js` configuration

**Environment variables not working:**
- Verify variables start with `VITE_`
- Check `.env` file exists and is properly formatted
- Restart development server after changes

**Supabase connection issues:**
- Verify URL and anon key are correct
- Check Supabase project status
- Ensure RLS policies are configured

**Performance issues:**
- Check bundle size with `npm run build:analyze`
- Consider lazy loading heavy components
- Optimize images and assets

---

## 📞 Support

For deployment issues or questions:
1. Check this documentation first
2. Review the application logs
3. Test in a clean environment
4. Check browser console for errors

---

**Current Version:** v0.2.2  
**Last Updated:** January 2025  
**Status:** ✅ Production Ready 