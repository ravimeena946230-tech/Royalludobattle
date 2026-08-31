export type ViewType = 
  | 'home' 
  | 'battles'
  | 'lobby' 
  | 'game' 
  | 'wallet' 
  | 'refer' 
  | 'kyc' 
  | 'support' 
  | 'profile' 
  | 'history' 
  | 'login'
  | 'admin';

export type UserRole = 'USER' | 'ADMIN';

export type KycStatus = 'NOT_SUBMITTED' | 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface KycDetails {
  fullName: string;
  dob?: string;
  panNumber: string;
  bankAccount?: string;
  ifsc?: string;
  ifscCode?: string;
  upiId?: string;
  submittedAt?: string;
  reviewedAt?: string;
  adminNote?: string;
}

export type KycRecord = KycDetails;

export interface MatchRecord {
  id: string;
  roomCode: string;
  opponentName: string;
  entryFee: number;
  prizeAmount: number;
  result: 'WON' | 'LOST' | 'ABANDONED';
  timestamp: string;
}

export interface UserProfile {
  id: string;
  mobile: string;
  username: string;
  avatar: string;
  role: UserRole;
  referralCode: string;
  referredBy?: string;
  kycStatus: KycStatus;
  kycDetails?: KycDetails;
  wallet: WalletBalance;
  stats: UserStats;
  isBanned?: boolean;
  matchHistory?: MatchRecord[];
  transactions?: Transaction[];
  createdAt?: string;
}

export interface WalletBalance {
  deposit: number;
  winnings: number;
  bonus: number;
  total: number;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winStreak: number;
  totalEarnings?: number;
  totalWinnings?: number;
  referralsCount?: number;
  referralEarnings?: number;
  level?: number;
}

export interface MatchHistoryItem {
  id: string;
  gameId: string;
  roomCode: string;
  opponentName: string;
  opponentAvatar: string;
  userColor: PlayerColor;
  stake: number;
  prize: number;
  result: 'WON' | 'LOST' | 'ABANDONED';
  date: string;
  durationSeconds: number;
}

export interface ReferralStat {
  code: string;
  totalInvited: number;
  totalEarned: number;
  unclaimedEarnings: number;
  referredUsers: {
    id: string;
    username: string;
    mobile: string;
    joinedAt: string;
    earningsFromUser: number;
    firstDepositBonusGiven: boolean;
  }[];
}

export type TransactionType = 
  | 'DEPOSIT' 
  | 'WITHDRAWAL' 
  | 'GAME_ENTRY' 
  | 'GAME_WIN' 
  | 'REFERRAL_BONUS' 
  | 'REFUND';

export type TransactionStatus = 'SUCCESS' | 'COMPLETED' | 'PENDING' | 'FAILED';

export interface Transaction {
  id: string;
  userId: string;
  userName?: string;
  userMobile?: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  referenceId?: string;
  utrNumber?: string;
  paymentMethod?: string;
  paymentProofUrl?: string;
  adminNote?: string;
  timestamp?: string;
  createdAt?: string;
}

export type RoomStatus = 'WAITING' | 'READY' | 'STARTED' | 'PLAYING' | 'FINISHED' | 'EXPIRED';

export interface RoomPlayer {
  id: string;
  userId: string;
  username: string;
  avatar: string;
  color: 'RED' | 'GREEN';
  isReady: boolean;
  isHost: boolean;
  isConnected: boolean;
}

export interface Room {
  id: string;
  code: string; // 6-digit code
  hostId: string;
  hostName: string;
  entryFee: number;
  prizeAmount: number;
  status: RoomStatus;
  players: RoomPlayer[];
  gameId?: string;
  createdAt: string;
  expiresAt: string;
}

// Ludo Game Types
export type PlayerColor = 'RED' | 'GREEN';

export interface TokenInfo {
  id: number; // 0, 1, 2, 3
  color: PlayerColor;
  step: number; // -1 = base/yard, 0..51 = track, 100..105 (RED home) or 200..205 (GREEN home), where 105 or 205 is FINISHED
  isHome: boolean;
}

export interface GameState {
  id: string;
  roomCode: string;
  entryFee: number;
  prizeAmount: number;
  status: 'PLAYING' | 'FINISHED' | 'ABANDONED';
  players: {
    [key in PlayerColor]?: {
      userId: string;
      username: string;
      avatar: string;
      isConnected: boolean;
      timeRemaining: number; // turn timer seconds
    };
  };
  currentTurn: PlayerColor;
  diceValue: number | null;
  hasRolled: boolean;
  consecutiveSixes: number;
  validTokenMoves: number[]; // array of token ids (0..3) that can move
  tokens: {
    RED: TokenInfo[];
    GREEN: TokenInfo[];
  };
  winner: PlayerColor | null;
  lastMove?: {
    player: PlayerColor;
    tokenId: number;
    fromStep: number;
    toStep: number;
    capturedToken?: {
      player: PlayerColor;
      tokenId: number;
    };
  };
  turnStartTime: number;
  matchStartTime: number;
  matchEndTime?: number;
  chatMessages: ChatMessage[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderColor: PlayerColor;
  message: string;
  isEmoji?: boolean;
  timestamp: string;
}

export type TicketStatus = 'OPEN' | 'Open' | 'PROCESSING' | 'Processing' | 'RESOLVED' | 'Resolved' | 'CLOSED' | 'Closed';

export type TicketCategory = 'DEPOSIT' | 'WITHDRAWAL' | 'MATCH_DISPUTE' | 'KYC' | 'OTHER' | 'Payment' | 'Game Issue' | 'Account' | 'Withdrawal' | 'Other';

export interface SupportTicketMessage {
  id: string;
  sender?: 'USER' | 'AGENT' | 'SYSTEM';
  senderName?: string;
  message: string;
  timestamp?: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName?: string;
  userMobile?: string;
  category: TicketCategory;
  subject: string;
  message?: string;
  status: TicketStatus;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  messages?: SupportTicketMessage[];
  replies?: SupportTicketMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type?: 'INFO' | 'SUCCESS' | 'WARNING' | 'BONUS';
  timestamp: string;
  read: boolean;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  details: string;
  adminName: string;
  timestamp: string;
  ip?: string;
}

export interface PlatformSettings {
  commissionPercent: number;
  minDeposit: number;
  maxDeposit: number;
  minWithdrawal: number;
  maxWithdrawal: number;
  maintenanceMode: boolean;
  supportWhatsapp: string;
  supportTelegram: string;
  referralBonus: number;
  referralCommissionPercent: number;
  roomTimeoutMinutes: number;
  bannerAnnouncement: string;
  // Payment receiving details configured by admin
  adminUpiId: string;
  adminUpiName: string;
  adminQrCodeUrl?: string;
  adminBankName: string;
  adminBankAccountName: string;
  adminBankAccountNumber: string;
  adminBankIfsc: string;
  adminBankBranch: string;
  enableUpiDeposit: boolean;
  enableQrDeposit: boolean;
  enableBankDeposit: boolean;
  depositInstructions: string;
}
