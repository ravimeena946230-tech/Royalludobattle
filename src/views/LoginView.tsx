import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Gift, 
  ArrowRight, 
  RotateCcw,
  Lock,
  ChevronLeft
} from 'lucide-react';
import { sounds } from '../lib/soundEffects';
import { UserProfile } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserProfile) => void;
  onBack?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onBack,
}) => {
  const [mobile, setMobile] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [showReferralInput, setShowReferralInput] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [step, setStep] = useState<'MOBILE' | 'OTP'>('MOBILE');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Timer countdown for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === 'OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!agreedToTerms) {
      setError('Please accept terms & conditions to continue');
      return;
    }

    setIsSending(true);
    setError(null);
    sounds.playClick();

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send OTP');
      }
      
      setOtp(['', '', '', '', '', '']);
      setStep('OTP');
      setTimer(30);
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setIsSending(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const paste = e.clipboardData.getData('text').trim();
    if (!/^\d+$/.test(paste)) return;
    e.preventDefault();
    
    const digits = paste.slice(0, 6).split('');
    const newOtp = [...otp];
    for (let i = 0; i < digits.length; i++) {
      newOtp[i] = digits[i];
    }
    setOtp(newOtp);
    
    // Focus the next empty input or the last one
    const focusIndex = Math.min(digits.length, 5);
    const nextInput = document.getElementById(`otp-input-${focusIndex}`);
    nextInput?.focus();
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
    if (fullOtp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifying(true);
    setError(null);
    sounds.playClick();

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          otp: fullOtp,
          username: username.trim() || undefined,
          referralCode: referralCode.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Invalid OTP');
      }

      const data = await res.json();
      if (data.user) {
        sounds.playVictory();
        onLoginSuccess(data.user);
      } else {
        throw new Error('User data not found in response');
      }
    } catch (err: any) {
      setError(err.message || 'Error verifying OTP');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-full pb-24 pt-2 flex flex-col items-center justify-center">
      
      {/* Container Box */}
      <div className="w-full max-w-sm space-y-4">
        
        {/* Back Button (if navigation available) */}
        {onBack && (
          <button
            onClick={() => { sounds.playClick(); onBack(); }}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs cursor-pointer w-fit"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to App</span>
          </button>
        )}

        {/* 1. BRANDING HEADER CARD */}
        <div className="relative overflow-hidden p-6 rounded-3xl bg-gradient-to-b from-[#1c183b] via-[#15122e] to-[#0f0d22] text-white shadow-xl text-center border border-indigo-950/60">
          
          {/* Subtle gold glow behind logo */}
          <div className="w-24 h-24 rounded-full bg-amber-500/10 blur-xl absolute -top-4 left-1/2 -translate-x-1/2 pointer-events-none" />

          {/* Logo with gold border */}
          <div className="relative inline-block mb-3">
            <img 
              src="/src/assets/images/royal_ludo_battle_logo_1788128125893.jpg"
              alt="Royalludobattle Logo"
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-2xl mx-auto object-cover border-2 border-amber-400 shadow-lg shadow-amber-500/20"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 border border-white">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>

          <h1 className="text-xl font-black tracking-tight text-white font-['Outfit'] flex items-center justify-center gap-1.5">
            <span>ROYALLUDOBATTLE</span>
            <span className="text-amber-400">⚡</span>
          </h1>

          <p className="text-[11px] text-amber-300 font-bold uppercase tracking-wider mt-0.5">
            India's #1 Real Cash 1v1 Ludo Arena
          </p>

          <div className="mt-3 flex items-center justify-center gap-2">
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>100% Legal & Safe</span>
            </span>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Instant UPI
            </span>
          </div>

        </div>

        {/* 2. LOGIN FORM CARD */}
        <div className="p-5 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          {step === 'MOBILE' ? (
            <form onSubmit={handleSendOtp} className="space-y-3.5 text-xs">
              
              <div>
                <h2 className="text-sm font-black text-slate-900 font-['Outfit']">
                  Enter Mobile Number
                </h2>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                  We'll send a 6-digit OTP to verify your account
                </p>
              </div>

              {/* Development & Testing Credentials Info Card */}
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-1">
                <span className="font-bold text-[10px] uppercase text-indigo-700 tracking-wider flex items-center gap-1">
                  💡 Testing & Admin Login Guide
                </span>
                <p className="text-[10.5px] text-slate-600 font-medium leading-normal">
                  • Use Mobile: <strong className="text-indigo-950 font-black">9999999999</strong> or <strong className="text-indigo-950 font-black">9462300000</strong>
                  <br />
                  • Enter OTP Code: <strong className="text-indigo-950 font-black">123456</strong>
                </p>
              </div>

              {/* Mobile Number Input */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-slate-700">Mobile Number</label>
                <div className="relative flex items-center bg-slate-50 border-2 border-slate-200 rounded-2xl focus-within:border-indigo-600 focus-within:bg-white transition-all overflow-hidden">
                  <div className="pl-3.5 pr-2.5 py-3 flex items-center gap-1.5 border-r border-slate-200 bg-slate-100/70 text-slate-700 font-black text-xs shrink-0">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    autoFocus
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10 digit number"
                    className="w-full px-3 py-3 font-bold text-sm text-slate-900 bg-transparent focus:outline-none placeholder:text-slate-400"
                  />
                  {mobile.length === 10 && (
                    <div className="pr-3 text-emerald-500">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </div>
              </div>

              {/* Optional Nickname */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-slate-700">
                  Player Nickname <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. MasterLudo"
                  className="w-full px-3.5 py-2.5 font-bold text-xs rounded-2xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              {/* Referral Code Toggle */}
              <div>
                {!showReferralInput ? (
                  <button
                    type="button"
                    onClick={() => setShowReferralInput(true)}
                    className="text-[11px] font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>Have a referral code?</span>
                  </button>
                ) : (
                  <div className="space-y-1">
                    <label className="block text-[11px] font-black text-slate-700 flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5 text-purple-600" />
                      <span>Referral Code</span>
                    </label>
                    <input
                      type="text"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase().trim())}
                      placeholder="ENTER REFERRAL CODE"
                      className="w-full px-3.5 py-2.5 font-black uppercase font-mono text-xs rounded-2xl bg-slate-50 border border-slate-200 text-purple-900 focus:outline-none focus:border-purple-600 focus:bg-white"
                    />
                  </div>
                )}
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 cursor-pointer"
                />
                <label htmlFor="terms" className="text-[10px] text-slate-500 font-medium leading-tight cursor-pointer">
                  I confirm that I am 18+ years of age and agree to the <span className="text-slate-800 font-bold">Terms of Service</span> & <span className="text-slate-800 font-bold">Fair Play Rules</span>.
                </label>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={isSending || mobile.length !== 10 || !agreedToTerms}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isSending ? 'Sending OTP...' : 'Get OTP & Continue'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4 text-xs">
              
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-black text-slate-900 font-['Outfit']">
                    Verify 6-Digit OTP
                  </h2>
                  <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                    Sent to <strong className="text-slate-800">+91 {mobile}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setStep('MOBILE');
                    setOtp(['', '', '', '', '', '']);
                    setError(null);
                  }}
                  className="text-[11px] font-bold text-blue-600 hover:underline cursor-pointer"
                >
                  Edit
                </button>
              </div>

              {/* 6-Digit Box Inputs */}
              <div className="flex items-center justify-between gap-1.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={idx === 0 ? handlePaste : undefined}
                    className="w-11 h-12 text-center text-lg font-mono font-black rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-indigo-600 focus:bg-white text-slate-900 focus:outline-none transition-all shadow-2xs"
                  />
                ))}
              </div>

              {/* Resend Timer */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1">
                <span>Didn't get code?</span>
                {timer > 0 ? (
                  <span className="text-slate-400">Resend in {timer}s</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={isSending}
                    className="text-indigo-600 hover:underline flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Resend OTP</span>
                  </button>
                )}
              </div>

              {/* Verify CTA */}
              <button
                type="submit"
                disabled={isVerifying || otp.join('').length !== 6}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{isVerifying ? 'Verifying...' : 'Verify & Play Now'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </form>
          )}

        </div>

        {/* 3. TRUST & SECURITY BADGES */}
        <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold text-slate-500 pt-1">
          <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% Safe</span>
          </div>

          <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-1">
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Fast UPI</span>
          </div>

          <div className="p-2 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center gap-1">
            <Lock className="w-4 h-4 text-indigo-600" />
            <span>256-bit SSL</span>
          </div>
        </div>

      </div>

    </div>
  );
};
