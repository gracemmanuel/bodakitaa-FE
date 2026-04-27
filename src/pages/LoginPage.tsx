import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Mail, Lock, ArrowRight, Bike, ShieldCheck, 
  Smartphone, Eye, EyeOff, AlertCircle, CheckCircle2 
} from 'lucide-react';
import Navbar from '../components/Navbar';
import gsap from 'gsap';

// --- Sub-Components ---
const AuthBackground: React.FC = () => {
  useEffect(() => {
    gsap.to(".bg-blob-1", {
      x: "random(-100, 100)",
      y: "random(-100, 100)",
      rotation: "random(-45, 45)",
      duration: "random(10, 20)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
    gsap.to(".bg-blob-2", {
      x: "random(-150, 150)",
      y: "random(-150, 150)",
      scale: "random(0.8, 1.2)",
      duration: "random(15, 25)",
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut"
    });
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-slate-50 dark:bg-slate-950">
      <div className="bg-blob-1 absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary-light/10 dark:bg-primary-light/5 rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen" />
      <div className="bg-blob-2 absolute bottom-[10%] right-[10%] w-[600px] h-[600px] bg-amber-500/10 dark:bg-amber-500/5 rounded-full blur-[150px] mix-blend-multiply dark:mix-blend-screen" />
      
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDUgTCAyMCA1IE0gNSAwIEwgNSAyMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDE1NiwgMTYzLCAxNzUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50 dark:opacity-20" />
    </div>
  );
};

// --- Main Page Component ---
const LoginPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Validation states
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  
  const isEmailValid = email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPasswordValid = password.length >= 6;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid || !isPasswordValid) {
      setError("Please check your credentials and try again.");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Demo routing based on email prefix (in reality, backend determines role)
      if (email.startsWith('admin')) navigate('/dashboard/admin');
      else if (email.startsWith('owner')) navigate('/dashboard/owner');
      else if (email.startsWith('rider')) navigate('/dashboard/rider');
      else navigate('/dashboard/client');
    }, 1500);
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-center selection:bg-primary-light/30 selection:text-primary-light">
      <Navbar />
      <AuthBackground />
      
      <div className="flex-1 flex items-center justify-center p-6 relative z-10 pt-24 pb-12">
        <div className="w-full max-w-5xl flex rounded-[3rem] overflow-hidden shadow-2xl shadow-primary-light/10 border border-white/20 dark:border-white/5 bg-white/40 dark:bg-black/40 backdrop-blur-2xl">
          
          {/* Left Side: Form */}
          <div className="w-full lg:w-1/2 p-10 md:p-16 flex flex-col justify-center bg-white dark:bg-slate-900/90 relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary-light/10 to-transparent rounded-bl-full pointer-events-none" />
            
            <div className="mb-10 text-center lg:text-left">
              <div className="inline-flex p-4 bg-primary-light/10 dark:bg-primary-light/5 rounded-2xl mb-6 text-primary-light shadow-inner">
                <Bike size={32} strokeWidth={1.5} />
              </div>
              <h2 className="text-4xl font-black mb-3 text-slate-900 dark:text-white tracking-tight">{t('auth.login_title')}</h2>
              <p className="text-slate-500 dark:text-slate-400 font-medium">
                {t('auth.no_account')}{' '}
                <Link to="/register" className="text-primary-light font-bold hover:underline decoration-2 underline-offset-4 transition-all">
                  {t('auth.submit_register')}
                </Link>
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 flex items-start gap-3 animate-in slide-in-from-top-2">
                <AlertCircle size={20} className="text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6" noValidate>
              <div className="space-y-2 relative">
                <div className="flex justify-between items-center">
                  <label className={`text-xs font-black uppercase tracking-wider ml-1 transition-colors ${emailFocused ? 'text-primary-light' : 'text-slate-500'}`}>
                    {t('auth.email')}
                  </label>
                  {email.length > 0 && (
                    <span className={`text-xs font-bold flex items-center gap-1 ${isEmailValid ? 'text-green-500' : 'text-red-500'}`}>
                      {isEmailValid ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                      {isEmailValid ? 'Valid' : 'Invalid format'}
                    </span>
                  )}
                </div>
                <div className={`relative flex items-center border-2 rounded-2xl transition-all duration-300 bg-slate-50 dark:bg-slate-950/50 ${
                  emailFocused ? 'border-primary-light shadow-[0_0_0_4px_rgba(254,119,67,0.1)]' : 
                  email.length > 0 && !isEmailValid ? 'border-red-300 dark:border-red-500/30' : 
                  'border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="pl-4 pr-3 flex items-center justify-center pointer-events-none">
                    <Mail className={`transition-colors ${emailFocused ? 'text-primary-light' : 'text-slate-400'}`} size={20} />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    className="flex-1 py-4 pr-4 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-base"
                    placeholder="name@example.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 relative">
                <div className="flex justify-between items-center">
                  <label className={`text-xs font-black uppercase tracking-wider ml-1 transition-colors ${passwordFocused ? 'text-primary-light' : 'text-slate-500'}`}>
                    {t('auth.password')}
                  </label>
                  {password.length > 0 && (
                     <span className={`text-xs font-bold ${isPasswordValid ? 'text-green-500' : 'text-slate-400'}`}>
                        {password.length}/6 chars
                     </span>
                  )}
                </div>
                <div className={`relative flex items-center border-2 rounded-2xl transition-all duration-300 bg-slate-50 dark:bg-slate-950/50 ${
                  passwordFocused ? 'border-primary-light shadow-[0_0_0_4px_rgba(254,119,67,0.1)]' : 
                  'border-slate-200 dark:border-slate-800'
                }`}>
                  <div className="pl-4 pr-3 flex items-center justify-center pointer-events-none">
                    <Lock className={`transition-colors ${passwordFocused ? 'text-primary-light' : 'text-slate-400'}`} size={20} />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    className="flex-1 py-4 pr-12 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-base tracking-wide"
                    placeholder="••••••••"
                    required
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors focus:outline-none"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-700 group-hover:border-primary-light transition-colors">
                     <input type="checkbox" className="peer sr-only" />
                     <div className="absolute inset-0 bg-primary-light rounded-[2px] opacity-0 peer-checked:opacity-100 transition-opacity flex items-center justify-center">
                        <CheckCircle2 size={14} className="text-white" />
                     </div>
                  </div>
                  <span className="text-sm font-medium text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">Remember me</span>
                </label>
                
                <button type="button" className="text-sm font-bold text-primary-light hover:underline underline-offset-4 decoration-2">
                  Forgot password?
                </button>
              </div>

              <button 
                type="submit" 
                disabled={isLoading || !isEmailValid || !isPasswordValid}
                className={`w-full py-4 text-lg font-black rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 mt-8 relative overflow-hidden group
                  ${(!isEmailValid || !isPasswordValid) 
                    ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed' 
                    : 'bg-primary-light text-white shadow-[0_15px_30px_-10px_rgba(254,119,67,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(254,119,67,0.6)] hover:-translate-y-1'
                  }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span className="relative z-10">{t('auth.submit_login')}</span>
                    <ArrowRight size={20} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-10 flex items-center justify-center gap-4 before:h-px before:flex-1 before:bg-slate-200 dark:before:bg-slate-800 after:h-px after:flex-1 after:bg-slate-200 dark:after:bg-slate-800">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Demo Access</span>
            </div>
            
            <div className="mt-6 grid grid-cols-2 gap-3 text-xs font-medium text-slate-500">
               <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5 text-center cursor-pointer hover:border-primary-light transition-colors" onClick={() => { setEmail('admin@demo.com'); setPassword('password'); }}>Admin</div>
               <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5 text-center cursor-pointer hover:border-primary-light transition-colors" onClick={() => { setEmail('owner@demo.com'); setPassword('password'); }}>Owner</div>
               <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5 text-center cursor-pointer hover:border-primary-light transition-colors" onClick={() => { setEmail('rider@demo.com'); setPassword('password'); }}>Rider</div>
               <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5 text-center cursor-pointer hover:border-primary-light transition-colors" onClick={() => { setEmail('client@demo.com'); setPassword('password'); }}>Client</div>
            </div>
          </div>

          {/* Right Side: Graphic/Feature Display (Hidden on mobile) */}
          <div className="hidden lg:flex w-1/2 bg-slate-900 relative p-12 flex-col justify-between overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558981420-c532902e58b4?q=80&w=1964&auto=format&fit=crop')] bg-cover bg-center opacity-30 mix-blend-luminosity" />
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-primary-dark/80 mix-blend-multiply" />
            
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-xs font-bold text-white mb-6">
                <ShieldCheck size={16} className="text-green-400" /> Secure Login
              </div>
            </div>
            
            <div className="relative z-10 mt-auto">
              <h3 className="text-4xl font-black text-white mb-4 leading-tight">Your gateway to the ultimate transport ecosystem.</h3>
              <p className="text-lg text-slate-300 font-light mb-8">Access your personalized dashboard, track your rides, manage your fleet, or oversee the platform operations with enterprise-grade security.</p>
              
              <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 w-max">
                 <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white">
                    <Smartphone size={24} />
                 </div>
                 <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Available on</p>
                    <p className="text-white font-bold">iOS & Android</p>
                 </div>
              </div>
            </div>
            
            {/* Abstract geometric decorations */}
            <div className="absolute top-[10%] right-[10%] w-32 h-32 border border-white/10 rounded-full animate-[spin_10s_linear_infinite]" />
            <div className="absolute top-[15%] right-[15%] w-16 h-16 border border-primary-light/30 rounded-full animate-[spin_5s_linear_infinite_reverse]" />
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
