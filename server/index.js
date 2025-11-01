import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Active games storage (in-memory for MVP)
const activeGames = new Map();
const activePlayers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log(`[${new Date().toISOString()}] Client connected: ${socket.id}`);

  // Handle player joining lobby
  socket.on('join:lobby', ({ playerName }) => {
    activePlayers.set(socket.id, {
      id: socket.id,
      name: playerName,
      connectedAt: Date.now()
    });

    socket.emit('lobby:joined', {
      playerId: socket.id,
      playerName
    });

    console.log(`Player ${playerName} (${socket.id}) joined lobby`);
  });

  // Handle room creation
  socket.on('room:create', ({ playerName }) => {
    const roomCode = generateRoomCode();
    const room = {
      code: roomCode,
      host: socket.id,
      players: [{
        id: socket.id,
        name: playerName,
        role: null,
        connected: true
      }],
      status: 'WAITING',
      maxPlayers: 6,
      createdAt: Date.now()
    };

    activeGames.set(roomCode, room);
    socket.join(roomCode);

    socket.emit('room:created', {
      roomCode,
      room
    });

    console.log(`Room ${roomCode} created by ${playerName}`);
  });

  // Handle joining existing room
  socket.on('room:join', ({ roomCode, playerName }) => {
    const room = activeGames.get(roomCode);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (room.players.length >= room.maxPlayers) {
      socket.emit('error', { message: 'Room is full' });
      return;
    }

    if (room.status !== 'WAITING') {
      socket.emit('error', { message: 'Game already in progress' });
      return;
    }

    room.players.push({
      id: socket.id,
      name: playerName,
      role: null,
      connected: true
    });

    socket.join(roomCode);

    // Notify all players in room
    io.to(roomCode).emit('room:updated', room);

    console.log(`${playerName} joined room ${roomCode} (${room.players.length}/${room.maxPlayers})`);
  });

  // Handle game start
  socket.on('game:start', ({ roomCode }) => {
    const room = activeGames.get(roomCode);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    if (socket.id !== room.host) {
      socket.emit('error', { message: 'Only host can start the game' });
      return;
    }

    if (room.players.length < 2) {
      socket.emit('error', { message: 'Need at least 2 players to start' });
      return;
    }

    // Assign roles: first player is Mr. X, others are detectives
    room.players[0].role = 'mrX';
    for (let i = 1; i < room.players.length; i++) {
      room.players[i].role = `detective${i}`;
    }

    room.status = 'PLAYING';
    room.startedAt = Date.now();

    // Initialize game state (simplified for Phase 1)
    room.gameState = {
      currentRound: 1,
      maxRounds: 24,
      revealRounds: [3, 8, 13, 18, 24],
      currentPlayer: 0, // Index in players array
      mrX: {
        position: null, // Will be set when game starts properly
        tickets: { taxi: 4, bus: 3, underground: 3, black: room.players.length - 1 },
        doubleMoves: 2,
        moveHistory: []
      },
      detectives: room.players.slice(1).map(() => ({
        position: null,
        tickets: { taxi: 10, bus: 8, underground: 4 }
      }))
    };

    io.to(roomCode).emit('game:started', {
      room,
      message: 'Game started! Assigning starting positions...'
    });

    console.log(`Game started in room ${roomCode} with ${room.players.length} players`);
  });

  // Handle player move
  socket.on('game:move', ({ roomCode, from, to, ticketType }) => {
    const room = activeGames.get(roomCode);

    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    // Validate it's the player's turn
    const currentPlayer = room.players[room.gameState.currentPlayer];
    if (currentPlayer.id !== socket.id) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }

    // TODO: Add move validation logic here

    // Broadcast move to all players
    io.to(roomCode).emit('game:move:made', {
      player: currentPlayer.name,
      from,
      to,
      ticketType,
      timestamp: Date.now()
    });

    console.log(`${currentPlayer.name} moved from ${from} to ${to} using ${ticketType}`);
  });

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

        // Clean up room if all players disconnected and game not started
        const allDisconnected = room.players.every(p => !p.connected);
        if (allDisconnected && room.status === 'WAITING') {
          activeGames.delete(roomCode);
          console.log(`Room ${roomCode} deleted (all players disconnected)`);
        }
      }
    }
  });
});

// Helper function to generate room codes
function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Scotland Yard Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`💚 Health check: http://localhost:${PORT}/health\n`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
