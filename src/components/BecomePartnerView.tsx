import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Award, Building2, Mail, Phone, Globe, MapPin, ShoppingBag,
  Tag, ArrowRight, CheckCircle2, ChevronLeft, Loader2, Store,
  Sparkles, Shield, Zap
} from 'lucide-react';
import { partnerApplicationService } from '../services/firestoreService';

interface BecomePartnerViewProps {
  onBack: () => void;
}

const CATEGORIES = [
  'Fashion', 'Tech', 'Dining', 'Beauty', 'Wellness', 'Travel', 'Home', 'Grocery',
];

const SHOP_TYPES = [
  { value: 'online', label: 'Online Store', icon: Globe, desc: 'Sell exclusively via website or app' },
  { value: 'offline', label: 'Physical Store', icon: Store, desc: 'Brick-and-mortar retail locations' },
  { value: 'both', label: 'Online & Physical', icon: ShoppingBag, desc: 'Both digital and in-store presence' },
];

const PERKS = [
  { icon: Zap, title: 'Instant Visibility', desc: 'Your deals shown to thousands of active shoppers' },
  { icon: Shield, title: 'Verified Partner Badge', desc: 'Build trust with our official partner status' },
  { icon: Sparkles, title: 'Premium Placement', desc: 'Featured slots and category highlights' },
];

export default function BecomePartnerView({ onBack }: BecomePartnerViewProps) {
  const [form, setForm] = useState({
    companyName: '',
    email: '',
    phone: '',
    website: '',
    address: '',
    shopType: '' as 'online' | 'offline' | 'both' | '',
    category: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const isValid =
    form.companyName.trim() &&
    form.email.trim() &&
    form.phone.trim() &&
    form.address.trim() &&
    form.shopType &&
    form.category;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError('Please fill in all required fields before submitting.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await partnerApplicationService.submitApplication({
        companyName: form.companyName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        website: form.website.trim() || undefined,
        address: form.address.trim(),
        shopType: form.shopType as 'online' | 'offline' | 'both',
        category: form.category,
      });
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Something went wrong. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-emerald-50/30 to-zinc-100">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-800 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-teal-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/5 rounded-full blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 relative">
          {/* Back Button */}
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-emerald-300 hover:text-white text-xs font-bold font-mono uppercase tracking-wider transition-colors cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Explore
          </button>

          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
            {/* Left: Text */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 bg-emerald-700/50 border border-emerald-600/40 text-emerald-300 text-[10px] font-black font-mono uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
                <Award className="w-3.5 h-3.5" />
                <span>Partner Program</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-display font-black text-white leading-tight mb-4">
                Grow Your Brand<br />
                <span className="text-emerald-400">With Us</span>
              </h1>
              <p className="text-emerald-200/80 text-sm leading-relaxed max-w-md">
                Join thousands of businesses reaching millions of deal-seekers daily. Submit your company details and our team will review your application within 48 hours.
              </p>

              {/* Perks Row */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                {PERKS.map((perk) => {
                  const Icon = perk.icon;
                  return (
                    <div key={perk.title} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-emerald-700/60 border border-emerald-600/30 rounded-xl flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-emerald-300" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">{perk.title}</p>
                        <p className="text-[11px] text-emerald-300/70 leading-snug">{perk.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Stats */}
            <div className="flex lg:flex-col gap-4 shrink-0">
              {[
                { label: 'Active Partners', value: '1,200+' },
                { label: 'Monthly Shoppers', value: '5M+' },
                { label: 'Avg. Revenue Boost', value: '34%' },
              ].map((stat) => (
                <div key={stat.label} className="bg-emerald-800/50 border border-emerald-700/40 rounded-2xl px-5 py-3 text-center backdrop-blur-sm">
                  <p className="text-2xl font-display font-black text-white">{stat.value}</p>
                  <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <AnimatePresence mode="wait">
          {submitted ? (
            /* ── SUCCESS STATE ── */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="max-w-lg mx-auto text-center py-16"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                className="w-20 h-20 bg-emerald-100 border-2 border-emerald-300 rounded-full flex items-center justify-center mx-auto mb-6"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-600" />
              </motion.div>
              <h2 className="text-3xl font-display font-black text-zinc-900 mb-3">Application Sent!</h2>
              <p className="text-sm text-zinc-500 leading-relaxed mb-2">
                Your partner application for <span className="font-bold text-zinc-800">{form.companyName}</span> has been submitted successfully.
              </p>
              <p className="text-xs text-zinc-400 mb-8">
                Our admin team will review your application and reach out to <span className="font-semibold text-emerald-600">{form.email}</span> within 48 hours. Once approved, you'll receive an email to set your password and access the partner portal.
              </p>
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-2xl transition-colors cursor-pointer shadow-lg shadow-emerald-600/20"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Explore
              </button>
            </motion.div>
          ) : (
            /* ── FORM ── */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left sidebar info */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white border border-zinc-200 rounded-3xl p-6 shadow-sm">
                  <h3 className="text-sm font-bold text-zinc-800 mb-1">How it works</h3>
                  <p className="text-xs text-zinc-500 mb-4 leading-relaxed">Simple 3-step process to get your brand listed:</p>
                  <div className="space-y-4">
                    {[
                      { step: '01', title: 'Submit Application', desc: 'Fill in your company details below' },
                      { step: '02', title: 'Admin Review', desc: 'Our team reviews within 48 hours' },
                      { step: '03', title: 'Set Password & Go Live', desc: 'Receive email to activate your partner account' },
                    ].map((item) => (
                      <div key={item.step} className="flex gap-3">
                        <div className="w-7 h-7 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg flex items-center justify-center font-mono font-black text-[10px] shrink-0">
                          {item.step}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-zinc-800">{item.title}</p>
                          <p className="text-[11px] text-zinc-400 leading-snug">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-emerald-800">Secure & Confidential</span>
                  </div>
                  <p className="text-[11px] text-emerald-700/80 leading-relaxed">
                    Your company information is encrypted and used solely for partner verification purposes. We never share your data with third parties.
                  </p>
                </div>
              </div>

              {/* Right: The actual form */}
              <div className="lg:col-span-2">
                <form
                  onSubmit={handleSubmit}
                  className="bg-white border border-zinc-200 rounded-3xl shadow-sm overflow-hidden"
                >
                  {/* Form Header */}
                  <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 px-8 py-5">
                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest">Partner Application Form</span>
                    <h2 className="text-lg font-display font-bold text-white mt-0.5">Company Registration</h2>
                  </div>

                  <div className="p-8 space-y-6">
                    {/* Row 1: Company + Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Company Name */}
                      <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
                          <Building2 className="w-3 h-3" /> Company Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Apex Retail Co."
                          value={form.companyName}
                          onChange={(e) => handleChange('companyName', e.target.value)}
                          className="w-full px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-400"
                        />
                      </div>

                      {/* Email */}
                      <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
                          <Mail className="w-3 h-3" /> Business Email <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="contact@yourcompany.com"
                          value={form.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          className="w-full px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-400"
                        />
                      </div>
                    </div>

                    {/* Row 2: Phone + Website */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Phone */}
                      <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
                          <Phone className="w-3 h-3" /> Phone Number <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+1 (555) 000-0000"
                          value={form.phone}
                          onChange={(e) => handleChange('phone', e.target.value)}
                          className="w-full px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-400"
                        />
                      </div>

                      {/* Website */}
                      <div>
                        <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
                          <Globe className="w-3 h-3" /> Website
                          <span className="text-zinc-400 font-normal normal-case font-sans tracking-normal text-[10px]">(optional)</span>
                        </label>
                        <input
                          type="url"
                          placeholder="https://yourcompany.com"
                          value={form.website}
                          onChange={(e) => handleChange('website', e.target.value)}
                          className="w-full px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-400"
                        />
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
                        <MapPin className="w-3 h-3" /> Business Address <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="123 Commerce St, City, State, ZIP"
                        value={form.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        className="w-full px-4 py-2.5 text-sm bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all placeholder:text-zinc-400"
                      />
                    </div>

                    {/* Shop Type - Card Selector */}
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 font-mono uppercase tracking-wider mb-2">
                        <ShoppingBag className="w-3 h-3" /> Shop Type <span className="text-red-400">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {SHOP_TYPES.map((type) => {
                          const Icon = type.icon;
                          const selected = form.shopType === type.value;
                          return (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => handleChange('shopType', type.value)}
                              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                                selected
                                  ? 'border-emerald-500 bg-emerald-50 shadow-md shadow-emerald-500/10'
                                  : 'border-zinc-200 bg-zinc-50 hover:border-zinc-300 hover:bg-white'
                              }`}
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center mb-2 ${selected ? 'bg-emerald-600' : 'bg-zinc-200'}`}>
                                <Icon className={`w-3.5 h-3.5 ${selected ? 'text-white' : 'text-zinc-500'}`} />
                              </div>
                              <p className={`text-xs font-bold ${selected ? 'text-emerald-800' : 'text-zinc-700'}`}>{type.label}</p>
                              <p className={`text-[10px] leading-snug mt-0.5 ${selected ? 'text-emerald-600/80' : 'text-zinc-400'}`}>{type.desc}</p>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Category */}
                    <div>
                      <label className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500 font-mono uppercase tracking-wider mb-2">
                        <Tag className="w-3 h-3" /> Category <span className="text-red-400">*</span>
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {CATEGORIES.map((cat) => {
                          const selected = form.category === cat;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => handleChange('category', cat)}
                              className={`px-3.5 py-1.5 rounded-full text-xs font-bold border-2 transition-all cursor-pointer ${
                                selected
                                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20'
                                  : 'bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-white'
                              }`}
                            >
                              {cat}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Error */}
                    <AnimatePresence>
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3 font-medium"
                        >
                          {error}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    {/* Submit */}
                    <div className="pt-2 border-t border-zinc-100 flex items-center justify-between">
                      <p className="text-[10px] text-zinc-400 font-mono">
                        <span className="text-red-400">*</span> Required fields
                      </p>
                      <motion.button
                        type="submit"
                        whileTap={{ scale: 0.97 }}
                        disabled={submitting || !isValid}
                        className="inline-flex items-center gap-2 px-7 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-2xl transition-colors cursor-pointer shadow-lg shadow-emerald-600/20"
                      >
                        {submitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Application
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
