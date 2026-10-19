import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone, Mail, Send, CheckCircle2, MessageSquare, Loader2
} from 'lucide-react';
import { contactService } from '../services/firestoreService';

interface ContactViewProps {
  onBack: () => void;
}

export default function ContactView({ onBack }: ContactViewProps) {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in all required fields.');
      return;
    }
    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRx.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setSubmitting(true);
    try {
      await contactService.submitMessage(form);
      setSubmitted(true);
    } catch (err) {
      console.error('Failed to send message:', err);
      setError('Failed to send your message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-emerald-50/20 to-zinc-100 pb-20 font-sans">

      {/* ── Hero Banner ── */}
      <div className="relative bg-zinc-900 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.18),_transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(16,185,129,0.10),_transparent_60%)]" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-emerald-500/15 border border-emerald-500/25 rounded-full text-emerald-400 text-[11px] font-mono font-bold uppercase tracking-widest mb-5">
              <MessageSquare className="w-3.5 h-3.5" />
              Get In Touch
            </div>
            <h1 className="font-display font-black text-4xl sm:text-5xl text-white tracking-tight mb-4 leading-tight">
              Contact <span className="text-emerald-400">Us</span>
            </h1>
            <p className="text-zinc-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Have a question, partnership inquiry, or just want to say hello?
              We'd love to hear from you — reach out any time.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">

        {/* ── Contact Info Cards (Phone + Email only) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
        >
          {/* Phone Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl border border-emerald-200 p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-emerald-100 text-emerald-700">
              <Phone className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1">Phone</p>
            <a
              href="tel:+8801817672626"
              id="contact-phone-link"
              className="text-sm font-bold text-zinc-900 hover:text-emerald-600 transition-colors"
            >
              01817672626
            </a>
            <p className="text-[11px] text-zinc-400 mt-1">Available Sun – Thu, 9 AM – 6 PM</p>
          </motion.div>

          {/* Email Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22 }}
            className="bg-white rounded-2xl border border-blue-200 p-5 shadow-sm hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-blue-100 text-blue-700">
              <Mail className="w-5 h-5" />
            </div>
            <p className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider mb-1">Email</p>
            <a
              href="mailto:shamimalhasan582@gmail.com"
              id="contact-email-link"
              className="text-sm font-bold text-zinc-900 hover:text-blue-600 transition-colors break-all"
            >
              shamimalhasan582@gmail.com
            </a>
            <p className="text-[11px] text-zinc-400 mt-1">We reply within 24 hours</p>
          </motion.div>
        </motion.div>

        {/* ── Contact Form (full width) ── */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
        >
          <div className="bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-teal-400" />

            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-10 text-center space-y-4"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    className="w-16 h-16 bg-emerald-100 border-2 border-emerald-200 rounded-full flex items-center justify-center mx-auto"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                  </motion.div>
                  <h3 className="font-display font-black text-xl text-zinc-900">Message Sent!</h3>
                  <p className="text-sm text-zinc-500 max-w-xs mx-auto">
                    Thank you, <span className="font-semibold text-zinc-800">{form.name}</span>. We'll get back to you at <span className="font-semibold text-emerald-600">{form.email}</span> within 24 hours.
                  </p>
                  <button
                    type="button"
                    onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                    className="mt-2 text-xs font-bold text-zinc-500 hover:text-zinc-700 underline cursor-pointer"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onSubmit={handleSubmit}
                  className="space-y-5"
                  id="contact-form"
                >
                  <div>
                    <h2 className="font-display font-black text-xl text-zinc-900 mb-0.5">Send a Message</h2>
                    <p className="text-xs text-zinc-400">Fill in the form and we'll respond as soon as possible.</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="contact-name" className="block text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        required
                        placeholder="e.g. Shamim Hasan"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full text-sm px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl transition-colors"
                      />
                    </div>
                    <div>
                      <label htmlFor="contact-email" className="block text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
                        Email Address <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        required
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full text-sm px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="contact-subject" className="block text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
                      Subject
                    </label>
                    <select
                      id="contact-subject"
                      name="subject"
                      value={form.subject}
                      onChange={handleChange}
                      className="w-full text-sm px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl transition-colors"
                    >
                      <option value="">Select a topic…</option>
                      <option value="general">General Inquiry</option>
                      <option value="partnership">Partnership / Become a Partner</option>
                      <option value="coupon">Coupon Issue or Report</option>
                      <option value="account">Account Support</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="contact-message" className="block text-[10px] font-bold text-zinc-500 font-mono uppercase tracking-wider mb-1.5">
                      Message <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Tell us how we can help you…"
                      value={form.message}
                      onChange={handleChange}
                      className="w-full text-sm px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 focus:border-emerald-500 focus:bg-white focus:outline-none rounded-xl transition-colors resize-none"
                    />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="text-xs text-rose-600 font-semibold"
                      >
                        ⚠ {error}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={submitting}
                    id="contact-submit-btn"
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm rounded-xl cursor-pointer transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send Message</>
                    )}
                  </button>

                  <p className="text-center text-[10px] text-zinc-400 font-mono">
                    Or email us directly at{' '}
                    <a href="mailto:shamimalhasan582@gmail.com" className="text-emerald-600 hover:underline font-bold">
                      shamimalhasan582@gmail.com
                    </a>
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
