import React, { useState } from 'react';
import { Coupon } from '../types';
import { X, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface SubmitCouponModalProps {
  key?: React.Key;
  onClose: () => void;
  onSubmit: (newCoupon: Coupon) => void | Promise<void>;
}

export default function SubmitCouponModal({
  onClose,
  onSubmit
}: SubmitCouponModalProps) {
  const [brandName, setBrandName] = useState('');
  const [category, setCategory] = useState('Fashion');
  const [discountValue, setDiscountValue] = useState('');
  const [productType, setProductType] = useState('');
  const [expiryPeriod, setExpiryPeriod] = useState('Valid until July 31, 2026');
  const [couponCode, setCouponCode] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [description, setDescription] = useState('');
  const [storeAddress, setStoreAddress] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!brandName.trim()) return setError('Brand Name is required');
    if (!discountValue.trim()) return setError('Discount Value is required (e.g. 20% OFF or $30)');
    if (!productType.trim()) return setError('Product Type is required (e.g. For Jackets & Coats)');
    if (!couponCode.trim()) return setError('Promo Coupon Code is required');

    // Generate a cohesive color bg style mock
    const colors = [
      'bg-indigo-600 text-white',
      'bg-blue-600 text-white',
      'bg-zinc-950 text-white',
      'bg-purple-600 text-white',
      'bg-rose-500 text-white',
      'bg-emerald-600 text-white',
      'bg-amber-600 text-white'
    ];
    const brandLogoBg = colors[Math.floor(Math.random() * colors.length)];

    // Create locations if address provided
    const locations = storeAddress.trim() ? [
      {
        id: `ml-${Date.now()}`,
        name: `${brandName} Shop Local Outpost`,
        address: storeAddress,
        distance: '1.2 miles away',
        phone: '(555) ' + Math.floor(100 + Math.random() * 900) + '-' + Math.floor(1000 + Math.random() * 9000),
        hours: '10:00 AM - 9:00 PM',
        lat: Math.floor(10 + Math.random() * 80),
        lng: Math.floor(10 + Math.random() * 80)
      }
    ] : [];

    const newCoupon: Coupon = {
      id: `usr-${Date.now()}`,
      brandName: brandName.trim(),
      brandLogoBg,
      discountValue: discountValue.trim(),
      discountType: discountValue.includes('%') ? 'percentage' : discountValue.includes('$') ? 'amount' : 'deal',
      productType: productType.trim(),
      expiryDate: expiryPeriod.trim() || 'Valid until Sep 30, 2026',
      couponCode: couponCode.trim().toUpperCase(),
      category: category,
      websiteUrl: websiteUrl.trim() || 'https://www.google.com',
      description: description.trim() || `Verified customer-contributed discount package for ${brandName} goods.`,
      rating: 4.8,
      viewsCount: 1,
      locations,
      userSubmitted: true,
      status: 'pending'
    };

    setSubmitting(true);
    try {
      await onSubmit(newCoupon);
      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (submitError) {
      console.error('Error submitting coupon:', submitError);
      setError('Could not submit coupon. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="submit-coupon-modal">
      {/* Backdrop */}
      <div onClick={onClose} className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs transition" />

      {/* Frame Center */}
      <div className="flex min-h-full items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-lg bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-2xl p-6 sm:p-8"
        >
          {/* Accent decoration */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 bg-zinc-100/50 hover:bg-zinc-100 border border-zinc-200/50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="mx-auto w-14 h-14 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 animate-bounce text-emerald-500" />
              </div>
              <h2 className="font-display font-bold text-2xl text-zinc-900">Coupon Submitted!</h2>
              <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                Thank you for contributing! Your coupon was sent to the admin panel for review.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4.5">
              {/* Form header */}
              <div>
                <h2 className="font-display font-bold text-xl text-zinc-900 flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-emerald-600 fill-emerald-600" />
                  Share active coupon code
                </h2>
                <p className="text-xs text-zinc-500 mt-1">
                  Found an active promo voucher? Share it with the community grid.
                </p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 text-xs font-semibold rounded-xl border border-red-100 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form Fields Layout Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Brand Name */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1">
                    Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Nike, Starbucks"
                    className="block w-full text-sm px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-600 rounded-xl focus:outline-none focus:ring-0"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                  />
                </div>

                {/* Category */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1">
                    Category Type *
                  </label>
                  <select
                    className="block w-full text-sm px-3 py-2.5 bg-white border border-zinc-200 focus:border-emerald-600 rounded-xl focus:outline-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
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

                {/* Promo value */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 25% OFF or $20 OFF"
                    className="block w-full text-sm px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-600 rounded-xl focus:outline-none"
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                  />
                </div>

                {/* Coupon Code (Optional for Case B Flat Location Discounts) */}
                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1">
                    Coupon Code (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. SAVE25 (Blank = Flat Deal)"
                    className="block w-full text-sm px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-600 rounded-xl uppercase focus:outline-none"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                  />
                  <p className="text-[10px] text-zinc-400 mt-1">Leave blank for a flat in-store discount.</p>
                </div>

                {/* Product Type / Applicability */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1">
                    Product Applicability *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. All regular running sneakers & sports apparel"
                    className="block w-full text-sm px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-600 rounded-xl focus:outline-none"
                    value={productType}
                    onChange={(e) => setProductType(e.target.value)}
                  />
                </div>

                {/* Website URL */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1">
                    Store Website URL
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com"
                    className="block w-full text-sm px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-600 rounded-xl focus:outline-none"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                </div>

                {/* Store Physical Address */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1">
                    Local Physical Store Address (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 500 Broadway Row, Metro City"
                    className="block w-full text-sm px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-600 rounded-xl focus:outline-none"
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                  />
                </div>

                {/* Brief description */}
                <div className="col-span-2">
                  <label className="block text-xs font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1">
                    Discount Details / Exclusions
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter short promo rules or key details..."
                    className="block w-full text-sm px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-600 rounded-xl focus:outline-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>

              {/* Submit panel */}
              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-150">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-zinc-200 text-zinc-600 font-bold text-xs rounded-xl hover:bg-zinc-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm cursor-pointer disabled:opacity-60"
                >
                  {submitting ? 'Submitting...' : 'Publish Coupon'}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
