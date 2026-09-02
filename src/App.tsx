import React, { useState, useEffect, useCallback } from 'react';
import { 
  UserProfile, 
  Room, 
  GameState, 
  ViewType, 
  AppNotification, 
  KycDetails 
} from './types';
import { getSocket } from './lib/socketClient';
import { sounds } from './lib/soundEffects';

// Components
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { SideDrawer } from './components/SideDrawer';
import { AddCashModal } from './components/AddCashModal';
import { WithdrawModal } from './components/WithdrawModal';

// Views
import { HomeView } from './views/HomeView';
import { BattlesView } from './views/BattlesView';
import { LobbyView } from './views/LobbyView';
import { GameView } from './views/GameView';
import { WalletView } from './views/WalletView';
import { ReferView } from './views/ReferView';
import { KycView } from './views/KycView';
import { SupportView } from './views/SupportView';
import { ProfileView } from './views/ProfileView';
import { AdminView } from './views/AdminView';
import { AuthModal } from './views/AuthModal';
import { LoginView } from './views/LoginView';

export const App: React.FC = () => {
  // Default logged in user
  const [currentUser, setCurrentUser] = useState<UserProfile>({
    id: 'usr_101',
    mobile: '9876543210',
    username: 'Rajesh Gamer',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=rajesh',
    role: 'USER',
    kycStatus: 'VERIFIED',
    wallet: {
      deposit: 0,
      winnings: 0.5,
      bonus: 0,
      total: 0.5,
    },
    stats: {
      gamesPlayed: 24,
      gamesWon: 18,
      gamesLost: 6,
      totalEarnings: 3420,
      winStreak: 3,
      referralsCount: 4,
      level: 4,
    },
    referralCode: 'RAJESH50',
    matchHistory: [
      {
        id: 'mat_001',
        roomCode: '741852',
        opponentName: 'Priya Pro',
        entryFee: 50,
        prizeAmount: 95,
        result: 'WON',
        timestamp: 'Today, 2:30 PM',
      },
      {
        id: 'mat_002',
        roomCode: '852963',
        opponentName: 'Amit King',
        entryFee: 25,
        prizeAmount: 47.5,
        result: 'WON',
        timestamp: 'Yesterday',
      }
    ],
    transactions: [
      {
        id: 'txn_101',
        userId: 'usr_101',
        amount: 200,
        type: 'DEPOSIT',
        status: 'SUCCESS',
        description: 'UPI Deposit - GPay',
        timestamp: 'Today, 1:15 PM',
      },
      {
        id: 'txn_102',
        userId: 'usr_101',
        amount: 95,
        type: 'GAME_WIN',
        status: 'SUCCESS',
        description: 'Match Victory Prize - Room #741852',
        timestamp: 'Today, 2:30 PM',
      }
    ],
    kycDetails: {
      fullName: 'Rajesh Kumar',
      panNumber: 'ABCDE1234F',
      dob: '1996-08-20',
      bankAccount: '918273645012',
      ifsc: 'HDFC0001234',
      upiId: 'rajesh@upi',
    }
  });

  const [activeView, setActiveView] = useState<ViewType>('home');
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [currentGame, setCurrentGame] = useState<GameState | null>(null);

  // Modals & Drawers
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddCashOpen, setIsAddCashOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([
    {
      id: 'notif_1',
      title: 'Welcome to Royalludobattle',
      message: 'Experience fast 1v1 real cash Ludo battles with instant UPI withdrawals.',
      timestamp: '10m ago',
      read: false,
    },
    {
      id: 'notif_2',
      title: 'Daily Mega League Live',
      message: 'Join 2-player rooms now to compete for the ₹10,000 leaderboard!',
      timestamp: '1h ago',
      read: false,
    }
  ]);

  // Sync user profile from backend
  const refreshUserProfile = useCallback(async (userId: string) => {
    try {
      const res = await fetch(`/api/user/profile?userId=${userId}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
      }
    } catch {
      // Fallback
    }
  }, []);

  // Fetch profile on initial mount or when user changes
  useEffect(() => {
    refreshUserProfile(currentUser.id);
  }, [currentUser.id]);

  // Initialize Socket.IO connection & event handlers
  useEffect(() => {
    const socket = getSocket();

    socket.on('connect', () => {
      // Re-identify user if in room
      if (currentRoom) {
        socket.emit('reconnect_session', { userId: currentUser.id, roomCode: currentRoom.code });
      }
    });

    socket.on('room_created', (room: Room) => {
      setCurrentRoom(room);
      setActiveView('lobby');
    });

    socket.on('room_joined', (room: Room) => {
      setCurrentRoom(room);
      setActiveView('lobby');
    });

    socket.on('room_update', (room: Room) => {
      setCurrentRoom(room);
      if (room.status === 'PLAYING' && room.gameId) {
        // Will receive game_start
      }
    });

    socket.on('game_start', (gameState: GameState) => {
      sounds.playGameStart();
      setCurrentGame(gameState);
      setActiveView('game');
    });

    socket.on('game_update', (gameState: GameState) => {
      setCurrentGame(gameState);
    });

    socket.on('dice_rolled', (data: { diceValue: number; playerColor: string }) => {
      sounds.playDiceRoll();
    });

    socket.on('token_moved', (data: { tokenId: number; fromStep: number; toStep: number; capturedToken: boolean }) => {
      if (data.capturedToken) {
        sounds.playCapture();
      } else {
        sounds.playTokenStep();
      }
    });

    socket.on('game_over', (data: { winner: string; prize: number }) => {
      refreshUserProfile(currentUser.id);
    });

    socket.on('error', (err: { message: string }) => {
      alert(err.message || 'Error occurred');
    });

    return () => {
      socket.off('room_created');
      socket.off('room_joined');
      socket.off('room_update');
      socket.off('game_start');
      socket.off('game_update');
      socket.off('dice_rolled');
      socket.off('token_moved');
      socket.off('game_over');
      socket.off('error');
    };
  }, [currentUser.id, currentRoom, refreshUserProfile]);

  // Handle Create Room
  const handleCreateRoom = (entryFee: number) => {
    const socket = getSocket();
    socket.emit('create_room', {
      userId: currentUser.id,
      entryFee,
      isPrivate: true,
    });
  };

  // Handle Join Room
  const handleJoinRoom = (code: string) => {
    const socket = getSocket();
    socket.emit('join_room', {
      userId: currentUser.id,
      code,
    });
  };

  // Handle 1v1 Practice Match against AI Bot
  const handlePracticeMatch = () => {
    const socket = getSocket();
    socket.emit('practice_match', {
      userId: currentUser.id,
    });
  };

  // Handle Ready Toggle in Lobby
  const handleToggleReady = () => {
    if (!currentRoom) return;
    const socket = getSocket();
    socket.emit('player_ready', {
      roomCode: currentRoom.code,
      userId: currentUser.id,
    });
  };

  // Handle Start Game (Host only)
  const handleStartGame = () => {
    if (!currentRoom) return;
    const socket = getSocket();
    socket.emit('start_game', {
      roomCode: currentRoom.code,
      userId: currentUser.id,
    });
  };

  // Handle Leave Room
  const handleLeaveRoom = () => {
    if (currentRoom) {
      const socket = getSocket();
      socket.emit('leave_room', {
        roomCode: currentRoom.code,
        userId: currentUser.id,
      });
    }
    setCurrentRoom(null);
    setCurrentGame(null);
    setActiveView('home');
  };

  // Handle Roll Dice in Game
  const handleRollDice = () => {
    if (!currentGame) return;
    const socket = getSocket();
    socket.emit('roll_dice', {
      gameId: currentGame.id,
      userId: currentUser.id,
    });
  };

  // Handle Move Token in Game
  const handleMoveToken = (tokenId: number) => {
    if (!currentGame) return;
    const socket = getSocket();
    socket.emit('move_token', {
      gameId: currentGame.id,
      userId: currentUser.id,
      tokenId,
    });
  };

  // Handle Send Chat
  const handleSendChat = (message: string, isEmoji = false) => {
    if (!currentGame) return;
    const socket = getSocket();
    socket.emit('send_chat', {
      gameId: currentGame.id,
      userId: currentUser.id,
      message,
      isEmoji,
    });
  };

  // Handle Deposit Cash
  const handleDeposit = async (amount: number, method: string) => {
    try {
      const res = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, amount, paymentMethod: method }),
      });
      if (res.ok) {
        refreshUserProfile(currentUser.id);
      }
    } catch {
      // Local fallback
      setCurrentUser(prev => ({
        ...prev,
        wallet: {
          ...prev.wallet,
          deposit: prev.wallet.deposit + amount,
          total: prev.wallet.total + amount,
        }
      }));
    }
  };

  // Handle Withdraw Cash
  const handleWithdraw = async (amount: number, destination: string) => {
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, amount, destination }),
      });
      if (res.ok) {
        refreshUserProfile(currentUser.id);
      }
    } catch {
      // Local fallback
      setCurrentUser(prev => ({
        ...prev,
        wallet: {
          ...prev.wallet,
          winnings: Math.max(0, prev.wallet.winnings - amount),
          total: Math.max(0, prev.wallet.total - amount),
        }
      }));
    }
  };

  // Handle KYC Submit
  const handleSubmitKyc = async (details: Partial<KycDetails>) => {
    try {
      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.id, ...details }),
      });
      if (res.ok) {
        refreshUserProfile(currentUser.id);
      }
    } catch {
      setCurrentUser(prev => ({
        ...prev,
        kycStatus: 'PENDING',
        kycDetails: { ...prev.kycDetails, ...details } as KycDetails,
      }));
    }
  };

  // Quick switch user for instant 2-player testing
  const handleSwitchUser = async (userId: string) => {
    await refreshUserProfile(userId);
  };

  // Handle Login Success (from LoginView or AuthModal)
  const handleLoginSuccess = async (mobile: string, username?: string, referralCode?: string) => {
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile,
          otp: '123456',
          username: username || undefined,
          referralCode: referralCode || undefined,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
        }
      } else {
        // Fallback for demo switch
        if (mobile === '9876543211') {
          await refreshUserProfile('usr_102');
        } else {
          await refreshUserProfile('usr_101');
        }
      }
    } catch {
      if (mobile === '9876543211') {
        await refreshUserProfile('usr_102');
      } else {
        await refreshUserProfile('usr_101');
      }
    }
    setIsAuthOpen(false);
    setActiveView('home');
  };

  return (
    <div className="min-h-screen bg-[#f3f0ff] text-slate-900 font-sans flex flex-col antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* Top Header Status Bar */}
      <Header
        user={currentUser}
        activeView={activeView}
        onNavigate={setActiveView}
        onOpenAddCash={() => setIsAddCashOpen(true)}
        onToggleDrawer={() => setIsDrawerOpen(true)}
        onSwitchUser={handleSwitchUser}
        notifications={notifications}
      />

      {/* Main Responsive Container */}
      <main className="flex-1 max-w-md w-full mx-auto px-3 pt-2">
        {activeView === 'home' && (
          <HomeView
            user={currentUser}
            onNavigate={setActiveView}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onPracticeMatch={handlePracticeMatch}
            onOpenAddCash={() => setIsAddCashOpen(true)}
          />
        )}

        {activeView === 'battles' && (
          <BattlesView
            user={currentUser}
            onNavigateHome={() => setActiveView('home')}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            onOpenAddCash={() => setIsAddCashOpen(true)}
          />
        )}

        {activeView === 'lobby' && currentRoom && (
          <LobbyView
            room={currentRoom}
            user={currentUser}
            onToggleReady={handleToggleReady}
            onStartGame={handleStartGame}
            onLeaveRoom={handleLeaveRoom}
          />
        )}

        {activeView === 'game' && currentGame && (
          <GameView
            game={currentGame}
            user={currentUser}
            onRollDice={handleRollDice}
            onMoveToken={handleMoveToken}
            onSendChat={handleSendChat}
            onPlayAgain={() => {
              handleLeaveRoom();
              setActiveView('home');
            }}
            onReturnToLobby={() => {
              handleLeaveRoom();
              setActiveView('home');
            }}
            onExitGame={handleLeaveRoom}
          />
        )}

        {activeView === 'wallet' && (
          <WalletView
            user={currentUser}
            onOpenAddCash={() => setIsAddCashOpen(true)}
            onOpenWithdraw={() => setIsWithdrawOpen(true)}
          />
        )}

        {activeView === 'refer' && (
          <ReferView user={currentUser} />
        )}

        {activeView === 'kyc' && (
          <KycView
            user={currentUser}
            onSubmitKyc={handleSubmitKyc}
          />
        )}

        {activeView === 'support' && (
          <SupportView user={currentUser} />
        )}

        {activeView === 'profile' && (
          <ProfileView
            user={currentUser}
            onUpdateUsername={(name) => setCurrentUser(prev => ({ ...prev, username: name }))}
            onUpdateMobile={(mob) => setCurrentUser(prev => ({ ...prev, mobile: mob }))}
            onGoToKyc={() => setActiveView('kyc')}
            onNavigate={setActiveView}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}

        {activeView === 'history' && (
          <ProfileView
            user={currentUser}
            onUpdateUsername={() => {}}
            onGoToKyc={() => setActiveView('kyc')}
          />
        )}

        {activeView === 'admin' && (
          <AdminView 
            currentUser={currentUser} 
            onBack={() => setActiveView('home')} 
          />
        )}

        {activeView === 'login' && (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onBack={() => setActiveView('home')}
          />
        )}
      </main>

      {/* Bottom Navigation (Hidden while in active game match or login for max focus) */}
      {activeView !== 'game' && activeView !== 'login' && (
        <BottomNav
          activeView={activeView}
          onNavigate={setActiveView}
        />
      )}

      {/* Side Drawer Menu */}
      <SideDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={currentUser}
        onNavigate={setActiveView}
        onOpenAuth={() => setActiveView('login')}
      />

      {/* Add Cash Deposit Modal */}
      <AddCashModal
        isOpen={isAddCashOpen}
        onClose={() => setIsAddCashOpen(false)}
        onDeposit={handleDeposit}
        currentBalance={currentUser.wallet.total}
        onDepositSubmitted={() => refreshUserProfile(currentUser.id)}
        userId={currentUser.id}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={isWithdrawOpen}
        onClose={() => setIsWithdrawOpen(false)}
        onWithdraw={handleWithdraw}
        user={currentUser}
        onGoToKyc={() => setActiveView('kyc')}
      />

      {/* Auth / Switch Account Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
};
export default App;
