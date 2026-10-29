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
import { db } from '../config/firebase';
import { Coupon, StoreLocation } from '../types';

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
    try {
      const couponsSnapshot = await getDocs(collection(db, 'coupons'));
      return couponsSnapshot.docs.map((doc) => ({
        ...normalizeCoupon(doc.id, doc.data() as Partial<Coupon>),
      }));
    } catch (error) {
      console.error('Error getting coupons:', error);
      throw error;
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
    try {
      return onSnapshot(collection(db, 'coupons'), (snapshot) => {
        const coupons = snapshot.docs.map((doc) => normalizeCoupon(doc.id, doc.data() as Partial<Coupon>));
        // Pass all coupons (including inactive/expired) so partner dashboards
        // can see their own offers in all states. The public home page filters
        // via homeFilteredCoupons (App.tsx) which already excludes non-active ones.
        callback(coupons);
      }, (error) => {
        console.error('Error listening to coupons:', error);
        onError?.(error);
      });
    } catch (error) {
      console.error('Error listening to coupons:', error);
      throw error;
    }
  },
};

// ============= BRANDS =============

export const brandService = {
  async addBrand(brandData: any) {
    try {
      const docRef = await addDoc(collection(db, 'brands'), cleanData({
        ...brandData,
        createdAt: new Date(),
      }));
      return { id: docRef.id, ...brandData };
    } catch (error) {
      console.error('Error adding brand:', error);
      throw error;
    }
  },

  async getBrands() {
    try {
      const snapshot = await getDocs(collection(db, 'brands'));
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting brands:', error);
      throw error;
    }
  },

  async updateBrand(id: string, brandData: any) {
    try {
      const docRef = doc(db, 'brands', id);
      await updateDoc(docRef, cleanData(brandData));
      return { id, ...brandData };
    } catch (error) {
      console.error('Error updating brand:', error);
      throw error;
    }
  },

  async deleteBrand(id: string) {
    try {
      await deleteDoc(doc(db, 'brands', id));
      return { id };
    } catch (error) {
      console.error('Error deleting brand:', error);
      throw error;
    }
  },

  listenToBrands(callback: (brands: any[]) => void) {
    try {
      return onSnapshot(collection(db, 'brands'), (snapshot) => {
        const brands = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        callback(brands);
      });
    } catch (error) {
      console.error('Error listening to brands:', error);
      throw error;
    }
  },
};

// ============= USERS =============

export const userService = {
  async addUser(userData: any) {
    try {
      const docRef = await addDoc(collection(db, 'users'), cleanData({
        ...userData,
        createdAt: new Date(),
        status: 'active',
      }));
      return { id: docRef.id, ...userData };
    } catch (error) {
      console.error('Error adding user:', error);
      throw error;
    }
  },

  async getUsers() {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting users:', error);
      throw error;
    }
  },

  async updateUser(id: string, userData: any) {
    try {
      const docRef = doc(db, 'users', id);
      await updateDoc(docRef, cleanData(userData));
      return { id, ...userData };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  },

  async deleteUser(id: string) {
    try {
      await deleteDoc(doc(db, 'users', id));
      return { id };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  },

  listenToUsers(callback: (users: any[]) => void) {
    try {
      return onSnapshot(collection(db, 'users'), (snapshot) => {
        const users = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        callback(users);
      });
    } catch (error) {
      console.error('Error listening to users:', error);
      throw error;
    }
  },
};

// ============= CATEGORIES =============

export const categoryService = {
  async addCategory(categoryData: any) {
    try {
      const docRef = await addDoc(collection(db, 'categories'), cleanData({
        ...categoryData,
        createdAt: new Date(),
      }));
      return { id: docRef.id, ...categoryData };
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  },

  async getCategories() {
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  },

  // Only returns categories toggled ON (active) by the admin
  async getActiveCategories(): Promise<{ id: string; name: string }[]> {
    try {
      const q = query(collection(db, 'categories'), where('status', '==', 'active'));
      const snapshot = await getDocs(q);
      return snapshot.docs
        .map((doc) => ({ id: doc.id, name: (doc.data().name as string) || '' }))
        .filter((c) => c.name)
        .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
      console.error('Error getting active categories:', error);
      // Fallback: return empty so the form stays usable
      return [];
    }
  },

  async updateCategory(id: string, categoryData: any) {
    try {
      const docRef = doc(db, 'categories', id);
      await updateDoc(docRef, cleanData(categoryData));
      return { id, ...categoryData };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  },

  async deleteCategory(id: string) {
    try {
      await deleteDoc(doc(db, 'categories', id));
      return { id };
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  },

  listenToCategories(callback: (categories: any[]) => void) {
    try {
      return onSnapshot(collection(db, 'categories'), (snapshot) => {
        const categories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        callback(categories);
      });
    } catch (error) {
      console.error('Error listening to categories:', error);
      throw error;
    }
  },
};

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

