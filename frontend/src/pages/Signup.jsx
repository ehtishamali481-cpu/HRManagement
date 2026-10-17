import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import OtpVerificationModal from './OtpVerificationModal';
import {
  Building2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Crown,
} from 'lucide-react';

export default function Signup() {
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpEmail, setOtpEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!companyName.trim()) {
      newErrors.companyName = 'Company name is required.';
    } else if (companyName.trim().length < 2) {
      newErrors.companyName = 'Company name must be at least 2 characters.';
    }

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required.';
    } else if (fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters.';
    }

    if (!email.trim()) {
      newErrors.email = 'Work email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please provide a valid work email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters.';
    } else if (!/\d/.test(password)) {
      newErrors.password = 'Password must include at least one number.';
    } else if (!/[a-zA-Z]/.test(password)) {
      newErrors.password = 'Password must include at least one letter.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setErrors({});

    try {
      const data = await signup(companyName, fullName, email, password);
      setOtpEmail(email);
      setDevOtp(data.dev_otp || '');
      setShowOtpModal(true);
      addToast('Verification code dispatched to your work email.', 'info');
    } catch (err) {
      const message =
        err.response?.data?.detail || 'Registration failed. Please verify your details.';
      setErrors({ general: message });
      addToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 text-slate-800 font-sans">
      <section className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#12163A] via-[#0E122C] to-[#0A0D22] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10.5px] font-bold tracking-wider uppercase text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE]"></span>
            MULTI-TENANT WORKFORCE CLOUD
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <CheckCircle size={14} className="text-cyan-400" /> SOC2 Type II Certified
          </span>
        </div>

        <div className="my-auto py-10 max-w-lg z-10">
          <p className="text-xs font-extrabold tracking-widest text-indigo-400 uppercase mb-3">
            ENTERPRISE ONBOARDING
          </p>
          <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Deploy your dedicated company portal in minutes.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            Sign up as Tenant Owner to access segregated organizational payroll,
            talent lifecycles, and automated compliance governance.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-2xl font-extrabold text-white block">100%</span>
              <span className="text-xs text-slate-400">Tenant Data Isolation</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-2xl font-extrabold text-white block">Instant</span>
              <span className="text-xs text-slate-400">OTP Identity Verification</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-amber-400 text-xs mb-2">
              <span>★★★★★</span>
              <span className="text-slate-400 font-semibold">Enterprise SLA</span>
            </div>
            <p className="text-xs text-slate-200 italic leading-relaxed mb-3">
              “Setting up our organization on NexusHR gave us complete administrative
              isolation and military-grade security right out of the box.”
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">David Chen</p>
                <p className="text-[11px] text-slate-400">Chief Information Officer, FinFlow Inc.</p>
              </div>
              <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded text-slate-300">
                FINFLOW
              </span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs font-mono font-semibold text-slate-400 tracking-wider z-10">
          <span>FINFLOW</span>
          <span>VANGUARD LABS</span>
          <span>KROMA CLOUD</span>
          <span>AETHEL METRICS</span>
        </div>
      </section>
      <main className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#4F46E5" />
                  <path d="M2 17L12 22L22 17" stroke="#4F46E5" strokeWidth="2.5" strokeLinecap="round" />
                  <path d="M2 12L12 17L22 12" stroke="#818CF8" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <span className="text-base font-extrabold text-slate-900 leading-none block">NexusHR</span>
                <span className="text-[9.5px] font-bold text-slate-400 tracking-wider uppercase">
                  WORKFORCE CORE
                </span>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold border border-slate-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> US-East Production
            </span>
          </div>

          <div className="mb-5">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Create enterprise portal</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Set up your company workspace. You will be assigned as <strong>Tenant Owner</strong>.
            </p>
          </div>

          <div className="mb-5 p-2.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-xs text-amber-800 font-medium">
            <Crown size={15} className="text-amber-600 shrink-0" />
            <span>Default Administrator Role: <strong>Company Owner</strong></span>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="company-name" className="block text-xs font-bold text-slate-700 mb-1.5">
                Company / Organization Name
              </label>
              <div className="relative">
                <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="company-name"
                  type="text"
                  placeholder="e.g. TechScale Innovations"
                  value={companyName}
                  onChange={(e) => {
                    setCompanyName(e.target.value);
                    if (errors.companyName) setErrors((prev) => ({ ...prev, companyName: '' }));
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all ${
                    errors.companyName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.companyName && <p className="text-[11px] font-semibold text-rose-600 mt-1">{errors.companyName}</p>}
            </div>

            <div>
              <label htmlFor="full-name" className="block text-xs font-bold text-slate-700 mb-1.5">
                Your Full Name
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="full-name"
                  type="text"
                  placeholder="e.g. Alex Morgan"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    if (errors.fullName) setErrors((prev) => ({ ...prev, fullName: '' }));
                  }}
                  autoComplete="name"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all ${
                    errors.fullName ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.fullName && <p className="text-[11px] font-semibold text-rose-600 mt-1">{errors.fullName}</p>}
            </div>

            <div>
              <label htmlFor="signup-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="signup-email"
                  type="email"
                  placeholder="alex@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  autoComplete="email"
                  className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all ${
                    errors.email ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
              </div>
              {errors.email && <p className="text-[11px] font-semibold text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="signup-password" className="block text-xs font-bold text-slate-700 mb-1.5">
                Secure Password
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="signup-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min. 8 chars with letter & number"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  autoComplete="new-password"
                  className={`w-full pl-10 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all ${
                    errors.password ? 'border-rose-400 bg-rose-50/50' : 'border-slate-200'
                  }`}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-[11px] font-semibold text-rose-600 mt-1">{errors.password}</p>}
            </div>

            <div className="flex items-start gap-2 text-[11.5px] text-slate-500 pt-1">
              <ShieldCheck size={14} className="text-indigo-600 shrink-0 mt-0.5" />
              <span>By continuing, you agree to 256-bit email OTP verification to protect company assets.</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                'Creating Organization...'
              ) : (
                <>
                  <span>Create Account & Send OTP</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-xs text-slate-500">
            <span>Already an enterprise client? </span>
            <Link to="/login" className="font-bold text-indigo-600 hover:underline">
              Sign in to NexusHR
            </Link>
          </div>
        </div>
      </main>
      {showOtpModal && (
        <OtpVerificationModal
          email={otpEmail}
          devOtp={devOtp}
          onClose={() => setShowOtpModal(false)}
          onSuccess={() => {
            setShowOtpModal(false);
            navigate('/dashboard');
          }}
        />
      )}
    </div>
  );
}
