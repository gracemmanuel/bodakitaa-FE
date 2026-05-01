import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, Lock, CheckCircle2, AlertCircle, RefreshCcw, ShieldCheck, Copy } from 'lucide-react';
import Navbar from '../components/Navbar';
import { useMutation } from '@apollo/client';
import { REQUEST_PASSWORD_RESET, CONFIRM_PASSWORD_RESET } from '../api/mutations';
import gsap from 'gsap';

const ForgotPasswordPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Animate on step change
  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 24, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'power3.out' }
      );
    }
  }, [step]);

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
    onError: (err) => setError(err.message),
  });

  const [confirmReset, { loading: isConfirming }] = useMutation(CONFIRM_PASSWORD_RESET, {
    onCompleted: (data) => {
      if (data.confirmPasswordReset.success) {
        setStep(3);
        setError(null);
      } else {
        setError(data.confirmPasswordReset.message);
      }
    },
    onError: (err) => setError(err.message),
  });

  const handleRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    requestReset({ variables: { email } });
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    confirmReset({ variables: { token: token.toUpperCase().trim(), password } });
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isTokenValid = token.trim().length === 8;
  const isPasswordValid = password.length >= 8;
  const passwordsMatch = password === confirmPassword;

  const steps = [
    { num: 1, label: 'Email' },
    { num: 2, label: 'Verify' },
    { num: 3, label: 'Done' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 relative overflow-hidden">
      <Navbar />

      {/* Animated background blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[10%] left-[15%] w-[500px] h-[500px] bg-primary-light/8 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[10%] right-[10%] w-[400px] h-[400px] bg-amber-500/6 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[80px]" />
      </div>

      <div className="flex-1 flex items-center justify-center p-6 relative z-10 pt-24 pb-12">
        <div className="w-full max-w-md">

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-10">
            {steps.map((s, i) => (
              <React.Fragment key={s.num}>
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm border-2 transition-all duration-500 ${
                    step > s.num
                      ? 'bg-green-500 border-green-500 text-white'
                      : step === s.num
                      ? 'bg-primary-light border-primary-light text-white shadow-[0_0_20px_rgba(254,119,67,0.5)]'
                      : 'bg-slate-900 border-slate-700 text-slate-500'
                  }`}>
                    {step > s.num ? <CheckCircle2 size={18} /> : s.num}
                  </div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${step >= s.num ? 'text-slate-300' : 'text-slate-600'}`}>{s.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 mb-4 transition-all duration-500 ${step > s.num ? 'bg-green-500' : 'bg-slate-800'}`} />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Card */}
          <div
            ref={containerRef}
            className="bg-slate-900/80 backdrop-blur-2xl rounded-[2rem] border border-white/8 shadow-[0_30px_60px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Card top accent */}
            <div className="h-1 bg-gradient-to-r from-primary-dark via-primary-light to-amber-400" />

            <div className="p-8 md:p-10">

              {/* Header */}
              <div className="text-center mb-8">
                <div className={`inline-flex p-4 rounded-2xl mb-5 ${step === 3 ? 'bg-green-500/15 text-green-400' : 'bg-primary-light/12 text-primary-light'}`}>
                  {step === 3 ? <CheckCircle2 size={30} /> : step === 1 ? <Mail size={30} /> : <ShieldCheck size={30} />}
                </div>
                <h1 className="text-2xl font-black text-white mb-2 tracking-tight">
                  {step === 1 ? 'Forgot Password?' : step === 2 ? 'Enter Reset Token' : 'All Done!'}
                </h1>
                <p className="text-sm text-slate-400 font-medium">
                  {step === 1
                    ? "Enter your email and we'll send you a one-time reset token."
                    : step === 2
                    ? `Check your inbox for the 8-character token sent to ${email}`
                    : 'Your password has been successfully updated.'}
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3">
                  <AlertCircle size={18} className="text-red-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-semibold text-red-400 leading-relaxed">{error}</p>
                </div>
              )}

              {/* Success Alert (Step 2 info) */}
              {message && step === 2 && (
                <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-green-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs font-semibold text-green-400 leading-relaxed">{message}</p>
                </div>
              )}

              {/* Step 1 — Email */}
              {step === 1 && (
                <form onSubmit={handleRequest} className="space-y-5">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Email Address</label>
                    <div className={`flex items-center border-2 rounded-2xl transition-all duration-300 bg-slate-950/50 ${
                      email.length > 0 && !isEmailValid
                        ? 'border-red-500/40'
                        : isEmailValid
                        ? 'border-green-500/40'
                        : 'border-slate-800 focus-within:border-primary-light/60 focus-within:shadow-[0_0_0_3px_rgba(254,119,67,0.1)]'
                    }`}>
                      <div className="pl-4 pr-3">
                        <Mail className={`${isEmailValid ? 'text-green-400' : 'text-slate-500'} transition-colors`} size={18} />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 py-4 pr-4 bg-transparent outline-none text-white placeholder:text-slate-600 font-medium text-sm"
                        placeholder="name@example.com"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isRequesting || !isEmailValid}
                    className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                      isEmailValid && !isRequesting
                        ? 'bg-primary-light text-white shadow-[0_10px_25px_rgba(254,119,67,0.35)] hover:shadow-[0_15px_35px_rgba(254,119,67,0.5)] hover:-translate-y-0.5'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isRequesting ? (
                      <>
                        <RefreshCcw size={16} className="animate-spin" />
                        <span>Sending Token...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Token</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2 — Token + New Password */}
              {step === 2 && (
                <form onSubmit={handleConfirm} className="space-y-5">
                  {/* Token input */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center ml-1">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-500">Reset Token</label>
                      <span className={`text-xs font-bold ${isTokenValid ? 'text-green-400' : 'text-slate-600'}`}>{token.length}/8</span>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        value={token}
                        onChange={(e) => setToken(e.target.value.toUpperCase())}
                        className={`w-full py-4 px-4 rounded-2xl border-2 bg-slate-950/50 outline-none text-primary-light placeholder:text-slate-700 font-black text-center tracking-[0.5em] text-xl uppercase transition-all duration-300 ${
                          isTokenValid ? 'border-green-500/40' : 'border-slate-800 focus:border-primary-light/60 focus:shadow-[0_0_0_3px_rgba(254,119,67,0.1)]'
                        }`}
                        placeholder="XXXXXXXX"
                        maxLength={8}
                        required
                      />
                      {token.length > 0 && (
                        <button
                          type="button"
                          onClick={handleCopyToken}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                          title="Copy token"
                        >
                          {copied ? <CheckCircle2 size={16} className="text-green-400" /> : <Copy size={16} />}
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 ml-1">Check your email inbox for the 8-character token.</p>
                  </div>

                  {/* New password */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">New Password</label>
                    <div className={`flex items-center border-2 rounded-2xl transition-all duration-300 bg-slate-950/50 ${
                      password.length > 0 && !isPasswordValid ? 'border-red-500/40' : isPasswordValid ? 'border-green-500/40' : 'border-slate-800 focus-within:border-primary-light/60'
                    }`}>
                      <div className="pl-4 pr-3"><Lock className="text-slate-500" size={18} /></div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="flex-1 py-4 pr-4 bg-transparent outline-none text-white placeholder:text-slate-600 font-medium text-sm"
                        placeholder="Min. 8 characters"
                        required
                      />
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Confirm Password</label>
                    <div className={`flex items-center border-2 rounded-2xl transition-all duration-300 bg-slate-950/50 ${
                      confirmPassword.length > 0 && !passwordsMatch ? 'border-red-500/40' : confirmPassword.length > 0 && passwordsMatch ? 'border-green-500/40' : 'border-slate-800 focus-within:border-primary-light/60'
                    }`}>
                      <div className="pl-4 pr-3"><Lock className="text-slate-500" size={18} /></div>
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="flex-1 py-4 pr-4 bg-transparent outline-none text-white placeholder:text-slate-600 font-medium text-sm"
                        placeholder="Re-enter password"
                        required
                      />
                    </div>
                    {confirmPassword.length > 0 && !passwordsMatch && (
                      <p className="text-xs text-red-400 font-semibold ml-1">Passwords do not match.</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isConfirming || !isTokenValid || !isPasswordValid || !passwordsMatch}
                    className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 ${
                      isTokenValid && isPasswordValid && passwordsMatch && !isConfirming
                        ? 'bg-primary-light text-white shadow-[0_10px_25px_rgba(254,119,67,0.35)] hover:shadow-[0_15px_35px_rgba(254,119,67,0.5)] hover:-translate-y-0.5'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isConfirming ? (
                      <>
                        <RefreshCcw size={16} className="animate-spin" />
                        <span>Resetting...</span>
                      </>
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(null); setMessage(null); setToken(''); }}
                    className="w-full py-3 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    ← Send a new token to a different email
                  </button>
                </form>
              )}

              {/* Step 3 — Success */}
              {step === 3 && (
                <div className="text-center space-y-6">
                  <div className="py-4 px-6 rounded-2xl bg-green-500/10 border border-green-500/20 text-green-400 font-semibold text-sm">
                    ✅ Your password has been updated successfully!
                  </div>
                  <Link
                    to="/login"
                    className="w-full py-4 bg-primary-light text-white font-black rounded-2xl shadow-[0_10px_25px_rgba(254,119,67,0.35)] hover:shadow-[0_15px_35px_rgba(254,119,67,0.5)] hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <span>Back to Login</span>
                    <ArrowRight size={16} />
                  </Link>
                </div>
              )}

            </div>
          </div>

          {/* Bottom link */}
          {step !== 3 && (
            <div className="text-center mt-6">
              <Link to="/login" className="text-sm font-bold text-slate-500 hover:text-primary-light transition-colors">
                ← Back to Login
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
