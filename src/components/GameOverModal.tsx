import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Frown, RotateCcw, Home, Sparkles, ShieldCheck } from 'lucide-react';
import { GameState, PlayerColor, UserProfile } from '../types';
import { sounds } from '../lib/soundEffects';

interface GameOverModalProps {
  game: GameState;
  user: UserProfile;
  userColor: PlayerColor;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  game,
  user,
  userColor,
  onPlayAgain,
  onReturnToLobby,
}) => {
  const isWinner = game.winner === userColor;

  useEffect(() => {
    if (isWinner) {
      sounds.playVictory();
      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f59e0b', '#10b981', '#6366f1', '#ec4899'],
      });
    }
  }, [isWinner]);

  const winnerPlayer = game.winner ? game.players[game.winner] : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border-2 border-indigo-200 flex flex-col text-center">
        
        {/* Header Ribbon */}
        <div className={`p-6 text-white ${
          isWinner 
            ? 'bg-gradient-to-b from-amber-400 via-amber-500 to-yellow-600' 
            : 'bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900'
        }`}>
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 backdrop-blur-md border-4 border-white/40 flex items-center justify-center shadow-xl mb-3">
            {isWinner ? (
              <Trophy className="w-10 h-10 text-amber-100 fill-amber-200 animate-bounce" />
            ) : (
              <Frown className="w-10 h-10 text-slate-300" />
            )}
          </div>

          <h2 className="text-2xl font-black font-['Outfit'] tracking-tight drop-shadow">
            {isWinner ? 'YOU WON THE MATCH!' : 'BETTER LUCK NEXT TIME!'}
          </h2>
          <p className="text-xs font-semibold opacity-90 mt-0.5">
            {isWinner ? `Prize of ₹${game.prizeAmount} credited to wallet` : `Winner: ${winnerPlayer?.username || 'Opponent'}`}
          </p>
        </div>

        {/* Content & Earnings Breakdown */}
        <div className="p-5 space-y-4">
          <div className="p-3.5 rounded-2xl bg-indigo-50/80 border border-indigo-100 space-y-2 text-xs">
            <div className="flex items-center justify-between font-semibold text-slate-600">
              <span>Room Code</span>
              <span className="font-mono font-bold text-slate-900">#{game.roomCode}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-slate-600">
              <span>Entry Stake</span>
              <span className="text-slate-900">₹{game.entryFee}</span>
            </div>
            <div className="flex items-center justify-between font-semibold text-slate-600">
              <span>Winning Prize</span>
              <span className="font-bold text-emerald-600 text-sm">₹{game.prizeAmount}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => { sounds.playClick(); onPlayAgain(); }}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Play Another Match</span>
            </button>

            <button
              onClick={() => { sounds.playClick(); onReturnToLobby(); }}
              className="w-full py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Return to Home</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
