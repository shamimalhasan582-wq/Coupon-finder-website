import dotenv from 'dotenv';
dotenv.config();

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';
import { INITIAL_COUPONS, TOP_BRANDS, CATEGORIES, SUBCATEGORIES_MAP } from '../src/mockData';
import { INITIAL_USERS } from '../admin/src/mockData';

const apiKey = process.env.VITE_FIREBASE_API_KEY;
const projectId = process.env.VITE_FIREBASE_PROJECT_ID;

if (!apiKey || apiKey === 'YOUR_API_KEY' || !projectId || projectId === 'YOUR_PROJECT_ID') {
  console.error('\n❌ Firebase credentials not found in .env!');
  console.error('Please create a .env file in the project root with:');
  console.error('  VITE_FIREBASE_API_KEY=your_actual_api_key');
  console.error('  VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com');
  console.error('  VITE_FIREBASE_PROJECT_ID=your_project_id');
  console.error('  VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com');
  console.error('  VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id');
  console.error('  VITE_FIREBASE_APP_ID=your_app_id\n');
  process.exit(1);
}

const firebaseConfig = {
  apiKey,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`,
  projectId,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || `${projectId}.appspot.com`,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.VITE_FIREBASE_APP_ID || '',
};

console.log(`\n🚀 Connecting to Firebase project: "${projectId}"...`);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const cleanData = (data: any): any => {
  if (data === null || data === undefined) return undefined;
  if (data instanceof Date) return data;
  if (Array.isArray(data)) {
    return data.map(item => cleanData(item)).filter(item => item !== undefined);
  }
  if (typeof data === 'object') {
    const cleaned: any = {};
    Object.keys(data).forEach((key) => {
      const val = cleanData(data[key]);
      if (val !== undefined) {
        cleaned[key] = val;
      }
    });
    return cleaned;
  }
  return data;
};

async function seed() {
  try {
    // 1. Seed Coupons
    console.log(`📦 Seeding ${INITIAL_COUPONS.length} coupons...`);
    for (const coupon of INITIAL_COUPONS) {
      const status = coupon.status || 'active';
      await setDoc(doc(db, 'coupons', coupon.id), cleanData({
        ...coupon,
        status,
        updatedAt: new Date(),
      }));
    }
    console.log('✅ Coupons seeded successfully.');

    // 2. Seed Brands
    console.log(`🏷️  Seeding ${TOP_BRANDS.length} brands...`);
    for (let i = 0; i < TOP_BRANDS.length; i++) {
      const brand = TOP_BRANDS[i];
      const id = 'brand_' + brand.name.toLowerCase().replace(/[^a-z0-9]/g, '_');
      await setDoc(doc(db, 'brands', id), cleanData({
        name: brand.name,
        logo: '',
        website: `https://www.${brand.name.toLowerCase().replace(/\s+/g, '')}.com`,
        category: 'Fashion',
        email: `partner@${brand.name.toLowerCase().replace(/\s+/g, '')}.com`,
        partnerStatus: 'active',
        createdAt: new Date(),
      }));
    }
    console.log('✅ Brands seeded successfully.');

    // 3. Seed Categories
    console.log(`📁 Seeding ${CATEGORIES.length} categories...`);
    for (const cat of CATEGORIES) {
      if (cat.name === 'All') continue;
      const id = 'cat_' + cat.name.toLowerCase();
      await setDoc(doc(db, 'categories', id), cleanData({
        name: cat.name,
        icon: cat.icon,
        subcategories: SUBCATEGORIES_MAP[cat.name] || [],
        description: `${cat.name} deals, discounts, and verified vouchers`,
        status: 'active',
        createdAt: new Date(),
      }));
    }
    console.log('✅ Categories seeded successfully.');

    // 4. Seed Users
    console.log(`👥 Seeding ${INITIAL_USERS.length} demo users...`);
    for (const user of INITIAL_USERS) {
      await setDoc(doc(db, 'users', user.id), cleanData({
        ...user,
        createdAt: new Date(),
      }));
    }
    console.log('✅ Users seeded successfully.');

    console.log('\n🎉 Cloud Firestore initialization complete!');
    console.log('Both your main site and admin panel are now fully synced with live Cloud Firestore.\n');
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ Seeding failed:', err.message);
    if (err.message?.includes('PERMISSION_DENIED') || err.message?.includes('permission-denied')) {
      console.error('\n👉 Firestore Security Rules blocked the write.');
      console.error('Make sure your Firestore Database is in Test Mode in Firebase Console:');
      console.error('Rules: allow read, write: if true;\n');
    }
    process.exit(1);
  }
}

seed();

