import React from 'react';
import { Tag, Bookmark, Plus, User, LogOut, Compass, Grid, Award, Mail } from 'lucide-react';
import { motion } from 'motion/react';

export interface UserProfile {
  name: string;
  email: string;
  photoURL?: string;
  isLoggedIn: boolean;
  avatarBg?: string;
  role?: 'user' | 'partner';
}

interface HeaderProps {
  bookmarkedCount: number;
  showBookmarksOnly: boolean;
  setShowBookmarksOnly: (val: boolean) => void;
  onSubmitCouponClick: () => void;
  onExploreClick: () => void;
  currentView: 'home' | 'category' | 'brand' | 'profile' | 'become-partner' | 'reset-password' | 'contact';
  setCurrentView: (view: 'home' | 'category' | 'brand' | 'profile' | 'become-partner' | 'reset-password' | 'contact') => void;
  currentUser: UserProfile;
  onLogout: () => void;
  onBecomePartnerClick?: () => void;
}

export default function Header({
  bookmarkedCount,
  showBookmarksOnly,
  setShowBookmarksOnly,
  onSubmitCouponClick,
  onExploreClick,
  currentView,
  setCurrentView,
  currentUser,
  onLogout,
  onBecomePartnerClick
}: HeaderProps) {
  return (
    <nav className="fixed top-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200" id="main-header">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Brand section */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer selection:bg-emerald-100 hover:opacity-90"
            onClick={() => {
              setShowBookmarksOnly(false);
              onExploreClick();
              setCurrentView('home');
            }}
          >
            <div className="bg-emerald-600 text-white p-2 rounded-xl flex items-center justify-center shadow-sm shadow-emerald-600/30">
              <Tag className="w-5 h-5 rotate-90" />
            </div>
            <div>
              <span className="font-display font-bold text-xl tracking-tight text-zinc-900">
                Coupon<span className="text-emerald-600 font-extrabold font-sans">Finder</span>
              </span>
              <span className="hidden sm:block text-[10px] font-medium text-emerald-600 uppercase tracking-widest leading-none font-mono">
                verified discounts
              </span>
            </div>
          </div>

          {/* Core Page Navigation (Tabs) */}
          <div className="hidden md:flex items-center gap-1.5 bg-zinc-100/80 p-1 rounded-xl">
            <button
              onClick={() => {
                setShowBookmarksOnly(false);
                setCurrentView('home');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentView === 'home'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-650 hover:text-zinc-900'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              <span>Explore</span>
            </button>
            <button
              onClick={() => {
                setShowBookmarksOnly(false);
                setCurrentView('category');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentView === 'category'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-650 hover:text-zinc-900'
              }`}
            >
              <Grid className="w-3.5 h-3.5 text-emerald-500" />
              <span>Categories</span>
            </button>
            
            {/* Become Partner nav tab */}
            <button
              onClick={() => {
                onBecomePartnerClick?.();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentView === 'become-partner'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-zinc-600 hover:text-emerald-700 hover:bg-zinc-200/30'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-emerald-600" />
              <span>Become Partner</span>
            </button>
            {/* Contact Us nav tab */}
            <button
              onClick={() => setCurrentView('contact')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                currentView === 'contact'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-650 hover:text-zinc-900'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-emerald-500" />
              <span>Contact</span>
            </button>
          </div>

          {/* Menubar controls */}
          <div className="flex items-center gap-2">
            {/* Account Page / Login Button Trigger (Universal in the right corner) */}
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setShowBookmarksOnly(false);
                setCurrentView('profile');
              }}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                currentView === 'profile'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                  : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
              }`}
              id="account-header-trigger"
              title={currentUser.isLoggedIn ? "Manage Account" : "Access Login"}
            >
              {currentUser.isLoggedIn ? (
                <>
                  <div className="w-4 h-4 rounded-md overflow-hidden shrink-0 bg-zinc-100 flex items-center justify-center border border-zinc-200">
                    {currentUser.photoURL ? (
                      <img 
                        src={currentUser.photoURL} 
                        alt={currentUser.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className={`w-full h-full ${currentUser.avatarBg || 'bg-emerald-600'} text-white text-[9px] font-black flex items-center justify-center`}>
                        {currentUser.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="text-left leading-none text-xs">
                    <span className="block text-[11px] font-extrabold text-zinc-800">{currentUser.name.split(' ')[0]}</span>
                    <span className="block text-[8px] text-emerald-700 uppercase tracking-wider font-mono font-bold mt-0.5">
                      {currentUser.role === 'partner' ? 'Partner' : 'User'}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-black text-zinc-800">Login</span>
                </>
              )}
            </motion.button>
          </div>
        </div>
      </div>
    </nav>
  );
}
