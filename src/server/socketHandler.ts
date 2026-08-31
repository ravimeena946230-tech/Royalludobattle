import { Server as SocketIOServer, Socket } from 'socket.io';
import { db } from './db';
import { PlayerColor } from '../types';

export function setupSocketHandlers(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    // Join a room lobby or game channel
    socket.on('join_room', ({ roomCode, userId }: { roomCode: string; userId: string }) => {
      try {
        const room = db.getRoom(roomCode);
        if (!room) {
          socket.emit('error_msg', { message: 'Room does not exist' });
          return;
        }

        socket.join(roomCode);
        if (room.gameId) {
          socket.join(room.gameId);
        }

        // Mark player connected
        const player = room.players.find(p => p.userId === userId);
        if (player) {
          player.isConnected = true;
        }

        io.to(roomCode).emit('room_updated', room);
        
        if (room.gameId) {
          const game = db.getGame(room.gameId);
          if (game) {
            socket.emit('game_updated', game);
          }
        }
      } catch (err: unknown) {
        socket.emit('error_msg', { message: (err as Error).message || 'Failed to join room' });
      }
    });

    // Toggle player readiness in room
    socket.on('toggle_ready', ({ roomCode, userId }: { roomCode: string; userId: string }) => {
      try {
        const updatedRoom = db.togglePlayerReady(roomCode, userId);
        io.to(roomCode).emit('room_updated', updatedRoom);
      } catch (err: unknown) {
        socket.emit('error_msg', { message: (err as Error).message });
      }
    });

    // Host starts match
    socket.on('start_game', ({ roomCode, userId }: { roomCode: string; userId: string }) => {
      try {
        const game = db.startRoomGame(roomCode, userId);
        const room = db.getRoom(roomCode)!;

        io.to(roomCode).emit('room_updated', room);
        io.to(roomCode).emit('game_started', { game, roomCode });
        io.to(roomCode).emit('game_updated', game);
      } catch (err: unknown) {
        socket.emit('error_msg', { message: (err as Error).message });
      }
    });

    // Roll dice
    socket.on('roll_dice', ({ gameId, playerColor }: { gameId: string; playerColor: PlayerColor }) => {
      try {
        const result = db.rollDice(gameId, playerColor);
        io.to(gameId).emit('dice_rolled', {
          diceValue: result.diceValue,
          playerColor,
          validMoves: result.validMoves,
          game: result.game,
        });

        // Trigger AI Bot if opponent is Bot
        checkAndTriggerBotTurn(io, result.game);
      } catch (err: unknown) {
        socket.emit('error_msg', { message: (err as Error).message });
      }
    });

    // Move token
    socket.on('move_token', ({ gameId, playerColor, tokenId }: { gameId: string; playerColor: PlayerColor; tokenId: number }) => {
      try {
        const result = db.moveToken(gameId, playerColor, tokenId);
        io.to(gameId).emit('token_moved', {
          game: result.game,
          captured: result.captured,
          winner: result.winner,
        });

        if (result.winner) {
          io.to(gameId).emit('game_finished', {
            winner: result.winner,
            game: result.game,
          });
        } else {
          // Trigger AI Bot if next turn belongs to Bot
          checkAndTriggerBotTurn(io, result.game);
        }
      } catch (err: unknown) {
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
