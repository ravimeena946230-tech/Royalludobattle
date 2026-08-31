import React, { useState, useEffect } from 'react';
import { GameState, PlayerColor, UserProfile, ViewType } from '../types';
import { LudoBoard } from '../components/LudoBoard';
import { Dice3D } from '../components/Dice3D';
import { GameChat } from '../components/GameChat';
import { GameOverModal } from '../components/GameOverModal';
import { sounds } from '../lib/soundEffects';
import { Trophy, Clock, ShieldCheck, Flame, ArrowLeft } from 'lucide-react';

interface GameViewProps {
  game: GameState;
  user: UserProfile;
  onRollDice: () => void;
  onMoveToken: (tokenId: number) => void;
  onSendChat: (message: string, isEmoji?: boolean) => void;
  onPlayAgain: () => void;
  onReturnToLobby: () => void;
  onExitGame: () => void;
}

export const GameView: React.FC<GameViewProps> = ({
  game,
  user,
  onRollDice,
  onMoveToken,
  onSendChat,
  onPlayAgain,
  onReturnToLobby,
  onExitGame,
}) => {
  // Determine this user's player color
  const isRedUser = game.players.RED?.userId === user.id;
  const userColor: PlayerColor = isRedUser ? 'RED' : 'GREEN';
  const opponentColor: PlayerColor = userColor === 'RED' ? 'GREEN' : 'RED';

  const myPlayer = game.players[userColor];
  const oppPlayer = game.players[opponentColor];

  const isMyTurn = game.currentTurn === userColor;

  // Local turn timer countdown
  const [turnSeconds, setTurnSeconds] = useState(15);

  useEffect(() => {
    setTurnSeconds(15);
    const interval = setInterval(() => {
      setTurnSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [game.currentTurn, game.diceValue]);

  // Number of tokens home
  const myTokensHome = game.tokens[userColor].filter(t => t.isHome).length;
  const oppTokensHome = game.tokens[opponentColor].filter(t => t.isHome).length;

  return (
    <div className="flex flex-col justify-between min-h-[calc(100vh-120px)] max-w-md mx-auto py-1 px-2 select-none relative pb-16">
      
      {/* Top Header / Match Status */}
      <div className="flex items-center justify-between px-2 py-1 bg-white/80 backdrop-blur-md rounded-2xl border border-indigo-100 shadow-2xs mb-1.5">
        <button
          onClick={() => { sounds.playClick(); onExitGame(); }}
          className="flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
            Room #{game.roomCode}
          </span>
          <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
            <Trophy className="w-3 h-3 text-emerald-600" />
            Prize: ₹{game.prizeAmount}
          </span>
        </div>
      </div>

      {/* Opponent HUD Card (Top) */}
      <div className={`p-2.5 rounded-2xl border transition-all ${
        game.currentTurn === opponentColor
          ? opponentColor === 'GREEN'
            ? 'bg-emerald-50/90 border-emerald-400 shadow-md ring-2 ring-emerald-300'
            : 'bg-rose-50/90 border-rose-400 shadow-md ring-2 ring-rose-300'
          : 'bg-white border-slate-200'
      } flex items-center justify-between shadow-xs mb-1`}>
        
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={oppPlayer?.avatar || 'https://api.dicebear.com/7.x/bottts/svg?seed=opp'}
              alt="Opponent"
              className={`w-10 h-10 rounded-xl object-cover border-2 ${
                opponentColor === 'GREEN' ? 'border-emerald-500' : 'border-rose-500'
              }`}
            />
            <span className={`absolute -bottom-1 -right-1 p-0.5 rounded-full text-[8px] font-black text-white px-1 ${
              opponentColor === 'GREEN' ? 'bg-emerald-600' : 'bg-rose-600'
            }`}>
              {opponentColor}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs text-slate-900">{oppPlayer?.username || 'Opponent'}</span>
              {game.currentTurn === opponentColor && (
                <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded-full animate-pulse">
                  Rolling...
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500">Tokens Home: <strong>{oppTokensHome}/4</strong></p>
          </div>
        </div>

        {/* Opponent Dice Indicator */}
        <div className="flex items-center gap-2">
          {game.currentTurn === opponentColor && game.hasRolled && game.diceValue && (
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white font-black text-base flex items-center justify-center shadow-md animate-bounce">
              {game.diceValue}
            </div>
          )}
        </div>
      </div>

      {/* Center 15x15 Interactive Ludo Board */}
      <div className="my-auto py-1">
        <LudoBoard
          game={game}
          userColor={userColor}
          onTokenClick={onMoveToken}
        />
      </div>

      {/* Game Action Event Banner */}
      {game.lastMove && (
        <div className="my-1 text-center">
          <span className="inline-flex items-center gap-1 text-[11px] font-black px-3 py-1 rounded-full bg-slate-900/90 text-amber-300 shadow-md backdrop-blur-xs animate-in fade-in slide-in-from-bottom-1">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            {game.lastMove.capturedToken
              ? `🔥 Token Captured! Bonus Turn!`
              : game.lastMove.toStep === 105 || game.lastMove.toStep === 205
              ? `👑 Token Reached Home! Bonus Roll!`
              : game.diceValue === 6
              ? `⚡ Rolled a 6! Roll again!`
              : `Token ${game.lastMove.tokenId + 1} moved`}
          </span>
        </div>
      )}

      {/* My HUD Card & Dice Controls (Bottom) */}
      <div className={`p-3 rounded-2xl border transition-all ${
        isMyTurn
          ? userColor === 'RED'
            ? 'bg-rose-50/90 border-rose-400 shadow-lg ring-2 ring-rose-400'
            : 'bg-emerald-50/90 border-emerald-400 shadow-lg ring-2 ring-emerald-400'
          : 'bg-white border-slate-200'
      } flex items-center justify-between shadow-md mt-1`}>
        
        {/* My Profile */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <img
              src={user.avatar}
              alt={user.username}
              className={`w-11 h-11 rounded-xl object-cover border-2 ${
                userColor === 'RED' ? 'border-rose-500' : 'border-emerald-500'
              }`}
            />
            <span className={`absolute -bottom-1 -right-1 p-0.5 rounded-full text-[8px] font-black text-white px-1 ${
              userColor === 'RED' ? 'bg-rose-600' : 'bg-emerald-600'
            }`}>
              {userColor} (YOU)
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-xs text-slate-900">{user.username}</span>
              {isMyTurn && (
                <span className="text-[9px] font-extrabold text-white bg-rose-600 px-1.5 py-0.2 rounded-full animate-bounce">
                  YOUR TURN
                </span>
              )}
            </div>
            <p className="text-[10px] text-slate-500 font-medium">Home: <strong className="text-slate-800">{myTokensHome}/4</strong></p>
          </div>
        </div>

        {/* 3D Dice Component */}
        <Dice3D
          value={game.diceValue}
          isRolling={false}
          playerColor={userColor}
          isMyTurn={isMyTurn}
          hasRolled={game.hasRolled}
          onRoll={onRollDice}
          timeRemaining={turnSeconds}
        />
      </div>

      {/* Floating In-Game Chat Tray */}
      <div className="mt-2">
        <GameChat
          messages={game.chatMessages}
          onSendMessage={onSendChat}
          userColor={userColor}
        />
      </div>

      {/* Game Over Victory / Defeat Modal */}
      {game.status === 'FINISHED' && (
        <GameOverModal
          game={game}
          user={user}
          userColor={userColor}
          onPlayAgain={onPlayAgain}
          onReturnToLobby={onReturnToLobby}
        />
      )}

    </div>
  );
};
