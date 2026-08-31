import React from 'react';
import { GameState, PlayerColor, TokenInfo } from '../types';
import { SAFE_TILES, RED_FINISH, GREEN_FINISH } from '../lib/ludoEngine';
import { sounds } from '../lib/soundEffects';
import { Star, Shield, Crown } from 'lucide-react';

interface LudoBoardProps {
  game: GameState;
  userColor: PlayerColor;
  onTokenClick: (tokenId: number) => void;
  disabled?: boolean;
}

// 52 Track grid mapping (row: 0..14, col: 0..14)
const TRACK_COORDINATES: { [step: number]: { r: number; c: number } } = {
  0: { r: 6, c: 1 }, // Red Start
  1: { r: 6, c: 2 },
  2: { r: 6, c: 3 },
  3: { r: 6, c: 4 },
  4: { r: 6, c: 5 },
  5: { r: 5, c: 6 },
  6: { r: 4, c: 6 },
  7: { r: 3, c: 6 },
  8: { r: 2, c: 6 }, // Safe Star
  9: { r: 1, c: 6 },
  10: { r: 0, c: 6 },
  11: { r: 0, c: 7 },
  12: { r: 0, c: 8 },
  13: { r: 1, c: 8 }, // Safe Star
  14: { r: 2, c: 8 },
  15: { r: 3, c: 8 },
  16: { r: 4, c: 8 },
  17: { r: 5, c: 8 },
  18: { r: 6, c: 9 },
  19: { r: 6, c: 10 },
  20: { r: 6, c: 11 },
  21: { r: 6, c: 12 }, // Safe Star
  22: { r: 6, c: 13 },
  23: { r: 6, c: 14 },
  24: { r: 7, c: 14 }, // Green Home Entry
  25: { r: 8, c: 14 },
  26: { r: 8, c: 13 }, // Green Start
  27: { r: 8, c: 12 },
  28: { r: 8, c: 11 },
  29: { r: 8, c: 10 },
  30: { r: 8, c: 9 },
  31: { r: 9, c: 8 },
  32: { r: 10, c: 8 },
  33: { r: 11, c: 8 },
  34: { r: 12, c: 8 }, // Safe Star
  35: { r: 13, c: 8 },
  36: { r: 14, c: 8 },
  37: { r: 14, c: 7 },
  38: { r: 14, c: 6 },
  39: { r: 13, c: 6 }, // Safe Star
  40: { r: 12, c: 6 },
  41: { r: 11, c: 6 },
  42: { r: 10, c: 6 },
  43: { r: 9, c: 6 },
  44: { r: 8, c: 5 },
  45: { r: 8, c: 4 },
  46: { r: 8, c: 3 },
  47: { r: 8, c: 2 }, // Safe Star
  48: { r: 8, c: 1 },
  49: { r: 8, c: 0 },
  50: { r: 7, c: 0 }, // Red Home Entry
  51: { r: 6, c: 0 },

  // Red Home Runway
  100: { r: 7, c: 1 },
  101: { r: 7, c: 2 },
  102: { r: 7, c: 3 },
  103: { r: 7, c: 4 },
  104: { r: 7, c: 5 },
  105: { r: 7, c: 6 }, // Red Center Finish

  // Green Home Runway
  200: { r: 7, c: 13 },
  201: { r: 7, c: 12 },
  202: { r: 7, c: 11 },
  203: { r: 7, c: 10 },
  204: { r: 7, c: 9 },
  205: { r: 7, c: 8 }, // Green Center Finish
};

// Base slots coordinates (in % of 15x15 board)
const RED_BASE_SLOTS = [
  { top: '69%', left: '12%' },
  { top: '69%', left: '26%' },
  { top: '83%', left: '12%' },
  { top: '83%', left: '26%' },
];

const GREEN_BASE_SLOTS = [
  { top: '12%', left: '69%' },
  { top: '12%', left: '83%' },
  { top: '26%', left: '69%' },
  { top: '26%', left: '83%' },
];

export const LudoBoard: React.FC<LudoBoardProps> = ({
  game,
  userColor,
  onTokenClick,
  disabled,
}) => {
  const isMyTurn = game.currentTurn === userColor;
  const validTokenIds = isMyTurn ? game.validTokenMoves : [];

  // Find all tokens occupying each coordinate
  const getTokenPositionStyle = (token: TokenInfo, color: PlayerColor) => {
    if (token.step === -1) {
      // In base yard
      const slots = color === 'RED' ? RED_BASE_SLOTS : GREEN_BASE_SLOTS;
      return slots[token.id];
    }

    const coord = TRACK_COORDINATES[token.step];
    if (!coord) return { top: '0%', left: '0%' };

    // Cell size is 100% / 15 = 6.666%
    const cellSize = 100 / 15;
    const top = `${coord.r * cellSize + cellSize * 0.1}%`;
    const left = `${coord.c * cellSize + cellSize * 0.1}%`;

    return { top, left };
  };

  const handleTokenTap = (token: TokenInfo) => {
    if (disabled || !isMyTurn) return;
    if (token.color !== userColor) return;
    if (!validTokenIds.includes(token.id)) return;

    sounds.playTokenStep();
    onTokenClick(token.id);
  };

  return (
    <div className="relative w-full aspect-square max-w-[420px] mx-auto bg-[#faf8ff] rounded-3xl shadow-xl border-4 border-indigo-950/20 overflow-hidden select-none p-1.5">
      
      {/* 15x15 Board Grid Container */}
      <div className="relative w-full h-full rounded-2xl bg-white overflow-hidden border border-slate-300 shadow-inner">
        
        {/* Quadrant 1: Top-Left (Blue decorative base) */}
        <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-2xl shadow-md border-2 border-blue-600/30 flex items-center justify-center">
            <span className="text-xs font-black tracking-wider text-blue-600/40 uppercase">RoomLudo</span>
          </div>
        </div>

        {/* Quadrant 2: Top-Right (GREEN Base Yard) */}
        <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-gradient-to-br from-emerald-500 to-teal-700 p-2.5 flex items-center justify-center shadow-sm">
          <div className="w-full h-full bg-emerald-50 rounded-2xl border-2 border-emerald-600/40 p-2 relative flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-emerald-800 tracking-wider flex items-center gap-1 uppercase">
                <Crown className="w-3 h-3 text-emerald-600" /> Green Base
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-600 text-white">
                {game.tokens.GREEN.filter(t => t.isHome).length}/4
              </span>
            </div>
            
            {/* 4 Base circle pedestals */}
            <div className="grid grid-cols-2 gap-2 p-1">
              <div className="w-9 h-9 rounded-full bg-emerald-200/80 border-2 border-emerald-400/60 shadow-inner mx-auto" />
              <div className="w-9 h-9 rounded-full bg-emerald-200/80 border-2 border-emerald-400/60 shadow-inner mx-auto" />
              <div className="w-9 h-9 rounded-full bg-emerald-200/80 border-2 border-emerald-400/60 shadow-inner mx-auto" />
              <div className="w-9 h-9 rounded-full bg-emerald-200/80 border-2 border-emerald-400/60 shadow-inner mx-auto" />
            </div>
          </div>
        </div>

        {/* Quadrant 3: Bottom-Left (RED Base Yard) */}
        <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-gradient-to-br from-rose-500 to-red-700 p-2.5 flex items-center justify-center shadow-sm">
          <div className="w-full h-full bg-rose-50 rounded-2xl border-2 border-rose-600/40 p-2 relative flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-rose-800 tracking-wider flex items-center gap-1 uppercase">
                <Crown className="w-3 h-3 text-rose-600" /> Red Base
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-600 text-white">
                {game.tokens.RED.filter(t => t.isHome).length}/4
              </span>
            </div>

            {/* 4 Base circle pedestals */}
            <div className="grid grid-cols-2 gap-2 p-1">
              <div className="w-9 h-9 rounded-full bg-rose-200/80 border-2 border-rose-400/60 shadow-inner mx-auto" />
              <div className="w-9 h-9 rounded-full bg-rose-200/80 border-2 border-rose-400/60 shadow-inner mx-auto" />
              <div className="w-9 h-9 rounded-full bg-rose-200/80 border-2 border-rose-400/60 shadow-inner mx-auto" />
              <div className="w-9 h-9 rounded-full bg-rose-200/80 border-2 border-rose-400/60 shadow-inner mx-auto" />
            </div>
          </div>
        </div>

        {/* Quadrant 4: Bottom-Right (Yellow decorative base) */}
        <div className="absolute bottom-0 right-0 w-[40%] h-[40%] bg-gradient-to-br from-amber-400 to-yellow-600 p-2.5 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-2xl shadow-md border-2 border-amber-500/30 flex items-center justify-center">
            <span className="text-xs font-black tracking-wider text-amber-500/40 uppercase">RoomLudo</span>
          </div>
        </div>

        {/* Center Home Zone (Triangle finish) */}
        <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-slate-900 overflow-hidden shadow-inner flex items-center justify-center">
          {/* Triangular home zones */}
          <div className="relative w-full h-full">
            {/* Red left triangle */}
            <div className="absolute inset-0 bg-rose-500 clip-triangle-left flex items-center justify-start pl-1">
              <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
            </div>
            {/* Green right triangle */}
            <div className="absolute inset-0 bg-emerald-500 clip-triangle-right flex items-center justify-end pr-1">
              <div className="w-2.5 h-2.5 rounded-full bg-white/40" />
            </div>
            {/* Center Victory Crown */}
            <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <div className="p-1 rounded-full bg-amber-400 text-slate-950 shadow-md">
                <Crown className="w-3.5 h-3.5 fill-current" />
              </div>
            </div>
          </div>
        </div>

        {/* Track Grid Cells (15x15) */}
        <div className="grid grid-cols-15 grid-rows-15 w-full h-full pointer-events-none">
          {Array.from({ length: 15 * 15 }).map((_, idx) => {
            const r = Math.floor(idx / 15);
            const c = idx % 15;

            // Skip corner base boxes and center
            const isTopLeft = r < 6 && c < 6;
            const isTopRight = r < 6 && c > 8;
            const isBottomLeft = r > 8 && c < 6;
            const isBottomRight = r > 8 && c > 8;
            const isCenter = r >= 6 && r <= 8 && c >= 6 && c <= 8;

            if (isTopLeft || isTopRight || isBottomLeft || isBottomRight || isCenter) {
              return <div key={idx} className="w-full h-full" />;
            }

            // Determine if this cell is a start, safe, runway, or neutral
            let cellBg = 'bg-white';
            let icon = null;

            // Red runway (r=7, c=1..5)
            if (r === 7 && c >= 1 && c <= 5) {
              cellBg = 'bg-rose-500 text-white';
            }
            // Green runway (r=7, c=9..13)
            else if (r === 7 && c >= 9 && c <= 13) {
              cellBg = 'bg-emerald-500 text-white';
            }
            // Red start cell (r=6, c=1)
            else if (r === 6 && c === 1) {
              cellBg = 'bg-rose-500 text-white';
              icon = <Star className="w-2.5 h-2.5 fill-white text-white" />;
            }
            // Green start cell (r=8, c=13)
            else if (r === 8 && c === 13) {
              cellBg = 'bg-emerald-500 text-white';
              icon = <Star className="w-2.5 h-2.5 fill-white text-white" />;
            }
            // Blue Start / Safe (r=1, c=8)
            else if (r === 1 && c === 8) {
              cellBg = 'bg-blue-400 text-white';
              icon = <Star className="w-2.5 h-2.5 fill-white text-white" />;
            }
            // Yellow Start / Safe (r=13, c=6)
            else if (r === 13 && c === 6) {
              cellBg = 'bg-amber-400 text-white';
              icon = <Star className="w-2.5 h-2.5 fill-white text-white" />;
            }
            // Other safe star cells
            else if ((r === 2 && c === 6) || (r === 6 && c === 12) || (r === 12 && c === 8) || (r === 8 && c === 2)) {
              cellBg = 'bg-slate-100';
              icon = <Shield className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />;
            }

            return (
              <div 
                key={idx} 
                className={`w-full h-full border-[0.5px] border-slate-300/80 flex items-center justify-center ${cellBg}`}
              >
                {icon}
              </div>
            );
          })}
        </div>

        {/* --- TOKENS RENDERING --- */}
        {/* RED TOKENS */}
        {game.tokens.RED.map((token) => {
          const isFinished = token.isHome || token.step === RED_FINISH;
          const posStyle = getTokenPositionStyle(token, 'RED');
          const isValid = isMyTurn && userColor === 'RED' && validTokenIds.includes(token.id);

          return (
            <div
              key={`red-tok-${token.id}`}
              onClick={() => handleTokenTap(token)}
              style={posStyle}
              className={`absolute w-[5.5%] h-[5.5%] -translate-x-1 -translate-y-1 z-30 transition-all duration-300 ${
                isValid ? 'cursor-pointer animate-bounce' : ''
              }`}
            >
              {/* Outer Glowing Ring if clickable */}
              {isValid && (
                <div className="absolute -inset-1.5 rounded-full bg-amber-400 animate-ping opacity-75 pointer-events-none" />
              )}

              {/* Token Piece */}
              <div className={`relative w-full h-full rounded-full bg-gradient-to-b from-rose-400 to-rose-700 border-2 border-white shadow-lg flex items-center justify-center ${
                isValid ? 'ring-2 ring-amber-400 scale-110 shadow-rose-500/50' : 'shadow-slate-900/30'
              }`}>
                {isFinished ? (
                  <Crown className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                ) : (
                  <span className="text-[9px] font-black text-white drop-shadow">
                    {token.id + 1}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {/* GREEN TOKENS */}
        {game.tokens.GREEN.map((token) => {
          const isFinished = token.isHome || token.step === GREEN_FINISH;
          const posStyle = getTokenPositionStyle(token, 'GREEN');
          const isValid = isMyTurn && userColor === 'GREEN' && validTokenIds.includes(token.id);

          return (
            <div
              key={`green-tok-${token.id}`}
              onClick={() => handleTokenTap(token)}
              style={posStyle}
              className={`absolute w-[5.5%] h-[5.5%] -translate-x-1 -translate-y-1 z-30 transition-all duration-300 ${
                isValid ? 'cursor-pointer animate-bounce' : ''
              }`}
            >
              {/* Outer Glowing Ring if clickable */}
              {isValid && (
                <div className="absolute -inset-1.5 rounded-full bg-amber-400 animate-ping opacity-75 pointer-events-none" />
              )}

              {/* Token Piece */}
              <div className={`relative w-full h-full rounded-full bg-gradient-to-b from-emerald-400 to-emerald-700 border-2 border-white shadow-lg flex items-center justify-center ${
                isValid ? 'ring-2 ring-amber-400 scale-110 shadow-emerald-500/50' : 'shadow-slate-900/30'
              }`}>
                {isFinished ? (
                  <Crown className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
                ) : (
                  <span className="text-[9px] font-black text-white drop-shadow">
                    {token.id + 1}
                  </span>
                )}
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
};
