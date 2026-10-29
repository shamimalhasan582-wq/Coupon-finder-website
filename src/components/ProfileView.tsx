import React, { useState, useMemo, useEffect, useRef } from 'react';
import { categoryService, userService, brandService } from '../services/firestoreService';
import { Coupon, StoreLocation } from '../types';
import CouponCard from './CouponCard';
import { UserProfile } from './Header';
import {
  User, Mail, Calendar, ShieldCheck, Bookmark, LogOut,
  Check, AlertCircle, TrendingUp, PlusCircle, Trash2, Edit3,
  ShoppingBag, Building, Save, X, Sparkles, Tag, Layers, Clock, ArrowRight, Eye, MapPin, Phone, Globe,
  ShieldAlert, ShieldOff, ShieldQuestion
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { auth } from '../config/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { partnerApplicationService } from '../services/firestoreService';

interface ProfileViewProps {
  currentUser: UserProfile;
  onLoginSuccess: (user: UserProfile) => void;
  onLogout: () => void;
  coupons: Coupon[];
  bookmarkedIds: string[];
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onGetCoupon: (coupon: Coupon) => void;
  onAddCoupon: (coupon: Coupon) => void;
  onDeleteCoupon: (id: string) => void;
  onUpdateCoupon: (coupon: Coupon) => void;
  initialRole?: 'user' | 'partner';
}

export default function ProfileView({
  currentUser,
  onLoginSuccess,
  onLogout,
  coupons,
  bookmarkedIds,
  onToggleBookmark,
  onGetCoupon,
  onAddCoupon,
  onDeleteCoupon,
  onUpdateCoupon,
  initialRole = 'user'
}: ProfileViewProps) {
  // Task 1: Custom local credentials login states
  const [selectedRole, setSelectedRole] = useState<'user' | 'partner'>(initialRole);
  const [isRegistering, setIsRegistering] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Sync role selection to disable registration mode for partners
  useEffect(() => {
    if (selectedRole === 'partner') {
      setIsRegistering(false);
    }
  }, [selectedRole]);

  // Sync role redirection if triggered via Become Partner link
  React.useEffect(() => {
    if (initialRole) {
      setSelectedRole(initialRole);
    }
  }, [initialRole]);

  // Tab synchronizer effect based on current user role
  React.useEffect(() => {
    if (currentUser.isLoggedIn) {
      if (currentUser.role === 'partner') {
        setActiveTab('partner-manage');
      } else {
        setActiveTab('bookmarks');
      }
    }
  }, [currentUser.role, currentUser.isLoggedIn]);

  // Local state for the Google simulation pop-up modal
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [authStep, setAuthStep] = useState<'select' | 'custom' | 'role-select' | 'loading' | 'done'>('select');

  // Staging state before role selection completes
  const [tempProfile, setTempProfile] = useState<{ name: string; email: string; avatarBg: string } | null>(null);

  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');

  // Partner creation form fields
  const [partnerBrandName, setPartnerBrandName] = useState('');
  const [partnerDiscountVal, setPartnerDiscountVal] = useState('');
  const [partnerProdType, setPartnerProdType] = useState('');
  const [partnerCategory, setPartnerCategory] = useState('Fashion');
  const [partnerSubcategory, setPartnerSubcategory] = useState('');
  const [partnerPromoCode, setPartnerPromoCode] = useState('');
  const [partnerExpiry, setPartnerExpiry] = useState('2026-12-31');
  const [partnerWebsite, setPartnerWebsite] = useState('https://');
  const [partnerDesc, setPartnerDesc] = useState('');
  const [shopType, setShopType] = useState<'online' | 'offline'>('online');
  const [partnerShopAddress, setPartnerShopAddress] = useState('');

  // Refs for date picker inputs (so clicking anywhere on field opens calendar)
  const partnerExpiryRef = useRef<HTMLInputElement>(null);
  const editExpiryRef = useRef<HTMLInputElement>(null);

  // Active edit state for management
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // Modal toggle state for creating an offer
  const [showCreateModal, setShowCreateModal] = useState(false);
  // Modal viewing state for campaign details
  const [viewingCouponDetails, setViewingCouponDetails] = useState<Coupon | null>(null);

  // Dynamic categories loaded from Firestore (admin-controlled)
  const [activeCategories, setActiveCategories] = useState<{ id: string; name: string }[]>([]);

  // ── Partner account status from Firestore brands collection ──
  const [partnerAccountStatus, setPartnerAccountStatus] = useState<'active' | 'pending' | 'suspended' | 'rejected' | null>(null);

  // Real-time listener: watch the brands collection for THIS partner's brand doc
  useEffect(() => {
    if (!currentUser.isLoggedIn || currentUser.role !== 'partner' || !currentUser.name) return;

    const unsubscribe = brandService.listenToBrands((brands: any[]) => {
      const match = brands.find(
        (b: any) => b.name && b.name.toLowerCase() === currentUser.name.toLowerCase()
      );
      setPartnerAccountStatus(match?.partnerStatus ?? 'pending');
    });

    return () => unsubscribe?.();
  }, [currentUser.isLoggedIn, currentUser.role, currentUser.name]);

  // Load active categories when the create-offer modal opens
  useEffect(() => {
    if (!showCreateModal) return;
    categoryService.getActiveCategories().then((cats) => {
      setActiveCategories(cats);
      // Reset to first active category or keep current if still valid
      if (cats.length > 0 && !cats.find((c) => c.name === partnerCategory)) {
        setPartnerCategory(cats[0].name);
      }
    });
  }, [showCreateModal]);

  // Settings switches


  // User profile editing states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);
  const [editPhotoURL, setEditPhotoURL] = useState(currentUser.photoURL || '');
  const [editAvatarBg, setEditAvatarBg] = useState(currentUser.avatarBg || 'bg-emerald-600');

  // Sync profile editing states with current user when they change
  React.useEffect(() => {
    if (currentUser) {
      setEditName(currentUser.name);
      setEditEmail(currentUser.email);
      setEditPhotoURL(currentUser.photoURL || '');
      setEditAvatarBg(currentUser.avatarBg || 'bg-emerald-600');
    }
  }, [currentUser]);

  // Active sub-tab inside profile/partner view
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'settings' | 'partner-manage' | 'partner-submit'>('bookmarks');

  // Multi-account suggestions list for Google OAuth popup
  const suggestedGoogleAccounts = [
    { name: 'Sarah Jenkins', email: 'sarah.jenkins@gmail.com', avatarBg: 'bg-indigo-600', letters: 'SJ' },
    { name: 'David Miller', email: 'miller.david99@gmail.com', avatarBg: 'bg-amber-600', letters: 'DM' },
    { name: 'Chloe Chen', email: 'chloe.chen.studio@gmail.com', avatarBg: 'bg-rose-650', letters: 'CC' }
  ];

  // User's bookmarked coupons filtered from core database
  const savedCoupons = useMemo(() => {
    return coupons.filter(c => bookmarkedIds.includes(c.id));
  }, [coupons, bookmarkedIds]);

  // Partner managed coupons — only coupons submitted by THIS partner (matched by brand name)
  const partnerManagedCoupons = useMemo(() => {
    if (!currentUser?.name) return [];
    return coupons.filter(
      c => c.userSubmitted === true &&
      c.brandName.toLowerCase() === currentUser.name.toLowerCase()
    );
  }, [coupons, currentUser?.name]);

  // Dynamic statistics state filter for partner dashboard
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'pending' | 'rejected' | 'expired'>('all');

  // Calculates status metrics
  const partnerStats = useMemo(() => {
    const total = partnerManagedCoupons.length;
    const pending = partnerManagedCoupons.filter(c => c.status === 'pending').length;
    const active = partnerManagedCoupons.filter(c => c.status === 'active' || !c.status).length;
    const rejected = partnerManagedCoupons.filter(c => c.status === 'rejected').length;
    const expired = partnerManagedCoupons.filter(c => c.status === 'expired').length;
    return { total, pending, active, rejected, expired };
  }, [partnerManagedCoupons]);

  // Filtered dataset for the campaign management console
  const displayedCoupons = useMemo(() => {
    return partnerManagedCoupons.filter(c => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'active') return !c.status || c.status === 'active';
      return c.status === statusFilter;
    });
  }, [partnerManagedCoupons, statusFilter]);

  // Total calculated savings metrics
  const estimatedSavings = useMemo(() => {
    return savedCoupons.reduce((sum, coupon) => {
      const valStr = coupon.discountValue.replace(/[^0-9]/g, '');
      const parsedValue = valStr ? parseInt(valStr, 10) : 15;
      return sum + parsedValue;
    }, 0);
  }, [savedCoupons]);

  // Handle choice of Google Account
  const handleSelectSuggestedAccount = (account: typeof suggestedGoogleAccounts[0]) => {
    const chosenRole = selectedRole;
    setAuthStep('loading');

    setTimeout(() => {
      onLoginSuccess({
        name: account.name,
        email: account.email,
        isLoggedIn: true,
        avatarBg: account.avatarBg,
        role: chosenRole
      });
      // Redirect partner automatically to partner management tabs
      if (chosenRole === 'partner') {
        setActiveTab('partner-manage');
      } else {
        setActiveTab('bookmarks');
      }
      setAuthStep('done');
      setTimeout(() => {
        setShowGoogleModal(false);
        setAuthStep('select');
      }, 1000);
    }, 1200);
  };

  // Handle custom manual login details
  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail || !customName) return;

    const bgColors = ['bg-orange-600', 'bg-violet-600', 'bg-emerald-600', 'bg-blue-600', 'bg-rose-600'];
    const chosenBg = bgColors[Math.floor(Math.random() * bgColors.length)];

    setTempProfile({
      name: customName,
      email: customEmail,
      avatarBg: chosenBg
    });
    setAuthStep('role-select');
  };

  // Final role assignment login completion
  const handleCompleteSetupWithRole = (role: 'user' | 'partner') => {
    if (!tempProfile) return;
    setAuthStep('loading');

    setTimeout(() => {
      onLoginSuccess({
        name: tempProfile.name,
        email: tempProfile.email,
        isLoggedIn: true,
        avatarBg: tempProfile.avatarBg,
        role: role
      });
      // Redirect partner automatically to partner management tabs
      if (role === 'partner') {
        setActiveTab('partner-manage');
      } else {
        setActiveTab('bookmarks');
      }
      setAuthStep('done');
      setTimeout(() => {
        setShowGoogleModal(false);
        setAuthStep('select');
        setTempProfile(null);
        setCustomEmail('');
        setCustomName('');
      }, 1000);
    }, 1200);
  };

  // Task 1: Simulated email & password login/registration handler
  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput) {
      setLoginError('Please fill out all fields.');
      return;
    }
    if (isRegistering && !nameInput) {
      setLoginError('Please enter your full name to create an account.');
      return;
    }

    setLoginError('');

    if (selectedRole === 'partner') {
      // --- REAL FIREBASE AUTH FOR PARTNERS ---
      setAuthStep('loading');
      setShowGoogleModal(true);

      try {
        const userCredential = await signInWithEmailAndPassword(auth, emailInput, passwordInput);
        const user = userCredential.user;

        // Fetch company name from application
        const application = await partnerApplicationService.getApplicationByEmail(user.email || emailInput);
        const displayName = application?.companyName || (user.email ? user.email.split('@')[0] : 'Partner Brand');
        
        const bgColors = ['bg-orange-600', 'bg-violet-600', 'bg-emerald-600', 'bg-blue-600', 'bg-rose-600'];
        const chosenBg = bgColors[Math.floor(Math.random() * bgColors.length)];

        onLoginSuccess({
          name: displayName,
          email: user.email || emailInput,
          isLoggedIn: true,
          avatarBg: chosenBg,
          role: 'partner'
        });

        setActiveTab('partner-manage');
        setAuthStep('done');

        // Clear values
        setEmailInput('');
        setPasswordInput('');
        setNameInput('');

        setTimeout(() => {
          setShowGoogleModal(false);
          setAuthStep('select');
        }, 1200);

      } catch (err: any) {
        console.error('Partner login error:', err);
        setShowGoogleModal(false);
        setAuthStep('select');
        if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
          setLoginError('Invalid email or password. Please verify your credentials.');
        } else {
          setLoginError(err.message || 'Authentication failed.');
        }
      }
    } else {
      // --- SIMULATED OAUTH FOR USERS ---
      setAuthStep('loading');
      setShowGoogleModal(true); // show the beautiful authentication progress overlay !

      const displayUserEmail = emailInput;
      const namePart = emailInput.split('@')[0];
      const defaultName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
      const displayName = isRegistering ? nameInput : defaultName;
      const bgColors = ['bg-orange-600', 'bg-violet-600', 'bg-emerald-600', 'bg-blue-600', 'bg-rose-600'];
      const chosenBg = bgColors[Math.floor(Math.random() * bgColors.length)];

      setTimeout(() => {
        onLoginSuccess({
          name: displayName,
          email: displayUserEmail,
          isLoggedIn: true,
          avatarBg: chosenBg,
          role: selectedRole
        });

        setActiveTab('bookmarks');
        setAuthStep('done');
        // Clear values
        setEmailInput('');
        setPasswordInput('');
        setNameInput('');
        setIsRegistering(false);

        setTimeout(() => {
          setShowGoogleModal(false);
          setAuthStep('select');
        }, 1200);
      }, 1500);
    }
  };

  // Handle addition of partner promo code from partner view form
  const handlePartnerAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const brandName = currentUser?.name || 'Partner Brand';

    if (shopType === 'online' && (!partnerDiscountVal || !partnerProdType)) {
      alert('Please fill out Discount Value and Product Name/Tag.');
      return;
    }
    if (shopType === 'offline' && (!partnerDiscountVal || !partnerShopAddress)) {
      alert('Please fill out Discount Value and Shop Address.');
      return;
    }

    const newCoupon: Coupon = {
      id: `partner_deal_${Date.now()}`,
      brandName: brandName,
      brandLogoBg: 'bg-zinc-900 text-white',
      discountValue: partnerDiscountVal,
      discountType: partnerDiscountVal.includes('%') ? 'percentage' : 'amount',
      productType: shopType === 'online' ? partnerProdType : 'In-Store Deal',
      expiryDate: partnerExpiry ? (() => { const d = new Date(partnerExpiry); const dd = String(d.getDate()).padStart(2,'0'); const mm = String(d.getMonth()+1).padStart(2,'0'); const yy = String(d.getFullYear()).slice(2); return `${dd}/${mm}/${yy}`; })() : '31/12/26',
      couponCode: partnerPromoCode ? partnerPromoCode.toUpperCase() : '',
      category: partnerCategory,
      websiteUrl: partnerWebsite || 'https://google.com',
      description: partnerDesc || `Exclusive campaign deal presented by standard verified brand partner ${brandName}`,
      rating: 4.8,
      viewsCount: 140,
      userSubmitted: true,
      status: 'pending',
      locations: shopType === 'offline' ? [
        {
          id: `pos_${Date.now()}`,
          name: `${brandName} Outlet`,
          address: partnerShopAddress,
          distance: '0.5 Miles',
          phone: '(555) 123-4567',
          hours: '9:00 AM - 9:00 PM',
          lat: 45,
          lng: 45
        }
      ] : [
        {
          id: 'pos_1',
          name: `${brandName} Online Portal`,
          address: 'Digital Redirection / Online Store',
          distance: 'Virtual',
          phone: '',
          hours: '24/7 Online',
          lat: 50,
          lng: 50
        }
      ]
    };

    onAddCoupon(newCoupon);

    // Reset Form Fields
    setPartnerBrandName('');
    setPartnerDiscountVal('');
    setPartnerProdType('');
    setPartnerPromoCode('');
    setPartnerSubcategory('');
    setPartnerDesc('');
    setShopType('online');
    setPartnerShopAddress('');
    setShowCreateModal(false);

    // Go to management table
    setActiveTab('partner-manage');
  };

  // Handle Edit coupon save
  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    // If partner is re-submitting an expired coupon (e.g. extended date),
    // reset status to 'pending' so admin must re-approve before it goes live.
    const updatedCoupon = editingCoupon.status === 'expired'
      ? { ...editingCoupon, status: 'pending' as const }
      : editingCoupon;

    onUpdateCoupon(updatedCoupon);
    setEditingCoupon(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="account-portal-root">

      {currentUser.isLoggedIn ? (
        /* ==================== SCREEN: LOGGED IN PORTAL ==================== */
        <div className="space-y-8">

          {/* Top Account Branding Banner */}
          <div className="bg-white border border-zinc-200/80 rounded-3xl p-6 sm:p-8 relative overflow-hidden" id="account-branding-banner">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl -translate-y-12 translate-x-12" />

            {isEditingProfile ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  const updatedProfile = {
                    ...currentUser,
                    name: editName,
                    photoURL: editPhotoURL || undefined,
                    avatarBg: editAvatarBg
                  };
                  onLoginSuccess(updatedProfile);
                  // Sync to Firestore so admin panel reflects the change
                  try {
                    const allUsers = await userService.getUsers();
                    const match = allUsers.find(
                      (u: any) => u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()
                    );
                    if (match) {
                      await userService.updateUser(match.id, {
                        username: editName,
                        photoURL: editPhotoURL || '',
                        avatarBg: editAvatarBg,
                      });
                    }
                  } catch (err) {
                    console.error('Failed to sync profile to admin:', err);
                  }
                  setIsEditingProfile(false);
                }}
                className="w-full font-sans relative z-10"
                id="edit-profile-form"
              >
                <div className="flex flex-col sm:flex-row items-center gap-8">

                  {/* Clickable photo — triggers file upload */}
                  <div className="shrink-0 flex flex-col items-center gap-2">
                    <label className="cursor-pointer group relative block" title="Click to change photo">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-md border-2 border-zinc-200 group-hover:border-emerald-500 transition relative">
                        {editPhotoURL ? (
                          <img
                            src={editPhotoURL}
                            alt="Preview"
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className={`w-full h-full ${editAvatarBg} text-white flex items-center justify-center font-display font-black text-3xl uppercase`}>
                            {(editName || 'G').slice(0, 1)}
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center rounded-3xl">
                          <span className="text-white text-[10px] font-bold text-center leading-tight px-1">Change<br/>Photo</span>
                        </div>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (ev) => setEditPhotoURL(ev.target?.result as string);
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {editPhotoURL && (
                      <button
                        type="button"
                        onClick={() => setEditPhotoURL('')}
                        className="text-[10px] text-zinc-400 hover:text-red-500 transition cursor-pointer"
                      >
                        Remove photo
                      </button>
                    )}
                  </div>

                  {/* Name + buttons */}
                  <div className="flex-1 w-full space-y-4">
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1.5">Full Name</label>
                      <input
                        type="text"
                        required
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Your display name"
                        className="w-full text-sm px-4 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-xl focus:outline-none"
                      />
                    </div>
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="flex-1 px-4 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold rounded-xl transition cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <Save className="w-3.5 h-3.5" />
                        Save
                      </button>
                    </div>
                  </div>

                </div>
              </form>
            ) : (
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10 font-sans">

                <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 text-center sm:text-left">
                  {/* Account Avatar */}
                  <div className="w-20 h-20 rounded-3xl overflow-hidden shadow-md shrink-0 relative bg-zinc-100 flex items-center justify-center border border-zinc-200">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className={`w-full h-full ${currentUser.avatarBg || 'bg-emerald-600'} text-white flex items-center justify-center font-display font-black text-3xl uppercase`}>
                        {currentUser.name.slice(0, 1)}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <h2 className="text-2xl font-display font-black text-zinc-900 tracking-tight">
                        {currentUser.name}
                      </h2>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-y-1.5 gap-x-4 mt-2 text-xs text-zinc-500 font-medium">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-zinc-400" />
                        {currentUser.email}
                      </span>
                      <span className="hidden xs:inline text-zinc-300">|</span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        Partner Portal Activated
                      </span>
                    </div>
                  </div>
                </div>

                {/* Account Operations Toolbar */}
                <div className="flex flex-row items-center justify-center sm:justify-start gap-3.5 self-center sm:self-start md:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditName(currentUser.name);
                      setEditEmail(currentUser.email);
                      setEditPhotoURL(currentUser.photoURL || '');
                      setEditAvatarBg(currentUser.avatarBg || 'bg-emerald-600');
                      setIsEditingProfile(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-zinc-50 text-zinc-700 border border-zinc-200 text-xs font-bold rounded-xl transition cursor-pointer shadow-3xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={onLogout}
                    className="flex items-center gap-2 px-4 py-2.5 bg-zinc-100 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-150 text-zinc-650 border border-zinc-200 text-xs font-bold rounded-xl transition cursor-pointer shadow-3xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out Account</span>
                  </button>
                </div>

              </div>
            )}
          </div>

          {/* Unified Workspace Selector Tabs */}
          <div className="border-b border-zinc-200" id="account-tabs-bar">
            <div className="flex flex-wrap gap-x-6 gap-y-2">
              {currentUser.role === 'partner' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('partner-manage');
                    setEditingCoupon(null);
                  }}
                  className={`py-3 px-1.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer relative whitespace-nowrap ${activeTab === 'partner-manage'
                      ? 'border-emerald-600 text-zinc-900'
                      : 'border-transparent text-zinc-400 hover:text-zinc-600'
                    }`}
                >
                  <span>Manage Campaigns ({partnerManagedCoupons.length})</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  setActiveTab('bookmarks');
                  setEditingCoupon(null);
                }}
                className={`py-3 px-1.5 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer relative whitespace-nowrap ${activeTab === 'bookmarks'
                    ? 'border-emerald-600 text-zinc-900'
                    : 'border-transparent text-zinc-400 hover:text-zinc-600'
                  }`}
              >
                <span>Saved Bookmarks ({savedCoupons.length})</span>
                {savedCoupons.length > 0 && (
                  <span className="ml-1.5 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] rounded-full font-black border border-emerald-100">
                    {savedCoupons.length}
                  </span>
                )}
              </button>


            </div>
          </div>

          <div className="pt-2">

            {/* Tab Page: Campaign Management (Partners only) */}
            {activeTab === 'partner-manage' && currentUser.role === 'partner' && (
              <div className="space-y-6">

                {/* ── Partner Account Status Banner ── */}
                {partnerAccountStatus && partnerAccountStatus !== 'active' && (
                  <div className={`flex items-start gap-4 p-4 rounded-2xl border ${
                    partnerAccountStatus === 'rejected'
                      ? 'bg-rose-50 border-rose-200'
                      : partnerAccountStatus === 'suspended'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-amber-50 border-amber-200'
                  }`}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      partnerAccountStatus === 'rejected'
                        ? 'bg-rose-100 text-rose-600'
                        : partnerAccountStatus === 'suspended'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-amber-100 text-amber-600'
                    }`}>
                      {partnerAccountStatus === 'rejected' ? (
                        <ShieldOff className="w-4.5 h-4.5" />
                      ) : partnerAccountStatus === 'suspended' ? (
                        <ShieldAlert className="w-4.5 h-4.5" />
                      ) : (
                        <ShieldQuestion className="w-4.5 h-4.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black font-mono uppercase tracking-widest ${
                          partnerAccountStatus === 'rejected'
                            ? 'text-rose-500'
                            : partnerAccountStatus === 'suspended'
                              ? 'text-red-500'
                              : 'text-amber-500'
                        }`}>Partner Account Status</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black font-mono uppercase tracking-wider border ${
                          partnerAccountStatus === 'rejected'
                            ? 'bg-rose-100 text-rose-700 border-rose-200'
                            : partnerAccountStatus === 'suspended'
                              ? 'bg-red-100 text-red-700 border-red-200'
                              : 'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>{partnerAccountStatus}</span>
                      </div>
                      <p className={`text-sm font-semibold mt-0.5 ${
                        partnerAccountStatus === 'rejected'
                          ? 'text-rose-800'
                          : partnerAccountStatus === 'suspended'
                            ? 'text-red-800'
                            : 'text-amber-800'
                      }`}>
                        {partnerAccountStatus === 'rejected'
                          ? 'Your partner account has been rejected by our team.'
                          : partnerAccountStatus === 'suspended'
                            ? 'Your partner account has been suspended.'
                            : 'Your partner account is awaiting admin approval.'}
                      </p>
                      <p className={`text-xs mt-1 ${
                        partnerAccountStatus === 'rejected'
                          ? 'text-rose-600'
                          : partnerAccountStatus === 'suspended'
                            ? 'text-red-600'
                            : 'text-amber-600'
                      }`}>
                        {partnerAccountStatus === 'rejected'
                          ? 'Campaign submissions are disabled. Please contact support to appeal this decision.'
                          : partnerAccountStatus === 'suspended'
                            ? 'Campaign submissions are temporarily disabled. Please contact support for more information.'
                            : 'You can still prepare offers. They will go live once your account is approved.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Task 1: Partner Dashboard Quick Metrics (Completely non-clickable) */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4" id="partner-dashboard-stats-grid">

                  {/* Card 1: All Offers */}
                  <div
                    className="p-4 border border-zinc-200 bg-white rounded-2xl flex items-center gap-3 shadow-3xs text-left w-full"
                    id="stat-all-offers"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-700">
                      <Layers className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[9px] font-extrabold font-mono uppercase tracking-wider text-zinc-400">All Offers</span>
                      <span className="text-lg font-mono font-black leading-tight block text-zinc-900">{partnerStats.total}</span>
                    </div>
                  </div>

                  {/* Card 2: Pending Submissions */}
                  <div
                    className="p-4 border border-zinc-200 bg-white rounded-2xl flex items-center gap-3 shadow-3xs text-left w-full"
                    id="stat-pending-submissions"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-orange-50 text-orange-600 border border-orange-100">
                      <Clock className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[9px] font-extrabold font-mono uppercase tracking-wider text-zinc-400">Pending</span>
                      <span className="text-lg font-mono font-black leading-tight block text-zinc-900">{partnerStats.pending}</span>
                    </div>
                  </div>

                  {/* Card 3: Active Offers */}
                  <div
                    className="p-4 border border-zinc-200 bg-white rounded-2xl flex items-center gap-3 shadow-3xs text-left w-full"
                    id="stat-active-offers"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-600 border border-emerald-100">
                      <TrendingUp className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[9px] font-extrabold font-mono uppercase tracking-wider text-zinc-400">Active Offers</span>
                      <span className="text-lg font-mono font-black leading-tight block text-zinc-900">{partnerStats.active}</span>
                    </div>
                  </div>

                  {/* Card 4: Rejected Submissions */}
                  <div
                    className="p-4 border border-zinc-200 bg-white rounded-2xl flex items-center gap-3 shadow-3xs text-left w-full"
                    id="stat-rejected-submissions"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-rose-50 text-rose-600 border border-rose-100">
                      <AlertCircle className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[9px] font-extrabold font-mono uppercase tracking-wider text-zinc-400">Rejected</span>
                      <span className="text-lg font-mono font-black leading-tight block text-zinc-900">{partnerStats.rejected}</span>
                    </div>
                  </div>

                  {/* Card 5: Expired Offers */}
                  <div
                    className="p-4 border border-zinc-200 bg-white rounded-2xl flex items-center gap-3 shadow-3xs text-left w-full"
                    id="stat-expired-offers"
                  >
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-zinc-100 text-zinc-500">
                      <Calendar className="w-4.5 h-4.5" />
                    </div>
                    <div className="min-w-0">
                      <span className="block text-[9px] font-extrabold font-mono uppercase tracking-wider text-zinc-400">Expired</span>
                      <span className="text-lg font-mono font-black leading-tight block text-zinc-900">{partnerStats.expired}</span>
                    </div>
                  </div>

                </div>

                {/* Layout Content pages */}
                <div className="pt-2">

                  {/* Sub-tab 1: Manage Discount Campaigns */}
                  {activeTab === 'partner-manage' && !editingCoupon && (
                    <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-3xs overflow-hidden">

                      {/* Header with exclusive "Create Offer" button */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div>
                          <h3 className="font-display font-bold text-lg text-zinc-900 font-sans">Campaign Management Console</h3>
                          <p className="text-xs text-zinc-500 mt-1">Review, modify or remove active promotional codes from active listings.</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowCreateModal(true)}
                          disabled={partnerAccountStatus === 'rejected' || partnerAccountStatus === 'suspended'}
                          title={partnerAccountStatus === 'rejected' ? 'Account rejected — cannot create offers' : partnerAccountStatus === 'suspended' ? 'Account suspended — cannot create offers' : ''}
                          className={`px-4.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 self-start transition-all border-0 ${
                            partnerAccountStatus === 'rejected' || partnerAccountStatus === 'suspended'
                              ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                              : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-md'
                          }`}
                        >
                          <PlusCircle className="w-4 h-4" />
                          <span>Create Offer</span>
                        </button>
                      </div>

                      {/* Filter Pills segment inside offer details card */}
                      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 pb-4 mb-5">
                        <span className="text-[10px] font-bold text-zinc-400 font-mono uppercase tracking-wider mr-2">Filter Lists:</span>
                        {[
                          { id: 'all', label: 'All Offers', count: partnerStats.total },
                          { id: 'pending', label: 'Pending', count: partnerStats.pending },
                          { id: 'active', label: 'Active', count: partnerStats.active },
                          { id: 'rejected', label: 'Rejected', count: partnerStats.rejected },
                          { id: 'expired', label: 'Expired', count: partnerStats.expired },
                        ].map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setStatusFilter(item.id as any)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${statusFilter === item.id
                                ? 'bg-zinc-900 border-zinc-900 text-white shadow-3xs'
                                : 'bg-zinc-50 border-zinc-200 hover:border-zinc-300 text-zinc-600'
                              }`}
                          >
                            <span>{item.label}</span>
                            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${statusFilter === item.id
                                ? 'bg-zinc-800 text-white'
                                : 'bg-zinc-200 text-zinc-500'
                              }`}>
                              {item.count}
                            </span>
                          </button>
                        ))}
                      </div>

                      {partnerManagedCoupons.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-zinc-100 text-zinc-400 font-mono tracking-wider font-bold">
                                <th className="pb-3 font-semibold uppercase text-left">Offer ID</th>
                                <th className="pb-3 font-semibold uppercase text-left">Discount Value</th>
                                <th className="pb-3 font-semibold uppercase text-left">Category</th>
                                <th className="pb-3 font-semibold uppercase text-left">Expiry Date</th>
                                <th className="pb-3 font-semibold uppercase text-left">Promo Code</th>
                                <th className="pb-3 font-semibold uppercase text-left">Status</th>
                                <th className="pb-3 font-semibold uppercase text-right pr-4">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-50 bg-white">
                              {displayedCoupons.length > 0 ? (
                                displayedCoupons.map((c) => (
                                  <tr key={c.id} className="group hover:bg-zinc-50/40 transition-colors">
                                    {/* Offer ID */}
                                    <td className="py-4 font-bold text-zinc-900">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-7 h-7 rounded-md bg-zinc-100 text-zinc-500 flex items-center justify-center font-bold text-[10px] uppercase shadow-3xs shrink-0">
                                          <Tag className="w-3.5 h-3.5" />
                                        </div>
                                        <span className="font-mono text-xs font-semibold text-zinc-700 truncate max-w-[120px] sm:max-w-none">{c.id}</span>
                                      </div>
                                    </td>

                                    {/* Discount Value */}
                                    <td className="py-4 font-mono font-black text-emerald-600 text-sm">
                                      {c.discountValue}
                                    </td>

                                    {/* Category */}
                                    <td className="py-4 text-zinc-650">
                                      <span className="inline-block px-2.5 py-0.5 bg-zinc-50 border border-zinc-200 rounded-full text-[10px] font-bold text-zinc-550">
                                        {c.category}
                                      </span>
                                    </td>

                                    {/* Expiry Date */}
                                    <td className="py-4 text-zinc-500 font-medium whitespace-nowrap">
                                      {c.expiryDate}
                                    </td>

                                    {/* Promo Code */}
                                    <td className="py-4 font-mono">
                                      {c.couponCode ? (
                                        <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 font-bold rounded-md">
                                          {c.couponCode}
                                        </span>
                                      ) : (
                                        <span className="text-zinc-400 font-sans text-xs font-semibold uppercase">N/A</span>
                                      )}
                                    </td>

                                    {/* Status */}
                                    <td className="py-4">
                                       <span className={`inline-block px-2.5 py-0.5 border text-[9px] font-bold font-mono rounded-full uppercase tracking-wider whitespace-nowrap ${
                                          !c.status || c.status === 'active'
                                            ? 'bg-emerald-50 text-emerald-750 border-emerald-150'
                                            : c.status === 'inactive'
                                              ? 'bg-zinc-100 text-zinc-500 border-zinc-200'
                                              : c.status === 'pending'
                                                ? 'bg-orange-50 text-orange-750 border-orange-150'
                                                : c.status === 'rejected'
                                                  ? 'bg-rose-50 text-rose-750 border-rose-150'
                                                  : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                                        }`}>
                                         {!c.status || c.status === 'active' ? 'Active' : c.status === 'inactive' ? 'Inactive' : c.status}
                                       </span>
                                    </td>

                                    {/* Actions with Right alignment */}
                                    <td className="py-4 text-right pr-4">
                                      <div className="flex items-center justify-end gap-3.5">
                                        {/* Toggle — active ↔ inactive freely (admin-approved). Locked for pending/rejected/expired. */}
                                        {c.status === 'active' || !c.status ? (
                                          // ACTIVE → partner clicks to set inactive (hidden from users)
                                          <div className="flex items-center gap-1.5" title="Click to set inactive (hides from users)">
                                            <button
                                              type="button"
                                              onClick={() => onUpdateCoupon({ ...c, status: 'inactive' })}
                                              className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-emerald-500"
                                              id={`toggle-status-${c.id}`}
                                            >
                                              <span className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out translate-x-4" />
                                            </button>
                                            <span className="text-[9px] font-bold font-mono w-5 text-left select-none text-emerald-600">ON</span>
                                          </div>
                                        ) : c.status === 'inactive' ? (
                                          // INACTIVE → partner clicks to re-activate
                                          <div className="flex items-center gap-1.5" title="Click to re-activate this offer">
                                            <button
                                              type="button"
                                              onClick={() => onUpdateCoupon({ ...c, status: 'active' })}
                                              className="relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-zinc-300 hover:bg-zinc-400"
                                              id={`toggle-status-${c.id}`}
                                            >
                                              <span className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out translate-x-0" />
                                            </button>
                                            <span className="text-[9px] font-bold font-mono w-5 text-left select-none text-zinc-400">OFF</span>
                                          </div>
                                        ) : (
                                          // PENDING / REJECTED / EXPIRED → read-only, dimmed
                                          <div className="flex items-center gap-1.5" title={c.status === 'pending' ? 'Awaiting admin approval' : c.status === 'rejected' ? 'Offer rejected by admin' : 'Offer expired — edit & resubmit to go live again'}>
                                            <div className="relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent opacity-40 cursor-not-allowed bg-zinc-200">
                                              <span className="pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 translate-x-0" />
                                            </div>
                                            <span className="text-[9px] font-bold font-mono w-5 text-left select-none opacity-40 text-zinc-400">OFF</span>
                                          </div>
                                        )}

                                        {/* Task 3: View Details button */}
                                        <button
                                          type="button"
                                          onClick={() => setViewingCouponDetails(c)}
                                          className="p-1 px-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/50 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                                          title="View Details"
                                          id={`view-btn-${c.id}`}
                                        >
                                          <Eye className="w-3.5 h-3.5 text-zinc-500" />
                                          <span>View</span>
                                        </button>

                                        {/* Edit Details */}
                                        <button
                                          type="button"
                                          onClick={() => setEditingCoupon({ ...c })}
                                          className="p-1 px-2.5 bg-zinc-50 hover:bg-emerald-50 hover:text-emerald-700 text-zinc-650 border border-zinc-200/50 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                                          title="Edit details"
                                          id={`edit-btn-${c.id}`}
                                        >
                                          <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                                          <span>Edit</span>
                                        </button>

                                        {/* Remove (Trash) */}
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (confirm(`Are you sure you want to delete the active discount for ${c.brandName}?`)) {
                                              onDeleteCoupon(c.id);
                                            }
                                          }}
                                          className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                                          title="Remove coupon"
                                          id={`delete-btn-${c.id}`}
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={7} className="py-10 text-center text-zinc-500">
                                    <div className="flex flex-col items-center justify-center gap-1.5 py-4">
                                      <div className="w-9 h-9 rounded-full bg-zinc-100 text-zinc-400 flex items-center justify-center">
                                        <Layers className="w-4.5 h-4.5 text-zinc-400" />
                                      </div>
                                      <div className="text-sm font-bold text-zinc-700">No campaigns found</div>
                                      <p className="text-xs text-zinc-405 text-center leading-normal">
                                        There are no submissions currently filtered as <span className="font-extrabold uppercase font-mono text-[10px] text-zinc-500 bg-zinc-150 px-1.5 py-0.5 rounded-md">{statusFilter}</span>.
                                      </p>
                                      <button
                                        type="button"
                                        onClick={() => setStatusFilter('all')}
                                        className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-bold underline cursor-pointer bg-transparent border-0"
                                      >
                                        Show all campaigns
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-12 text-center max-w-sm mx-auto space-y-4 font-sans">
                          <div className="w-12 h-12 bg-zinc-50 text-zinc-400 border border-zinc-200 rounded-full flex items-center justify-center mx-auto">
                            <Layers className="w-6 h-6" />
                          </div>
                          <div className="text-sm font-bold text-zinc-800">No campaigns launched yet</div>
                          <p className="text-xs text-zinc-400 leading-normal">
                            Create a campaign containing voucher coupon codes, descriptions, and location markers to go live.
                          </p>
                          <button
                            type="button"
                            onClick={() => setShowCreateModal(true)}
                            className="px-4.5 py-2.5 bg-zinc-900 border-0 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                          >
                            Create Offer
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sub-tab 1 Edit panel state */}
                  {editingCoupon && (
                    <form onSubmit={handleEditSave} className="bg-white border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto shadow-md">
                      <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
                        <div>
                          <span className="text-[10px] font-mono tracking-widest text-emerald-600 font-bold uppercase">SECURED MANAGEMENT HANDLER</span>
                          <h3 className="font-display font-bold text-xl text-zinc-900">Edit Campaign Vouchers</h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setEditingCoupon(null)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-600 bg-zinc-50 hover:bg-zinc-100 rounded-full"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Brand Name *</label>
                          <input
                            type="text"
                            required
                            value={editingCoupon.brandName}
                            onChange={e => setEditingCoupon({ ...editingCoupon, brandName: e.target.value })}
                            className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Discount Value * (e.g. 20% OFF, $30 OFF)</label>
                          <input
                            type="text"
                            required
                            value={editingCoupon.discountValue}
                            onChange={e => setEditingCoupon({ ...editingCoupon, discountValue: e.target.value })}
                            className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Subtitle / Offer Product *</label>
                          <input
                            type="text"
                            required
                            value={editingCoupon.productType}
                            onChange={e => setEditingCoupon({ ...editingCoupon, productType: e.target.value })}
                            className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Promotional Text-Code (Optional)</label>
                          <input
                            type="text"
                            placeholder="e.g. SUMMERDEAL20"
                            value={editingCoupon.couponCode || ''}
                            onChange={e => setEditingCoupon({ ...editingCoupon, couponCode: e.target.value || undefined })}
                            className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Expiration Date *</label>
                          <div
                            className="relative cursor-pointer"
                            onClick={() => { try { editExpiryRef.current?.showPicker(); } catch {} }}
                          >
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                            </span>
                            {/* Text display showing dd/mm/yy */}
                            <div className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-lg select-none">
                              {(() => {
                                const raw = editingCoupon.expiryDate || '';
                                const parts = raw.split('/');
                                return parts.length === 3 ? raw : <span className="text-zinc-400">DD/MM/YY</span>;
                              })()}
                            </div>
                            {/* Real date input */}
                            <input
                              ref={editExpiryRef}
                              type="date"
                              value={(() => {
                                const raw = editingCoupon.expiryDate || '';
                                const parts = raw.split('/');
                                if (parts.length === 3) {
                                  const [d, m, y] = parts;
                                  return `20${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}`;
                                }
                                return '';
                              })()}
                              onChange={e => {
                                const d = new Date(e.target.value);
                                if (!isNaN(d.getTime())) {
                                  const dd = String(d.getDate()).padStart(2,'0');
                                  const mm = String(d.getMonth()+1).padStart(2,'0');
                                  const yy = String(d.getFullYear()).slice(2);
                                  setEditingCoupon({ ...editingCoupon, expiryDate: `${dd}/${mm}/${yy}` });
                                }
                              }}
                              className="sr-only"
                              tabIndex={-1}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Redirect merchant URL</label>
                          <input
                            type="text"
                            value={editingCoupon.websiteUrl}
                            onChange={e => setEditingCoupon({ ...editingCoupon, websiteUrl: e.target.value })}
                            className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Core Category</label>
                        <select
                          value={editingCoupon.category}
                          onChange={e => setEditingCoupon({ ...editingCoupon, category: e.target.value })}
                          className="w-full text-xs px-3 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg"
                        >
                          <option value="Fashion">Fashion</option>
                          <option value="Tech">Tech</option>
                          <option value="Dining">Dining</option>
                          <option value="Beauty">Beauty</option>
                          <option value="Wellness">Wellness</option>
                          <option value="Travel">Travel</option>
                          <option value="Home">Home</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Campaign Status</label>
                        <select
                          value={editingCoupon.status || 'active'}
                          onChange={e => setEditingCoupon({ ...editingCoupon, status: e.target.value as any })}
                          className="w-full text-xs px-3 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg font-bold"
                        >
                          <option value="active">Active (Verified & Live)</option>
                          <option value="pending">Pending (Awaiting Verification)</option>
                          <option value="rejected">Rejected (Declined Listing)</option>
                          <option value="expired">Expired (Ended Campaign)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Description / Conditions Outline</label>
                        <textarea
                          rows={3}
                          value={editingCoupon.description}
                          onChange={e => setEditingCoupon({ ...editingCoupon, description: e.target.value })}
                          className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-3 justify-end pt-2 border-t border-zinc-100">
                        <button
                          type="button"
                          onClick={() => setEditingCoupon(null)}
                          className="px-4 py-2 border border-zinc-200 hover:bg-zinc-55 text-zinc-600 text-xs font-bold rounded-xl cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                        >
                          <Save className="w-4 h-4" />
                          <span>Save Alteration</span>
                        </button>
                      </div>
                    </form>
                  )}

                </div>
              </div>
            )}


            {/* Tab Page: Bookmarks (Standard Users & Partners) */}
            {activeTab === 'bookmarks' && (
              <div className="space-y-4">
                {savedCoupons.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {savedCoupons.map(coupon => (
                      <CouponCard
                        key={coupon.id}
                        coupon={coupon}
                        isBookmarked={bookmarkedIds.includes(coupon.id)}
                        onToggleBookmark={onToggleBookmark}
                        onGetCoupon={onGetCoupon}
                        hideVerifiedBadge={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="py-16 text-center bg-white rounded-3xl border border-zinc-200/80 max-w-lg mx-auto w-full px-6 space-y-4">
                    <div className="w-12 h-12 bg-zinc-50 text-zinc-400 border border-zinc-205 rounded-full flex items-center justify-center mx-auto">
                      <Bookmark className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-zinc-800">Your shopping list is empty</div>
                    <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-normal">
                      All codes you save by clicking the bookmark banner on any card will synchronize automatically into this folder.
                    </p>
                  </div>
                )}
              </div>
            )}



          </div>
        </div>
      ) : (
        /* ==================== SCREEN: LOGGED OUT PROMPT PANEL ==================== */
        <div className="max-w-md mx-auto py-6" id="custom-login-portal">
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden font-sans">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-650" />

            {/* Title Block */}
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-display font-black text-zinc-900 tracking-tight">
                Welcome to Coupon Finder
              </h1>
              <p className="text-xs text-zinc-500 leading-normal">
                Access your personalized savings portfolio and dashboard
              </p>
            </div>

            {/* 1. SELECTION OPTION: USER vs PARTNER */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider">
                Select Platform Account Role
              </label>
              <div className="flex bg-zinc-100 p-1 rounded-2xl border border-zinc-200/50">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('user');
                    setLoginError('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedRole === 'user'
                      ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/20'
                      : 'text-zinc-500 hover:text-zinc-855'
                    }`}
                  id="role-user-selector"
                >
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Standard Shopper</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedRole('partner');
                    setLoginError('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedRole === 'partner'
                      ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/20'
                      : 'text-zinc-500 hover:text-zinc-855'
                    }`}
                  id="role-partner-selector"
                >
                  <Building className="w-3.5 h-3.5 text-zinc-900" />
                  <span>Brand Partner</span>
                </button>
              </div>
              <p className="text-[10px] text-zinc-400 leading-normal italic text-center pt-0.5 font-medium">
                {selectedRole === 'user'
                  ? 'Access saving coupons, locate nearby outlets, and bookmark vouchers.'
                  : 'Manage brand listings, edit discount campaigns, and view analytical performance.'}
              </p>
            </div>

            {/* 2. EMAIL & PASSWORD LOGIN SECTION */}
            <form onSubmit={handleEmailPasswordSubmit} className="space-y-3.5 pt-1">
              <div className="space-y-1">
                <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                  {isRegistering ? 'Create New Account' : 'Credentials Sign In'}
                </h3>
                <div className="h-0.5 bg-zinc-50 w-full" />
              </div>

              {loginError && (
                <div className="flex items-start gap-2 p-2.5 bg-rose-50 text-rose-800 rounded-xl text-[11px] font-medium border border-rose-100">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{loginError}</span>
                </div>
              )}

              {isRegistering && (
                <div>
                  <label className="block text-[10px] font-bold text-zinc-550 font-mono uppercase tracking-wider mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Thomas J"
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 focus:outline-none rounded-xl"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-zinc-550 font-mono uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. user@couponfinder.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 focus:outline-none rounded-xl"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-550 font-mono uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 focus:outline-none rounded-xl"
                />
              </div>

              {/* Action Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs rounded-xl cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5"
                id="credentials-submit-btn"
              >
                <span>{isRegistering ? 'Complete Registration' : `Log In as ${selectedRole === 'partner' ? 'Partner' : 'Shopper'}`}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* 3. CREATE ACCOUNT TOGGLE BUTTON */}
              {selectedRole !== 'partner' && (
                <div className="text-center pt-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsRegistering(!isRegistering);
                      setLoginError('');
                    }}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 transition cursor-pointer underline decoration-dotted underline-offset-4"
                    id="create-account-toggle"
                  >
                    {isRegistering
                      ? 'Already have an account? Sign In credentials'
                      : "Don't have an account? Create Account"}
                  </button>
                </div>
              )}
            </form>

            {/* Divider & Google Login (Hidden for Partners) */}
            {selectedRole !== 'partner' && (
              <>
                <div className="relative flex items-center justify-center py-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-200/60" />
                  </div>
                  <span className="relative px-3 bg-white text-[10px] font-bold text-zinc-400 uppercase tracking-widest font-mono">
                    or use third-party OAuth
                  </span>
                </div>

                {/* 4. GOOGLE AUTHENTICATION BUTTON */}
                <div className="text-center">
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="button"
                    onClick={() => {
                      setAuthStep('select');
                      setShowGoogleModal(true);
                    }}
                    className="w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 bg-white hover:bg-zinc-50 text-zinc-700 font-bold text-xs rounded-xl border border-zinc-200/80 shadow-3xs transition-all cursor-pointer"
                    id="google-authenticate-trigger"
                  >
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22c-.62-.63-1.07-1.37-1.21-2.63z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    <span>Login by Google</span>
                  </motion.button>
                </div>
              </>
            )}

          </div>
        </div>
      )}

      {/* ==================== GOOGLE OAUTH SIMULATOR MODAL POPUP ==================== */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (authStep !== 'loading') setShowGoogleModal(false);
              }}
              className="fixed inset-0 bg-zinc-900/50 backdrop-blur-xs"
            />

            {/* Google OAuth Dialogue Card */}
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.94 }}
              className="relative bg-white border border-zinc-200/80 w-full max-w-md rounded-2xl shadow-2xl p-6 sm:p-8 overflow-hidden font-sans z-10"
              id="google-oauth-window"
            >

              {/* Top Google Branding Header */}
              <div className="text-center space-y-4">
                <div className="flex justify-center items-center gap-1 mb-2">
                  <span className="text-blue-500 font-black text-xl font-sans leading-none tracking-tight">G</span>
                  <span className="text-red-500 font-black text-xl font-sans leading-none tracking-tight">o</span>
                  <span className="text-yellow-500 font-black text-xl font-sans leading-none tracking-tight">o</span>
                  <span className="text-blue-500 font-black text-xl font-sans leading-none tracking-tight">g</span>
                  <span className="text-green-500 font-black text-xl font-sans leading-none tracking-tight">l</span>
                  <span className="text-red-500 font-black text-xl font-sans leading-none tracking-tight">e</span>
                </div>

                {authStep === 'select' && (
                  <>
                    <h2 className="text-[20px] font-medium text-zinc-900 font-display">Sign in with Google</h2>
                    <p className="text-xs text-zinc-500">to continue to dynamic dashboard and partnership workspace</p>
                  </>
                )}
                {authStep === 'custom' && (
                  <>
                    <h2 className="text-[20px] font-medium text-zinc-900 font-display">Enter Custom Credentials</h2>
                    <p className="text-xs text-zinc-500">Simulate standard registry manually</p>
                  </>
                )}
                {authStep === 'role-select' && (
                  <>
                    <h2 className="text-[20px] font-medium text-zinc-900 font-display">Select Platform Role *</h2>
                    <p className="text-xs text-emerald-600 font-bold">Choose how you will orient with Coupon Finder</p>
                  </>
                )}
                {authStep === 'loading' && (
                  <h2 className="text-[20px] font-medium text-zinc-900">Custom Handshake Active...</h2>
                )}
                {authStep === 'done' && (
                  <h2 className="text-[20px] font-medium text-zinc-900 animate-pulse text-emerald-600">Successfully Logged In!</h2>
                )}
              </div>

              {/* Step A: Select Google Suggestion Account List */}
              {authStep === 'select' && (
                <div className="space-y-2.5 mt-6">
                  {suggestedGoogleAccounts.map(acc => (
                    <button
                      key={acc.email}
                      type="button"
                      onClick={() => handleSelectSuggestedAccount(acc)}
                      className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-left cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full ${acc.avatarBg} text-white flex items-center justify-center font-bold text-xs`}>
                          {acc.letters}
                        </div>
                        <div>
                          <div className="text-xs font-bold text-zinc-800">{acc.name}</div>
                          <div className="text-[10px] text-zinc-500">{acc.email}</div>
                        </div>
                      </div>
                      <span className="w-1.5 h-1.5 rounded-full bg-transparent group-hover:bg-emerald-500 transition-colors" />
                    </button>
                  ))}

                  <button
                    onClick={() => setAuthStep('custom')}
                    className="w-full text-center py-2.5 px-4 text-xs font-semibold text-emerald-605 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition cursor-pointer mt-2"
                  >
                    Use custom email registry
                  </button>

                  <div className="text-center pt-4">
                    <button
                      onClick={() => setShowGoogleModal(false)}
                      className="text-xs text-zinc-400 hover:text-zinc-650"
                    >
                      Cancel Setup
                    </button>
                  </div>
                </div>
              )}

              {/* Step B: Manual Google Account Register Simulation */}
              {authStep === 'custom' && (
                <form onSubmit={handleCustomSubmit} className="space-y-4 mt-6">
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Thomas J"
                      value={customName}
                      onChange={e => setCustomName(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. thomas.j@gmail.com"
                      value={customEmail}
                      onChange={e => setCustomEmail(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg focus:outline-none"
                    />
                  </div>

                  <div className="flex gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthStep('select')}
                      className="w-1/2 text-center py-2.5 border border-zinc-200 hover:bg-zinc-50 text-xs font-semibold text-zinc-655 rounded-xl cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 text-center py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                    >
                      Configure Role
                    </button>
                  </div>
                </form>
              )}

              {/* Task 3 Requirement: Role selector option between Shopper and partner */}
              {authStep === 'role-select' && (
                <div className="space-y-4 mt-6">
                  <div className="grid grid-cols-1 gap-3">

                    {/* Role Choice: Shopper / Standard User */}
                    <button
                      type="button"
                      onClick={() => handleCompleteSetupWithRole('user')}
                      className="w-full text-left p-4 rounded-2xl border border-zinc-200/80 hover:border-emerald-500 hover:bg-emerald-50/10 transition-all cursor-pointer group flex items-start gap-3.5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        <ShoppingBag className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-zinc-800 group-hover:text-emerald-700">Platform Shopper / User</div>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                          Browse regional active promo coupons, bookmark brands, locate local outlets maps, and accumulate savings.
                        </p>
                      </div>
                    </button>

                    {/* Role Choice: Brand Partner / Merchant */}
                    <button
                      type="button"
                      onClick={() => handleCompleteSetupWithRole('partner')}
                      className="w-full text-left p-4 rounded-2xl border border-zinc-200/80 hover:border-zinc-900 hover:bg-zinc-50 transition-all cursor-pointer group flex items-start gap-3.5"
                    >
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shrink-0">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-zinc-800 group-hover:text-zinc-900">Brand Merchant / Partner</div>
                        <p className="text-[10px] text-zinc-400 mt-1 leading-normal">
                          Launch brand discount campaigns, register retail locations, and edit or delete active promo folders dynamically.
                        </p>
                      </div>
                    </button>

                  </div>

                  <div className="flex gap-2 justify-center pt-2">
                    <button
                      type="button"
                      onClick={() => setAuthStep('select')}
                      className="text-xs text-zinc-400 hover:text-zinc-600 underline"
                    >
                      Back to account selection
                    </button>
                  </div>
                </div>
              )}

              {/* Step C: Authenticating Loading Indicator */}
              {authStep === 'loading' && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 mt-4">
                  <div className="w-10 h-10 border-4 border-zinc-100 border-t-emerald-600 rounded-full animate-spin" />
                  <p className="text-[11px] text-zinc-400 font-mono">Securing cryptographic handshake keys...</p>
                </div>
              )}

              {/* Step D: Done handshake approval */}
              {authStep === 'done' && (
                <div className="py-12 flex flex-col items-center justify-center space-y-4 mt-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 animate-bounce">
                    <Check className="w-6 h-6" />
                  </div>
                  <p className="text-xs text-zinc-600 font-bold">handshake approved successfully!</p>
                </div>
              )}

              {/* Google Terms Footer */}
              <div className="border-t border-zinc-100 pt-4 mt-6 text-[10px] text-zinc-400 leading-normal">
                To continue, Google will share your name, email address, profile picture and preferences with Coupon Finder. See Coupon Finder's <a href="#" onClick={e => e.preventDefault()} className="text-blue-500 hover:underline">Privacy Policy</a>.
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== CREATE VOUCHER / OFFER CAMPAIGN MODAL (Task 1 & Task 3) ==================== */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateModal(false)}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-zinc-200 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh] font-sans z-10"
              id="create-offer-modal"
            >
              <div className="flex justify-between items-center pb-4 border-b border-zinc-100 mb-6">
                <div>
                  <h3 className="font-display font-bold text-xl text-zinc-900">Create New Discount Offer</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-650 bg-zinc-50 hover:bg-zinc-100 rounded-full transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handlePartnerAddSubmit} className="space-y-6">
                {/* Field A: Shop Type (Offline or Online) */}
                <div className="border-b border-zinc-100 pb-5">
                  <label className="block text-[11px] font-bold text-zinc-550 font-mono uppercase tracking-wider mb-2">Shop Type *</label>
                  <div className="flex bg-zinc-100 p-1 rounded-2xl border border-zinc-200/50 max-w-xs">
                    <button
                      type="button"
                      onClick={() => setShopType('online')}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${shopType === 'online'
                          ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/20'
                          : 'text-zinc-500 hover:text-zinc-800'
                        }`}
                      id="shop-type-online-btn"
                    >
                      Online
                    </button>
                    <button
                      type="button"
                      onClick={() => setShopType('offline')}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer text-center ${shopType === 'offline'
                          ? 'bg-white text-zinc-900 shadow-xs border border-zinc-200/20'
                          : 'text-zinc-550 hover:text-zinc-800'
                        }`}
                      id="shop-type-offline-btn"
                    >
                      Offline
                    </button>
                  </div>
                </div>

                {/* Remaining fields stacked vertically in the exact order requested */}
                <div className="grid grid-cols-1 gap-5">
                  {/* Field B: Discount Value */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-550 font-mono uppercase tracking-wider mb-1">Discount Value * (e.g. 20% OFF)</label>
                    <input
                      type="text"
                      required
                      value={partnerDiscountVal}
                      onChange={e => setPartnerDiscountVal(e.target.value)}
                      placeholder="e.g. 35% OFF or Flat $15 Reward"
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-xl focus:outline-none placeholder:text-zinc-400"
                    />
                  </div>

                  {/* Field C: Expiry date — dd/mm/yy display with native calendar */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-550 font-mono uppercase tracking-wider mb-1">Expiration Date *</label>
                    <div
                      className="relative cursor-pointer"
                      onClick={() => { try { partnerExpiryRef.current?.showPicker(); } catch {} }}
                    >
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      </span>
                      {/* Text display showing dd/mm/yy */}
                      <div className="w-full text-xs pl-9 pr-3.5 py-2.5 bg-white border border-zinc-200 rounded-xl select-none">
                        {partnerExpiry
                          ? (() => { const [y,m,d] = partnerExpiry.split('-'); return `${d}/${m}/${y.slice(2)}`; })()
                          : <span className="text-zinc-400">DD/MM/YY</span>
                        }
                      </div>
                      {/* Real date input — visually hidden but functional */}
                      <input
                        ref={partnerExpiryRef}
                        type="date"
                        value={partnerExpiry}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setPartnerExpiry(e.target.value)}
                        className="sr-only"
                        tabIndex={-1}
                      />
                    </div>
                  </div>

                  {/* Field D: Enter Promo Code (Optional) */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-550 font-mono uppercase tracking-wider mb-1">Voucher Promo Code (Optional)</label>
                    <input
                      type="text"
                      value={partnerPromoCode}
                      onChange={e => setPartnerPromoCode(e.target.value)}
                      placeholder="e.g. NIKEWELLNESS"
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-xl focus:outline-none placeholder:text-zinc-400"
                    />
                  </div>

                  {/* Field E: Website or specific Product Link (Online) OR Shop address (Offline) */}
                  {shopType === 'online' ? (
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-550 font-mono uppercase tracking-wider mb-1">Website or specific Product Link</label>
                      <input
                        type="text"
                        value={partnerWebsite}
                        onChange={e => setPartnerWebsite(e.target.value)}
                        placeholder="https://yourbrand.com/deals"
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-xl focus:outline-none placeholder:text-zinc-400"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-550 font-mono uppercase tracking-wider mb-1">Shop address *</label>
                      <input
                        type="text"
                        required
                        value={partnerShopAddress}
                        onChange={e => setPartnerShopAddress(e.target.value)}
                        placeholder="e.g. 123 Retail St, Suite A, City"
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-xl focus:outline-none placeholder:text-zinc-400"
                      />
                    </div>
                  )}

                  {/* Field G: Category (dynamic — driven by Admin Category Manager) */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-550 font-mono uppercase tracking-wider mb-1">Primary Category</label>
                    <select
                      value={partnerCategory}
                      onChange={e => setPartnerCategory(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-xl focus:outline-none"
                    >
                      {activeCategories.length > 0 ? (
                        activeCategories.map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))
                      ) : (
                        <option value="" disabled>No categories available</option>
                      )}
                    </select>
                  </div>

                  {/* Field H: Product Name or Product Tag (Online) */}
                  {shopType === 'online' && (
                    <div>
                      <label className="block text-[11px] font-bold text-zinc-550 font-mono uppercase tracking-wider mb-1">Product Name or Product Tag *</label>
                      <input
                        type="text"
                        required
                        value={partnerProdType}
                        onChange={e => setPartnerProdType(e.target.value)}
                        placeholder="e.g. Running Shoes & Training Gear"
                        className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-xl focus:outline-none placeholder:text-zinc-400"
                      />
                    </div>
                  )}

                  {/* Field I: Description */}
                  <div>
                    <label className="block text-[11px] font-bold text-zinc-550 font-mono uppercase tracking-wider mb-1">Description / Conditions Outline</label>
                    <textarea
                      rows={3}
                      required
                      value={partnerDesc}
                      onChange={e => setPartnerDesc(e.target.value)}
                      placeholder="Provide details about the coupon criteria and redemption mechanics."
                      className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-xl focus:outline-none placeholder:text-zinc-400"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4.5 py-2.5 border border-zinc-200 hover:bg-zinc-50 text-zinc-700 text-xs font-bold rounded-xl cursor-pointer transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5 transition"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Submit</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==================== VIEW OFFER DETAILS MODAL POPUP (Task 3) ==================== */}
      <AnimatePresence>
        {viewingCouponDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingCouponDetails(null)}
              className="fixed inset-0 bg-zinc-950/60 backdrop-blur-xs"
            />

            {/* Modal Dialog Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-zinc-200 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh] font-sans z-10 space-y-6"
              id="view-details-modal"
            >
              {/* Modal Title Bar */}
              <div className="flex justify-between items-start pb-4 border-b border-zinc-100">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase">COUPON INFORMATION INSIGHT</span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="font-display font-medium text-xl text-zinc-900 leading-tight">
                      {viewingCouponDetails.brandName}
                    </h3>
                    <span className="text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-705 px-2 py-0.5 rounded border border-emerald-100">
                      {viewingCouponDetails.category}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingCouponDetails(null)}
                  className="p-1.5 text-zinc-450 hover:text-zinc-650 bg-zinc-50 hover:bg-zinc-100 rounded-full transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Core Offer Statistics Block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50/70 p-4.5 rounded-2xl border border-zinc-150">
                <div className="space-y-1">
                  <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider font-mono">DISCOUNT INTENSITY</span>
                  <div className="text-xl font-display font-black text-emerald-600 leading-none">
                    {viewingCouponDetails.discountValue}
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">({viewingCouponDetails.productType})</p>
                </div>

                <div className="space-y-1 sm:border-l sm:border-zinc-200 sm:pl-4.5">
                  <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider font-mono">TIME ALLOCATION</span>
                  <div className="text-sm font-bold text-zinc-800 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>{viewingCouponDetails.expiryDate}</span>
                  </div>
                  <span className="inline-block text-[10px] font-mono font-bold uppercase rounded text-zinc-500 bg-zinc-200/50 px-1.5 py-0.5 mt-1">
                    Status: {viewingCouponDetails.status || 'active'}
                  </span>
                </div>
              </div>

              {/* Promo Code Copyable Field Area */}
              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider">Promotional Deal Code</span>
                {viewingCouponDetails.couponCode ? (
                  <div className="flex items-center gap-2 bg-emerald-50/30 border border-dashed border-emerald-300 rounded-xl p-3 justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono font-black text-emerald-800 tracking-wider text-sm select-all">
                        {viewingCouponDetails.couponCode}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (viewingCouponDetails.couponCode) {
                          navigator.clipboard.writeText(viewingCouponDetails.couponCode);
                          alert('Voucher promo code copied to clipboard!');
                        }
                      }}
                      className="px-3 py-1 bg-emerald-700 hover:bg-emerald-850 text-white text-[10px] font-black uppercase rounded-lg cursor-pointer transition shrink-0"
                    >
                      Copy
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic bg-zinc-50 p-3 rounded-xl border border-zinc-150">
                    No promo code needed. Flat deal applied automatically on checkout redirection.
                  </p>
                )}
              </div>

              {/* Conditions Description text-area */}
              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider">Campaign Conditions & Details</span>
                <p className="text-xs text-zinc-650 leading-relaxed bg-white border border-zinc-150 rounded-xl p-4 font-sans whitespace-pre-wrap">
                  {viewingCouponDetails.description}
                </p>
              </div>

              {/* Conditional Shop Type Section */}
              {(() => {
                const isOffline = viewingCouponDetails.locations && 
                                  viewingCouponDetails.locations.length > 0 && 
                                  viewingCouponDetails.locations[0].distance !== 'Virtual' && 
                                  viewingCouponDetails.locations[0].address !== 'Digital Redirection / Online Store';

                return isOffline ? (
                  /* Shop address Section (Offline) */
                  <div className="space-y-3 pt-3 border-t border-zinc-100">
                    <span className="block text-[11px] font-mono font-extrabold text-zinc-400 uppercase tracking-wider">Shop address</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      {viewingCouponDetails.locations.map((loc: StoreLocation) => (
                        <div key={loc.id} className="p-3 bg-zinc-50/50 border border-zinc-200 rounded-2xl flex flex-col justify-between">
                          <div className="space-y-1.5">
                            <h5 className="text-xs font-bold text-zinc-800">{loc.name}</h5>
                            <p className="text-[11px] text-zinc-500 flex items-start gap-1">
                              <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0 mt-0.5" />
                              <span>{loc.address}</span>
                            </p>
                          </div>
                          <div className="flex justify-between items-center pt-2 mt-2 border-t border-zinc-100 text-[10px] text-zinc-400">
                            {loc.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-zinc-400" />
                                <span>{loc.phone}</span>
                              </span>
                            )}
                            {loc.hours && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-zinc-400" />
                                <span>{loc.hours}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Website or specific Product Link Section (Online) */
                  <div className="space-y-3 pt-3 border-t border-zinc-100">
                    <span className="block text-[11px] font-mono font-extrabold text-zinc-400 uppercase tracking-wider">Website or specific Product Link</span>
                    <div className="flex items-center gap-2.5 bg-zinc-50/50 border border-zinc-200 rounded-2xl p-4">
                      <Globe className="w-4 h-4 text-zinc-455" />
                      <a
                        href={viewingCouponDetails.websiteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold underline break-all font-sans"
                      >
                        {viewingCouponDetails.websiteUrl}
                      </a>
                    </div>
                  </div>
                );
              })()}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setViewingCouponDetails(null)}
                  className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-xs"
                >
                  Dismiss Details
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
