# ✅ Complete Admin Panel Deployment Guide

## 📋 Quick Setup

### Step 1: Copy Admin Files
Run the PowerShell script to copy admin components:
```powershell
.\copy-admin-files.ps1
```

Or manually copy these files from `src/components/` to `admin/src/components/`:
- AdminLayout.tsx
- AdminDashboard.tsx
- AdminCouponManager.tsx
- AdminBrandManager.tsx
- AdminUserManager.tsx
- AdminCategoryManager.tsx
- AdminAnalytics.tsx

Also copy:
- `src/types.ts` → `admin/src/types.ts`

### Step 2: Test Locally

**Terminal 1 - Main App:**
```bash
npm run dev
```
Access: http://localhost:3000

**Terminal 2 - Admin Panel:**
```bash
npm run dev:admin
```
Access: http://localhost:3001

### Step 3: Build for Production

Build both applications:
```bash
npm run build:all
```

Outputs:
- `dist/` - Main website (for couponfinder.com)
- `admin-dist/` - Admin panel (for admin.couponfinder.com)

---

## 🚀 Deployment Options

### Option A: Deploy on Same Hosting (Subdirectory)

**Hosting:** Any web host (GoDaddy, Hostinger, etc.)

1. Build both apps:
```bash
npm run build:all
```

2. Upload to your server:
```
/public_html/
├── dist/*           → /public_html/
├── admin-dist/*     → /public_html/admin/
```

3. Access:
- Main site: `couponfinder.com`
- Admin: `couponfinder.com/admin`

---

### Option B: Deploy on Vercel (Recommended)

#### Main App:
```bash
# Create new Vercel project
vercel create coupon-finder

# Deploy main app
npm run build
vercel deploy dist/ --prod
```

#### Admin Panel:
```bash
# Create separate Vercel project
vercel create admin-coupon-finder

# Deploy admin panel
npm run build:admin
vercel deploy admin-dist/ --prod
```

**Access:**
- Main: `coupon-finder.vercel.app`
- Admin: `admin-coupon-finder.vercel.app`

---

### Option C: Deploy on Netlify

#### Main App:
1. Go to Netlify.com
2. Click "New site from Git"
3. Select your repository
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy

#### Admin Panel:
1. Go to Netlify.com
2. Create new site with same steps
3. Build command: `npm run build:admin`
4. Publish directory: `admin-dist`
5. Deploy

**Access:**
- Main: `coupon-finder.netlify.app`
- Admin: `admin-coupon-finder.netlify.app`

---

### Option D: Custom Domain with Separate Hosting

**Setup DNS:**
```
Domain: couponfinder.com
Registrar: GoDaddy, Namecheap, etc.

Main Site DNS:
couponfinder.com      → Vercel (IP)

Admin Panel DNS:
admin.couponfinder.com → Different Host (IP)
```

**Deploy:**

1. **Main App to Vercel:**
```bash
vercel deploy dist/ --prod
```

2. **Admin Panel to Netlify:**
```bash
netlify deploy --prod --dir=admin-dist
```

3. **Point DNS Records:**
- `couponfinder.com` → Vercel nameservers
- `admin.couponfinder.com` → Netlify nameservers

---

## 📊 Deployment Matrix

| Platform | Main App | Admin Panel | Cost | Best For |
|----------|----------|-------------|------|----------|
| Vercel + Vercel | ✅ | ✅ | Free | Speed & Simplicity |
| Netlify + Netlify | ✅ | ✅ | Free | Both on same platform |
| Vercel + Netlify | ✅ | ✅ | Free | Flexibility |
| Custom VPS | ✅ | ✅ | $$$ | Full control |
| Hostinger | ✅ | ✅ (subdirectory) | $ | Budget-friendly |
| cPanel Hosting | ✅ | ✅ (subdirectory) | $ | Traditional hosting |

---

## 🔐 Environment Variables

### Main App (.env)
```
VITE_API_URL=https://api.couponfinder.com
VITE_ADMIN_URL=https://admin.couponfinder.com
```

### Admin Panel (.env in admin folder)
```
VITE_API_URL=https://api.couponfinder.com
VITE_MAIN_URL=https://couponfinder.com
```

---

## 🌐 Complete Deployment Checklist

### Pre-Deployment
- [ ] Run `npm run build:all` - Both apps build successfully
- [ ] Test main app locally: `npm run dev`
- [ ] Test admin locally: `npm run dev:admin`
- [ ] All admin features working
- [ ] Credentials stored securely
- [ ] Data persists in localStorage

### Deployment
- [ ] Choose hosting platform
- [ ] Create projects/sites
- [ ] Build and deploy main app
- [ ] Build and deploy admin panel
- [ ] Setup DNS/domain records
- [ ] Test on production URLs
- [ ] Setup HTTPS/SSL (automatic on Vercel/Netlify)

### Post-Deployment
- [ ] Access main site - works ✓
- [ ] Access admin panel - works ✓
- [ ] Admin login works
- [ ] All features functional
- [ ] Data syncs properly
- [ ] Check console for errors
- [ ] Test on mobile devices

---

## 📝 Access Information for Production

### Main Website
**URL:** `https://couponfinder.com`
**Purpose:** Public coupon marketplace
**Access:** Everyone

### Admin Panel
**URL:** `https://admin.couponfinder.com`
**Login Email:** `admin@coupon-finder.com`
**Login Password:** `admin123`
**Purpose:** Manage coupons, brands, users, analytics
**Access:** Admin only

---

## 🔄 Continuous Deployment (Optional)

### With Vercel
```bash
# Just push to GitHub, Vercel auto-deploys
git push origin main
```

### With Netlify
```bash
# Connect GitHub repo, Netlify auto-deploys
# Push to main branch triggers automatic build
git push origin main
```

---

## 💡 Tips for Success

1. **Use Same Domain:** Easier for users and data sharing
   ```
   couponfinder.com/admin
   ```

2. **Use Subdomains:** Professional and scalable
   ```
   admin.couponfinder.com
   ```

3. **Backup Data:** Export periodically
   ```javascript
   const backup = localStorage.getItem('coupons');
   ```

4. **Monitor Performance:** Check build sizes
   - Main: ~150 KB (gzipped)
   - Admin: ~80 KB (gzipped)

5. **Update Credentials:** Change default passwords in production

---

## 🆘 Troubleshooting Deployment

### Build Fails
```bash
# Clear node modules and rebuild
rm -rf node_modules
npm install
npm run build:all
```

### Admin Not Loading
- Check browser console (F12)
- Verify admin folder exists
- Ensure all components copied
- Check for TypeScript errors

### CORS Issues (Different Domains)
```javascript
// Add to headers when deploying on separate domains
Access-Control-Allow-Origin: *
```

### Data Not Syncing
- If same domain: Should auto-sync via localStorage
- If different domains: Implement API endpoint for data sync

---

## 🎯 Final Commands Reference

```bash
# Development
npm run dev              # Main app on :3000
npm run dev:admin       # Admin on :3001

# Production Build
npm run build           # Build main only → dist/
npm run build:admin     # Build admin only → admin-dist/
npm run build:all       # Build both

# Cleanup
npm run clean           # Remove dist and admin-dist

# Preview
npm run preview         # Preview main build
npm run preview:admin   # Preview admin build
```

---

## ✨ You're All Set!

Your separate admin panel is ready to deploy. Choose your hosting provider and follow the specific deployment option above.

**Questions?** Check the console for errors or review the SEPARATE_ADMIN_SETUP.md file.

**Good luck with your deployment! 🚀**
