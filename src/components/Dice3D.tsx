import React, { useState } from 'react';
import { PlayerColor } from '../types';
import { sounds } from '../lib/soundEffects';

interface Dice3DProps {
  value: number | null;
  isRolling: boolean;
  playerColor: PlayerColor;
  isMyTurn: boolean;
  hasRolled: boolean;
  onRoll: () => void;
  timeRemaining?: number;
}

export const Dice3D: React.FC<Dice3DProps> = ({
  value,
  isRolling,
  playerColor,
  isMyTurn,
  hasRolled,
  onRoll,
  timeRemaining = 15,
}) => {
  const [localRolling, setLocalRolling] = useState(false);

  const handleClick = () => {
    if (!isMyTurn || hasRolled || isRolling || localRolling) return;
    setLocalRolling(true);
    sounds.playDiceRoll();
    onRoll();
    setTimeout(() => {
      setLocalRolling(false);
    }, 600);
  };

  const rolling = isRolling || localRolling;

  // Dice Pip Rendering Patterns (1 to 6)
  const renderPips = (num: number) => {
    switch (num) {
      case 1:
        return (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-3.5 h-3.5 rounded-full bg-rose-600 shadow-inner" />
          </div>
        );
      case 2:
        return (
          <div className="w-full h-full p-2 flex flex-col justify-between">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 self-start" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 self-end" />
          </div>
        );
      case 3:
        return (
          <div className="w-full h-full p-2 flex flex-col justify-between">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 self-start" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 self-center" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900 self-end" />
          </div>
        );
      case 4:
        return (
          <div className="w-full h-full p-2 grid grid-cols-2 gap-2 place-items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
          </div>
        );
      case 5:
        return (
          <div className="w-full h-full p-2 grid grid-cols-3 grid-rows-3 gap-0.5 place-items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div />
            <div className="w-2.5 h-2.5 rounded-full bg-rose-600" />
            <div />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
          </div>
        );
      case 6:
        return (
          <div className="w-full h-full p-2 grid grid-cols-2 grid-rows-3 gap-1 place-items-center">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-900" />
          </div>
        );
      default:
        return (
          <div className="w-full h-full flex items-center justify-center text-xs font-bold text-slate-400">
            ROLL
          </div>
        );
    }
  };

  const timerPercent = (timeRemaining / 15) * 100;

  return (
    <div className="flex items-center gap-3">
      {/* Dice Container with Timer Ring */}
      <div className="relative flex items-center justify-center">
        {/* SVG Circular Timer Ring */}
        {isMyTurn && !hasRolled && (
          <svg className="absolute -inset-1.5 w-16 h-16 transform -rotate-90 pointer-events-none">
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke="#e2e8f0"
              strokeWidth="3.5"
              fill="transparent"
            />
            <circle
              cx="32"
              cy="32"
              r="28"
              stroke={timeRemaining < 5 ? '#ef4444' : playerColor === 'RED' ? '#f43f5e' : '#10b981'}
              strokeWidth="3.5"
              strokeDasharray={175}
              strokeDashoffset={175 - (175 * timerPercent) / 100}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          </svg>
        )}

        {/* 3D Dice Box */}
        <div
          onClick={handleClick}
          className={`relative w-13 h-13 rounded-2xl bg-gradient-to-b from-white to-slate-100 border-2 shadow-xl flex items-center justify-center transition-all ${
            playerColor === 'RED' ? 'border-rose-400/80 shadow-rose-500/20' : 'border-emerald-400/80 shadow-emerald-500/20'
          } ${
            isMyTurn && !hasRolled 
              ? 'cursor-pointer hover:scale-105 active:scale-95 ring-4 ring-amber-400/80 animate-pulse' 
              : 'opacity-90'
          } ${rolling ? 'animate-spin' : ''}`}
        >
          {renderPips(value || (playerColor === 'RED' ? 1 : 6))}
        </div>
      </div>

      {/* Action / Helper Text */}
      <div className="flex flex-col">
        {isMyTurn ? (
          !hasRolled ? (
            <button
              onClick={handleClick}
              className={`px-3.5 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider text-white shadow-md active:scale-95 transition-transform ${
                playerColor === 'RED' 
                  ? 'bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700'
              }`}
            >
              TAP TO ROLL
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-slate-800">
                Rolled <span className="text-sm text-indigo-600 font-extrabold">{value}</span>
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full animate-bounce">
                Tap Token to Move
              </span>
            </div>
          )
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping" />
            <span>Opponent is rolling...</span>
          </div>
        )}
      </div>
    </div>
  );
};
