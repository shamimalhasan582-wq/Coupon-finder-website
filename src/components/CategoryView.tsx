import React, { useState, useMemo } from 'react';
import { Coupon } from '../types';
import CouponCard from './CouponCard';
import { SUBCATEGORIES_MAP, CATEGORIES } from '../mockData';
import { Filter, Search, Tag, Eye, ArrowRight, Grid, HeartOff, Compass, AlertCircle, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface CategoryViewProps {
  coupons: Coupon[];
  bookmarkedIds: string[];
  onToggleBookmark: (id: string, e: React.MouseEvent) => void;
  onGetCoupon: (coupon: Coupon) => void;
  initialCategory?: string;
  initialBrand?: string | null;
}

export default function CategoryView({
  coupons,
  bookmarkedIds,
  onToggleBookmark,
  onGetCoupon,
  initialCategory = 'Fashion',
  initialBrand = null
}: CategoryViewProps) {
  // Currently viewed category (defaults to 'Fashion' or selection)
  const [activeCategory, setActiveCategory] = useState<string>(initialCategory === 'All' ? 'Fashion' : initialCategory);
  
  // Selected subcategories (multiple filter options as requested!)
  const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);
  
  // Selected brand filter
  const [selectedBrand, setSelectedBrand] = useState<string | null>(initialBrand);
  
  // Search query within current category page
  const [catSearch, setCatSearch] = useState('');

  // Synchronize state when redirection variables change
  React.useEffect(() => {
    if (initialCategory) {
      setActiveCategory(initialCategory === 'All' ? 'Fashion' : initialCategory);
    }
    setSelectedSubcategories([]);
    setSelectedBrand(initialBrand);
  }, [initialCategory, initialBrand]);

  // Get available subcategories for current main category
  const availableSubcategories = useMemo(() => {
    return SUBCATEGORIES_MAP[activeCategory] || [];
  }, [activeCategory]);

  // Dynamically extract distinct brands with coupons in active category
  const availableBrands = useMemo(() => {
    const brandMap = new Map<string, { name: string; logoBg: string }>();
    coupons
      .filter(c => c.category.toLowerCase() === activeCategory.toLowerCase())
      .forEach(c => {
        if (!brandMap.has(c.brandName)) {
          brandMap.set(c.brandName, { name: c.brandName, logoBg: c.brandLogoBg || 'bg-zinc-900 text-white' });
        }
      });
    return Array.from(brandMap.values());
  }, [coupons, activeCategory]);

  // Handle activeCategory change: reset subcategory and brand filters
  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setSelectedSubcategories([]);
    setSelectedBrand(null);
    setCatSearch('');
  };

  // Toggle subcategory selection
  const handleToggleSubcategory = (sub: string) => {
    if (selectedSubcategories.includes(sub)) {
      setSelectedSubcategories(selectedSubcategories.filter(s => s !== sub));
    } else {
      setSelectedSubcategories([...selectedSubcategories, sub]);
    }
  };

  // Filter list matching active main category, multiple subcategories, selected brand & search keywords
  const finalFilteredCoupons = useMemo(() => {
    return coupons.filter(coupon => {
      // 0. Only show publicly active coupons (hide inactive, expired, rejected, pending)
      if (coupon.status && coupon.status !== 'active') {
        return false;
      }

      // 1. Must match main category
      if (coupon.category.toLowerCase() !== activeCategory.toLowerCase()) {
        return false;
      }

      // 2. Must match subcategory filter (if any are selected)
      if (selectedSubcategories.length > 0) {
        if (!coupon.subcategory || !selectedSubcategories.includes(coupon.subcategory)) {
          return false;
        }
      }

      // 3. Must match brand filter (if one is selected)
      if (selectedBrand) {
        if (coupon.brandName.toLowerCase() !== selectedBrand.toLowerCase()) {
          return false;
        }
      }

      // 4. Must match search string
      if (catSearch.trim()) {
        const search = catSearch.toLowerCase();
        const brandMatch = coupon.brandName.toLowerCase().includes(search);
        const typMatch = coupon.productType.toLowerCase().includes(search);
        const codeMatch = coupon.couponCode?.toLowerCase().includes(search) || false;
        const descMatch = coupon.description.toLowerCase().includes(search);
        return brandMatch || typMatch || codeMatch || descMatch;
      }

      return true;
    });
  }, [coupons, activeCategory, selectedSubcategories, selectedBrand, catSearch]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" id="category-page-view">
      
      {/* Category Selection Sidebar & Banner Grid Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Category Navigator (Actionable redirection) */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
            <h4 className="text-xs font-bold font-mono uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
              <Grid className="w-3.5 h-3.5 text-emerald-600" />
              Retails Categories
            </h4>
            
            <div className="space-y-1">
              {CATEGORIES.filter(cat => cat.name !== 'All').map(cat => {
                const isSelected = activeCategory === cat.name;
                return (
                  <button
                    key={cat.name}
                    onClick={() => handleCategoryChange(cat.name)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-xs font-black'
                        : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 bg-transparent'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <Tag className="w-3.5 h-3.5" />
                      {cat.name}
                    </span>
                    <ArrowRight className={`w-3 h-3 transition-transform ${isSelected ? 'translate-x-0.5' : 'opacity-0'}`} />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Stats banner */}
          <div className="bg-zinc-900 text-white p-5 rounded-2xl border border-zinc-800 shadow-lg relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-emerald-500/10 rounded-full blur-xl" />
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-black block mb-2">Crowdsourced Power</span>
            <h5 className="font-display font-semibold text-sm leading-tight text-zinc-100">Daily Verified Hot Deals</h5>
            <p className="text-[11px] text-zinc-400 mt-2 leading-relaxed font-normal">
              Fresh vouchers, coupon codes and store location discounts submitted and rated by 14,000+ shoppers hourly.
            </p>
          </div>
        </div>

        {/* Right Side: Filters & Cards Results Grid */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Main Action Banner */}
          <div className="bg-white border border-zinc-200/85 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[11px] font-black font-mono tracking-widest text-emerald-600 uppercase">CATEGORY CHANNEL</span>
              <h1 className="text-2xl font-display font-black text-zinc-900 tracking-tight mt-0.5">
                Explore {activeCategory} Coupons
              </h1>
              <p className="text-zinc-500 text-xs mt-1">
                Refine active vouchers using multi-select subcategories filters and context search.
              </p>
            </div>

            {/* View level search field */}
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder={`Search within ${activeCategory}...`}
                value={catSearch}
                onChange={e => setCatSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 rounded-xl text-xs font-medium focus:outline-none focus:bg-white text-zinc-800 transition-all placeholder:text-zinc-400"
              />
            </div>
          </div>

          {/* Task 2 Requirement: Filter option with MORE SUBCATEGORIES */}
          {availableSubcategories.length > 0 && (
            <div className="bg-white border border-zinc-200 p-5 rounded-3xl shadow-2xs">
              <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-400 uppercase mb-3 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                Refine by Subcategory
              </span>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubcategories([])}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedSubcategories.length === 0
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200/80 hover:bg-zinc-100'
                  }`}
                >
                  All Subcategories
                </button>
                
                {availableSubcategories.map(sub => {
                  const isSelected = selectedSubcategories.includes(sub);
                  return (
                    <button
                      key={sub}
                      onClick={() => handleToggleSubcategory(sub)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs'
                          : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : 'bg-zinc-300'}`} />
                      {sub}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Task 1 Requirement: Integrating brand-wise selection inside categories page */}
          {availableBrands.length > 0 && (
            <div className="bg-white border border-zinc-200 p-5 rounded-3xl shadow-2xs">
              <span className="text-[10px] font-bold font-mono tracking-widest text-zinc-400 uppercase mb-3 flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-zinc-500" />
                Filter Category by Brand
              </span>
              
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedBrand(null)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                    selectedBrand === null
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                  }`}
                >
                  All Brands
                </button>
                
                {availableBrands.map(brd => {
                  const isSelected = selectedBrand === brd.name;
                  return (
                    <button
                      key={brd.name}
                      onClick={() => setSelectedBrand(isSelected ? null : brd.name)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border flex items-center gap-2 ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs'
                          : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[7px] font-black uppercase shrink-0 ${
                        isSelected ? 'bg-white text-zinc-900' : brd.logoBg
                      }`}>
                        {brd.name.slice(0, 1)}
                      </div>
                      <span>{brd.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Result statistics */}
          <div className="flex items-center justify-between px-1.5">
            <span className="text-xs font-semibold text-zinc-400 uppercase">
              GRID RESULTS
            </span>
            <span className="text-xs font-medium text-zinc-500">
              Found <span className="font-extrabold text-zinc-800">{finalFilteredCoupons.length}</span> verified promotions
            </span>
          </div>

          {/* Results Grid List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {finalFilteredCoupons.length > 0 ? (
                finalFilteredCoupons.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    isBookmarked={bookmarkedIds.includes(coupon.id)}
                    onToggleBookmark={onToggleBookmark}
                    onGetCoupon={onGetCoupon}
                  />
                ))
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="col-span-full py-16 text-center bg-white rounded-3xl border border-zinc-200 border-dashed space-y-4 max-w-lg mx-auto w-full px-6"
                >
                  <div className="w-12 h-12 bg-zinc-50 text-zinc-400 border border-zinc-200/60 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-zinc-800">No subcategory deals available</div>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed">
                    There are no current coupons matching these active filters. Try unchecking some subcategory filters to browse larger offers.
                  </p>
                  <button
                    onClick={() => setSelectedSubcategories([])}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                  >
                    Clear Subcategory Filter
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>

      </div>

    </div>
  );
}
