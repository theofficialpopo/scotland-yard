import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { validateMove, checkWinCondition } from './game/validation.js';
import { STARTING_STATIONS } from './game/constants.js';

dotenv.config();

const app = express();
const server = createServer(app);

// CORS whitelist for production safety
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

// Rate limiting map (simple in-memory, would use Redis in production)
const rateLimits = new Map();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    activeGames: activeGames.size,
    activePlayers: activePlayers.size
  });
});

// Active games storage (in-memory for MVP)
const activeGames = new Map();
const activePlayers = new Map();
const MAX_CONCURRENT_GAMES = 100; // Prevent memory exhaustion
const GAME_TTL = 2 * 60 * 60 * 1000; // 2 hours

// Input validation functions
function validatePlayerName(name) {
  if (!name || typeof name !== 'string') return false;
  if (name.length < 1 || name.length > 20) return false;
  // Only allow alphanumeric, spaces, and basic punctuation
  return /^[a-zA-Z0-9\s\-_]+$/.test(name.trim());
}

function validateRoomCode(code) {
  if (!code || typeof code !== 'string') return false;
  return /^[A-F0-9]{6}$/.test(code);
}

// Secure room code generation using crypto
function generateRoomCode() {
  let code;
  let attempts = 0;
  const maxAttempts = 10;

  do {
    // Generate 6 character hex code
    code = crypto.randomBytes(3).toString('hex').toUpperCase();
    attempts++;

    if (attempts >= maxAttempts) {
      throw new Error('Unable to generate unique room code');
    }
  } while (activeGames.has(code)); // Ensure uniqueness

  return code;
}

// Rate limiting helper
function checkRateLimit(socketId, action, limit = 5, window = 10000) {
  const key = `${socketId}:${action}`;
  const now = Date.now();
  const timestamps = rateLimits.get(key) || [];

  // Remove timestamps outside the window
  const recentTimestamps = timestamps.filter(t => now - t < window);

  if (recentTimestamps.length >= limit) {
    return false; // Rate limit exceeded
  }

  recentTimestamps.push(now);
  rateLimits.set(key, recentTimestamps);
  return true;
}

// Assign random starting positions to players
function assignStartingPositions(room) {
  const availableStations = [...STARTING_STATIONS];

  // Shuffle available stations
  for (let i = availableStations.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableStations[i], availableStations[j]] = [availableStations[j], availableStations[i]];
  }

  // Assign to Mr. X
  room.gameState.mrX.position = availableStations[0];

  // Assign to detectives
  for (let i = 0; i < room.gameState.detectives.length; i++) {
    room.gameState.detectives[i].position = availableStations[i + 1];
  }
}

// Clean up old/abandoned games
function cleanupGames() {
  const now = Date.now();
  let cleaned = 0;

  for (const [roomCode, room] of activeGames.entries()) {
    const age = now - room.createdAt;
    const inactive = room.lastActivity ? now - room.lastActivity : age;

    // Delete if:
    // 1. Older than TTL
    // 2. All players disconnected for > 10 minutes
    // 3. Game in WAITING status for > 30 minutes
    if (
      age > GAME_TTL ||
      (room.players.every(p => !p.connected) && inactive > 10 * 60 * 1000) ||
      (room.status === 'WAITING' && age > 30 * 60 * 1000)
    ) {
      activeGames.delete(roomCode);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Cleanup] Removed ${cleaned} old/inactive games`);
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupGames, 5 * 60 * 1000);

// Socket.IO connection handling with error handling wrapper
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`);

  // Wrap all socket handlers with error handling
  const safeHandler = (handler) => {
    return async (...args) => {
      try {
        await handler(...args);
      } catch (error) {
        console.error(`[Error] ${error.message}`, error);
        socket.emit('error', {
          message: 'An error occurred. Please try again.',
          code: 'INTERNAL_ERROR'
        });
      }
    };
  };

  // Handle player joining lobby
  socket.on('join:lobby', safeHandler(({ playerName }) => {
    // Validate input
    if (!validatePlayerName(playerName)) {
      socket.emit('error', {
        message: 'Invalid player name. Use 1-20 alphanumeric characters.',
        code: 'INVALID_NAME'
      });
      return;
    }

    // Rate limiting
    if (!checkRateLimit(socket.id, 'join:lobby', 3, 10000)) {
      socket.emit('error', {
        message: 'Too many requests. Please wait.',
        code: 'RATE_LIMIT'
      });
      return;
    }

    const sanitizedName = playerName.trim();

    activePlayers.set(socket.id, {
      id: socket.id,
      name: sanitizedName,
      connectedAt: Date.now()
    });

    socket.emit('lobby:joined', {
      playerId: socket.id,
      playerName: sanitizedName
    });

    console.log(`Player ${sanitizedName} (${socket.id}) joined lobby`);
  }));

  // Handle room creation
  socket.on('room:create', safeHandler(({ playerName }) => {
    // Validate input
    if (!validatePlayerName(playerName)) {
      socket.emit('error', {
        message: 'Invalid player name',
        code: 'INVALID_NAME'
      });
      return;
    }

    // Check concurrent game limit
    if (activeGames.size >= MAX_CONCURRENT_GAMES) {
      socket.emit('error', {
        message: 'Server is at capacity. Please try again later.',
        code: 'SERVER_FULL'
      });
      return;
    }

    // Rate limiting
    if (!checkRateLimit(socket.id, 'room:create', 2, 60000)) {
      socket.emit('error', {
        message: 'Too many room creation attempts',
        code: 'RATE_LIMIT'
      });
      return;
    }

    const sanitizedName = playerName.trim();
    const roomCode = generateRoomCode();

    const room = {
      code: roomCode,
      host: socket.id,
      players: [{
        id: socket.id,
        name: sanitizedName,
        role: null,
        connected: true
      }],
      status: 'WAITING',
      maxPlayers: 6,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    activeGames.set(roomCode, room);
    socket.join(roomCode);

    socket.emit('room:created', {
      roomCode,
      room
    });

    console.log(`Room ${roomCode} created by ${sanitizedName}`);
  }));

  // Handle joining existing room
  socket.on('room:join', safeHandler(({ roomCode, playerName }) => {
    // Validate inputs
    if (!validateRoomCode(roomCode)) {
      socket.emit('error', {
        message: 'Invalid room code format',
        code: 'INVALID_ROOM_CODE'
      });
      return;
    }

    if (!validatePlayerName(playerName)) {
      socket.emit('error', {
        message: 'Invalid player name',
        code: 'INVALID_NAME'
      });
      return;
    }

    // Rate limiting
    if (!checkRateLimit(socket.id, 'room:join', 5, 10000)) {
      socket.emit('error', {
        message: 'Too many join attempts',
        code: 'RATE_LIMIT'
      });
      return;
    }

    const sanitizedName = playerName.trim();
    const room = activeGames.get(roomCode.toUpperCase());

    if (!room) {
      socket.emit('error', {
        message: 'Room not found',
        code: 'ROOM_NOT_FOUND'
      });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', {
        message: 'Room is full',
        code: 'ROOM_FULL'
      });
      return;
    }

    if (room.status !== 'WAITING') {
      socket.emit('error', {
        message: 'Game already in progress',
        code: 'GAME_IN_PROGRESS'
      });
      return;
    }

    // Check if player already in room
    if (room.players.some(p => p.id === socket.id)) {
      socket.emit('error', {
        message: 'You are already in this room',
        code: 'ALREADY_IN_ROOM'
      });
      return;
    }

    room.players.push({
      id: socket.id,
      name: sanitizedName,
      role: null,
      connected: true
    });

    room.lastActivity = Date.now();
    socket.join(roomCode);

    // Notify all players in room
    io.to(roomCode).emit('room:updated', room);

    console.log(`${sanitizedName} joined room ${roomCode} (${room.players.length}/${room.maxPlayers})`);
  }));

  // Handle game start
  socket.on('game:start', safeHandler(({ roomCode }) => {
    if (!validateRoomCode(roomCode)) {
      socket.emit('error', { message: 'Invalid room code', code: 'INVALID_ROOM_CODE' });
      return;
    }

    const room = activeGames.get(roomCode.toUpperCase());

    if (!room) {
      socket.emit('error', { message: 'Room not found', code: 'ROOM_NOT_FOUND' });
      return;
    }

    if (socket.id !== room.host) {
      socket.emit('error', { message: 'Only host can start the game', code: 'NOT_HOST' });
      return;
    }

    if (room.players.length < 2) {
      socket.emit('error', { message: 'Need at least 2 players to start', code: 'NOT_ENOUGH_PLAYERS' });
      return;
    }

    // Assign roles: first player is Mr. X, others are detectives
    room.players[0].role = 'mrX';
    room.players[0].detectiveIndex = null;

    for (let i = 1; i < room.players.length; i++) {
      room.players[i].role = 'detective';
      room.players[i].detectiveIndex = i - 1; // Track detective index for game state
    }

    room.status = 'PLAYING';
    room.startedAt = Date.now();
    room.lastActivity = Date.now();

    // Initialize game state
    room.gameState = {
      currentRound: 1,
      maxRounds: 24,
      revealRounds: [3, 8, 13, 18, 24],
      currentPlayerIndex: 0, // Start with Mr. X
      mrX: {
        position: null, // Will be set by assignStartingPositions
        tickets: { taxi: 4, bus: 3, underground: 3, black: room.players.length - 1 },
        doubleMoves: 2,
        moveHistory: []
      },
      detectives: room.players.slice(1).map(() => ({
        position: null, // Will be set by assignStartingPositions
        tickets: { taxi: 10, bus: 8, underground: 4 }
      })),
      winner: null,
      winReason: null
    };

    // Assign starting positions
    assignStartingPositions(room);

    io.to(roomCode).emit('game:started', {
      room,
      message: 'Game started! All players have starting positions.'
    });

    console.log(`Game started in room ${roomCode} with ${room.players.length} players`);
    console.log(`Starting positions: Mr. X at ${room.gameState.mrX.position}, Detectives at ${room.gameState.detectives.map(d => d.position).join(', ')}`);
  }));

  // Handle player move
  socket.on('game:move', safeHandler(({ roomCode, from, to, ticketType }) => {
    if (!validateRoomCode(roomCode)) {
      socket.emit('error', { message: 'Invalid room code', code: 'INVALID_ROOM_CODE' });
      return;
    }

    const room = activeGames.get(roomCode.toUpperCase());

    if (!room || !room.gameState) {
      socket.emit('error', { message: 'Game not found', code: 'GAME_NOT_FOUND' });
      return;
    }

    // Validate it's the player's turn
    const currentPlayer = room.players[room.gameState.currentPlayerIndex];
    if (currentPlayer.id !== socket.id) {
      socket.emit('error', { message: 'Not your turn', code: 'NOT_YOUR_TURN' });
      return;
    }

    // Validate move using validation module
    const validation = validateMove(
      { from, to, ticketType },
      currentPlayer,
      room.gameState
    );

    if (!validation.valid) {
      socket.emit('error', {
        message: validation.error,
        code: 'INVALID_MOVE'
      });
      return;
    }

    // Apply the move
    if (currentPlayer.role === 'mrX') {
      // Update Mr. X position and tickets
      room.gameState.mrX.position = to;
      room.gameState.mrX.tickets[ticketType]--;
      room.gameState.mrX.moveHistory.push({
        round: room.gameState.currentRound,
        ticketType,
        revealed: room.gameState.revealRounds.includes(room.gameState.currentRound)
      });
    } else {
      // Update detective position and tickets
      const detectiveIndex = currentPlayer.detectiveIndex;
      room.gameState.detectives[detectiveIndex].position = to;
      room.gameState.detectives[detectiveIndex].tickets[ticketType]--;

      // Transfer ticket to Mr. X
      room.gameState.mrX.tickets[ticketType]++;
    }

    room.lastActivity = Date.now();

    // Advance turn
    room.gameState.currentPlayerIndex++;

    // If all players have moved, start new round
    if (room.gameState.currentPlayerIndex >= room.players.length) {
      room.gameState.currentPlayerIndex = 0;
      room.gameState.currentRound++;
    }

    // Check win conditions
    const winCondition = checkWinCondition(room.gameState);
    if (winCondition.winner) {
      room.gameState.winner = winCondition.winner;
      room.gameState.winReason = winCondition.reason;
      room.status = 'FINISHED';

      io.to(roomCode).emit('game:over', {
        winner: winCondition.winner,
        reason: winCondition.reason
      });
    }

    // Broadcast updated game state
    io.to(roomCode).emit('game:state:updated', {
      room,
      lastMove: {
        player: currentPlayer.name,
        from,
        to,
        ticketType,
        timestamp: Date.now()
      }
    });

    console.log(`${currentPlayer.name} moved from ${from} to ${to} using ${ticketType}`);
  }));

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`[${new Date().toISOString()}] Client disconnected: ${socket.id} (${reason})`);

    // Remove player from active players
    activePlayers.delete(socket.id);

    // Mark player as disconnected in all rooms
    for (const [roomCode, room] of activeGames.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);

      if (playerIndex !== -1) {
        room.players[playerIndex].connected = false;

        // Notify other players
        io.to(roomCode).emit('player:disconnected', {
          playerId: socket.id,
          playerName: room.players[playerIndex].name
        });

        // Clean up room if all players disconnected
        const allDisconnected = room.players.every(p => !p.connected);
        if (allDisconnected) {
          room.lastActivity = Date.now();
          console.log(`All players disconnected from room ${roomCode}`);
        }
      }
    }
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Scotland Yard Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`🔒 Security: Crypto-based room codes, input validation enabled`);
  console.log(`🧹 Cleanup: Running every 5 minutes\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
