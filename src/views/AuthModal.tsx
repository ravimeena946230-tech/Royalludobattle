import React, { useState, useEffect } from 'react';
import { X, Smartphone, ShieldCheck, Zap, ArrowRight, CheckCircle2, Gift } from 'lucide-react';
import { sounds } from '../lib/soundEffects';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [mobile, setMobile] = useState('');
  const [username, setUsername] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'MOBILE' | 'OTP'>('MOBILE');
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timer, setTimer] = useState(30);

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

  if (!isOpen) return null;

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (mobile.length !== 10) {
      setError('Please enter a valid 10-digit mobile number');
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

      setStep('OTP');
      setTimer(30);
    } catch (err: any) {
      setError(err.message || 'Error connecting to server');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
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
          otp,
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
        onClose();
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-indigo-100 flex flex-col">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img 
              src="/src/assets/images/royal_ludo_battle_logo_1788128125893.jpg"
              alt="Royalludobattle"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover border border-white/40 shadow-sm"
            />
            <div>
              <h3 className="font-black text-sm font-['Outfit'] uppercase">Royalludobattle Login</h3>
              <p className="text-[10px] text-amber-100 font-semibold">100% Real Money 2P Battles</p>
            </div>
          </div>

          <button 
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-bold rounded-xl text-center">
              {error}
            </div>
          )}

          {step === 'MOBILE' ? (
            <form onSubmit={handleSendOtp} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Mobile Number</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-500 text-xs">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    required
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 10 digit mobile"
                    className="w-full pl-11 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Player Nickname (Optional)</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="e.g. MasterLudo"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                  <Gift className="w-3.5 h-3.5 text-amber-500" />
                  <span>Referral Code (Optional)</span>
                </label>
                <input
                  type="text"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value.toUpperCase().trim())}
                  placeholder="Enter referral code if any"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSending || mobile.length !== 10}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSending ? 'Sending OTP...' : 'Get OTP & Verify'}
              </button>

            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-3.5 text-xs">
              
              <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-center">
                <span className="text-[10px] text-slate-500 block">OTP sent to +91 {mobile}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border-2 border-slate-200 text-center font-mono font-black text-xl tracking-widest text-indigo-900 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying || otp.length !== 6}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? 'Verifying...' : 'Confirm & Enter App'}
              </button>
              
              <div className="flex items-center justify-between mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('MOBILE');
                    setOtp('');
                    setError(null);
                  }}
                  className="text-center text-[11px] font-bold text-indigo-600 hover:underline"
                >
                  Change Mobile
                </button>
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={timer > 0 || isSending}
                  className="text-center text-[11px] font-bold text-indigo-600 hover:underline disabled:opacity-50 disabled:no-underline"
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
