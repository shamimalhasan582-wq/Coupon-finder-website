import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../config/firebase';
import { Brand, Category, Coupon, PartnerApplication, StoreLocation, User } from '../types';
import {
  INITIAL_APPLICATIONS,
  INITIAL_BRANDS,
  INITIAL_CATEGORIES,
  INITIAL_COUPONS,
  INITIAL_MESSAGES,
  INITIAL_USERS,
} from '../mockData';

const stripId = <T extends object>(data: T) => {
  const { id: _id, ...rest } = data as T & { id?: string };
  return rest as Omit<T, 'id'>;
};

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
  websiteUrl: data.websiteUrl || 'https://www.google.com',
  locations: (data.locations || []) as StoreLocation[],
  description: data.description || 'Incomplete coupon document. Please edit or delete it.',
  rating: data.rating || 0,
  viewsCount: data.viewsCount || 0,
  status: data.status || 'pending',
});

const normalizeBrand = (id: string, data: Partial<Brand>): Brand => ({
  id,
  name: data.name || 'Untitled Brand',
  logo: data.logo || '',
  website: data.website || '',
  category: data.category || 'Fashion',
  email: data.email || '',
  partnerStatus: data.partnerStatus || 'pending',
});

const normalizeUser = (id: string, data: Partial<User>): User => ({
  id,
  email: data.email || 'unknown@example.com',
  username: data.username || 'Unknown User',
  role: data.role || 'user',
  status: data.status || 'active',
});

const normalizeCategory = (id: string, data: Partial<Category>): Category => ({
  id,
  name: data.name || 'Untitled Category',
  icon: data.icon || '',
  subcategories: data.subcategories || [],
  description: data.description || '',
  status: data.status || 'active',
  createdAt: data.createdAt || null,
});

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'unread' | 'read' | 'replied';
  createdAt: any;
}

const normalizeContactMessage = (id: string, data: Partial<ContactMessage>): ContactMessage => ({
  id,
  name: data.name || 'Anonymous',
  email: data.email || '',
  subject: data.subject || '',
  message: data.message || '',
  status: data.status || 'unread',
  createdAt: data.createdAt || null,
});

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

// ============= LOCAL STORAGE HELPERS FOR DEMO/OFFLINE MODE =============

function getLocalItems<T>(key: string, defaultItems: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    localStorage.setItem(key, JSON.stringify(defaultItems));
    return defaultItems;
  } catch {
    return defaultItems;
  }
}

function setLocalItems<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('admin_local_sync', { detail: { key } }));
  } catch (e) {
    console.error('Local storage write error:', e);
  }
}

function listenLocal<T>(key: string, defaultItems: T[], callback: (items: T[]) => void) {
  callback(getLocalItems(key, defaultItems));
  const handler = (e: any) => {
    if (e.detail?.key === key) {
      callback(getLocalItems(key, defaultItems));
    }
  };
  window.addEventListener('admin_local_sync', handler);
  return () => window.removeEventListener('admin_local_sync', handler);
}

// ============= COUPON SERVICE =============

export const couponService = {
  async addCoupon(couponData: Omit<Coupon, 'id'> | Coupon) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_coupons', INITIAL_COUPONS);
      const newItem = { ...couponData, id: 'c_' + Date.now() } as Coupon;
      setLocalItems('admin_coupons', [newItem, ...items]);
      return newItem;
    }
    const data = stripId(couponData) as Omit<Coupon, 'id'>;
    const docRef = await addDoc(collection(db, 'coupons'), cleanData({
      ...data,
      createdAt: new Date(),
    }));
    return { id: docRef.id, ...data } as Coupon;
  },

  async getCoupons() {
    if (!isFirebaseConfigured) {
      return getLocalItems('admin_coupons', INITIAL_COUPONS);
    }
    try {
      const snapshot = await getDocs(collection(db, 'coupons'));
      const list = snapshot.docs.map((document) => normalizeCoupon(document.id, document.data() as Partial<Coupon>));
      return list.length > 0 ? list : getLocalItems('admin_coupons', INITIAL_COUPONS);
    } catch (e) {
      console.warn('Firestore getCoupons failed, using local demo data:', e);
      return getLocalItems('admin_coupons', INITIAL_COUPONS);
    }
  },

  async updateCoupon(id: string, couponData: Partial<Coupon>) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_coupons', INITIAL_COUPONS);
      setLocalItems('admin_coupons', items.map(c => c.id === id ? { ...c, ...couponData } : c));
      return;
    }
    await updateDoc(doc(db, 'coupons', id), cleanData({
      ...stripId(couponData),
      updatedAt: new Date(),
    }));
  },

  async deleteCoupon(id: string) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_coupons', INITIAL_COUPONS);
      setLocalItems('admin_coupons', items.filter(c => c.id !== id));
      return;
    }
    await deleteDoc(doc(db, 'coupons', id));
  },

  listenToCoupons(callback: (coupons: Coupon[]) => void, onError?: (error: Error) => void) {
    if (!isFirebaseConfigured) {
      return listenLocal('admin_coupons', INITIAL_COUPONS, callback);
    }
    return onSnapshot(
      collection(db, 'coupons'),
      (snapshot) => {
        const list = snapshot.docs.map((document) => normalizeCoupon(document.id, document.data() as Partial<Coupon>));
        callback(list.length > 0 ? list : getLocalItems('admin_coupons', INITIAL_COUPONS));
      },
      (error) => {
        console.warn('Firestore listenToCoupons failed, using local demo data:', error);
        callback(getLocalItems('admin_coupons', INITIAL_COUPONS));
        onError?.(error);
      }
    );
  },
};

// ============= BRAND SERVICE =============

export const brandService = {
  async addBrand(brandData: Omit<Brand, 'id'> | Brand) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_brands', INITIAL_BRANDS);
      const newItem = { ...brandData, id: 'b_' + Date.now() } as Brand;
      setLocalItems('admin_brands', [newItem, ...items]);
      return newItem;
    }
    const data = stripId(brandData) as Omit<Brand, 'id'>;
    const docRef = await addDoc(collection(db, 'brands'), cleanData({
      ...data,
      createdAt: new Date(),
    }));
    return { id: docRef.id, ...data } as Brand;
  },

  async getBrands() {
    if (!isFirebaseConfigured) {
      return getLocalItems('admin_brands', INITIAL_BRANDS);
    }
    try {
      const snapshot = await getDocs(collection(db, 'brands'));
      const list = snapshot.docs.map((document) => normalizeBrand(document.id, document.data() as Partial<Brand>));
      return list.length > 0 ? list : getLocalItems('admin_brands', INITIAL_BRANDS);
    } catch (e) {
      console.warn('Firestore getBrands failed, using local demo data:', e);
      return getLocalItems('admin_brands', INITIAL_BRANDS);
    }
  },

  async updateBrand(id: string, brandData: Partial<Brand>) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_brands', INITIAL_BRANDS);
      setLocalItems('admin_brands', items.map(b => b.id === id ? { ...b, ...brandData } : b));
      return;
    }
    await updateDoc(doc(db, 'brands', id), cleanData({
      ...stripId(brandData),
      updatedAt: new Date(),
    }));
  },

  async deleteBrand(id: string) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_brands', INITIAL_BRANDS);
      setLocalItems('admin_brands', items.filter(b => b.id !== id));
      return;
    }
    await deleteDoc(doc(db, 'brands', id));
  },

  listenToBrands(callback: (brands: Brand[]) => void, onError?: (error: Error) => void) {
    if (!isFirebaseConfigured) {
      return listenLocal('admin_brands', INITIAL_BRANDS, callback);
    }
    return onSnapshot(
      collection(db, 'brands'),
      (snapshot) => {
        const list = snapshot.docs.map((document) => normalizeBrand(document.id, document.data() as Partial<Brand>));
        callback(list.length > 0 ? list : getLocalItems('admin_brands', INITIAL_BRANDS));
      },
      (error) => {
        console.warn('Firestore listenToBrands failed, using local demo data:', error);
        callback(getLocalItems('admin_brands', INITIAL_BRANDS));
        onError?.(error);
      }
    );
  },
};

// ============= USER SERVICE =============

export const userService = {
  async addUser(userData: Omit<User, 'id'> | User) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_users', INITIAL_USERS);
      const newItem = { ...userData, id: 'u_' + Date.now(), status: userData.status || 'active' } as User;
      setLocalItems('admin_users', [newItem, ...items]);
      return newItem;
    }
    const data = stripId(userData) as Omit<User, 'id'>;
    const docRef = await addDoc(collection(db, 'users'), cleanData({
      ...data,
      status: data.status || 'active',
      createdAt: new Date(),
    }));
    return { id: docRef.id, ...data } as User;
  },

  async getUsers() {
    if (!isFirebaseConfigured) {
      return getLocalItems('admin_users', INITIAL_USERS);
    }
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const list = snapshot.docs.map((document) => normalizeUser(document.id, document.data() as Partial<User>));
      return list.length > 0 ? list : getLocalItems('admin_users', INITIAL_USERS);
    } catch (e) {
      console.warn('Firestore getUsers failed, using local demo data:', e);
      return getLocalItems('admin_users', INITIAL_USERS);
    }
  },

  async updateUser(id: string, userData: Partial<User>) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_users', INITIAL_USERS);
      setLocalItems('admin_users', items.map(u => u.id === id ? { ...u, ...userData } : u));
      return;
    }
    await updateDoc(doc(db, 'users', id), cleanData({
      ...stripId(userData),
      updatedAt: new Date(),
    }));
  },

  async deleteUser(id: string) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_users', INITIAL_USERS);
      setLocalItems('admin_users', items.filter(u => u.id !== id));
      return;
    }
    await deleteDoc(doc(db, 'users', id));
  },

  listenToUsers(callback: (users: User[]) => void, onError?: (error: Error) => void) {
    if (!isFirebaseConfigured) {
      return listenLocal('admin_users', INITIAL_USERS, callback);
    }
    return onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const list = snapshot.docs.map((document) => normalizeUser(document.id, document.data() as Partial<User>));
        callback(list.length > 0 ? list : getLocalItems('admin_users', INITIAL_USERS));
      },
      (error) => {
        console.warn('Firestore listenToUsers failed, using local demo data:', error);
        callback(getLocalItems('admin_users', INITIAL_USERS));
        onError?.(error);
      }
    );
  },
};

// ============= CATEGORY SERVICE =============

export const categoryService = {
  async addCategory(categoryData: Omit<Category, 'id'> | Category) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_categories', INITIAL_CATEGORIES);
      const newItem = { ...categoryData, id: 'cat_' + Date.now(), createdAt: new Date() } as Category;
      setLocalItems('admin_categories', [newItem, ...items]);
      return newItem;
    }
    const data = stripId(categoryData) as Omit<Category, 'id'>;
    const docRef = await addDoc(collection(db, 'categories'), cleanData({
      ...data,
      createdAt: new Date(),
    }));
    return { id: docRef.id, ...data } as Category;
  },

  async getCategories() {
    if (!isFirebaseConfigured) {
      return getLocalItems('admin_categories', INITIAL_CATEGORIES);
    }
    try {
      const snapshot = await getDocs(collection(db, 'categories'));
      const list = snapshot.docs.map((document) => normalizeCategory(document.id, document.data() as Partial<Category>));
      return list.length > 0 ? list : getLocalItems('admin_categories', INITIAL_CATEGORIES);
    } catch (e) {
      console.warn('Firestore getCategories failed, using local demo data:', e);
      return getLocalItems('admin_categories', INITIAL_CATEGORIES);
    }
  },

  async updateCategory(id: string, categoryData: Partial<Category>) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_categories', INITIAL_CATEGORIES);
      setLocalItems('admin_categories', items.map(c => c.id === id ? { ...c, ...categoryData } : c));
      return;
    }
    await updateDoc(doc(db, 'categories', id), cleanData({
      ...stripId(categoryData),
      updatedAt: new Date(),
    }));
  },

  async deleteCategory(id: string) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_categories', INITIAL_CATEGORIES);
      setLocalItems('admin_categories', items.filter(c => c.id !== id));
      return;
    }
    await deleteDoc(doc(db, 'categories', id));
  },

  listenToCategories(callback: (categories: Category[]) => void, onError?: (error: Error) => void) {
    if (!isFirebaseConfigured) {
      return listenLocal('admin_categories', INITIAL_CATEGORIES, callback);
    }
    return onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const list = snapshot.docs.map((document) => normalizeCategory(document.id, document.data() as Partial<Category>));
        callback(list.length > 0 ? list : getLocalItems('admin_categories', INITIAL_CATEGORIES));
      },
      (error) => {
        console.warn('Firestore listenToCategories failed, using local demo data:', error);
        callback(getLocalItems('admin_categories', INITIAL_CATEGORIES));
        onError?.(error);
      }
    );
  },
};

// ============= PARTNER APPLICATIONS =============

const normalizeApplication = (id: string, data: Partial<PartnerApplication>): PartnerApplication => ({
  id,
  companyName: data.companyName || 'Unknown Company',
  email: data.email || '',
  phone: data.phone || '',
  website: data.website || '',
  address: data.address || '',
  shopType: data.shopType || 'online',
  category: data.category || 'Fashion',
  status: data.status || 'pending',
  createdAt: data.createdAt || null,
  approvedAt: data.approvedAt || null,
  activationToken: data.activationToken,
});

export const partnerApplicationService = {
  async getApplications() {
    if (!isFirebaseConfigured) {
      try {
        const res = await fetch('/api/local-db');
        if (res.ok) {
          const db = await res.json();
          if (Array.isArray(db.partner_applications) && db.partner_applications.length > 0) {
            setLocalItems('admin_applications', db.partner_applications);
            return db.partner_applications;
          }
        }
      } catch {}
      return getLocalItems('admin_applications', INITIAL_APPLICATIONS);
    }
    try {
      const snapshot = await getDocs(collection(db, 'partner_applications'));
      const list = snapshot.docs.map((document) => normalizeApplication(document.id, document.data() as Partial<PartnerApplication>));
      return list.length > 0 ? list : getLocalItems('admin_applications', INITIAL_APPLICATIONS);
    } catch (e) {
      console.warn('Firestore getApplications failed, using local demo data:', e);
      return getLocalItems('admin_applications', INITIAL_APPLICATIONS);
    }
  },

  async updateApplication(id: string, data: Partial<PartnerApplication>) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_applications', INITIAL_APPLICATIONS);
      const updated = items.map(a => a.id === id ? { ...a, ...data } : a);
      setLocalItems('admin_applications', updated);
      try {
        await fetch('/api/local-db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partner_applications: updated }),
        });
      } catch {}
      return;
    }
    await updateDoc(doc(db, 'partner_applications', id), {
      ...data,
      updatedAt: new Date(),
    });
  },

  async deleteApplication(id: string) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_applications', INITIAL_APPLICATIONS);
      const updated = items.filter(a => a.id !== id);
      setLocalItems('admin_applications', updated);
      try {
        await fetch('/api/local-db', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ partner_applications: updated }),
        });
      } catch {}
      return;
    }
    await deleteDoc(doc(db, 'partner_applications', id));
  },

  listenToApplications(callback: (apps: PartnerApplication[]) => void, onError?: (error: Error) => void) {
    if (!isFirebaseConfigured) {
      const fetchFromBridge = async () => {
        try {
          const res = await fetch('/api/local-db');
          if (res.ok) {
            const db = await res.json();
            if (Array.isArray(db.partner_applications)) {
              setLocalItems('admin_applications', db.partner_applications);
              callback(db.partner_applications);
              return;
            }
          }
        } catch {}
        callback(getLocalItems('admin_applications', INITIAL_APPLICATIONS));
      };
      fetchFromBridge();
      const interval = setInterval(fetchFromBridge, 2000);
      const localUnsub = listenLocal('admin_applications', INITIAL_APPLICATIONS, callback);
      return () => {
        clearInterval(interval);
        localUnsub();
      };
    }
    return onSnapshot(
      collection(db, 'partner_applications'),
      (snapshot) => {
        const list = snapshot.docs.map((document) => normalizeApplication(document.id, document.data() as Partial<PartnerApplication>));
        callback(list.length > 0 ? list : getLocalItems('admin_applications', INITIAL_APPLICATIONS));
      },
      (error) => {
        console.warn('Firestore listenToApplications failed, using local demo data:', error);
        callback(getLocalItems('admin_applications', INITIAL_APPLICATIONS));
        onError?.(error);
      }
    );
  },
};

// ============= CONTACT MESSAGES =============

export const contactMessageService = {
  async getMessages() {
    if (!isFirebaseConfigured) {
      return getLocalItems('admin_messages', INITIAL_MESSAGES);
    }
    try {
      const snapshot = await getDocs(collection(db, 'contact_messages'));
      const list = snapshot.docs.map((document) =>
        normalizeContactMessage(document.id, document.data() as Partial<ContactMessage>)
      );
      return list.length > 0 ? list : getLocalItems('admin_messages', INITIAL_MESSAGES);
    } catch (e) {
      console.warn('Firestore getMessages failed, using local demo data:', e);
      return getLocalItems('admin_messages', INITIAL_MESSAGES);
    }
  },

  async updateMessage(id: string, data: Partial<ContactMessage>) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_messages', INITIAL_MESSAGES);
      setLocalItems('admin_messages', items.map(m => m.id === id ? { ...m, ...data } : m));
      return;
    }
    await updateDoc(doc(db, 'contact_messages', id), {
      ...data,
      updatedAt: new Date(),
    });
  },

  async deleteMessage(id: string) {
    if (!isFirebaseConfigured) {
      const items = getLocalItems('admin_messages', INITIAL_MESSAGES);
      setLocalItems('admin_messages', items.filter(m => m.id !== id));
      return;
    }
    await deleteDoc(doc(db, 'contact_messages', id));
  },

  listenToMessages(callback: (messages: ContactMessage[]) => void, onError?: (error: Error) => void) {
    if (!isFirebaseConfigured) {
      return listenLocal('admin_messages', INITIAL_MESSAGES, callback);
    }
    return onSnapshot(
      collection(db, 'contact_messages'),
      (snapshot) => {
        const list = snapshot.docs.map((document) =>
          normalizeContactMessage(document.id, document.data() as Partial<ContactMessage>)
        );
        callback(list.length > 0 ? list : getLocalItems('admin_messages', INITIAL_MESSAGES));
      },
      (error) => {
        console.warn('Firestore listenToMessages failed, using local demo data:', error);
        callback(getLocalItems('admin_messages', INITIAL_MESSAGES));
        onError?.(error);
      }
    );
  },
};
