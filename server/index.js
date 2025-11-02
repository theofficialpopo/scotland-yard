import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { timingSafeEqual } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { validateMove, checkWinCondition } from './game/validation.js';
import { STARTING_STATIONS, GAME_STATUS } from './game/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

// Validate required environment variables at startup
const requiredEnvVars = ['PORT', 'CORS_ORIGIN'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('❌ ERROR: Missing required environment variables:', missingEnvVars.join(', '));
  console.error('Please set these variables in your .env file or environment.');
  console.error('Example:');
  missingEnvVars.forEach(varName => {
    if (varName === 'PORT') {
      console.error(`  ${varName}=3001`);
    } else if (varName === 'CORS_ORIGIN') {
      console.error(`  ${varName}=http://localhost:5173`);
    }
  });
  process.exit(1);
}

const app = express();
const server = createServer(app);

// Trust proxy - important for rate limiting behind reverse proxies (Railway, Vercel, etc.)
app.set('trust proxy', 1);

// Disable X-Powered-By header for security
app.disable('x-powered-by');

// CORS whitelist for production safety
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
  : ['http://localhost:5173', 'http://localhost:3000'];

const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, Postman, etc.)
      if (!origin) return callback(null, true);

      // In production, allow same-origin (frontend served by backend)
      if (process.env.NODE_ENV === 'production') {
        return callback(null, true);
      }

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
  pingInterval: 25000,
  maxHttpBufferSize: 1e6 // 1MB limit to prevent large payload attacks
});

// Security middleware - Helmet.js for security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", ...allowedOrigins],
      scriptSrc: ["'self'", "'unsafe-inline'"], // Allow inline scripts for Vite dev
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:"],
      fontSrc: ["'self'", "data:"]
    }
  },
  crossOriginEmbedderPolicy: false // Allow WebSocket connections
}));

// CORS middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Request size limits and JSON parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: true }));

// HTTP rate limiting for Express endpoints
const httpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Apply rate limiting to all routes
app.use(httpLimiter);

// Serve frontend static files in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = join(__dirname, '../client/dist');
  app.use(express.static(clientBuildPath));
}

// Rate limiting map for Socket.IO (simple in-memory, would use Redis in production)
const rateLimits = new Map();

// Socket.IO health tracking
let socketIOHealthy = true;
let lastSocketConnection = Date.now();
let totalConnections = 0;

// Active games storage (in-memory for MVP)
const activeGames = new Map();
const activePlayers = new Map();

// Player reconnection tokens (playerId -> {token, roomCode, expiresAt})
const reconnectionTokens = new Map();
const RECONNECTION_TIMEOUT = 5 * 60 * 1000; // 5 minutes
const STALE_CONNECTION_THRESHOLD = RECONNECTION_TIMEOUT; // Same as reconnection timeout

// Enhanced health check endpoint with Socket.IO verification
app.get('/health', (req, res) => {
  const now = Date.now();
  const timeSinceLastConnection = now - lastSocketConnection;
  const detailedMode = req.query.detailed === 'true';

  // Check for stale connections - if we have rooms but no connections in threshold time, something's wrong
  const hasActiveRooms = activeGames.size > 0;
  const staleConnections = hasActiveRooms && timeSinceLastConnection > STALE_CONNECTION_THRESHOLD;

  // Determine overall health status
  const isHealthy = socketIOHealthy && !staleConnections;
  const status = isHealthy ? 'OK' : 'DEGRADED';

  // Optimize room stats calculation - single iteration instead of multiple filter passes
  const roomStats = { total: activeGames.size, inGame: 0, waiting: 0 };
  for (const game of activeGames.values()) {
    if (game.status === GAME_STATUS.PLAYING) roomStats.inGame++;
    else if (game.status === GAME_STATUS.WAITING) roomStats.waiting++;
  }

  const healthData = {
    status,
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    socketIO: {
      healthy: socketIOHealthy,
      connectedClients: io.engine.clientsCount || 0,
      lastConnection: new Date(lastSocketConnection).toISOString(),
      timeSinceLastConnection: Math.floor(timeSinceLastConnection / 1000) + 's',
      totalConnectionsLifetime: totalConnections
    },
    rooms: roomStats,
    players: {
      total: activePlayers.size
    }
  };

  // Add detailed information if requested (with optional authentication)
  if (detailedMode) {
    // If HEALTH_API_KEY is set, require it for detailed mode
    // Only accept via header for security (not in query params which get logged)
    const healthApiKey = process.env.HEALTH_API_KEY;
    const providedKey = req.headers['x-api-key'];

    if (healthApiKey && providedKey !== healthApiKey) {
      res.status(401).json({
        status: 'ERROR',
        message: 'Unauthorized: Invalid or missing API key for detailed health information.'
      });
      return;
    }

    healthData.detailed = {
      memory: {
        rss: Math.floor(process.memoryUsage().rss / 1024 / 1024) + 'MB',
        heapUsed: Math.floor(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.floor(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
      },
      rateLimits: {
        activeEntries: rateLimits.size
      }
    };
  }

  // Return appropriate HTTP status code
  const httpStatus = isHealthy ? 200 : 503;
  res.status(httpStatus).json(healthData);
});

// Configuration constants
const MAX_CONCURRENT_GAMES = 100; // Prevent memory exhaustion
const TIMEOUTS = {
  GAME_TTL: 2 * 60 * 60 * 1000,           // 2 hours - max game lifetime
  INACTIVE_DISCONNECT: 10 * 60 * 1000,    // 10 minutes - cleanup if all players disconnected
  WAITING_TIMEOUT: 30 * 60 * 1000,        // 30 minutes - cleanup games in waiting status
  RATE_LIMIT_MAX_AGE: 60 * 60 * 1000,     // 1 hour - cleanup old rate limit entries
  CLEANUP_INTERVAL: 5 * 60 * 1000         // 5 minutes - how often cleanup runs
};
// Legacy constant for backwards compatibility
const GAME_TTL = TIMEOUTS.GAME_TTL;

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

// Reconnection token management
function createReconnectionToken(playerId, roomCode) {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + RECONNECTION_TIMEOUT;

  reconnectionTokens.set(playerId, {
    token,
    roomCode,
    expiresAt
  });

  return token;
}

/**
 * Validate reconnection token using constant-time comparison to prevent timing attacks
 * @param {string} playerId - Player's socket ID
 * @param {string} token - Reconnection token to validate
 * @returns {string|false} - Room code if valid, false otherwise
 */
function validateReconnectionToken(playerId, token) {
  const tokenData = reconnectionTokens.get(playerId);

  if (!tokenData) return false;

  // Check expiration first
  if (Date.now() > tokenData.expiresAt) {
    reconnectionTokens.delete(playerId);
    return false;
  }

  // Constant-time comparison to prevent timing attacks
  try {
    const isValid = timingSafeEqual(
      Buffer.from(tokenData.token, 'hex'),
      Buffer.from(token, 'hex')
    );
    return isValid ? tokenData.roomCode : false;
  } catch {
    // Invalid hex string or length mismatch
    return false;
  }
}

function cleanupExpiredTokens() {
  const now = Date.now();
  let cleaned = 0;

  for (const [playerId, tokenData] of reconnectionTokens.entries()) {
    if (now > tokenData.expiresAt) {
      reconnectionTokens.delete(playerId);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Cleanup] Removed ${cleaned} expired reconnection tokens`);
  }
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

// Filter game state for each player (hide Mr. X position when appropriate)
function getFilteredRoomForPlayer(room, playerId) {
  const player = room.players.find(p => p.id === playerId);

  // If player is Mr. X or game hasn't started, send full state
  if (!room.gameState || player?.role === 'mrX') {
    return room;
  }

  // Clone the room to avoid modifying original (uses structuredClone for better performance)
  const filteredRoom = structuredClone(room);

  // Check if current round is a reveal round
  const isRevealRound = room.gameState.revealRounds.includes(room.gameState.currentRound);

  // Hide Mr. X position for detectives (unless it's a reveal round)
  if (!isRevealRound) {
    filteredRoom.gameState.mrX.position = null;
  }

  return filteredRoom;
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
    // 2. All players disconnected for > configured timeout
    // 3. Game in WAITING status for > configured timeout
    if (
      age > TIMEOUTS.GAME_TTL ||
      (room.players.every(p => !p.connected) && inactive > TIMEOUTS.INACTIVE_DISCONNECT) ||
      (room.status === 'WAITING' && age > TIMEOUTS.WAITING_TIMEOUT)
    ) {
      activeGames.delete(roomCode);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Cleanup] Removed ${cleaned} old/inactive games`);
  }
}

// Clean up old rate limit entries to prevent memory leak
function cleanupRateLimits() {
  const now = Date.now();
  let cleaned = 0;

  for (const [key, timestamps] of rateLimits.entries()) {
    // Remove entries where all timestamps are older than the configured max age
    const hasRecentActivity = timestamps.some(t => now - t < TIMEOUTS.RATE_LIMIT_MAX_AGE);

    if (!hasRecentActivity) {
      rateLimits.delete(key);
      cleaned++;
    }
  }

  if (cleaned > 0) {
    console.log(`[Cleanup] Removed ${cleaned} stale rate limit entries`);
  }
}

// Run cleanup at configured interval (staggered to avoid CPU spikes)
setInterval(cleanupGames, TIMEOUTS.CLEANUP_INTERVAL);
// Offset by 20 seconds to distribute CPU load
setTimeout(() => setInterval(cleanupRateLimits, TIMEOUTS.CLEANUP_INTERVAL), 20000);
// Offset by 40 seconds to distribute CPU load
setTimeout(() => setInterval(cleanupExpiredTokens, TIMEOUTS.CLEANUP_INTERVAL), 40000);

// Socket.IO connection handling with error handling wrapper
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`);

  // Update Socket.IO health tracking
  lastSocketConnection = Date.now();
  totalConnections++;
  socketIOHealthy = true;

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

  // Handle player reconnection
  socket.on('player:reconnect', safeHandler(({ playerId, reconnectionToken }) => {
    // Input validation
    if (!playerId || typeof playerId !== 'string' || playerId.length > 100) {
      socket.emit('error', {
        message: 'Invalid player ID format.',
        code: 'INVALID_INPUT'
      });
      return;
    }

    if (!reconnectionToken || typeof reconnectionToken !== 'string' || reconnectionToken.length !== 64) {
      socket.emit('error', {
        message: 'Invalid reconnection token format.',
        code: 'INVALID_INPUT'
      });
      return;
    }

    // Validate token
    const roomCode = validateReconnectionToken(playerId, reconnectionToken);

    if (!roomCode) {
      socket.emit('error', {
        message: 'Invalid or expired reconnection token. Please rejoin the game.',
        code: 'INVALID_RECONNECTION_TOKEN'
      });
      return;
    }

    const room = activeGames.get(roomCode);
    if (!room) {
      socket.emit('error', {
        message: 'Game room no longer exists.',
        code: 'ROOM_NOT_FOUND'
      });
      reconnectionTokens.delete(playerId);
      return;
    }

    // Find the player in the room
    const playerIndex = room.players.findIndex(p => p.id === playerId);
    if (playerIndex === -1) {
      socket.emit('error', {
        message: 'Player not found in room.',
        code: 'PLAYER_NOT_FOUND'
      });
      reconnectionTokens.delete(playerId);
      return;
    }

    // Update player's socket ID and mark as connected
    const oldSocketId = room.players[playerIndex].id;

    // Explicitly disconnect old socket if still connected (prevents duplicate connections)
    const oldSocket = io.sockets.sockets.get(oldSocketId);
    if (oldSocket) {
      oldSocket.disconnect(true);
      console.log(`[Reconnection] Disconnected old socket ${oldSocketId}`);
    }

    room.players[playerIndex].id = socket.id;
    room.players[playerIndex].connected = true;

    // Update active players mapping
    activePlayers.delete(oldSocketId);
    activePlayers.set(socket.id, {
      id: socket.id,
      name: room.players[playerIndex].name,
      connectedAt: Date.now()
    });

    // Join the socket room
    socket.join(roomCode);

    // Clear the reconnection token
    reconnectionTokens.delete(playerId);

    // Notify the player about successful reconnection
    socket.emit('player:reconnected', {
      roomCode,
      room: getFilteredRoomForPlayer(room, socket.id),
      message: 'Successfully reconnected to the game!'
    });

    // Notify other players
    io.to(roomCode).emit('player:reconnected:broadcast', {
      playerId: socket.id,
      playerName: room.players[playerIndex].name
    });

    console.log(`[Reconnection] Player ${room.players[playerIndex].name} (${oldSocketId} -> ${socket.id}) reconnected to room ${roomCode}`);
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
  socket.on('game:start', safeHandler(({ roomCode, mrXPlayerId = null }) => {
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

    // Assign roles: use specified Mr. X or randomly select
    let mrXIndex;

    if (mrXPlayerId) {
      // Host specified a player to be Mr. X
      mrXIndex = room.players.findIndex(p => p.id === mrXPlayerId);

      // If the specified player is not found, default to random
      if (mrXIndex === -1) {
        console.log(`Specified Mr. X player ${mrXPlayerId} not found, selecting randomly`);
        mrXIndex = Math.floor(Math.random() * room.players.length);
      }
    } else {
      // Randomly select Mr. X
      mrXIndex = Math.floor(Math.random() * room.players.length);
    }

    let detectiveIndex = 0;
    for (let i = 0; i < room.players.length; i++) {
      if (i === mrXIndex) {
        room.players[i].role = 'mrX';
        room.players[i].detectiveIndex = null;
      } else {
        room.players[i].role = 'detective';
        room.players[i].detectiveIndex = detectiveIndex;
        detectiveIndex++;
      }
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
      doubleMoveInProgress: false, // Track if Mr. X is in the middle of a double-move
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
      winReason: null,
      moveHistory: [] // Track all moves for game end screen
    };

    // Assign starting positions
    assignStartingPositions(room);

    // Send filtered game state to each player
    room.players.forEach(player => {
      const filteredRoom = getFilteredRoomForPlayer(room, player.id);
      io.to(player.id).emit('game:started', {
        room: filteredRoom,
        message: 'Game started! All players have starting positions.'
      });
    });

    console.log(`Game started in room ${roomCode} with ${room.players.length} players`);
    console.log(`Mr. X: ${room.players[mrXIndex].name} ${mrXPlayerId ? '(manually selected)' : '(random)'}`);
    console.log(`Starting positions: Mr. X at ${room.gameState.mrX.position}, Detectives at ${room.gameState.detectives.map(d => d.position).join(', ')}`);
  }));

  // Handle game rematch
  socket.on('game:rematch', safeHandler(({ roomCode }) => {
    if (!validateRoomCode(roomCode)) {
      socket.emit('error', { message: 'Invalid room code', code: 'INVALID_ROOM_CODE' });
      return;
    }

    const room = activeGames.get(roomCode.toUpperCase());

    if (!room) {
      socket.emit('error', { message: 'Room not found', code: 'ROOM_NOT_FOUND' });
      return;
    }

    if (!room.gameState || !room.gameState.winner) {
      socket.emit('error', { message: 'Game must be finished before rematch', code: 'GAME_NOT_FINISHED' });
      return;
    }

    if (room.players.length < 2) {
      socket.emit('error', { message: 'Need at least 2 players for rematch', code: 'NOT_ENOUGH_PLAYERS' });
      return;
    }

    console.log(`Starting rematch in room ${roomCode}`);

    // Assign new random roles for the rematch
    const mrXIndex = Math.floor(Math.random() * room.players.length);

    let detectiveIndex = 0;
    for (let i = 0; i < room.players.length; i++) {
      if (i === mrXIndex) {
        room.players[i].role = 'mrX';
        room.players[i].detectiveIndex = null;
      } else {
        room.players[i].role = 'detective';
        room.players[i].detectiveIndex = detectiveIndex;
        detectiveIndex++;
      }
    }

    room.status = 'PLAYING';
    room.startedAt = Date.now();
    room.lastActivity = Date.now();

    // Initialize fresh game state
    room.gameState = {
      currentRound: 1,
      maxRounds: 24,
      revealRounds: [3, 8, 13, 18, 24],
      currentPlayerIndex: 0, // Start with Mr. X
      doubleMoveInProgress: false,
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
      winReason: null,
      moveHistory: []
    };

    // Assign starting positions
    assignStartingPositions(room);

    // Send filtered game state to each player
    room.players.forEach(player => {
      const filteredRoom = getFilteredRoomForPlayer(room, player.id);
      io.to(player.id).emit('game:started', {
        room: filteredRoom,
        message: 'Rematch started! New roles assigned and positions set.'
      });
    });

    console.log(`Rematch started in room ${roomCode} with ${room.players.length} players`);
    console.log(`New Mr. X: ${room.players[mrXIndex].name}`);
    console.log(`Starting positions: Mr. X at ${room.gameState.mrX.position}, Detectives at ${room.gameState.detectives.map(d => d.position).join(', ')}`);
  }));

  // Handle player move
  socket.on('game:move', safeHandler(({ roomCode, to, ticketType, useDoubleMove = false }) => {
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

    // SECURITY: Determine 'from' position server-side - NEVER trust client
    const from = currentPlayer.role === 'mrX'
      ? room.gameState.mrX.position
      : room.gameState.detectives[currentPlayer.detectiveIndex]?.position;

    if (!from) {
      socket.emit('error', { message: 'Current position not found', code: 'POSITION_ERROR' });
      return;
    }

    // Validate double-move usage (only Mr. X can use, and must have cards available)
    if (useDoubleMove) {
      if (currentPlayer.role !== 'mrX') {
        socket.emit('error', { message: 'Only Mr. X can use double-move cards', code: 'INVALID_DOUBLE_MOVE' });
        return;
      }
      if (room.gameState.mrX.doubleMoves <= 0) {
        socket.emit('error', { message: 'No double-move cards remaining', code: 'NO_DOUBLE_MOVES' });
        return;
      }
      if (room.gameState.doubleMoveInProgress) {
        socket.emit('error', { message: 'Double-move already in progress', code: 'DOUBLE_MOVE_IN_PROGRESS' });
        return;
      }
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

      // Add to global move history
      room.gameState.moveHistory.push({
        round: room.gameState.currentRound,
        playerName: currentPlayer.name,
        playerRole: 'mrX',
        from,
        to,
        ticketType,
        timestamp: Date.now()
      });

      // Handle double-move card
      if (useDoubleMove && !room.gameState.doubleMoveInProgress) {
        // Start double-move: Mr. X gets another turn immediately
        room.gameState.doubleMoveInProgress = true;
        room.gameState.mrX.doubleMoves--;
        // Don't advance turn - Mr. X moves again
      } else if (room.gameState.doubleMoveInProgress) {
        // Second move of double-move: now advance turn normally
        room.gameState.doubleMoveInProgress = false;
        // Advance turn
        room.gameState.currentPlayerIndex++;
      } else {
        // Normal Mr. X move without double-move
        room.gameState.currentPlayerIndex++;
      }
    } else {
      // Update detective position and tickets
      const detectiveIndex = currentPlayer.detectiveIndex;
      room.gameState.detectives[detectiveIndex].position = to;
      room.gameState.detectives[detectiveIndex].tickets[ticketType]--;

      // Transfer ticket to Mr. X
      room.gameState.mrX.tickets[ticketType]++;

      // Add to global move history
      room.gameState.moveHistory.push({
        round: room.gameState.currentRound,
        playerName: currentPlayer.name,
        playerRole: 'detective',
        detectiveIndex,
        from,
        to,
        ticketType,
        timestamp: Date.now()
      });

      // Advance turn
      room.gameState.currentPlayerIndex++;
    }

    room.lastActivity = Date.now();

    // If all players have moved, start new round
    // IMPORTANT: Don't advance round if double-move is in progress
    if (room.gameState.currentPlayerIndex >= room.players.length && !room.gameState.doubleMoveInProgress) {
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
        reason: winCondition.reason,
        moveHistory: room.gameState.moveHistory,
        finalRound: room.gameState.currentRound
      });
    }

    // Send filtered game state to each player
    room.players.forEach(player => {
      const filteredRoom = getFilteredRoomForPlayer(room, player.id);
      io.to(player.id).emit('game:state:updated', {
        room: filteredRoom,
        lastMove: {
          player: currentPlayer.name,
          from,
          to,
          ticketType,
          timestamp: Date.now()
        }
      });
    });

    console.log(`${currentPlayer.name} moved from ${from} to ${to} using ${ticketType}`);
  }));

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`[${new Date().toISOString()}] Client disconnected: ${socket.id} (${reason})`);

    // Remove player from active players
    activePlayers.delete(socket.id);

    // Mark player as disconnected in all rooms and create reconnection token
    for (const [roomCode, room] of activeGames.entries()) {
      const playerIndex = room.players.findIndex(p => p.id === socket.id);

      if (playerIndex !== -1) {
        room.players[playerIndex].connected = false;

        // Create reconnection token for the player
        const reconnectionToken = createReconnectionToken(socket.id, roomCode);
        console.log(`[Reconnection] Token created for player ${room.players[playerIndex].name} in room ${roomCode}`);

        // Notify other players about disconnection
        io.to(roomCode).emit('player:disconnected', {
          playerId: socket.id,
          playerName: room.players[playerIndex].name,
          canReconnect: true,
          reconnectTimeout: RECONNECTION_TIMEOUT / 1000 // in seconds
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

// Catch-all route for SPA routing (must be last)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(join(__dirname, '../client/dist/index.html'));
  });
}

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
