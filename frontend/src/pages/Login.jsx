import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api from '../services/api';
import OtpVerificationModal from './OtpVerificationModal';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Fingerprint,
  Key,
  X,
  Check,
} from 'lucide-react';

export default function Login() {
  const [activeTab, setActiveTab] = useState('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberDevice, setRememberDevice] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showOtpModal, setShowOtpModal] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState('');
  const [devOtp, setDevOtp] = useState('');

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState('email');
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotSubmitting, setForgotSubmitting] = useState(false);
  const [forgotDevOtp, setForgotDevOtp] = useState('');

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email.trim()) {
      newErrors.email = 'Work email address is required.';
    } else if (!emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid work email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
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
      await login(email, password, rememberDevice);
      addToast('Signed in successfully! Welcome back.', 'success');
      navigate('/dashboard');
    } catch (err) {
      const respData = err.response?.data;
      if (err.response?.status === 403 && respData?.detail?.requires_verification) {
        setUnverifiedEmail(respData.detail.email);
        setDevOtp(respData.detail.dev_otp || '');
        setShowOtpModal(true);
        addToast('Verification code dispatched to your work email.', 'info');
      } else {
        const message =
          typeof respData?.detail === 'string'
            ? respData.detail
            : 'Invalid work email address or password.';
        setErrors({ general: message });
        addToast(message, 'error');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenForgotModal = () => {
    setForgotEmail(email || '');
    setForgotStep('email');
    setForgotOtp('');
    setForgotNewPassword('');
    setShowForgotModal(true);
  };

  const handleSendForgotOtp = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      addToast('Please enter your work email.', 'error');
      return;
    }
    setForgotSubmitting(true);
    try {
      const res = await api.post('/api/auth/forgot-password', { email: forgotEmail });
      addToast(res.data.message || 'Reset code sent to your email.', 'success');
      if (res.data.dev_otp) {
        setForgotDevOtp(res.data.dev_otp);
      }
      setForgotStep('otp');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to dispatch reset code.';
      addToast(msg, 'error');
    } finally {
      setForgotSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotOtp.trim() || !forgotNewPassword) {
      addToast('Please provide both the 6-digit code and a new password.', 'error');
      return;
    }
    if (forgotNewPassword.length < 8) {
      addToast('Password must be at least 8 characters long.', 'error');
      return;
    }
    setForgotSubmitting(true);
    try {
      const res = await api.post('/api/auth/reset-password', {
        email: forgotEmail,
        otp: forgotOtp,
        new_password: forgotNewPassword,
      });
      addToast(res.data.message || 'Password reset successfully! Please sign in.', 'success');
      setShowForgotModal(false);
      setPassword(forgotNewPassword);
      setEmail(forgotEmail);
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to reset password.';
      addToast(msg, 'error');
    } finally {
      setForgotSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-50 text-slate-800 font-sans">
      <section className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#12163A] via-[#0E122C] to-[#0A0D22] text-white p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-center justify-between z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[10.5px] font-bold tracking-wider uppercase text-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22D3EE]"></span>
            TRUSTED BY 4,000+ LEADING ENTERPRISES
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            <CheckCircle size={14} className="text-cyan-400" /> SOC2 Type II Certified
          </span>
        </div>

        <div className="my-auto py-10 max-w-lg z-10">
          <p className="text-xs font-extrabold tracking-widest text-indigo-400 uppercase mb-3">
            ENTERPRISE PEOPLE OPERATIONS
          </p>
          <h1 className="text-4xl font-extrabold text-white leading-tight tracking-tight mb-4">
            Empower your workforce with intelligent HR automation.
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-8">
            Unified global payroll, compliance intelligence, and automated talent
            lifecycles engineered for high-velocity teams.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-2xl font-extrabold text-white block">99.99%</span>
              <span className="text-xs text-slate-400">Platform Uptime SLA</span>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
              <span className="text-2xl font-extrabold text-white block">140+</span>
              <span className="text-xs text-slate-400">Supported Currencies</span>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center gap-2 text-amber-400 text-xs mb-2">
              <span>★★★★★</span>
              <span className="text-slate-400 font-semibold">5.0 CSAT Rating</span>
            </div>
            <p className="text-xs text-slate-200 italic leading-relaxed mb-3">
              “NexusHR reduced our onboarding cycle from 14 days to 48 hours across
              28 countries. The administrative clarity and precision are unmatched.”
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white">Elena Rostova</p>
                <p className="text-[11px] text-slate-400">VP of People & Culture, TechScale Global</p>
              </div>
              <span className="text-[10px] font-bold bg-white/10 px-2 py-0.5 rounded text-slate-300">
                TECHSCALE
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

          <div className="mb-6">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Welcome back</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sign in to access your enterprise workforce portal
            </p>
          </div>
          <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'email' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('email')}
            >
              Work Email
            </button>
            <button
              type="button"
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'sso' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              onClick={() => setActiveTab('sso')}
            >
              SSO / Identity Provider
            </button>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label htmlFor="login-email" className="block text-xs font-bold text-slate-700 mb-1.5">
                Work Email Address
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="login-email"
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
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login-password" className="block text-xs font-bold text-slate-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleOpenForgotModal}
                  className="text-[11px] font-semibold text-indigo-600 hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 accent-indigo-600"
                />
                <span className="text-slate-600 font-medium">Remember device for 30 days</span>
              </label>

              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400">
                <ShieldCheck size={13} /> MFA enforced
              </span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                'Signing in...'
              ) : (
                <>
                  <span>Sign In to NexusHR</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <span className="relative px-3 bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              OR CONTINUE WITH ENTERPRISE ID
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <button
              type="button"
              className="py-2 px-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              onClick={() => addToast('Google Enterprise SSO simulated.', 'info')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24">
                <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.8z" />
                <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15s.7 5.3 1.9 7.7l3.7-2.9z" />
                <path fill="#34A853" d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z" />
              </svg>
              <span>Google</span>
            </button>

            <button
              type="button"
              className="py-2 px-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              onClick={() => addToast('Azure AD simulated.', 'info')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#0078D4">
                <path d="M1 1h10v10H1zM13 1h10v10H13zM1 13h10v10H1zM13 13h10v10H13z" />
              </svg>
              <span>Azure AD</span>
            </button>

            <button
              type="button"
              className="py-2 px-3 border border-slate-200 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
              onClick={() => addToast('Okta simulated.', 'info')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="#00297A">
                <circle cx="12" cy="12" r="10" stroke="#00297A" strokeWidth="2" fill="none" />
                <circle cx="12" cy="12" r="5" fill="#00297A" />
              </svg>
              <span>Okta</span>
            </button>
          </div>

          <div className="mt-8 text-center text-xs text-slate-500">
            <span>New enterprise client? </span>
            <Link to="/signup" className="font-bold text-indigo-600 hover:underline">
              Request demo or start trial
            </Link>
          </div>
        </div>
      </main>
      {showOtpModal && (
        <OtpVerificationModal
          email={unverifiedEmail}
          devOtp={devOtp}
          onClose={() => setShowOtpModal(false)}
          onSuccess={() => {
            setShowOtpModal(false);
            navigate('/dashboard');
          }}
        />
      )}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Key size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Reset Your Password</h3>
                  <p className="text-[11px] text-slate-500">Secure enterprise verification</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {forgotStep === 'email' ? (
              <form onSubmit={handleSendForgotOtp} className="space-y-4 pt-4">
                <p className="text-xs text-slate-600">
                  Enter your registered work email. We will send a secure 6-digit verification code to reset your password.
                </p>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
                  <input
                    type="email"
                    required
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotSubmitting}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                  >
                    {forgotSubmitting ? 'Sending Code...' : 'Send Verification Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 pt-4">
                <p className="text-xs text-slate-600">
                  Verification code sent to <span className="font-bold text-slate-900">{forgotEmail}</span>. Enter the code and choose a new password.
                </p>

                {forgotDevOtp && (
                  <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-200 text-center">
                    <span className="text-[11px] text-indigo-700 font-bold">
                      Your verification code is: <span className="font-mono text-sm tracking-wider">{forgotDevOtp}</span>
                    </span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">6-Digit Code</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={forgotOtp}
                    onChange={(e) => setForgotOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                  <input
                    type="password"
                    required
                    value={forgotNewPassword}
                    onChange={(e) => setForgotNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep('email')}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    ← Back
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(false)}
                      className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={forgotSubmitting}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                    >
                      {forgotSubmitting ? 'Resetting...' : 'Set New Password'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
