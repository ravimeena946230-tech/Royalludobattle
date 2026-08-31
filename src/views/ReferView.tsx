import React, { useState } from 'react';
import { 
  Gift, 
  Copy, 
  Check, 
  Upload,
  Link as LinkIcon,
  Users, 
  Coins,
  Send,
  MessageCircle
} from 'lucide-react';
import { UserProfile } from '../types';
import { sounds } from '../lib/soundEffects';

interface ReferViewProps {
  user: UserProfile;
}

export const ReferView: React.FC<ReferViewProps> = ({ user }) => {
  const [copied, setCopied] = useState(false);

  // If referral code is alphanumeric or not present, fallback to 6-digit format or user's code
  const referralCode = user.referralCode || '895436';
  const referralLink = `${window.location.origin}/login?refer=${referralCode}`;

  const handleCopy = () => {
    sounds.playClick();
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    sounds.playClick();
    const text = `Play Ludo on Royalludobattle and earn real cash daily! 🎲\nUse my Referral Code: *${referralCode}*\nSign up here: ${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleTelegramShare = () => {
    sounds.playClick();
    const text = `Play Ludo on Royalludobattle and earn real cash daily! 🎲 Use my Referral Code: ${referralCode}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`, '_blank');
  };

  const totalEarnings = user.stats.referralsCount ? (user.stats.referralsCount * 50) : 0;

  return (
    <div className="space-y-4 pb-24 pt-1">
      
      {/* 1. TOP HERO CARD (White card with purple icon & title) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm text-center flex flex-col items-center justify-center space-y-2.5">
        <div className="w-14 h-14 rounded-2xl bg-[#6366f1] flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
          <Gift className="w-7 h-7 stroke-[2.2]" />
        </div>

        <h1 className="text-xl font-black text-[#6366f1] font-['Outfit'] tracking-tight">
          Refer & Earn
        </h1>

        <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
          Invite your friends & earn unlimited referral commission.
        </p>
      </div>

      {/* 2. STATS 2-COLUMN CARDS (Blue: Referred Players, Green: Total Earning) */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Blue Card: Referred Players */}
        <div className="relative p-4 rounded-3xl bg-gradient-to-br from-[#3b82f6] to-[#2563eb] text-white shadow-md shadow-blue-500/20 overflow-hidden flex flex-col justify-between min-h-[110px]">
          {/* Top Row: Icon */}
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
            <Upload className="w-4 h-4" />
          </div>

          {/* Bottom Row: Label & Count */}
          <div className="mt-3 relative z-10">
            <span className="text-[11px] font-semibold text-blue-100 block">Referred Players</span>
            <span className="text-2xl font-black tracking-tight">{user.stats.referralsCount || 0}</span>
          </div>

          {/* Background Watermark Users Icon */}
          <Users className="absolute -right-2 -bottom-2 w-24 h-24 text-white/15 pointer-events-none stroke-[1.2]" />
        </div>

        {/* Green Card: Total Earning */}
        <div className="relative p-4 rounded-3xl bg-gradient-to-br from-[#22c55e] to-[#16a34a] text-white shadow-md shadow-emerald-500/20 overflow-hidden flex flex-col justify-between min-h-[110px]">
          {/* Top Row: Icon */}
          <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white">
            <LinkIcon className="w-4 h-4" />
          </div>

          {/* Bottom Row: Label & Amount */}
          <div className="mt-3 relative z-10">
            <span className="text-[11px] font-semibold text-emerald-100 block">Total Earning</span>
            <span className="text-2xl font-black tracking-tight">₹ {totalEarnings}</span>
          </div>

          {/* Background Watermark Coins Icon */}
          <Coins className="absolute -right-2 -bottom-2 w-24 h-24 text-white/15 pointer-events-none stroke-[1.2]" />
        </div>

      </div>

      {/* 3. YOUR REFERRAL CODE CARD */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3">
        <h2 className="text-sm font-black text-slate-900 tracking-tight">
          Your Referral Code
        </h2>

        {/* Dark Code Box */}
        <div 
          onClick={handleCopy}
          className="p-3.5 rounded-2xl bg-[#0f172a] text-white flex items-center justify-between cursor-pointer hover:bg-slate-900 active:scale-98 transition-all"
        >
          <span className="font-mono font-black text-lg tracking-wider pl-1">
            {referralCode}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white transition-colors"
          >
            {copied ? (
              <Check className="w-5 h-5 text-emerald-400" />
            ) : (
              <Copy className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* WhatsApp & Telegram Share Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={handleWhatsAppShare}
            className="py-3 px-3 rounded-2xl bg-[#22c55e] hover:bg-green-600 text-white font-black text-xs shadow-md shadow-green-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={handleTelegramShare}
            className="py-3 px-3 rounded-2xl bg-[#3b82f6] hover:bg-blue-600 text-white font-black text-xs shadow-md shadow-blue-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Telegram</span>
          </button>
        </div>
      </div>

      {/* 4. HOW IT WORKS CARD */}
      <div className="p-4 rounded-3xl bg-white border border-slate-100 shadow-sm space-y-3.5">
        <h2 className="text-sm font-black text-slate-900 tracking-tight font-['Outfit']">
          How It Works
        </h2>

        <div className="space-y-3 pt-0.5">
          {/* Step 1 */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#6366f1] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              1
            </div>
            <p className="text-xs text-slate-700 font-bold leading-snug">
              Share your referral code with friends on WhatsApp or Telegram.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#6366f1] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              2
            </div>
            <p className="text-xs text-slate-700 font-bold leading-snug">
              They register on Royalludobattle using your code.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#6366f1] text-white font-black text-xs flex items-center justify-center shrink-0 shadow-xs">
              3
            </div>
            <p className="text-xs text-slate-700 font-bold leading-snug">
              You earn 2% unlimited referral commission.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

