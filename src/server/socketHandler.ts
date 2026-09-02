import { Server as SocketIOServer, Socket } from 'socket.io';
import { db } from './db';
import { PlayerColor } from '../types';

export function setupSocketHandlers(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    // Create Room Event
    socket.on('create_room', ({ userId, entryFee }: { userId: string; entryFee: number }) => {
      try {
        const room = db.createRoom(userId, Number(entryFee) || 0);
        socket.join(room.code);
        
        socket.emit('room_created', room);
        socket.emit('room_update', room);
        socket.emit('room_updated', room);
      } catch (err: unknown) {
        socket.emit('error', { message: (err as Error).message });
        socket.emit('error_msg', { message: (err as Error).message });
      }
    });

    // Join Room Event (Support both roomCode and code parameters to map client/server fields)
    socket.on('join_room', ({ roomCode, code, userId }: { roomCode?: string; code?: string; userId: string }) => {
      try {
        const targetCode = roomCode || code;
        if (!targetCode) {
          socket.emit('error', { message: 'Room code is required' });
          socket.emit('error_msg', { message: 'Room code is required' });
          return;
        }

        const room = db.joinRoom(userId, targetCode);
        socket.join(targetCode);

        // Mark player connected if joining existing room
        const player = room.players.find(p => p.userId === userId);
        if (player) {
          player.isConnected = true;
        }

        socket.emit('room_joined', room);
        io.to(targetCode).emit('room_update', room);
        io.to(targetCode).emit('room_updated', room);

        if (room.gameId) {
          socket.join(room.gameId);
          const game = db.getGame(room.gameId);
          if (game) {
            socket.emit('game_update', game);
            socket.emit('game_updated', game);
          }
        }
      } catch (err: unknown) {
        socket.emit('error', { message: (err as Error).message || 'Failed to join room' });
        socket.emit('error_msg', { message: (err as Error).message || 'Failed to join room' });
      }
    });

    // Practice Match Event (AI Bot Battle)
    socket.on('practice_match', ({ userId }: { userId: string }) => {
      try {
        const result = db.createPracticeGame(userId);
        
        socket.join(result.room.code);
        socket.join(result.game.id);

        socket.emit('room_joined', result.room);
        socket.emit('room_update', result.room);
        socket.emit('room_updated', result.room);
        
        socket.emit('game_start', result.game);
        socket.emit('game_started', { game: result.game, roomCode: result.room.code });
        socket.emit('game_update', result.game);
        socket.emit('game_updated', result.game);
      } catch (err: unknown) {
        socket.emit('error', { message: (err as Error).message });
        socket.emit('error_msg', { message: (err as Error).message });
      }
    });

    // Toggle Ready State in Lobby (Supports player_ready and toggle_ready)
    const handleToggleReady = ({ roomCode, userId }: { roomCode: string; userId: string }) => {
      try {
        const updatedRoom = db.togglePlayerReady(roomCode, userId);
        io.to(roomCode).emit('room_update', updatedRoom);
        io.to(roomCode).emit('room_updated', updatedRoom);
      } catch (err: unknown) {
        socket.emit('error', { message: (err as Error).message });
        socket.emit('error_msg', { message: (err as Error).message });
      }
    };
    socket.on('player_ready', handleToggleReady);
    socket.on('toggle_ready', handleToggleReady);

    // Leave Room Event
    socket.on('leave_room', ({ roomCode, userId }: { roomCode: string; userId: string }) => {
      try {
        const updatedRoom = db.leaveRoom(roomCode, userId);
        socket.leave(roomCode);
        if (updatedRoom) {
          io.to(roomCode).emit('room_update', updatedRoom);
          io.to(roomCode).emit('room_updated', updatedRoom);
        }
      } catch (err: unknown) {
        socket.emit('error', { message: (err as Error).message });
        socket.emit('error_msg', { message: (err as Error).message });
      }
    });

    // Start Game Event
    socket.on('start_game', ({ roomCode, userId }: { roomCode: string; userId: string }) => {
      try {
        const game = db.startRoomGame(roomCode, userId);
        const room = db.getRoom(roomCode)!;

        io.to(roomCode).emit('room_update', room);
        io.to(roomCode).emit('room_updated', room);
        
        io.to(roomCode).emit('game_start', game);
        io.to(roomCode).emit('game_started', { game, roomCode });
        io.to(roomCode).emit('game_update', game);
        io.to(roomCode).emit('game_updated', game);
      } catch (err: unknown) {
        socket.emit('error', { message: (err as Error).message });
        socket.emit('error_msg', { message: (err as Error).message });
      }
    });

    // Roll dice (supports both playerColor and userId based roll events)
    socket.on('roll_dice', ({ gameId, playerColor, userId }: { gameId: string; playerColor?: PlayerColor; userId?: string }) => {
      try {
        let color = playerColor;
        const game = db.getGame(gameId);
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          socket.emit('error_msg', { message: 'Game not found' });
          return;
        }

        if (!color && userId) {
          if (game.players.RED?.userId === userId) {
            color = 'RED';
          } else if (game.players.GREEN?.userId === userId) {
            color = 'GREEN';
          }
        }

        if (!color) {
          socket.emit('error', { message: 'Could not resolve player color' });
          socket.emit('error_msg', { message: 'Could not resolve player color' });
          return;
        }

        const result = db.rollDice(gameId, color);
        
        const eventData = {
          diceValue: result.diceValue,
          playerColor: color,
          validMoves: result.validMoves,
          game: result.game,
        };

        io.to(gameId).emit('dice_rolled', eventData);
        io.to(gameId).emit('game_update', result.game);
        io.to(gameId).emit('game_updated', result.game);

        // Trigger AI Bot if opponent is Bot
        checkAndTriggerBotTurn(io, result.game);
      } catch (err: unknown) {
        socket.emit('error', { message: (err as Error).message });
        socket.emit('error_msg', { message: (err as Error).message });
      }
    });

    // Move token (supports both playerColor and userId based token movement)
    socket.on('move_token', ({ gameId, playerColor, userId, tokenId }: { gameId: string; playerColor?: PlayerColor; userId?: string; tokenId: number }) => {
      try {
        let color = playerColor;
        const game = db.getGame(gameId);
        if (!game) {
          socket.emit('error', { message: 'Game not found' });
          socket.emit('error_msg', { message: 'Game not found' });
          return;
        }

        if (!color && userId) {
          if (game.players.RED?.userId === userId) {
            color = 'RED';
          } else if (game.players.GREEN?.userId === userId) {
            color = 'GREEN';
          }
        }

        if (!color) {
          socket.emit('error', { message: 'Could not resolve player color' });
          socket.emit('error_msg', { message: 'Could not resolve player color' });
          return;
        }

        const result = db.moveToken(gameId, color, tokenId);
        
        const moveData = {
          game: result.game,
          capturedToken: result.captured,
          captured: result.captured,
          winner: result.winner,
          tokenId,
        };

        io.to(gameId).emit('token_moved', moveData);
        io.to(gameId).emit('game_update', result.game);
        io.to(gameId).emit('game_updated', result.game);

        if (result.winner) {
          io.to(gameId).emit('game_over', { winner: result.winner, prize: result.game.prizeAmount });
          io.to(gameId).emit('game_finished', { winner: result.winner, game: result.game });
        } else {
          // Trigger AI Bot if next turn belongs to Bot
          checkAndTriggerBotTurn(io, result.game);
        }
      } catch (err: unknown) {
        socket.emit('error', { message: (err as Error).message });
        socket.emit('error_msg', { message: (err as Error).message });
      }
    });

    // In-game Chat & Emojis
    socket.on('send_chat', ({ gameId, senderId, senderName, senderColor, message, isEmoji }: {
      gameId: string;
      senderId: string;
      senderName: string;
      senderColor: PlayerColor;
      message: string;
      isEmoji?: boolean;
    }) => {
      const game = db.getGame(gameId);
      if (game) {
        const chatMsg = {
          id: `msg_${Date.now()}_${Math.random().toString().slice(2, 6)}`,
          senderId,
          senderName,
          senderColor,
          message,
          isEmoji,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        game.chatMessages.push(chatMsg);
        io.to(gameId).emit('chat_received', chatMsg);
      }
    });

    // Player disconnected
    socket.on('disconnect', () => {
      // Keep state intact for reconnection
    });
  });
}

function checkAndTriggerBotTurn(io: SocketIOServer, game: { id: string; currentTurn: PlayerColor; players: { [key in PlayerColor]?: { userId: string } }; hasRolled: boolean; diceValue: number | null; validTokenMoves: number[]; status: string }) {
  if (game.status !== 'PLAYING') return;

  const currentTurnPlayer = game.players[game.currentTurn];
  if (!currentTurnPlayer || !currentTurnPlayer.userId.startsWith('usr_bot')) return;

  // Bot's turn! Simulate human-like delay
  setTimeout(() => {
    try {
      const currentGame = db.getGame(game.id);
      if (!currentGame || currentGame.status !== 'PLAYING' || currentGame.currentTurn !== game.currentTurn) return;

      if (!currentGame.hasRolled) {
        // Bot rolls dice
        const rollRes = db.rollDice(currentGame.id, currentGame.currentTurn);
        io.to(currentGame.id).emit('dice_rolled', {
          diceValue: rollRes.diceValue,
          playerColor: currentGame.currentTurn,
          validMoves: rollRes.validMoves,
          game: rollRes.game,
        });

        // After rolling, if bot has valid moves, pick the smartest move
        if (rollRes.validMoves.length > 0) {
          setTimeout(() => {
            const botColor = rollRes.game.currentTurn;
            const chosenToken = pickSmartestBotMove(rollRes.game, botColor, rollRes.validMoves);
            const moveRes = db.moveToken(rollRes.game.id, botColor, chosenToken);
            
            io.to(rollRes.game.id).emit('token_moved', {
              game: moveRes.game,
              captured: moveRes.captured,
              winner: moveRes.winner,
            });

            if (moveRes.winner) {
              io.to(rollRes.game.id).emit('game_finished', {
                winner: moveRes.winner,
                game: moveRes.game,
              });
            } else if (moveRes.game.currentTurn === botColor && moveRes.game.status === 'PLAYING') {
              // Bot earned extra turn, roll again!
              checkAndTriggerBotTurn(io, moveRes.game);
            }
          }, 800);
        }
      }
    } catch {
      // Ignored
    }
  }, 1000);
}

function pickSmartestBotMove(game: any, color: PlayerColor, validMoves: number[]): number {
  if (validMoves.length === 1) return validMoves[0];

  // Prefer moves that bring a token out of base or capture an opponent
  const tokens = game.tokens[color];
  for (const tid of validMoves) {
    const t = tokens.find((tok: any) => tok.id === tid);
    if (t && t.step === -1) {
      return tid; // Bring token out!
    }
  }

  // Otherwise pick the token closest to home
  let bestTid = validMoves[0];
  let maxDist = -1;
  for (const tid of validMoves) {
    const t = tokens.find((tok: any) => tok.id === tid);
    if (t && t.step > maxDist) {
      maxDist = t.step;
      bestTid = tid;
    }
  }

  return bestTid;
}
