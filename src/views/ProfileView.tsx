import React, { useState } from 'react';
import { 
  Trophy, 
  Banknote, 
  Gamepad2, 
  Users, 
  History, 
  Gift, 
  Power, 
  PartyPopper, 
  CreditCard, 
  Check, 
  Pencil, 
  ChevronRight,
  X
} from 'lucide-react';
import { UserProfile, ViewType } from '../types';
import { sounds } from '../lib/soundEffects';

interface ProfileViewProps {
  user: UserProfile;
  onUpdateUsername: (newName: string) => void;
  onUpdateMobile?: (newMobile: string) => void;
  onGoToKyc: () => void;
  onNavigate?: (view: ViewType) => void;
  onOpenAuth?: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUsername,
  onUpdateMobile,
  onGoToKyc,
  onNavigate,
  onOpenAuth,
}) => {
  const [username, setUsername] = useState(user.username || 'XotMQ');
  const [mobile, setMobile] = useState(user.mobile || '9929013182');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingMobile, setIsEditingMobile] = useState(false);

  const [referralInput, setReferralInput] = useState('');
  const [referralApplied, setReferralApplied] = useState(false);
  const [referralFeedback, setReferralFeedback] = useState<string | null>(null);

  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemSuccess, setRedeemSuccess] = useState(false);

  const handleSaveUsername = () => {
    if (username.trim()) {
      sounds.playClick();
      onUpdateUsername(username.trim());
      setIsEditingUsername(false);
    }
  };

  const handleSaveMobile = () => {
    if (mobile.trim() && onUpdateMobile) {
      sounds.playClick();
      onUpdateMobile(mobile.trim());
      setIsEditingMobile(false);
    }
  };

  const handleApplyReferral = () => {
    sounds.playClick();
    if (!referralInput.trim()) {
      setReferralFeedback('Please enter a valid code');
      return;
    }
    setReferralApplied(true);
    setReferralFeedback('Referral code applied successfully!');
    setTimeout(() => {
      setReferralFeedback(null);
    }, 3000);
  };

  const handleRedeemEarnings = () => {
    sounds.playCoins();
    setRedeemSuccess(true);
    setTimeout(() => {
      setRedeemSuccess(false);
      setShowRedeemModal(false);
    }, 2000);
  };

  // Extract initial letter for avatar (default 'X')
  const avatarLetter = (username || 'X').charAt(0).toUpperCase();

  const matches = user.matchHistory || [];

  return (
    <div className="space-y-3.5 pb-24 pt-1">
      
      {/* 1. TOP PROFILE HEADER CARD (Dark Midnight Navy Gradient) */}
      <div className="relative p-4 rounded-3xl bg-gradient-to-r from-[#171330] via-[#120f28] to-[#0d0c1e] text-white border border-indigo-950/60 shadow-md">
        
        {/* Top-Right '+91' Indicator Badge */}
        <div className="absolute top-3.5 right-4 flex items-center gap-1 bg-[#090817] text-slate-300 border border-slate-700/40 rounded-full px-2 py-0.5 text-[10px] font-bold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>+91</span>
        </div>

        <div className="flex items-center gap-3.5">
          {/* Avatar Circle with Initial Letter */}
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#9333ea] via-[#c084fc] to-[#f472b6] flex items-center justify-center text-white text-xl font-black shadow-md border-2 border-white/20 shrink-0">
            {avatarLetter}
          </div>

          {/* Right Inputs Area */}
          <div className="flex-1 space-y-2 max-w-[210px]">
            
            {/* Upper Pill: Username */}
            <div className="bg-white rounded-full px-3 py-1.5 flex items-center gap-2 border border-slate-200 shadow-2xs">
              <div 
                onClick={() => setIsEditingUsername(!isEditingUsername)}
                className="w-5 h-5 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center cursor-pointer shrink-0"
              >
                <Pencil className="w-2.5 h-2.5" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onBlur={handleSaveUsername}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveUsername()}
                className="text-xs font-black text-slate-800 bg-transparent focus:outline-none flex-1 truncate"
                placeholder="Username"
              />
            </div>

            {/* Lower Pill: Mobile Number */}
            <div className="bg-white rounded-full px-3 py-1.5 flex items-center justify-between border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1 flex-1">
                <span className="text-xs font-black text-slate-800">+91</span>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  onBlur={handleSaveMobile}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveMobile()}
                  className="text-xs font-black text-slate-800 bg-transparent focus:outline-none flex-1 truncate ml-0.5"
                  placeholder="Mobile number"
                />
              </div>
              <div 
                onClick={() => setIsEditingMobile(!isEditingMobile)}
                className="w-5 h-5 rounded-full bg-[#3b82f6] text-white flex items-center justify-center cursor-pointer shrink-0 ml-1"
              >
                <Pencil className="w-2.5 h-2.5" />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* 2. INVITE & EARN CARD */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-xs space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-black text-sm text-slate-900 font-['Outfit'] flex items-center gap-1.5">
              <span>Invite & Earn</span>
              <span>🎁</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Apply referral & unlock rewards</p>
          </div>

          <div className="w-8 h-8 rounded-xl bg-[#a855f7] text-white flex items-center justify-center shadow-xs">
            <PartyPopper className="w-4 h-4" />
          </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2 bg-[#f1f5f9] rounded-2xl px-3 py-1.5 border border-slate-200/70">
          <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <CreditCard className="w-3.5 h-3.5" />
          </div>

          <input
            type="text"
            value={referralInput}
            onChange={(e) => setReferralInput(e.target.value.toUpperCase())}
            placeholder="Enter referral code"
            className="flex-1 bg-transparent text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none uppercase"
          />

          <button
            onClick={handleApplyReferral}
            disabled={referralApplied}
            className={`w-7 h-7 rounded-xl flex items-center justify-center active:scale-95 transition-all cursor-pointer shadow-xs ${
              referralApplied ? 'bg-emerald-600 text-white' : 'bg-[#22c55e] text-white hover:bg-emerald-600'
            }`}
          >
            <Check className="w-4 h-4 stroke-[3]" />
          </button>
        </div>

        {referralFeedback && (
          <p className="text-[11px] font-bold text-emerald-600 pt-0.5 text-center">
            {referralFeedback}
          </p>
        )}
      </div>

      {/* 3. GAME STATS SECTION */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-black text-sm text-slate-900 font-['Outfit'] flex items-center gap-1.5">
              <span>Game Stats</span>
              <span>🎮</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-medium">Your gaming performance</p>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/70 px-2.5 py-0.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Live Stats</span>
          </div>
        </div>

        {/* 2x2 Grid Cards */}
        <div className="grid grid-cols-2 gap-2.5">
          
          {/* Card 1: Coin Won (Green) */}
          <div className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-tight block mt-2">
              Coin Won
            </span>
            <p className="text-base font-black tracking-tight mt-0.5">
              ₹ {user.stats.totalEarnings ? user.stats.totalEarnings.toFixed(0) : '0'}
            </p>
            {/* Watermark circle */}
            <div className="w-14 h-14 rounded-full bg-white/10 absolute -top-4 -right-4 pointer-events-none" />
          </div>

          {/* Card 2: Coin Loss (Red) */}
          <div className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-r from-[#f43f5e] to-[#e11d48] text-white shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Banknote className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-rose-100 uppercase tracking-tight block mt-2">
              Coin Loss
            </span>
            <p className="text-base font-black tracking-tight mt-0.5">
              ₹ 0
            </p>
            {/* Watermark circle */}
            <div className="w-14 h-14 rounded-full bg-white/10 absolute -top-4 -right-4 pointer-events-none" />
          </div>

          {/* Card 3: Games Played (Blue) */}
          <div className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Gamepad2 className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-blue-100 uppercase tracking-tight block mt-2">
              Games Played
            </span>
            <p className="text-base font-black tracking-tight mt-0.5">
              {user.stats.gamesPlayed || 0}
            </p>
            {/* Watermark circle */}
            <div className="w-14 h-14 rounded-full bg-white/10 absolute -top-4 -right-4 pointer-events-none" />
          </div>

          {/* Card 4: Referral Earn (Purple) */}
          <div className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] text-white shadow-xs">
            <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
              <Users className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="text-[10px] font-bold text-purple-100 uppercase tracking-tight block mt-2">
              Referral Earn
            </span>
            <p className="text-base font-black tracking-tight mt-0.5">
              ₹ 0
            </p>
            {/* Watermark circle */}
            <div className="w-14 h-14 rounded-full bg-white/10 absolute -top-4 -right-4 pointer-events-none" />
          </div>

        </div>
      </div>

      {/* 4. THREE FULL-WIDTH ACTION CARDS */}
      <div className="space-y-2.5 pt-1">
        
        {/* BUTTON 1: History (Light Blue Gradient) */}
        <div
          id="btn-profile-history"
          onClick={() => { sounds.playClick(); setShowHistoryModal(true); }}
          className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] text-white shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-black text-xs tracking-tight">History</h4>
              <p className="text-[10px] text-blue-100 font-medium">Battles & payments</p>
            </div>
          </div>

          {/* Watermark Icon */}
          <History className="w-16 h-16 text-white/15 absolute right-6 -bottom-3 pointer-events-none stroke-[1.2]" />

          <ChevronRight className="w-4 h-4 text-white/80 relative z-10" />
        </div>

        {/* BUTTON 2: Refer Redeem (Purple Gradient) */}
        <div
          id="btn-profile-refer-redeem"
          onClick={() => { sounds.playClick(); setShowRedeemModal(true); }}
          className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-r from-[#a855f7] to-[#8b5cf6] text-white shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Gift className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-black text-xs tracking-tight">Refer Redeem</h4>
              <p className="text-[10px] text-purple-100 font-medium">Move referral earnings to wallet</p>
            </div>
          </div>

          {/* Watermark Icon */}
          <Gift className="w-16 h-16 text-white/15 absolute right-6 -bottom-3 pointer-events-none stroke-[1.2]" />

          <ChevronRight className="w-4 h-4 text-white/80 relative z-10" />
        </div>

        {/* BUTTON 3: Logout (Red Gradient) */}
        <div
          id="btn-profile-logout"
          onClick={() => {
            sounds.playClick();
            if (onNavigate) {
              onNavigate('login');
            } else if (onOpenAuth) {
              onOpenAuth();
            }
          }}
          className="relative overflow-hidden p-3.5 rounded-2xl bg-gradient-to-r from-[#ef4444] to-[#dc2626] text-white shadow-xs flex items-center justify-between cursor-pointer active:scale-98 transition-all"
        >
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
              <Power className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-black text-xs tracking-tight">Logout</h4>
              <p className="text-[10px] text-rose-100 font-medium">Exit from your gaming account</p>
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-white/80 relative z-10" />
        </div>

      </div>

      {/* --- HISTORY MODAL --- */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 border border-slate-100 space-y-3 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm text-slate-900 font-['Outfit'] flex items-center gap-1.5">
                <History className="w-4 h-4 text-blue-600" />
                <span>Battles & Match History</span>
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 text-xs">
              {matches.length === 0 ? (
                <div className="p-6 rounded-2xl bg-slate-50 text-center text-slate-400">
                  No matches played yet. Join a battle!
                </div>
              ) : (
                matches.map((m) => (
                  <div key={m.id} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-800">vs {m.opponentName}</span>
                      <div className="text-[10px] text-slate-400">Room #{m.roomCode} • Stake ₹{m.entryFee}</div>
                    </div>
                    <div className="text-right">
                      <span className={`font-black text-xs ${m.result === 'WON' ? 'text-emerald-600' : 'text-slate-500'}`}>
                        {m.result === 'WON' ? `+₹${m.prizeAmount}` : `-₹${m.entryFee}`}
                      </span>
                      <span className="block text-[9px] font-bold text-slate-400">{m.result}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- REDEEM MODAL --- */}
      {showRedeemModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-5 border border-slate-100 space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mx-auto">
              <Gift className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-black text-base text-slate-900 font-['Outfit']">Referral Earnings</h3>
              <p className="text-xs text-slate-500 mt-1">
                Your available referral commission balance is <strong className="text-purple-600">₹ 0.00</strong>
              </p>
            </div>

            {redeemSuccess ? (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
                Earnings moved to your wallet successfully!
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={handleRedeemEarnings}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-extrabold text-xs shadow-md shadow-purple-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  Transfer to Wallet
                </button>
                <button
                  onClick={() => setShowRedeemModal(false)}
                  className="w-full py-2 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
