# Admin Panel Setup & Usage Guide

## 🎯 Overview
Your Coupon Finder application now includes a complete admin panel with the following features:

### Features Built:
1. **Admin Dashboard** - Overview statistics and quick actions
2. **Coupon Manager** - Add, edit, delete, approve/reject coupons
3. **Brand Manager** - Manage brands and their details
4. **User Manager** - Track users, partners, and their status
5. **Category Manager** - Create and manage categories with subcategories
6. **Analytics** - View statistics, performance metrics, and reports
7. **Authentication** - Secure admin login system

---

## 🔐 Admin Credentials

### Demo Admin Accounts:
```
Email: admin@coupon-finder.com
Password: admin123
Role: Super Admin (Full Access)

OR

Email: manager@coupon-finder.com
Password: manager123
Role: Admin (Full Access)
```

---

## 🚀 How to Access the Admin Panel

### Method 1: Direct Access
1. Click the **"Admin"** button in the top-right corner of the website
2. You'll be redirected to the admin login page
3. Enter the credentials above
4. You'll see the admin dashboard

### Method 2: Manual URL
1. Open your browser console (F12)
2. Run: `localStorage.setItem('adminAccess', 'true'); window.location.reload();`
3. Click Admin button and log in

---

## 📊 Admin Panel Features

### 1. Dashboard
- **Real-time Statistics:**
  - Total Coupons
  - Active Coupons
  - Pending Coupons
  - Expired Coupons
  - Total Users
  - Total Brands
  - Total Views
- **Quick Action Buttons**
- **System Status Monitor**

### 2. Coupon Manager
- ➕ **Add New Coupons** - Add coupons with full details
- ✏️ **Edit Coupons** - Modify existing coupons
- ✅ **Approve/Reject** - Review pending coupons
- ❌ **Delete Coupons** - Remove coupons
- 🔍 **Filter by Status** - View all/active/pending/expired coupons
- 👁️ **View Count** - See how many times each coupon has been viewed

### 3. Brand Manager
- 🏷️ **Add Brands** - Create new brand entries
- 📝 **Edit Brands** - Modify brand information
- 🗑️ **Delete Brands** - Remove brands
- 🖼️ **Brand Cards** - Visual brand management interface
- **Track:** Brand name, logo, website, category

### 4. User Manager
- 👥 **View All Users** - See registered users
- 🤝 **Manage Partners** - Track partner accounts
- 📊 **User Statistics** - Total users, partners, regular users
- 🚫 **Status Management** - Set users as Active/Inactive/Banned
- 📈 **Top Submitters** - See who submitted most coupons
- 📉 **Status Distribution** - View user status breakdown

### 5. Category Manager
- 📦 **Add Categories** - Create new categories
- ✏️ **Edit Categories** - Update category details
- 📝 **Subcategories** - Add/remove subcategories
- 🏷️ **Organize** - Keep categories organized
- 🔍 **Search** - Find categories easily

### 6. Analytics
- 📈 **Key Metrics:**
  - Total Views
  - Total Clicks
  - Click-Through Rate (CTR)
  - Average Views per Coupon
- 🏆 **Most Viewed Coupon** - Featured top performer
- 📊 **Category Performance** - See which categories are popular
- 📅 **Weekly Views** - Track trends
- 💾 **Export Data** - Export as CSV or PDF

---

## 💾 Data Storage

All data is stored locally in your browser using **localStorage**:

```javascript
// Coupons
localStorage.getItem('coupons')

// Users
localStorage.getItem('users')

// Brands
localStorage.getItem('brands')

// Categories
localStorage.getItem('categories')

// Admin Session
localStorage.getItem('admin')
```

---

## 🔄 Data Integration

The admin panel uses the same data storage as your main application:
- Coupons added in admin panel appear on the main site
- User statistics update automatically
- Categories sync with the main site

---

## 🛠️ Technical Details

### File Structure:
```
src/
├── context/
│   └── AdminContext.tsx          # Admin authentication context
├── components/
│   ├── AdminLogin.tsx             # Login page
│   ├── AdminLayout.tsx            # Main layout with sidebar
│   ├── AdminDashboard.tsx         # Dashboard overview
│   ├── AdminCouponManager.tsx     # Coupon management
│   ├── AdminBrandManager.tsx      # Brand management
│   ├── AdminUserManager.tsx       # User management
│   ├── AdminCategoryManager.tsx   # Category management
│   └── AdminAnalytics.tsx         # Analytics & reports
└── App.tsx                        # Updated with admin routing
```

### Key Features:
- ✅ Role-based access control (Super Admin/Admin)
- ✅ Secure login system
- ✅ Responsive design
- ✅ Real-time data updates
- ✅ Local storage persistence
- ✅ No backend required (works offline)

---

## 📱 Features for Each Section

### Coupon Manager Features:
- Add new coupons with discount, category, expiry date
- Auto-generate coupon IDs
- Status tracking (pending → active/rejected)
- View count tracking
- Bulk operations support

### Brand Manager Features:
- Logo URL support
- Website URL storage
- Category assignment
- Created date tracking
- Card-based UI for easy browsing

### User Manager Features:
- User role assignment (user/partner)
- Status management
- Submission counting
- Date tracking
- Top submitters ranking

### Category Manager Features:
- Icon emoji support
- Subcategory management
- Description fields
- Expandable/collapsible view
- Quick edit/delete options

### Analytics Features:
- Real-time statistics calculation
- Category performance graphs
- Weekly trend visualization
- Top performers ranking
- Export functionality

---

## 🚀 Next Steps

### To Deploy:
1. **Build:** `npm run build`
2. **Upload:** Upload the `dist` folder to your hosting
3. **Access:** Visit `yoursite.com` → Click Admin button

### To Enhance:
- Add backend database (Firebase, MongoDB, PostgreSQL)
- Implement actual email notifications
- Add user role management
- Create advanced reporting features
- Add bulk import/export

---

## ⚠️ Important Notes

1. **Data Persistence:** Data is stored in browser localStorage only. Clearing cache will delete data. Use backup/export features.

2. **No Backend:** This works completely client-side. For production, consider adding a real backend.

3. **Security:** This is a demo authentication. In production, use proper backend authentication.

4. **Multiple Users:** Since data is localStorage-based, each browser/device has its own data.

---

## 🔐 Security Tips

1. Change default passwords in `AdminContext.tsx`
2. Use HTTPS in production
3. Implement proper backend authentication
4. Add rate limiting for API calls
5. Use environment variables for credentials
6. Add audit logging

---

## 📞 Support

For issues or questions about the admin panel:
1. Check browser console for errors (F12)
2. Verify localStorage has space
3. Try clearing cache and reloading
4. Check that all components are properly imported

---

**Admin Panel Ready! 🎉**
Start managing your coupons now!
