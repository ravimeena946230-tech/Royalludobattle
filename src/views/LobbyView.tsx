import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Share2, 
  Users, 
  Trophy, 
  Crown, 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Clock,
  Sparkles,
  MessageCircle
} from 'lucide-react';
import { Room, UserProfile, RoomPlayer } from '../types';
import { sounds } from '../lib/soundEffects';

interface LobbyViewProps {
  room: Room;
  user: UserProfile;
  onToggleReady: () => void;
  onStartGame: () => void;
  onLeaveRoom: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
  room,
  user,
  onToggleReady,
  onStartGame,
  onLeaveRoom,
}) => {
  const [copied, setCopied] = useState(false);

  const mePlayer = room.players.find(p => p.userId === user.id);
  const isHost = mePlayer?.isHost || room.hostId === user.id;

  const redPlayer = room.players.find(p => p.color === 'RED');
  const greenPlayer = room.players.find(p => p.color === 'GREEN');

  const bothReady = room.players.length === 2 && room.players.every(p => p.isReady);

  const handleCopyCode = () => {
    sounds.playClick();
    navigator.clipboard.writeText(room.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppShare = () => {
    sounds.playClick();
    const url = `${window.location.origin}/login?room=${room.code}`;
    const text = `Play Ludo with me on RoomLudo! 🎲\nRoom Code: *${room.code}*\nEntry Fee: ₹${room.entryFee}\nPrize: ₹${room.prizeAmount}\nJoin here: ${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-20 pt-1">
      
      {/* Top Bar with Back/Leave */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { sounds.playClick(); onLeaveRoom(); }}
          className="flex items-center gap-1 text-xs font-bold text-slate-700 p-1.5 rounded-xl hover:bg-slate-100"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Room</span>
        </button>

        <span className="text-xs font-black text-indigo-900 bg-indigo-100 px-3 py-1 rounded-full border border-indigo-200">
          Status: {room.status}
        </span>
      </div>

      {/* Room Code Card with Instant Copy & Share */}
      <div className="p-5 rounded-3xl bg-gradient-to-br from-[#1e1b4b] to-[#3730a3] text-white shadow-xl text-center relative overflow-hidden border border-indigo-500/30">
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-28 h-28 rounded-full bg-amber-400/10 blur-xl pointer-events-none" />
        
        <span className="text-[10px] font-bold text-amber-300 uppercase tracking-widest block">
          Private Room Code
        </span>

        <div className="my-2.5 flex items-center justify-center gap-2">
          <span className="font-mono font-black text-3xl tracking-widest text-white drop-shadow">
            {room.code}
          </span>
          <button
            onClick={handleCopyCode}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-amber-300"
            title="Copy Code"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <p className="text-xs text-indigo-200">Share this 6-digit code with your friend to start playing</p>

        {/* Share Buttons */}
        <div className="mt-3.5 flex items-center justify-center gap-2">
          <button
            onClick={handleWhatsAppShare}
            className="flex-1 py-2 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Share to WhatsApp</span>
          </button>

          <button
            onClick={handleCopyCode}
            className="py-2 px-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Share2 className="w-4 h-4" />
            <span>Copy Link</span>
          </button>
        </div>
      </div>

      {/* Stake & Prize Info Banner */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-2xl bg-white border border-indigo-100 shadow-2xs text-center">
          <span className="text-[10px] font-semibold text-slate-500 uppercase">Entry Stake</span>
          <p className="text-base font-black text-slate-900 mt-0.5">₹{room.entryFee}</p>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-emerald-100 shadow-2xs text-center">
          <span className="text-[10px] font-semibold text-emerald-600 uppercase">Winning Prize</span>
          <p className="text-base font-black text-emerald-600 mt-0.5">₹{room.prizeAmount}</p>
        </div>
      </div>

      {/* 2-Player Matchup Display */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-600" />
            <span>Room Matchup (2 Players)</span>
          </h3>
          <span className="text-xs font-bold text-slate-500">{room.players.length}/2 Joined</span>
        </div>

        {/* Player 1 (Host - RED) */}
        <div className="p-3.5 rounded-2xl bg-white border-2 border-rose-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img 
                src={redPlayer ? redPlayer.avatar : user.avatar} 
                alt="Host"
                className="w-11 h-11 rounded-2xl border-2 border-rose-500 object-cover"
              />
              <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-rose-500 text-white text-[8px] font-black uppercase px-1">
                RED
              </span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-slate-900">{redPlayer?.username || 'Host'}</span>
                <span className="text-[9px] font-extrabold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                  HOST
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">Connected • 15ms ping</p>
            </div>
          </div>

          <div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
              redPlayer?.isReady
                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                : 'bg-amber-100 text-amber-700 border border-amber-300'
            }`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {redPlayer?.isReady ? 'READY' : 'WAITING'}
            </span>
          </div>
        </div>

        {/* VS Separator */}
        <div className="flex items-center justify-center">
          <span className="px-3 py-1 rounded-full bg-slate-200 text-slate-700 font-black text-xs shadow-inner">
            VS
          </span>
        </div>

        {/* Player 2 (Guest - GREEN) */}
        {greenPlayer ? (
          <div className="p-3.5 rounded-2xl bg-white border-2 border-emerald-200 shadow-xs flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img 
                  src={greenPlayer.avatar} 
                  alt="Guest"
                  className="w-11 h-11 rounded-2xl border-2 border-emerald-500 object-cover"
                />
                <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-emerald-500 text-white text-[8px] font-black uppercase px-1">
                  GREEN
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900">{greenPlayer.username}</span>
                  <span className="text-[9px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                    GUEST
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-0.5">Connected • 20ms ping</p>
              </div>
            </div>

            <div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 ${
                greenPlayer.isReady
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                  : 'bg-amber-100 text-amber-700 border border-amber-300'
              }`}>
                <CheckCircle2 className="w-3.5 h-3.5" />
                {greenPlayer.isReady ? 'READY' : 'WAITING'}
              </span>
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-50 border-2 border-dashed border-slate-200 text-center space-y-1">
            <Clock className="w-6 h-6 text-slate-400 mx-auto animate-spin" />
            <p className="text-xs font-bold text-slate-600">Waiting for 2nd player to enter code...</p>
            <p className="text-[10px] text-indigo-600 font-semibold">Share code #{room.code} with your friend</p>
          </div>
        )}
      </div>

      {/* Action Area */}
      <div className="pt-3 space-y-2">
        {/* Toggle Readiness button */}
        <button
          onClick={() => { sounds.playClick(); onToggleReady(); }}
          className={`w-full py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
            mePlayer?.isReady
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-600/30'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/30'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{mePlayer?.isReady ? "You are READY! (Tap to unready)" : "Tap here to mark I'M READY"}</span>
        </button>

        {/* Start Game Button (Host Only when both ready) */}
        {isHost && (
          <button
            onClick={() => { sounds.playClick(); onStartGame(); }}
            disabled={!bothReady}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 hover:from-amber-600 hover:to-rose-700 text-white font-black text-sm uppercase tracking-wider shadow-lg shadow-orange-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>{bothReady ? "START LUDO MATCH NOW!" : "WAITING FOR PLAYERS TO BE READY"}</span>
          </button>
        )}
      </div>

    </div>
  );
};
