import React, { useState, useEffect } from 'react';
import { 
  Swords, 
  Flame, 
  Play, 
  Trash2, 
  ArrowLeft,
  RefreshCw,
  Clock,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { UserProfile, Room } from '../types';
import { sounds } from '../lib/soundEffects';

interface BattlesViewProps {
  user: UserProfile;
  onNavigateHome: () => void;
  onCreateRoom: (stake: number) => void;
  onJoinRoom: (code: string) => void;
  onOpenAddCash: () => void;
}

interface OpenBattle {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorAvatar?: string;
  entryFee: number;
  prizeAmount: number;
  code: string;
  createdAt: string;
}

interface RunningBattle {
  id: string;
  entryFee: number;
  prizeAmount: number;
  player1: { name: string; avatar: string };
  player2: { name: string; avatar: string };
  status: 'LIVE';
}

const DEFAULT_OPEN_BATTLES: OpenBattle[] = [
  {
    id: 'btl_1',
    creatorId: 'usr_mita',
    creatorName: 'Mitaynsh',
    entryFee: 950,
    prizeAmount: 1852.5,
    code: '954821',
    createdAt: '1m ago',
  },
  {
    id: 'btl_2',
    creatorId: 'usr_mita2',
    creatorName: 'Mitaynsh',
    entryFee: 1000,
    prizeAmount: 1950,
    code: '102948',
    createdAt: '3m ago',
  },
  {
    id: 'btl_3',
    creatorId: 'usr_rahul',
    creatorName: 'Rahul King',
    entryFee: 50,
    prizeAmount: 97.5,
    code: '501832',
    createdAt: '4m ago',
  },
  {
    id: 'btl_4',
    creatorId: 'usr_sonu',
    creatorName: 'Sonu_Pro',
    entryFee: 100,
    prizeAmount: 195,
    code: '100492',
    createdAt: '6m ago',
  },
];

const RUNNING_BATTLES: RunningBattle[] = [
  {
    id: 'run_1',
    entryFee: 200,
    prizeAmount: 390,
    player1: {
      name: 'Royal770',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    },
    player2: {
      name: 'SZAQi',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    },
    status: 'LIVE',
  },
  {
    id: 'run_2',
    entryFee: 50,
    prizeAmount: 97.5,
    player1: {
      name: 'Ramlakhan m...',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80',
    },
    player2: {
      name: 'Bhumihar ji',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    },
    status: 'LIVE',
  },
  {
    id: 'run_3',
    entryFee: 500,
    prizeAmount: 975,
    player1: {
      name: 'Aakash99',
      avatar: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?w=100&auto=format&fit=crop&q=80',
    },
    player2: {
      name: 'Vikas Ludo',
      avatar: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?w=100&auto=format&fit=crop&q=80',
    },
    status: 'LIVE',
  },
];

export const BattlesView: React.FC<BattlesViewProps> = ({
  user,
  onNavigateHome,
  onCreateRoom,
  onJoinRoom,
  onOpenAddCash,
}) => {
  const [amountInput, setAmountInput] = useState('');
  const [openBattles, setOpenBattles] = useState<OpenBattle[]>(DEFAULT_OPEN_BATTLES);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Sync with active rooms from server if any
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/rooms/active');
        if (res.ok) {
          const serverRooms: Room[] = await res.json();
          if (serverRooms && serverRooms.length > 0) {
            const mapped: OpenBattle[] = serverRooms.map(r => ({
              id: r.id,
              creatorId: r.hostId,
              creatorName: r.hostName,
              entryFee: r.entryFee,
              prizeAmount: r.prizeAmount,
              code: r.code,
              createdAt: 'Just now',
            }));
            // Merge with defaults
            setOpenBattles(prev => {
              const combined = [...mapped, ...DEFAULT_OPEN_BATTLES.filter(d => !mapped.some(m => m.code === d.code))];
              return combined;
            });
          }
        }
      } catch {
        // Fallback
      }
    };
    fetchRooms();
  }, []);

  const handleSetAmount = () => {
    sounds.playClick();
    const parsed = Number(amountInput);
    if (!amountInput || isNaN(parsed) || parsed < 10) {
      setErrorMsg('Minimum battle stake is ₹10');
      setTimeout(() => setErrorMsg(null), 3000);
      return;
    }

    if (user.wallet.total < parsed) {
      setErrorMsg(`Insufficient wallet balance (₹${user.wallet.total}). Please add cash.`);
      setTimeout(() => setErrorMsg(null), 3000);
      onOpenAddCash();
      return;
    }

    const calculatedPrize = parsed * 2 * 0.95; // 5% commission
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();

    const newBattle: OpenBattle = {
      id: `btl_${Date.now()}`,
      creatorId: user.id,
      creatorName: user.username,
      entryFee: parsed,
      prizeAmount: calculatedPrize,
      code: randomCode,
      createdAt: 'Just now',
    };

    setOpenBattles([newBattle, ...openBattles]);
    setAmountInput('');
    setErrorMsg(null);

    // Also trigger room creation in socket backend
    onCreateRoom(parsed);
  };

  const handleCancelBattle = (battleId: string) => {
    sounds.playClick();
    setOpenBattles(prev => prev.filter(b => b.id !== battleId));
  };

  const handlePlayBattle = (battle: OpenBattle) => {
    sounds.playClick();
    if (user.wallet.total < battle.entryFee) {
      setErrorMsg(`Insufficient balance for ₹${battle.entryFee} entry fee.`);
      setTimeout(() => setErrorMsg(null), 3000);
      onOpenAddCash();
      return;
    }
    onJoinRoom(battle.code);
  };

  return (
    <div className="space-y-4 pb-24 pt-1">
      
      {/* Top Breadcrumb/Back link to Arena */}
      <div className="flex items-center justify-between px-1">
        <button
          onClick={() => { sounds.playClick(); onNavigateHome(); }}
          className="flex items-center gap-1.5 text-xs font-black text-slate-700 hover:text-amber-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Play Arena</span>
        </button>

        <span className="text-[10px] font-black text-amber-800 bg-amber-100/90 border border-amber-300 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
          Classic Battles
        </span>
      </div>

      {/* 1. TOP AMOUNT SET CARD (Exact Match to Screenshot 2) */}
      <div className="p-3.5 rounded-3xl bg-[#fffdf2] border-2 border-[#fcd34d] shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1">
            <input
              type="number"
              value={amountInput}
              onChange={(e) => {
                setAmountInput(e.target.value);
                if (errorMsg) setErrorMsg(null);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSetAmount();
              }}
              placeholder="Enter Amount"
              className="w-full px-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-slate-900 font-bold text-sm placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
          </div>

          <button
            onClick={handleSetAmount}
            className="px-6 py-2.5 rounded-2xl bg-[#312e81] hover:bg-indigo-900 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-indigo-950/20 active:scale-95 transition-transform cursor-pointer"
          >
            SET
          </button>
        </div>

        {errorMsg && (
          <div className="mt-2 text-[11px] font-bold text-rose-600 flex items-center gap-1 px-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* 2. OPEN BATTLES SECTION (Exact Match to Screenshot 2) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Swords className="w-4 h-4 text-amber-600 stroke-[2.2]" />
            <h2 className="text-base font-black text-slate-900 tracking-tight font-['Outfit']">
              Open Battles
            </h2>
          </div>
          <span className="text-[10px] font-black text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
            {openBattles.length} Available
          </span>
        </div>

        {openBattles.length === 0 ? (
          <div className="p-5 rounded-3xl bg-[#fffdf2] border border-amber-200 text-center shadow-xs">
            <p className="text-xs font-bold text-slate-600">No open battles right now.</p>
            <p className="text-[11px] text-amber-700 font-bold mt-1">Enter an amount above and click SET to challenge others!</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {openBattles.map((battle) => {
              const isMine = battle.creatorId === user.id;

              return (
                <div
                  key={battle.id}
                  className="p-3.5 rounded-2xl bg-[#fffdf2] border-2 border-[#fbd38d] shadow-xs relative transition-all hover:border-amber-400"
                >
                  {/* Top Row: OPEN Tag + FROM Username */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#fef3c7] text-[#92400e] border border-[#fde68a] text-[10px] font-black uppercase tracking-wider">
                      <Swords className="w-3 h-3 stroke-[2.5]" />
                      <span>OPEN</span>
                    </div>

                    <div className="text-[11px] text-slate-500 font-medium">
                      <span className="uppercase text-[9px] font-bold text-slate-400 mr-1">FROM</span>
                      <strong className="text-slate-800 font-extrabold">{battle.creatorName}</strong>
                    </div>
                  </div>

                  {/* Middle Row: ENTRY and PRIZE amounts with subtle vertical divider */}
                  <div className="mt-2.5 pt-1.5 flex items-center justify-between">
                    <div className="flex-1">
                      <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">ENTRY</span>
                      <span className="text-base font-black text-slate-900 tracking-tight">
                        ₹{battle.entryFee.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="w-[1px] h-7 bg-amber-200 mx-3" />

                    <div className="flex-1">
                      <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">PRIZE</span>
                      <span className="text-base font-black text-slate-900 tracking-tight">
                        ₹{battle.prizeAmount.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                      </span>
                    </div>

                    {/* Action Button: Play (or Cancel if user created it) */}
                    <div className="ml-2">
                      {isMine ? (
                        <button
                          onClick={() => handleCancelBattle(battle.id)}
                          className="px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-black text-xs border border-rose-200 active:scale-95 transition-transform flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                          <span>Cancel</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handlePlayBattle(battle)}
                          className="px-5 py-1.5 rounded-xl bg-[#ca8a04] hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-sm active:scale-95 transition-transform cursor-pointer"
                        >
                          Play
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 3. RUNNING BATTLES SECTION (Exact Match to Screenshot 2) */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-emerald-600 fill-emerald-500 stroke-[1.5]" />
            <h2 className="text-base font-black text-slate-900 tracking-tight font-['Outfit']">
              Running Battles
            </h2>
          </div>
          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
            {RUNNING_BATTLES.length} Live
          </span>
        </div>

        <div className="space-y-2.5">
          {RUNNING_BATTLES.map((rb) => (
            <div
              key={rb.id}
              className="p-3.5 rounded-2xl bg-[#fffdf2] border-2 border-[#fbd38d] shadow-xs space-y-2.5"
            >
              {/* Top Row: LIVE Tag */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-black uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping inline-block" />
                  <span>● LIVE</span>
                </div>
              </div>

              {/* Middle Row: ENTRY & PRIZE */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">ENTRY</span>
                  <span className="text-sm font-black text-slate-900 tracking-tight">
                    ₹{rb.entryFee.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="w-[1px] h-6 bg-amber-200 mx-3" />

                <div className="flex-1">
                  <span className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider">PRIZE</span>
                  <span className="text-sm font-black text-slate-900 tracking-tight">
                    ₹{rb.prizeAmount.toLocaleString('en-IN', { maximumFractionDigits: 1 })}
                  </span>
                </div>
              </div>

              {/* Bottom Row: Player 1 VS Player 2 with Avatars */}
              <div className="pt-2 border-t border-amber-200/70 flex items-center justify-between">
                
                {/* Player 1 */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <img
                    src={rb.player1.avatar}
                    alt={rb.player1.name}
                    className="w-7 h-7 rounded-full object-cover border-2 border-amber-400 shrink-0 shadow-2xs"
                  />
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {rb.player1.name}
                  </span>
                </div>

                {/* VS Badge */}
                <div className="mx-2 shrink-0">
                  <div className="w-6 h-6 rounded-md bg-[#d97706] text-white font-black text-[9px] flex items-center justify-center shadow-xs rotate-45">
                    <span className="-rotate-45">VS</span>
                  </div>
                </div>

                {/* Player 2 */}
                <div className="flex items-center justify-end gap-2 flex-1 min-w-0 text-right">
                  <span className="text-xs font-bold text-slate-800 truncate">
                    {rb.player2.name}
                  </span>
                  <img
                    src={rb.player2.avatar}
                    alt={rb.player2.name}
                    className="w-7 h-7 rounded-full object-cover border-2 border-amber-400 shrink-0 shadow-2xs"
                  />
                </div>

              </div>

            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
