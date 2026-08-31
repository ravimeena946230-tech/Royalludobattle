import React, { useState } from 'react';
import { 
  Headphones, 
  MessageSquare, 
  MessageCircle, 
  Send, 
  X,
  Bot
} from 'lucide-react';
import { UserProfile } from '../types';
import { sounds } from '../lib/soundEffects';

interface SupportViewProps {
  user: UserProfile;
}

export const SupportView: React.FC<SupportViewProps> = ({ user }) => {
  const [showLiveChatModal, setShowLiveChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'agent'; text: string; time: string }>>([
    {
      sender: 'agent',
      text: `Hello ${user.username || 'User'}! Welcome to Royalludobattle Live Support. How can we help you today with your deposits, withdrawals or gameplay?`,
      time: 'Just now',
    }
  ]);
  const [inputMsg, setInputMsg] = useState('');

  const handleWhatsAppSupport = () => {
    sounds.playClick();
    const text = `Hello Royalludobattle Support! I need help with my account (Mobile: +91 ${user.mobile}, User ID: ${user.id}).`;
    window.open(`https://api.whatsapp.com/send?phone=919462300000&text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleTelegramSupport = () => {
    sounds.playClick();
    window.open('https://t.me/royalludobattle_support', '_blank');
  };

  const handleSendLiveMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMsg.trim()) return;

    sounds.playClick();
    const userText = inputMsg;
    setInputMsg('');

    const newMsg = {
      sender: 'user' as const,
      text: userText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);

    // Simulate Agent Auto-response
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'agent',
          text: `Thank you for contacting us! Our executive is reviewing your request regarding: "${userText}". We will update your wallet/account within a few minutes.`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    }, 1000);
  };

  return (
    <div className="space-y-4 pb-24 pt-1">
      
      {/* 1. TOP HERO CARD (White card with purple icon & title) */}
      <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-xs text-center flex flex-col items-center justify-center space-y-2.5">
        <div className="w-14 h-14 rounded-2xl bg-[#6366f1] flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
          <Headphones className="w-7 h-7 stroke-[2.2]" />
        </div>

        <h1 className="text-xl font-black text-[#6366f1] font-['Outfit'] tracking-tight">
          Premium Support
        </h1>

        <p className="text-xs text-slate-500 font-medium max-w-xs leading-relaxed">
          Instant help for deposit, withdrawal, KYC & gameplay issues.
        </p>
      </div>

      {/* 2. THREE FULL-WIDTH SUPPORT BUTTONS */}
      <div className="space-y-3">
        
        {/* BUTTON 1: Chat Support (Blue Gradient) */}
        <div
          id="btn-support-chat"
          onClick={() => { sounds.playClick(); setShowLiveChatModal(true); }}
          className="relative p-4 rounded-3xl bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white shadow-md shadow-blue-500/20 overflow-hidden flex items-center justify-between cursor-pointer active:scale-98 transition-all min-h-[76px]"
        >
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <MessageSquare className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight leading-tight">Chat Support</h3>
              <p className="text-[11px] text-blue-100 font-medium mt-0.5">Live help inside the app</p>
            </div>
          </div>

          {/* Watermark Chat Icon */}
          <MessageSquare className="absolute -right-2 -bottom-2 w-20 h-20 text-white/15 pointer-events-none stroke-[1.2]" />
        </div>

        {/* BUTTON 2: WhatsApp Support (Green Gradient) */}
        <div
          id="btn-support-whatsapp"
          onClick={handleWhatsAppSupport}
          className="relative p-4 rounded-3xl bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white shadow-md shadow-green-500/20 overflow-hidden flex items-center justify-between cursor-pointer active:scale-98 transition-all min-h-[76px]"
        >
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <MessageCircle className="w-5 h-5 fill-white stroke-none" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight leading-tight">WhatsApp Support</h3>
              <p className="text-[11px] text-emerald-100 font-medium mt-0.5">Instant chat support</p>
            </div>
          </div>

          {/* Watermark WhatsApp Icon */}
          <MessageCircle className="absolute -right-2 -bottom-2 w-20 h-20 text-white/15 pointer-events-none fill-white/15 stroke-none" />
        </div>

        {/* BUTTON 3: Telegram Support (Purple Gradient) */}
        <div
          id="btn-support-telegram"
          onClick={handleTelegramSupport}
          className="relative p-4 rounded-3xl bg-gradient-to-r from-[#a855f7] to-[#8b5cf6] text-white shadow-md shadow-purple-500/20 overflow-hidden flex items-center justify-between cursor-pointer active:scale-98 transition-all min-h-[76px]"
        >
          <div className="flex items-center gap-3.5 relative z-10">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0">
              <Send className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-black text-sm tracking-tight leading-tight">Telegram Support</h3>
              <p className="text-[11px] text-purple-100 font-medium mt-0.5">Quick message support</p>
            </div>
          </div>

          {/* Watermark Telegram Icon */}
          <Send className="absolute -right-2 -bottom-2 w-20 h-20 text-white/15 pointer-events-none stroke-[1.2]" />
        </div>

      </div>

      {/* 3. FOOTER TEXT & REFRESH LINK */}
      <div className="pt-4 text-center space-y-2">
        <p className="text-[11px] text-slate-400 font-medium max-w-xs mx-auto leading-relaxed">
          We are committed to providing a smooth & secure gaming experience.
        </p>

        <p className="text-xs text-slate-500 font-medium">
          App looking old?{' '}
          <button 
            onClick={() => window.location.reload()}
            className="text-[#3b82f6] font-bold hover:underline cursor-pointer"
          >
            Refresh app
          </button>
        </p>
      </div>

      {/* --- IN-APP LIVE CHAT MODAL --- */}
      {showLiveChatModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col h-[500px] max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm font-['Outfit']">Royalludobattle Live Chat</h3>
                  <div className="flex items-center gap-1 text-[10px] text-emerald-300 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Agent Online</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => { sounds.playClick(); setShowLiveChatModal(false); }}
                className="p-1 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Message Stream */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-2xl max-w-[80%] leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-blue-600 text-white rounded-tr-xs shadow-xs'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-tl-xs shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-400 mt-1 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input Box */}
            <form onSubmit={handleSendLiveMsg} className="p-3 bg-white border-t border-slate-100 flex items-center gap-2 shrink-0">
              <input
                type="text"
                value={inputMsg}
                onChange={(e) => setInputMsg(e.target.value)}
                placeholder="Type your message here..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white active:scale-95 transition-transform cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};

