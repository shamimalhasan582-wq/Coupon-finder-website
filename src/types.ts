export interface StoreLocation {
  id: string;
  name: string;
  address: string;
  distance: string;
  phone: string;
  hours: string;
  lat: number; // For visualization purposes: 0-100 grid scale
  lng: number; // For visualization purposes: 0-100 grid scale
}

export interface Coupon {
  id: string;
  brandName: string;
  brandLogoBg: string; // Background color utility, e.g. 'bg-black text-white' or 'bg-blue-600 text-white'
  discountValue: string; // e.g. "25% OFF" or "$15 OFF" status
  discountType: 'percentage' | 'amount' | 'deal';
  productType: string; // e.g., "All regular priced apparel"
  expiryDate: string; // e.g., "Valid until Nov 30, 2026"
  couponCode?: string; // Optional field now to support Task 1
  category: string; // "Fashion" | "Tech" | "Dining" | "Beauty" | "Wellness" | "Travel" | "Utilities"
  subcategory?: string; // Subcategory field for Task 2
  websiteUrl: string;
  locations: StoreLocation[];
  description: string;
  usageTips?: string;
  rating: number; // e.g., 4.7
  viewsCount: number;
  userSubmitted?: boolean;
  status?: 'active' | 'inactive' | 'pending' | 'rejected' | 'expired';
}

export type CategoryType = 'All' | 'Fashion' | 'Tech' | 'Dining' | 'Beauty' | 'Wellness' | 'Travel' | 'Home';

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
