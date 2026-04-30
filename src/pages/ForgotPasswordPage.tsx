import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Bike, CheckCircle2, AlertCircle, ShieldCheck, Lock } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useMutation } from '@apollo/client';
import { REQUEST_PASSWORD_RESET, CONFIRM_PASSWORD_RESET } from '../api/mutations';

const ForgotPasswordPage: React.FC = () => {
  const { t } = useTranslation();
  const [step, setStep] = useState(1); // 1: Email, 2: Token & New Password
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [requestReset, { loading: isRequesting }] = useMutation(REQUEST_PASSWORD_RESET, {
    onCompleted: (data) => {
      if (data.requestPasswordReset.success) {
        setMessage(data.requestPasswordReset.message);
        setStep(2);
        setError(null);
      } else {
        setError(data.requestPasswordReset.message);
      }
    },
    onError: (err) => setError(err.message)
  });

  const [confirmReset, { loading: isConfirming }] = useMutation(CONFIRM_PASSWORD_RESET, {
    onCompleted: (data) => {
      if (data.confirmPasswordReset.success) {
        setMessage("Password reset successful! You can now login.");
        setStep(3); // Success state
        setError(null);
      } else {
        setError(data.confirmPasswordReset.message);
      }
    },
    onError: (err) => setError(err.message)
  });

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    requestReset({ variables: { email } });
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    confirmReset({ variables: { token, password } });
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center bg-slate-50 dark:bg-slate-950">
      <Navbar />
      
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 pt-24 pb-12">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-white/5 p-8 md:p-12">
          
          <div className="text-center mb-8">
            <div className="inline-flex p-4 bg-primary-light/10 dark:bg-primary-light/5 rounded-2xl mb-6 text-primary-light shadow-inner">
              {step === 3 ? <CheckCircle2 size={32} /> : <Lock size={32} />}
            </div>
            <h2 className="text-3xl font-black mb-3 text-slate-900 dark:text-white tracking-tight">
              {step === 1 ? "Forgot Password" : step === 2 ? "Verify Token" : "Success!"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              {step === 1 ? "Enter your email and we'll send you a reset token." : 
               step === 2 ? `We've sent a token to ${email}` : 
               "Your password has been updated."}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-medium text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {message && step !== 3 && (
            <div className="mb-6 p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 flex items-start gap-3">
              <CheckCircle2 size={18} className="text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs font-medium text-green-600 dark:text-green-400">{message}</p>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleRequest} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider ml-1 text-slate-500">Email Address</label>
                <div className="relative flex items-center border-2 border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-slate-950/50">
                  <div className="pl-4 pr-3 flex items-center justify-center pointer-events-none text-slate-400">
                    <Mail size={20} />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 py-4 pr-4 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isRequesting}
                className="w-full py-4 bg-primary-light text-white font-black rounded-2xl shadow-lg hover:shadow-primary-light/30 transition-all flex items-center justify-center gap-2"
              >
                {isRequesting ? "Sending..." : "Send Token"} <ArrowRight size={20} />
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleConfirm} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider ml-1 text-slate-500">Verification Token</label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full py-4 px-4 bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-bold text-center tracking-widest"
                  placeholder="TOKEN-HERE"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider ml-1 text-slate-500">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full py-4 px-4 bg-slate-50 dark:bg-slate-950/50 border-2 border-slate-200 dark:border-slate-800 rounded-2xl outline-none text-slate-900 dark:text-white font-medium"
                  placeholder="••••••••"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isConfirming}
                className="w-full py-4 bg-primary-light text-white font-black rounded-2xl shadow-lg hover:shadow-primary-light/30 transition-all"
              >
                {isConfirming ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          )}

          {step === 3 && (
            <div className="text-center py-6">
              <div className="mb-8 p-4 rounded-xl bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/20 text-green-600 dark:text-green-400 font-bold">
                {message}
              </div>
              <Link to="/login" className="premium-btn bg-slate-900 text-white px-8 py-4 w-full block">
                Back to Login
              </Link>
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/login" className="text-sm font-bold text-primary-light hover:underline underline-offset-4 decoration-2">
              Back to Login
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
