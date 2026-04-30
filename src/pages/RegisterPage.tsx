import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import {
  User, Mail, Lock, Bike, ShieldCheck, Briefcase,
  UserCheck, ArrowRight, CheckCircle2,
  Phone, MapPin, Upload, Building2, CreditCard
} from 'lucide-react';
import Navbar from '../components/Navbar';

// --- Types ---
type Role = 'client' | 'rider' | 'owner';

interface FormState {
  role: Role;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  // Rider specific
  licenseNumber: string;
  plateNumber: string;
  // Owner specific
  companyName: string;
  taxId: string;
}

// --- Sub-Components ---
const RegisterBackground: React.FC = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0 bg-slate-50 dark:bg-slate-950">
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-primary-light/10 via-amber-500/5 to-transparent rounded-full blur-[120px] mix-blend-multiply dark:mix-blend-screen -translate-y-1/2 translate-x-1/4 animate-[pulse_8s_ease-in-out_infinite]" />
      <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-blue-500/10 via-primary-dark/5 to-transparent rounded-full blur-[100px] mix-blend-multiply dark:mix-blend-screen translate-y-1/4 -translate-x-1/4 animate-[pulse_10s_ease-in-out_infinite_reverse]" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgxNTYsIDE2MywgMTc1LCAwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />
    </div>
  );
};

const RoleCard: React.FC<{
  role: Role;
  currentRole: Role;
  setRole: (r: Role) => void;
  icon: React.ElementType;
  label: string;
  desc: string;
}> = ({ role, currentRole, setRole, icon: Icon, label, desc }) => {
  const isSelected = currentRole === role;

  return (
    <button
      type="button"
      onClick={() => setRole(role)}
      className={`relative flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all duration-300 text-center overflow-hidden group ${isSelected
        ? 'border-primary-light bg-primary-light/5 shadow-lg shadow-primary-light/10 transform scale-[1.02]'
        : 'border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-primary-light/50 hover:bg-slate-50 dark:hover:bg-white/10'
        }`}
    >
      {isSelected && (
        <div className="absolute top-3 right-3 text-primary-light">
          <CheckCircle2 size={20} className="fill-current text-white dark:text-slate-900" />
        </div>
      )}
      <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors duration-300 ${isSelected ? 'bg-primary-light text-white shadow-inner' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 group-hover:text-primary-light'
        }`}>
        <Icon size={32} strokeWidth={isSelected ? 2 : 1.5} />
      </div>
      <h4 className={`text-lg font-black mb-2 transition-colors ${isSelected ? 'text-primary-light' : 'text-slate-900 dark:text-white'}`}>
        {label}
      </h4>
      <p className={`text-xs font-medium leading-relaxed ${isSelected ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
        {desc}
      </p>

      {isSelected && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-dark to-primary-light" />
      )}
    </button>
  );
};

const FormInput: React.FC<{
  icon: React.ElementType;
  type: string;
  placeholder: string;
  label: string;
  value: string;
  onChange: (val: string) => void;
  required?: boolean;
}> = ({ icon: Icon, type, placeholder, label, value, onChange, required = false }) => {
  const [focused, setFocused] = useState(false);
  const isValid = value.length > 0; // Simple validation for demo

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className={`text-xs font-black uppercase tracking-wider ml-1 transition-colors ${focused ? 'text-primary-light' : 'text-slate-500'}`}>
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      </div>
      <div className={`relative flex items-center border-2 rounded-2xl transition-all duration-300 bg-white dark:bg-slate-950/50 ${focused ? 'border-primary-light shadow-[0_0_0_4px_rgba(254,119,67,0.1)]' :
        isValid && !focused ? 'border-green-200 dark:border-green-900/30' :
          'border-slate-200 dark:border-slate-800'
        }`}>
        <div className="pl-4 pr-3 flex items-center justify-center pointer-events-none">
          <Icon className={`transition-colors ${focused ? 'text-primary-light' : isValid ? 'text-green-500' : 'text-slate-400'}`} size={20} />
        </div>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="flex-1 py-4 pr-4 bg-transparent outline-none text-slate-900 dark:text-white placeholder:text-slate-400 font-medium text-sm"
          placeholder={placeholder}
          required={required}
        />
        {isValid && !focused && (
          <div className="absolute right-4 text-green-500">
            <CheckCircle2 size={16} />
          </div>
        )}
      </div>
    </div>
  );
};

const FileUploadField: React.FC<{ label: string; desc: string }> = ({ label, desc }) => (
  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-primary-light hover:bg-primary-light/5 transition-all cursor-pointer group">
    <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-light group-hover:text-white transition-colors text-slate-400">
      <Upload size={20} />
    </div>
    <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-1">{label}</h4>
    <p className="text-xs text-slate-500 font-medium">{desc}</p>
    <p className="text-[10px] text-slate-400 mt-4 uppercase font-bold tracking-wider">JPEG, PNG, PDF up to 5MB</p>
  </div>
);

// --- Main Page Component ---
const RegisterPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const formRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState<FormState>({
    role: 'client',
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    licenseNumber: '',
    plateNumber: '',
    companyName: '',
    taxId: ''
  });

  const updateForm = (key: keyof FormState, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    // Animate form step transition
    if (formRef.current) {
      gsap.fromTo(formRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [step, formData.role]);

  const handleNextStep = () => {
    if (step === 1) setStep(2);
    if (step === 2 && formData.role !== 'client') setStep(3);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2 || (step === 2 && formData.role !== 'client')) {
      handleNextStep();
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      navigate(`/dashboard/${formData.role}`);
    }, 2000);
  };

  const isLastStep =
    (formData.role === 'client' && step === 2) ||
    (formData.role !== 'client' && step === 3);

  return (
    <div className="min-h-screen relative flex flex-col pt-20 pb-12 selection:bg-primary-light/30 selection:text-primary-light">
      <Navbar />
      <RegisterBackground />

      <div className="flex-1 max-w-5xl w-full mx-auto px-6 relative z-10 flex flex-col items-center pt-10">

        {/* Header */}
        <div className="text-center mb-10 max-w-2xl">
          <h2 className="text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white tracking-tight">Join the Ecosystem</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
            {t('auth.have_account')}{' '}
            <Link to="/login" className="text-primary-light font-bold hover:underline decoration-2 underline-offset-4">
              {t('auth.submit_login')}
            </Link>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-3xl mb-12 flex items-center justify-center">
          <div className="flex items-center w-full relative before:absolute before:top-1/2 before:-translate-y-1/2 before:h-1 before:w-full before:bg-slate-200 dark:before:bg-slate-800 before:z-0">
            {/* Progress Fill */}
            <div
              className="absolute top-1/2 -translate-y-1/2 h-1 bg-primary-light z-0 transition-all duration-500 ease-out"
              style={{ width: formData.role === 'client' ? (step === 1 ? '0%' : '100%') : (step === 1 ? '0%' : step === 2 ? '50%' : '100%') }}
            />

            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-colors duration-300 border-4 border-white dark:border-slate-950 ${step >= 1 ? 'bg-primary-light text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>1</div>
              <span className="absolute top-12 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Role</span>
            </div>

            <div className="flex-1" />

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-colors duration-300 border-4 border-white dark:border-slate-950 ${step >= 2 ? 'bg-primary-light text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>2</div>
              <span className="absolute top-12 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">Details</span>
            </div>

            {formData.role !== 'client' && (
              <>
                <div className="flex-1" />
                {/* Step 3 */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black transition-colors duration-300 border-4 border-white dark:border-slate-950 ${step >= 3 ? 'bg-primary-light text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>3</div>
                  <span className="absolute top-12 text-xs font-bold text-slate-500 uppercase whitespace-nowrap">KYC</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Form Container */}
        <div
          ref={formRef}
          className="w-full max-w-3xl glass bg-white/60 dark:bg-black/60 rounded-[3rem] shadow-2xl border border-white/40 dark:border-white/10 p-6 sm:p-8 md:p-12 overflow-hidden relative"
        >
          <form onSubmit={handleSubmit}>

            {/* Step 1: Role Selection */}
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">How will you use BodaKitaa?</h3>
                  <p className="text-slate-500 dark:text-slate-400">Select the account type that best fits your needs.</p>
                </div>

                <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-6">
                  <RoleCard
                    role="client"
                    currentRole={formData.role}
                    setRole={(r) => updateForm('role', r)}
                    icon={UserCheck}
                    label="Passenger"
                    desc="I want to request safe, reliable rides."
                  />
                  <RoleCard
                    role="rider"
                    currentRole={formData.role}
                    setRole={(r) => updateForm('role', r)}
                    icon={Bike}
                    label="Rider (Driver)"
                    desc="I want to drive and earn money."
                  />
                  <RoleCard
                    role="owner"
                    currentRole={formData.role}
                    setRole={(r) => updateForm('role', r)}
                    icon={Briefcase}
                    label="Fleet Owner"
                    desc="I want to manage my motorcycles."
                  />
                </div>
              </div>
            )}

            {/* Step 2: Personal Details */}
            {step === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Personal Information</h3>
                  <p className="text-slate-500 dark:text-slate-400">Please provide your basic details to create your account.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormInput icon={User} type="text" placeholder="John Doe" label={t('auth.fullname')} value={formData.fullName} onChange={(v) => updateForm('fullName', v)} required />
                  <FormInput icon={Phone} type="tel" placeholder="+255 7XX XXX XXX" label="Phone Number" value={formData.phone} onChange={(v) => updateForm('phone', v)} required />
                </div>
                <FormInput icon={Mail} type="email" placeholder="name@example.com" label={t('auth.email')} value={formData.email} onChange={(v) => updateForm('email', v)} required />

                <div className="grid md:grid-cols-2 gap-6">
                  <FormInput icon={Lock} type="password" placeholder="••••••••" label={t('auth.password')} value={formData.password} onChange={(v) => updateForm('password', v)} required />
                  <FormInput icon={Lock} type="password" placeholder="••••••••" label="Confirm Password" value={formData.confirmPassword} onChange={(v) => updateForm('confirmPassword', v)} required />
                </div>
              </div>
            )}

            {/* Step 3: KYC / Professional Details (Rider & Owner only) */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Professional Details</h3>
                  <p className="text-slate-500 dark:text-slate-400">We need a few more details to verify your {formData.role} account.</p>
                </div>

                {formData.role === 'rider' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormInput icon={CreditCard} type="text" placeholder="License Number" label="Driving License" value={formData.licenseNumber} onChange={(v) => updateForm('licenseNumber', v)} required />
                      <FormInput icon={MapPin} type="text" placeholder="MC 123 ABC" label="Vehicle Plate Number (Optional)" value={formData.plateNumber} onChange={(v) => updateForm('plateNumber', v)} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <FileUploadField label="Upload ID Card" desc="Front and back of National ID" />
                      <FileUploadField label="Upload License" desc="Clear scan of Driving License" />
                    </div>
                  </div>
                )}

                {formData.role === 'owner' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormInput icon={Building2} type="text" placeholder="Company Name (Optional)" label="Business Name" value={formData.companyName} onChange={(v) => updateForm('companyName', v)} />
                      <FormInput icon={CreditCard} type="text" placeholder="TIN Number" label="Tax ID (TIN)" value={formData.taxId} onChange={(v) => updateForm('taxId', v)} required />
                    </div>
                    <div className="grid md:grid-cols-2 gap-6">
                      <FileUploadField label="National ID" desc="Front and back of Owner ID" />
                      <FileUploadField label="Business Docs" desc="Registration / TIN Certificate" />
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center mt-12 pt-6 border-t border-slate-200 dark:border-white/10">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                >
                  Back
                </button>
              ) : <div />}

              <button
                type="submit"
                disabled={isLoading}
                className="premium-btn bg-primary-light text-white shadow-[0_10px_20px_-10px_rgba(254,119,67,0.5)] hover:shadow-[0_20px_40px_-10px_rgba(254,119,67,0.6)] flex items-center gap-2 px-8 py-4 text-lg ml-auto"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{isLastStep ? t('auth.submit_register') : 'Continue'}</span>
                    {!isLastStep && <ArrowRight size={20} />}
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Security Badges */}
        <div className="mt-12 flex flex-wrap justify-center gap-8 opacity-50 pointer-events-none">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500"><ShieldCheck size={20} /> End-to-end Encrypted</div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500"><CheckCircle2 size={20} /> Verified Partners</div>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500"><Lock size={20} /> Secure Data</div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
