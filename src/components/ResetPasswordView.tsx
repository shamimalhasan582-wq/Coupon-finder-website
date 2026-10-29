import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  KeyRound, ShieldCheck, AlertCircle, Loader2, ArrowRight,
  Eye, EyeOff, Lock, CheckCircle2
} from 'lucide-react';
import { auth } from '../config/firebase';
import { verifyPasswordResetCode, confirmPasswordReset, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { partnerApplicationService } from '../services/firestoreService';

interface ResetPasswordViewProps {
  oobCode?: string | null;
  setupEmail?: string | null;
  setupToken?: string | null;
  onSuccess: (email: string, companyName: string) => void;
  onCancel: () => void;
}

export default function ResetPasswordView({ oobCode, setupEmail, setupToken, onSuccess, onCancel }: ResetPasswordViewProps) {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 1: Verify token / code on mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        setVerifying(true);
        setError('');

        if (setupEmail && setupToken) {
          // Custom Activation Flow: Fetch matching application
          const app = await partnerApplicationService.getApplicationByEmail(setupEmail);
          if (app && app.status === 'approved' && app.activationToken === setupToken) {
            setEmail(setupEmail);
            setCompanyName(app.companyName);
          } else {
            throw new Error('The secure invitation link is invalid or has expired.');
          }
        } else if (oobCode) {
          // Standard Firebase Auth Flow
          const resolvedEmail = await verifyPasswordResetCode(auth, oobCode);
          setEmail(resolvedEmail);

          const app = await partnerApplicationService.getApplicationByEmail(resolvedEmail);
          if (app) {
            setCompanyName(app.companyName);
          }
        } else {
          throw new Error('No setup token or code was provided.');
        }
      } catch (err: any) {
        console.error('Verification error:', err);
        setError(err.message || 'The invitation link is invalid or has expired. Please contact the administrator.');
      } finally {
        setVerifying(false);
        setLoading(false);
      }
    };
    verifyToken();
  }, [oobCode, setupEmail, setupToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      if (setupEmail && setupToken) {
        // Custom Flow: Create the Auth Account and save password
        try {
          await createUserWithEmailAndPassword(auth, email, password);
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            await signInWithEmailAndPassword(auth, email, password);
          } else {
            throw createErr;
          }
        }
      } else if (oobCode) {
        // Standard Flow: Confirm reset password
        await confirmPasswordReset(auth, oobCode, password);
        await signInWithEmailAndPassword(auth, email, password);
      }

      setSuccess(true);
      setTimeout(() => {
        onSuccess(email, companyName || email.split('@')[0]);
      }, 1500);
    } catch (err: any) {
      console.error('Error setting password:', err);
      setError(err.message || 'Failed to update password. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading || verifying) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-emerald-50/20 to-zinc-100 flex items-center justify-center p-4">
        <div className="text-center space-y-3.5">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
          <p className="text-xs font-semibold text-zinc-550 font-mono">Verifying secure activation token...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 relative overflow-hidden font-sans"
        id="custom-password-setup-portal"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-emerald-600" />

        {/* 1. Header Title Block (Company Name above all fields) */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-display font-black text-zinc-900 tracking-tight">
            {companyName || 'Brand Partner'}
          </h1>
          <p className="text-xs text-zinc-500 leading-normal">
            Set password to activate your partner account
          </p>
        </div>

        {error ? (
          <div className="space-y-4">
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 border border-rose-100 text-rose-800 rounded-2xl text-xs leading-relaxed font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
            <button
              onClick={onCancel}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs rounded-xl cursor-pointer transition"
            >
              Back to Homepage
            </button>
          </div>
        ) : success ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6 space-y-3"
          >
            <div className="w-12 h-12 bg-emerald-100 border border-emerald-200 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <CheckCircle2 className="w-6 h-6 text-emerald-650" />
            </div>
            <h3 className="text-sm font-bold text-zinc-900">Password Saved Successfully!</h3>
            <p className="text-[11px] text-zinc-405">Logging you into your partner portal...</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5 pt-1">
            {/* 2. Credentials Heading */}
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wide">
                Credentials Set Password
              </h3>
              <div className="h-0.5 bg-zinc-50 w-full" />
            </div>

            {/* Email Label (Subtle Info) */}
            <div className="text-[10px] text-zinc-400 font-mono text-center">
              Email: {email}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-550 font-mono uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 focus:outline-none rounded-xl"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[10px] font-bold text-zinc-550 font-mono uppercase tracking-wider mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 bg-white border border-zinc-200 focus:border-emerald-500 focus:outline-none rounded-xl"
              />
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-zinc-900 hover:bg-zinc-850 text-white font-bold text-xs rounded-xl cursor-pointer transition shadow-xs flex items-center justify-center gap-1.5"
              id="set-password-submit-btn"
            >
              <span>{submitting ? 'Saving Password...' : 'Activate Partner Account'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
