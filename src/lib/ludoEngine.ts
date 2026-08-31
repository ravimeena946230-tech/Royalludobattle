import { GameState, PlayerColor, TokenInfo } from '../types';

export const SAFE_TILES = [0, 8, 13, 21, 26, 34, 39, 47];

export const RED_START = 0;
export const RED_HOME_ENTRY = 50;
export const RED_HOME_BASE = 100;
export const RED_FINISH = 105;

export const GREEN_START = 26;
export const GREEN_HOME_ENTRY = 24;
export const GREEN_HOME_BASE = 200;
export const GREEN_FINISH = 205;

export const MAX_DISTANCE = 56; // 0 to 50 (51 steps on outer track) + 5 steps on home column + 1 to finish

/**
 * Converts a token's current step position into distance traveled (0..56)
 */
export function getDistanceTraveled(color: PlayerColor, step: number): number {
  if (step === -1) return -1;

  if (color === 'RED') {
    if (step >= RED_HOME_BASE && step <= RED_FINISH) {
      return 51 + (step - RED_HOME_BASE);
    }
    // Step is on outer circuit (0..51)
    // Red start is 0
    return step;
  } else {
    // GREEN
    if (step >= GREEN_HOME_BASE && step <= GREEN_FINISH) {
      return 51 + (step - GREEN_HOME_BASE);
    }
    // Step is on outer circuit (0..51)
    // Green start is 26
    if (step >= GREEN_START) {
      return step - GREEN_START;
    } else {
      return (52 - GREEN_START) + step;
    }
  }
}

/**
 * Converts a distance traveled (0..56) back into the step coordinate
 */
export function getStepFromDistance(color: PlayerColor, distance: number): number {
  if (distance < 0) return -1;
  if (distance > MAX_DISTANCE) return -1;

  if (color === 'RED') {
    if (distance <= 50) {
      return distance;
    } else {
      return RED_HOME_BASE + (distance - 51);
    }
  } else {
    // GREEN
    if (distance <= 50) {
      return (GREEN_START + distance) % 52;
    } else {
      return GREEN_HOME_BASE + (distance - 51);
    }
  }
}

/**
 * Determines if a tile is a safe zone where tokens cannot be captured
 */
export function isSafeTile(step: number): boolean {
  if (step >= 100) return true; // all home runway tiles are safe
  return SAFE_TILES.includes(step);
}

/**
 * Returns an array of token IDs (0..3) that can legally move given the current dice roll
 */
export function getValidMoves(
  tokens: { RED: TokenInfo[]; GREEN: TokenInfo[] },
  color: PlayerColor,
  diceValue: number
): number[] {
  const playerTokens = tokens[color];
  const validIds: number[] = [];

  for (let i = 0; i < playerTokens.length; i++) {
    const token = playerTokens[i];

    // If already in home finish, cannot move
    if (token.isHome || (color === 'RED' && token.step === RED_FINISH) || (color === 'GREEN' && token.step === GREEN_FINISH)) {
      continue;
    }

    // If in yard/base: needs a 6 to open
    if (token.step === -1) {
      if (diceValue === 6) {
        validIds.push(token.id);
      }
      continue;
    }

    // If on board/runway: calculate target distance
    const currentDist = getDistanceTraveled(color, token.step);
    const targetDist = currentDist + diceValue;

    // Cannot overshoot finish
    if (targetDist <= MAX_DISTANCE) {
      validIds.push(token.id);
    }
  }

  return validIds;
}

/**
 * Applies a move to the game state and returns the updated state plus move metadata
 */
export function executeMove(
  state: GameState,
  playerColor: PlayerColor,
  tokenId: number,
  diceValue: number
): {
  nextState: GameState;
  capturedOpponent: boolean;
  reachedHome: boolean;
  extraTurn: boolean;
} {
  const nextTokens = {
    RED: state.tokens.RED.map(t => ({ ...t })),
    GREEN: state.tokens.GREEN.map(t => ({ ...t })),
  };

  const token = nextTokens[playerColor].find(t => t.id === tokenId);
  if (!token) {
    throw new Error('Invalid token ID');
  }

  const opponentColor: PlayerColor = playerColor === 'RED' ? 'GREEN' : 'RED';
  let fromStep = token.step;
  let toStep = fromStep;
  let capturedOpponent = false;
  let capturedTokenInfo: { player: PlayerColor; tokenId: number } | undefined = undefined;
  let reachedHome = false;

  // Move logic
  if (token.step === -1) {
    if (diceValue !== 6) {
      throw new Error('Need a 6 to bring token out of base');
    }
    toStep = playerColor === 'RED' ? RED_START : GREEN_START;
    token.step = toStep;
  } else {
    const currentDist = getDistanceTraveled(playerColor, token.step);
    const targetDist = currentDist + diceValue;
    if (targetDist > MAX_DISTANCE) {
      throw new Error('Move overshoots finish');
    }
    toStep = getStepFromDistance(playerColor, targetDist);
    token.step = toStep;

    if (toStep === (playerColor === 'RED' ? RED_FINISH : GREEN_FINISH)) {
      token.isHome = true;
      reachedHome = true;
    }
  }

  // Check capture if target tile is on outer circuit (step < 100) and not safe
  if (toStep >= 0 && toStep < 100 && !isSafeTile(toStep)) {
    const opponentTokensOnTile = nextTokens[opponentColor].filter(t => t.step === toStep && !t.isHome);
    if (opponentTokensOnTile.length > 0) {
      // Capture the opponent token!
      const captured = opponentTokensOnTile[0];
      captured.step = -1;
      captured.isHome = false;
      capturedOpponent = true;
      capturedTokenInfo = { player: opponentColor, tokenId: captured.id };
    }
  }

  // Check win condition (all 4 tokens home)
  const allHome = nextTokens[playerColor].every(t => t.isHome || t.step === (playerColor === 'RED' ? RED_FINISH : GREEN_FINISH));
  let winner: PlayerColor | null = state.winner;
  let status = state.status;

  if (allHome) {
    winner = playerColor;
    status = 'FINISHED';
  }

  // Check extra turn
  // Bonus turn granted on: rolling 6 (unless consecutive 6s >= 3), capturing an opponent, or getting a token home
  const getsExtraTurn = (diceValue === 6 && state.consecutiveSixes < 3) || capturedOpponent || reachedHome;

  let nextTurn = playerColor;
  let nextConsecutiveSixes = diceValue === 6 ? state.consecutiveSixes : 0;

  if (!getsExtraTurn || status === 'FINISHED') {
    nextTurn = opponentColor;
    nextConsecutiveSixes = 0;
  }

  const updatedState: GameState = {
    ...state,
    status,
    tokens: nextTokens,
    winner,
    currentTurn: nextTurn,
    diceValue: null,
    hasRolled: false,
    consecutiveSixes: nextConsecutiveSixes,
    validTokenMoves: [],
    lastMove: {
      player: playerColor,
      tokenId,
      fromStep,
      toStep,
      capturedToken: capturedTokenInfo,
    },
    turnStartTime: Date.now(),
    matchEndTime: status === 'FINISHED' ? Date.now() : undefined,
  };

  return {
    nextState: updatedState,
    capturedOpponent,
    reachedHome,
    extraTurn: getsExtraTurn && status !== 'FINISHED',
  };
}

/**
 * Creates a fresh 2-player Ludo game state
 */
export function createInitialGameState(
  id: string,
  roomCode: string,
  entryFee: number,
  prizeAmount: number,
  redPlayer: { userId: string; username: string; avatar: string },
  greenPlayer: { userId: string; username: string; avatar: string }
): GameState {
  return {
    id,
    roomCode,
    entryFee,
    prizeAmount,
    status: 'PLAYING',
    players: {
      RED: {
        userId: redPlayer.userId,
        username: redPlayer.username,
        avatar: redPlayer.avatar,
        isConnected: true,
        timeRemaining: 15,
      },
      GREEN: {
        userId: greenPlayer.userId,
        username: greenPlayer.username,
        avatar: greenPlayer.avatar,
        isConnected: true,
        timeRemaining: 15,
      },
    },
    currentTurn: 'RED',
    diceValue: null,
    hasRolled: false,
    consecutiveSixes: 0,
    validTokenMoves: [],
    tokens: {
      RED: [
        { id: 0, color: 'RED', step: -1, isHome: false },
        { id: 1, color: 'RED', step: -1, isHome: false },
        { id: 2, color: 'RED', step: -1, isHome: false },
        { id: 3, color: 'RED', step: -1, isHome: false },
      ],
      GREEN: [
        { id: 0, color: 'GREEN', step: -1, isHome: false },
        { id: 1, color: 'GREEN', step: -1, isHome: false },
        { id: 2, color: 'GREEN', step: -1, isHome: false },
        { id: 3, color: 'GREEN', step: -1, isHome: false },
      ],
    },
    winner: null,
    turnStartTime: Date.now(),
    matchStartTime: Date.now(),
    chatMessages: [
      {
        id: 'msg_welcome',
        senderId: 'system',
        senderName: 'RoomLudo Arbiter',
        senderColor: 'RED',
        message: 'Match started! Red rolls first. Good luck!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  };
}
