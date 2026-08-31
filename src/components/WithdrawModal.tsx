import React, { useState } from 'react';
import { X, ArrowUpRight, ShieldAlert, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { UserProfile } from '../types';
import { sounds } from '../lib/soundEffects';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWithdraw: (amount: number, upiOrBank: string) => void;
  user: UserProfile;
  onGoToKyc: () => void;
}

export const WithdrawModal: React.FC<WithdrawModalProps> = ({
  isOpen,
  onClose,
  onWithdraw,
  user,
  onGoToKyc,
}) => {
  const [amount, setAmount] = useState('');
  const [withdrawType, setWithdrawType] = useState<'UPI' | 'BANK'>('UPI');
  const [upiId, setUpiId] = useState(user.kycDetails?.upiId || '');
  const [bankAccount, setBankAccount] = useState(user.kycDetails?.bankAccount || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const isKycVerified = user.kycStatus === 'VERIFIED';
  const winnings = user.wallet.winnings;

  const handleWithdraw = () => {
    setErrorMsg('');
    const amt = Number(amount);

    if (!isKycVerified) {
      setErrorMsg('KYC verification is mandatory before initiating withdrawals.');
      return;
    }

    if (isNaN(amt) || amt < 50) {
      setErrorMsg('Minimum withdrawal amount is ₹50.');
      return;
    }

    if (amt > winnings) {
      setErrorMsg(`Insufficient winnings balance. You can withdraw up to ₹${winnings.toFixed(2)}.`);
      return;
    }

    const destination = withdrawType === 'UPI' ? `UPI: ${upiId}` : `Bank Acc: ${bankAccount}`;
    if (withdrawType === 'UPI' && !upiId.includes('@')) {
      setErrorMsg('Please enter a valid UPI ID (e.g. mobile@upi).');
      return;
    }
    if (withdrawType === 'BANK' && bankAccount.length < 8) {
      setErrorMsg('Please enter a valid Bank Account Number.');
      return;
    }

    setIsSubmitting(true);
    sounds.playCoins();

    setTimeout(() => {
      onWithdraw(amt, destination);
      setIsSubmitting(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-indigo-100 flex flex-col">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-indigo-700 to-purple-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-5 h-5 text-amber-300" />
            <h3 className="font-bold text-sm">Instant Cash Withdrawal</h3>
          </div>
          <button 
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-1 rounded-xl bg-white/10 hover:bg-white/20 text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          
          {/* Winnings card */}
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-between text-xs">
            <div>
              <span className="text-[10px] text-indigo-700 uppercase font-bold">Withdrawable Winnings</span>
              <p className="text-base font-black text-indigo-900">₹{winnings.toFixed(2)}</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
              Min ₹50
            </span>
          </div>

          {/* KYC Alert if not verified */}
          {!isKycVerified ? (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-900">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>KYC Verification Required</span>
              </div>
              <p className="text-[11px] text-amber-800">
                In compliance with government regulations, please verify your PAN & Bank account to withdraw.
              </p>
              <button
                onClick={() => { sounds.playClick(); onGoToKyc(); onClose(); }}
                className="w-full py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs"
              >
                Complete KYC Now (1 Min)
              </button>
            </div>
          ) : (
            <>
              {/* Amount input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Withdrawal Amount (₹)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-500 text-xs">₹</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Enter amount (Min ₹50)"
                    className="w-full pl-7 pr-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Payout Destination */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Transfer To</label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    onClick={() => { sounds.playClick(); setWithdrawType('UPI'); }}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      withdrawType === 'UPI'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    UPI ID
                  </button>
                  <button
                    onClick={() => { sounds.playClick(); setWithdrawType('BANK'); }}
                    className={`py-1.5 rounded-xl text-xs font-bold border transition-all ${
                      withdrawType === 'BANK'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-slate-50 text-slate-700 border-slate-200'
                    }`}
                  >
                    Bank Account
                  </button>
                </div>

                {withdrawType === 'UPI' ? (
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. 9876543210@paytm or name@okhdfcbank"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                ) : (
                  <input
                    type="text"
                    value={bankAccount}
                    onChange={(e) => setBankAccount(e.target.value)}
                    placeholder="Enter Bank Account Number"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                )}
              </div>
            </>
          )}

          {errorMsg && (
            <p className="text-xs font-semibold text-rose-600 bg-rose-50 p-2 rounded-xl border border-rose-200">
              {errorMsg}
            </p>
          )}

          {/* Submit */}
          {isKycVerified && (
            <button
              onClick={handleWithdraw}
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-indigo-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Initiating Bank Payout...</span>
              ) : (
                <span>Withdraw ₹{amount || '0'} Instantly</span>
              )}
            </button>
          )}

        </div>
      </div>
    </div>
  );
};
