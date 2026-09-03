import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Users, 
  FileText, 
  Headphones, 
  TrendingUp, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  CreditCard,
  RefreshCw,
  Lock,
  KeyRound,
  ArrowRight,
  ChevronLeft,
  Eye,
  EyeOff,
  ShieldCheck,
  Gamepad2,
  Trophy,
  Wallet,
  Gift,
  Bell,
  Sliders,
  AlertTriangle,
  Send,
  UserCheck,
  UserX,
  Ban,
  DollarSign,
  Activity,
  Check,
  ExternalLink,
  MessageSquare,
  Clock,
  Sparkles,
  Award,
  CircleDollarSign,
  Layers,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  QrCode,
  Building2,
  Smartphone,
  Copy
} from 'lucide-react';
import { 
  UserProfile, 
  SupportTicket, 
  Room, 
  GameState, 
  Transaction, 
  AdminAuditLog, 
  PlatformSettings,
  PlayerColor
} from '../types';
import { sounds } from '../lib/soundEffects';

interface AdminViewProps {
  currentUser: UserProfile;
  onBack?: () => void;
  onRefreshProfile?: () => void;
}

type AdminTab = 
  | 'DASHBOARD'
  | 'USERS'
  | 'ROOMS'
  | 'GAMES'
  | 'WALLET'
  | 'REFERRALS'
  | 'KYC'
  | 'SUPPORT'
  | 'NOTIFICATIONS'
  | 'AUDIT'
  | 'SETTINGS';

export const AdminView: React.FC<AdminViewProps> = ({ currentUser, onBack, onRefreshProfile }) => {
  // Master Admin Security States
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('taj_admin_session_unlocked') === 'true';
  });
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [savedMasterPin, setSavedMasterPin] = useState(() => {
    return localStorage.getItem('taj_admin_master_pin') || '8899';
  });
  const [showPinChangeModal, setShowPinChangeModal] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Email OTP Flow States
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [emailOtp, setEmailOtp] = useState('');
  const [receivedOtp, setReceivedOtp] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');

  // Admin Data State
  const [loading, setLoading] = useState(false);
  const [overview, setOverview] = useState<any>({
    totalUsers: 0,
    activeRooms: 0,
    runningGames: 0,
    totalDepositVolume: 0,
    totalWithdrawalVolume: 0,
    totalGameEntryVolume: 0,
    estimatedCommission: 0,
    pendingKyc: 0,
    openTickets: 0,
    totalTransactions: 0,
  });
  const [usersList, setUsersList] = useState<UserProfile[]>([]);
  const [roomsList, setRoomsList] = useState<Room[]>([]);
  const [gamesList, setGamesList] = useState<GameState[]>([]);
  const [transactionsList, setTransactionsList] = useState<Transaction[]>([]);
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [ticketsList, setTicketsList] = useState<SupportTicket[]>([]);
  const [auditLogsList, setAuditLogsList] = useState<AdminAuditLog[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    commissionPercent: 5,
    minDeposit: 50,
    maxDeposit: 50000,
    minWithdrawal: 100,
    maxWithdrawal: 25000,
    maintenanceMode: false,
    supportWhatsapp: '+91 98765 43210',
    supportTelegram: '@roomludo_official',
    referralBonus: 25,
    referralCommissionPercent: 2,
    roomTimeoutMinutes: 10,
    bannerAnnouncement: '⚡ Welcome to RoomLudo! Play 1v1 Battles & Win Real Cash 24x7 with Instant Withdrawal.',
    adminUpiId: 'roomludo.gaming@okhdfcbank',
    adminUpiName: 'RoomLudo Official India',
    adminQrCodeUrl: '',
    adminBankName: 'HDFC Bank Ltd',
    adminBankAccountName: 'RoomLudo Entertainment Pvt Ltd',
    adminBankAccountNumber: '50200088994321',
    adminBankIfsc: 'HDFC0001234',
    adminBankBranch: 'Cyber Hub Branch, Gurugram',
    enableUpiDeposit: true,
    enableQrDeposit: true,
    enableBankDeposit: true,
    depositInstructions: '1. Pay using UPI / QR / Bank.\n2. Note 12-digit UTR.\n3. Submit for instant balance credit.',
  });

  // Search & Filter states
  const [userSearch, setUserSearch] = useState('');
  const [userFilter, setUserFilter] = useState<'ALL' | 'VERIFIED' | 'BLOCKED' | 'ADMINS'>('ALL');
  
  const [roomFilter, setRoomFilter] = useState<'ALL' | 'WAITING' | 'STARTED' | 'FINISHED' | 'EXPIRED'>('ALL');
  const [txnFilter, setTxnFilter] = useState<'ALL' | 'PENDING_DEPOSITS' | 'WITHDRAWAL' | 'DEPOSIT' | 'GAME_WIN'>('ALL');
  const [ticketFilter, setTicketFilter] = useState<'ALL' | 'OPEN' | 'PROCESSING' | 'RESOLVED'>('ALL');

  // Modals & Action States
  const [selectedUserForAdjust, setSelectedUserForAdjust] = useState<UserProfile | null>(null);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustType, setAdjustType] = useState<'DEPOSIT' | 'WINNINGS' | 'BONUS'>('DEPOSIT');
  const [adjustDesc, setAdjustDesc] = useState('');

  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [ticketReplyText, setTicketReplyText] = useState('');

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'INFO' | 'SUCCESS' | 'WARNING' | 'BONUS'>('INFO');
  const [broadcastTarget, setBroadcastTarget] = useState<string>('ALL');

  const [cancelRoomReason, setCancelRoomReason] = useState('');
  const [selectedRoomToCancel, setSelectedRoomToCancel] = useState<string | null>(null);

  const [selectedGameForResolve, setSelectedGameForResolve] = useState<GameState | null>(null);
  const [resolveWinnerColor, setResolveWinnerColor] = useState<PlayerColor>('RED');
  const [resolveReason, setResolveReason] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Fetch all admin data
  const fetchAllAdminData = async () => {
    setLoading(true);
    try {
      const [
        ovRes, 
        uRes, 
        rRes, 
        gRes, 
        tRes, 
        refRes, 
        tktRes, 
        logRes, 
        setRes
      ] = await Promise.all([
        fetch('/api/admin/overview'),
        fetch('/api/admin/users'),
        fetch('/api/admin/rooms'),
        fetch('/api/admin/games'),
        fetch('/api/admin/transactions'),
        fetch('/api/admin/referrals'),
        fetch('/api/admin/tickets'),
        fetch('/api/admin/audit-logs'),
        fetch('/api/admin/settings'),
      ]);

      if (ovRes.ok) setOverview(await ovRes.json());
      if (uRes.ok) setUsersList(await uRes.json());
      if (rRes.ok) setRoomsList(await rRes.json());
      if (gRes.ok) setGamesList(await gRes.json());
      if (tRes.ok) setTransactionsList(await tRes.json());
      if (refRes.ok) setReferralsList(await refRes.json());
      if (tktRes.ok) setTicketsList(await tktRes.json());
      if (logRes.ok) setAuditLogsList(await logRes.json());
      if (setRes.ok) setSettings(await setRes.json());
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isUnlocked) {
      fetchAllAdminData();
    }
  }, [isUnlocked]);

  // Handle Requesting Email OTP
  const handleRequestEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminEmail.trim().toLowerCase();
    if (!cleanEmail || !adminPassword) {
      setPinError('Please fill in both email and password.');
      return;
    }
    
    setIsSendingOtp(true);
    setPinError(null);
    try {
      const response = await fetch('/api/auth/send-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password: adminPassword }),
      });
      
      const data = await response.json();
      if (response.ok) {
        setIsOtpSent(true);
        setReceivedOtp(data.otp); // Display received OTP for easy sandbox access
        sounds.playVictory();
        showToast(`🔒 OTP Sent to ${cleanEmail}`);
      } else {
        sounds.playClick();
        setPinError(data.error || 'Failed to send OTP. Check your credentials.');
      }
    } catch (err) {
      setPinError('Network error while requesting secure OTP.');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle Verifying Email OTP
  const handleVerifyEmailOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminEmail.trim().toLowerCase();
    if (!emailOtp) {
      setPinError('Please enter the 6-digit OTP code received on email.');
      return;
    }

    setIsVerifyingOtp(true);
    setPinError(null);
    try {
      const response = await fetch('/api/auth/verify-email-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          otp: emailOtp,
          userId: currentUser.id,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        onRefreshProfile?.();
        sounds.playVictory();
        setIsUnlocked(true);
        sessionStorage.setItem('taj_admin_session_unlocked', 'true');
        setPinError(null);
        showToast('Admin Portal Unlocked! Welcome back.');
      } else {
        sounds.playClick();
        setPinError(data.error || 'Invalid OTP Code. Please try again.');
      }
    } catch (err) {
      setPinError('Network error while verifying OTP.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle Admin Login (Email/Password)
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = adminEmail.trim().toLowerCase();
    if (
      cleanEmail === 'ravimeena946230@gmail.com' &&
      adminPassword === '98293093'
    ) {
      try {
        const response = await fetch('/api/auth/admin-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: cleanEmail,
            password: adminPassword,
            userId: currentUser.id,
          }),
        });
        
        if (response.ok) {
          onRefreshProfile?.();
        }
      } catch (err) {
        console.error('Failed to sync admin role with server:', err);
      }

      sounds.playVictory();
      setIsUnlocked(true);
      sessionStorage.setItem('taj_admin_session_unlocked', 'true');
      setPinError(null);
      showToast('Admin Portal Unlocked. Welcome Administrator!');
    } else {
      sounds.playClick();
      setPinError('Incorrect Email or Password! Access Denied.');
    }
  };

  const handleLockPanel = () => {
    sounds.playClick();
    setIsUnlocked(false);
    sessionStorage.removeItem('taj_admin_session_unlocked');
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      alert('PIN must be at least 4 digits');
      return;
    }
    localStorage.setItem('taj_admin_master_pin', newPin);
    setSavedMasterPin(newPin);
    setNewPin('');
    setShowPinChangeModal(false);
    showToast('Admin Master PIN changed successfully!');
  };

  // User Actions
  const handleToggleBlock = async (userId: string, currentStatus?: boolean) => {
    sounds.playClick();
    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBanned: !currentStatus }),
      });
      if (res.ok) {
        showToast(`User ${!currentStatus ? 'Blocked' : 'Unblocked'} successfully`);
        fetchAllAdminData();
      }
    } catch {
      showToast('Error updating user block status');
    }
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    sounds.playClick();
    const newRole = currentRole === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (res.ok) {
        showToast(`Role updated to ${newRole}`);
        fetchAllAdminData();
      }
    } catch {
      showToast('Error updating role');
    }
  };

  const handleWalletAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForAdjust || !adjustAmount) return;
    const amt = Number(adjustAmount);
    if (isNaN(amt) || amt === 0) return;
    sounds.playCoins();

    try {
      const res = await fetch('/api/admin/wallet/adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserForAdjust.id,
          amount: amt,
          type: adjustType,
          description: adjustDesc || 'Admin manual balance adjustment',
        }),
      });
      if (res.ok) {
        showToast(`Wallet adjusted: ₹${amt} for ${selectedUserForAdjust.username}`);
        setSelectedUserForAdjust(null);
        setAdjustAmount('');
        setAdjustDesc('');
        fetchAllAdminData();
      }
    } catch {
      showToast('Wallet adjustment failed');
    }
  };

  // Room Actions
  const handleCancelRoom = async (roomCode: string) => {
    sounds.playClick();
    try {
      const res = await fetch(`/api/admin/rooms/${roomCode}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: cancelRoomReason || 'Cancelled by Admin' }),
      });
      if (res.ok) {
        showToast(`Room #${roomCode} cancelled and entry fees refunded`);
        setSelectedRoomToCancel(null);
        setCancelRoomReason('');
        fetchAllAdminData();
      }
    } catch {
      showToast('Failed to cancel room');
    }
  };

  // Game Resolve
  const handleResolveGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGameForResolve) return;
    sounds.playVictory();

    try {
      const res = await fetch(`/api/admin/games/${selectedGameForResolve.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          winnerColor: resolveWinnerColor,
          reason: resolveReason || 'Admin Manual Arbitration',
        }),
      });
      if (res.ok) {
        showToast(`Game resolved! Winner ${resolveWinnerColor} credited prize`);
        setSelectedGameForResolve(null);
        setResolveReason('');
        fetchAllAdminData();
      }
    } catch {
      showToast('Game resolution failed');
    }
  };

  // KYC Actions
  const handleKycAction = async (userId: string, action: 'APPROVE' | 'REJECT') => {
    sounds.playClick();
    try {
      const res = await fetch(`/api/admin/kyc/${userId}/${action.toLowerCase()}`, { method: 'POST' });
      if (res.ok) {
        showToast(`KYC ${action === 'APPROVE' ? 'Approved' : 'Rejected'}`);
        fetchAllAdminData();
      }
    } catch {
      showToast('Error reviewing KYC');
    }
  };

  // Transaction Payout Actions
  const handleTxnStatusChange = async (txnId: string, status: 'SUCCESS' | 'COMPLETED' | 'FAILED', reason = '') => {
    sounds.playCoins();
    try {
      const res = await fetch(`/api/admin/transactions/${txnId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, reason }),
      });
      if (res.ok) {
        showToast(`Payout status updated to ${status}`);
        fetchAllAdminData();
      }
    } catch {
      showToast('Transaction update failed');
    }
  };

  // Deposit Approval Actions
  const handleApproveDeposit = async (txnId: string) => {
    sounds.playCoins();
    try {
      const res = await fetch(`/api/admin/deposits/${txnId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminName: currentUser.username || 'Master Admin' }),
      });
      if (res.ok) {
        showToast('🎉 Deposit Approved & Credited to Player Wallet!');
        fetchAllAdminData();
      } else {
        const d = await res.json();
        showToast(`Error: ${d.error || 'Failed to approve'}`);
      }
    } catch {
      showToast('Failed to approve deposit');
    }
  };

  const handleRejectDeposit = async (txnId: string) => {
    const reason = prompt('Enter rejection reason (e.g. Invalid UTR / Payment Not Received):', 'Invalid UTR Number / Payment Not Found');
    if (!reason) return;
    sounds.playClick();
    try {
      const res = await fetch(`/api/admin/deposits/${txnId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason, adminName: currentUser.username || 'Master Admin' }),
      });
      if (res.ok) {
        showToast('❌ Deposit Request Rejected');
        fetchAllAdminData();
      } else {
        const d = await res.json();
        showToast(`Error: ${d.error || 'Failed to reject'}`);
      }
    } catch {
      showToast('Failed to reject deposit');
    }
  };

  // Ticket Actions
  const handleReplyTicket = async (ticketId: string) => {
    if (!ticketReplyText.trim()) return;
    sounds.playClick();
    try {
      const res = await fetch(`/api/support/tickets/${ticketId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: ticketReplyText.trim(),
          senderName: 'RoomLudo Admin Support',
          status: 'Resolved',
        }),
      });
      if (res.ok) {
        showToast('Ticket reply sent and resolved');
        setTicketReplyText('');
        setSelectedTicket(null);
        fetchAllAdminData();
      }
    } catch {
      showToast('Reply failed');
    }
  };

  // Broadcast Action
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;
    sounds.playClick();
    try {
      const res = await fetch('/api/admin/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastTitle.trim(),
          message: broadcastMessage.trim(),
          type: broadcastType,
          targetUserId: broadcastTarget === 'ALL' ? undefined : broadcastTarget,
        }),
      });
      if (res.ok) {
        showToast('Broadcast notification sent to players!');
        setBroadcastTitle('');
        setBroadcastMessage('');
        fetchAllAdminData();
      }
    } catch {
      showToast('Broadcast failed');
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    sounds.playClick();
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        showToast('Platform settings saved successfully!');
        fetchAllAdminData();
      }
    } catch {
      showToast('Failed to save settings');
    }
  };

  // ================= 1. SECURITY PIN GATE =================
  if (!isUnlocked) {
    return (
      <div className="min-h-full pb-24 pt-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-sm space-y-4">
          
          {onBack && (
            <button
              onClick={() => { sounds.playClick(); onBack(); }}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-2xs cursor-pointer w-fit"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to App</span>
            </button>
          )}

          {/* Security Gate Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#120f26] via-[#0d0a1d] to-[#080712] text-white border border-purple-900/50 shadow-2xl space-y-4">
            
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto shadow-lg ${currentUser.role === 'ADMIN' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-amber-500/10' : 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-rose-500/10'}`}>
              <Lock className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div className="text-center">
              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider ${currentUser.role === 'ADMIN' ? 'text-amber-400 bg-amber-400/10 border border-amber-400/30' : 'text-rose-400 bg-rose-400/10 border border-rose-400/30'}`}>
                {currentUser.role === 'ADMIN' ? 'Restricted System Area' : 'Unauthorized Access'}
              </span>
              <h2 className="text-lg font-black text-white font-['Outfit'] mt-2">
                RoomLudo Admin Command Hub
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                {currentUser.role === 'ADMIN' 
                  ? 'Your account has administrator privileges.' 
                  : 'You do not have permission to access this area.'}
              </p>
            </div>

            {currentUser.role === 'ADMIN' ? (
              <div className="space-y-4 pt-2">
                <button
                  onClick={() => {
                    sounds.playVictory();
                    setIsUnlocked(true);
                    sessionStorage.setItem('taj_admin_session_unlocked', 'true');
                    showToast('Admin Portal Unlocked.');
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <KeyRound className="w-4 h-4" />
                  <span>Verify Role & Unlock Portal</span>
                </button>
              </div>
            ) : (
              <div className="pt-2 space-y-4">
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-bold text-center">
                  Access Denied. Admin role required.
                </div>

                <div className="border-t border-white/10 pt-4">
                  <h3 className="text-xs font-black text-slate-300 uppercase tracking-wider mb-3 text-center">
                    Admin Email Authorization
                  </h3>

                  {!isOtpSent ? (
                    <form onSubmit={handleRequestEmailOtp} className="space-y-3 text-left">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                          Admin Email
                        </label>
                        <input
                          type="email"
                          required
                          value={adminEmail}
                          onChange={(e) => setAdminEmail(e.target.value)}
                          placeholder="e.g. ravimeena946230@gmail.com"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-950 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-purple-600 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                          Password
                        </label>
                        <input
                          type="password"
                          required
                          value={adminPassword}
                          onChange={(e) => setAdminPassword(e.target.value)}
                          placeholder="••••••••"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-950 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:border-purple-600 transition-colors"
                        />
                      </div>

                      {pinError && (
                        <p className="text-[11px] text-rose-400 font-bold text-center">
                          {pinError}
                        </p>
                      )}

                      <button
                        type="submit"
                        disabled={isSendingOtp}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-black text-xs uppercase tracking-wider shadow-lg shadow-purple-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-50"
                      >
                        <KeyRound className="w-4 h-4 text-purple-200" />
                        <span>{isSendingOtp ? 'Sending OTP...' : 'Send OTP to Email'}</span>
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyEmailOtp} className="space-y-4 text-left">
                      {/* Secure sandbox OTP helper card */}
                      <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl space-y-1">
                        <span className="font-bold text-[10px] uppercase text-indigo-400 tracking-wider flex items-center gap-1">
                          ✉️ Email OTP Sent!
                        </span>
                        <p className="text-[11px] text-slate-300 leading-normal">
                          OTP has been sent to <strong className="text-white font-extrabold">{adminEmail}</strong>. 
                        </p>
                        <div className="mt-1.5 p-2 bg-slate-950/40 rounded-lg text-center border border-indigo-500/10">
                          <span className="text-[10px] text-slate-400 block font-bold">Secure Verification OTP Code:</span>
                          <span className="text-lg font-black text-amber-400 tracking-widest">{receivedOtp}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 mb-1 uppercase">
                          Enter 6-Digit OTP
                        </label>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={emailOtp}
                          onChange={(e) => setEmailOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder="e.g. 123456"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-purple-950 text-base font-black text-center text-amber-400 tracking-widest focus:outline-none focus:border-purple-600 transition-colors"
                        />
                      </div>

                      {pinError && (
                        <p className="text-[11px] text-rose-400 font-bold text-center">
                          {pinError}
                        </p>
                      )}

                      <div className="space-y-2">
                        <button
                          type="submit"
                          disabled={isVerifyingOtp}
                          className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-amber-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          <KeyRound className="w-4 h-4" />
                          <span>{isVerifyingOtp ? 'Verifying OTP...' : 'Verify OTP & Unlock Portal'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setIsOtpSent(false);
                            setEmailOtp('');
                            setPinError(null);
                          }}
                          className="w-full py-2 text-center text-[11px] text-indigo-400 hover:text-indigo-300 font-bold cursor-pointer"
                        >
                          ← Change Credentials or Resend
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-500">
              <span className={currentUser.role === 'ADMIN' ? 'text-amber-500 font-bold' : 'text-rose-500 font-bold'}>
                {currentUser.role === 'ADMIN' ? 'Secure Gateway' : 'Security Alert'}
              </span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> 256-Bit Encrypted
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. UNLOCKED ADMIN CONTROL CENTER =================
  const pendingKycUsers = usersList.filter(u => u.kycStatus === 'PENDING');
  const openTickets = ticketsList.filter(t => t.status === 'OPEN' || t.status === 'Open' || t.status === 'PROCESSING' || t.status === 'Processing');
  const pendingWithdrawals = transactionsList.filter(t => t.type === 'WITHDRAWAL' && t.status === 'PENDING');
  const pendingDeposits = transactionsList.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING');

  const filteredUsers = usersList.filter(u => {
    const matchesSearch = 
      u.username.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.mobile.includes(userSearch) ||
      u.id.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.referralCode.toLowerCase().includes(userSearch.toLowerCase());
    
    if (!matchesSearch) return false;
    if (userFilter === 'VERIFIED') return u.kycStatus === 'VERIFIED';
    if (userFilter === 'BLOCKED') return u.isBanned === true;
    if (userFilter === 'ADMINS') return u.role === 'ADMIN';
    return true;
  });

  const filteredRooms = roomsList.filter(r => {
    if (roomFilter === 'ALL') return true;
    return r.status === roomFilter;
  });

  const filteredTransactions = transactionsList.filter(t => {
    if (txnFilter === 'ALL') return true;
    if (txnFilter === 'PENDING_DEPOSITS') return t.type === 'DEPOSIT' && t.status === 'PENDING';
    return t.type === txnFilter;
  });

  const filteredTickets = ticketsList.filter(t => {
    if (ticketFilter === 'ALL') return true;
    return t.status.toUpperCase() === ticketFilter;
  });

  return (
    <div className="space-y-4 pb-24 pt-1 font-sans">
      
      {/* Top Header & Fast Actions */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white shadow-xl flex flex-wrap items-center justify-between gap-3 border border-purple-500/30">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={() => { sounds.playClick(); onBack(); }}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              title="Return to Main App"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <div className="p-2 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black tracking-tight text-white font-['Outfit']">RoomLudo Admin Center</h2>
              <span className="text-[9px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.5 rounded">
                MASTER ADMIN
              </span>
            </div>
            <p className="text-[10px] text-purple-200">Full 11-Section Platform Control & Oversight</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => { sounds.playClick(); fetchAllAdminData(); }}
            disabled={loading}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
            title="Refresh All Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button 
            onClick={() => setShowPinChangeModal(true)}
            className="px-2.5 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold hover:bg-amber-500/30 cursor-pointer flex items-center gap-1"
          >
            <KeyRound className="w-3 h-3" />
            <span>PIN</span>
          </button>

          <button 
            onClick={handleLockPanel}
            className="px-2.5 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold hover:bg-rose-500/30 flex items-center gap-1 cursor-pointer"
          >
            <Lock className="w-3 h-3" />
            <span>Lock</span>
          </button>
        </div>
      </div>

      {/* Global Toast Alert */}
      {toastMsg && (
        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200 text-center animate-in fade-in flex items-center justify-center gap-2 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 11-SECTION HORIZONTAL SCROLLABLE TAB NAV */}
      <div className="bg-white rounded-2xl border border-indigo-100 p-1.5 shadow-xs overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1 min-w-max">
          {[
            { id: 'DASHBOARD', label: '📊 Dashboard', badge: null },
            { id: 'USERS', label: '👥 Users', badge: usersList.length },
            { id: 'ROOMS', label: '🎮 Rooms', badge: overview.activeRooms || null },
            { id: 'GAMES', label: '🏆 Games', badge: overview.runningGames || null },
            { id: 'WALLET', label: '💰 Wallet/Txns', badge: pendingWithdrawals.length ? `!${pendingWithdrawals.length}` : null },
            { id: 'REFERRALS', label: '🎁 Referrals', badge: null },
            { id: 'KYC', label: '🪪 KYC', badge: pendingKycUsers.length || null },
            { id: 'SUPPORT', label: '🎧 Support', badge: openTickets.length || null },
            { id: 'NOTIFICATIONS', label: '🔔 Alerts', badge: null },
            { id: 'AUDIT', label: '🛡️ Audit Logs', badge: null },
            { id: 'SETTINGS', label: '⚙️ Settings', badge: null },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { sounds.playClick(); setActiveTab(tab.id as AdminTab); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-amber-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                    isActive ? 'bg-amber-400 text-slate-950' : 'bg-rose-500 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: 📊 DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'DASHBOARD' && (
        <div className="space-y-4">
          
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-2xs">
              <div className="flex items-center gap-1.5 text-indigo-600 text-xs font-bold mb-1">
                <Users className="w-4 h-4" /> Total Players
              </div>
              <p className="text-xl font-black text-slate-900 font-['Outfit']">{overview.totalUsers}</p>
              <span className="text-[10px] text-slate-400">Registered users</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-2xs">
              <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold mb-1">
                <Gamepad2 className="w-4 h-4" /> Active Rooms
              </div>
              <p className="text-xl font-black text-amber-600 font-['Outfit']">{overview.activeRooms}</p>
              <span className="text-[10px] text-slate-400">Waiting for 2nd player</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-2xs">
              <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold mb-1">
                <Trophy className="w-4 h-4" /> Running Games
              </div>
              <p className="text-xl font-black text-emerald-600 font-['Outfit']">{overview.runningGames}</p>
              <span className="text-[10px] text-slate-400">Live 1v1 battle matches</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-2xs">
              <div className="flex items-center gap-1.5 text-purple-600 text-xs font-bold mb-1">
                <CircleDollarSign className="w-4 h-4" /> Est. Commission
              </div>
              <p className="text-xl font-black text-purple-600 font-['Outfit']">₹{overview.estimatedCommission.toFixed(1)}</p>
              <span className="text-[10px] text-slate-400">{settings.commissionPercent}% platform cut</span>
            </div>
          </div>

          {/* Volume Summary Card */}
          <div className="p-4 rounded-3xl bg-gradient-to-br from-indigo-900 via-slate-900 to-black text-white border border-indigo-500/20 shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Financial Liquidity & Volume</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-mono font-bold">
                Auto-Settled
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Total Deposits</span>
                <span className="text-sm font-black text-emerald-400">₹{overview.totalDepositVolume}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Total Payouts</span>
                <span className="text-sm font-black text-amber-400">₹{overview.totalWithdrawalVolume}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 block">Match Volume</span>
                <span className="text-sm font-black text-indigo-300">₹{overview.totalGameEntryVolume}</span>
              </div>
            </div>
          </div>

          {/* Quick Pending Items Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setActiveTab('KYC')}
              className="p-3.5 rounded-2xl bg-white border border-amber-200 hover:border-amber-400 text-left transition-all shadow-2xs cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-amber-800 block">Pending KYC Approvals</span>
                <span className="text-lg font-black text-slate-900">{pendingKycUsers.length} Players</span>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-500" />
            </button>

            <button
              onClick={() => setActiveTab('SUPPORT')}
              className="p-3.5 rounded-2xl bg-white border border-rose-200 hover:border-rose-400 text-left transition-all shadow-2xs cursor-pointer flex items-center justify-between"
            >
              <div>
                <span className="text-xs font-bold text-rose-800 block">Open Support Tickets</span>
                <span className="text-lg font-black text-slate-900">{openTickets.length} Complaints</span>
              </div>
              <ChevronRight className="w-5 h-5 text-rose-500" />
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: 👥 USER MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'USERS' && (
        <div className="space-y-3">
          
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search username, mobile, ID, ref code..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-white border border-slate-200 focus:outline-none focus:border-indigo-600"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {(['ALL', 'VERIFIED', 'BLOCKED', 'ADMINS'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setUserFilter(filter)}
                  className={`px-2.5 py-1.5 text-[10px] font-bold rounded-xl cursor-pointer ${
                    userFilter === filter ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Users List */}
          <div className="space-y-2">
            {filteredUsers.map((user) => (
              <div 
                key={user.id}
                className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-2xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img src={user.avatar} alt="" className="w-9 h-9 rounded-full border border-slate-200" />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-xs text-slate-900">{user.username}</span>
                        {user.role === 'ADMIN' && (
                          <span className="text-[8px] bg-amber-500 text-slate-950 font-black px-1.5 py-0.2 rounded">
                            ADMIN
                          </span>
                        )}
                        {user.isBanned && (
                          <span className="text-[8px] bg-rose-600 text-white font-black px-1.5 py-0.2 rounded">
                            BLOCKED
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono block">+91 {user.mobile} • ID: {user.id}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-black text-xs text-emerald-600">₹{(user.wallet.deposit + user.wallet.winnings + user.wallet.bonus).toFixed(1)}</span>
                    <span className="text-[9px] block text-slate-400">Total Balance</span>
                  </div>
                </div>

                {/* Wallet mini breakdown */}
                <div className="grid grid-cols-3 gap-1 text-center bg-slate-50 p-1.5 rounded-xl text-[10px] font-medium text-slate-600">
                  <span>Deposit: <strong>₹{user.wallet.deposit}</strong></span>
                  <span>Winnings: <strong>₹{user.wallet.winnings}</strong></span>
                  <span>Bonus: <strong>₹{user.wallet.bonus}</strong></span>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] gap-2">
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[9px] ${
                    user.kycStatus === 'VERIFIED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    KYC: {user.kycStatus}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedUserForAdjust(user)}
                      className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <CreditCard className="w-3 h-3" />
                      <span>Adjust ₹</span>
                    </button>

                    <button
                      onClick={() => handleToggleRole(user.id, user.role)}
                      className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold text-[10px] cursor-pointer"
                    >
                      {user.role === 'ADMIN' ? 'Demote to User' : 'Make Admin'}
                    </button>

                    <button
                      onClick={() => handleToggleBlock(user.id, user.isBanned)}
                      className={`px-2 py-1 rounded-lg font-bold text-[10px] cursor-pointer ${
                        user.isBanned ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                      }`}
                    >
                      {user.isBanned ? 'Unblock' : 'Block'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 3: 🎮 ROOM MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'ROOMS' && (
        <div className="space-y-3">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700">All Battle Arena Rooms</h3>
            <div className="flex gap-1">
              {(['ALL', 'WAITING', 'STARTED', 'FINISHED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRoomFilter(filter)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${
                    roomFilter === filter ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredRooms.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-indigo-100">
                No rooms found matching filter.
              </div>
            ) : (
              filteredRooms.map((room) => (
                <div key={room.code} className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-xs text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded">
                        Room #{room.code}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        room.status === 'WAITING' ? 'bg-amber-100 text-amber-800' :
                        room.status === 'STARTED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {room.status}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-black text-slate-900">Stake: ₹{room.entryFee}</span>
                      <span className="text-[9px] block text-emerald-600 font-bold">Prize: ₹{room.prizeAmount}</span>
                    </div>
                  </div>

                  {/* 2 Players */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl text-[11px]">
                    <div>
                      <span className="text-[9px] text-rose-600 font-bold block">Host (RED)</span>
                      <span className="font-bold text-slate-800">{room.hostName || 'Player 1'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-emerald-600 font-bold block">Opponent (GREEN)</span>
                      <span className="font-bold text-slate-800">
                        {room.players.length > 1 ? room.players[1].username : 'Waiting for player...'}
                      </span>
                    </div>
                  </div>

                  {/* Room Actions */}
                  {room.status === 'WAITING' || room.status === 'STARTED' ? (
                    <div className="flex items-center justify-end pt-1">
                      <button
                        onClick={() => setSelectedRoomToCancel(room.code)}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold text-[10px] hover:bg-rose-100 cursor-pointer"
                      >
                        Force Cancel & Refund
                      </button>
                    </div>
                  ) : null}
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 4: 🏆 GAME MANAGEMENT & ARBITRATOR */}
      {/* ========================================================================= */}
      {activeTab === 'GAMES' && (
        <div className="space-y-3">
          
          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-xs text-indigo-900 space-y-1">
            <h4 className="font-black flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-indigo-600" />
              <span>Match Arbitrator & Dispute Resolver</span>
            </h4>
            <p className="text-[11px] text-indigo-700">
              Live games control: manually resolve match conflicts, inspect token steps, and credit winners.
            </p>
          </div>

          <div className="space-y-2">
            {gamesList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-indigo-100">
                No active games currently in engine.
              </div>
            ) : (
              gamesList.map((game) => (
                <div key={game.id} className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-900 font-mono">Match ID: {game.id}</span>
                      <span className="text-[10px] text-slate-500 block">Room #{game.roomCode} • Status: {game.status}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-emerald-600">Prize: ₹{game.prizeAmount}</span>
                      <span className="text-[9px] block text-slate-400">Entry: ₹{game.entryFee}</span>
                    </div>
                  </div>

                  {/* Game Status */}
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-2 rounded-xl text-xs">
                    <div className="border-r border-slate-200 pr-2">
                      <span className="text-[9px] text-rose-600 font-bold block">RED Player</span>
                      <span className="font-bold text-slate-800">{game.players.RED?.username || 'Red Player'}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-emerald-600 font-bold block">GREEN Player</span>
                      <span className="font-bold text-slate-800">{game.players.GREEN?.username || 'Green Player'}</span>
                    </div>
                  </div>

                  {game.status === 'PLAYING' && (
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">
                        Current Turn: {game.currentTurn}
                      </span>
                      <button
                        onClick={() => setSelectedGameForResolve(game)}
                        className="px-2.5 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] cursor-pointer hover:bg-amber-600"
                      >
                        Arbitrate / Declare Winner
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 5: 💰 WALLET & TRANSACTIONS / PAYOUTS */}
      {/* ========================================================================= */}
      {activeTab === 'WALLET' && (
        <div className="space-y-3">
          
          {/* Pending Deposits Highlight Queue */}
          {pendingDeposits.length > 0 && (
            <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-900 border border-emerald-500/40 text-white shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs tracking-tight text-white flex items-center gap-1.5">
                      <span>Pending Deposit Approvals</span>
                      <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black">
                        {pendingDeposits.length} New
                      </span>
                    </h4>
                    <p className="text-[10px] text-emerald-200/80">Verify UTR / Bank Reference and credit player balance</p>
                  </div>
                </div>
                <button
                  onClick={() => setTxnFilter('PENDING_DEPOSITS')}
                  className="text-[10px] font-bold text-emerald-300 hover:text-emerald-100 bg-white/10 px-2.5 py-1 rounded-lg border border-white/10"
                >
                  View All
                </button>
              </div>

              <div className="space-y-2">
                {pendingDeposits.map((dep) => {
                  const user = usersList.find(u => u.id === dep.userId);
                  return (
                    <div 
                      key={dep.id}
                      className="p-3 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-extrabold text-xs text-white">
                            {user?.username || 'Player'}
                          </span>
                          <span className="text-[10px] text-slate-300 font-mono">
                            (+91 {user?.mobile || 'N/A'})
                          </span>
                          <span className="text-[10px] px-2 py-0.2 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                            {dep.paymentMethod || 'UPI / QR Deposit'}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-300 text-[11px]">UTR / Ref:</span>
                          <span className="font-mono font-black text-amber-300 bg-black/40 px-2 py-0.5 rounded border border-amber-400/30 tracking-wider">
                            {dep.utrNumber || dep.referenceId || 'N/A'}
                          </span>
                          {dep.utrNumber && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(dep.utrNumber || '');
                                showToast('UTR Copied to Clipboard!');
                              }}
                              className="p-1 rounded bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white"
                              title="Copy UTR"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 justify-between sm:justify-end">
                        <div className="text-right sm:mr-2">
                          <span className="font-black text-sm text-emerald-300">₹{dep.amount}</span>
                          <span className="text-[9px] text-slate-400 block">Requested Amount</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleApproveDeposit(dep.id)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5 stroke-[3]" />
                            <span>Approve & Credit</span>
                          </button>
                          <button
                            onClick={() => handleRejectDeposit(dep.id)}
                            className="px-2.5 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-bold text-xs transition-all cursor-pointer"
                          >
                            ✕ Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="text-xs font-bold text-slate-700">Global Ledger & Transactions ({filteredTransactions.length})</h3>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {[
                { id: 'ALL', label: 'ALL' },
                { id: 'PENDING_DEPOSITS', label: `Pending Deposits (${pendingDeposits.length})` },
                { id: 'WITHDRAWAL', label: `Withdrawals (${pendingWithdrawals.length})` },
                { id: 'DEPOSIT', label: 'Deposits' },
                { id: 'GAME_WIN', label: 'Wins' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setTxnFilter(filter.id as any)}
                  className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer whitespace-nowrap transition-all ${
                    txnFilter === filter.id ? 'bg-slate-900 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-indigo-100">
                No transactions found for current filter.
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                        tx.type === 'DEPOSIT' ? 'bg-emerald-100 text-emerald-800' :
                        tx.type === 'WITHDRAWAL' ? 'bg-rose-100 text-rose-800' :
                        tx.type === 'GAME_WIN' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tx.type}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{tx.description}</span>
                    </div>

                    <span className={`font-black text-xs ${
                      tx.type === 'DEPOSIT' || tx.type === 'GAME_WIN' ? 'text-emerald-600' : 'text-slate-900'
                    }`}>
                      {tx.type === 'DEPOSIT' || tx.type === 'GAME_WIN' ? '+' : '-'}₹{tx.amount}
                    </span>
                  </div>

                  {/* UTR & Reference details */}
                  {(tx.utrNumber || tx.paymentMethod || tx.referenceId) && (
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-[10px] text-slate-600 flex-wrap gap-1">
                      {tx.paymentMethod && (
                        <span>Method: <strong className="text-slate-800">{tx.paymentMethod}</strong></span>
                      )}
                      {tx.utrNumber && (
                        <span className="font-mono">UTR: <strong className="text-emerald-700">{tx.utrNumber}</strong></span>
                      )}
                      <span className="text-slate-400 font-mono">Ref: {tx.referenceId || tx.id}</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-50">
                    <span>{new Date(tx.timestamp).toLocaleString()}</span>
                    <span className={`font-bold ${
                      tx.status === 'SUCCESS' || tx.status === 'COMPLETED' ? 'text-emerald-600' :
                      tx.status === 'PENDING' ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      Status: {tx.status}
                    </span>
                  </div>

                  {/* Manual Deposit Approval Actions */}
                  {tx.type === 'DEPOSIT' && tx.status === 'PENDING' && (
                    <div className="flex items-center gap-2 pt-1 border-t border-dashed border-emerald-200">
                      <button
                        onClick={() => handleApproveDeposit(tx.id)}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs cursor-pointer hover:bg-emerald-700 flex items-center justify-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>✓ Approve & Credit ₹{tx.amount}</span>
                      </button>
                      <button
                        onClick={() => handleRejectDeposit(tx.id)}
                        className="flex-1 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs cursor-pointer hover:bg-rose-700"
                      >
                        ✕ Reject (Invalid UTR)
                      </button>
                    </div>
                  )}

                  {/* Instant Payout Actions for Pending Withdrawals */}
                  {tx.type === 'WITHDRAWAL' && tx.status === 'PENDING' && (
                    <div className="flex items-center gap-2 pt-1 border-t border-dashed border-amber-200">
                      <button
                        onClick={() => handleTxnStatusChange(tx.id, 'COMPLETED', 'Approved by Admin')}
                        className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white font-bold text-xs cursor-pointer hover:bg-emerald-700"
                      >
                        ✓ Mark Paid / Completed
                      </button>
                      <button
                        onClick={() => handleTxnStatusChange(tx.id, 'FAILED', 'Invalid Account / Rejected')}
                        className="flex-1 py-1.5 rounded-lg bg-rose-600 text-white font-bold text-xs cursor-pointer hover:bg-rose-700"
                      >
                        ✕ Reject & Refund
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 6: 🎁 REFERRAL MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'REFERRALS' && (
        <div className="space-y-3">
          
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
            <h4 className="font-black flex items-center gap-1.5">
              <Gift className="w-4 h-4 text-amber-600" />
              <span>Referral & Affiliate Tracking</span>
            </h4>
            <p className="text-[11px] text-amber-800">
              Current Rules: <strong>₹{settings.referralBonus}</strong> signup bonus + <strong>{settings.referralCommissionPercent}%</strong> match fee commission.
            </p>
          </div>

          <div className="space-y-2">
            {referralsList.map((ref) => (
              <div key={ref.userId} className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-xs text-slate-900">{ref.username}</span>
                  <span className="text-[10px] text-slate-500 font-mono block">Code: {ref.referralCode} • Referred By: {ref.referredBy}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-emerald-600">₹{ref.referralEarnings}</span>
                  <span className="text-[9px] block text-slate-400">Total Earned</span>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 7: 🪪 KYC MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'KYC' && (
        <div className="space-y-3">
          
          <h3 className="text-xs font-bold text-slate-700">KYC Verifications Queue</h3>

          <div className="space-y-2">
            {pendingKycUsers.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-indigo-100">
                🎉 No pending KYC verification requests! All clear.
              </div>
            ) : (
              pendingKycUsers.map((u) => (
                <div key={u.id} className="p-4 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-black text-xs text-slate-900">{u.username}</span>
                      <span className="text-[10px] font-mono text-slate-500 block">+91 {u.mobile} • ID: {u.id}</span>
                    </div>
                    <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                      PENDING REVIEW
                    </span>
                  </div>

                  {u.kycDetails && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1 text-slate-700">
                      <p>Full Legal Name: <strong>{u.kycDetails.fullName}</strong></p>
                      <p>PAN Card: <strong className="font-mono">{u.kycDetails.panNumber}</strong></p>
                      <p>Bank Account: <strong className="font-mono">{u.kycDetails.bankAccount}</strong></p>
                      <p>IFSC Code: <strong className="font-mono">{u.kycDetails.ifscCode}</strong></p>
                      {u.kycDetails.upiId && <p>UPI ID: <strong className="font-mono">{u.kycDetails.upiId}</strong></p>}
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleKycAction(u.id, 'APPROVE')}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer hover:bg-emerald-700"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Verify</span>
                    </button>
                    <button
                      onClick={() => handleKycAction(u.id, 'REJECT')}
                      className="flex-1 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer hover:bg-rose-700"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject KYC</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 8: 🎧 SUPPORT TICKETS */}
      {/* ========================================================================= */}
      {activeTab === 'SUPPORT' && (
        <div className="space-y-3">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700">Player Support Complaints</h3>
            <div className="flex gap-1">
              {(['ALL', 'OPEN', 'RESOLVED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTicketFilter(filter)}
                  className={`px-2 py-1 text-[10px] font-bold rounded-lg cursor-pointer ${
                    ticketFilter === filter ? 'bg-slate-900 text-white' : 'bg-white border border-slate-200 text-slate-600'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            {filteredTickets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-indigo-100">
                No tickets matching filter.
              </div>
            ) : (
              filteredTickets.map((tkt) => (
                <div key={tkt.id} className="p-3.5 rounded-2xl bg-white border border-indigo-100 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      {tkt.category}
                    </span>
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                      {tkt.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-bold text-xs text-slate-900">{tkt.subject}</h4>
                    <p className="text-[11px] text-slate-600 mt-0.5">{tkt.message}</p>
                  </div>

                  {selectedTicket?.id === tkt.id ? (
                    <div className="pt-2 border-t border-slate-100 space-y-2">
                      <textarea
                        rows={2}
                        value={ticketReplyText}
                        onChange={(e) => setTicketReplyText(e.target.value)}
                        placeholder="Type official admin reply..."
                        className="w-full px-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 focus:outline-none"
                      />
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedTicket(null)}
                          className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReplyTicket(tkt.id)}
                          className="px-3 py-1 rounded-lg bg-indigo-600 text-white text-xs font-bold cursor-pointer hover:bg-indigo-700"
                        >
                          Send Reply & Resolve
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => { setSelectedTicket(tkt); setTicketReplyText(''); }}
                      className="text-[10px] font-bold text-indigo-600 hover:underline cursor-pointer"
                    >
                      Reply to User →
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 9: 🔔 NOTIFICATIONS & BROADCASTS */}
      {/* ========================================================================= */}
      {activeTab === 'NOTIFICATIONS' && (
        <div className="space-y-3">
          
          <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-2xs space-y-3">
            <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Bell className="w-4 h-4 text-indigo-600" />
              <span>Send Broadcast Announcement</span>
            </h3>

            <form onSubmit={handleSendBroadcast} className="space-y-2.5">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Announcement Title</label>
                <input
                  type="text"
                  placeholder="e.g. ⚡ Weekend Mega Tournament Live!"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Notification Message</label>
                <textarea
                  rows={2}
                  placeholder="Enter details for players..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Badge Type</label>
                  <select
                    value={broadcastType}
                    onChange={(e: any) => setBroadcastType(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200"
                  >
                    <option value="INFO">INFO (Blue)</option>
                    <option value="BONUS">BONUS (Gold)</option>
                    <option value="SUCCESS">SUCCESS (Green)</option>
                    <option value="WARNING">WARNING (Red)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Target Audience</label>
                  <select
                    value={broadcastTarget}
                    onChange={(e) => setBroadcastTarget(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-200"
                  >
                    <option value="ALL">All Registered Players</option>
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>Direct: {u.username}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-indigo-700"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Push Announcement</span>
              </button>
            </form>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 10: 🛡️ ADMIN ROLES & AUDIT LOGS */}
      {/* ========================================================================= */}
      {activeTab === 'AUDIT' && (
        <div className="space-y-3">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700">Security Audit Trail (Latest 200 Actions)</h3>
            <span className="text-[10px] font-mono text-slate-400">Live Logging</span>
          </div>

          <div className="space-y-2">
            {auditLogsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-400 bg-white rounded-2xl border border-indigo-100">
                No audit events logged yet.
              </div>
            ) : (
              auditLogsList.map((log) => (
                <div key={log.id} className="p-3 rounded-2xl bg-white border border-slate-200 text-xs space-y-1 font-mono shadow-2xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-800 font-sans">{log.details}</p>
                  <span className="text-[9px] text-slate-400 block">By: {log.adminName} • IP: {log.ip || '127.0.0.1'}</span>
                </div>
              ))
            )}
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* SECTION 11: ⚙️ PLATFORM & PAYMENT SETTINGS */}
      {/* ========================================================================= */}
      {activeTab === 'SETTINGS' && (
        <div className="space-y-4">
          
          <form onSubmit={handleSaveSettings} className="space-y-4">
            
            {/* Payment Receiving Setup Card */}
            <div className="p-4 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border border-emerald-500/40 text-white shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center justify-center">
                    <QrCode className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black text-white">Payment Gateway & Receiving Accounts</h3>
                    <p className="text-[10px] text-emerald-200/80">Configure Admin UPI ID, QR Code & Bank Account for User Deposits</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase">
                  Live Receiving
                </span>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-3 gap-2 bg-white/5 p-2 rounded-2xl border border-white/10 text-[10px]">
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, enableUpiDeposit: !settings.enableUpiDeposit })}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 font-bold transition-all ${
                    settings.enableUpiDeposit ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>UPI ID: {settings.enableUpiDeposit ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, enableQrDeposit: !settings.enableQrDeposit })}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 font-bold transition-all ${
                    settings.enableQrDeposit ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>QR Code: {settings.enableQrDeposit ? 'ON' : 'OFF'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, enableBankDeposit: !settings.enableBankDeposit })}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 font-bold transition-all ${
                    settings.enableBankDeposit ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-400'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Bank A/C: {settings.enableBankDeposit ? 'ON' : 'OFF'}</span>
                </button>
              </div>

              {/* 1. UPI Details */}
              <div className="space-y-2.5 pt-1">
                <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider block">
                  1. Admin UPI ID Configuration
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Admin Official UPI ID</label>
                    <input
                      type="text"
                      placeholder="e.g. roomludo@okaxis"
                      value={settings.adminUpiId || ''}
                      onChange={(e) => setSettings({ ...settings, adminUpiId: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-mono font-bold rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Receiver / Business Name</label>
                    <input
                      type="text"
                      placeholder="e.g. RoomLudo Official India"
                      value={settings.adminUpiName || ''}
                      onChange={(e) => setSettings({ ...settings, adminUpiName: e.target.value })}
                      className="w-full px-3 py-2 text-xs font-bold rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>
              </div>

              {/* 2. QR Code Configuration & Live Preview */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider block">
                  2. QR Code Receiving & Preview
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
                  <div className="sm:col-span-2 space-y-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 block mb-1">
                        Custom QR Code Image URL (Optional - Leave blank for auto-generated UPI QR)
                      </label>
                      <input
                        type="text"
                        placeholder="https://... (or leave empty to auto-generate from UPI ID)"
                        value={settings.adminQrCodeUrl || ''}
                        onChange={(e) => setSettings({ ...settings, adminQrCodeUrl: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">
                      When players click "Scan QR", they can scan with Google Pay, PhonePe, Paytm, or BHIM.
                    </p>
                  </div>

                  {/* QR Live Visual Preview */}
                  <div className="flex flex-col items-center justify-center p-2 rounded-2xl bg-white text-slate-900 border-2 border-emerald-400 shadow-md">
                    <img
                      src={
                        settings.adminQrCodeUrl && settings.adminQrCodeUrl.trim().length > 0
                          ? settings.adminQrCodeUrl
                          : `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                              `upi://pay?pa=${settings.adminUpiId || 'roomludo@okhdfcbank'}&pn=${encodeURIComponent(
                                settings.adminUpiName || 'RoomLudo'
                              )}&cu=INR`
                            )}`
                      }
                      alt="Admin QR Preview"
                      className="w-24 h-24 object-contain rounded-lg"
                    />
                    <span className="text-[9px] font-extrabold text-emerald-800 mt-1">Live QR Preview</span>
                  </div>
                </div>
              </div>

              {/* 3. Bank Account Details */}
              <div className="space-y-2.5 pt-2 border-t border-white/10">
                <span className="text-[11px] font-extrabold text-emerald-300 uppercase tracking-wider block">
                  3. Admin Bank Account Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank Ltd"
                      value={settings.adminBankName || ''}
                      onChange={(e) => setSettings({ ...settings, adminBankName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Account Holder Name</label>
                    <input
                      type="text"
                      placeholder="e.g. RoomLudo Pvt Ltd"
                      value={settings.adminBankAccountName || ''}
                      onChange={(e) => setSettings({ ...settings, adminBankAccountName: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Bank Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 50200088994321"
                      value={settings.adminBankAccountNumber || ''}
                      onChange={(e) => setSettings({ ...settings, adminBankAccountNumber: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">IFSC Code</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC0001234"
                      value={settings.adminBankIfsc || ''}
                      onChange={(e) => setSettings({ ...settings, adminBankIfsc: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs font-mono uppercase rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">Bank Branch</label>
                  <input
                    type="text"
                    placeholder="e.g. Cyber City Branch, Gurugram"
                    value={settings.adminBankBranch || ''}
                    onChange={(e) => setSettings({ ...settings, adminBankBranch: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                  />
                </div>
              </div>

              {/* 4. Instructions for users */}
              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <label className="text-[10px] font-bold text-slate-300 block">
                  Deposit Instructions Note (Shown in Player Add Cash Modal)
                </label>
                <textarea
                  rows={2}
                  value={settings.depositInstructions || ''}
                  onChange={(e) => setSettings({ ...settings, depositInstructions: e.target.value })}
                  placeholder="Instructions for players..."
                  className="w-full px-3 py-2 text-xs rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:border-emerald-400"
                />
              </div>
            </div>

            {/* General Platform Rules Card */}
            <div className="p-4 rounded-2xl bg-white border border-indigo-100 shadow-2xs space-y-3">
              <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Platform & Game Engine Rules</span>
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Commission Cut (%)</label>
                  <input
                    type="number"
                    value={settings.commissionPercent}
                    onChange={(e) => setSettings({ ...settings, commissionPercent: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Referral Bonus (₹)</label>
                  <input
                    type="number"
                    value={settings.referralBonus}
                    onChange={(e) => setSettings({ ...settings, referralBonus: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Min Deposit (₹)</label>
                  <input
                    type="number"
                    value={settings.minDeposit}
                    onChange={(e) => setSettings({ ...settings, minDeposit: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Min Withdrawal (₹)</label>
                  <input
                    type="number"
                    value={settings.minWithdrawal}
                    onChange={(e) => setSettings({ ...settings, minWithdrawal: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">WhatsApp Support Number</label>
                <input
                  type="text"
                  value={settings.supportWhatsapp}
                  onChange={(e) => setSettings({ ...settings, supportWhatsapp: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Global Top Banner Announcement</label>
                <input
                  type="text"
                  value={settings.bannerAnnouncement}
                  onChange={(e) => setSettings({ ...settings, bannerAnnouncement: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-bold text-slate-700">Platform Maintenance Mode</span>
                <button
                  type="button"
                  onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                  className={`px-3 py-1 rounded-lg text-xs font-bold cursor-pointer ${
                    settings.maintenanceMode ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {settings.maintenanceMode ? 'ACTIVE (Locked)' : 'OFF (Normal)'}
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black cursor-pointer shadow-lg shadow-emerald-600/30 uppercase tracking-wider"
              >
                Save All Platform & Payment Configurations
              </button>
            </div>

          </form>

        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: ADJUST WALLET BALANCE */}
      {/* ========================================================================= */}
      {selectedUserForAdjust && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-100 shadow-2xl space-y-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>Adjust Wallet: {selectedUserForAdjust.username}</span>
            </h3>

            <form onSubmit={handleWalletAdjustSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Select Wallet Sub-Account</label>
                <div className="grid grid-cols-3 gap-1">
                  {(['DEPOSIT', 'WINNINGS', 'BONUS'] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAdjustType(t)}
                      className={`py-1.5 text-[10px] font-bold rounded-lg cursor-pointer ${
                        adjustType === t ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">
                  Amount (Positive to add, Negative to deduct)
                </label>
                <input
                  type="number"
                  placeholder="e.g. 100 or -50"
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Reason / Note</label>
                <input
                  type="text"
                  placeholder="e.g. Compensation / Tournament reward"
                  value={adjustDesc}
                  onChange={(e) => setAdjustDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedUserForAdjust(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold cursor-pointer hover:bg-emerald-700"
                >
                  Apply Balance
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: CANCEL ROOM REASON */}
      {/* ========================================================================= */}
      {selectedRoomToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 border border-slate-100 shadow-2xl space-y-3">
            <h3 className="text-sm font-black text-rose-600">Force Cancel Room #{selectedRoomToCancel}</h3>
            <p className="text-xs text-slate-600">
              Entry fees will be immediately refunded back to the player wallets.
            </p>
            <input
              type="text"
              placeholder="Reason for cancellation..."
              value={cancelRoomReason}
              onChange={(e) => setCancelRoomReason(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSelectedRoomToCancel(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={() => handleCancelRoom(selectedRoomToCancel)}
                className="flex-1 py-2 rounded-xl bg-rose-600 text-white text-xs font-bold cursor-pointer hover:bg-rose-700"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ARBITRATE GAME WINNER */}
      {/* ========================================================================= */}
      {selectedGameForResolve && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 border border-slate-100 shadow-2xl space-y-3">
            <h3 className="text-sm font-black text-slate-900">Arbitrate Match #{selectedGameForResolve.roomCode}</h3>
            
            <form onSubmit={handleResolveGame} className="space-y-3">
              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Declare Winner</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setResolveWinnerColor('RED')}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                      resolveWinnerColor === 'RED' ? 'bg-rose-600 text-white border-rose-700' : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    RED: {selectedGameForResolve.players.RED?.username || 'Host'}
                  </button>

                  <button
                    type="button"
                    onClick={() => setResolveWinnerColor('GREEN')}
                    className={`py-2 rounded-xl text-xs font-bold border cursor-pointer ${
                      resolveWinnerColor === 'GREEN' ? 'bg-emerald-600 text-white border-emerald-700' : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    }`}
                  >
                    GREEN: {selectedGameForResolve.players.GREEN?.username || 'Opponent'}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-500 block mb-1">Arbitration Note / Screenshot Result</label>
                <input
                  type="text"
                  placeholder="e.g. Valid winning screenshot verified"
                  value={resolveReason}
                  onChange={(e) => setResolveReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedGameForResolve(null)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black cursor-pointer hover:bg-amber-600"
                >
                  Distribute Prize
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: PIN CHANGE MODAL */}
      {/* ========================================================================= */}
      {showPinChangeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xs bg-white rounded-3xl p-5 border border-slate-100 shadow-2xl space-y-3">
            <h3 className="text-sm font-black text-slate-900 font-['Outfit'] flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-amber-500" />
              <span>Change Master PIN</span>
            </h3>
            <p className="text-xs text-slate-500">
              Set a new security code for your private admin access.
            </p>

            <form onSubmit={handleChangePin} className="space-y-3">
              <input
                type="password"
                maxLength={8}
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                placeholder="Enter new 4-8 digit PIN"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-center"
              />

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinChangeModal(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={newPin.length < 4}
                  className="flex-1 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black cursor-pointer disabled:opacity-50"
                >
                  Save PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
