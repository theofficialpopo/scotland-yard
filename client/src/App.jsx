import { useState, useEffect, useRef } from 'react';
import { useSocket } from './hooks/useSocket';
import Lobby from './components/Lobby';
import Board from './components/Board';
import GameEndScreen from './components/GameEndScreen';

function App() {
  const { socket, connected, error: socketError, emit, on } = useSocket();
  const [gameState, setGameState] = useState('lobby'); // 'lobby', 'waiting', 'playing'
  const [roomCode, setRoomCode] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [room, setRoom] = useState(null);
  const [playerId, setPlayerId] = useState(null);
  const [error, setError] = useState(null);
  const [gameEndData, setGameEndData] = useState(null);

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
      setGameEndData(null); // Clear game end data for rematch
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
    const unsubGameOver = on('game:over', ({ winner, reason, moveHistory, finalRound }) => {
      console.log('Game over:', winner, reason);
      setGameEndData({ winner, reason, moveHistory, finalRound });
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
    setGameEndData(null);
  };

  const handleRematch = () => {
    if (roomCode) {
      emit('game:rematch', { roomCode });
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    }}>
      {/* Error Toast - Show on top of everything */}
      {(error || socketError) && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 9999,
          background: 'rgba(220, 53, 69, 0.95)',
          color: 'white',
          padding: '15px 30px',
          borderRadius: '8px',
          border: '2px solid #8B4513',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          {error || socketError}
        </div>
      )}

      {/* Lobby Screen */}
      {gameState === 'lobby' && (
        <div style={{
          width: '100%',
          maxWidth: '500px',
          padding: '40px',
          background: 'rgba(30, 25, 20, 0.95)',
          border: '3px solid #8B4513',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          color: '#f5f5f5'
        }}>
          <h1 style={{ textAlign: 'center', marginTop: 0, marginBottom: '10px', fontSize: '32px' }}>
            🎩 Scotland Yard
          </h1>
          <p style={{ textAlign: 'center', marginBottom: '30px', color: '#ccc' }}>
            {connected ? (
              <span style={{ color: '#4CAF50' }}>● Connected</span>
            ) : (
              <span style={{ color: '#f44336' }}>● Disconnected</span>
            )}
          </p>

          <Lobby
            onCreateRoom={handleCreateRoom}
            onJoinRoom={handleJoinRoom}
            connected={connected}
          />
        </div>
      )}

      {/* Waiting Room */}
      {gameState === 'waiting' && room && (
        <div style={{
          width: '100%',
          maxWidth: '600px',
          padding: '40px',
          background: 'rgba(30, 25, 20, 0.95)',
          border: '3px solid #8B4513',
          borderRadius: '12px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
          color: '#f5f5f5'
        }}>
          <h2 style={{ marginTop: 0, borderBottom: '2px solid #8B4513', paddingBottom: '15px' }}>
            🎮 Game Lobby
          </h2>

          <div style={{
            background: 'rgba(50, 45, 40, 0.6)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '25px',
            textAlign: 'center'
          }}>
            <p style={{ margin: '0 0 10px 0', color: '#ccc' }}>Room Code:</p>
            <code style={{
              fontSize: '36px',
              fontWeight: 'bold',
              padding: '10px 20px',
              background: 'rgba(255, 215, 0, 0.2)',
              border: '2px solid #FFD700',
              borderRadius: '8px',
              color: '#FFD700',
              letterSpacing: '4px'
            }}>
              {roomCode}
            </code>
            <p style={{ margin: '15px 0 0 0', fontSize: '14px', color: '#999' }}>
              Share this code with friends to join!
            </p>
          </div>

          <h3 style={{ borderBottom: '2px solid #8B4513', paddingBottom: '10px' }}>
            Players ({room.players.length}/{room.maxPlayers})
          </h3>
          <div style={{ marginBottom: '25px' }}>
            {room.players.map((player) => (
              <div
                key={player.id}
                style={{
                  background: 'rgba(50, 45, 40, 0.6)',
                  border: `2px solid ${player.id === playerId ? '#FFD700' : '#8B4513'}`,
                  borderRadius: '8px',
                  padding: '12px',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ fontWeight: 'bold' }}>{player.name}</span>
                <span style={{ fontSize: '12px', color: '#ccc' }}>
                  {player.id === room.host && '👑 Host'}
                  {player.id === playerId && ' (You)'}
                </span>
              </div>
            ))}
          </div>

          {room.players.length < 2 && (
            <p style={{
              textAlign: 'center',
              color: '#999',
              fontStyle: 'italic',
              marginBottom: '20px'
            }}>
              Waiting for at least 1 more player...
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            {room.host === playerId && (
              <button
                className="button"
                onClick={handleStartGame}
                disabled={room.players.length < 2}
                style={{
                  flex: 1,
                  background: room.players.length >= 2 ? '#4CAF50' : '#ccc',
                  fontSize: '16px',
                  padding: '12px'
                }}
              >
                Start Game
              </button>
            )}
            <button
              className="button"
              onClick={handleLeaveRoom}
              style={{
                flex: room.host === playerId ? '0 0 auto' : 1,
                background: '#dc3545',
                fontSize: '16px',
                padding: '12px'
              }}
            >
              Leave Room
            </button>
          </div>
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

      {/* Game End Screen - Shows as overlay when game ends */}
      {gameEndData && (
        <GameEndScreen
          winner={gameEndData.winner}
          reason={gameEndData.reason}
          moveHistory={gameEndData.moveHistory}
          finalRound={gameEndData.finalRound}
          onRematch={handleRematch}
          onReturnToLobby={() => {
            setGameEndData(null);
            handleLeaveRoom();
          }}
        />
      )}
    </div>
  );
}

export default App;
