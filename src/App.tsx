import React, { useState, useEffect, useMemo } from 'react';
import Header, { UserProfile } from './components/Header';
import Hero from './components/Hero';
import CouponCard from './components/CouponCard';
import CouponDetailsModal from './components/CouponDetailsModal';
import SubmitCouponModal from './components/SubmitCouponModal';
import CategoryView from './components/CategoryView';
import ProfileView from './components/ProfileView';
import BecomePartnerView from './components/BecomePartnerView';
import ResetPasswordView from './components/ResetPasswordView';
import ContactView from './components/ContactView';
import { INITIAL_COUPONS, TOP_BRANDS, CATEGORIES } from './mockData';
import { Coupon } from './types';
import { couponService, brandService, userService } from './services/firestoreService';
import { 
  Shirt, Laptop, Utensils, Sparkles, Activity, Plane, Home, Compass, 
  MapPin, Bookmark, Percent, AlertCircle, ShoppingCart, Zap, Smartphone,
  Coffee, Tv, Pizza, Heart, RefreshCw, X, ArrowRight, Star, Grid, Award, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Dynamic mapping utility for icons
const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'shirt': return <Shirt className="w-4 h-4" />;
    case 'laptop': return <Laptop className="w-4 h-4" />;
    case 'utensils': return <Utensils className="w-4 h-4" />;
    case 'sparkles': return <Sparkles className="w-4 h-4" />;
    case 'activity': return <Activity className="w-4 h-4" />;
    case 'plane': return <Plane className="w-4 h-4" />;
    case 'home': return <Home className="w-4 h-4" />;
    case 'shopping-cart': return <ShoppingCart className="w-4 h-4" />;
    case 'zap': return <Zap className="w-4 h-4" />;
    case 'smartphone': return <Smartphone className="w-4 h-4" />;
    case 'coffee': return <Coffee className="w-4 h-4" />;
    case 'tv': return <Tv className="w-4 h-4" />;
    case 'pizza': return <Pizza className="w-4 h-4" />;
    case 'heart': return <Heart className="w-4 h-4" />;
    default: return <Compass className="w-4 h-4" />;
  }
};

export default function App() {
  // Main virtual tab / view tracking state
  const [currentView, setCurrentView] = useState<'home' | 'category' | 'brand' | 'profile' | 'become-partner' | 'reset-password' | 'contact'>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');
    const email = urlParams.get('email');
    const token = urlParams.get('token');
    if (mode === 'resetPassword' && oobCode) return 'reset-password';
    if (mode === 'setupPassword' && email && token) return 'reset-password';
    return 'home';
  });
  const [resetOobCode, setResetOobCode] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');
    return (mode === 'resetPassword' && oobCode) ? oobCode : null;
  });
  const [setupEmail, setSetupEmail] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const email = urlParams.get('email');
    const token = urlParams.get('token');
    return (mode === 'setupPassword' && email && token) ? email : null;
  });
  const [setupToken, setSetupToken] = useState<string | null>(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const email = urlParams.get('email');
    const token = urlParams.get('token');
    return (mode === 'setupPassword' && email && token) ? token : null;
  });

  // Role simulation parameter for credentials login
  const [initialRole, setInitialRole] = useState<'user' | 'partner'>('user');

  // Become Partner CTA → dedicated application form
  const handleBecomePartner = () => {
    setCurrentView('become-partner');
    setShowBookmarksOnly(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Selected Category / Brand locks to pass as initializer variables
  const [routeCategory, setRouteCategory] = useState('Fashion');
  const [routeBrand, setRouteBrand] = useState('Nike');

  // Core dynamic coupon database state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  
  // Home query search parameters
  const [searchQuery, setSearchQuery] = useState('');
  
  // Bookmarks state (saved codes directory)
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);

  // Modal display toggles
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Authenticated user state
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    name: 'Guest User',
    email: 'guest@couponfinder.com',
    isLoggedIn: false
  });

  // Status from Firestore — reflects admin changes (active / inactive / banned)
  const [accountStatus, setAccountStatus] = useState<'active' | 'inactive' | 'banned'>('active');
  // Ref to hold the current unsubscribe for user status listener so we can swap it on login
  const statusUnsubRef = React.useRef<(() => void) | null>(null);

  // Initial Restorations
  useEffect(() => {
    // 0. Clean invite / password set link from browser URL history
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    const oobCode = urlParams.get('oobCode');
    const email = urlParams.get('email');
    const token = urlParams.get('token');
    if ((mode === 'resetPassword' && oobCode) || (mode === 'setupPassword' && email && token)) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    // 1. Coupons Database
    const unsubscribe = couponService.listenToCoupons(
      (firestoreCoupons) => {
        setCoupons(firestoreCoupons.length > 0 ? firestoreCoupons : INITIAL_COUPONS);
      },
      () => {
        setCoupons(INITIAL_COUPONS);
      }
    );

    // 2. Saved Bookmarks
    const cachedBookmarks = localStorage.getItem('coupon_finder_bookmarks');
    if (cachedBookmarks) {
      try {
        setBookmarkedIds(JSON.parse(cachedBookmarks));
      } catch (e) {
        setBookmarkedIds([]);
      }
    }

    // 3. Google Authenticated user profile state
    const cachedProfile = localStorage.getItem('coupon_finder_profile');
    let restoredProfile: any = null;
    if (cachedProfile) {
      try {
        restoredProfile = JSON.parse(cachedProfile);
        setCurrentUser(restoredProfile);
      } catch (e) {
        // stay Guest
      }
    }

    // 4. Real-time status enforcement — if admin bans/deactivates, apply immediately
    let unsubscribeUsers: (() => void) | null = null;
    if (restoredProfile?.isLoggedIn && restoredProfile?.email) {
      unsubscribeUsers = userService.listenToUsers((allUsers: any[]) => {
        const match = allUsers.find(
          (u: any) => u.email && restoredProfile.email &&
            u.email.toLowerCase() === restoredProfile.email.toLowerCase()
        );
        if (match) {
          setAccountStatus(match.status || 'active');
        }
      });
    }

    return () => {
      unsubscribe();
      unsubscribeUsers?.();
    };
  }, []);

  // Sync utilities
  const saveBookmarks = (updatedIds: string[]) => {
    setBookmarkedIds(updatedIds);
    localStorage.setItem('coupon_finder_bookmarks', JSON.stringify(updatedIds));
  };

  const handleLoginSuccess = async (profile: UserProfile) => {
    setCurrentUser(profile);
    localStorage.setItem('coupon_finder_profile', JSON.stringify(profile));

    // Start real-time status listener for this user
    if (statusUnsubRef.current) statusUnsubRef.current();
    if (profile.isLoggedIn && profile.email) {
      statusUnsubRef.current = userService.listenToUsers((allUsers: any[]) => {
        const match = allUsers.find(
          (u: any) => u.email && profile.email &&
            u.email.toLowerCase() === profile.email.toLowerCase()
        );
        if (match) setAccountStatus(match.status || 'active');
      });
    } else {
      setAccountStatus('active');
    }

    if (profile.role === 'partner') {
      try {
        const brands = await brandService.getBrands();
        const existingBrand = brands.find(
          (b: any) => b.name && profile.name && b.name.toLowerCase() === profile.name.toLowerCase()
        ) as any;
        if (!existingBrand && profile.name) {
          // Brand doesn't exist yet — create it with email
          await brandService.addBrand({
            name: profile.name,
            email: profile.email || '',
            logo: '',
            website: '',
          });
        } else if (existingBrand && (!existingBrand.email || existingBrand.email === '') && profile.email) {
          // Brand exists but email is missing — update it
          await brandService.updateBrand(existingBrand.id, {
            email: profile.email,
          });
        }
      } catch (error) {
        console.error('Error auto-creating/updating brand for partner login:', error);
      }
    }
    // Save / upsert every logged-in user to Firestore so admin can see them
    if (profile.isLoggedIn && profile.email) {
      try {
        const existingUsers = await userService.getUsers();
        const existingUser = existingUsers.find(
          (u: any) => u.email && u.email.toLowerCase() === profile.email.toLowerCase()
        );
        if (!existingUser) {
          await userService.addUser({
            username: profile.name,
            email: profile.email,
            role: profile.role || 'user',
            status: 'active',
            photoURL: profile.photoURL || '',
            avatarBg: profile.avatarBg || 'bg-emerald-600',
          });
        }
      } catch (error) {
        console.error('Error saving user to Firestore:', error);
      }
    }
  };

  const handleLogout = () => {
    const guestAccount = { name: 'Guest User', email: 'guest@couponfinder.com', isLoggedIn: false };
    setCurrentUser(guestAccount);
    localStorage.setItem('coupon_finder_profile', JSON.stringify(guestAccount));
  };

  // Toggle dynamic bookmarks
  const handleToggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    let updated;
    if (bookmarkedIds.includes(id)) {
      updated = bookmarkedIds.filter(bId => bId !== id);
    } else {
      updated = [...bookmarkedIds, id];
    }
    saveBookmarks(updated);
  };

  // Handle addition of custom vouchers
  const handleAddCoupon = async (newCoupon: Coupon) => {
    await couponService.addCoupon(newCoupon);
  };

  // Handle deletion of custom/partner vouchers
  const handleDeleteCoupon = async (id: string) => {
    await couponService.deleteCoupon(id);
  };

  // Handle edit/update of custom/partner vouchers
  const handleUpdateCoupon = async (updatedCoupon: Coupon) => {
    await couponService.updateCoupon(updatedCoupon.id, updatedCoupon);
  };

  // Search keyword selector
  const handleShowPromoSuggestion = (term: string) => {
    setSearchQuery(term);
  };

  // Reset filtering configuration
  const handleClearAllFilters = () => {
    setSearchQuery('');
    setShowBookmarksOnly(false);
  };

  // Task 2 redirection logic
  const handleCategoryRedirect = (categoryName: string) => {
    setRouteCategory(categoryName);
    setCurrentView('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Task 1 & Task 3 redirection logic: integrate brand click directly into Categories view
  const handleBrandRedirect = (brandName: string) => {
    // Find the category of this brand's coupons, or default to 'Fashion'
    const foundCoupon = coupons.find(c => c.brandName.toLowerCase() === brandName.toLowerCase());
    const matchedCategory = foundCoupon ? foundCoupon.category : 'Fashion';
    setRouteCategory(matchedCategory);
    setRouteBrand(brandName);
    setCurrentView('category');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Home search filter mapping
  const homeFilteredCoupons = useMemo(() => {
    return coupons.filter(coupon => {
      if (coupon.status && coupon.status !== 'active') {
        return false;
      }

      // 1. Show bookmarks folder state
      if (showBookmarksOnly && !bookmarkedIds.includes(coupon.id)) {
        return false;
      }

      // 2. Search query mapping
      if (searchQuery.trim()) {
        const trm = searchQuery.toLowerCase();
        const bMatch = coupon.brandName.toLowerCase().includes(trm);
        const pMatch = (coupon.productType || '').toLowerCase().includes(trm);
        const cMatch = coupon.couponCode?.toLowerCase().includes(trm) || false;
        const dMatch = (coupon.description || '').toLowerCase().includes(trm);
        const catMatch = (coupon.category || '').toLowerCase().includes(trm);
        return bMatch || pMatch || cMatch || dMatch || catMatch;
      }

      return true;
    });
  }, [coupons, searchQuery, showBookmarksOnly, bookmarkedIds]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col justify-between" id="app-wrapper">
      
      {/* 1. Universal Layout Header */}
      {currentView !== 'reset-password' && (
        <Header
          bookmarkedCount={bookmarkedIds.length}
          showBookmarksOnly={showBookmarksOnly}
          setShowBookmarksOnly={setShowBookmarksOnly}
          onSubmitCouponClick={() => setShowSubmitModal(true)}
          onExploreClick={handleClearAllFilters}
          currentView={currentView}
          setCurrentView={(view) => {
            if (view === 'profile') {
              setInitialRole('user');
            }
            setCurrentView(view);
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          onBecomePartnerClick={handleBecomePartner}
        />
      )}

      {/* Main Container Core Router Workspace */}
      <main className={`flex-grow pb-16 ${currentView === 'reset-password' ? 'pt-0' : 'pt-16'}`}>
        <AnimatePresence mode="wait">
          
          {/* ==================== VIEW 1: HOMEPAGE GALLERY ==================== */}
          {currentView === 'home' && (
            <motion.div
              key="view-home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {/* 2. Long search bar (Hero) */}
              <Hero
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                totalActiveCount={homeFilteredCoupons.length}
                onClearFilters={handleClearAllFilters}
                showPromoSuggestion={handleShowPromoSuggestion}
              />

              {/* Browse By Category section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10" id="categories-module">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-zinc-900 leading-tight flex items-center gap-2">
                      <Grid className="w-5 h-5 text-emerald-600" />
                      Browse Verified Categories
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Click any vertical category to redirect to dynamic subcategory filtering</p>
                  </div>
                </div>

                {/* 3. Horizontal list representing Categories redirection */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 select-none">
                  {CATEGORIES.map((cat) => (
                    <motion.button
                      key={cat.name}
                      whileHover={{ scale: 1.03, y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleCategoryRedirect(cat.name === 'All' ? 'Fashion' : cat.name)}
                      className="flex flex-col items-center justify-center p-4 bg-white border border-zinc-200 hover:border-emerald-500 rounded-2xl text-center cursor-pointer hover:shadow-md transition-all group"
                      id={`home-cat-${cat.name}`}
                    >
                      <div className="w-10 h-10 bg-zinc-50 border border-zinc-200/50 text-zinc-500 group-hover:bg-emerald-50 group-hover:text-emerald-700 rounded-xl flex items-center justify-center transition-colors mb-2">
                        {getIconComponent(cat.icon)}
                      </div>
                      <span className="text-xs font-bold text-zinc-800 tracking-tight group-hover:text-emerald-600">
                        {cat.name}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Top brand segment */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10" id="brands-module">
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-display font-bold text-lg text-zinc-900 leading-tight flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-600" />
                      Our Premium Featured Brands
                    </h3>
                    <p className="text-xs text-zinc-400 mt-0.5">Click any corporate badge to view their single brand listing portal</p>
                  </div>
                </div>

                {/* 4. Top Brands redirection strip */}
                <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-3">
                  {TOP_BRANDS.map((brand) => (
                    <motion.button
                      key={brand.name}
                      whileHover={{ y: -3, scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => handleBrandRedirect(brand.name)}
                      className="flex flex-col items-center justify-center p-3.5 bg-white border border-zinc-200/80 hover:border-emerald-500 rounded-2xl text-center transition-all cursor-pointer hover:shadow-sm"
                      id={`home-brand-btn-${brand.name}`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-xs uppercase mb-2 ${brand.logoBg}`}>
                        {brand.name.slice(0, 2)}
                      </div>
                      <span className="text-xs font-bold text-zinc-800 truncate max-w-full">
                        {brand.name}
                      </span>
                      <span className="text-[9px] text-emerald-600 font-bold font-mono tracking-wider mt-0.5 uppercase">
                        GOTO PORTAL
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Coupon Listing section */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12" id="coupon-list-view">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 bg-white p-4.5 rounded-2xl border border-zinc-200 shadow-3xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold font-mono text-zinc-400 uppercase tracking-widest">ACTIVE BROWSING PORTFOLIO:</span>
                    {searchQuery && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-zinc-900 text-white px-2 py-0.5 rounded-md">
                        &quot;{searchQuery}&quot;
                        <button onClick={() => setSearchQuery('')} className="hover:text-red-400 font-bold ml-1">×</button>
                      </span>
                    )}
                    {showBookmarksOnly && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-0.5 rounded-lg">
                        Saved folder
                      </span>
                    )}
                    {!searchQuery && !showBookmarksOnly && (
                      <span className="text-xs text-zinc-500 font-medium">All Direct Offers & In-Store Coordinates</span>
                    )}
                  </div>
                  <div className="text-xs font-medium text-zinc-500">
                    Showing <span className="font-extrabold text-zinc-800">{homeFilteredCoupons.length}</span> active deals
                  </div>
                </div>

                {/* Call layout gallery or show empty prompt */}
                {homeFilteredCoupons.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-zinc-200 max-w-lg mx-auto w-full p-6 space-y-4">
                    <div className="w-12 h-12 bg-amber-50 text-amber-500 border border-amber-200 rounded-full flex items-center justify-center mx-auto">
                      <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-zinc-800">No active promotions found</div>
                    <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                      Could not locate any active codes. Try typing a broader brand name like &quot;Nike&quot; or resetting active keywords.
                    </p>
                    <button onClick={handleClearAllFilters} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl scroll-smooth">
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                      {homeFilteredCoupons.map((coupon) => (
                        <CouponCard
                          key={coupon.id}
                          coupon={coupon}
                          isBookmarked={bookmarkedIds.includes(coupon.id)}
                          onToggleBookmark={handleToggleBookmark}
                          onGetCoupon={(c) => setSelectedCoupon(c)}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ==================== VIEW 2: CATEGORY REDIRECTION AND SUB-FILTERING ==================== */}
          {currentView === 'category' && (
            <motion.div
              key="view-category"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
            >
              <CategoryView
                coupons={coupons}
                bookmarkedIds={bookmarkedIds}
                onToggleBookmark={handleToggleBookmark}
                onGetCoupon={(c) => setSelectedCoupon(c)}
                initialCategory={routeCategory}
                initialBrand={routeBrand}
              />
            </motion.div>
          )}

          {/* ==================== VIEW 4: USER PROFILE PAGES & GOOGLE LOGIN ==================== */}
          {currentView === 'profile' && (
            <motion.div
              key="view-profile"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              {currentUser.isLoggedIn && accountStatus !== 'active' ? (
                /* ── Account Blocked Screen ── */
                <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-5">
                  <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl ${accountStatus === 'banned' ? 'bg-red-100' : 'bg-amber-100'}`}>
                    {accountStatus === 'banned' ? '🚫' : '⏸️'}
                  </div>
                  <h2 className="text-2xl font-display font-black text-zinc-900">
                    {accountStatus === 'banned' ? 'Account Suspended' : 'Account Inactive'}
                  </h2>
                  <p className="text-sm text-zinc-500 leading-relaxed">
                    {accountStatus === 'banned'
                      ? 'Your account has been suspended by an administrator. Please contact support if you believe this is a mistake.'
                      : 'Your account has been marked as inactive. Please contact support to reactivate it.'
                    }
                  </p>
                  <button
                    onClick={handleLogout}
                    className="px-6 py-2.5 bg-zinc-900 text-white text-sm font-bold rounded-xl hover:bg-zinc-700 transition cursor-pointer"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <ProfileView
                  currentUser={currentUser}
                  onLoginSuccess={handleLoginSuccess}
                  onLogout={handleLogout}
                  coupons={coupons}
                  bookmarkedIds={bookmarkedIds}
                  onToggleBookmark={handleToggleBookmark}
                  onGetCoupon={(c) => setSelectedCoupon(c)}
                  onAddCoupon={handleAddCoupon}
                  onDeleteCoupon={handleDeleteCoupon}
                  onUpdateCoupon={handleUpdateCoupon}
                  initialRole={initialRole}
                />
              )}
            </motion.div>
          )}

          {/* ==================== VIEW 5: BECOME PARTNER FORM ==================== */}
          {currentView === 'become-partner' && (
            <motion.div
              key="view-become-partner"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <BecomePartnerView
                onBack={() => {
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          )}

          {/* ==================== VIEW 6: RESET / SET PASSWORD ==================== */}
          {currentView === 'reset-password' && (resetOobCode || (setupEmail && setupToken)) && (
            <motion.div
              key="view-reset-password"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2 }}
            >
              <ResetPasswordView
                oobCode={resetOobCode}
                setupEmail={setupEmail}
                setupToken={setupToken}
                onSuccess={(email, companyName) => {
                  handleLoginSuccess({
                    name: companyName,
                    email: email,
                    isLoggedIn: true,
                    role: 'partner',
                  });
                  setResetOobCode(null);
                  setSetupEmail(null);
                  setSetupToken(null);
                  setCurrentView('profile');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onCancel={() => {
                  setResetOobCode(null);
                  setSetupEmail(null);
                  setSetupToken(null);
                  setCurrentView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            </motion.div>
          )}

          {/* ==================== VIEW 6: CONTACT US ==================== */}
          {currentView === 'contact' && (
            <motion.div
              key="view-contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
            >
              <ContactView onBack={() => setCurrentView('home')} />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Corporate Disclaimer footer */}
      {currentView !== 'reset-password' && (
        <footer className="bg-zinc-900 text-zinc-400 py-12 border-t border-zinc-800 mt-12" id="main-footer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-600 text-white p-1.5 rounded-lg flex items-center justify-center">
                  <Percent className="w-4 h-4" />
                </div>
                <span className="font-display font-medium text-white tracking-tight">
                  Coupon<span className="text-emerald-500">Finder</span> Vouchers Hub
                </span>
              </div>
              <div className="text-[11px] font-mono font-medium max-w-md md:text-right text-zinc-500 leading-normal">
                Disclaimer: Coupon codes are aggregated from official brand resources and verified crowdsourcing channels. All trademarks & brands belong to respective parent corporations.
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-zinc-800/80 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
              <span>&copy; {new Date().getFullYear()} Coupon Finder Applet. Made with Google AI Studio.</span>
              <div className="flex justify-center items-center gap-4 text-zinc-500">
                <button onClick={() => setCurrentView('home')} className="hover:text-emerald-500 font-semibold cursor-pointer">Explore</button>
                <button onClick={() => setCurrentView('category')} className="hover:text-emerald-500 font-semibold cursor-pointer">Categories</button>
                <button onClick={handleBecomePartner} className="text-emerald-500 font-extrabold hover:text-emerald-400 cursor-pointer flex items-center gap-1">Become Partner <Award className="w-3 h-3 text-emerald-500" /></button>
                <button onClick={() => setCurrentView('contact')} className="hover:text-emerald-500 font-semibold cursor-pointer">Contact Us</button>
              </div>
            </div>
          </div>
        </footer>
      )}

      {/* Coupon Detail Modal overlay */}
      <AnimatePresence>
        {selectedCoupon && (
          <CouponDetailsModal
            key="details-modal"
            coupon={selectedCoupon}
            onClose={() => setSelectedCoupon(null)}
          />
        )}
      </AnimatePresence>

      {/* Submit Coupon Modal overlay */}
      <AnimatePresence>
        {showSubmitModal && (
          <SubmitCouponModal
            key="submit-modal"
            onClose={() => setShowSubmitModal(false)}
            onSubmit={handleAddCoupon}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
