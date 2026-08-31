import React, { useState } from 'react';
import { 
  Menu, 
  Wallet as WalletIcon, 
  Gift, 
  Bell, 
  Volume2, 
  VolumeX, 
  Users,
  ShieldCheck,
  Zap,
  Sparkles
} from 'lucide-react';
import { UserProfile, AppNotification, ViewType } from '../types';
import { sounds } from '../lib/soundEffects';

interface HeaderProps {
  user: UserProfile;
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
  onOpenAddCash: () => void;
  onToggleDrawer: () => void;
  onSwitchUser: (userId: string) => void;
  notifications: AppNotification[];
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onNavigate,
  onOpenAddCash,
  onToggleDrawer,
  onSwitchUser,
  notifications,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [showNotifs, setShowNotifs] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleToggleSound = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
    if (!muted) sounds.playClick();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-indigo-100/70 shadow-xs">
      <div className="max-w-md w-full mx-auto px-3.5 py-2.5 flex items-center justify-between gap-2">
        
        {/* Left: Warm Amber Glow Hamburger Menu Button */}
        <button 
          id="btn-header-menu"
          onClick={() => { sounds.playClick(); onToggleDrawer(); }}
          className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 shadow-md shadow-orange-400/30 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform cursor-pointer border border-amber-300/60"
          aria-label="Open Royalludobattle Menu"
        >
          <span className="w-5 h-[2.5px] bg-white rounded-full block shadow-xs" />
          <span className="w-5 h-[2.5px] bg-white rounded-full block shadow-xs" />
          <span className="w-5 h-[2.5px] bg-white rounded-full block shadow-xs" />
        </button>

        {/* Center: Royal Royalludobattle Crest Logo */}
        <div 
          onClick={() => { sounds.playClick(); onNavigate('home'); }}
          className="flex items-center gap-1.5 cursor-pointer select-none group"
        >
          <div className="relative">
            <img 
              src="/src/assets/images/royal_ludo_battle_logo_1788128125893.jpg"
              alt="Royalludobattle Logo"
              referrerPolicy="no-referrer"
              className="w-10 h-10 rounded-xl object-cover shadow-sm border border-amber-400/50 group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-['Outfit'] font-black tracking-tight text-base leading-none bg-gradient-to-r from-amber-600 via-amber-700 to-yellow-600 bg-clip-text text-transparent uppercase drop-shadow-2xs">
              ROYALLUDOBATTLE
            </span>
            <span className="text-[8px] font-extrabold text-slate-500 tracking-wider uppercase leading-tight">
              Real Money Arena
            </span>
          </div>
        </div>

        {/* Right: Wallet Balance, Bonus Pill, Bell, and Player Switcher */}
        <div className="flex items-center gap-1.5">
          
          {/* Quick Player Switcher for Demo testing */}
          <button
            id="btn-switch-player"
            onClick={() => {
              sounds.playClick();
              const nextUser = user.id === 'usr_101' ? 'usr_102' : 'usr_101';
              onSwitchUser(nextUser);
            }}
            title="Switch between Player 1 & Player 2"
            className="px-1.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-[10px] font-extrabold text-slate-700 hover:bg-indigo-50 transition-colors"
          >
            {user.id === 'usr_101' ? 'P1' : user.id === 'usr_102' ? 'P2' : 'Adm'}
          </button>

          {/* 1. Wallet Balance Pill (Blue rounded button with wallet icon & amount) */}
          <button 
            id="chip-header-wallet"
            onClick={() => { sounds.playClick(); onOpenAddCash(); }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-2xl bg-[#3b82f6] hover:bg-blue-600 text-white font-black text-xs shadow-md shadow-blue-500/25 active:scale-95 transition-all cursor-pointer"
            title="Wallet Balance - Click to Add Cash"
          >
            <WalletIcon className="w-3.5 h-3.5 text-blue-100" />
            <span className="tracking-tight">₹{user.wallet.total.toFixed(user.wallet.total % 1 === 0 ? 0 : 1)}</span>
          </button>

          {/* 2. Bonus / Gift Pill (Purple/Blue rounded button with gift icon & amount) */}
          <button 
            id="btn-header-refer"
            onClick={() => { sounds.playClick(); onNavigate('refer'); }}
            className="flex items-center gap-1 px-2 py-1.5 rounded-2xl bg-[#6366f1] hover:bg-indigo-600 text-white font-black text-xs shadow-md shadow-indigo-500/25 active:scale-95 transition-all cursor-pointer"
            title="Bonus / Gift Balance"
          >
            <Gift className="w-3.5 h-3.5 text-indigo-100" />
            <span className="tracking-tight">{user.wallet.bonus.toFixed(0)}</span>
          </button>

          {/* 3. Purple Circular Notification Bell */}
          <div className="relative">
            <button
              id="btn-header-notifs"
              onClick={() => { sounds.playClick(); setShowNotifs(!showNotifs); }}
              className="w-8 h-8 rounded-full bg-[#c084fc] hover:bg-purple-400 text-white flex items-center justify-center shadow-md shadow-purple-400/30 active:scale-95 transition-transform"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white rounded-full text-[8px] font-black flex items-center justify-center ring-2 ring-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Popover */}
            {showNotifs && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-slate-900 rounded-3xl shadow-2xl border border-indigo-100 p-3.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                  <span className="font-black text-xs text-slate-800">Royalludobattle Alerts</span>
                  <span className="text-[10px] text-amber-600 font-bold">{notifications.length} alerts</span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 text-xs">
                  {notifications.length === 0 ? (
                    <p className="text-slate-400 text-center py-4">No notifications yet</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100">
                        <p className="font-black text-[11px] text-slate-800">{n.title}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">{n.message}</p>
                        <span className="text-[9px] text-slate-400 mt-1 block font-semibold">{n.timestamp}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

