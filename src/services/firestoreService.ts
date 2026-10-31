import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  getDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { INITIAL_COUPONS, TOP_BRANDS, CATEGORIES } from '../mockData';
import { Coupon, StoreLocation } from '../types';

function getLocalItem<T>(key: string, defaultVal: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultVal;
  } catch {
    return defaultVal;
  }
}

function setLocalItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.warn('LocalStorage write failed:', e);
  }
}

const normalizeCoupon = (id: string, data: Partial<Coupon>): Coupon => ({
  id,
  brandName: data.brandName || 'Unknown Brand',
  brandLogoBg: data.brandLogoBg || 'bg-blue-600 text-white',
  discountValue: data.discountValue || 'Special Offer',
  discountType: data.discountType || 'deal',
  productType: data.productType || 'All products',
  expiryDate: data.expiryDate || 'Valid for a limited time',
  couponCode: data.couponCode || '',
  category: data.category || 'Fashion',
  subcategory: data.subcategory,
  websiteUrl: data.websiteUrl || 'https://www.google.com',
  locations: (data.locations || []) as StoreLocation[],
  description: data.description || 'Verified coupon offer.',
  usageTips: data.usageTips,
  rating: data.rating || 4.5,
  viewsCount: data.viewsCount || 0,
  userSubmitted: data.userSubmitted,
  status: data.status || 'pending',
});

const isPublicCoupon = (coupon: Coupon) =>
  coupon.brandName !== 'Unknown Brand' &&
  coupon.discountValue !== 'Special Offer' &&
  coupon.status !== 'expired' &&
  coupon.status !== 'rejected' &&
  coupon.status !== 'inactive';

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

// ============= COUPONS =============

export const couponService = {
  // Create
  async addCoupon(couponData: Omit<Coupon, 'id'>) {
    if (!isFirebaseConfigured) {
      await new Promise(r => setTimeout(r, 200));
      const { id: _id, ...data } = couponData as Coupon;
      const newCoupon = { id: 'c_' + Date.now(), ...data } as Coupon;
      const list = getLocalItem('coupon_finder_coupons', INITIAL_COUPONS);
      setLocalItem('coupon_finder_coupons', [newCoupon, ...list]);
      return newCoupon;
    }
    try {
      const { id: _id, ...data } = couponData as Coupon;
      const docRef = await addDoc(collection(db, 'coupons'), cleanData({
        ...data,
        createdAt: new Date(),
      }));
      return { id: docRef.id, ...data } as Coupon;
    } catch (error) {
      console.error('Error adding coupon:', error);
      throw error;
    }
  },

  // Read All
  async getCoupons() {
    if (!isFirebaseConfigured) return INITIAL_COUPONS;
    try {
      const couponsSnapshot = await getDocs(collection(db, 'coupons'));
      const list = couponsSnapshot.docs.map((doc) => ({
        ...normalizeCoupon(doc.id, doc.data() as Partial<Coupon>),
      }));
      return list.length > 0 ? list : INITIAL_COUPONS;
    } catch (error) {
      console.warn('Firestore getCoupons failed, falling back to mock data:', error);
      return INITIAL_COUPONS;
    }
  },

  // Read by ID
  async getCouponById(id: string) {
    try {
      const docRef = doc(db, 'coupons', id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? normalizeCoupon(docSnap.id, docSnap.data() as Partial<Coupon>) : null;
    } catch (error) {
      console.error('Error getting coupon:', error);
      throw error;
    }
  },

  // Update
  async updateCoupon(id: string, couponData: Partial<Coupon>) {
    if (!isFirebaseConfigured) {
      const { id: _id, ...data } = couponData;
      return { id, ...data };
    }
    try {
      const { id: _id, ...data } = couponData;
      const docRef = doc(db, 'coupons', id);
      await updateDoc(docRef, cleanData({
        ...data,
        updatedAt: new Date(),
      }));
      return { id, ...data };
    } catch (error) {
      console.error('Error updating coupon:', error);
      throw error;
    }
  },

  // Delete
  async deleteCoupon(id: string) {
    if (!isFirebaseConfigured) {
      return { id };
    }
    try {
      await deleteDoc(doc(db, 'coupons', id));
      return { id };
    } catch (error) {
      console.error('Error deleting coupon:', error);
      throw error;
    }
  },

  // Query by status
  async getCouponsByStatus(status: string) {
    try {
      const q = query(collection(db, 'coupons'), where('status', '==', status));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => normalizeCoupon(doc.id, doc.data() as Partial<Coupon>));
    } catch (error) {
      console.error('Error getting coupons by status:', error);
      throw error;
    }
  },

  // Query by category
  async getCouponsByCategory(category: string) {
    try {
      const q = query(collection(db, 'coupons'), where('category', '==', category));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => normalizeCoupon(doc.id, doc.data() as Partial<Coupon>));
    } catch (error) {
      console.error('Error getting coupons by category:', error);
      throw error;
    }
  },

  // Real-time listener
  listenToCoupons(callback: (coupons: Coupon[]) => void, onError?: (error: Error) => void) {
    if (!isFirebaseConfigured) {
      callback(INITIAL_COUPONS);
      return () => {};
    }
    try {
      return onSnapshot(collection(db, 'coupons'), (snapshot) => {
        const coupons = snapshot.docs.map((doc) => normalizeCoupon(doc.id, doc.data() as Partial<Coupon>));
        callback(coupons.length > 0 ? coupons : INITIAL_COUPONS);
      }, (error) => {
        console.error('Error listening to coupons:', error);
        callback(INITIAL_COUPONS);
        onError?.(error);
      });
    } catch (error) {
      console.error('Error listening to coupons:', error);
      callback(INITIAL_COUPONS);
      return () => {};
    }
  },
};

// ============= BRANDS =============

export const brandService = {
  async addBrand(brandData: any) {
    if (!isFirebaseConfigured) {
      return { id: 'b_' + Date.now(), ...brandData };
    }
    try {
      const docRef = await addDoc(collection(db, 'brands'), cleanData({
        ...brandData,
        createdAt: new Date(),
      }));
      return { id: docRef.id, ...brandData };
    } catch (error) {
      console.warn('Error adding brand:', error);
      return { id: 'b_' + Date.now(), ...brandData };
    }
  },

  async getBrands() {
    if (!isFirebaseConfigured) {
      return TOP_BRANDS.map((b, idx) => ({ id: 'b_' + idx, name: b.name, logo: '', website: '' }));
    }
    try {
      const snapshot = await getDocs(collection(db, 'brands'));
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn('Error getting brands:', error);
      return TOP_BRANDS.map((b, idx) => ({ id: 'b_' + idx, name: b.name, logo: '', website: '' }));
    }
  },

  async updateBrand(id: string, brandData: any) {
    if (!isFirebaseConfigured) {
      return { id, ...brandData };
    }
    try {
      const docRef = doc(db, 'brands', id);
      await updateDoc(docRef, cleanData(brandData));
      return { id, ...brandData };
    } catch (error) {
      console.warn('Error updating brand:', error);
      return { id, ...brandData };
    }
  },

  async deleteBrand(id: string) {
    if (!isFirebaseConfigured) {
      return { id };
    }
    try {
      await deleteDoc(doc(db, 'brands', id));
      return { id };
    } catch (error) {
      console.warn('Error deleting brand:', error);
      return { id };
    }
  },

  listenToBrands(callback: (brands: any[]) => void) {
    if (!isFirebaseConfigured) {
      callback(TOP_BRANDS.map((b, idx) => ({ id: 'b_' + idx, name: b.name, logo: '', website: '' })));
      return () => {};
    }
    try {
      return onSnapshot(collection(db, 'brands'), (snapshot) => {
        const brands = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        callback(brands);
      });
    } catch (error) {
      callback(TOP_BRANDS.map((b, idx) => ({ id: 'b_' + idx, name: b.name, logo: '', website: '' })));
      return () => {};
    }
  },
};

// ============= USERS =============

export const userService = {
  async addUser(userData: any) {
    if (!isFirebaseConfigured) {
      return { id: 'u_' + Date.now(), ...userData };
    }
    try {
      const docRef = await addDoc(collection(db, 'users'), cleanData({
        ...userData,
        createdAt: new Date(),
        status: 'active',
      }));
      return { id: docRef.id, ...userData };
    } catch (error) {
      console.warn('Error adding user:', error);
      return { id: 'u_' + Date.now(), ...userData };
    }
  },

  async getUsers() {
    if (!isFirebaseConfigured) {
      return [];
    }
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn('Error getting users:', error);
      return [];
    }
  },

  async updateUser(id: string, userData: any) {
    if (!isFirebaseConfigured) {
      return { id, ...userData };
    }
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, cleanData(userData));
      return { id, ...userData };
    } catch (error) {
      console.warn('Error updating user:', error);
      return { id, ...userData };
    }
  },

  async deleteUser(id: string) {
    if (!isFirebaseConfigured) {
      return { id };
    }
    try {
      await deleteDoc(doc(db, 'users', id));
      return { id };
    } catch (error) {
      console.warn('Error deleting user:', error);
      return { id };
    }
  },

  listenToUsers(callback: (users: any[]) => void) {
    if (!isFirebaseConfigured) {
      return () => {};
    }
    try {
      return onSnapshot(collection(db, 'users'), (snapshot) => {
        const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        callback(users);
      });
    } catch (error) {
      return () => {};
    }
  },
};

// ============= CATEGORIES =============

export const categoryService = {
  async addCategory(categoryData: any) {
    if (!isFirebaseConfigured) {
      return { id: 'cat_' + Date.now(), ...categoryData };
    }
    try {
      const docRef = await addDoc(collection(db, 'categories'), cleanData({
        ...categoryData,
        createdAt: new Date(),
      }));
      return { id: docRef.id, ...categoryData };
    } catch (error) {
      console.warn('Error adding category:', error);
      return { id: 'cat_' + Date.now(), ...categoryData };
    }
  },

  async getCategories() {
    if (!isFirebaseConfigured) {
      return CATEGORIES.map((c, idx) => ({ id: 'cat_' + idx, name: c.name, icon: c.icon }));
    }
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.warn('Error getting categories:', error);
      return CATEGORIES.map((c, idx) => ({ id: 'cat_' + idx, name: c.name, icon: c.icon }));
    }
  },

  // Only returns categories toggled ON (active) by the admin
  async getActiveCategories(): Promise<{ id: string; name: string }[]> {
    if (!isFirebaseConfigured) {
      return CATEGORIES.filter(c => c.name !== 'All').map((c, idx) => ({ id: 'cat_' + idx, name: c.name }));
    }
    try {
      const q = query(collection(db, 'categories'), where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      const list = snapshot.docs
        .map((doc) => ({ id: doc.id, name: (doc.data().name as string) || '' }))
        .filter((c) => c.name)
        .sort((a, b) => a.name.localeCompare(b.name));
      return list.length > 0 ? list : CATEGORIES.filter(c => c.name !== 'All').map((c, idx) => ({ id: 'cat_' + idx, name: c.name }));
    } catch (error) {
      console.warn('Error getting active categories:', error);
      return CATEGORIES.filter(c => c.name !== 'All').map((c, idx) => ({ id: 'cat_' + idx, name: c.name }));
    }
  },

  async updateCategory(id: string, categoryData: any) {
    if (!isFirebaseConfigured) {
      return { id, ...categoryData };
    }
    try {
      const docRef = doc(db, 'categories', id);
      await updateDoc(docRef, cleanData(categoryData));
      return { id, ...categoryData };
    } catch (error) {
      console.warn('Error updating category:', error);
      return { id, ...categoryData };
    }
  },

  async deleteCategory(id: string) {
    if (!isFirebaseConfigured) {
      return { id };
    }
    try {
      await deleteDoc(doc(db, 'categories', id));
      return { id };
    } catch (error) {
      console.warn('Error deleting category:', error);
      return { id };
    }
  },

  listenToCategories(callback: (categories: any[]) => void) {
    if (!isFirebaseConfigured) {
      callback(CATEGORIES.map((c, idx) => ({ id: 'cat_' + idx, name: c.name, icon: c.icon })));
      return () => {};
    }
    try {
      return onSnapshot(collection(db, 'categories'), (snapshot) => {
        const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        callback(categories);
      });
    } catch (error) {
      callback(CATEGORIES.map((c, idx) => ({ id: 'cat_' + idx, name: c.name, icon: c.icon })));
      return () => {};
    }
  },
};

// ============= PARTNER APPLICATIONS =============

export const partnerApplicationService = {
  async submitApplication(data: {
    companyName: string;
    email: string;
    phone: string;
    website?: string;
    address: string;
    shopType: 'online' | 'offline' | 'both';
    category: string;
  }) {
    if (!isFirebaseConfigured) {
      await new Promise(r => setTimeout(r, 400));
      const newApp = {
        id: 'app_' + Date.now(),
        ...data,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };
      try {
        const list = getLocalItem('partner_applications', []);
        setLocalItem('partner_applications', [newApp, ...list]);
      } catch (e) {
        console.warn('Could not save partner application locally:', e);
      }
      try {
        const res = await fetch('/api/local-db');
        const db = res.ok ? await res.json() : {};
        const apps = Array.isArray(db.partner_applications) ? db.partner_applications : [];
        await fetch('/api/local-db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partner_applications: [newApp, ...apps] }),
        });
      } catch (err) {
        console.warn('Bridge sync failed:', err);
      }
      return newApp;
    }
    try {
      const docRef = await addDoc(collection(db, 'partner_applications'), cleanData({
        ...data,
        status: 'pending',
        createdAt: new Date(),
      }));
      return { id: docRef.id, ...data, status: 'pending' as const };
    } catch (error) {
      console.error('Error submitting partner application:', error);
      throw error;
    }
  },

  async getApplicationByEmail(email: string) {
    if (!isFirebaseConfigured) {
      const list = getLocalItem('partner_applications', []);
      return list.find((a: any) => a.email && a.email.toLowerCase() === email.toLowerCase()) || null;
    }
    try {
      const q = query(collection(db, 'partner_applications'), where('email', '==', email));
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      const document = snapshot.docs[0];
      return { id: document.id, ...document.data() } as any;
    } catch (error) {
      console.error('Error getting application by email:', error);
      return null;
    }
  },
};

// ============= CONTACT MESSAGES =============

export const contactService = {
  async submitMessage(data: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }) {
    if (!isFirebaseConfigured) {
      await new Promise(r => setTimeout(r, 400));
      const newMsg = {
        id: 'msg_' + Date.now(),
        ...data,
        status: 'unread' as const,
        createdAt: new Date().toISOString(),
      };
      try {
        const list = getLocalItem('contact_messages', []);
        setLocalItem('contact_messages', [newMsg, ...list]);
      } catch (e) {
        console.warn('Could not save contact message locally:', e);
      }
      return newMsg;
    }
    try {
      const docRef = await addDoc(collection(db, 'contact_messages'), cleanData({
        ...data,
        status: 'unread',
        createdAt: new Date(),
      }));
      return { id: docRef.id, ...data, status: 'unread' as const };
    } catch (error) {
      console.error('Error submitting contact message:', error);
      throw error;
    }
  },
};

