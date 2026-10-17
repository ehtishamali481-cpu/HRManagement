import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { ShieldCheck, ArrowRight, RefreshCw, X } from 'lucide-react';

export default function OtpVerificationModal({ email, devOtp, onClose, onSuccess }) {
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState('');
  const [currentDevOtp, setCurrentDevOtp] = useState(devOtp || '');
  
  const inputRefs = useRef([]);
  const { verifyOtp, resendOtp } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    
    const newDigits = [...digits];
    newDigits[index] = value.slice(-1);
    setDigits(newDigits);
    setError('');

    if (value && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    if (newDigits.every((d) => d !== '') && index === 5) {
      handleVerify(newDigits.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const splitDigits = pasted.split('');
      setDigits(splitDigits);
      setError('');
      if (inputRefs.current[5]) {
        inputRefs.current[5].focus();
      }
      handleVerify(pasted);
    }
  };

  const handleVerify = async (codeToVerify) => {
    const code = codeToVerify || digits.join('');
    if (code.length !== 6) {
      setError('Please enter all 6 digits.');
      return;
    }

    setIsSubmitting(true);
    setError('');
    try {
      await verifyOtp(email, code);
      addToast('Email verified successfully! Welcome to your workspace.', 'success');
      if (onSuccess) {
        onSuccess();
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Verification code is invalid or expired.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending) return;
    setIsResending(true);
    setError('');
    try {
      const res = await resendOtp(email);
      setTimer(60);
      if (res.dev_otp) {
        setCurrentDevOtp(res.dev_otp);
      }
      addToast('A new 6-digit code has been sent.', 'info');
    } catch (err) {
      const detail = err.response?.data?.detail;
      const msg = typeof detail === 'string' ? detail : 'Failed to resend code. Please try again.';
      setError(msg);
      addToast(msg, 'error');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-sm sm:max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center relative animate-fade-in">
        {onClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        )}

        <div className="w-14 h-14 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-4 ring-8 ring-indigo-50/50">
          <ShieldCheck size={28} />
        </div>

        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Verify Work Email
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 mb-5 leading-relaxed">
          Enter the 6-digit security code sent to <br />
          <strong className="text-slate-800">{email}</strong>
        </p>

        {currentDevOtp && (
          <div className="mb-5 p-2.5 bg-emerald-50 border border-dashed border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-800">
            <span>Dev OTP: <strong>{currentDevOtp}</strong></span>
            <button
              type="button"
              onClick={() => {
                const arr = currentDevOtp.split('');
                setDigits(arr);
                handleVerify(currentDevOtp);
              }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-md transition-all cursor-pointer"
            >
              Autofill & Submit
            </button>
          </div>
        )}

        <div className="flex justify-center gap-2 sm:gap-2.5 mb-4" onPaste={handlePaste}>
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-10 sm:w-12 h-13 sm:h-14 text-center text-xl sm:text-2xl font-mono font-extrabold rounded-xl border bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 focus:bg-white transition-all ${
                error ? 'border-rose-400 bg-rose-50/50 text-rose-700' : 'border-slate-300'
              }`}
              autoComplete="one-time-code"
            />
          ))}
        </div>

        {error && <p className="text-xs font-semibold text-rose-600 mb-4">{error}</p>}

        <button
          type="button"
          onClick={() => handleVerify()}
          disabled={isSubmitting || digits.some((d) => !d)}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        >
          {isSubmitting ? 'Verifying...' : 'Verify & Continue'}
          {!isSubmitting && <ArrowRight size={16} />}
        </button>

        <div className="text-xs text-slate-500">
          {timer > 0 ? (
            <span className="font-semibold text-slate-400">Resend code in {timer}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="text-indigo-600 hover:text-indigo-700 font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={isResending ? 'animate-spin' : ''} />
              <span>{isResending ? 'Sending...' : 'Resend verification code'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
