import React, { useState } from 'react';
import { Coupon } from '../types';
import {
  X, Copy, Check, ExternalLink, MapPin, ShieldAlert, Sparkles, BellRing
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CouponDetailsModalProps {
  key?: React.Key;
  coupon: Coupon | null;
  onClose: () => void;
}

export default function CouponDetailsModal({
  coupon,
  onClose
}: CouponDetailsModalProps) {
  if (!coupon) return null;

  const [copied, setCopied] = useState(false);

  // Copy promo code action
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(coupon.couponCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback
      const el = document.createElement('textarea');
      el.value = coupon.couponCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" id="coupon-details-modal">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-zinc-900/60 backdrop-blur-xs transition"
      />

      {/* Center Wrapper */}
      <div className="flex min-h-full items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-zinc-200 flex flex-col"
        >
          {/* Top visual strip */}
          <div className="absolute top-0 left-0 w-full h-2 bg-emerald-600" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200/50 transition cursor-pointer z-10"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Details Body */}
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto max-h-[85vh]">

            {/* Header / Brand info */}
            <div className="flex items-center gap-4.5 mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-display font-extrabold text-lg uppercase tracking-tight ${coupon.brandLogoBg}`}>
                {coupon.brandName.slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-display font-bold text-2xl text-zinc-900">{coupon.brandName}</h2>
                  <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold font-mono rounded-full border border-emerald-100 uppercase tracking-wider">
                    {coupon.category}
                  </span>
                </div>
                <p className="text-sm font-medium text-zinc-500">{coupon.expiryDate}</p>
              </div>
            </div>

            {/* Title / Value */}
            <div className="mb-6">
              <div className="text-4xl font-display font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600 mb-1 leading-none">
                {coupon.discountValue}
              </div>
              <h4 className="text-lg font-bold text-zinc-800 leading-snug">{coupon.productType}</h4>
              <p className="text-zinc-500 text-sm mt-2 leading-relaxed">{coupon.description}</p>
            </div>

            {/* 1. Coupon and Copy option */}
            <div className="mb-8" id="copy-section">
              {coupon.couponCode ? (
                <>
                  <span className="block text-xs font-bold text-zinc-500 font-mono uppercase tracking-widest mb-2.5">
                    Promotion Coupon Code
                  </span>
                  <div className="relative border-2 border-dashed border-zinc-200 bg-zinc-50/50 hover:bg-zinc-50 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition overflow-hidden">
                    {/* Decorative retro coupon hole circles */}
                    <div className="absolute top-1/2 -left-3.5 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-r-2 border-zinc-200" />
                    <div className="absolute top-1/2 -right-3.5 -translate-y-1/2 w-6 h-6 rounded-full bg-white border-l-2 border-zinc-200" />

                    <div className="flex flex-col items-center sm:items-start text-center sm:text-left pl-2">
                      <span className="text-2xl font-mono font-bold tracking-widest text-zinc-800 select-all bg-zinc-200/50 px-3 py-1 rounded-lg">
                        {coupon.couponCode}
                      </span>
                      <p className="text-[11px] text-zinc-400 font-medium mt-1.5 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        Click code to highlight, click copy button to save.
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleCopyCode}
                      className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-bold text-sm transition-all shadow-sm shrink-0 cursor-pointer ${copied
                          ? 'bg-emerald-600 text-white'
                          : 'bg-zinc-900 text-white hover:bg-zinc-800'
                        }`}
                      id="copy-vouchers-btn"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4 animate-bounce" />
                          <span>Copied! Ready to Use</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </>
              ) : (
                <div className="relative border-2 border-emerald-200 bg-emerald-50/40 p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 transition overflow-hidden">
                  <div className="flex flex-col items-center sm:items-start text-center sm:text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin className="w-5 h-5 text-emerald-600 animate-pulse" />
                      <span className="text-sm font-bold text-emerald-800">In-Store Flat Promotion / No Code Required</span>
                    </div>
                    <p className="text-xs text-zinc-600 max-w-sm">
                      This discount applies directly in physical branches or outlets. Simply visit your nearest store and redeem at the checkout counter.
                    </p>
                  </div>
                  <div className="p-3 bg-white text-emerald-700 rounded-xl border border-emerald-100 text-center shrink-0">
                    <div className="text-xs font-mono font-bold leading-none uppercase tracking-wider">REDEEM DIRECTLY</div>
                    <div className="text-[10px] font-mono text-zinc-400 mt-1">In Retail Branch</div>
                  </div>
                </div>
              )}

              {coupon.usageTips && (
                <div className="mt-3 text-[11px] text-zinc-400 leading-relaxed font-sans px-2 flex items-start gap-1">
                  <span className="font-bold text-zinc-500">T&C:</span>
                  <span>{coupon.usageTips}</span>
                </div>
              )}
            </div>

            {/* 2. Go to Website Link */}
            <div className="mb-8">
              <span className="block text-xs font-bold text-zinc-500 font-mono uppercase tracking-widest mb-3">
                Online Redemption
              </span>
              <div className="bg-zinc-50 rounded-2xl p-4.5 border border-zinc-200/60 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-center sm:text-left">
                  <div className="font-semibold text-sm text-zinc-800">Shop official brand online store</div>
                  <div className="text-xs text-zinc-400 font-mono mt-0.5">{coupon.websiteUrl}</div>
                </div>
                <motion.a
                  whileHover={{ x: 2 }}
                  href={coupon.websiteUrl}
                  target="_blank"
                  rel="noreferrer referrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-zinc-300 hover:border-zinc-400 text-zinc-700 hover:text-zinc-950 font-bold text-sm rounded-xl transition shadow-xs cursor-pointer"
                  id="nav-to-partner-website"
                >
                  <span>Go to Website</span>
                  <ExternalLink className="w-4 h-4" />
                </motion.a>
              </div>
            </div>

          </div>

          {/* Footer controls */}
          <div className="px-6 py-4.5 bg-zinc-50 border-t border-zinc-200 flex justify-between items-center text-xs text-zinc-400 font-mono">
            <span>CODE STATUS: VERIFIED 2026</span>
            <button
              onClick={onClose}
              className="px-4 py-2 hover:bg-zinc-200 text-zinc-600 font-bold font-sans rounded-xl transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
