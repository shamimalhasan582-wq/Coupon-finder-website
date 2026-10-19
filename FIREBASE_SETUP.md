# 🔥 Firebase & Firestore Setup Guide

## Step 1: Create Firebase Project

### 1.1 Go to Firebase Console
- Visit: https://console.firebase.google.com
- Click "Create a project"

### 1.2 Project Details
- **Project Name:** `coupon-finder`
- **Enable Google Analytics:** Yes (optional)
- Click "Create project"
- Wait for setup to complete

### 1.3 Enable Firestore
- In Firebase Console, go to **Build** > **Firestore Database**
- Click "Create database"
- **Location:** Select closest region to you
- **Start in test mode** (we'll add security rules later)
- Click "Create"

---

## Step 2: Get Firebase Configuration

### 2.1 Get Web App Credentials
1. In Firebase Console, click the gear icon (⚙️) **Project Settings**
2. Go to **Your apps** section
3. Look for your web app (or create one by clicking `</>`  icon)
4. Copy the `firebaseConfig` object

### 2.2 Example Config (DO NOT USE)
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxKAk7Dz9X2e3k4m5n6o7p8q9r0s1t2u3",
  authDomain: "coupon-finder.firebaseapp.com",
  projectId: "coupon-finder",
  storageBucket: "coupon-finder.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abc123def456ghi789"
};
```

---

## Step 3: Add Firebase Config to Your Project

### 3.1 Create `.env` File
Create a new file named `.env` in your project root (same level as `package.json`):

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=YOUR_API_KEY_HERE
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN_HERE
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID_HERE
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET_HERE
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID_HERE
VITE_FIREBASE_APP_ID=YOUR_APP_ID_HERE
```

### 3.2 Fill in Your Values
From the Firebase config you copied, fill in:
- `VITE_FIREBASE_API_KEY` ← copy `apiKey`
- `VITE_FIREBASE_AUTH_DOMAIN` ← copy `authDomain`
- `VITE_FIREBASE_PROJECT_ID` ← copy `projectId`
- `VITE_FIREBASE_STORAGE_BUCKET` ← copy `storageBucket`
- `VITE_FIREBASE_MESSAGING_SENDER_ID` ← copy `messagingSenderId`
- `VITE_FIREBASE_APP_ID` ← copy `appId`

**Example .env file:**
```
VITE_FIREBASE_API_KEY=AIzaSyDxKAk7Dz9X2e3k4m5n6o7p8q9r0s1t2u3
VITE_FIREBASE_AUTH_DOMAIN=coupon-finder.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=coupon-finder-12345
VITE_FIREBASE_STORAGE_BUCKET=coupon-finder-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789
```

### 3.3 Create `.env.local` for admin panel
Create `admin/.env.local` with the same credentials:
```
VITE_FIREBASE_API_KEY=AIzaSyDxKAk7Dz9X2e3k4m5n6o7p8q9r0s1t2u3
VITE_FIREBASE_AUTH_DOMAIN=coupon-finder.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=coupon-finder-12345
VITE_FIREBASE_STORAGE_BUCKET=coupon-finder-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123def456ghi789
```

---

## Step 4: Install Firebase Package

```bash
npm install firebase
```

---

## Step 5: Create Firestore Collections

### In Firebase Console:

1. Go to **Firestore Database**
2. Click **Start Collection** and create:

#### Collection 1: `coupons`
- Document structure:
```json
{
  "id": "auto-generated",
  "brandName": "Nike",
  "discountValue": "25% OFF",
  "category": "Fashion",
  "status": "active",
  "viewsCount": 0,
  "createdAt": "timestamp"
}
```

#### Collection 2: `brands`
- Document structure:
```json
{
  "id": "auto-generated",
  "name": "Nike",
  "logo": "https://...",
  "website": "https://nike.com",
  "category": "Fashion"
}
```

#### Collection 3: `users`
- Document structure:
```json
{
  "id": "auto-generated",
  "email": "user@example.com",
  "username": "john",
  "role": "user",
  "status": "active",
  "createdAt": "timestamp"
}
```

#### Collection 4: `categories`
- Document structure:
```json
{
  "id": "auto-generated",
  "name": "Fashion",
  "icon": "👕",
  "subcategories": ["Clothing", "Shoes"]
}
```

---

## Step 6: Configure Firestore Security Rules

### In Firestore Console:

1. Go to **Firestore Database** > **Rules** tab
2. Replace default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Coupons: Anyone can read, only admin can write
    match /coupons/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Brands: Anyone can read, only admin can write
    match /brands/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Users: Can read/write own document
    match /users/{userId} {
      allow read: if request.auth.uid == userId || request.auth.token.admin == true;
      allow write: if request.auth.uid == userId || request.auth.token.admin == true;
    }
    
    // Categories: Anyone can read, only admin can write
    match /categories/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

3. Click **Publish**

---

## Step 7: Install Firebase Package

```bash
npm install firebase
```

---

## Step 8: Test the Connection

```bash
npm run dev
```

Visit http://localhost:3000 and check the browser console (F12) for any Firebase errors.

---

## ✅ Verification Checklist

- [ ] Firebase project created
- [ ] Firestore database enabled
- [ ] Firebase config copied
- [ ] `.env` file created with credentials
- [ ] `admin/.env.local` file created
- [ ] Firebase package installed: `npm install firebase`
- [ ] Firestore collections created (coupons, brands, users, categories)
- [ ] Security rules published
- [ ] No errors in browser console

---

## 🔐 Admin Authentication (Optional)

For admin panel authentication with Firestore, we can:

1. **Use Firebase Authentication** (recommended)
   - More secure
   - Built-in user management
   - Email verification

2. **Custom admin tokens**
   - Simple for now
   - Sufficient for MVP

I've set it up with custom admin context. You can upgrade to Firebase Auth later.

---

## 🚀 Next Steps (After Setup)

1. Complete all checklist items above
2. Rebuild apps: `npm run build:all`
3. Test Firestore integration
4. Add data to Firestore via admin panel
5. Verify it shows on main app

---

## 💡 Troubleshooting

### "Firebase is not initialized"
- Check `.env` file has all variables
- Restart dev server: `npm run dev`
- Clear browser cache

### "Permission denied" error
- Check Firestore security rules
- Make sure rules are published
- Try test mode temporarily

### Data not appearing
- Check Firestore console to see if data exists
- Verify collections have correct names
- Check browser console for errors

### CORS issues
- Usually Firebase handles this automatically
- Ensure not using localhost with production domain

---

## 📞 Get Help

- Firebase Docs: https://firebase.google.com/docs
- Firestore Guide: https://firebase.google.com/docs/firestore
- JavaScript SDK: https://firebase.google.com/docs/database/web/start

---

**Firebase setup complete! Ready to connect your app to Firestore? 🔥**
