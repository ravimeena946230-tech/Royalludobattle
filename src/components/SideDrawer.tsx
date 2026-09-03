import React from 'react';
import { 
  X, 
  Gamepad2, 
  Wallet, 
  Gift, 
  FileText, 
  History, 
  Headphones, 
  ShieldCheck, 
  Volume2, 
  VolumeX, 
  LogOut, 
  ShieldAlert, 
  Download, 
  ChevronRight,
  Info,
  Swords,
  Globe,
  Settings
} from 'lucide-react';
import { UserProfile, ViewType } from '../types';
import { sounds } from '../lib/soundEffects';

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onNavigate: (view: ViewType) => void;
  onOpenAuth: () => void;
}

export const SideDrawer: React.FC<SideDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onNavigate,
  onOpenAuth,
}) => {
  if (!isOpen) return null;

  const isMuted = sounds.getMuted();

  const handleNav = (view: ViewType) => {
    sounds.playClick();
    onNavigate(view);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Drawer Body */}
      <div className="relative w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col z-10 animate-in slide-in-from-left duration-200">
        
        {/* User Mini Profile Header */}
        <div className="p-4 bg-gradient-to-br from-[#1e1b4b] to-[#312e81] text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img 
                src={user.avatar} 
                alt={user.username}
                className="w-12 h-12 rounded-2xl border-2 border-amber-400 object-cover shadow-md"
              />
              <div className="overflow-hidden">
                <h3 className="font-bold text-sm truncate text-white">{user.username}</h3>
                <p className="text-xs text-indigo-200">+91 {user.mobile}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5 ${
                    user.kycStatus === 'VERIFIED'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : user.kycStatus === 'PENDING'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-400/30'
                      : 'bg-rose-500/20 text-rose-300 border border-rose-400/30'
                  }`}>
                    <ShieldCheck className="w-2.5 h-2.5" />
                    KYC: {user.kycStatus}
                  </span>
                </div>
              </div>
            </div>

            <button 
              onClick={() => { sounds.playClick(); onClose(); }}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Balance card in drawer */}
          <div className="mt-3.5 p-2.5 rounded-xl bg-white/10 border border-white/10 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-indigo-200 uppercase font-semibold">Total Balance</span>
              <p className="text-base font-black text-amber-300">₹{user.wallet.total.toFixed(2)}</p>
            </div>
            <button
              onClick={() => handleNav('wallet')}
              className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg text-xs font-bold shadow-sm"
            >
              Add Cash
            </button>
          </div>
        </div>

        {/* Menu Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          
          <button
            onClick={() => handleNav('battles')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-amber-50 text-slate-700 font-bold text-xs text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700"><Swords className="w-4 h-4" /></div>
              <span>Classic Battles Arena</span>
            </div>
            <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded">Live</span>
          </button>

          <button
            onClick={() => handleNav('home')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-slate-700 font-medium text-xs text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-600"><Gamepad2 className="w-4 h-4" /></div>
              <span>Play Arena</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => handleNav('wallet')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-slate-700 font-medium text-xs text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600"><Wallet className="w-4 h-4" /></div>
              <span>My Wallet & Passbook</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => handleNav('refer')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-slate-700 font-medium text-xs text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-100 text-amber-600"><Gift className="w-4 h-4" /></div>
              <span>Refer & Earn</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => handleNav('history')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-slate-700 font-medium text-xs text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-600"><History className="w-4 h-4" /></div>
              <span>Match History</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => handleNav('kyc')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-slate-700 font-medium text-xs text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-purple-100 text-purple-600"><FileText className="w-4 h-4" /></div>
              <span>KYC Verification</span>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
              {user.kycStatus}
            </span>
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onClose();
              // Trigger direct file download
              const link = document.createElement('a');
              link.href = '/api/download/apk';
              link.setAttribute('download', 'Royalludobattle_v2.4.0.apk');
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-900 font-bold text-xs text-left border border-amber-500/20"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-500 text-slate-950">
                <Download className="w-4 h-4" />
              </div>
              <span className="text-amber-800">Download Android App</span>
            </div>
            <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded">APK</span>
          </button>

          <button
            onClick={() => handleNav('support')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-indigo-50 text-slate-700 font-medium text-xs text-left"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-rose-100 text-rose-600"><Headphones className="w-4 h-4" /></div>
              <span>24x7 Help & Support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={() => handleNav('admin')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs text-left shadow-md transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-white/10 text-white"><Settings className="w-4 h-4 animate-[spin_4s_linear_infinite]" /></div>
              <span>Admin Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-white/50" />
          </button>

          <div className="pt-2 border-t border-slate-100 space-y-1">
            <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-600">
              <span className="flex items-center gap-2">
                <Info className="w-4 h-4 text-slate-400" /> Sound Effects
              </span>
              <button
                onClick={() => sounds.toggleMute()}
                className="p-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[10px]"
              >
                {isMuted ? 'Muted 🔇' : 'Enabled 🔊'}
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenAuth();
              onClose();
            }}
            className="flex items-center gap-2 text-xs font-bold text-rose-600 hover:text-rose-700 py-1 px-2 rounded-lg hover:bg-rose-50 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Switch / Login</span>
          </button>

          <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
            <span>v2.4.0 • Royalludobattle</span>
          </span>
        </div>

      </div>
    </div>
  );
};
