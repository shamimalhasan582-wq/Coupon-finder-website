import React from 'react';
import { Coupon } from '../types';
import { Bookmark, Clock, ShieldCheck, Tag, Sparkles, MapPin, Eye } from 'lucide-react';
import { motion } from 'motion/react';

interface CouponCardProps {
  key?: React.Key;
  coupon: Coupon;
  isBookmarked: boolean;
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onGetCoupon: (coupon: Coupon) => void;
  hideVerifiedBadge?: boolean;
}

export default function CouponCard({
  coupon,
  isBookmarked,
  onToggleBookmark,
  onGetCoupon,
  hideVerifiedBadge = false
}: CouponCardProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="group relative flex flex-col justify-between bg-white border border-zinc-200/80 rounded-2xl shadow-xs transition-shadow hover:shadow-md overflow-hidden"
      id={`coupon-card-${coupon.id}`}
    >
      {/* Visual branding highlight colored bar */}
      <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600" />

      {/* Top Card Body */}
      <div className="p-5 flex-1">
        
        {/* Header: Brand and Save bookmark */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex items-center gap-3">
            {/* Logo placeholder with brand letters */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-display font-extrabold text-sm uppercase shadow-inner tracking-tight shrink-0 ${coupon.brandLogoBg}`}>
              {coupon.brandName.slice(0, 2)}
            </div>
            <div>
              <h3 className="font-display font-bold text-zinc-900 leading-tight group-hover:text-emerald-700 transition-colors">
                {coupon.brandName}
              </h3>
              {!hideVerifiedBadge && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 uppercase tracking-widest font-mono">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Verified
                </span>
              )}
            </div>
          </div>

          <button
            onClick={(e) => onToggleBookmark(coupon.id, e)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isBookmarked
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 border-zinc-200/60'
            }`}
            title={isBookmarked ? 'Remove Bookmark' : 'Bookmark Coupon'}
          >
            <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-emerald-600' : ''}`} />
          </button>
        </div>

        {/* Promo value - Percentage or Amount */}
        <div className="mb-2">
          <div className="text-3xl font-display font-black text-zinc-900 tracking-tight flex items-baseline gap-1">
            {coupon.discountValue}
          </div>
          {/* Product Type / Description text */}
          <p className="text-sm font-semibold text-zinc-800 leading-normal line-clamp-1">
            {coupon.productType}
          </p>
        </div>

        {/* Details & Expiry */}
        <p className="text-xs text-zinc-500 mb-4 line-clamp-2 leading-relaxed">
          {coupon.description}
        </p>
      </div>

      {/* Expiry, Category tags, and action bar */}
      <div className="px-5 pb-5 pt-3 bg-zinc-50/50 border-t border-zinc-100">
        <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
          {/* Expiry period */}
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <Clock className="w-3.5 h-3.5" />
            <span>{coupon.expiryDate}</span>
          </div>

          {/* Category Pill Tag */}
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-zinc-100 text-zinc-600 border border-zinc-200/30 text-[10px] font-bold rounded-full font-mono uppercase tracking-wider">
            <Tag className="w-2.5 h-2.5" />
            {coupon.category}
          </span>
        </div>

        {/* Action Button: Conditional logic for Task 1 */}
        {coupon.couponCode ? (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onGetCoupon(coupon)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-xl transition shadow-xs hover:shadow-md cursor-pointer"
            id={`get-coupon-btn-${coupon.id}`}
          >
            {coupon.userSubmitted && <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />}
            <Tag className="w-4 h-4 rotate-90 shrink-0 text-emerald-200" />
            <span>Get Coupon</span>
          </motion.button>
        ) : (
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() => onGetCoupon(coupon)}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-sm rounded-xl transition shadow-xs hover:shadow-md cursor-pointer border border-zinc-800"
            id={`get-location-btn-${coupon.id}`}
          >
            {coupon.userSubmitted && <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />}
            <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Get Location</span>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
