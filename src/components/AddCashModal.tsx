import React, { useState, useEffect } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  QrCode, 
  Copy, 
  Check, 
  Building2, 
  ExternalLink,
  Clock,
  AlertCircle,
  Smartphone
} from 'lucide-react';
import { sounds } from '../lib/soundEffects';

interface AddCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeposit: (amount: number, method: string) => void;
  currentBalance: number;
  onDepositSubmitted?: () => void;
  userId: string;
}

interface PaymentConfig {
  adminUpiId: string;
  adminUpiName: string;
  adminQrCodeUrl?: string;
  adminBankName: string;
  adminBankAccountName: string;
  adminBankAccountNumber: string;
  adminBankIfsc: string;
  adminBankBranch: string;
  enableUpiDeposit: boolean;
  enableQrDeposit: boolean;
  enableBankDeposit: boolean;
  depositInstructions?: string;
  minDeposit: number;
  maxDeposit: number;
}

const PRESET_AMOUNTS = [50, 100, 200, 500, 1000, 2000];

export const AddCashModal: React.FC<AddCashModalProps> = ({
  isOpen,
  onClose,
  onDeposit,
  currentBalance,
  onDepositSubmitted,
  userId,
}) => {
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState('');
  const [paymentTab, setPaymentTab] = useState<'UPI' | 'QR' | 'BANK' | 'INSTANT'>('UPI');
  const [utrNumber, setUtrNumber] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState<{
    amount: number;
    utr: string;
    method: string;
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const [config, setConfig] = useState<PaymentConfig>({
    adminUpiId: 'roomludo.gaming@okhdfcbank',
    adminUpiName: 'RoomLudo Official India',
    adminQrCodeUrl: '',
    adminBankName: 'HDFC Bank Ltd',
    adminBankAccountName: 'RoomLudo Entertainment Pvt Ltd',
    adminBankAccountNumber: '50200088994321',
    adminBankIfsc: 'HDFC0001234',
    adminBankBranch: 'Cyber Hub Branch, Gurugram',
    enableUpiDeposit: true,
    enableQrDeposit: true,
    enableBankDeposit: true,
    depositInstructions: '1. Pay using UPI / QR / Bank.\n2. Enter 12-digit UTR below.\n3. Balance credited within 1-3 mins after verification.',
    minDeposit: 50,
    maxDeposit: 50000,
  });

  useEffect(() => {
    if (isOpen) {
      setSubmittedSuccess(null);
      setErrorMsg('');
      setUtrNumber('');
      fetch('/api/settings/payment')
        .then(r => r.json())
        .then(data => {
          if (data && data.adminUpiId) {
            setConfig(data);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const finalAmount = customAmount ? Number(customAmount) : selectedAmount;

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    sounds.playClick();
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Generate UPI URI
  const upiUri = `upi://pay?pa=${encodeURIComponent(config.adminUpiId)}&pn=${encodeURIComponent(config.adminUpiName)}&am=${finalAmount}&cu=INR&tn=${encodeURIComponent('RoomLudo Deposit')}`;
  
  // Dynamic QR Code API (high quality, reliable SVG/PNG)
  const dynamicQrUrl = config.adminQrCodeUrl && config.adminQrCodeUrl.trim().length > 0
    ? config.adminQrCodeUrl
    : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiUri)}`;

  const handleSubmitManualDeposit = async () => {
    if (finalAmount < config.minDeposit) {
      setErrorMsg(`Minimum deposit amount is ₹${config.minDeposit}`);
      return;
    }
    if (finalAmount > config.maxDeposit) {
      setErrorMsg(`Maximum deposit amount is ₹${config.maxDeposit}`);
      return;
    }
    if (!utrNumber.trim() || utrNumber.trim().length < 6) {
      setErrorMsg('Please enter valid 12-digit UTR / Reference Transaction Number from your payment app.');
      return;
    }

    setErrorMsg('');
    setIsProcessing(true);
    sounds.playCoins();

    const methodName = paymentTab === 'UPI' ? 'UPI Direct' : paymentTab === 'QR' ? 'QR Code Scan' : 'Bank Transfer';

    try {
      const res = await fetch('/api/wallet/manual-deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          amount: finalAmount,
          paymentMethod: methodName,
          utrNumber: utrNumber.trim().toUpperCase(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit deposit request');
      }

      setSubmittedSuccess({
        amount: finalAmount,
        utr: utrNumber.trim().toUpperCase(),
        method: methodName,
      });

      if (onDepositSubmitted) {
        onDepositSubmitted();
      }
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'Failed to submit deposit request');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleInstantDeposit = () => {
    if (finalAmount < config.minDeposit) {
      setErrorMsg(`Minimum deposit amount is ₹${config.minDeposit}`);
      return;
    }
    setIsProcessing(true);
    sounds.playCoins();

    setTimeout(() => {
      onDeposit(finalAmount, 'Instant Gateway');
      setIsProcessing(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20 shadow-inner">
              <CreditCard className="w-5 h-5 text-emerald-100" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm sm:text-base tracking-tight">Add Cash / Deposit</h3>
              <p className="text-[11px] text-emerald-100/90 font-medium">Instant 24x7 Deposit via UPI, QR & Bank</p>
            </div>
          </div>
          <button 
            id="close-add-cash-modal"
            onClick={() => { sounds.playClick(); onClose(); }}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/25 text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          
          {submittedSuccess ? (
            /* Success Submitted Confirmation Card */
            <div className="space-y-4 py-2 animate-in zoom-in-95 duration-200">
              <div className="p-5 rounded-3xl bg-gradient-to-b from-emerald-50 to-teal-50/50 border border-emerald-200 text-center space-y-3">
                <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-black text-base text-emerald-950">Deposit Request Submitted!</h4>
                  <p className="text-xs text-emerald-700 font-medium mt-0.5">
                    Your payment of <strong className="text-emerald-900 font-black text-sm">₹{submittedSuccess.amount}</strong> is under verification.
                  </p>
                </div>

                <div className="bg-white/90 p-3 rounded-2xl border border-emerald-200/80 text-left space-y-1.5 shadow-xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-medium">Payment Mode:</span>
                    <span className="font-bold text-slate-800">{submittedSuccess.method}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-medium">Submitted UTR / Ref:</span>
                    <span className="font-mono font-black text-emerald-700">{submittedSuccess.utr}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-medium">Status:</span>
                    <span className="inline-flex items-center gap-1 font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                      <Clock className="w-3 h-3 animate-spin" /> Pending Approval (1-3 mins)
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-slate-600 bg-emerald-100/50 p-2.5 rounded-xl border border-emerald-200/50 flex items-start gap-2 text-left">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Admin team is verifying your payment UTR. You will receive an instant notification once your deposit balance is credited.</span>
                </div>
              </div>

              <button
                onClick={() => { sounds.playClick(); onClose(); }}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/30 transition-all"
              >
                Back to Lobby
              </button>
            </div>
          ) : (
            <>
              {/* Current Balance Banner */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/80 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-800">Current Deposit Wallet</span>
                  <p className="text-[10px] text-slate-500">Available to join rooms & battles</p>
                </div>
                <span className="font-black text-emerald-700 text-base">₹{currentBalance.toFixed(2)}</span>
              </div>

              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">1. Select Deposit Amount</label>
                <div className="grid grid-cols-3 gap-2">
                  {PRESET_AMOUNTS.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => {
                        sounds.playClick();
                        setSelectedAmount(amt);
                        setCustomAmount('');
                      }}
                      className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                        !customAmount && selectedAmount === amt
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/30 scale-[1.02]'
                          : 'bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      ₹{amt}
                    </button>
                  ))}
                </div>

                <div className="mt-2 relative">
                  <span className="absolute left-3 top-2.5 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setSelectedAmount(0);
                    }}
                    placeholder="Enter custom amount (e.g. 350)"
                    className="w-full pl-7 pr-3 py-2 text-xs font-bold rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Payment Mode Selector Tabs */}
              <div>
                <label className="block text-xs font-black text-slate-800 mb-2">2. Choose Payment Method</label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                  <button
                    onClick={() => { sounds.playClick(); setPaymentTab('UPI'); }}
                    className={`py-2 px-1 rounded-xl font-black text-[11px] flex items-center justify-center gap-1.5 transition-all ${
                      paymentTab === 'UPI'
                        ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>UPI ID</span>
                  </button>

                  <button
                    onClick={() => { sounds.playClick(); setPaymentTab('QR'); }}
                    className={`py-2 px-1 rounded-xl font-black text-[11px] flex items-center justify-center gap-1.5 transition-all ${
                      paymentTab === 'QR'
                        ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Scan QR</span>
                  </button>

                  <button
                    onClick={() => { sounds.playClick(); setPaymentTab('BANK'); }}
                    className={`py-2 px-1 rounded-xl font-black text-[11px] flex items-center justify-center gap-1.5 transition-all ${
                      paymentTab === 'BANK'
                        ? 'bg-white text-emerald-700 shadow-xs border border-emerald-200 font-extrabold'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Bank A/C</span>
                  </button>
                </div>
              </div>

              {/* Tab 1: UPI Direct Details */}
              {paymentTab === 'UPI' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 space-y-3 animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Admin Official UPI ID</span>
                      <p className="font-extrabold text-xs text-slate-800">{config.adminUpiName}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-900 text-[10px] font-black">24x7 Active</span>
                  </div>

                  {/* UPI Box with Copy Button */}
                  <div className="flex items-center gap-2 p-2 bg-white rounded-xl border border-emerald-300 shadow-inner">
                    <span className="font-mono font-bold text-xs text-emerald-950 flex-1 truncate px-1">
                      {config.adminUpiId}
                    </span>
                    <button
                      onClick={() => handleCopy(config.adminUpiId, 'upi')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1 transition-all ${
                        copiedField === 'upi'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                      }`}
                    >
                      {copiedField === 'upi' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedField === 'upi' ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Quick Direct Pay Links */}
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-semibold text-slate-500">Or Pay directly in your UPI App:</p>
                    <div className="grid grid-cols-3 gap-1.5">
                      <a
                        href={upiUri}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 font-bold text-[10px] text-slate-700 flex items-center justify-center gap-1 shadow-xs"
                      >
                        <span>GPay / PhonePe</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                      <a
                        href={upiUri}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 font-bold text-[10px] text-slate-700 flex items-center justify-center gap-1 shadow-xs"
                      >
                        <span>Paytm UPI</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                      <a
                        href={upiUri}
                        target="_blank"
                        rel="noreferrer"
                        className="py-1.5 px-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 font-bold text-[10px] text-slate-700 flex items-center justify-center gap-1 shadow-xs"
                      >
                        <span>BHIM / Cred</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Dynamic QR Code */}
              {paymentTab === 'QR' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 flex flex-col items-center text-center space-y-2.5 animate-in fade-in-50 duration-150">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-950">
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    <span>Scan & Pay ₹{finalAmount}</span>
                  </div>
                  
                  {/* Dynamic QR Code Box */}
                  <div className="relative p-2.5 bg-white rounded-2xl border-2 border-emerald-500 shadow-md">
                    <img 
                      src={dynamicQrUrl} 
                      alt="RoomLudo Admin QR Code" 
                      className="w-44 h-44 object-contain rounded-lg"
                    />
                    <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 bg-emerald-700 text-white font-black text-[10px] px-2.5 py-0.5 rounded-full shadow-sm">
                      Amount: ₹{finalAmount}
                    </div>
                  </div>

                  <p className="text-[10px] text-slate-600 font-medium pt-1">
                    Scan using Google Pay, PhonePe, Paytm, BHIM, Cred or Any UPI App.
                  </p>
                </div>
              )}

              {/* Tab 3: Bank Account Transfer */}
              {paymentTab === 'BANK' && (
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 space-y-2.5 animate-in fade-in-50 duration-150">
                  <div className="flex items-center justify-between pb-1 border-b border-emerald-200">
                    <span className="font-extrabold text-xs text-emerald-950">{config.adminBankName}</span>
                    <span className="text-[10px] bg-emerald-200/80 text-emerald-900 font-bold px-1.5 py-0.5 rounded-md">IMPS / NEFT</span>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400">Account Holder</p>
                        <p className="font-bold text-xs text-slate-800">{config.adminBankAccountName}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400">Account Number</p>
                        <p className="font-mono font-black text-xs text-emerald-900">{config.adminBankAccountNumber}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(config.adminBankAccountNumber, 'acc')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center gap-1"
                      >
                        {copiedField === 'acc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'acc' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-[9px] uppercase font-bold text-slate-400">IFSC Code</p>
                        <p className="font-mono font-black text-xs text-emerald-900">{config.adminBankIfsc}</p>
                      </div>
                      <button
                        onClick={() => handleCopy(config.adminBankIfsc, 'ifsc')}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] flex items-center gap-1"
                      >
                        {copiedField === 'ifsc' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedField === 'ifsc' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>

                    {config.adminBankBranch && (
                      <div className="text-[10px] text-slate-500 font-medium px-1">
                        Branch: {config.adminBankBranch}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Enter UTR / Ref Number */}
              <div className="space-y-1.5">
                <label className="block text-xs font-black text-slate-800">
                  3. Enter 12-Digit UTR / Transaction Reference ID <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={utrNumber}
                    onChange={(e) => {
                      setUtrNumber(e.target.value);
                      setErrorMsg('');
                    }}
                    placeholder="e.g. 424198273612 or UPI Ref No"
                    className="w-full px-3 py-2.5 text-xs font-mono font-bold uppercase rounded-xl bg-slate-50 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 tracking-wider"
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  Find the 12-digit UTR/Ref number in your GPay / PhonePe / Paytm transaction receipt.
                </p>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[11px] font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Trust Badge */}
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Safe & Verified 256-Bit Encrypted Payments</span>
              </div>

              {/* Submit Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  id="submit-manual-deposit-btn"
                  onClick={handleSubmitManualDeposit}
                  disabled={isProcessing || finalAmount <= 0}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider shadow-lg shadow-emerald-600/30 active:scale-98 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Submitting Request...</span>
                  ) : (
                    <>
                      <span>Submit Deposit Request (₹{finalAmount})</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Instant Sandbox Add for Fast Demo */}
                <button
                  onClick={handleInstantDeposit}
                  className="w-full py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-[10px] flex items-center justify-center gap-1 transition-all"
                >
                  <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                  <span>Test Mode: 1-Click Instant Add ₹{finalAmount}</span>
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};
