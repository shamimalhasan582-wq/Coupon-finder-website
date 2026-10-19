export type CategoryType = 'Fashion' | 'Tech' | 'Dining' | 'Beauty' | 'Wellness' | 'Travel' | 'Home' | 'Grocery';

export interface Coupon {
  id: string;
  brandName: string;
  brandLogoBg?: string;
  discountValue: string;
  discountType?: string;
  productType?: string;
  expiryDate: string;
  couponCode: string;
  category: string;
  websiteUrl: string;
  locations?: StoreLocation[];
  description?: string;
  rating?: number;
  viewsCount?: number;
  status: 'active' | 'inactive' | 'pending' | 'rejected' | 'expired';
}

export interface StoreLocation {
  name: string;
  address: string;
}

export interface Brand {
  id: string;
  name: string;
  logo?: string;
  website?: string;
  category?: string;
  email?: string;
  partnerStatus?: 'active' | 'pending' | 'suspended' | 'rejected';
}

export interface User {
  id: string;
  email: string;
  username: string;
  role: 'user' | 'partner' | 'admin';
  status: 'active' | 'inactive' | 'banned';
}

export interface Category {
  id: string;
  name: string;
  icon?: string;
  subcategories?: string[];
  description?: string;
  status?: 'active' | 'disabled';
  createdAt?: any;
}

export interface PartnerApplication {
  id: string;
  companyName: string;
  email: string;
  phone: string;
  website?: string;
  address: string;
  shopType: 'online' | 'offline' | 'both';
  category: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: any;
  approvedAt?: any;
  activationToken?: string;
}
