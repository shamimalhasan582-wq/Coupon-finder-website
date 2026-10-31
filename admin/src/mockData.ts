import { Brand, Category, Coupon, PartnerApplication } from './types';
import { ContactMessage } from './services/firestoreService';

export const INITIAL_COUPONS: Coupon[] = [
  {
    id: 'c1',
    brandName: 'Nike',
    brandLogoBg: 'bg-zinc-950 text-white',
    discountValue: '25% OFF',
    discountType: 'percentage',
    productType: 'Running Shoes & Training Gear',
    expiryDate: 'Valid until June 30, 2026',
    couponCode: 'RUNFAST25',
    category: 'Fashion',
    websiteUrl: 'https://www.nike.com',
    description: 'Save 25% on selected high-performance running footwear, athletic apparel, and accessories.',
    rating: 4.8,
    viewsCount: 1420,
    status: 'active',
    locations: [
      {
        id: 'l1',
        name: 'Nike Town Downtown Metro',
        address: '750 Broad St, Suite 10, Metro City',
        distance: '0.8 miles away',
        phone: '(555) 019-2834',
        hours: '10:00 AM - 9:00 PM',
      },
      {
        id: 'l2',
        name: 'Nike Factory Outlet North',
        address: '2200 Premium Outlets Blvd, North Plaza',
        distance: '4.5 miles away',
        phone: '(555) 012-9988',
        hours: '10:00 AM - 8:00 PM',
      }
    ]
  },
  {
    id: 'c2',
    brandName: 'Apple',
    brandLogoBg: 'bg-zinc-100 text-zinc-900 border border-zinc-200',
    discountValue: '$150 OFF',
    discountType: 'amount',
    productType: 'MacBook Air & iPad Pro',
    expiryDate: 'Valid until Oct 15, 2026',
    couponCode: 'BACKTOSCH150',
    category: 'Tech',
    websiteUrl: 'https://www.apple.com',
    description: 'Special educational and student promo. Get $150 off standard retail configurations.',
    rating: 4.9,
    viewsCount: 3840,
    status: 'active',
    locations: [
      {
        id: 'l3',
        name: 'Apple Store City Center',
        address: '100 Terminal Plaza, West Wing',
        distance: '1.2 miles away',
        phone: '(555) 234-9088',
        hours: '9:00 AM - 9:00 PM',
      }
    ]
  },
  {
    id: 'c3',
    brandName: 'Amazon',
    brandLogoBg: 'bg-amber-500 text-zinc-950',
    discountValue: '20% OFF',
    discountType: 'percentage',
    productType: 'Home Electronics & Smart Audio',
    expiryDate: 'Valid until July 12, 2026',
    couponCode: 'AMZNSMART20',
    category: 'Home',
    websiteUrl: 'https://www.amazon.com',
    description: 'Enjoy 20% discount on select Echo, Fire TV, and Ring security hardware.',
    rating: 4.6,
    viewsCount: 2280,
    status: 'active',
    locations: []
  },
  {
    id: 'c4',
    brandName: 'Sephora',
    brandLogoBg: 'bg-pink-600 text-white',
    discountValue: '15% OFF',
    discountType: 'percentage',
    productType: 'Luxury Fragrance & Skincare Sets',
    expiryDate: 'Valid until Aug 20, 2026',
    couponCode: 'BEAUTYGLOW15',
    category: 'Beauty',
    websiteUrl: 'https://www.sephora.com',
    description: 'Get 15% off premium perfume labels, face serums, and skincare essentials.',
    rating: 4.7,
    viewsCount: 1850,
    status: 'active',
    locations: []
  },
  {
    id: 'c5',
    brandName: 'Starbucks',
    brandLogoBg: 'bg-emerald-700 text-white',
    discountValue: 'FREE DRINK',
    discountType: 'deal',
    productType: 'Handcrafted Beverages (Any Size)',
    expiryDate: 'Valid until Dec 31, 2026',
    couponCode: 'COFFEELOVE',
    category: 'Dining',
    websiteUrl: 'https://www.starbucks.com',
    description: 'Buy one handcrafted espresso drink or refresher and get a second beverage free.',
    rating: 4.5,
    viewsCount: 4120,
    status: 'active',
    locations: []
  },
  {
    id: 'c6',
    brandName: 'Best Buy',
    brandLogoBg: 'bg-blue-600 text-yellow-300 font-bold',
    discountValue: '$50 OFF',
    discountType: 'amount',
    productType: 'Sony Noise Cancelling Headphones',
    expiryDate: 'Awaiting Verification',
    couponCode: 'SONYHEAR50',
    category: 'Tech',
    websiteUrl: 'https://www.bestbuy.com',
    description: 'Special offer submitted for evaluation. Redeemable for wireless headphones.',
    rating: 4.5,
    viewsCount: 180,
    status: 'pending',
    locations: []
  },
  {
    id: 'c7',
    brandName: 'Starbucks',
    brandLogoBg: 'bg-emerald-700 text-white',
    discountValue: 'BUY 1 GET 1',
    discountType: 'deal',
    productType: 'Summer Cold Brew Drinks',
    expiryDate: 'Declined Offer',
    couponCode: 'SUMMERBREW',
    category: 'Dining',
    websiteUrl: 'https://www.starbucks.com',
    description: 'Rejected: Missing merchant verification code.',
    rating: 4.0,
    viewsCount: 45,
    status: 'rejected',
    locations: []
  },
  {
    id: 'c8',
    brandName: 'Nike',
    brandLogoBg: 'bg-zinc-950 text-white',
    discountValue: '30% OFF',
    discountType: 'percentage',
    productType: 'Air Max Sneakers',
    expiryDate: 'Expired May 15, 2026',
    couponCode: 'AIRMAX30',
    category: 'Fashion',
    websiteUrl: 'https://www.nike.com',
    description: 'This promotional flash deal has expired.',
    rating: 4.8,
    viewsCount: 1205,
    status: 'expired',
    locations: []
  }
];

export const INITIAL_BRANDS: Brand[] = [
  {
    id: 'b1',
    name: 'Nike',
    logo: '',
    website: 'https://www.nike.com',
    category: 'Fashion',
    email: 'partnerships@nike.com',
    partnerStatus: 'active'
  },
  {
    id: 'b2',
    name: 'Apple',
    logo: '',
    website: 'https://www.apple.com',
    category: 'Tech',
    email: 'affiliates@apple.com',
    partnerStatus: 'active'
  },
  {
    id: 'b3',
    name: 'Amazon',
    logo: '',
    website: 'https://www.amazon.com',
    category: 'Home',
    email: 'deals@amazon.com',
    partnerStatus: 'active'
  },
  {
    id: 'b4',
    name: 'Sephora',
    logo: '',
    website: 'https://www.sephora.com',
    category: 'Beauty',
    email: 'promo@sephora.com',
    partnerStatus: 'active'
  },
  {
    id: 'b5',
    name: 'Starbucks',
    logo: '',
    website: 'https://www.starbucks.com',
    category: 'Dining',
    email: 'marketing@starbucks.com',
    partnerStatus: 'active'
  },
  {
    id: 'b6',
    name: 'Best Buy',
    logo: '',
    website: 'https://www.bestbuy.com',
    category: 'Tech',
    email: 'partner@bestbuy.com',
    partnerStatus: 'pending'
  }
];

export const INITIAL_USERS: any[] = [
  {
    id: 'u1',
    email: 'admin@coupon-finder.com',
    username: 'Super Admin',
    role: 'admin',
    status: 'active'
  },
  {
    id: 'u2',
    email: 'manager@coupon-finder.com',
    username: 'Operations Manager',
    role: 'admin',
    status: 'active'
  },
  {
    id: 'u3',
    email: 'nike.partner@nike.com',
    username: 'Nike Partner Representative',
    role: 'partner',
    status: 'active'
  },
  {
    id: 'u4',
    email: 'john.doe@gmail.com',
    username: 'John Doe',
    role: 'user',
    status: 'active'
  },
  {
    id: 'u5',
    email: 'sarah.smith@yahoo.com',
    username: 'Sarah Smith',
    role: 'user',
    status: 'active'
  }
];

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'cat1',
    name: 'Fashion',
    icon: 'shirt',
    subcategories: ['Running Shoes', 'Sportswear', 'Accessories', 'Streetwear'],
    description: 'Clothing, athletic footwear, and apparel accessories',
    status: 'active',
    createdAt: new Date('2026-01-01')
  },
  {
    id: 'cat2',
    name: 'Tech',
    icon: 'laptop',
    subcategories: ['Laptops & Tablets', 'TVs & Audio', 'Gadgets', 'Phones & Accessories'],
    description: 'Consumer electronics, computers, and smart hardware',
    status: 'active',
    createdAt: new Date('2026-01-02')
  },
  {
    id: 'cat3',
    name: 'Dining',
    icon: 'utensils',
    subcategories: ['Coffee & Cafe', 'Pizza & Italian', 'Fast Food', 'Casual Dining'],
    description: 'Restaurants, coffee shops, and delivery discounts',
    status: 'active',
    createdAt: new Date('2026-01-03')
  },
  {
    id: 'cat4',
    name: 'Beauty',
    icon: 'sparkles',
    subcategories: ['Cosmetics', 'Skincare', 'Haircare', 'Fragrance'],
    description: 'Skincare, makeup, and perfume promotions',
    status: 'active',
    createdAt: new Date('2026-01-04')
  },
  {
    id: 'cat5',
    name: 'Wellness',
    icon: 'activity',
    subcategories: ['Fitness Gear', 'Supplements', 'Yoga & Meditation'],
    description: 'Gym equipment, health supplements, and fitness',
    status: 'active',
    createdAt: new Date('2026-01-05')
  },
  {
    id: 'cat6',
    name: 'Travel',
    icon: 'plane',
    subcategories: ['Accommodations', 'Flights', 'Car Rentals', 'Luggage'],
    description: 'Hotels, flight bookings, and travel gear',
    status: 'active',
    createdAt: new Date('2026-01-06')
  },
  {
    id: 'cat7',
    name: 'Home',
    icon: 'home',
    subcategories: ['Smart Devices', 'Kitchenware', 'Furniture', 'Lighting'],
    description: 'Furniture, smart home appliances, and decor',
    status: 'active',
    createdAt: new Date('2026-01-07')
  }
];

export const INITIAL_APPLICATIONS: PartnerApplication[] = [
  {
    id: 'app1',
    companyName: 'Adidas North America',
    email: 'partnerships@adidas.com',
    phone: '(555) 432-8765',
    website: 'https://www.adidas.com',
    address: '5055 N Greeley Ave, Portland, OR',
    shopType: 'both',
    category: 'Fashion',
    status: 'pending',
    createdAt: new Date('2026-10-15')
  },
  {
    id: 'app2',
    companyName: 'Target Retail Stores',
    email: 'promo@target.com',
    phone: '(555) 987-6543',
    website: 'https://www.target.com',
    address: '1000 Nicollet Mall, Minneapolis, MN',
    shopType: 'both',
    category: 'Home',
    status: 'pending',
    createdAt: new Date('2026-10-20')
  }
];

export const INITIAL_MESSAGES: ContactMessage[] = [
  {
    id: 'msg1',
    name: 'Alice Walker',
    email: 'alice.walker@example.com',
    subject: 'coupon',
    message: 'Hello, the Nike RUNFAST25 coupon is not applying at checkout on the outlet store. Could you please check if the terms have changed?',
    status: 'unread',
    createdAt: new Date('2026-10-28T14:30:00')
  },
  {
    id: 'msg2',
    name: 'David Miller',
    email: 'david.m@retailpartners.io',
    subject: 'partnership',
    message: 'We are interested in listing our retail chain coupons on your portal. What is the process for merchant verification?',
    status: 'read',
    createdAt: new Date('2026-10-27T09:15:00')
  }
];

