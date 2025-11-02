# Scotland Yard - Development Guide

## Phase 1: Foundation - COMPLETED ✅

This is the Phase 1 (Foundation) implementation of the Scotland Yard multiplayer game.

### What's Implemented

**Backend (Server):**
- ✅ Express server with Socket.IO
- ✅ Room creation and joining system
- ✅ Basic game state management
- ✅ London map data structure (50 stations for MVP)
- ✅ Move validation logic
- ✅ Game constants and configuration

**Frontend (Client):**
- ✅ React application with Vite
- ✅ Socket.IO client integration
- ✅ Lobby system (create/join rooms)
- ✅ SVG board rendering
- ✅ Basic game UI
- ✅ Real-time multiplayer sync

### Setup Instructions

#### Prerequisites
- Node.js 18+ installed
- npm or yarn

#### Installation

1. **Install Server Dependencies:**
```bash
cd server
npm install
```

2. **Install Client Dependencies:**
```bash
cd client
npm install
```

#### Running the Application

1. **Start the Server** (Terminal 1):
```bash
cd server
npm run dev
```
Server will run on http://localhost:3001

2. **Start the Client** (Terminal 2):
```bash
cd client
npm run dev
```
Client will run on http://localhost:5173

3. **Open in Browser:**
- Navigate to http://localhost:5173
- Create a game or join with a room code
- Share the room code with friends to play!

### How to Play

1. **Create a Game:**
   - Click "Create New Game"
   - Enter your name
   - Share the 6-character room code with friends

2. **Join a Game:**
   - Click "Join Existing Game"
   - Enter the room code
   - Enter your name

3. **Start the Game:**
   - Host clicks "Start Game" when all players are ready
   - First player becomes Mister X
   - Others become detectives

4. **Make Moves:**
   - Click on a station to select it
   - Choose a ticket type (Taxi, Bus, Underground, or Black for Mr. X)
   - Move is validated and synchronized to all players

### Project Structure

```
scotland-yard/
├── server/
│   ├── index.js              # Express + Socket.IO server
│   ├── game/
│   │   ├── constants.js      # Game constants
│   │   ├── map.js            # London map data
│   │   └── validation.js     # Move validation
│   └── package.json
│
├── client/
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── components/
│   │   │   ├── Lobby.jsx     # Room creation/joining
│   │   │   └── Board.jsx     # SVG game board
│   │   ├── hooks/
│   │   │   └── useSocket.js  # Socket.IO hook
│   │   ├── data/
│   │   │   └── londonMap.js  # Map coordinates
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── README.md
├── LICENSE
└── .gitignore
```

### Tech Stack

- **Backend:** Node.js, Express, Socket.IO
- **Frontend:** React, Vite, Socket.IO Client
- **Real-time:** WebSocket (via Socket.IO)

### Environment Variables

Create `.env` file in server directory:

```env
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:5173
```

### Testing

1. **Test Server:**
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "uptime": 123.456,
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

2. **Test Multiplayer:**
   - Open http://localhost:5173 in two browser windows
   - Create a game in one window
   - Join with the room code in the other
   - Verify real-time synchronization

### Known Limitations (Phase 1 MVP)

- Simplified map with 50 stations (full game has 199)
- Basic move validation (not all edge cases covered)
- No game history/replay
- No spectator mode
- No reconnection handling
- Limited mobile optimization

### Next Steps (Phase 2)

- [ ] Implement boardgame.io for advanced game logic
- [ ] Full 6-player support with proper turn order
- [ ] Complete ticket system with transfers
- [ ] Mister X reveal mechanics (turns 3, 8, 13, 18, 24)
- [ ] Double-move cards for Mister X
- [ ] Win condition detection
- [ ] Full 199-station London map

### Troubleshooting

**Server won't start:**
- Check if port 3001 is available
- Run `npm install` in server directory

**Client won't start:**
- Check if port 5173 is available
- Run `npm install` in client directory

**Socket connection failed:**
- Ensure server is running first
- Check CORS_ORIGIN in server/.env
- Check browser console for errors

**Players can't join room:**
- Verify room code is correct (case-sensitive)
- Check server logs for errors
- Ensure server is running

### Contributing

This is Phase 1 of the implementation. See GitHub Issue #1 for the complete roadmap.

### License

MIT License - See LICENSE file for details
