# 🚀 Deployment Guide - Production Launch

**Goal:** Deploy app to production  
**Time:** Week 9 (1-2 days)  
**Platform:** Vercel (recommended)

---

## 📚 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Vercel Deployment](#vercel-deployment)
3. [Domain Configuration](#domain-configuration)
4. [Environment Setup](#environment-setup)
5. [Post-Deployment](#post-deployment)

---

## ✅ Pre-Deployment Checklist

### Code Quality

- [ ] All features working locally
- [ ] No console errors
- [ ] TypeScript compiles without errors
- [ ] Build succeeds: `npm run build`
- [ ] Preview build works: `npm run preview`
- [ ] Mobile responsive tested
- [ ] Cross-browser tested (Chrome, Firefox, Safari)

### Content

- [ ] At least 1 complete course uploaded
- [ ] All images optimized
- [ ] All videos uploaded to YouTube
- [ ] Course pricing set
- [ ] Terms & Privacy pages created

### Backend

- [ ] Supabase production database ready
- [ ] Database seeded with real data
- [ ] RLS policies tested
- [ ] Authentication working
- [ ] Payment gateway configured

### Security

- [ ] No sensitive data in code
- [ ] All secrets in environment variables
- [ ] HTTPS enforced
- [ ] CORS configured
- [ ] Rate limiting (optional)

### Performance

- [ ] Images WebP format
- [ ] Code splitting implemented
- [ ] Lazy loading working
- [ ] Bundle size < 500KB
- [ ] Lighthouse score > 85

---

## 🚀 Vercel Deployment

### Why Vercel?

✅ **Free tier generous** (100GB bandwidth/month)  
✅ **Automatic HTTPS** (SSL certificates)  
✅ **Global CDN** (fast worldwide)  
✅ **Easy GitHub integration** (auto-deploy on push)  
✅ **Environment variables** (secure secrets)  
✅ **Custom domains** (free)  
✅ **Preview deployments** (test before production)

---

### Step 1: Create Vercel Account

**Go to:** https://vercel.com

```
1. Click "Sign Up"
2. Choose "Continue with GitHub"
3. Authorize Vercel
4. Verify email
5. Complete profile
```

---

### Step 2: Push to GitHub

**If not already on GitHub:**

```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - ready for deployment"

# Create GitHub repo (on github.com)
# Then link:
git remote add origin https://github.com/yourusername/hoangữ.git

# Push
git push -u origin main
```

---

### Step 3: Import Project to Vercel

**In Vercel Dashboard:**

```
1. Click "Add New Project"
2. Click "Import Git Repository"
3. Select your GitHub repo
4. Click "Import"
5. Configure project:
   
   Framework Preset: Vite
   Root Directory: ./
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install

6. Click "Deploy" (will fail first - need env vars)
```

---

### Step 4: Add Environment Variables

**In Vercel Project Settings:**

```
1. Go to Settings → Environment Variables
2. Add all variables from .env.local:

Production Environment Variables:

VITE_SUPABASE_URL = https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGc...
VITE_VNPAY_TMN_CODE = YOUR_PRODUCTION_CODE
VITE_VNPAY_HASH_SECRET = YOUR_PRODUCTION_SECRET
VITE_VNPAY_URL = https://vnpay.vn/paymentv2/vpcpay.html
VITE_VNPAY_RETURN_URL = https://hoangữ.com/payment/callback
VITE_APP_ENV = production

3. Click "Save"
4. Redeploy
```

---

### Step 5: Deploy

```
1. Go to Deployments tab
2. Click "..." → Redeploy
3. Wait 2-3 minutes
4. Deployment succeeds ✅
5. Click "Visit" to see live site
```

**Your site is now live at:**
```
https://your-project.vercel.app
```

---

## 🌐 Domain Configuration

### Option 1: Use Vercel Domain (Free)

**Already done!**
```
Your site: https://hoangữ.vercel.app
```

Pros:
- ✅ Free
- ✅ HTTPS included
- ✅ Works immediately

Cons:
- ❌ Not custom branded
- ❌ Longer URL

---

### Option 2: Custom Domain (Recommended)

**Step 1: Buy Domain**

**Recommended registrars:**
- **Namecheap** (https://namecheap.com) - $8-12/year
- **GoDaddy** (https://godaddy.com) - $10-15/year  
- **Google Domains** (https://domains.google) - $12/year

**Search for:**
```
hoangữ.com
hoangữ.vn
learnhoangu.com
etc.
```

**Buy domain** (typically $10-15/year)

---

**Step 2: Add Domain to Vercel**

**In Vercel Project:**

```
1. Go to Settings → Domains
2. Enter your domain: hoangữ.com
3. Click "Add"
4. Vercel shows DNS records needed
```

---

**Step 3: Configure DNS**

**In your domain registrar (Namecheap, etc):**

```
1. Go to DNS settings
2. Add these records:

Type: A
Name: @
Value: 76.76.21.21
TTL: Automatic

Type: CNAME  
Name: www
Value: cname.vercel-dns.com
TTL: Automatic

3. Save changes
4. Wait 10-60 minutes for DNS propagation
```

---

**Step 4: Verify**

**In Vercel:**

```
1. Vercel automatically checks DNS
2. When ready, shows "Valid Configuration" ✅
3. SSL certificate issued automatically
4. Your site is now at: https://hoangữ.com
```

---

## 🔧 Environment Setup

### Production Supabase

**Create production database:**

```
1. In Supabase Dashboard
2. Create NEW project: "hoangữ-prod"
3. Use strong password
4. Same region as before
5. Run schema from /supabase_setup.sql
6. Seed with production data
7. Update Vercel env vars with prod URL/key
```

---

### Production VNPay

**Switch to real VNPay:**

```
1. Use approved merchant account
2. Get production credentials
3. Update Vercel env vars:
   VITE_VNPAY_TMN_CODE = REAL_CODE
   VITE_VNPAY_HASH_SECRET = REAL_SECRET
   VITE_VNPAY_URL = https://vnpay.vn/paymentv2/vpcpay.html
   VITE_VNPAY_RETURN_URL = https://hoangữ.com/payment/callback
4. Redeploy
5. Test with small transaction
```

---

## 📊 Post-Deployment

### Step 1: Setup Analytics

**Google Analytics 4:**

```
1. Go to https://analytics.google.com
2. Create account
3. Create property: "HoaNgữ"
4. Get Measurement ID: G-XXXXXXXXXX
5. Add to <head> in index.html:

<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>

6. Commit & push
7. Verify tracking works
```

---

### Step 2: Setup Error Tracking (Optional)

**Sentry (Free tier):**

```bash
npm install @sentry/react

# In main.tsx:
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: "production",
});
```

---

### Step 3: Setup Monitoring

**Vercel Analytics (Free):**

```
1. In Vercel Dashboard
2. Go to Analytics tab
3. Enable Web Analytics
4. Add package:
   npm install @vercel/analytics

5. In App.tsx:
   import { Analytics } from '@vercel/analytics/react';
   
   <Analytics />

6. Commit & deploy
```

---

### Step 4: Test Production

**Critical tests:**

- [ ] Homepage loads
- [ ] Can signup new user
- [ ] Can login
- [ ] Course listing shows
- [ ] Course detail opens
- [ ] Video plays
- [ ] Can enroll (free or paid)
- [ ] Dashboard shows data
- [ ] Payment works (test transaction)
- [ ] Mobile responsive
- [ ] No console errors

---

### Step 5: SEO Optimization

**Update meta tags in `index.html`:**

```html
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  
  <!-- SEO -->
  <title>HoaNgữ - Học tiếng Hoa chuẩn Bắc Kinh</title>
  <meta name="description" content="Học tiếng Hoa online hiệu quả với HoaNgữ. Khóa học HSK 1-6, luyện phát âm, flashcard thông minh. Chỉ 90 ngày nói thành thạo." />
  <meta name="keywords" content="học tiếng trung, học tiếng hoa, HSK, tiếng hoa online, học tiếng trung online" />
  
  <!-- Open Graph -->
  <meta property="og:title" content="HoaNgữ - Học tiếng Hoa chuẩn Bắc Kinh" />
  <meta property="og:description" content="Học tiếng Hoa online hiệu quả - Chỉ 90 ngày nói thành thạo" />
  <meta property="og:image" content="https://hoangữ.com/og-image.jpg" />
  <meta property="og:url" content="https://hoangữ.com" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="HoaNgữ - Học tiếng Hoa" />
  <meta name="twitter:description" content="Học tiếng Hoa online hiệu quả" />
  <meta name="twitter:image" content="https://hoangữ.com/og-image.jpg" />
  
  <!-- Favicon -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
</head>
```

---

**Create `public/robots.txt`:**

```txt
User-agent: *
Allow: /

Sitemap: https://hoangữ.com/sitemap.xml
```

---

**Create `public/sitemap.xml`:**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://hoangữ.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://hoangữ.com/courses</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <!-- Add more URLs -->
</urlset>
```

---

## 🔐 Security Checklist

**Before launch:**

- [ ] HTTPS enabled (auto by Vercel)
- [ ] Environment variables secure
- [ ] No API keys in frontend code
- [ ] SQL injection protected (Supabase handles)
- [ ] XSS protection (React handles)
- [ ] CSRF tokens (if needed)
- [ ] Rate limiting (Supabase RLS)
- [ ] Input validation
- [ ] Password requirements enforced
- [ ] Secure payment handling

---

## ⚡ Performance Optimization

**Quick wins:**

```bash
# 1. Optimize images
npm install sharp
# Convert images to WebP

# 2. Analyze bundle
npm run build -- --mode analyze

# 3. Check Lighthouse
# In Chrome DevTools → Lighthouse
# Run audit

# 4. Fix issues
# - Code splitting
# - Lazy loading
# - Remove unused deps
# - Minify assets
```

**Target scores:**
- Performance: >90
- Accessibility: >90
- Best Practices: >95
- SEO: >90

---

## 🐛 Common Issues

### Issue 1: Build fails

```bash
# Check build locally first
npm run build

# If succeeds locally, check Vercel logs
# Usually: missing env vars or Node version

# Fix: Set Node version in package.json
{
  "engines": {
    "node": "18.x"
  }
}
```

---

### Issue 2: 404 on routes

**Vercel config for SPA routing:**

**Create `vercel.json`:**

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### Issue 3: Environment variables not working

```
1. Check variable names start with VITE_
2. Redeploy after adding vars
3. Check production vs preview environment
4. Verify in Vercel dashboard
```

---

### Issue 4: CORS errors

```typescript
// Supabase CORS is permissive
// If issues, add domain to Supabase allowed origins:
// Supabase Dashboard → Settings → API → Allowed Origins
// Add: https://hoangữ.com
```

---

## 📋 Launch Day Checklist

**Morning of launch:**

- [ ] Final test on production
- [ ] Backup database
- [ ] Monitor error logs
- [ ] Prepare support channels
- [ ] Social media posts ready
- [ ] Email list ready

**During launch:**

- [ ] Post on Facebook
- [ ] Post on Instagram
- [ ] Send email announcement
- [ ] Monitor analytics
- [ ] Respond to comments
- [ ] Fix critical bugs immediately

**End of day:**

- [ ] Check analytics (visitors, signups)
- [ ] Review error logs
- [ ] Respond to support requests
- [ ] Celebrate! 🎉

---

## 📊 Monitoring

### Daily Checks

```
1. Vercel Dashboard → Analytics
   - Visitors count
   - Page views
   - Response times

2. Google Analytics
   - Active users
   - Popular pages
   - Traffic sources

3. Supabase Dashboard
   - Database size
   - Active connections
   - Query performance

4. Error logs
   - Sentry dashboard
   - Vercel logs
```

---

## 🆘 Rollback Plan

**If critical bug found:**

```
1. In Vercel Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Fix bug locally
5. Test thoroughly
6. Redeploy
```

---

## 💰 Costs

### Vercel

**Free tier includes:**
- 100GB bandwidth
- Unlimited deployments
- Custom domain
- HTTPS
- Analytics

**Pro tier ($20/month):**
- Needed if >100GB/month
- Advanced analytics
- Password protection
- More

**Start with free tier!**

---

### Supabase

**Free tier includes:**
- 500MB database
- 2GB file storage
- 50,000 monthly active users
- 2GB egress

**Pro tier ($25/month):**
- 8GB database
- 100GB storage
- Needed when growing

**Start with free tier!**

---

### Domain

**Annual cost: $10-15**

### Total First Year

**Minimal:** $10 (domain only)
**With some traffic:** $10-50/month
**Growing:** $50-100/month

---

## 🚀 Next Steps

**After successful deployment:**

1. ✅ Read `/LAUNCH_CHECKLIST.md`
2. ✅ Prepare marketing materials
3. ✅ Invite beta testers
4. ✅ Collect feedback
5. ✅ Iterate & improve

---

**Last Updated:** March 14, 2026  
**Estimated Time:** 4-8 hours  
**Difficulty:** ⭐⭐⭐ Medium

---

**Congratulations on deploying! 🎉**
