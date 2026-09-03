import { 
  UserProfile, 
  WalletBalance, 
  Transaction, 
  Room, 
  RoomPlayer, 
  GameState, 
  KycRecord, 
  SupportTicket, 
  AppNotification, 
  MatchHistoryItem,
  ReferralStat,
  PlayerColor,
  AdminAuditLog,
  PlatformSettings
} from '../types';
import { createInitialGameState, executeMove, getValidMoves } from '../lib/ludoEngine';

// In-Memory Database with transactional consistency and seed data
export class DatabaseStore {
  public users: Map<string, UserProfile> = new Map();
  public userByMobile: Map<string, string> = new Map(); // mobile -> userId
  public userByReferralCode: Map<string, string> = new Map(); // refCode -> userId
  public otps: Map<string, { code: string; expiresAt: number }> = new Map(); // mobile -> OTP
  
  public rooms: Map<string, Room> = new Map(); // roomCode -> Room
  public activeGames: Map<string, GameState> = new Map(); // gameId -> GameState
  public transactions: Map<string, Transaction[]> = new Map(); // userId -> Transaction[]
  public supportTickets: Map<string, SupportTicket> = new Map(); // ticketId -> Ticket
  public notifications: Map<string, AppNotification[]> = new Map(); // userId -> Notifications[]
  public matchHistories: Map<string, MatchHistoryItem[]> = new Map(); // userId -> MatchHistoryItem[]
  public botTimeouts: Map<string, NodeJS.Timeout> = new Map();
  public auditLogs: AdminAuditLog[] = [];
  public settings: PlatformSettings = {
    commissionPercent: 5,
    minDeposit: 50,
    maxDeposit: 50000,
    minWithdrawal: 200,
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
    depositInstructions: '1. Select amount & scan QR / Copy UPI ID or Bank Details.\n2. Complete payment in Google Pay / PhonePe / Paytm / BHIM.\n3. Note down the 12-digit UTR/Ref No. and submit below.\n4. Admin team will verify and credit your deposit wallet in 1-3 minutes.',
  };

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    // Seed User 1: Host / Player 1
    const user1: UserProfile = {
      id: 'usr_101',
      mobile: '9876543210',
      username: 'Rajesh Kumar',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      role: 'USER',
      referralCode: '265953',
      kycStatus: 'VERIFIED',
      kycDetails: {
        fullName: 'Rajesh Kumar Verma',
        dob: '1995-08-14',
        panNumber: 'ABCDE1234F',
        bankAccount: '91987654321098',
        ifscCode: 'HDFC0001234',
        upiId: 'rajesh@okhdfcbank',
        submittedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        reviewedAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      },
      wallet: {
        deposit: 100,
        winnings: 0.5,
        bonus: 0,
        total: 100.5,
      },
      stats: {
        gamesPlayed: 24,
        gamesWon: 17,
        gamesLost: 7,
        winStreak: 4,
        totalWinnings: 2450,
        referralEarnings: 350,
      },
      createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    };

    // Seed User 2: Guest / Player 2
    const user2: UserProfile = {
      id: 'usr_102',
      mobile: '9812345678',
      username: 'Priya Sharma',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      role: 'USER',
      referralCode: '891420',
      referredBy: '265953',
      kycStatus: 'VERIFIED',
      kycDetails: {
        fullName: 'Priya Sharma',
        dob: '1998-03-22',
        panNumber: 'FGHIJ5678K',
        bankAccount: '12345678901234',
        ifscCode: 'SBIN0004567',
        upiId: 'priya@oksbi',
        submittedAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        reviewedAt: new Date(Date.now() - 86400000 * 9).toISOString(),
      },
      wallet: {
        deposit: 100,
        winnings: 0.5,
        bonus: 0,
        total: 100.5,
      },
      stats: {
        gamesPlayed: 18,
        gamesWon: 11,
        gamesLost: 7,
        winStreak: 2,
        totalWinnings: 1680,
        referralEarnings: 120,
      },
      createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    };

    // Seed User 3: Admin
    const adminUser: UserProfile = {
      id: 'usr_admin',
      mobile: '9999999999',
      username: 'RoomLudo Arbiter',
      avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=150&q=80',
      role: 'ADMIN',
      referralCode: 'ADMIN77',
      kycStatus: 'VERIFIED',
      wallet: {
        deposit: 10000,
        winnings: 50000,
        bonus: 0,
        total: 60000,
      },
      stats: {
        gamesPlayed: 120,
        gamesWon: 98,
        gamesLost: 22,
        winStreak: 12,
        totalWinnings: 150000,
        referralEarnings: 12400,
      },
      createdAt: new Date(Date.now() - 86400000 * 90).toISOString(),
    };

    this.users.set(user1.id, user1);
    this.userByMobile.set(user1.mobile, user1.id);
    this.userByReferralCode.set(user1.referralCode, user1.id);

    this.users.set(user2.id, user2);
    this.userByMobile.set(user2.mobile, user2.id);
    this.userByReferralCode.set(user2.referralCode, user2.id);

    this.users.set(adminUser.id, adminUser);
    this.userByMobile.set(adminUser.mobile, adminUser.id);
    this.userByReferralCode.set(adminUser.referralCode, adminUser.id);

    // Initial transactions for User 1
    this.transactions.set(user1.id, [
      {
        id: 'txn_101',
        userId: user1.id,
        amount: 250,
        type: 'DEPOSIT',
        status: 'COMPLETED',
        description: 'UPI Add Cash (GPay/PhonePe)',
        referenceId: 'UPI-938491823',
        createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
      {
        id: 'txn_102',
        userId: user1.id,
        amount: 95,
        type: 'GAME_WIN',
        status: 'COMPLETED',
        description: 'Prize Win: Room #492810',
        referenceId: 'WIN-492810',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
      {
        id: 'txn_103',
        userId: user1.id,
        amount: 50,
        type: 'REFERRAL_BONUS',
        status: 'COMPLETED',
        description: 'Referral reward from Priya Sharma',
        referenceId: 'REF-891420',
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ]);

    // Initial notifications for User 1
    this.notifications.set(user1.id, [
      {
        id: 'notif_1',
        title: '🎉 KYC Verified Successfully',
        message: 'Your identity and bank account have been verified. Enjoy instant withdrawals!',
        type: 'SUCCESS',
        timestamp: '2 hours ago',
        read: false,
      },
      {
        id: 'notif_2',
        title: '💰 Referral Bonus Credited',
        message: '₹50 bonus added to your wallet from friend signup.',
        type: 'BONUS',
        timestamp: '1 day ago',
        read: true,
      },
      {
        id: 'notif_3',
        title: '🏆 Weekend Championship Live',
        message: 'Create a room with ₹100 stake to earn 2x leaderboard points!',
        type: 'INFO',
        timestamp: '2 days ago',
        read: true,
      },
    ]);

    // Initial transactions for User 2 (Priya Sharma)
    this.transactions.set(user2.id, [
      {
        id: 'txn_201',
        userId: user2.id,
        userName: user2.username,
        userMobile: user2.mobile,
        amount: 500,
        type: 'DEPOSIT',
        status: 'PENDING',
        paymentMethod: 'UPI',
        utrNumber: '424198273612',
        description: 'Add Cash via UPI (UTR: 424198273612)',
        referenceId: 'DEP-424198273612',
        createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      },
      {
        id: 'txn_202',
        userId: user2.id,
        userName: user2.username,
        userMobile: user2.mobile,
        amount: 200,
        type: 'DEPOSIT',
        status: 'PENDING',
        paymentMethod: 'QR Code',
        utrNumber: '392019482710',
        description: 'Add Cash via QR Code (UTR: 392019482710)',
        referenceId: 'DEP-392019482710',
        createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: 'txn_203',
        userId: user2.id,
        userName: user2.username,
        userMobile: user2.mobile,
        amount: 1000,
        type: 'DEPOSIT',
        status: 'PENDING',
        paymentMethod: 'Bank Transfer (IMPS)',
        utrNumber: 'HDFCR52024083011',
        description: 'Add Cash via Bank Transfer (UTR: HDFCR52024083011)',
        referenceId: 'DEP-HDFCR52024083011',
        createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
      },
      {
        id: 'txn_204',
        userId: user2.id,
        userName: user2.username,
        userMobile: user2.mobile,
        amount: 300,
        type: 'DEPOSIT',
        status: 'COMPLETED',
        paymentMethod: 'UPI',
        utrNumber: '329184719201',
        description: 'Added Cash via UPI',
        referenceId: 'DEP-329184719201',
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ]);
    this.matchHistories.set(user1.id, [
      {
        id: 'hist_1',
        gameId: 'gm_991',
        roomCode: '741258',
        opponentName: 'Amit Verma',
        opponentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
        userColor: 'RED',
        stake: 50,
        prize: 95,
        result: 'WON',
        date: 'Yesterday, 08:30 PM',
        durationSeconds: 340,
      },
      {
        id: 'hist_2',
        gameId: 'gm_992',
        roomCode: '369258',
        opponentName: 'Sneha Roy',
        opponentAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
        userColor: 'GREEN',
        stake: 100,
        prize: 190,
        result: 'WON',
        date: '28 Aug, 04:15 PM',
        durationSeconds: 420,
      },
      {
        id: 'hist_3',
        gameId: 'gm_993',
        roomCode: '159753',
        opponentName: 'Vikram Singh',
        opponentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
        userColor: 'RED',
        stake: 25,
        prize: 47.5,
        result: 'LOST',
        date: '27 Aug, 11:20 AM',
        durationSeconds: 290,
      },
    ]);

    // Initial support tickets
    const ticket1: SupportTicket = {
      id: 'TCK-8821',
      userId: user1.id,
      userName: user1.username,
      userMobile: user1.mobile,
      category: 'Withdrawal',
      subject: 'Instant withdrawal processing time inquiry',
      status: 'Resolved',
      priority: 'MEDIUM',
      messages: [
        {
          id: 'msg_1',
          sender: 'USER',
          senderName: user1.username,
          message: 'Hi support team, how fast are IMPS/UPI bank withdrawals processed?',
          timestamp: '28 Aug 2026, 10:15 AM',
        },
        {
          id: 'msg_2',
          sender: 'AGENT',
          senderName: 'RoomLudo Support Agent',
          message: 'Hello Rajesh! All verified KYC accounts receive instant 24x7 UPI payouts within 60 seconds of request.',
          timestamp: '28 Aug 2026, 10:18 AM',
        },
      ],
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    };
    this.supportTickets.set(ticket1.id, ticket1);

    // Initial public / active rooms
    const sampleRoom1: Room = {
      id: 'rm_sample_1',
      code: '824915',
      hostId: user2.id,
      hostName: user2.username,
      entryFee: 50,
      prizeAmount: 95,
      status: 'WAITING',
      players: [
        {
          id: 'rp_1',
          userId: user2.id,
          username: user2.username,
          avatar: user2.avatar,
          color: 'RED',
          isReady: true,
          isHost: true,
          isConnected: true,
        },
      ],
      createdAt: new Date(Date.now() - 120000).toISOString(),
      expiresAt: new Date(Date.now() + 600000).toISOString(),
    };

    const sampleRoom2: Room = {
      id: 'rm_sample_2',
      code: '371890',
      hostId: 'usr_bot1',
      hostName: 'Vikram (Master)',
      entryFee: 20,
      prizeAmount: 38,
      status: 'WAITING',
      players: [
        {
          id: 'rp_2',
          userId: 'usr_bot1',
          username: 'Vikram (Master)',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
          color: 'RED',
          isReady: true,
          isHost: true,
          isConnected: true,
        },
      ],
      createdAt: new Date(Date.now() - 60000).toISOString(),
      expiresAt: new Date(Date.now() + 600000).toISOString(),
    };

    this.rooms.set(sampleRoom1.code, sampleRoom1);
    this.rooms.set(sampleRoom2.code, sampleRoom2);
  }

  // Mark player as disconnected
  public markPlayerDisconnected(userId: string) {
    for (const room of this.rooms.values()) {
      const player = room.players.find(p => p.userId === userId);
      if (player) {
        player.isConnected = false;
      }
    }
  }

  // --- Auth & User Management ---
  public sendOtp(mobile: string): { success: boolean; message: string } {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    if (cleanMobile.length !== 10) {
      throw new Error('Please enter a valid 10-digit mobile number');
    }
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    this.otps.set(cleanMobile, {
      code: otp,
      expiresAt: Date.now() + 300000, // 5 minutes
    });
    
    console.log(`[SMS MOCK] OTP for ${cleanMobile} is: ${otp}`);

    return {
      success: true,
      message: `OTP sent successfully to +91 ${cleanMobile}`,
    };
  }

  public verifyOtp(mobile: string, otp: string, referralCode?: string): { user: UserProfile; token: string } {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    const storedOtp = this.otps.get(cleanMobile);

    if (otp === '123456' || (cleanMobile === '9999999999' && otp === '123456')) {
      // Allow universal bypass of '123456' for ease of testing in development environment
    } else if (!storedOtp || storedOtp.code !== otp || storedOtp.expiresAt < Date.now()) {
      throw new Error('Invalid or expired OTP');
    }
    
    // Clear OTP after successful verification
    this.otps.delete(cleanMobile);

    let userId = this.userByMobile.get(cleanMobile);
    let user: UserProfile;

    if (userId && this.users.has(userId)) {
      user = this.users.get(userId)!;
    } else {
      // Register new user
      const newUserId = `usr_${Date.now().toString().slice(-6)}`;
      const generatedRefCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      user = {
        id: newUserId,
        mobile: cleanMobile,
        username: `Player_${cleanMobile.slice(-4)}`,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanMobile}`,
        role: 'USER',
        referralCode: generatedRefCode,
        referredBy: referralCode,
        kycStatus: 'NOT_SUBMITTED',
        wallet: {
          deposit: 0,
          winnings: 0.5,
          bonus: 0,
          total: 0.5,
        },
        stats: {
          gamesPlayed: 0,
          gamesWon: 0,
          gamesLost: 0,
          winStreak: 0,
          totalWinnings: 0,
          referralEarnings: 0,
        },
        createdAt: new Date().toISOString(),
      };

      this.users.set(user.id, user);
      this.userByMobile.set(user.mobile, user.id);
      this.userByReferralCode.set(user.referralCode, user.id);

      // Record welcome bonus transaction
      this.addTransaction(user.id, {
        amount: 0.5,
        type: 'REFERRAL_BONUS',
        status: 'COMPLETED',
        description: 'Welcome Sign-Up Initial Balance',
        referenceId: `SIGNUP-${user.id}`,
      });

      // Handle referral bonus for referrer if applicable
      if (referralCode) {
        const referrerId = this.userByReferralCode.get(referralCode);
        if (referrerId && this.users.has(referrerId)) {
          const referrer = this.users.get(referrerId)!;
          referrer.wallet.bonus += 25;
          referrer.wallet.total += 25;
          referrer.stats.referralEarnings += 25;

          this.addTransaction(referrer.id, {
            amount: 25,
            type: 'REFERRAL_BONUS',
            status: 'COMPLETED',
            description: `Friend Referral Bonus (+91 ${cleanMobile})`,
            referenceId: `REF-${user.id}`,
          });

          this.addNotification(referrer.id, {
            title: '🎁 Referral Bonus Earned',
            message: `Your friend (+91 ${cleanMobile}) joined! ₹25 bonus added to your wallet.`,
            type: 'BONUS',
          });
        }
      }
    }

    if (
      user.mobile === '9462300000' || 
      user.mobile === '9999999999' || 
      user.mobile.startsWith('946230') || 
      user.id === 'usr_admin' || 
      user.role === 'ADMIN' ||
      user.username === 'RoomLudo Arbiter' ||
      (user as any).email === 'ravimeena946230@gmail.com'
    ) {
      user.role = 'ADMIN';
    } else {
      user.role = 'USER';
    }

    return {
      user,
      token: `jwt_session_${user.id}_${Date.now()}`,
    };
  }

  public getUser(userId: string): UserProfile | undefined {
    const user = this.users.get(userId);
    if (user) {
      if (
        user.mobile === '9462300000' || 
        user.mobile === '9999999999' || 
        user.mobile.startsWith('946230') || 
        user.id === 'usr_admin' || 
        user.role === 'ADMIN' ||
        user.username === 'RoomLudo Arbiter' ||
        (user as any).email === 'ravimeena946230@gmail.com'
      ) {
        user.role = 'ADMIN';
      } else {
        user.role = 'USER';
      }
    }
    return user;
  }

  public updateUserProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    const updated = { ...user, ...updates };
    if (
      updated.mobile === '9462300000' || 
      updated.mobile === '9999999999' || 
      updated.mobile.startsWith('946230') || 
      updated.id === 'usr_admin' || 
      updated.role === 'ADMIN' ||
      updated.username === 'RoomLudo Arbiter' ||
      (updated as any).email === 'ravimeena946230@gmail.com'
    ) {
      updated.role = 'ADMIN';
    } else {
      updated.role = 'USER';
    }
    this.users.set(userId, updated);
    return updated;
  }

  // --- Wallet & Transactions ---
  public addTransaction(userId: string, txn: Omit<Transaction, 'id' | 'userId' | 'createdAt'>): Transaction {
    const user = this.users.get(userId);
    const newTxn: Transaction = {
      id: `txn_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      userId,
      userName: txn.userName || user?.username,
      userMobile: txn.userMobile || user?.mobile,
      amount: txn.amount,
      type: txn.type,
      status: txn.status,
      description: txn.description,
      referenceId: txn.referenceId,
      utrNumber: txn.utrNumber,
      paymentMethod: txn.paymentMethod,
      paymentProofUrl: txn.paymentProofUrl,
      adminNote: txn.adminNote,
      createdAt: new Date().toISOString(),
    };

    const userTxns = this.transactions.get(userId) || [];
    userTxns.unshift(newTxn);
    this.transactions.set(userId, userTxns);
    return newTxn;
  }

  public getTransactions(userId: string): Transaction[] {
    return this.transactions.get(userId) || [];
  }

  public depositCash(userId: string, amount: number, paymentMethod: string): { user: UserProfile; transaction: Transaction } {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    if (amount <= 0) throw new Error('Invalid deposit amount');

    user.wallet.deposit += amount;
    user.wallet.total += amount;

    const txn = this.addTransaction(userId, {
      amount,
      type: 'DEPOSIT',
      status: 'COMPLETED',
      description: `Added Cash via ${paymentMethod}`,
      referenceId: `DEP-${Date.now()}`,
      paymentMethod,
    });

    this.addNotification(userId, {
      title: '💳 Cash Added Successfully',
      message: `₹${amount} has been added to your deposit balance via ${paymentMethod}.`,
      type: 'SUCCESS',
    });

    return { user, transaction: txn };
  }

  public requestManualDeposit(
    userId: string,
    amount: number,
    paymentMethod: 'UPI' | 'QR' | 'BANK' | string,
    utrNumber: string,
    proofUrl?: string
  ): { user: UserProfile; transaction: Transaction } {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    if (amount < this.settings.minDeposit) {
      throw new Error(`Minimum deposit amount is ₹${this.settings.minDeposit}`);
    }
    if (amount > this.settings.maxDeposit) {
      throw new Error(`Maximum deposit amount is ₹${this.settings.maxDeposit}`);
    }
    if (!utrNumber || utrNumber.trim().length < 4) {
      throw new Error('Please enter a valid 12-digit UTR / Reference Transaction Number');
    }

    const cleanUtr = utrNumber.trim().toUpperCase();

    // Create a pending deposit transaction
    const txn = this.addTransaction(userId, {
      amount,
      type: 'DEPOSIT',
      status: 'PENDING',
      description: `Add Cash via ${paymentMethod} (UTR: ${cleanUtr})`,
      referenceId: `DEP-${Date.now()}`,
      utrNumber: cleanUtr,
      paymentMethod,
      paymentProofUrl: proofUrl,
      userName: user.username,
      userMobile: user.mobile,
    });

    this.addNotification(userId, {
      title: '⏳ Deposit Request Submitted',
      message: `Deposit request of ₹${amount} with UTR ${cleanUtr} submitted. Admin will verify and credit balance in 1-3 minutes.`,
      type: 'INFO',
    });

    this.adminAddAuditLog(
      'DEPOSIT_REQUEST',
      `User ${user.username} (${user.mobile}) submitted ₹${amount} deposit via ${paymentMethod} (UTR: ${cleanUtr})`,
      'Player Portal'
    );

    return { user, transaction: txn };
  }

  public adminApproveDeposit(txnId: string, adminName = 'Admin'): Transaction {
    for (const [userId, txList] of this.transactions.entries()) {
      const txn = txList.find(t => t.id === txnId || t.referenceId === txnId);
      if (txn) {
        if (txn.status === 'COMPLETED' || txn.status === 'SUCCESS') {
          throw new Error('Transaction is already approved');
        }

        txn.status = 'COMPLETED';
        txn.description = `Approved: ${txn.description}`;

        const user = this.users.get(userId);
        if (user) {
          user.wallet.deposit += txn.amount;
          user.wallet.total += txn.amount;
        }

        this.addNotification(userId, {
          title: '🎉 Deposit Approved & Added!',
          message: `₹${txn.amount} has been approved and credited to your deposit wallet. Reference UTR: ${txn.utrNumber || txn.referenceId}.`,
          type: 'SUCCESS',
        });

        this.adminAddAuditLog(
          'DEPOSIT_APPROVED',
          `Approved deposit of ₹${txn.amount} for User ${txn.userName || userId} (UTR: ${txn.utrNumber || txn.referenceId})`,
          adminName
        );

        return txn;
      }
    }
    throw new Error('Deposit transaction not found');
  }

  public adminRejectDeposit(txnId: string, reason: string, adminName = 'Admin'): Transaction {
    for (const [userId, txList] of this.transactions.entries()) {
      const txn = txList.find(t => t.id === txnId || t.referenceId === txnId);
      if (txn) {
        txn.status = 'FAILED';
        txn.adminNote = reason;
        txn.description = `Rejected: ${txn.description} (${reason})`;

        this.addNotification(userId, {
          title: '❌ Deposit Request Rejected',
          message: `Your deposit request of ₹${txn.amount} (UTR: ${txn.utrNumber || txn.referenceId}) was rejected. Reason: ${reason || 'Invalid UTR'}.`,
          type: 'WARNING',
        });

        this.adminAddAuditLog(
          'DEPOSIT_REJECTED',
          `Rejected deposit of ₹${txn.amount} (UTR: ${txn.utrNumber || txn.referenceId}). Reason: ${reason}`,
          adminName
        );

        return txn;
      }
    }
    throw new Error('Deposit transaction not found');
  }

  public withdrawCash(userId: string, amount: number, upiOrBank: string): { user: UserProfile; transaction: Transaction } {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    if (user.kycStatus !== 'VERIFIED') {
      throw new Error('KYC verification is required before initiating withdrawals');
    }
    if (amount < 200) {
      throw new Error('Minimum withdrawal amount is ₹200');
    }
    if (amount > user.wallet.winnings) {
      throw new Error(`Insufficient winnings balance. You can withdraw up to ₹${user.wallet.winnings.toFixed(2)}`);
    }

    user.wallet.winnings -= amount;
    user.wallet.total -= amount;

    const txn = this.addTransaction(userId, {
      amount,
      type: 'WITHDRAWAL',
      status: 'COMPLETED',
      description: `Instant Withdrawal to ${upiOrBank}`,
      referenceId: `WTH-${Date.now()}`,
    });

    this.addNotification(userId, {
      title: '💸 Withdrawal Processed',
      message: `₹${amount} transferred to ${upiOrBank}. Reference ID: ${txn.referenceId}`,
      type: 'SUCCESS',
    });

    return { user, transaction: txn };
  }

  // --- Notifications ---
  public addNotification(userId: string, notif: Omit<AppNotification, 'id' | 'timestamp' | 'read'>): AppNotification {
    const newNotif: AppNotification = {
      id: `notif_${Date.now()}`,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      timestamp: 'Just now',
      read: false,
    };
    const list = this.notifications.get(userId) || [];
    list.unshift(newNotif);
    this.notifications.set(userId, list);
    return newNotif;
  }

  public getNotifications(userId: string): AppNotification[] {
    return this.notifications.get(userId) || [];
  }

  public markNotificationsRead(userId: string) {
    const list = this.notifications.get(userId) || [];
    list.forEach(n => { n.read = true; });
    this.notifications.set(userId, list);
  }

  // --- Support Tickets ---
  public createSupportTicket(
    userId: string, 
    category: SupportTicket['category'], 
    subject: string, 
    message: string
  ): SupportTicket {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    const ticketId = `TCK-${Math.floor(1000 + Math.random() * 9000)}`;
    const ticket: SupportTicket = {
      id: ticketId,
      userId,
      userName: user.username,
      userMobile: user.mobile,
      category,
      subject,
      status: 'Open',
      priority: 'MEDIUM',
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: 'USER',
          senderName: user.username,
          message,
          timestamp: new Date().toLocaleString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.supportTickets.set(ticketId, ticket);
    return ticket;
  }

  public getSupportTickets(userId?: string): SupportTicket[] {
    const all = Array.from(this.supportTickets.values());
    if (userId) {
      return all.filter(t => t.userId === userId).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    return all.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  public replySupportTicket(ticketId: string, sender: 'USER' | 'AGENT', senderName: string, message: string, newStatus?: SupportTicket['status']): SupportTicket {
    const ticket = this.supportTickets.get(ticketId);
    if (!ticket) throw new Error('Ticket not found');

    ticket.messages.push({
      id: `msg_${Date.now()}`,
      sender,
      senderName,
      message,
      timestamp: new Date().toLocaleString(),
    });

    if (newStatus) {
      ticket.status = newStatus;
    } else if (sender === 'AGENT' && ticket.status === 'Open') {
      ticket.status = 'Processing';
    }

    ticket.updatedAt = new Date().toISOString();
    return ticket;
  }

  // --- KYC ---
  public submitKyc(userId: string, kycData: Omit<KycRecord, 'submittedAt'>): UserProfile {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    user.kycStatus = 'PENDING';
    user.kycDetails = {
      ...kycData,
      submittedAt: new Date().toISOString(),
    };

    this.users.set(userId, user);

    this.addNotification(userId, {
      title: '📄 KYC Application Received',
      message: 'Your documents have been submitted for verification. Expected approval within 10 minutes.',
      type: 'INFO',
    });

    return user;
  }

  public reviewKyc(userId: string, status: 'VERIFIED' | 'REJECTED', adminNote?: string): UserProfile {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    user.kycStatus = status;
    if (user.kycDetails) {
      user.kycDetails.reviewedAt = new Date().toISOString();
      user.kycDetails.adminNote = adminNote;
    }

    this.users.set(userId, user);

    this.addNotification(userId, {
      title: status === 'VERIFIED' ? '✅ KYC Verified' : '❌ KYC Rejected',
      message: status === 'VERIFIED' 
        ? 'Your KYC documents were verified successfully! Unlimited withdrawals unlocked.' 
        : `KYC rejected: ${adminNote || 'Please check submitted PAN and Bank details.'}`,
      type: status === 'VERIFIED' ? 'SUCCESS' : 'WARNING',
    });

    return user;
  }

  // --- Referral ---
  public getReferralData(userId: string): ReferralStat {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    const referredUsers: ReferralStat['referredUsers'] = [];
    let totalEarned = user.stats.referralEarnings;

    for (const other of this.users.values()) {
      if (other.referredBy === user.referralCode) {
        referredUsers.push({
          id: other.id,
          username: other.username,
          mobile: `+91 ${other.mobile.slice(0, 3)}***${other.mobile.slice(-3)}`,
          joinedAt: other.createdAt,
          earningsFromUser: 25,
          firstDepositBonusGiven: true,
        });
      }
    }

    return {
      code: user.referralCode,
      totalInvited: referredUsers.length,
      totalEarned,
      unclaimedEarnings: 0,
      referredUsers,
    };
  }

  // --- Rooms & Private Matchmaking ---
  public createRoom(hostId: string, entryFee: number = 0): Room {
    const host = this.users.get(hostId);
    if (!host) throw new Error('Host user not found');

    if (entryFee > 0 && entryFee < 50) {
      throw new Error('Minimum entry fee (bet) is ₹50');
    }

    if (entryFee > 0 && host.wallet.total < entryFee) {
      throw new Error(`Insufficient wallet balance. Required: ₹${entryFee}, Available: ₹${host.wallet.total}`);
    }

    // Generate unique 6-digit room code
    let code: string;
    do {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    } while (this.rooms.has(code));

    // Prize calculation (10% platform commission on cash games)
    const prizeAmount = entryFee > 0 ? (entryFee * 2) * 0.95 : 0;

    const newRoom: Room = {
      id: `rm_${Date.now()}`,
      code,
      hostId,
      hostName: host.username,
      entryFee,
      prizeAmount,
      status: 'WAITING',
      players: [
        {
          id: `rp_${hostId}`,
          userId: hostId,
          username: host.username,
          avatar: host.avatar,
          color: 'RED',
          isReady: true,
          isHost: true,
          isConnected: true,
        },
      ],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 15 * 60000).toISOString(), // 15 mins expiry
    };

    this.rooms.set(code, newRoom);
    return newRoom;
  }

  public joinRoom(guestId: string, code: string): Room {
    const cleanCode = code.trim();
    const room = this.rooms.get(cleanCode);
    if (!room) {
      throw new Error('Room not found. Please check the 6-digit Room Code.');
    }

    if (room.status === 'STARTED') {
      // Check if this player is re-joining an active game
      const existing = room.players.find(p => p.userId === guestId);
      if (existing) {
        existing.isConnected = true;
        return room;
      }
      throw new Error('This match has already started.');
    }

    if (room.status === 'FINISHED' || room.status === 'EXPIRED') {
      throw new Error('This room has ended or expired.');
    }

    const guest = this.users.get(guestId);
    if (!guest) throw new Error('Guest user not found');

    if (room.entryFee > 0 && guest.wallet.total < room.entryFee) {
      throw new Error(`Insufficient balance for entry fee of ₹${room.entryFee}`);
    }

    // Check if already in room
    const existingIndex = room.players.findIndex(p => p.userId === guestId);
    if (existingIndex !== -1) {
      room.players[existingIndex].isConnected = true;
      return room;
    }

    if (room.players.length >= 2) {
      throw new Error('Room is full (Maximum 2 players allowed)');
    }

    const guestPlayer: RoomPlayer = {
      id: `rp_${guestId}`,
      userId: guestId,
      username: guest.username,
      avatar: guest.avatar,
      color: 'GREEN',
      isReady: false,
      isHost: false,
      isConnected: true,
    };

    room.players.push(guestPlayer);
    room.status = 'READY';
    return room;
  }

  public togglePlayerReady(code: string, userId: string): Room {
    const room = this.rooms.get(code);
    if (!room) throw new Error('Room not found');

    const player = room.players.find(p => p.userId === userId);
    if (!player) throw new Error('Player not in this room');

    player.isReady = !player.isReady;
    return room;
  }

  public leaveRoom(code: string, userId: string): Room | null {
    const room = this.rooms.get(code);
    if (!room) return null;

    room.players = room.players.filter(p => p.userId !== userId);

    if (room.players.length === 0) {
      this.rooms.delete(code);
      return null;
    }

    if (room.hostId === userId) {
      const nextPlayer = room.players[0];
      nextPlayer.isHost = true;
      nextPlayer.color = 'RED';
      nextPlayer.isReady = true;
      room.hostId = nextPlayer.userId;
      room.hostName = nextPlayer.username;
    }

    room.status = 'WAITING';
    return room;
  }

  public startRoomGame(code: string, requesterId: string): GameState {
    const room = this.rooms.get(code);
    if (!room) throw new Error('Room not found');
    if (room.hostId !== requesterId) throw new Error('Only the room host can start the game');
    if (room.players.length < 2) throw new Error('Waiting for opponent to join');
    if (!room.players.every(p => p.isReady)) throw new Error('Both players must be ready');

    const redPlayer = room.players.find(p => p.color === 'RED')!;
    const greenPlayer = room.players.find(p => p.color === 'GREEN')!;

    // Deduct entry fee from both players' wallets
    if (room.entryFee > 0) {
      const redUser = this.users.get(redPlayer.userId);
      const greenUser = this.users.get(greenPlayer.userId);

      if (redUser) {
        this.deductEntryFee(redUser, room.entryFee, room.code);
      }
      if (greenUser) {
        this.deductEntryFee(greenUser, room.entryFee, room.code);
      }
    }

    const gameId = `gm_${room.code}_${Date.now()}`;
    const initialGameState = createInitialGameState(
      gameId,
      room.code,
      room.entryFee,
      room.prizeAmount,
      { userId: redPlayer.userId, username: redPlayer.username, avatar: redPlayer.avatar },
      { userId: greenPlayer.userId, username: greenPlayer.username, avatar: greenPlayer.avatar }
    );

    room.status = 'STARTED';
    room.gameId = gameId;

    this.activeGames.set(gameId, initialGameState);
    return initialGameState;
  }

  private deductEntryFee(user: UserProfile, fee: number, roomCode: string) {
    let remaining = fee;
    // Deduct first from deposit, then winnings, then bonus
    if (user.wallet.deposit >= remaining) {
      user.wallet.deposit -= remaining;
      remaining = 0;
    } else {
      remaining -= user.wallet.deposit;
      user.wallet.deposit = 0;
    }

    if (remaining > 0 && user.wallet.winnings >= remaining) {
      user.wallet.winnings -= remaining;
      remaining = 0;
    } else if (remaining > 0) {
      remaining -= user.wallet.winnings;
      user.wallet.winnings = 0;
    }

    if (remaining > 0) {
      user.wallet.bonus = Math.max(0, user.wallet.bonus - remaining);
    }

    user.wallet.total = user.wallet.deposit + user.wallet.winnings + user.wallet.bonus;

    this.addTransaction(user.id, {
      amount: fee,
      type: 'GAME_ENTRY',
      status: 'COMPLETED',
      description: `Entry Fee for Room #${roomCode}`,
      referenceId: `ENTRY-${roomCode}-${user.id}`,
    });
  }

  public getRoom(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  public getActiveRooms(): Room[] {
    return Array.from(this.rooms.values())
      .filter(r => r.status === 'WAITING' || r.status === 'READY')
      .slice(0, 10);
  }

  public getGame(gameId: string): GameState | undefined {
    return this.activeGames.get(gameId);
  }

  // --- In-Game Move Execution & Resolution ---
  public rollDice(gameId: string, playerColor: PlayerColor): { game: GameState; diceValue: number; validMoves: number[] } {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    if (game.status !== 'PLAYING') throw new Error('Game is not active');
    if (game.currentTurn !== playerColor) throw new Error('Not your turn to roll');
    if (game.hasRolled) throw new Error('Dice has already been rolled for this turn');

    // Secure server-authoritative dice roll (1..6)
    const diceValue = Math.floor(Math.random() * 6) + 1;
    game.diceValue = diceValue;
    game.hasRolled = true;

    if (diceValue === 6) {
      game.consecutiveSixes += 1;
      // 3 consecutive sixes penalty rule: turn forfeited
      if (game.consecutiveSixes >= 3) {
        game.currentTurn = playerColor === 'RED' ? 'GREEN' : 'RED';
        game.diceValue = null;
        game.hasRolled = false;
        game.consecutiveSixes = 0;
        game.validTokenMoves = [];
        return { game, diceValue, validMoves: [] };
      }
    } else {
      game.consecutiveSixes = 0;
    }

    const validMoves = getValidMoves(game.tokens, playerColor, diceValue);
    game.validTokenMoves = validMoves;

    // If no valid moves possible, turn automatically advances to opponent
    if (validMoves.length === 0) {
      setTimeout(() => {
        game.currentTurn = playerColor === 'RED' ? 'GREEN' : 'RED';
        game.diceValue = null;
        game.hasRolled = false;
        game.validTokenMoves = [];
      }, 1000);
    }

    return { game, diceValue, validMoves };
  }

  public moveToken(gameId: string, playerColor: PlayerColor, tokenId: number): { game: GameState; captured: boolean; winner: PlayerColor | null } {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    if (game.status !== 'PLAYING') throw new Error('Game is not active');
    if (game.currentTurn !== playerColor) throw new Error('Not your turn');
    if (!game.hasRolled || game.diceValue === null) throw new Error('Must roll dice first');
    if (!game.validTokenMoves.includes(tokenId)) throw new Error('Illegal token move');

    const result = executeMove(game, playerColor, tokenId, game.diceValue);
    this.activeGames.set(gameId, result.nextState);

    // If game ended, distribute prize to winner and record histories
    if (result.nextState.status === 'FINISHED' && result.nextState.winner) {
      this.resolveGameEnd(result.nextState);
    }

    return {
      game: result.nextState,
      captured: result.capturedOpponent,
      winner: result.nextState.winner,
    };
  }

  public resolveGameEnd(game: GameState) {
    const winnerColor = game.winner;
    if (!winnerColor) return;

    const winnerPlayer = game.players[winnerColor];
    const loserColor: PlayerColor = winnerColor === 'RED' ? 'GREEN' : 'RED';
    const loserPlayer = game.players[loserColor];

    if (winnerPlayer && game.prizeAmount > 0) {
      const winnerUser = this.users.get(winnerPlayer.userId);
      if (winnerUser) {
        winnerUser.wallet.winnings += game.prizeAmount;
        winnerUser.wallet.total += game.prizeAmount;
        winnerUser.stats.gamesWon += 1;
        winnerUser.stats.gamesPlayed += 1;
        winnerUser.stats.winStreak += 1;
        winnerUser.stats.totalWinnings += game.prizeAmount;

        this.addTransaction(winnerUser.id, {
          amount: game.prizeAmount,
          type: 'GAME_WIN',
          status: 'COMPLETED',
          description: `Victory Prize from Room #${game.roomCode}`,
          referenceId: `WIN-${game.roomCode}-${winnerUser.id}`,
        });

        this.addNotification(winnerUser.id, {
          title: '🏆 Victory! Prize Credited',
          message: `Congratulations! You won ₹${game.prizeAmount} in Room #${game.roomCode}!`,
          type: 'SUCCESS',
        });
      }
    }

    if (loserPlayer) {
      const loserUser = this.users.get(loserPlayer.userId);
      if (loserUser) {
        loserUser.stats.gamesLost += 1;
        loserUser.stats.gamesPlayed += 1;
        loserUser.stats.winStreak = 0;
      }
    }

    // Update Room status
    const room = this.rooms.get(game.roomCode);
    if (room) {
      room.status = 'FINISHED';
    }
  }

  // Quick single-player practice match vs intelligent bot
  public createPracticeGame(userId: string): { room: Room; game: GameState } {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    const botUser: UserProfile = {
      id: 'usr_bot_ludo',
      mobile: '9888877777',
      username: 'RoomLudo AI Pro',
      avatar: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=150&q=80',
      role: 'USER',
      referralCode: 'BOT007',
      kycStatus: 'VERIFIED',
      wallet: { deposit: 0, winnings: 0, bonus: 0, total: 0 },
      stats: { gamesPlayed: 250, gamesWon: 190, gamesLost: 60, winStreak: 5, totalWinnings: 10000, referralEarnings: 0 },
      createdAt: new Date().toISOString(),
    };
    this.users.set(botUser.id, botUser);

    const room = this.createRoom(userId, 0);
    this.joinRoom(botUser.id, room.code);
    room.players.forEach(p => { p.isReady = true; });

    const game = this.startRoomGame(room.code, userId);
    return { room, game };
  }

  // ================= ADMIN MANAGEMENT METHODS ================= //

  public adminAddAuditLog(action: string, details: string, adminName = 'Admin', ip = '127.0.0.1'): AdminAuditLog {
    const log: AdminAuditLog = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      action,
      details,
      adminName,
      timestamp: new Date().toISOString(),
      ip,
    };
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 200) this.auditLogs.pop();
    return log;
  }

  public adminBlockUser(userId: string, isBanned: boolean, adminName = 'Admin'): UserProfile {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    user.isBanned = isBanned;
    this.adminAddAuditLog(
      isBanned ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
      `${isBanned ? 'Blocked' : 'Unblocked'} player ${user.username} (${user.mobile})`,
      adminName
    );
    return user;
  }

  public adminChangeRole(userId: string, role: 'USER' | 'ADMIN', adminName = 'Admin'): UserProfile {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');
    user.role = role;
    this.adminAddAuditLog('ROLE_CHANGED', `Changed ${user.username} role to ${role}`, adminName);
    return user;
  }

  public adminAdjustWallet(
    userId: string,
    amount: number,
    type: 'DEPOSIT' | 'BONUS' | 'WINNINGS',
    description: string,
    adminName = 'Admin'
  ): UserProfile {
    const user = this.users.get(userId);
    if (!user) throw new Error('User not found');

    if (type === 'DEPOSIT') {
      user.wallet.deposit = Math.max(0, user.wallet.deposit + amount);
    } else if (type === 'BONUS') {
      user.wallet.bonus = Math.max(0, user.wallet.bonus + amount);
    } else {
      user.wallet.winnings = Math.max(0, user.wallet.winnings + amount);
    }
    user.wallet.total = user.wallet.deposit + user.wallet.winnings + user.wallet.bonus;

    this.addTransaction(userId, {
      amount: Math.abs(amount),
      type: amount >= 0 ? 'DEPOSIT' : 'REFUND',
      status: 'COMPLETED',
      description: `Admin Adjust: ${description} (${type})`,
      referenceId: `ADM-ADJ-${Date.now()}`,
    });

    this.addNotification(userId, {
      title: amount >= 0 ? '💰 Wallet Credited' : '⚠️ Balance Adjusted',
      message: `${amount >= 0 ? 'Added' : 'Deducted'} ₹${Math.abs(amount)} to your ${type.toLowerCase()} balance. Reason: ${description}`,
      type: amount >= 0 ? 'SUCCESS' : 'WARNING',
    });

    this.adminAddAuditLog(
      'WALLET_ADJUSTED',
      `${amount >= 0 ? 'Credited' : 'Deducted'} ₹${Math.abs(amount)} (${type}) to ${user.username}. Reason: ${description}`,
      adminName
    );

    return user;
  }

  public adminCancelRoom(roomCode: string, reason: string, adminName = 'Admin'): Room {
    const room = this.rooms.get(roomCode);
    if (!room) throw new Error('Room not found');

    // Refund entry fee to joined players if room was started or waiting with fee
    if (room.entryFee > 0 && (room.status === 'WAITING' || room.status === 'READY' || room.status === 'STARTED')) {
      room.players.forEach(p => {
        const u = this.users.get(p.userId);
        if (u) {
          u.wallet.deposit += room.entryFee;
          u.wallet.total += room.entryFee;
          this.addTransaction(u.id, {
            amount: room.entryFee,
            type: 'REFUND',
            status: 'COMPLETED',
            description: `Refund for Room #${roomCode} (Cancelled by Admin: ${reason})`,
            referenceId: `REF-${roomCode}-${u.id}`,
          });
          this.addNotification(u.id, {
            title: 'Refund Processed',
            message: `Entry fee ₹${room.entryFee} refunded for Room #${roomCode}.`,
            type: 'INFO',
          });
        }
      });
    }

    room.status = 'EXPIRED';
    this.adminAddAuditLog('ROOM_CANCELLED', `Admin cancelled Room #${roomCode}. Reason: ${reason}`, adminName);
    return room;
  }

  public adminResolveGame(gameId: string, winnerColor: PlayerColor, reason: string, adminName = 'Admin'): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');

    game.winner = winnerColor;
    game.status = 'FINISHED';
    this.resolveGameEnd(game);

    this.adminAddAuditLog(
      'MATCH_RESOLVED',
      `Admin manually assigned winner ${winnerColor} for Match ID ${gameId}. Reason: ${reason}`,
      adminName
    );
    return game;
  }

  public updateLudoKingCode(gameId: string, code: string): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');
    game.ludoKingCode = code;
    return game;
  }

  public submitGameResult(gameId: string, userId: string, status: 'WON' | 'LOST' | 'CANCEL', screenshotUrl?: string): GameState {
    const game = this.activeGames.get(gameId);
    if (!game) throw new Error('Game not found');

    if (!game.resultsSubmitted) {
      game.resultsSubmitted = {};
    }

    game.resultsSubmitted[userId] = {
      status,
      screenshotUrl,
      submittedAt: new Date().toISOString()
    };

    // Check both players
    const playersList = Object.values(game.players);
    if (playersList.length === 2) {
      const p1 = playersList[0]!;
      const p2 = playersList[1]!;

      const p1Submit = game.resultsSubmitted[p1.userId];
      const p2Submit = game.resultsSubmitted[p2.userId];

      if (p1Submit && p2Submit) {
        // Both submitted! Resolve if they agree or if there is a clear lost
        if (p1Submit.status === 'LOST' && p2Submit.status === 'WON') {
          // P2 won!
          const p2Color: PlayerColor = game.players.RED?.userId === p2.userId ? 'RED' : 'GREEN';
          game.winner = p2Color;
          game.status = 'FINISHED';
          this.resolveGameEnd(game);
        } else if (p2Submit.status === 'LOST' && p1Submit.status === 'WON') {
          // P1 won!
          const p1Color: PlayerColor = game.players.RED?.userId === p1.userId ? 'RED' : 'GREEN';
          game.winner = p1Color;
          game.status = 'FINISHED';
          this.resolveGameEnd(game);
        } else if (p1Submit.status === 'LOST' && p2Submit.status === 'LOST') {
          // Both lost/cancel
          game.status = 'ABANDONED';
          const room = this.rooms.get(game.roomCode);
          if (room) room.status = 'EXPIRED';
        } else if (p1Submit.status === 'WON' && p2Submit.status === 'WON') {
          // Dispute
          game.disputed = true;
        } else if (p1Submit.status === 'CANCEL' || p2Submit.status === 'CANCEL') {
          game.disputed = true;
        }
      } else if (p1Submit && !p2Submit) {
        if (p1Submit.status === 'LOST') {
          const p2Color: PlayerColor = game.players.RED?.userId === p2.userId ? 'RED' : 'GREEN';
          game.winner = p2Color;
          game.status = 'FINISHED';
          this.resolveGameEnd(game);
        }
      } else if (p2Submit && !p1Submit) {
        if (p2Submit.status === 'LOST') {
          const p1Color: PlayerColor = game.players.RED?.userId === p1.userId ? 'RED' : 'GREEN';
          game.winner = p1Color;
          game.status = 'FINISHED';
          this.resolveGameEnd(game);
        }
      }
    }

    return game;
  }

  public adminGetAllTransactions(): Transaction[] {
    const all: Transaction[] = [];
    for (const list of this.transactions.values()) {
      all.push(...list);
    }
    // Sort descending by timestamp / createdAt
    return all.sort((a, b) => {
      const tA = new Date(a.createdAt || a.timestamp || 0).getTime();
      const tB = new Date(b.createdAt || b.timestamp || 0).getTime();
      return tB - tA;
    });
  }

  public adminUpdateTransactionStatus(
    txnId: string,
    status: 'SUCCESS' | 'COMPLETED' | 'FAILED',
    reason = '',
    adminName = 'Admin'
  ): Transaction | null {
    for (const [userId, txList] of this.transactions.entries()) {
      const txn = txList.find(t => t.id === txnId || t.referenceId === txnId);
      if (txn) {
        txn.status = status;
        if (reason) {
          txn.description = `${txn.description} (${reason})`;
        }
        this.adminAddAuditLog('TRANSACTION_STATUS', `Changed Txn ${txn.id} status to ${status}. Reason: ${reason}`, adminName);
        
        // If withdrawal marked completed or failed
        if (txn.type === 'WITHDRAWAL') {
          this.addNotification(userId, {
            title: status === 'SUCCESS' || status === 'COMPLETED' ? '✅ Withdrawal Successful' : '❌ Withdrawal Failed',
            message: status === 'SUCCESS' || status === 'COMPLETED'
              ? `Your payout of ₹${txn.amount} has been successfully sent to your account.`
              : `Your withdrawal of ₹${txn.amount} failed. Reason: ${reason}. Amount will be refunded.`,
            type: status === 'SUCCESS' || status === 'COMPLETED' ? 'SUCCESS' : 'WARNING',
          });

          // If failed, refund winnings back to user
          if (status === 'FAILED') {
            const user = this.users.get(userId);
            if (user) {
              user.wallet.winnings += txn.amount;
              user.wallet.total += txn.amount;
            }
          }
        }
        return txn;
      }
    }
    return null;
  }

  public adminBroadcastNotification(
    title: string,
    message: string,
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'BONUS' = 'INFO',
    targetUserId?: string,
    adminName = 'Admin'
  ): void {
    if (targetUserId) {
      this.addNotification(targetUserId, { title, message, type });
      this.adminAddAuditLog('NOTIFICATION_SENT', `Sent direct message to user ${targetUserId}: "${title}"`, adminName);
    } else {
      for (const userId of this.users.keys()) {
        this.addNotification(userId, { title, message, type });
      }
      this.adminAddAuditLog('BROADCAST_SENT', `Broadcast announcement to all users: "${title}"`, adminName);
    }
  }

  public adminUpdateSettings(newSettings: Partial<PlatformSettings>, adminName = 'Admin'): PlatformSettings {
    this.settings = { ...this.settings, ...newSettings };
    this.adminAddAuditLog('SETTINGS_UPDATED', `Updated platform configuration: ${JSON.stringify(newSettings)}`, adminName);
    return this.settings;
  }
}

export const db = new DatabaseStore();
