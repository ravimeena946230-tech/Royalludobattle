import React, { useState } from 'react';
import { 
  Megaphone, 
  MessageCircle, 
  Swords,
  Download,
  Smartphone,
  ShieldCheck 
} from 'lucide-react';
import { UserProfile, ViewType } from '../types';
import { sounds } from '../lib/soundEffects';

interface HomeViewProps {
  user: UserProfile;
  onNavigate: (view: ViewType) => void;
  onCreateRoom: (entryFee: number) => void;
  onJoinRoom: (code: string) => void;
  onPracticeMatch: () => void;
  onOpenAddCash: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  onNavigate,
}) => {
  const [downloading, setDownloading] = useState(false);

  const handleOpenWhatsApp = () => {
    sounds.playClick();
    const message = encodeURIComponent(`Hello Royalludobattle Support! I need assistance with my account (+91 ${user.mobile}).`);
    window.open(`https://wa.me/919462300000?text=${message}`, '_blank');
  };

  const handleOpenBattles = () => {
    sounds.playClick();
    onNavigate('battles');
  };

  const handleDownloadApp = () => {
    sounds.playClick();
    setDownloading(true);
    
    // Simulate real delay before initiating download to show the beautiful loader
    setTimeout(() => {
      setDownloading(false);
      // Trigger actual APK file download from express backend api route
      const link = document.createElement('a');
      link.href = '/api/download/apk';
      link.setAttribute('download', 'Royalludobattle_v2.4.0.apk');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1500);
  };

  return (
    <div className="space-y-4 pb-20 pt-1">
      
      {/* 1. ANNOUNCEMENT / MARQUEE TICKER (Matching Screenshot 2) */}
      <div className="relative overflow-hidden rounded-2xl bg-[#0f172a] text-white shadow-lg border border-cyan-500/40 p-2.5 flex items-center gap-2.5">
        {/* Glowing Orange Speaker Badge */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shrink-0 shadow-md shadow-orange-500/40">
          <Megaphone className="w-4 h-4 fill-white" />
        </div>

        {/* Marquee Ticker */}
        <div className="overflow-hidden whitespace-nowrap w-full text-xs font-bold text-slate-100">
          <div className="inline-block animate-marquee flex items-center gap-6">
            <span>Welcome to Royalludobattle</span>
            <span className="text-amber-400">⚡ 100% Real Money 2-Player Ludo</span>
            <span className="text-emerald-400">💰 Instant UPI & Bank Withdrawals</span>
            <span className="text-cyan-400">💬 24x7 WhatsApp Live Support</span>
            <span>Welcome to Royalludobattle</span>
          </div>
        </div>
      </div>

      {/* 2. PLAY ARENA HEADING SECTION */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight font-['Outfit']">Play Arena</h2>
          <p className="text-xs text-slate-500 font-medium">Choose your favorite battle</p>
        </div>

        {/* Orange Live Games Status Pill */}
        <button
          onClick={handleOpenBattles}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-[10px] shadow-sm shadow-orange-500/20 active:scale-95 transition-transform cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping inline-block" />
          <span className="tracking-wide uppercase">Live Games</span>
        </button>
      </div>

      {/* 3. GAME ARENA 2-COLUMN CARDS (Royalludobattle Ludo Game + WhatsApp Support) */}
      <div className="grid grid-cols-2 gap-3.5">
        
        {/* CARD 1: ROYALLUDOBATTLE LUDO GAME (Directly opens Classic Battles System) */}
        <div
          id="card-taj-ludo-battle"
          onClick={handleOpenBattles}
          className="relative rounded-3xl overflow-hidden shadow-xl border border-amber-400/40 group cursor-pointer active:scale-98 transition-all aspect-square flex flex-col justify-end bg-slate-950"
        >
          {/* Background Poster Image */}
          <img 
            src="/src/assets/images/royal_ludo_arena_1788129626440.jpg"
            alt="Royalludobattle Ludo Game"
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Dark Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent pointer-events-none" />

          {/* Top-Left LIVE Badge */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider shadow-md">
              LIVE
            </span>
          </div>

          {/* Bottom Banner Title */}
          <div className="relative z-10 p-3 text-center">
            <div className="py-1 px-2 rounded-xl bg-amber-500/90 text-slate-950 font-['Outfit'] font-black text-[11px] uppercase tracking-wider shadow-md flex items-center justify-center gap-1">
              <Swords className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
              <span>Tap to Play</span>
            </div>
          </div>
        </div>

        {/* CARD 2: WHATSAPP LIVE SUPPORT */}
        <div
          id="card-whatsapp-support"
          onClick={handleOpenWhatsApp}
          className="relative rounded-3xl overflow-hidden shadow-xl border border-emerald-500/30 group cursor-pointer active:scale-98 transition-all aspect-square flex flex-col items-center justify-center bg-gradient-to-br from-[#062016] via-[#02180f] to-[#010e08] p-4 text-center"
        >
          {/* Top-Left LIVE Badge */}
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider shadow-md">
              LIVE
            </span>
          </div>

          {/* WhatsApp Icon Circle */}
          <div className="w-16 h-16 rounded-full bg-[#25D366]/20 border border-[#25D366]/40 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform mb-2">
            <MessageCircle className="w-10 h-10 text-[#25D366] fill-[#25D366]" />
          </div>

          {/* Title */}
          <h3 className="font-['Outfit'] font-black text-base text-[#25D366] tracking-wider uppercase drop-shadow-sm">
            SUPPORT
          </h3>
          <p className="text-[9px] font-bold text-emerald-300/80 mt-0.5">24x7 WhatsApp Help</p>
        </div>

      </div>

      {/* 4. PREMIUM ANDROID APK DOWNLOAD SECTION */}
      <div 
        id="apk-download-banner"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#1e1b4b] via-[#111827] to-[#1e1b4b] border border-indigo-500/30 p-4 text-white shadow-xl flex flex-col gap-3 mt-1"
      >
        {/* Glow effect */}
        <div className="absolute -right-10 -top-10 w-24 h-24 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-500 flex items-center justify-center text-slate-950 shrink-0 shadow-lg shadow-amber-500/20">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] bg-amber-500/20 text-amber-400 font-extrabold px-2 py-0.5 rounded-full border border-amber-500/20 uppercase tracking-widest">
              OFFICIAL APP
            </span>
            <h3 className="text-sm font-black tracking-tight mt-0.5 font-['Outfit'] text-white">
              Download Royalludobattle APK
            </h3>
            <p className="text-[11px] text-indigo-200 mt-0.5 leading-normal font-medium">
              Get an ads-free, super-fast experience with instant UPI withdrawals directly from the native app.
            </p>
          </div>
        </div>

        {/* Benefits checklists */}
        <div className="grid grid-cols-2 gap-1.5 pt-1.5 border-t border-white/5">
          <div className="flex items-center gap-1 text-[10px] text-slate-300 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>100% Safe & Ads-Free</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-300 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>No Lag, Instant Load</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-300 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>Auto-Connect Rooms</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-300 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>₹50 Refer-Bonus Login</span>
          </div>
        </div>

        {/* Interactive Download Button */}
        <button
          onClick={handleDownloadApp}
          disabled={downloading}
          className={`w-full py-2.5 px-3 rounded-xl font-black text-[11px] uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer ${
            downloading
              ? 'bg-indigo-600 text-indigo-200 border border-indigo-400/20 animate-pulse'
              : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 shadow-amber-500/20'
          }`}
        >
          <Download className={`w-3.5 h-3.5 ${downloading ? 'animate-bounce' : 'text-slate-950'}`} />
          <span>
            {downloading ? 'Downloading APK (8.4 MB)...' : 'Download Android App (APK)'}
          </span>
        </button>

        {/* Bottom micro note */}
        <p className="text-[8.5px] text-slate-400 text-center font-bold">
          Compatible with Android 8.0 & Above • Safe Google Play Protect verified
        </p>
      </div>

    </div>
  );
};

