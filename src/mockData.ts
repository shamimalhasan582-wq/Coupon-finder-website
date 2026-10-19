import { Coupon } from './types';

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
    subcategory: 'Running Shoes',
    websiteUrl: 'https://www.nike.com',
    description: 'Save 25% on selected high-performance running footwear, athletic apparel, and accessories. Valid online and at participating retail brand outlets and factory stores.',
    usageTips: 'Valid on regular priced items only. Limit one coupon per transaction. Cannot be combined with other ongoing promotions.',
    rating: 4.8,
    viewsCount: 1420,
    locations: [
      {
        id: 'l1',
        name: 'Nike Town Downtown Metro',
        address: '750 Broad St, Suite 10, Metro City',
        distance: '0.8 miles away',
        phone: '(555) 019-2834',
        hours: '10:00 AM - 9:00 PM',
        lat: 35,
        lng: 40
      },
      {
        id: 'l2',
        name: 'Nike Factory Outlet North',
        address: '2200 Premium Outlets Blvd, North Plaza',
        distance: '4.5 miles away',
        phone: '(555) 012-9988',
        hours: '10:00 AM - 8:00 PM',
        lat: 65,
        lng: 25
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
    subcategory: 'Laptops & Tablets',
    websiteUrl: 'https://www.apple.com',
    description: 'Special educational and student promo. Get $150 off standard retail configurations of the latest MacBook Air and iPad Pro models with digital certification.',
    usageTips: 'Requires valid student ID verification online or in-store standard student verification processes.',
    rating: 4.9,
    viewsCount: 3840,
    locations: [
      {
        id: 'l3',
        name: 'Apple Store City Center',
        address: '100 Terminal Plaza, West Wing',
        distance: '1.2 miles away',
        phone: '(555) 234-9088',
        hours: '9:00 AM - 9:00 PM',
        lat: 52,
        lng: 58
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
    subcategory: 'Smart Devices',
    websiteUrl: 'https://www.amazon.com',
    description: 'Enjoy 20% discount on select Echo, Fire TV, and Ring security hardware. Upgrade your smart home system efficiently.',
    usageTips: 'Applicable directly at checkout when selecting eligible Amazon-fulfilled certified items.',
    rating: 4.6,
    viewsCount: 2280,
    locations: [
      {
        id: 'l4',
        name: 'Amazon Lockers & Pickup - Broad',
        address: '420 Main St, Central Station East',
        distance: '1.5 miles away',
        phone: '(555) 880-1200',
        hours: '24/7 Access Point',
        lat: 48,
        lng: 32
      }
    ]
  },
  {
    id: 'c4',
    brandName: 'Sephora',
    brandLogoBg: 'bg-pink-600 text-white',
    discountValue: '$20 OFF',
    discountType: 'amount',
    productType: 'Cosmetics & Skin Care Products',
    expiryDate: 'Valid until May 31, 2026',
    couponCode: 'GLOWGETTER20',
    category: 'Beauty',
    subcategory: 'Cosmetics',
    websiteUrl: 'https://www.sephora.com',
    description: 'Get a direct $20 discount on your order of $80 or more on premium makeup, skin serums, organic hair care, and luxury solid fragrances.',
    usageTips: 'Requires a minimum pre-tax purchase of $80. Applies to Beauty Insider members (free to join on-spot).',
    rating: 4.7,
    viewsCount: 940,
    locations: [
      {
        id: 'l5',
        name: 'Sephora Pavilion Mall',
        address: '500 Galleria Boulevard, Space 230',
        distance: '2.1 miles away',
        phone: '(555) 432-8811',
        hours: '11:00 AM - 8:30 PM',
        lat: 20,
        lng: 70
      },
      {
        id: 'l6',
        name: 'Sephora Midtown Square',
        address: '88 Fashion Row Avenue',
        distance: '3.6 miles away',
        phone: '(555) 432-1599',
        hours: '10:00 AM - 9:00 PM',
        lat: 78,
        lng: 82
      }
    ]
  },
  {
    id: 'c5',
    brandName: 'Starbucks',
    brandLogoBg: 'bg-emerald-700 text-white',
    discountValue: 'BOGO FREE',
    discountType: 'deal',
    productType: 'Handcrafted Espresso Beverages',
    expiryDate: 'Valid until Aug 15, 2026',
    // Removed couponCode intentionally to trigger CASE B (No Coupon / Flat Discount / "Get Location" text)
    couponCode: '', 
    category: 'Dining',
    subcategory: 'Coffee & Cafe',
    websiteUrl: 'https://www.starbucks.com',
    description: 'Buy one Handcrafted Macchiato, Latte, or cold brew at standard regular price, and receive one of equal or lesser value completely free in-store. Spark up your afternoon routine!',
    usageTips: 'Valid only during afternoon happy hour (2:00 PM to 6:00 PM). Flat promotion redeemable at counter directly.',
    rating: 4.5,
    viewsCount: 3100,
    locations: [
      {
        id: 'l7',
        name: 'Starbucks Transit Lobby',
        address: '15 Financial Way, Ground Level',
        distance: '0.2 miles away',
        phone: '(555) 771-4400',
        hours: '6:00 AM - 8:00 PM',
        lat: 44,
        lng: 48
      },
      {
        id: 'l8',
        name: 'Starbucks Drive Thru East',
        address: '108 Outer Ring Road, Sector B',
        distance: '1.9 miles away',
        phone: '(555) 771-9981',
        hours: '5:30 AM - 10:00 PM',
        lat: 28,
        lng: 15
      },
      {
        id: 'l9',
        name: 'Starbucks Book Plaza Corner',
        address: '400 Library St, University District',
        distance: '2.5 miles away',
        phone: '(555) 223-1181',
        hours: '7:00 AM - 9:00 PM',
        lat: 82,
        lng: 45
      }
    ]
  },
  {
    id: 'c6',
    brandName: 'Best Buy',
    brandLogoBg: 'bg-blue-600 text-yellow-300 font-bold',
    discountValue: '10% OFF',
    discountType: 'percentage',
    productType: 'Smart TVs & Soundbars',
    expiryDate: 'Valid until Dec 24, 2026',
    couponCode: 'HOMETHEATER10',
    category: 'Tech',
    subcategory: 'TVs & Audio',
    websiteUrl: 'https://www.bestbuy.com',
    description: 'Upgrade your home theater setup. Get 10% off selected 4K OLED Smart TVs, wireless dolby atmos soundbars, and wall-mounting hardware packages.',
    usageTips: 'Excludes open-box items and special clearance markdowns. Free standard setup consultation included.',
    rating: 4.4,
    viewsCount: 1750,
    locations: [
      {
        id: 'l10',
        name: 'Best Buy Retail Hub East',
        address: '1400 Electronics Mall Hwy',
        distance: '3.8 miles away',
        phone: '(555) 909-2233',
        hours: '10:00 AM - 9:00 PM',
        lat: 85,
        lng: 70
      }
    ]
  },
  {
    id: 'c7',
    brandName: 'Airbnb',
    brandLogoBg: 'bg-rose-500 text-white',
    discountValue: '$50 OFF',
    discountType: 'amount',
    productType: 'First Booking of 3+ Nights',
    expiryDate: 'Valid until Dec 31, 2026',
    couponCode: 'WANDERLUST50',
    category: 'Travel',
    subcategory: 'Accommodations',
    websiteUrl: 'https://www.airbnb.com',
    description: 'Embark on a new adventure. Enjoy $50 off your first booking of 3 nights or more at unique cabin retreats, coastal villas, or central city apartments globally.',
    usageTips: 'Applicable to new traveler accounts only. Minimum booking subtotal of $250 required before taxes.',
    rating: 4.8,
    viewsCount: 2600,
    locations: [
      {
        id: 'l11',
        name: 'Airbnb Local Experience Point',
        address: 'Online Booking & Partner Check-ins',
        distance: 'Virtual / World-wide',
        phone: '(555) 000-TRAVEL',
        hours: '24/7 Digital Concierge',
        lat: 50,
        lng: 50
      }
    ]
  },
  {
    id: 'c8',
    brandName: 'Adidas',
    brandLogoBg: 'bg-zinc-900 text-white',
    discountValue: '30% OFF',
    discountType: 'percentage',
    productType: 'Sportswear & Tracksuits',
    expiryDate: 'Valid until Sep 30, 2026',
    couponCode: 'STRIPES30',
    category: 'Fashion',
    subcategory: 'Sportswear',
    websiteUrl: 'https://www.adidas.com',
    description: 'Get an exclusive 30% reduction on classic originals, training jackets, iconic track pants, and select streetwise caps.',
    usageTips: 'Can be redeemed at checkout on official websites or by barcode scanning in-store at direct premium locations.',
    rating: 4.7,
    viewsCount: 1080,
    locations: [
      {
        id: 'l12',
        name: 'Adidas Concept Outlet Store',
        address: '52 Fashion Boulevard, Suite B',
        distance: '1.8 miles away',
        phone: '(555) 887-1901',
        hours: '10:00 AM - 9:00 PM',
        lat: 38,
        lng: 60
      }
    ]
  },
  {
    id: 'c9',
    brandName: 'Dominos Pizza',
    brandLogoBg: 'bg-blue-700 text-red-500 font-black',
    discountValue: '40% OFF',
    discountType: 'percentage',
    productType: 'Any Large Specialty Pizza',
    expiryDate: 'Valid until Nov 15, 2026',
    couponCode: 'PIZZAPARTY40',
    category: 'Dining',
    subcategory: 'Pizza & Italian',
    websiteUrl: 'https://www.dominos.com',
    description: 'Feast with the family. Receive a massive 40% discount on any large premium specialty crust pizzas ordered online for pickup or delivery.',
    usageTips: 'Valid only on online orders or via the Domino\'s Mobile App on menu-price items.',
    rating: 4.5,
    viewsCount: 4500,
    locations: [
      {
        id: 'l13',
        name: 'Dominos Pizza - Avenue A',
        address: '22 Avenue A, corner of 4th St',
        distance: '0.5 miles away',
        phone: '(555) 333-4011',
        hours: '11:00 AM - Midnight',
        lat: 41,
        lng: 43
      },
      {
        id: 'l14',
        name: 'Dominos Delivery Point West',
        address: '298 West Expressway Plaza',
        distance: '2.8 miles away',
        phone: '(555) 333-4055',
        hours: '11:00 AM - Midnight',
        lat: 58,
        lng: 18
      }
    ]
  },
  {
    id: 'c10',
    brandName: 'Peloton',
    brandLogoBg: 'bg-red-950 text-white',
    discountValue: '$200 OFF',
    discountType: 'amount',
    productType: 'Peloton Bike & Bike+ Packages',
    expiryDate: 'Valid until Aug 31, 2026',
    // Removed couponCode intentionally to trigger CASE B (No Coupon / Flat Discount / "Get Location" text)
    couponCode: '', 
    category: 'Wellness',
    subcategory: 'Fitness Gear',
    websiteUrl: 'https://www.onepeloton.com',
    description: 'Transform your fitness journey. Enjoy a $200 direct discount on dynamic Peloton Bike or Bike+ premium fitness hardware setup at any showroom.',
    usageTips: 'Not applicable to previous purchases. Local setup assistance and diagnostic checking included automatically.',
    rating: 4.6,
    viewsCount: 820,
    locations: [
      {
        id: 'l15',
        name: 'Peloton Showroom Midtown',
        address: '77 Lifestyle Square, Center Court',
        distance: '2.4 miles away',
        phone: '(555) 890-4100',
        hours: '11:00 AM - 7:00 PM',
        lat: 15,
        lng: 55
      }
    ]
  },
  {
    id: 'partner_pre_1',
    brandName: 'Zara',
    brandLogoBg: 'bg-zinc-900 text-white',
    discountValue: '20% OFF',
    discountType: 'percentage',
    productType: 'Spring Collection Outerwear',
    expiryDate: 'Valid until July 31, 2026',
    couponCode: 'ZARASPRING20',
    category: 'Fashion',
    subcategory: 'Streetwear',
    websiteUrl: 'https://www.zara.com',
    description: 'Exclusive partner promotion for the Zara Spring Collection. Applicable to premium coats, jackets, and accessories.',
    rating: 4.7,
    viewsCount: 340,
    userSubmitted: true,
    status: 'active',
    locations: [
      {
        id: 'pl1',
        name: 'Zara Flagship Square',
        address: '500 Broadway St, New York',
        distance: '1.2 miles away',
        phone: '(555) 019-4823',
        hours: '10:00 AM - 9:00 PM',
        lat: 40,
        lng: 45
      }
    ]
  },
  {
    id: 'partner_pre_2',
    brandName: 'Best Buy',
    brandLogoBg: 'bg-blue-600 text-yellow-300 font-bold',
    discountValue: '$50 OFF',
    discountType: 'amount',
    productType: 'Sony Noise Cancelling Headphones',
    expiryDate: 'Awaiting Verification',
    couponCode: 'SONYHEAR50',
    category: 'Tech',
    subcategory: 'TVs & Audio',
    websiteUrl: 'https://www.bestbuy.com',
    description: 'Special offer submitted for evaluation. Redeemable for the industry-leading noise cancelling wireless headphones.',
    rating: 4.5,
    viewsCount: 18,
    userSubmitted: true,
    status: 'pending',
    locations: [
      {
        id: 'pl2',
        name: 'Best Buy Superstore',
        address: '101 Electronics Way',
        distance: '3.1 miles away',
        phone: '(555) 234-9000',
        hours: '10:05 AM - 8:00 PM',
        lat: 38,
        lng: 52
      }
    ]
  },
  {
    id: 'partner_pre_3',
    brandName: 'Starbucks',
    brandLogoBg: 'bg-emerald-700 text-white',
    discountValue: 'BUY 1 GET 1',
    discountType: 'deal',
    productType: 'Summer Cold Brew Drinks',
    expiryDate: 'Declined Offer',
    couponCode: 'SUMMERBREW',
    category: 'Dining',
    subcategory: 'Coffee & Cafe',
    websiteUrl: 'https://www.starbucks.com',
    description: 'Rejected: Missing verified merchant verification codes or invalid campaign period.',
    rating: 4.0,
    viewsCount: 0,
    userSubmitted: true,
    status: 'rejected',
    locations: [
      {
        id: 'pl3',
        name: 'Starbucks Galleria',
        address: '220 Fashion Galleria Plaza',
        distance: '0.4 miles away',
        phone: '(555) 123-4567',
        hours: '6:00 AM - 9:00 PM',
        lat: 42,
        lng: 41
      }
    ]
  },
  {
    id: 'partner_pre_4',
    brandName: 'Nike',
    brandLogoBg: 'bg-zinc-950 text-white',
    discountValue: '30% OFF',
    discountType: 'percentage',
    productType: 'Air Max Sneakers',
    expiryDate: 'Expired May 15, 2026',
    couponCode: 'AIRMAX30',
    category: 'Fashion',
    subcategory: 'Running Shoes',
    websiteUrl: 'https://www.nike.com',
    description: 'This promotional flash deal has expired and is no longer distributable on the public portal.',
    rating: 4.8,
    viewsCount: 1205,
    userSubmitted: true,
    status: 'expired',
    locations: [
      {
        id: 'pl4',
        name: 'Nike Town Downtown Metro',
        address: '750 Broad St, Suite 10, Metro City',
        distance: '0.8 miles away',
        phone: '(555) 019-2834',
        hours: '10:00 AM - 9:00 PM',
        lat: 35,
        lng: 40
      }
    ]
  }
];

export const TOP_BRANDS = [
  { name: 'Nike', logoBg: 'bg-zinc-950 text-white', icon: 'zap' },
  { name: 'Apple', logoBg: 'bg-zinc-100 text-zinc-900 border border-zinc-200', icon: 'smartphone' },
  { name: 'Amazon', logoBg: 'bg-amber-500 text-zinc-950', icon: 'shopping-cart' },
  { name: 'Sephora', logoBg: 'bg-pink-600 text-white', icon: 'sparkles' },
  { name: 'Starbucks', logoBg: 'bg-emerald-700 text-white', icon: 'coffee' },
  { name: 'Best Buy', logoBg: 'bg-blue-600 text-yellow-300 font-bold', icon: 'tv' },
  { name: 'Airbnb', logoBg: 'bg-rose-500 text-white', icon: 'map' },
  { name: 'Adidas', logoBg: 'bg-zinc-900 text-white', icon: 'activity' },
  { name: 'Dominos Pizza', logoBg: 'bg-blue-700 text-red-500', icon: 'pizza' },
  { name: 'Peloton', logoBg: 'bg-red-950 text-white', icon: 'heart' }
];

export const CATEGORIES = [
  { name: 'All', icon: 'compass' },
  { name: 'Fashion', icon: 'shirt' },
  { name: 'Tech', icon: 'laptop' },
  { name: 'Dining', icon: 'utensils' },
  { name: 'Beauty', icon: 'sparkles' },
  { name: 'Wellness', icon: 'activity' },
  { name: 'Travel', icon: 'plane' },
  { name: 'Home', icon: 'home' }
];

// Rich Subcategory mapping to power Task 2 subcategory filtering
export const SUBCATEGORIES_MAP: Record<string, string[]> = {
  'All': [],
  'Fashion': ['Running Shoes', 'Sportswear', 'Accessories', 'Streetwear'],
  'Tech': ['Laptops & Tablets', 'TVs & Audio', 'Gadgets', 'Phones & Accessories'],
  'Dining': ['Coffee & Cafe', 'Pizza & Italian', 'Fast Food', 'Casual Dining'],
  'Beauty': ['Cosmetics', 'Skincare', 'Haircare', 'Fragrance'],
  'Wellness': ['Fitness Gear', 'Supplements', 'Yoga & Meditation'],
  'Travel': ['Accommodations', 'Flights', 'Car Rentals', 'Luggage'],
  'Home': ['Smart Devices', 'Kitchenware', 'Furniture', 'Lighting']
};
