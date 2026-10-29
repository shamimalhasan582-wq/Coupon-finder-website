import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Brand, Category, Coupon, PartnerApplication, StoreLocation, User } from '../types';

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

export const couponService = {
  async addCoupon(couponData: Omit<Coupon, 'id'> | Coupon) {
    const data = stripId(couponData) as Omit<Coupon, 'id'>;
    const docRef = await addDoc(collection(db, 'coupons'), cleanData({
      ...data,
      createdAt: new Date(),
    }));
    return { id: docRef.id, ...data } as Coupon;
  },

  async getCoupons() {
    const snapshot = await getDocs(collection(db, 'coupons'));
    return snapshot.docs.map((document) => normalizeCoupon(document.id, document.data() as Partial<Coupon>));
  },

  async updateCoupon(id: string, couponData: Partial<Coupon>) {
    await updateDoc(doc(db, 'coupons', id), cleanData({
      ...stripId(couponData),
      updatedAt: new Date(),
    }));
  },

  async deleteCoupon(id: string) {
    await deleteDoc(doc(db, 'coupons', id));
  },

  listenToCoupons(callback: (coupons: Coupon[]) => void, onError?: (error: Error) => void) {
    return onSnapshot(
      collection(db, 'coupons'),
      (snapshot) => {
        callback(snapshot.docs.map((document) => normalizeCoupon(document.id, document.data() as Partial<Coupon>)));
      },
      (error) => onError?.(error)
    );
  },
};

export const brandService = {
  async addBrand(brandData: Omit<Brand, 'id'> | Brand) {
    const data = stripId(brandData) as Omit<Brand, 'id'>;
    const docRef = await addDoc(collection(db, 'brands'), cleanData({
      ...data,
      createdAt: new Date(),
    }));
    return { id: docRef.id, ...data } as Brand;
  },

  async getBrands() {
    const snapshot = await getDocs(collection(db, 'brands'));
    return snapshot.docs.map((document) => normalizeBrand(document.id, document.data() as Partial<Brand>));
  },

  async updateBrand(id: string, brandData: Partial<Brand>) {
    await updateDoc(doc(db, 'brands', id), cleanData({
      ...stripId(brandData),
      updatedAt: new Date(),
    }));
  },

  async deleteBrand(id: string) {
    await deleteDoc(doc(db, 'brands', id));
  },

  listenToBrands(callback: (brands: Brand[]) => void, onError?: (error: Error) => void) {
    return onSnapshot(
      collection(db, 'brands'),
      (snapshot) => callback(snapshot.docs.map((document) => normalizeBrand(document.id, document.data() as Partial<Brand>))),
      (error) => onError?.(error)
    );
  },
};

export const userService = {
  async addUser(userData: Omit<User, 'id'> | User) {
    const data = stripId(userData) as Omit<User, 'id'>;
    const docRef = await addDoc(collection(db, 'users'), cleanData({
      ...data,
      status: data.status || 'active',
      createdAt: new Date(),
    }));
    return { id: docRef.id, ...data } as User;
  },

  async getUsers() {
    const snapshot = await getDocs(collection(db, 'users'));
    return snapshot.docs.map((document) => normalizeUser(document.id, document.data() as Partial<User>));
  },

  async updateUser(id: string, userData: Partial<User>) {
    await updateDoc(doc(db, 'users', id), cleanData({
      ...stripId(userData),
      updatedAt: new Date(),
    }));
  },

  async deleteUser(id: string) {
    await deleteDoc(doc(db, 'users', id));
  },

  listenToUsers(callback: (users: User[]) => void, onError?: (error: Error) => void) {
    return onSnapshot(
      collection(db, 'users'),
      (snapshot) => callback(snapshot.docs.map((document) => normalizeUser(document.id, document.data() as Partial<User>))),
      (error) => onError?.(error)
    );
  },
};

export const categoryService = {
  async addCategory(categoryData: Omit<Category, 'id'> | Category) {
    const data = stripId(categoryData) as Omit<Category, 'id'>;
    const docRef = await addDoc(collection(db, 'categories'), cleanData({
      ...data,
      createdAt: new Date(),
    }));
    return { id: docRef.id, ...data } as Category;
  },

  async getCategories() {
    const snapshot = await getDocs(collection(db, 'categories'));
    return snapshot.docs.map((document) => normalizeCategory(document.id, document.data() as Partial<Category>));
  },

  async updateCategory(id: string, categoryData: Partial<Category>) {
    await updateDoc(doc(db, 'categories', id), cleanData({
      ...stripId(categoryData),
      updatedAt: new Date(),
    }));
  },

  async deleteCategory(id: string) {
    await deleteDoc(doc(db, 'categories', id));
  },

  listenToCategories(callback: (categories: Category[]) => void, onError?: (error: Error) => void) {
    return onSnapshot(
      collection(db, 'categories'),
      (snapshot) => callback(snapshot.docs.map((document) => normalizeCategory(document.id, document.data() as Partial<Category>))),
      (error) => onError?.(error)
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
    const snapshot = await getDocs(collection(db, 'partner_applications'));
    return snapshot.docs.map((document) => normalizeApplication(document.id, document.data() as Partial<PartnerApplication>));
  },

  async updateApplication(id: string, data: Partial<PartnerApplication>) {
    await updateDoc(doc(db, 'partner_applications', id), {
      ...data,
      updatedAt: new Date(),
    });
  },

  async deleteApplication(id: string) {
    await deleteDoc(doc(db, 'partner_applications', id));
  },

  listenToApplications(callback: (apps: PartnerApplication[]) => void, onError?: (error: Error) => void) {
    return onSnapshot(
      collection(db, 'partner_applications'),
      (snapshot) => callback(snapshot.docs.map((document) => normalizeApplication(document.id, document.data() as Partial<PartnerApplication>))),
      (error) => onError?.(error)
    );
  },
};

// ============= CONTACT MESSAGES =============

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

export const contactMessageService = {
  async getMessages() {
    const snapshot = await getDocs(collection(db, 'contact_messages'));
    return snapshot.docs.map((document) =>
      normalizeContactMessage(document.id, document.data() as Partial<ContactMessage>)
    );
  },

  async updateMessage(id: string, data: Partial<ContactMessage>) {
    await updateDoc(doc(db, 'contact_messages', id), {
      ...data,
      updatedAt: new Date(),
    });
  },

  async deleteMessage(id: string) {
    await deleteDoc(doc(db, 'contact_messages', id));
  },

  listenToMessages(callback: (messages: ContactMessage[]) => void, onError?: (error: Error) => void) {
    return onSnapshot(
      collection(db, 'contact_messages'),
      (snapshot) =>
        callback(
          snapshot.docs.map((document) =>
            normalizeContactMessage(document.id, document.data() as Partial<ContactMessage>)
          )
        ),
      (error) => onError?.(error)
    );
  },
};


