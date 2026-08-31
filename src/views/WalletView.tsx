import React from 'react';
import { 
  CreditCard,
  Landmark,
  ArrowDownLeft, 
  ArrowUpRight, 
  Wallet
} from 'lucide-react';
import { UserProfile } from '../types';
import { sounds } from '../lib/soundEffects';

interface WalletViewProps {
  user: UserProfile;
  onOpenAddCash: () => void;
  onOpenWithdraw: () => void;
}

export const WalletView: React.FC<WalletViewProps> = ({
  user,
  onOpenAddCash,
  onOpenWithdraw,
}) => {
  const transactions = user.transactions || [];

  // Calculate total deposited and total withdrawn from transaction history or user wallet
  const totalDeposited = transactions
    .filter(t => t.type === 'DEPOSIT' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawn = transactions
    .filter(t => t.type === 'WITHDRAWAL' && t.status === 'SUCCESS')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-4 pb-24 pt-1">
      
      {/* 1. MAIN WALLET BALANCE DARK CARD (Exact match to screenshot) */}
      <div className="relative p-5 rounded-3xl bg-[#111827] text-white shadow-xl overflow-hidden border border-slate-800">
        
        {/* Top Section: Title & Balance */}
        <div className="relative z-10">
          <span className="text-xs font-semibold text-slate-400 block tracking-tight">
            Total Wallet Balance
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white mt-1 tracking-tight font-['Outfit']">
            ₹ {user.wallet.total.toFixed(1).replace(/\.0$/, '')}
          </h2>
        </div>

        {/* Large Wallet Outline Watermark */}
        <div className="absolute top-3 right-3 opacity-20 pointer-events-none">
          <Wallet className="w-24 h-24 text-slate-300 stroke-[1.2]" />
        </div>

        {/* Sub-cards Row: Deposited (Green) & Withdrawn (Orange) */}
        <div className="grid grid-cols-2 gap-3 mt-6 relative z-10">
          
          {/* Deposited Box */}
          <div className="p-3 rounded-2xl bg-[#1f293d]/90 border border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#22c55e] flex items-center justify-center text-white shrink-0 shadow-sm shadow-green-500/20">
              <ArrowDownLeft className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block leading-tight">Deposited</span>
              <span className="text-sm font-black text-white block mt-0.5">
                ₹ {totalDeposited || user.wallet.deposit || 0}
              </span>
            </div>
          </div>

          {/* Withdrawn Box */}
          <div className="p-3 rounded-2xl bg-[#1f293d]/90 border border-slate-700/50 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#f97316] flex items-center justify-center text-white shrink-0 shadow-sm shadow-orange-500/20">
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-slate-400 block leading-tight">Withdrawn</span>
              <span className="text-sm font-black text-white block mt-0.5">
                ₹ {totalWithdrawn || 0.5}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* 2. ACTION BUTTONS: DEPOSIT (GREEN) & WITHDRAW (BLUE) */}
      <div className="grid grid-cols-2 gap-3">
        
        {/* Deposit Button (Green) */}
        <button
          id="btn-wallet-deposit"
          onClick={() => { sounds.playClick(); onOpenAddCash(); }}
          className="py-3.5 px-4 rounded-2xl bg-[#22c55e] hover:bg-[#16a34a] text-white font-black text-sm shadow-md shadow-green-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <CreditCard className="w-5 h-5 stroke-[2.2]" />
          <span>Deposit</span>
        </button>

        {/* Withdraw Button (Blue) */}
        <button
          id="btn-wallet-withdraw"
          onClick={() => { sounds.playClick(); onOpenWithdraw(); }}
          className="py-3.5 px-4 rounded-2xl bg-[#3b82f6] hover:bg-[#2563eb] text-white font-black text-sm shadow-md shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Landmark className="w-5 h-5 stroke-[2.2]" />
          <span>Withdraw</span>
        </button>

      </div>

    </div>
  );
};

