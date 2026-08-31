import React, { useState } from 'react';
import { X, Smartphone, ShieldCheck, Zap, ArrowRight, CheckCircle2, Gift } from 'lucide-react';
import { sounds } from '../lib/soundEffects';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (mobile: string, username?: string, referralCode?: string) => void;
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
  const [otpCodePreview, setOtpCodePreview] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mobile.length !== 10) {
      alert('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsSending(true);
    sounds.playClick();

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      setOtpCodePreview(data.code || '123456');
      setStep('OTP');
    } catch {
      setOtpCodePreview('123456');
      setStep('OTP');
    } finally {
      setIsSending(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;

    setIsVerifying(true);
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

      if (res.ok) {
        sounds.playVictory();
        onLoginSuccess(mobile, username || undefined, referralCode || undefined);
        onClose();
      }
    } catch {
      onLoginSuccess(mobile, username || undefined, referralCode || undefined);
      onClose();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleQuickDemo = (demoMobile: string, demoName: string) => {
    sounds.playClick();
    onLoginSuccess(demoMobile, demoName);
    onClose();
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
                  onChange={e => setReferralCode(e.target.value.toUpperCase())}
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
                {otpCodePreview && (
                  <span className="text-xs font-mono font-bold text-indigo-700 bg-white px-2 py-0.5 rounded border mt-1 inline-block">
                    Preview OTP: <strong>{otpCodePreview}</strong>
                  </span>
                )}
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

              <button
                type="button"
                onClick={() => setStep('MOBILE')}
                className="w-full text-center text-[11px] font-bold text-indigo-600 hover:underline"
              >
                Change Mobile Number
              </button>
            </form>
          )}

          {/* Quick Demo Switcher */}
          <div className="pt-3 border-t border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              Quick Test Accounts
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickDemo('9876543210', 'Rajesh Gamer')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-slate-700 font-bold text-left"
              >
                <span className="block text-[11px] text-indigo-900">Player 1</span>
                <span className="text-[9px] text-slate-400">Rajesh (+91 9876543210)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemo('9876543211', 'Priya Pro')}
                className="p-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 text-slate-700 font-bold text-left"
              >
                <span className="block text-[11px] text-emerald-900">Player 2</span>
                <span className="text-[9px] text-slate-400">Priya (+91 9876543211)</span>
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
