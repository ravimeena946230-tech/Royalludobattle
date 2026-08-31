import React, { useState } from 'react';
import { MessageSquare, Send, X, Smile } from 'lucide-react';
import { ChatMessage, PlayerColor } from '../types';
import { sounds } from '../lib/soundEffects';

interface GameChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string, isEmoji?: boolean) => void;
  userColor: PlayerColor;
}

const QUICK_EMOJIS = ['🔥', '👑', '👍', '😮', '😂', '🎯', '👏', '⚡'];
const QUICK_PHRASES = [
  'Good Luck! 🎲',
  'Well Played! 👏',
  'Hurry up! ⏳',
  'Nice move! 🎯',
  'Unlucky roll! 😅',
  'Rematch? ⚔️',
];

export const GameChat: React.FC<GameChatProps> = ({
  messages,
  onSendMessage,
  userColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customText, setCustomText] = useState('');

  const handleSend = (text: string, isEmoji = false) => {
    if (!text.trim()) return;
    sounds.playClick();
    onSendMessage(text.trim(), isEmoji);
    setCustomText('');
  };

  const recentMessages = messages.slice(-3);

  return (
    <div className="relative z-30">
      {/* Floating Floating Notification Ticker of latest message */}
      {!isOpen && recentMessages.length > 0 && (
        <div className="flex flex-col gap-1 mb-1.5 pointer-events-none">
          {recentMessages.map(msg => (
            <div
              key={msg.id}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full shadow-md max-w-xs self-start backdrop-blur-md animate-in fade-in slide-in-from-bottom-1 ${
                msg.senderColor === userColor
                  ? 'bg-indigo-600/90 text-white'
                  : 'bg-slate-800/90 text-amber-300'
              }`}
            >
              <span className="opacity-75">{msg.senderName}:</span> {msg.message}
            </div>
          ))}
        </div>
      )}

      {/* Quick Action Tray (Emoji bar & Chat toggle) */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => { sounds.playClick(); setIsOpen(!isOpen); }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white text-slate-800 border border-slate-200 shadow-sm text-xs font-bold hover:bg-slate-50 active:scale-95"
        >
          <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
          <span>Chat</span>
        </button>

        {/* Quick Emoji Bar */}
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-xs p-1 rounded-full border border-slate-200 shadow-xs overflow-x-auto">
          {QUICK_EMOJIS.slice(0, 5).map(emoji => (
            <button
              key={emoji}
              onClick={() => handleSend(emoji, true)}
              className="text-base hover:scale-125 active:scale-95 transition-transform px-1"
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Expanded Chat Drawer Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-indigo-100 overflow-hidden flex flex-col max-h-[80vh]">
            
            {/* Header */}
            <div className="px-4 py-3 bg-gradient-to-r from-indigo-900 to-purple-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smile className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-xs">Match Chat & Emojis</span>
              </div>
              <button
                onClick={() => { sounds.playClick(); setIsOpen(false); }}
                className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 max-h-48 bg-slate-50">
              {messages.length === 0 ? (
                <p className="text-center text-xs text-slate-400 py-4">No messages yet. Send a quick phrase!</p>
              ) : (
                messages.map(msg => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      msg.senderColor === userColor ? 'items-end' : 'items-start'
                    }`}
                  >
                    <span className="text-[9px] text-slate-400 mb-0.5">{msg.senderName}</span>
                    <div className={`px-3 py-1.5 rounded-2xl text-xs max-w-[80%] ${
                      msg.isEmoji ? 'text-2xl bg-transparent p-0' :
                      msg.senderColor === userColor
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Quick Phrases */}
            <div className="p-2 bg-white border-t border-slate-100 grid grid-cols-2 gap-1.5">
              {QUICK_PHRASES.map(phrase => (
                <button
                  key={phrase}
                  onClick={() => handleSend(phrase)}
                  className="px-2 py-1.5 text-[11px] font-semibold text-slate-700 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl text-left truncate transition-colors"
                >
                  {phrase}
                </button>
              ))}
            </div>

            {/* Emoji Tray */}
            <div className="px-2 py-1.5 bg-slate-100 flex items-center justify-around border-t border-slate-200">
              {QUICK_EMOJIS.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => handleSend(emoji, true)}
                  className="text-lg hover:scale-125 active:scale-95 transition-transform"
                >
                  {emoji}
                </button>
              ))}
            </div>

            {/* Custom Input */}
            <div className="p-2.5 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={customText}
                onChange={e => setCustomText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend(customText)}
                placeholder="Type a message..."
                className="flex-1 px-3 py-1.5 rounded-full bg-slate-100 text-xs border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <button
                onClick={() => handleSend(customText)}
                className="p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 active:scale-95 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
