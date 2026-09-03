import React, { useState } from 'react';
import { GameState, PlayerColor, UserProfile } from '../types';
import { GameChat } from '../components/GameChat';
import { sounds } from '../lib/soundEffects';
import { 
  Trophy, 
  Clock, 
  ShieldCheck, 
  ArrowLeft, 
  Copy, 
  Check, 
  ExternalLink, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Camera
} from 'lucide-react';

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
  const isRedUser = game.players.RED?.userId === user.id;
  const userColor: PlayerColor = isRedUser ? 'RED' : 'GREEN';
  const opponentColor: PlayerColor = userColor === 'RED' ? 'GREEN' : 'RED';

  const myPlayer = game.players[userColor];
  const oppPlayer = game.players[opponentColor];

  // States
  const [copied, setCopied] = useState(false);
  const [inputLudoCode, setInputLudoCode] = useState(game.ludoKingCode || '');
  const [isSubmittingCode, setIsSubmittingCode] = useState(false);
  
  const [selectedResult, setSelectedResult] = useState<'WON' | 'LOST' | 'CANCEL' | null>(null);
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [isSubmittingResult, setIsSubmittingResult] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Statuses of submissions
  const mySubmission = game.resultsSubmitted?.[user.id];
  const oppSubmission = game.resultsSubmitted?.[oppPlayer?.userId || ''];

  const isHost = isRedUser; // RED is Host

  const handleCopyCode = () => {
    if (!game.ludoKingCode) return;
    sounds.playClick();
    navigator.clipboard.writeText(game.ludoKingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateLudoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inputLudoCode.trim();
    if (!cleanCode || cleanCode.length < 4) {
      setErrorMsg('Please enter a valid Ludo King Room Code');
      return;
    }

    setIsSubmittingCode(true);
    setErrorMsg(null);
    try {
      const response = await fetch(`/api/games/${game.id}/ludo-king-code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: cleanCode }),
      });
      if (response.ok) {
        sounds.playVictory();
        setSuccessMsg('Ludo King Room Code updated!');
        setTimeout(() => setSuccessMsg(null), 3000);
      } else {
        const d = await response.json();
        setErrorMsg(d.error || 'Failed to update Room Code');
      }
    } catch {
      setErrorMsg('Network error updating Room Code');
    } finally {
      setIsSubmittingCode(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setScreenshotFile(file);
      setScreenshotPreview(URL.createObjectURL(file));
      sounds.playClick();
    }
  };

  const handleSubmitResult = async (status: 'WON' | 'LOST' | 'CANCEL') => {
    if (status === 'WON' && !screenshotPreview) {
      setErrorMsg('Please attach a screenshot proof to submit a win.');
      return;
    }

    const confirmMsg = status === 'LOST' 
      ? 'Are you sure you want to submit a DEFEAT? This will immediately award the prize to your opponent.'
      : `Submit ${status} result for this match?`;

    if (!window.confirm(confirmMsg)) return;

    setIsSubmittingResult(true);
    setErrorMsg(null);
    try {
      // Simulate screenshot URL upload or use placeholder
      const mockUrl = screenshotPreview ? 'uploaded_proof_screenshot.png' : undefined;

      const response = await fetch(`/api/games/${game.id}/submit-result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status,
          screenshotUrl: mockUrl
        }),
      });

      if (response.ok) {
        sounds.playVictory();
        setSuccessMsg('Result submitted successfully!');
        setSelectedResult(null);
        setScreenshotFile(null);
        setScreenshotPreview(null);
      } else {
        const d = await response.json();
        setErrorMsg(d.error || 'Failed to submit result');
      }
    } catch {
      setErrorMsg('Network error while submitting result');
    } finally {
      setIsSubmittingResult(false);
    }
  };

  function handleConfirmLoss() {
    handleSubmitResult('LOST');
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-100px)] max-w-md mx-auto py-3 px-4 select-none pb-24 space-y-4 bg-[#f8fafc]">
      
      {/* HEADER NAVIGATION: Exact matching tajbattle back styling */}
      <div className="flex items-center justify-between pb-1">
        <button
          onClick={() => { sounds.playClick(); onExitGame(); }}
          className="flex items-center gap-1.5 text-xs text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2 rounded-full font-bold shadow-2xs transition-all active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-blue-600" />
          <span>Back</span>
        </button>
        <span className="text-[10px] bg-blue-50 text-blue-600 font-extrabold border border-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">
          Taj Battle Match Room
        </span>
      </div>

      {/* 1. LIVE MATCH STATUS CARD */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        {/* Top section: Live Match badge */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full font-black text-[10px] uppercase tracking-wider border border-emerald-100/60">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-pulse" />
            <span>Live Match</span>
          </div>
        </div>

        {/* Middle row: Entry Fee & Prize display with divider */}
        <div className="grid grid-cols-2 divide-x divide-slate-100 pt-1 pb-1 text-center">
          <div className="text-left pl-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Entry</span>
            <span className="text-xl font-black text-slate-950">₹{game.entryFee}</span>
          </div>
          <div className="text-right pr-3">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-0.5">Prize</span>
            <span className="text-xl font-black text-blue-600">₹{game.prizeAmount}</span>
          </div>
        </div>

        {/* Bottom row: Versus players profiles */}
        <div className="flex items-center justify-between pt-2.5 px-1 pb-1">
          {/* Host - RED */}
          <div className="flex items-center gap-2.5">
            <img 
              src={game.players.RED?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"} 
              alt="RED Player" 
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
              referrerPolicy="no-referrer"
            />
            <div className="text-left">
              <p className="text-xs font-black text-slate-800 truncate max-w-[85px]">{game.players.RED?.username || "Host"}</p>
              <span className="text-[8px] font-black text-rose-500 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded-md uppercase">Host</span>
            </div>
          </div>

          {/* Versus badge */}
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-extrabold text-[11px] flex items-center justify-center shadow-xs">
            VS
          </div>

          {/* Guest - GREEN */}
          <div className="flex items-center gap-2.5 flex-row-reverse">
            <img 
              src={game.players.GREEN?.avatar || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80"} 
              alt="GREEN Player" 
              className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs"
              referrerPolicy="no-referrer"
            />
            <div className="text-right">
              <p className="text-xs font-black text-slate-800 truncate max-w-[85px]">{game.players.GREEN?.username || "Opponent"}</p>
              <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded-md uppercase">Opponent</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. DISPUTE ALERT IF APPLICABLE */}
      {game.disputed && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-200 text-xs font-semibold leading-relaxed flex items-start gap-2.5 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-pulse" />
          <div>
            <strong className="text-amber-400 font-black block mb-0.5">⚠️ Match Under Dispute!</strong>
            दोनों खिलाड़ियों ने परस्पर भिन्न परिणाम (जैसे दोनों ने "I WON") सबमिट किए हैं। एडमिन आपके प्रूफ स्क्रीनशॉट की जांच करके 1-5 मिनट में विजेता घोषित करेंगे।
          </div>
        </div>
      )}

      {/* 3. LUDO KING ROOM CODE CARD (Designed exactly like screenshot) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            {/* Key icon */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m0 0a2 2 0 01-2 2m2-2h3m-3 4h3m-6.343-3.172L12 12m0 0l-1.5-1.5M12 12v6a2 2 0 01-2 2H8a2 2 0 01-2-2v-2a2 2 0 012-2h2" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-extrabold text-sm text-slate-900">Room Code</h3>
            <p className="text-[10px] text-slate-500 font-semibold">Share & join in Ludo King</p>
          </div>
        </div>

        {game.ludoKingCode ? (
          /* When Code has been successfully posted */
          <div className="space-y-3.5">
            <div className="p-1 bg-[#f8fafc] border border-slate-100 rounded-2xl flex items-center justify-between pl-5 pr-2 py-2">
              <span className="text-2xl font-extrabold text-blue-600 tracking-widest font-mono">
                {game.ludoKingCode}
              </span>
              <button
                onClick={handleCopyCode}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 active:scale-95 transition-all shadow-sm shadow-blue-500/10"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>

            <button 
              onClick={() => {
                sounds.playClick();
                window.open('https://play.google.com/store/apps/details?id=com.ludo.king', '_blank');
              }}
              className="w-full py-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-extrabold text-xs uppercase flex items-center justify-center gap-1.5 active:scale-95 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
              <span>Play game in Ludo King App</span>
            </button>
          </div>
        ) : (
          /* When Code hasn't been posted yet */
          isHost ? (
            /* Host input form */
            <form onSubmit={handleUpdateLudoCode} className="space-y-3.5">
              <div className="p-3 bg-blue-55/5 rounded-2xl border border-dashed border-blue-100 text-[11px] text-blue-700 font-semibold leading-relaxed">
                👉 Ludo King App खोलें, <strong className="font-extrabold text-blue-800">'Play with Friends' &rarr; 'Create Room'</strong> करें और प्राप्त 8-अंकों का कोड नीचे डालें ताकि विरोधी खिलाड़ी जुड़ सके।
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  maxLength={8}
                  value={inputLudoCode}
                  onChange={(e) => setInputLudoCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 07975951"
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 font-black text-lg text-center tracking-widest text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-2xs"
                />
                <button
                  type="submit"
                  disabled={isSubmittingCode}
                  className="px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider active:scale-95 transition-all disabled:opacity-50 shadow-sm"
                >
                  {isSubmittingCode ? '...' : 'Submit'}
                </button>
              </div>
            </form>
          ) : (
            /* Guest waiting screen */
            <div className="p-5 rounded-2xl bg-amber-500/5 border border-dashed border-amber-500/20 text-center space-y-2">
              <Clock className="w-6 h-6 text-amber-500 mx-auto animate-spin" />
              <p className="text-xs font-black text-amber-700">⏳ Waiting for Host to post Room Code...</p>
              <p className="text-[10px] text-slate-500 font-medium">जैसे ही होस्ट लूडो किंग रूम कोड पोस्ट करेगा, वह यहाँ दिखाई देगा।</p>
            </div>
          )
        )}
      </div>

      {/* 4. MATCH RULES (Exact design to screenshot 2) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            {/* Shield Icon */}
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div className="text-left">
            <h3 className="font-extrabold text-sm text-slate-900">Match Rules</h3>
            <p className="text-[10px] text-slate-500 font-semibold">Follow these to avoid penalty</p>
          </div>
        </div>

        <div className="space-y-2">
          {[
            "Record every game",
            "Video proof required",
            "Wrong result = penalty",
            "Result not updated \u2192 penalty \u20B925"
          ].map((rule, idx) => (
            <div key={idx} className="flex items-center gap-2.5 px-4 py-2.5 bg-blue-50/50 hover:bg-blue-50 text-blue-700 font-bold text-xs rounded-xl border border-blue-50 text-left transition-colors">
              <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
              <span>{rule}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. UPDATE GAME STATUS (3 Button Columns exact design to screenshot) */}
      <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Trophy className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-extrabold text-sm text-slate-900">Update Game Status</h3>
            <p className="text-[10px] text-slate-500 font-semibold">Submit result after the match</p>
          </div>
        </div>

        {mySubmission ? (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-center space-y-2">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto" />
            <p className="text-xs font-black text-slate-900">आपकी रिपोर्ट सबमिट हो चुकी है!</p>
            <div className="text-[10px] text-slate-500">
              <span className="font-bold">रिपोर्ट प्रकार: </span> 
              <span className={`font-black uppercase px-2 py-0.5 rounded-md ${
                mySubmission.status === 'WON' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>{mySubmission.status}</span>
            </div>
            {oppSubmission ? (
              <p className="text-[10px] text-indigo-600 font-bold animate-pulse mt-1">⏳ विपक्षी की रिपोर्ट जांची जा रही है...</p>
            ) : (
              <p className="text-[10px] text-amber-600 font-bold mt-1">⏳ विपक्षी द्वारा परिणाम सबमिट करने की प्रतीक्षा है...</p>
            )}
          </div>
        ) : game.status === 'FINISHED' && game.winner ? (
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center space-y-2">
            <Trophy className="w-8 h-8 text-amber-500 mx-auto" />
            <p className="text-sm font-black text-slate-900">🏆 मैच समाप्त हो गया है!</p>
            <p className="text-xs font-semibold text-slate-600">
              विजेता: <strong className="text-blue-600">{game.winner === userColor ? 'आप (YOU)' : 'विपक्षी'}</strong>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {!selectedResult ? (
              <div className="grid grid-cols-3 gap-2.5">
                {/* I WON BUTTON */}
                <button
                  onClick={() => { sounds.playClick(); setSelectedResult('WON'); }}
                  className="py-3.5 px-2 rounded-2xl bg-[#10b981] hover:bg-[#059669] text-white font-extrabold text-xs uppercase flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
                >
                  <Trophy className="w-4.5 h-4.5 text-white" />
                  <span>I Won</span>
                </button>
                
                {/* I LOST BUTTON */}
                <button
                  onClick={() => { sounds.playClick(); handleConfirmLoss(); }}
                  className="py-3.5 px-2 rounded-2xl bg-[#ef4444] hover:bg-[#dc2626] text-white font-extrabold text-xs uppercase flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
                >
                  <XCircle className="w-4.5 h-4.5 text-white" />
                  <span>I Lost</span>
                </button>

                {/* CANCEL BUTTON */}
                <button
                  onClick={() => { sounds.playClick(); setSelectedResult('CANCEL'); }}
                  className="py-3.5 px-2 rounded-2xl bg-[#f1f5f9] hover:bg-slate-200 text-slate-700 border border-slate-200 font-extrabold text-xs uppercase flex flex-col items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 shrink-0"
                >
                  <AlertTriangle className="w-4.5 h-4.5 text-slate-500" />
                  <span>Cancel</span>
                </button>
              </div>
            ) : selectedResult === 'WON' ? (
              /* Screenshot Upload Form */
              <div className="p-4 border border-dashed border-blue-200 bg-blue-50/10 rounded-2xl space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">🏆 SUBMIT WON PROOF</span>
                  <button 
                    onClick={() => setSelectedResult(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Back
                  </button>
                </div>

                <div className="space-y-2.5">
                  {!screenshotPreview ? (
                    <label className="flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed border-blue-200 bg-white hover:bg-blue-50/30 cursor-pointer transition-all">
                      <Upload className="w-6 h-6 text-blue-500 animate-bounce" />
                      <span className="text-[11px] font-bold text-blue-600 mt-1">Upload Score Screenshot</span>
                      <span className="text-[9px] text-slate-400 mt-0.5">Winning screen proof from Ludo King</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  ) : (
                    <div className="space-y-2">
                      <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black aspect-video max-h-36">
                        <img 
                          src={screenshotPreview} 
                          alt="Proof preview" 
                          className="w-full h-full object-contain"
                        />
                        <button
                          onClick={() => { setScreenshotFile(null); setScreenshotPreview(null); }}
                          className="absolute top-1.5 right-1.5 p-1 rounded-full bg-black/60 text-white text-xs hover:bg-black font-bold"
                        >
                          ✕ Remove
                        </button>
                      </div>
                      
                      <button
                        onClick={() => handleSubmitResult('WON')}
                        disabled={isSubmittingResult}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/10 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>{isSubmittingResult ? 'Uploading...' : 'Submit Win Screenshot'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* CANCEL / DISPUTE DETAILS */
              <div className="p-4 border border-dashed border-slate-200 bg-slate-50 rounded-2xl space-y-3 text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">⚠️ Dispute or Cancel</span>
                  <button 
                    onClick={() => setSelectedResult(null)}
                    className="text-[10px] text-slate-400 hover:text-slate-600 font-bold"
                  >
                    Back
                  </button>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">यदि गेम शुरू नहीं हुआ, विरोधी भाग गया या कोई अन्य समस्या है तो यहाँ रद्द करने की रिक्वेस्ट डालें:</p>
                <button
                  onClick={() => handleSubmitResult('CANCEL')}
                  disabled={isSubmittingResult}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider disabled:opacity-50"
                >
                  {isSubmittingResult ? 'Submitting...' : 'Confirm Dispute / Cancel'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Global Error/Success Messages */}
        {errorMsg && <p className="text-[10px] text-rose-500 font-bold text-center">{errorMsg}</p>}
        {successMsg && <p className="text-[10px] text-emerald-500 font-bold text-center">{successMsg}</p>}
      </div>

      {/* 6. DIRECT MATCH CHAT */}
      <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="p-3 bg-white border-b border-slate-200 flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <h4 className="text-xs font-black text-slate-800">Match Direct Chat</h4>
        </div>
        <div className="p-1">
          <GameChat
            messages={game.chatMessages}
            onSendMessage={onSendChat}
            userColor={userColor}
          />
        </div>
      </div>

    </div>
  );
};
