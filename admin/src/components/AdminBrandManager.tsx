import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trash2, Eye, ArrowLeft, Globe, HelpCircle, X, Tag, 
  MapPin, Phone, Clock,
  Save, Edit3, Mail, CheckCircle,
  XCircle, Send, Inbox, Loader2,
  Store
} from 'lucide-react';
import { Brand, Coupon, PartnerApplication } from '../types';
import { brandService, couponService, partnerApplicationService } from '../services/firestoreService';
import { sendPasswordResetEmail, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../config/firebase';

type AdminTab = 'brands' | 'applications';

interface AdminBrandManagerProps {
  initialTab?: AdminTab;
}

export default function AdminBrandManager({ initialTab = 'brands' }: AdminBrandManagerProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>(initialTab);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // -- Brands state --
  const [brands, setBrands] = useState<Brand[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(false);
  const [viewingCouponDetails, setViewingCouponDetails] = useState<Coupon | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  // -- Partner Applications state --
  const [applications, setApplications] = useState<PartnerApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [sendingEmail, setSendingEmail] = useState<string | null>(null);
  const [emailSentIds, setEmailSentIds] = useState<string[]>([]);
  const [emailErrorIds, setEmailErrorIds] = useState<{[id: string]: string}>({});
  const [appActionLoading, setAppActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{msg: string; type: 'success'|'error'} | null>(null);
  const [confirmSendId, setConfirmSendId] = useState<string | null>(null);

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 5000);
  };

  useEffect(() => {
    setLoading(true);
    
    const unsubscribeBrands = brandService.listenToBrands(
      (brandsData) => {
        setBrands(brandsData);
        setLoading(false);
      },
      (error) => {
        console.error('Error listening to brands:', error);
        setLoading(false);
      }
    );

    const unsubscribeCoupons = couponService.listenToCoupons(
      (couponsData) => {
        setCoupons(couponsData);
      },
      (error) => {
        console.error('Error listening to coupons:', error);
      }
    );

    return () => {
      unsubscribeBrands();
      unsubscribeCoupons();
    };
  }, []);

  // Load partner applications when tab is opened
  useEffect(() => {
    setAppsLoading(true);
    const unsub = partnerApplicationService.listenToApplications(
      (apps) => {
        setApplications(apps);
        setAppsLoading(false);
      },
      (err) => {
        console.error('Error listening to applications:', err);
        setAppsLoading(false);
      }
    );
    return () => unsub();
  }, []);

  const handleDeleteBrand = async (id: string) => {
    if (confirm('Are you sure you want to delete this brand?')) {
      setLoading(true);
      try {
        await brandService.deleteBrand(id);
        if (selectedBrand?.id === id) {
          setSelectedBrand(null);
        }
      } catch (error) {
        console.error('Error deleting brand:', error);
        alert('Failed to delete brand');
      }
      setLoading(false);
    }
  };

  const handlePartnerStatusChange = async (
    brand: Brand,
    newStatus: 'active' | 'pending' | 'suspended' | 'rejected'
  ) => {
    try {
      await brandService.updateBrand(brand.id, { ...brand, partnerStatus: newStatus });
    } catch (error) {
      console.error('Error updating partner status:', error);
      alert('Failed to update partner status');
    }
  };

  const handleEditSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCoupon) return;

    setLoading(true);
    try {
      await couponService.updateCoupon(editingCoupon.id, editingCoupon);
      setEditingCoupon(null);
    } catch (error) {
      console.error('Error saving coupon edit:', error);
      alert('Failed to save coupon edit');
    }
    setLoading(false);
  };

  const handleToggleCouponStatus = async (c: Coupon) => {
    setLoading(true);
    try {
      const isActive = !c.status || c.status === 'active';
      const nextStatus = isActive ? 'expired' : 'active';
      await couponService.updateCoupon(c.id, { ...c, status: nextStatus });
    } catch (error) {
      console.error('Error toggling status:', error);
      alert('Failed to toggle status');
    }
    setLoading(false);
  };

  const handleDeleteCoupon = async (id: string, brandName: string) => {
    if (confirm(`Are you sure you want to delete the active discount for ${brandName}?`)) {
      setLoading(true);
      try {
        await couponService.deleteCoupon(id);
      } catch (error) {
        console.error('Error deleting coupon:', error);
        alert('Failed to delete coupon');
      }
      setLoading(false);
    }
  };

  // Partner Application handlers
  const handleApproveApplication = async (app: PartnerApplication) => {
    setAppActionLoading(app.id);
    try {
      await partnerApplicationService.updateApplication(app.id, {
        status: 'approved',
        approvedAt: new Date(),
      });
    } catch (err) {
      console.error('Error approving application:', err);
      alert('Failed to approve application.');
    } finally {
      setAppActionLoading(null);
    }
  };

  const handleRejectApplication = async (app: PartnerApplication) => {
    setAppActionLoading(app.id);
    try {
      await partnerApplicationService.updateApplication(app.id, { status: 'rejected' });
      showToast(`${app.companyName} application rejected.`, 'error');
    } catch (err) {
      console.error('Error rejecting application:', err);
      showToast('Failed to reject application.', 'error');
    } finally {
      setAppActionLoading(null);
    }
  };

  const handleDeleteApplication = async (id: string) => {
    try {
      await partnerApplicationService.deleteApplication(id);
      showToast('Application deleted.', 'error');
    } catch (err) {
      console.error('Error deleting application:', err);
      showToast('Failed to delete application.', 'error');
    }
  };

  const handleSendPasswordEmail = async (app: PartnerApplication) => {
    setConfirmSendId(null);
    setSendingEmail(app.id);
    setEmailErrorIds(prev => { const n = {...prev}; delete n[app.id]; return n; });

    // ── DEMO MODE: no real Firebase credentials configured ──
    if (!isFirebaseConfigured) {
      await new Promise(r => setTimeout(r, 900));
      await partnerApplicationService.updateApplication(app.id, {
        passwordEmailSent: true,
        passwordEmailSentAt: new Date(),
      } as any);
      setEmailSentIds(prev => [...prev, app.id]);
      showToast(`✅ [Demo Mode] Password setup email would be sent to ${app.email}`);
      setSendingEmail(null);
      return;
    }

    try {
      // 1. Create Firebase Auth account (temp password), or skip if already exists
      const tempPassword = Math.random().toString(36).slice(2, 14) + 'Aa1!';
      try {
        const cred = await createUserWithEmailAndPassword(auth, app.email, tempPassword);
        // Sign out the newly created user so admin stays logged in
        await signOut(auth);
        console.log('Partner account created:', cred.user.uid);
      } catch (authErr: any) {
        // 'auth/email-already-in-use' means account exists — that's fine, continue
        if (authErr.code !== 'auth/email-already-in-use') {
          throw authErr;
        }
        console.log('Partner account already exists, sending reset email anyway.');
      }

      // 2. Send Firebase password reset email with continueUrl so the link
      //    redirects to our custom ResetPasswordView (New + Confirm Password fields)
      //    instead of Firebase's default single-field page.
      const isLocalAdmin = window.location.hostname === 'localhost';
      // Main app is on :3000 in dev; admin is on a different port.
      // In production, the main app is at the same origin without any port override.
      const appOrigin = isLocalAdmin
        ? 'http://localhost:3000'
        : window.location.origin;
      await sendPasswordResetEmail(auth, app.email, {
        url: appOrigin,
        handleCodeInApp: false,
      });

      // 3. Mark as sent in Firestore
      await partnerApplicationService.updateApplication(app.id, {
        passwordEmailSent: true,
        passwordEmailSentAt: new Date(),
      } as any);

      // 4. Update local state
      setEmailSentIds((prev) => [...prev, app.id]);
      showToast(`✅ Password setup email sent to ${app.email}!`);
    } catch (err: any) {
      console.error('Error sending setup email:', err);
      const errMsg = err.message || 'Unknown error';
      setEmailErrorIds(prev => ({ ...prev, [app.id]: errMsg }));
      showToast(`❌ Failed: ${errMsg}`, 'error');
    } finally {
      setSendingEmail(null);
    }
  };

  const pendingCount = applications.filter(a => a.status === 'pending').length;

  return (
    <div className="relative">
      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-4 right-4 z-[100] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-xl text-sm font-bold max-w-sm ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : 'bg-rose-600 text-white'
            }`}
          >
            <span>{toast.msg}</span>
            <button onClick={() => setToast(null)} className="ml-2 opacity-70 hover:opacity-100 cursor-pointer text-white">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
      {loading && <div className="p-4 text-center text-blue-600">Loading Brand Manager...</div>}

      {/* ── TAB HEADER ── */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-0">
        <button
          onClick={() => { setSelectedBrand(null); setActiveTab('brands'); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'brands'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Store className="w-4 h-4" />
          Brands
          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-gray-100 text-gray-600 rounded-full">{brands.length}</span>
        </button>
        <button
          onClick={() => { setSelectedBrand(null); setActiveTab('applications'); }}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-colors cursor-pointer relative ${
            activeTab === 'applications'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Inbox className="w-4 h-4" />
          Partner Applications
          {pendingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 text-[10px] font-mono font-bold bg-amber-100 text-amber-700 rounded-full animate-pulse">
              {pendingCount} new
            </span>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════
          TAB 1: BRANDS
      ═══════════════════════════════════════════ */}
      {activeTab === 'brands' && (
        <>
          {selectedBrand === null ? (
            /* BRAND LIST TABLE VIEW */
            <div>
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Brand Manager</h1>
              </div>

              <div className="bg-white rounded-lg shadow-lg overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700 w-16">Logo</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Brand Name</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Partner Status</th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {brands.map((brand) => (
                      <tr key={brand.id} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="px-6 py-4">
                          {brand.logo ? (
                            <img
                              src={brand.logo}
                              alt={brand.name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200 shadow-sm"
                              onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=' + brand.name.slice(0,2); }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm uppercase shadow-inner">
                              {brand.name.slice(0, 2)}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-800">{brand.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-600 font-mono">
                          {brand.email || <span className="text-gray-400 italic text-xs">No email</span>}
                        </td>

                        {/* Partner Status inline dropdown */}
                        <td className="px-6 py-4">
                          <select
                            value={brand.partnerStatus || 'pending'}
                            onChange={e => handlePartnerStatusChange(brand, e.target.value as any)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                              brand.partnerStatus === 'active'
                                ? 'text-emerald-700 bg-emerald-50 focus:ring-emerald-300'
                                : brand.partnerStatus === 'suspended'
                                  ? 'text-red-700 bg-red-50 focus:ring-red-300'
                                  : brand.partnerStatus === 'rejected'
                                    ? 'text-rose-700 bg-rose-50 focus:ring-rose-300'
                                    : 'text-amber-700 bg-amber-50 focus:ring-amber-300'
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="suspended">Suspended</option>
                            <option value="rejected">Rejected</option>
                          </select>
                        </td>

                        <td className="px-6 py-4 text-center space-x-2">
                          <button
                            onClick={() => setSelectedBrand(brand)}
                            disabled={loading}
                            className="text-blue-600 hover:text-blue-800 disabled:opacity-50 inline-flex items-center justify-center p-1 cursor-pointer"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleDeleteBrand(brand.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-800 disabled:opacity-50 inline-flex items-center justify-center p-1 cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {brands.length === 0 && !loading && (
                  <div className="p-12 text-center text-gray-500">No brands found.</div>
                )}
              </div>
            </div>
          ) : (
            /* BRAND DETAILS & OFFERS VIEW */
            <div>
              {/* Back Header */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={() => {
                    setSelectedBrand(null);
                    setEditingCoupon(null);
                  }}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-750 font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} />
                  <span>Back to Brands List</span>
                </button>
                <h1 className="text-3xl font-bold text-gray-800">Brand Workspace</h1>
              </div>

              {/* Brand Details Header */}
              <div className="bg-white rounded-2xl shadow border border-gray-200 p-6 mb-8 flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-inner shrink-0 bg-zinc-100 flex items-center justify-center border border-gray-200">
                  {selectedBrand.logo ? (
                    <img
                      src={selectedBrand.logo}
                      alt={selectedBrand.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/100x100?text=' + selectedBrand.name.slice(0,2); }}
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-600 text-white flex items-center justify-center font-display font-black text-2xl uppercase">
                      {selectedBrand.name.slice(0, 1)}
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                    {selectedBrand.name}
                  </h2>
                  {selectedBrand.email ? (
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                      {selectedBrand.email}
                    </p>
                  ) : (
                    <p className="text-xs text-gray-400 italic mt-1">No email on record</p>
                  )}
                </div>

                <div className="ml-auto flex flex-col items-end gap-1 shrink-0">
                  <span className="text-[10px] font-bold font-mono text-gray-400 uppercase tracking-wider">Partner Status</span>
                  <select
                    value={selectedBrand.partnerStatus || 'pending'}
                    onChange={e => handlePartnerStatusChange(selectedBrand, e.target.value as any)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-1 ${
                      selectedBrand.partnerStatus === 'active'
                        ? 'text-emerald-700 bg-emerald-50 focus:ring-emerald-300'
                        : selectedBrand.partnerStatus === 'suspended'
                          ? 'text-red-700 bg-red-50 focus:ring-red-300'
                          : selectedBrand.partnerStatus === 'rejected'
                            ? 'text-rose-700 bg-rose-50 focus:ring-rose-300'
                            : 'text-amber-700 bg-amber-50 focus:ring-amber-300'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="suspended">Suspended</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Offers Table Card */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
                {!editingCoupon ? (
                  <>
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2 font-sans">
                      <span>Active Coupon Offers</span>
                      <span className="px-2.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-mono font-bold rounded-full border border-gray-200">
                        {coupons.filter(c => c.brandName.toLowerCase() === selectedBrand.name.toLowerCase()).length}
                      </span>
                    </h3>

                    {(() => {
                      const brandCoupons = coupons.filter(
                        (c) => c.brandName.toLowerCase() === selectedBrand.name.toLowerCase()
                      );

                      return brandCoupons.length > 0 ? (
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
                              {brandCoupons.map((c) => (
                                <tr key={c.id} className="group hover:bg-zinc-50/40 transition-colors">
                                  <td className="py-4 font-bold text-zinc-900">
                                    <div className="flex items-center gap-2.5">
                                      <div className="w-7 h-7 rounded-md bg-zinc-100 text-zinc-500 flex items-center justify-center font-bold text-[10px] uppercase shadow-3xs shrink-0">
                                        <Tag className="w-3.5 h-3.5" />
                                      </div>
                                      <span className="font-mono text-xs font-semibold text-zinc-700 truncate max-w-[120px] sm:max-w-none">{c.id}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 font-mono font-black text-emerald-600 text-sm">{c.discountValue}</td>
                                  <td className="py-4 text-zinc-650">
                                    <span className="inline-block px-2.5 py-0.5 bg-zinc-50 border border-zinc-200 rounded-full text-[10px] font-bold text-zinc-555">
                                      {c.category}
                                    </span>
                                  </td>
                                  <td className="py-4 text-zinc-500 font-medium whitespace-nowrap">{c.expiryDate}</td>
                                  <td className="py-4 font-mono">
                                    {c.couponCode ? (
                                      <span className="px-2 py-0.5 bg-zinc-100 text-zinc-800 font-bold rounded-md">{c.couponCode}</span>
                                    ) : (
                                      <span className="text-zinc-400 font-sans text-xs font-semibold uppercase">N/A</span>
                                    )}
                                  </td>
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
                                  <td className="py-4 text-right pr-4">
                                    <div className="flex items-center justify-end gap-3.5">
                                      <div className="flex items-center gap-1.5" title={(!c.status || c.status === 'active') ? "Deactivate Offer" : "Activate Offer"}>
                                        <button
                                          type="button"
                                          onClick={() => handleToggleCouponStatus(c)}
                                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${(!c.status || c.status === 'active') ? 'bg-emerald-500' : 'bg-zinc-200'}`}
                                          id={`toggle-status-${c.id}`}
                                        >
                                          <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${(!c.status || c.status === 'active') ? 'translate-x-4' : 'translate-x-0'}`} />
                                        </button>
                                        <span className={`text-[9px] font-bold font-mono w-5 text-left select-none ${(!c.status || c.status === 'active') ? 'text-emerald-600' : 'text-zinc-400'}`}>
                                          {(!c.status || c.status === 'active') ? 'ON' : 'OFF'}
                                        </span>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => setViewingCouponDetails(c)}
                                        className="p-1 px-2.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-600 border border-zinc-200/50 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                                        id={`view-btn-${c.id}`}
                                      >
                                        <Eye className="w-3.5 h-3.5 text-zinc-500" />
                                        <span>View</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setEditingCoupon({ ...c })}
                                        className="p-1 px-2.5 bg-zinc-50 hover:bg-emerald-50 hover:text-emerald-700 text-zinc-650 border border-zinc-200/50 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer"
                                        id={`edit-btn-${c.id}`}
                                      >
                                        <Edit3 className="w-3.5 h-3.5 text-zinc-400" />
                                        <span>Edit</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteCoupon(c.id, c.brandName)}
                                        className="p-1.5 text-zinc-450 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition shrink-0 cursor-pointer"
                                        id={`delete-btn-${c.id}`}
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="py-12 text-center border border-dashed border-zinc-200 rounded-xl bg-zinc-50/50 font-sans">
                          <HelpCircle className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
                          <p className="text-sm font-semibold text-zinc-700">No active campaigns</p>
                          <p className="text-xs text-zinc-400">There are no discount offers running under this brand.</p>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  /* Edit Coupon Form */
                  <form onSubmit={handleEditSave} className="bg-white border border-emerald-250 rounded-3xl p-6 sm:p-8 space-y-6 max-w-3xl mx-auto shadow-md font-sans">
                    <div className="flex justify-between items-center pb-4 border-b border-zinc-100">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-emerald-600 font-bold uppercase">SECURED MANAGEMENT HANDLER</span>
                        <h3 className="font-display font-bold text-xl text-zinc-900">Edit Campaign Vouchers</h3>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditingCoupon(null)}
                        className="p-1.5 text-zinc-400 hover:text-zinc-650 bg-zinc-50 hover:bg-zinc-100 rounded-full cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Brand Name *</label>
                        <input type="text" required value={editingCoupon.brandName} onChange={e => setEditingCoupon({ ...editingCoupon, brandName: e.target.value })} className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Discount Value * (e.g. 20% OFF, $30 OFF)</label>
                        <input type="text" required value={editingCoupon.discountValue} onChange={e => setEditingCoupon({ ...editingCoupon, discountValue: e.target.value })} className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Subtitle / Offer Product *</label>
                        <input type="text" required value={editingCoupon.productType} onChange={e => setEditingCoupon({ ...editingCoupon, productType: e.target.value })} className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Promotional Text-Code (Optional)</label>
                        <input type="text" placeholder="e.g. SUMMERDEAL20" value={editingCoupon.couponCode || ''} onChange={e => setEditingCoupon({ ...editingCoupon, couponCode: e.target.value })} className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Expiration Note *</label>
                        <input type="text" required value={editingCoupon.expiryDate} onChange={e => setEditingCoupon({ ...editingCoupon, expiryDate: e.target.value })} className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg focus:outline-none" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Redirect merchant URL</label>
                        <input type="text" value={editingCoupon.websiteUrl} onChange={e => setEditingCoupon({ ...editingCoupon, websiteUrl: e.target.value })} className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg focus:outline-none" />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Core Category</label>
                      <select value={editingCoupon.category} onChange={e => setEditingCoupon({ ...editingCoupon, category: e.target.value })} className="w-full text-xs px-3 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg">
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
                      <select value={editingCoupon.status || 'active'} onChange={e => setEditingCoupon({ ...editingCoupon, status: e.target.value as any })} className="w-full text-xs px-3 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg font-bold">
                        <option value="active">Active (Verified & Live)</option>
                        <option value="inactive">Inactive (Partner-Paused)</option>
                        <option value="pending">Pending (Awaiting Verification)</option>
                        <option value="rejected">Rejected (Declined Listing)</option>
                        <option value="expired">Expired (Ended Campaign)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider mb-1">Description / Conditions Outline</label>
                      <textarea rows={3} value={editingCoupon.description} onChange={e => setEditingCoupon({ ...editingCoupon, description: e.target.value })} className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 rounded-lg focus:outline-none" />
                    </div>

                    <div className="flex gap-3 justify-end pt-2 border-t border-zinc-100">
                      <button type="button" onClick={() => setEditingCoupon(null)} className="px-4 py-2 border border-zinc-200 hover:bg-zinc-100 text-zinc-650 text-xs font-bold rounded-xl cursor-pointer">Cancel</button>
                      <button type="submit" className="px-5 py-2 bg-emerald-650 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer flex items-center gap-1.5">
                        <Save className="w-4 h-4" />
                        <span>Save Alteration</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════
          TAB 2: PARTNER APPLICATIONS
      ═══════════════════════════════════════════ */}
      {activeTab === 'applications' && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Partner Applications</h1>
              <p className="text-sm text-gray-500 mt-1">Review, approve or reject incoming partner requests</p>
            </div>
            <div className="flex gap-2 text-xs font-mono">
              <span className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold">
                {applications.filter(a => a.status === 'pending').length} pending
              </span>
              <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full font-bold">
                {applications.filter(a => a.status === 'approved').length} approved
              </span>
            </div>
          </div>

          {appsLoading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-gray-200 rounded-2xl bg-gray-50">
              <Inbox className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-base font-semibold text-gray-600">No applications yet</p>
              <p className="text-sm text-gray-400 mt-1">Partner applications will appear here once submitted from the main site.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {applications.map((app) => (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${
                    app.status === 'approved'
                      ? 'border-emerald-200'
                      : app.status === 'rejected'
                        ? 'border-rose-200'
                        : 'border-amber-200'
                  }`}
                >
                  {/* Card Header */}
                  <div className={`px-6 py-3 flex items-center justify-between ${
                    app.status === 'approved'
                      ? 'bg-emerald-50 border-b border-emerald-100'
                      : app.status === 'rejected'
                        ? 'bg-rose-50 border-b border-rose-100'
                        : 'bg-amber-50 border-b border-amber-100'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black text-white uppercase ${
                        app.status === 'approved' ? 'bg-emerald-600' : app.status === 'rejected' ? 'bg-rose-500' : 'bg-amber-500'
                      }`}>
                        {app.companyName.slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{app.companyName}</p>
                        <p className="text-[10px] font-mono text-gray-500">{app.id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 text-[10px] font-black font-mono uppercase rounded-full border ${
                        app.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                          : app.status === 'rejected'
                            ? 'bg-rose-100 text-rose-700 border-rose-200'
                            : 'bg-amber-100 text-amber-700 border-amber-200'
                      }`}>
                        {app.status}
                      </span>
                      <button
                        onClick={() => handleDeleteApplication(app.id)}
                        className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        title="Delete application"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                        <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                          {app.email}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                        <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-gray-400 shrink-0" />
                          {app.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-0.5">Category</p>
                        <span className="inline-block px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-100 rounded-full text-[10px] font-bold">{app.category}</span>
                      </div>
                      <div>
                        <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-0.5">Shop Type</p>
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          app.shopType === 'online' ? 'bg-purple-50 text-purple-700 border-purple-100'
                          : app.shopType === 'offline' ? 'bg-orange-50 text-orange-700 border-orange-100'
                          : 'bg-teal-50 text-teal-700 border-teal-100'
                        }`}>
                          {app.shopType === 'online' ? '🌐 Online' : app.shopType === 'offline' ? '🏪 Physical' : '🔀 Both'}
                        </span>
                      </div>
                      <div className="col-span-2 sm:col-span-3 lg:col-span-2">
                        <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-0.5">Address</p>
                        <p className="text-xs text-gray-600 flex items-start gap-1">
                          <MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" />
                          {app.address}
                        </p>
                      </div>
                      {app.website && (
                        <div className="col-span-2">
                          <p className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-wider mb-0.5">Website</p>
                          <a href={app.website} target="_blank" rel="noreferrer" className="text-xs text-emerald-600 hover:underline flex items-center gap-1">
                            <Globe className="w-3 h-3 shrink-0" />
                            {app.website}
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                      {app.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApproveApplication(app)}
                            disabled={appActionLoading === app.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-60"
                          >
                            {appActionLoading === app.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            Approve
                          </button>
                          <button
                            onClick={() => handleRejectApplication(app)}
                            disabled={appActionLoading === app.id}
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-60"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}

                      {app.status === 'approved' && (
                        <div className="flex flex-col gap-2.5 w-full max-w-lg mt-2">
                          {/* Email sent confirmation state */}
                          {(emailSentIds.includes(app.id) || (app as any).passwordEmailSent) ? (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 font-sans">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-emerald-800">Setup Email Sent</p>
                                  <p className="text-[10px] text-emerald-600 font-mono">{app.email}</p>
                                </div>
                              </div>
                              <button
                                type="button"
                                id={`resend-email-btn-${app.id}`}
                                onClick={() => handleSendPasswordEmail(app)}
                                disabled={sendingEmail === app.id}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-xl transition cursor-pointer bg-white hover:bg-emerald-100 text-emerald-700 border border-emerald-300 disabled:opacity-60 shrink-0"
                              >
                                {sendingEmail === app.id
                                  ? <Loader2 className="w-3 h-3 animate-spin" />
                                  : <Send className="w-3 h-3" />}
                                Resend
                              </button>
                            </div>
                          ) : (
                            /* One-click send button */
                            <button
                              id={`send-password-btn-${app.id}`}
                              onClick={() => handleSendPasswordEmail(app)}
                              disabled={sendingEmail === app.id}
                              className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl transition cursor-pointer bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white disabled:opacity-60 shadow-sm"
                            >
                              {sendingEmail === app.id
                                ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…</>
                                : <><Mail className="w-3.5 h-3.5" /> Send Password Setup Email</>}
                            </button>
                          )}
                          {/* Inline error message */}
                          {emailErrorIds[app.id] && (
                            <p className="text-[10px] text-rose-600 font-mono px-1">
                              ⚠ {emailErrorIds[app.id]}
                            </p>
                          )}
                        </div>
                      )}

                      {app.status === 'rejected' && (
                        <button
                          onClick={() => handleApproveApplication(app)}
                          disabled={appActionLoading === app.id}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 hover:bg-emerald-50 text-gray-600 hover:text-emerald-700 border border-gray-200 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          Re-Approve
                        </button>
                      )}

                      {app.createdAt && (
                        <span className="ml-auto text-[10px] text-gray-400 font-mono">
                          Submitted: {new Date(app.createdAt?.toDate ? app.createdAt.toDate() : app.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW OFFER DETAILS MODAL POPUP */}
      <AnimatePresence>
        {viewingCouponDetails && (
          <div className="fixed inset-0 z-55 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setViewingCouponDetails(null)}
              className="fixed inset-0 bg-zinc-955/60 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white border border-zinc-200 w-full max-w-2xl rounded-3xl shadow-2xl p-6 sm:p-8 overflow-y-auto max-h-[90vh] font-sans z-10 space-y-6"
              id="view-details-modal"
            >
              <div className="flex justify-between items-start pb-4 border-b border-zinc-100">
                <div>
                  <span className="text-[10px] font-mono tracking-widest text-zinc-400 font-extrabold uppercase">COUPON INFORMATION INSIGHT</span>
                  <div className="flex items-center gap-2 mt-1">
                    <h3 className="font-display font-medium text-xl text-zinc-900 leading-tight">{viewingCouponDetails.brandName}</h3>
                    <span className="text-[10px] font-mono font-bold uppercase bg-emerald-50 text-emerald-705 px-2 py-0.5 rounded border border-emerald-100">{viewingCouponDetails.category}</span>
                  </div>
                </div>
                <button type="button" onClick={() => setViewingCouponDetails(null)} className="p-1.5 text-zinc-450 hover:text-zinc-655 bg-zinc-50 hover:bg-zinc-100 rounded-full transition cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50/70 p-4.5 rounded-2xl border border-zinc-150">
                <div className="space-y-1">
                  <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider font-mono">DISCOUNT INTENSITY</span>
                  <div className="text-xl font-display font-black text-emerald-600 leading-none">{viewingCouponDetails.discountValue}</div>
                  <p className="text-xs text-zinc-500 font-medium">({viewingCouponDetails.productType})</p>
                </div>
                <div className="space-y-1 sm:border-l sm:border-zinc-200 sm:pl-4.5">
                  <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider font-mono">TIME ALLOCATION</span>
                  <div className="text-sm font-bold text-zinc-850 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-4 h-4 text-zinc-400" />
                    <span>{viewingCouponDetails.expiryDate}</span>
                  </div>
                  <span className="inline-block text-[10px] font-mono font-bold uppercase rounded text-zinc-500 bg-zinc-200/50 px-1.5 py-0.5 mt-1 font-semibold">
                    Status: {viewingCouponDetails.status || 'active'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider">Promotional Deal Code</span>
                {viewingCouponDetails.couponCode ? (
                  <div className="flex items-center gap-2 bg-emerald-50/30 border border-dashed border-emerald-300 rounded-xl p-3 justify-between">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-mono font-black text-emerald-850 tracking-wider text-sm select-all">{viewingCouponDetails.couponCode}</span>
                    </div>
                    <button type="button" onClick={() => { navigator.clipboard.writeText(viewingCouponDetails.couponCode!); alert('Copied!'); }} className="px-3 py-1 bg-emerald-700 hover:bg-emerald-850 text-white text-[10px] font-black uppercase rounded-lg cursor-pointer transition shrink-0">Copy</button>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500 italic bg-zinc-50 p-3 rounded-xl border border-zinc-150">No promo code needed. Flat deal applied automatically on checkout redirection.</p>
                )}
              </div>

              <div className="space-y-2">
                <span className="block text-[11px] font-bold text-zinc-400 font-mono uppercase tracking-wider">Campaign Conditions & Details</span>
                <p className="text-xs text-zinc-650 leading-relaxed bg-white border border-zinc-150 rounded-xl p-4 font-sans whitespace-pre-wrap">{viewingCouponDetails.description}</p>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-zinc-100">
                <button type="button" onClick={() => setViewingCouponDetails(null)} className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-white text-xs font-bold rounded-xl cursor-pointer transition shadow-xs">
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
