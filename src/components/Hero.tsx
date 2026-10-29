import React from 'react';
import { Search, BadgePercent, CheckCircle2, Flame, RefreshCcw } from 'lucide-react';
import { motion } from 'motion/react';

interface HeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  totalActiveCount: number;
  onClearFilters: () => void;
  showPromoSuggestion: (term: string) => void;
}

export default function Hero({
  searchQuery,
  setSearchQuery,
  totalActiveCount,
  onClearFilters,
  showPromoSuggestion
}: HeroProps) {
  const suggestions = ['Nike', 'Airbnb', 'BOGO', 'Free Shipping', 'Tech'];

  return (
    <div className="relative pt-24 pb-12 overflow-hidden bg-white border-b border-zinc-200" id="hero-section">
      {/* Decorative vector background */}
      <div className="absolute inset-0 dot-grid opacity-70 pointer-events-none" />
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-10 w-80 h-80 bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Flare tag */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 mb-5 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-700 text-xs font-semibold uppercase tracking-wider font-mono">
          <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse fill-orange-500" />
          <span>Real-time Deal Engine Engaged</span>
        </div>

        {/* Dynamic Titles */}
        <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl text-zinc-900 tracking-tight leading-none mb-6">
          Find, Copy & Save <br className="sm:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 font-extrabold decoration-teal-600 decoration-wavy">
            Instant Discounts
          </span>
        </h1>
        
        <p className="text-zinc-500 text-base sm:text-lg max-w-2xl mx-auto mb-8 font-sans">
          Never pay full price again. Copy hand-verified promo codes, claim limited-time vouchers, and locate nearby physical stores on demand.
        </p>

        {/* 2. Long Search Bar */}
        <div className="relative max-w-2xl mx-auto mb-5" id="long-search-bar-container">
          <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-zinc-400">
            <Search className="w-5.5 h-5.5" />
          </div>
          <input
            type="text"
            className="block w-full pl-12.5 pr-32 py-4 sm:py-4.5 bg-white border-2 border-zinc-200 hover:border-zinc-300 focus:border-emerald-600 focus:ring-0 rounded-2xl text-zinc-800 placeholder-zinc-400 font-medium transition shadow-sm outline-none"
            placeholder="Search by brand, category, code, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            id="long-search-bar-input"
          />
          <div className="absolute inset-y-2 right-2 flex items-center">
            {searchQuery ? (
              <button
                onClick={() => setSearchQuery('')}
                className="hidden sm:flex items-center justify-center p-1.5 text-zinc-400 hover:text-zinc-600 mr-2 rounded-lg hover:bg-zinc-100"
                title="Clear Search"
              >
                <RefreshCcw className="w-4 h-4" />
              </button>
            ) : null}
            <div className="px-3.5 py-2.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl font-mono uppercase border border-emerald-100 shadow-xs">
              {totalActiveCount} Deals
            </div>
          </div>
        </div>

        {/* Search suggestions tags */}
        <div className="flex flex-wrap justify-center items-center gap-2 mb-8">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider font-mono">Suggested:</span>
          {suggestions.map((term) => (
            <button
              key={term}
              onClick={() => showPromoSuggestion(term)}
              className="px-3 py-1 text-xs font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded-lg transition"
            >
              {term}
            </button>
          ))}
          {searchQuery && (
            <button
              onClick={onClearFilters}
              className="text-xs font-semibold text-red-500 hover:text-red-700 underline underline-offset-2 ml-1"
            >
              Reset All Filters
            </button>
          )}
        </div>

        {/* Real-time statistics strip for design authority */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 pt-6 border-t border-zinc-100 max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-2.5">
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-zinc-900 leading-tight">100% Verified</div>
              <div className="text-xs text-zinc-400 leading-none">Daily human audits</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2.5">
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
              <BadgePercent className="w-5 h-5" />
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-zinc-900 leading-tight">Upto 40% OFF</div>
              <div className="text-xs text-zinc-400 leading-none">Voucher discounts</div>
            </div>
          </div>
          <div className="col-span-2 sm:col-span-1 flex items-center justify-center gap-2.5">
            <div className="bg-emerald-50 text-emerald-600 p-2 rounded-lg">
              <RefreshCcw className="w-5 h-5 animate-spin-slow" />
            </div>
            <div className="text-left">
              <div className="font-display font-bold text-zinc-900 leading-tight">Updated Hourly</div>
              <div className="text-xs text-zinc-400 leading-none">Real-time sync rate</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
