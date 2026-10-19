# Separate Admin Panel Setup

## 📁 Project Structure

```
coupon-finder/
├── src/                          # Main Website
│   ├── components/
│   │   ├── AdminLogin.tsx        (removed from main app)
│   │   ├── AdminLayout.tsx       (removed from main app)
│   │   └── ... other components
│   └── App.tsx                   (without admin routing)
├── admin/                        # Standalone Admin Panel
│   ├── src/
│   │   ├── AdminApp.tsx          # Main admin app component
│   │   ├── main.tsx              # Entry point
│   │   ├── index.css             # Styles
│   │   ├── components/           # Admin components
│   │   │   ├── AdminLogin.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── AdminCouponManager.tsx
│   │   │   ├── AdminBrandManager.tsx
│   │   │   ├── AdminUserManager.tsx
│   │   │   ├── AdminCategoryManager.tsx
│   │   │   └── AdminAnalytics.tsx
│   │   ├── context/
│   │   │   └── AdminContext.tsx
│   │   └── types.ts              # TypeScript types
│   ├── index.html                # Admin HTML entry point
│   ├── vite.config.ts            # Admin Vite config
│   ├── tailwind.config.ts        # Tailwind config
│   ├── postcss.config.js         # PostCSS config
│   └── tsconfig.json             # TypeScript config
├── package.json                  # Updated with admin scripts
├── vite.config.ts                # Main app Vite config
└── dist/                         # Built main app
    admin-dist/                   # Built admin panel
```

---

## 🚀 Running the Applications

### Option 1: Both Running Locally
```bash
# Terminal 1 - Main Website (Port 3000)
npm run dev

# Terminal 2 - Admin Panel (Port 3001)
npm run dev:admin
```

### Option 2: Only Main Website
```bash
npm run dev
```

### Option 3: Only Admin Panel
```bash
npm run dev:admin
```

---

## 🏗️ Building

### Build Everything
```bash
npm run build:all
```

**Output:**
- `dist/` - Main website (for couponfinder.com)
- `admin-dist/` - Admin panel (for admin.couponfinder.com)

### Build Only Main App
```bash
npm run build
```
**Output:** `dist/`

### Build Only Admin Panel
```bash
npm run build:admin
```
**Output:** `admin-dist/`

---

## 🌐 Deployment Strategy

### Main Website Deployment
```bash
# Build main app
npm run build

# Upload dist/ folder to:
# - couponfinder.com
# - Any web hosting (Vercel, Netlify, etc.)
```

### Admin Panel Deployment

#### Option 1: Separate Domain
```bash
# Build admin panel
npm run build:admin

# Upload admin-dist/ folder to:
# - admin.couponfinder.com
# - Different hosting provider
# - Different server
```

#### Option 2: Subdomain on Same Hosting
```bash
# Upload admin-dist/ to /admin folder on same server
# Access at: couponfinder.com/admin
```

#### Option 3: Different Platform
```bash
# Deploy admin-dist/ on different platform:
# - Vercel: Deploy admin-dist
# - Netlify: Deploy admin-dist
# - AWS S3 + CloudFront
# - Google Cloud Storage
# - Firebase Hosting
```

---

## 🔐 Admin Credentials

```
Email: admin@coupon-finder.com
Password: admin123
Role: Super Admin

OR

Email: manager@coupon-finder.com
Password: manager123
Role: Admin
```

---

## 📊 Admin Panel Features

All admin features are completely independent:

1. **Dashboard** - Real-time statistics
2. **Coupon Manager** - Add/Edit/Delete coupons
3. **Brand Manager** - Manage brands
4. **User Manager** - Track users and partners
5. **Category Manager** - Organize categories
6. **Analytics** - View reports and metrics

---

## 💾 Data Storage

### Shared Data (localStorage)
Both applications use the same browser localStorage:
- `coupons` - All coupons
- `brands` - All brands
- `users` - User information
- `categories` - Product categories
- `admin` - Admin session

### Same Device
```
Main App (Port 3000) ←→ localStorage ←→ Admin Panel (Port 3001)
```

### Different Domains
```
couponfinder.com ←→ localStorage ←→ admin.couponfinder.com
(Shared if same domain, separate if different domains)
```

**Note:** If admin is on different domain/origin, localStorage is isolated. Use backend API to sync data.

---

## 🔄 Data Synchronization

### With Same Domain
Data automatically syncs through localStorage.

### With Different Domains
Implement API communication:

```javascript
// In Admin Panel
async function syncData() {
  const response = await fetch('https://api.couponfinder.com/sync');
  const data = await response.json();
  localStorage.setItem('coupons', JSON.stringify(data.coupons));
}
```

---

## 🚀 Deployment Hosts

### Main Website Options
- **Vercel** - `couponfinder.vercel.app`
- **Netlify** - `couponfinder.netlify.app`
- **GitHub Pages** - `username.github.io`
- **Custom Domain** - `couponfinder.com`

### Admin Panel Options
- **Vercel** - `admin-couponfinder.vercel.app`
- **Netlify** - `admin.netlify.app`
- **Heroku** - For Node.js backend
- **AWS Amplify** - AWS hosting
- **Firebase Hosting** - `admin-couponfinder.web.app`
- **Same Hosting** - `/admin` subdirectory

---

## 📦 Production Build Sizes

```
Main App:     ~150 KB (gzipped)
Admin Panel:  ~80 KB (gzipped)
Total:        ~230 KB (gzipped)
```

---

## 🛠️ Environment Setup

### For Main Website
```env
VITE_API_URL=https://api.couponfinder.com
VITE_ADMIN_URL=https://admin.couponfinder.com
```

### For Admin Panel
```env
VITE_API_URL=https://api.couponfinder.com
VITE_MAIN_URL=https://couponfinder.com
```

---

## 🔗 Linking Them Together

### Add Link in Main App Header
```jsx
<a href="https://admin.couponfinder.com" className="admin-link">
  Admin Panel
</a>
```

### Add Back Link in Admin
```jsx
<a href="https://couponfinder.com" className="back-link">
  Back to Website
</a>
```

---

## 📝 Steps to Deploy Separately

### Step 1: Build Both Apps
```bash
npm run build:all
```

### Step 2: Deploy Main App
```bash
# Using Vercel
vercel deploy dist/ --prod

# Using Netlify
netlify deploy --prod --dir=dist

# Using custom hosting
# FTP upload dist/ folder
```

### Step 3: Deploy Admin Panel
```bash
# Using different Vercel project
vercel deploy admin-dist/ --prod

# Using different Netlify project
netlify deploy --prod --dir=admin-dist

# Using different hosting
# FTP upload admin-dist/ folder
```

### Step 4: Update DNS Records
```
couponfinder.com          → points to main app host
admin.couponfinder.com    → points to admin panel host
```

---

## ✅ Verification Checklist

- [ ] Main app builds: `npm run build`
- [ ] Admin panel builds: `npm run build:admin`
- [ ] Main app works locally: `npm run dev`
- [ ] Admin panel works locally: `npm run dev:admin`
- [ ] Both can access same localStorage data
- [ ] Admin login works with demo credentials
- [ ] All admin features working
- [ ] Data persists after refresh
- [ ] Build sizes are acceptable

---

## 🔒 Security Notes

1. **Change Default Credentials** - Update in `admin/src/context/AdminContext.tsx`
2. **Use HTTPS** - Always use HTTPS in production
3. **Add Backend Auth** - Don't rely on localStorage alone
4. **Rate Limiting** - Implement API rate limiting
5. **CORS Headers** - Configure proper CORS for API calls
6. **Environment Variables** - Use `.env` files for sensitive data

---

## 🆘 Troubleshooting

### Admin Panel Won't Load
```bash
# Clear cache
npm run clean

# Rebuild
npm run build:admin

# Check for TypeScript errors
tsc --noEmit
```

### Data Not Syncing Between Apps
- If different domains: Implement API endpoint
- If same domain: Check localStorage permissions
- Check browser console for errors

### Port Already in Use
```bash
# Change port in admin/vite.config.ts
port: 3002  # Change to different port
```

---

## 📞 Next Steps

1. Copy `admin/src/components/*` from main app components
2. Run: `npm run build:admin`
3. Deploy `admin-dist/` to your hosting
4. Update DNS/subdomain settings
5. Test admin panel on live domain

---

**You now have a completely separate admin application! 🎉**
