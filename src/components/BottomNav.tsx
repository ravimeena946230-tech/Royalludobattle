import React from 'react';
import { 
  Home as HomeIcon, 
  Headphones, 
  Gift, 
  Wallet as WalletIcon, 
  User as UserIcon 
} from 'lucide-react';
import { ViewType } from '../types';
import { sounds } from '../lib/soundEffects';

interface BottomNavProps {
  activeView: ViewType;
  onNavigate: (view: ViewType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeView, onNavigate }) => {
  const tabs = [
    { id: 'home' as ViewType, label: 'Home', icon: HomeIcon },
    { id: 'support' as ViewType, label: 'Support', icon: Headphones },
    { id: 'refer' as ViewType, label: 'Rewards', icon: Gift },
    { id: 'wallet' as ViewType, label: 'Wallet', icon: WalletIcon },
    { id: 'profile' as ViewType, label: 'Profile', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-indigo-100/80 shadow-[0_-4px_20px_rgba(0,0,0,0.04)] pb-safe">
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => {
                sounds.playClick();
                onNavigate(tab.id);
              }}
              className="flex items-center justify-center p-1 relative transition-all active:scale-95 cursor-pointer"
              aria-label={tab.label}
            >
              {isActive ? (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6366f1] via-[#818cf8] to-[#93c5fd] flex items-center justify-center text-white shadow-md shadow-indigo-400/30 scale-105">
                  <Icon className="w-6 h-6 fill-white text-white" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-colors">
                  <Icon className="w-6 h-6 stroke-[1.75]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

