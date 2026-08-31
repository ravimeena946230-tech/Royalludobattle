import React, { useState } from 'react';
import { 
  ShieldCheck, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Building2, 
  CreditCard, 
  ArrowRight,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserProfile, KycDetails } from '../types';
import { sounds } from '../lib/soundEffects';

interface KycViewProps {
  user: UserProfile;
  onSubmitKyc: (details: Partial<KycDetails>) => void;
}

export const KycView: React.FC<KycViewProps> = ({ user, onSubmitKyc }) => {
  const [fullName, setFullName] = useState(user.kycDetails?.fullName || user.username);
  const [panNumber, setPanNumber] = useState(user.kycDetails?.panNumber || '');
  const [dob, setDob] = useState(user.kycDetails?.dob || '1998-05-15');
  const [bankAccount, setBankAccount] = useState(user.kycDetails?.bankAccount || '');
  const [ifsc, setIfsc] = useState(user.kycDetails?.ifsc || 'HDFC0001234');
  const [upiId, setUpiId] = useState(user.kycDetails?.upiId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const isVerified = user.kycStatus === 'VERIFIED';
  const isPending = user.kycStatus === 'PENDING';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!panNumber.trim() || panNumber.length !== 10) {
      alert('Please enter a valid 10-character PAN number (e.g. ABCDE1234F)');
      return;
    }

    setIsSubmitting(true);
    sounds.playClick();

    setTimeout(() => {
      onSubmitKyc({
        fullName,
        panNumber: panNumber.toUpperCase(),
        dob,
        bankAccount,
        ifsc: ifsc.toUpperCase(),
        upiId,
      });
      setIsSubmitting(false);
      setSuccessMsg('KYC details submitted successfully for review!');
    }, 600);
  };

  return (
    <div className="space-y-4 pb-20 pt-1">
      
      {/* Header Banner */}
      <div className={`p-5 rounded-3xl text-white shadow-xl ${
        isVerified 
          ? 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 border border-emerald-400/30' 
          : isPending
          ? 'bg-gradient-to-br from-amber-600 via-orange-700 to-amber-900 border border-amber-400/30'
          : 'bg-gradient-to-br from-[#1e1b4b] via-[#312e81] to-[#4338ca] border border-indigo-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
            <h2 className="text-lg font-black tracking-tight font-['Outfit']">KYC Verification</h2>
          </div>
          <span className="text-[10px] font-black uppercase px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md">
            {user.kycStatus}
          </span>
        </div>

        <p className="text-xs text-indigo-100 mt-2 leading-relaxed">
          {isVerified
            ? 'Your account is fully verified! You can deposit and withdraw instantly without restrictions.'
            : isPending
            ? 'Your documents have been submitted and are under 1-minute automated review.'
            : 'Complete quick 1-minute KYC to enable instant bank & UPI cash withdrawals.'}
        </p>
      </div>

      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Form */}
      <div className="p-5 rounded-3xl bg-white border border-indigo-100 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div>
            <label className="block font-bold text-slate-700 mb-1">Full Name (as per PAN Card)</label>
            <input
              type="text"
              required
              disabled={isVerified}
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Rajesh Kumar"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">PAN Card Number</label>
              <input
                type="text"
                required
                maxLength={10}
                disabled={isVerified}
                value={panNumber}
                onChange={e => setPanNumber(e.target.value.toUpperCase())}
                placeholder="ABCDE1234F"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 uppercase font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                disabled={isVerified}
                value={dob}
                onChange={e => setDob(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            <h4 className="font-extrabold text-xs text-slate-900 mb-2 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Bank & UPI Payout Details</span>
            </h4>

            <div className="space-y-2.5">
              <div>
                <label className="block font-bold text-slate-700 mb-1">UPI ID</label>
                <input
                  type="text"
                  disabled={isVerified}
                  value={upiId}
                  onChange={e => setUpiId(e.target.value)}
                  placeholder="e.g. mobile@paytm or name@okhdfcbank"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Bank Account No</label>
                  <input
                    type="text"
                    disabled={isVerified}
                    value={bankAccount}
                    onChange={e => setBankAccount(e.target.value)}
                    placeholder="918273645012"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">IFSC Code</label>
                  <input
                    type="text"
                    disabled={isVerified}
                    value={ifsc}
                    onChange={e => setIfsc(e.target.value.toUpperCase())}
                    placeholder="HDFC0001234"
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 uppercase font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                  />
                </div>
              </div>
            </div>
          </div>

          {!isVerified && (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-3 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span>Submitting KYC Details...</span>
              ) : (
                <>
                  <span>Submit KYC Details</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          )}

        </form>
      </div>

    </div>
  );
};
