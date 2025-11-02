import { useState, useEffect, useRef } from 'react';
import { useSocket } from './hooks/useSocket';
import Lobby from './components/Lobby';
import Board from './components/Board';

function App() {
  const { socket, connected, error: socketError, emit, on } = useSocket();
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'waiting', 'playing'
  const [roomCode, setRoomCode] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [error, setError] = useState(null);

  // Track all unsubscribe functions to prevent memory leaks
  const cleanupFunctions = useRef([]);

  useEffect(() => {
    if (!socket) return;

    // Clear previous cleanup functions
    cleanupFunctions.current = [];

    // Listen for room created
    const unsubRoomCreated = on('room:created', ({ roomCode, room }) => {
      console.log('Room created:', roomCode);
      setRoomCode(roomCode);
      setRoom(room);
      setGameState('waiting');
      setError(null);
    });
    cleanupFunctions.current.push(unsubRoomCreated);

    // Listen for room joined
    const unsubLobbyJoined = on('lobby:joined', ({ playerId, playerName }) => {
      console.log('Joined lobby:', playerId, playerName);
      setPlayerId(playerId);
    });
    cleanupFunctions.current.push(unsubLobbyJoined);

    // Listen for room updates
    const unsubRoomUpdated = on('room:updated', (updatedRoom) => {
      console.log('Room updated:', updatedRoom);
      setRoom(updatedRoom);
    });
    cleanupFunctions.current.push(unsubRoomUpdated);

    // Listen for game start
    const unsubGameStarted = on('game:started', ({ room, message }) => {
      console.log('Game started:', message);
      setRoom(room);
      setGameState('playing');
      setError(null);
    });
    cleanupFunctions.current.push(unsubGameStarted);

    // Listen for game state updates (after moves)
    const unsubGameStateUpdated = on('game:state:updated', ({ room, lastMove }) => {
      console.log('Game state updated:', lastMove);
      setRoom(room);
      setError(null); // Clear any previous errors on successful move
    });
    cleanupFunctions.current.push(unsubGameStateUpdated);

    // Listen for game over
    const unsubGameOver = on('game:over', ({ winner, reason }) => {
      console.log('Game over:', winner, reason);
      alert(`Game Over! ${winner === 'detectives' ? 'Detectives' : 'Mister X'} won! ${reason}`);
      // Room state will be updated via game:state:updated
    });
    cleanupFunctions.current.push(unsubGameOver);

    // Listen for errors
    const unsubError = on('error', ({ message, code }) => {
      console.error('Server error:', code, message);
      setError(message);
      // Auto-clear error based on message length (min 3s, max 10s, ~100ms per character)
      const timeout = Math.min(Math.max(message.length * 100, 3000), 10000);
      setTimeout(() => setError(null), timeout);
    });
    cleanupFunctions.current.push(unsubError);

    return () => {
      // Clean up all event listeners to prevent memory leaks
      cleanupFunctions.current.forEach(cleanup => cleanup && cleanup());
      cleanupFunctions.current = [];
    };
  }, [socket, on]);

  const handleCreateRoom = (name) => {
    setPlayerName(name);
    // Wait for lobby:joined before creating room (fixes race condition)
    let unsubOnce;
    unsubOnce = on('lobby:joined', () => {
      emit('room:create', { playerName: name });
      if (unsubOnce) {
        unsubOnce();
        // Remove from cleanup functions after it fires
        const index = cleanupFunctions.current.indexOf(unsubOnce);
        if (index > -1) cleanupFunctions.current.splice(index, 1);
      }
    });
    // Add to cleanup functions in case component unmounts before event fires
    cleanupFunctions.current.push(unsubOnce);
    emit('join:lobby', { playerName: name });
  };

  const handleJoinRoom = (code, name) => {
    setPlayerName(name);
    setRoomCode(code);
    // Wait for lobby:joined before joining room (fixes race condition)
    let unsubOnce;
    unsubOnce = on('lobby:joined', () => {
      emit('room:join', { roomCode: code, playerName: name });
      if (unsubOnce) {
        unsubOnce();
        // Remove from cleanup functions after it fires
        const index = cleanupFunctions.current.indexOf(unsubOnce);
        if (index > -1) cleanupFunctions.current.splice(index, 1);
      }
    });
    // Add to cleanup functions in case component unmounts before event fires
    cleanupFunctions.current.push(unsubOnce);
    emit('join:lobby', { playerName: name });
    setGameState('waiting');
  };

  const handleStartGame = () => {
    if (roomCode) {
      emit('game:start', { roomCode });
    }
  };

  const handleLeaveRoom = () => {
    setGameState('lobby');
    setRoomCode(null);
    setRoom(null);
    setError(null);
  };

  return (
    <div className="container">
      <header style={{ textAlign: 'center', padding: '20px 0' }}>
        <h1>🎮 Scotland Yard - Online Multiplayer</h1>
        <p>
          {connected ? (
            <span style={{ color: 'green' }}>● Connected</span>
          ) : (
            <span style={{ color: 'red' }}>● Disconnected</span>
          )}
        </p>
      </header>

      {(error || socketError) && (
        <div className="error">
          {error || socketError}
        </div>
      )}

      {gameState === 'lobby' && (
        <Lobby
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          connected={connected}
        />
      )}

      {gameState === 'waiting' && room && (
        <div className="card">
          <h2>Game Lobby</h2>
          <p><strong>Room Code:</strong> <code style={{ fontSize: '24px', padding: '5px 10px', background: '#f0f0f0' }}>{roomCode}</code></p>
          <p>Share this code with friends to join!</p>

          <h3>Players ({room.players.length}/{room.maxPlayers})</h3>
          <ul>
            {room.players.map((player, i) => (
              <li key={player.id}>
                {player.name}
                {player.id === room.host && ' (Host)'}
                {player.id === playerId && ' (You)'}
              </li>
            ))}
          </ul>

          <div style={{ marginTop: '20px' }}>
            {room.host === playerId && (
              <button
                className="button"
                onClick={handleStartGame}
                disabled={room.players.length < 2}
              >
                Start Game
              </button>
            )}
            <button
              className="button"
              onClick={handleLeaveRoom}
              style={{ marginLeft: '10px', background: '#dc3545' }}
            >
              Leave Room
            </button>
          </div>

          {room.players.length < 2 && (
            <p style={{ color: '#666', marginTop: '10px' }}>
              Waiting for at least 1 more player...
            </p>
          )}
        </div>
      )}

      {gameState === 'playing' && room && (
        <div className="game-container">
          {/* Top HUD Bar */}
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '60px',
            background: 'rgba(20, 20, 20, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '2px solid #8B4513',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px',
            zIndex: 100,
            color: '#f5f5f5'
          }}>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
              🎩 Scotland Yard
            </div>
            <div style={{ fontSize: '16px' }}>
              Round: {room.gameState?.currentRound || 1} / {room.gameState?.maxRounds || 24}
            </div>
            <div>
              <button
                className="button"
                onClick={handleLeaveRoom}
                style={{ background: '#dc3545', padding: '8px 16px' }}
              >
                Leave Game
              </button>
            </div>
          </div>

          {/* Main Game Area */}
          <div className="game-main" style={{ marginTop: '60px' }}>
            {/* Left Panel - Players & Info */}
            <div style={{
              width: '280px',
              background: 'rgba(30, 25, 20, 0.95)',
              borderRight: '3px solid #8B4513',
              padding: '20px',
              overflowY: 'auto',
              color: '#f5f5f5'
            }}>
              <h3 style={{ marginTop: 0, borderBottom: '2px solid #8B4513', paddingBottom: '10px' }}>
                Players
              </h3>

              {room.players.map((player) => (
                <div
                  key={player.id}
                  style={{
                    background: 'rgba(50, 45, 40, 0.6)',
                    border: `2px solid ${player.id === playerId ? '#FFD700' : '#8B4513'}`,
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '12px'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {player.role === 'mrX' ? '🎩' : '🔍'} {player.name}
                    {player.id === playerId && ' (You)'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#ccc' }}>
                    {player.role === 'mrX' ? 'Mister X' : 'Detective'}
                  </div>

                  {player.role === 'mrX' && room.gameState?.mrX && (
                    <div style={{ marginTop: '10px', fontSize: '13px' }}>
                      <div>🚕 Taxi: {room.gameState.mrX.tickets.taxi}</div>
                      <div>🚌 Bus: {room.gameState.mrX.tickets.bus}</div>
                      <div>🚇 Underground: {room.gameState.mrX.tickets.underground}</div>
                      <div>⚫ Black: {room.gameState.mrX.tickets.black}</div>
                      <div>🎴 Double: {room.gameState.mrX.doubleMoves}</div>
                    </div>
                  )}

                  {player.role === 'detective' && player.detectiveIndex !== null && room.gameState?.detectives[player.detectiveIndex] && (
                    <div style={{ marginTop: '10px', fontSize: '13px' }}>
                      <div>🚕 Taxi: {room.gameState.detectives[player.detectiveIndex].tickets.taxi}</div>
                      <div>🚌 Bus: {room.gameState.detectives[player.detectiveIndex].tickets.bus}</div>
                      <div>🚇 Underground: {room.gameState.detectives[player.detectiveIndex].tickets.underground}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Center Board Area */}
            <div className="board-area">
              <Board
                room={room}
                playerId={playerId}
                socket={socket}
                emit={emit}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
