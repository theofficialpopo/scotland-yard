import { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (!socket) return;

    // Listen for room created
    const unsubRoomCreated = on('room:created', ({ roomCode, room }) => {
      console.log('Room created:', roomCode);
      setRoomCode(roomCode);
      setRoom(room);
      setGameState('waiting');
      setError(null);
    });

    // Listen for room joined
    const unsubLobbyJoined = on('lobby:joined', ({ playerId, playerName }) => {
      console.log('Joined lobby:', playerId, playerName);
      setPlayerId(playerId);
    });

    // Listen for room updates
    const unsubRoomUpdated = on('room:updated', (updatedRoom) => {
      console.log('Room updated:', updatedRoom);
      setRoom(updatedRoom);
    });

    // Listen for game start
    const unsubGameStarted = on('game:started', ({ room, message }) => {
      console.log('Game started:', message);
      setRoom(room);
      setGameState('playing');
      setError(null);
    });

    // Listen for game state updates (after moves)
    const unsubGameStateUpdated = on('game:state:updated', ({ room, lastMove }) => {
      console.log('Game state updated:', lastMove);
      setRoom(room);
      setError(null); // Clear any previous errors on successful move
    });

    // Listen for game over
    const unsubGameOver = on('game:over', ({ winner, reason }) => {
      console.log('Game over:', winner, reason);
      alert(`Game Over! ${winner === 'detectives' ? 'Detectives' : 'Mister X'} won! ${reason}`);
      // Room state will be updated via game:state:updated
    });

    // Listen for errors
    const unsubError = on('error', ({ message, code }) => {
      console.error('Server error:', code, message);
      setError(message);
      // Auto-clear error after 5 seconds
      setTimeout(() => setError(null), 5000);
    });

    return () => {
      unsubRoomCreated && unsubRoomCreated();
      unsubLobbyJoined && unsubLobbyJoined();
      unsubRoomUpdated && unsubRoomUpdated();
      unsubGameStarted && unsubGameStarted();
      unsubGameStateUpdated && unsubGameStateUpdated();
      unsubGameOver && unsubGameOver();
      unsubError && unsubError();
    };
  }, [socket, on]);

  const handleCreateRoom = (name) => {
    setPlayerName(name);
    // Wait for lobby:joined before creating room (fixes race condition)
    let unsubOnce;
    unsubOnce = on('lobby:joined', () => {
      emit('room:create', { playerName: name });
      if (unsubOnce) unsubOnce();
    });
    emit('join:lobby', { playerName: name });
  };

  const handleJoinRoom = (code, name) => {
    setPlayerName(name);
    setRoomCode(code);
    // Wait for lobby:joined before joining room (fixes race condition)
    let unsubOnce;
    unsubOnce = on('lobby:joined', () => {
      emit('room:join', { roomCode: code, playerName: name });
      if (unsubOnce) unsubOnce();
    });
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
        <div>
          <div className="card">
            <h2>Game in Progress</h2>
            <p><strong>Room:</strong> {roomCode}</p>
            <p><strong>Round:</strong> {room.gameState?.currentRound || 1} / {room.gameState?.maxRounds || 24}</p>

            <h3>Players</h3>
            <ul>
              {room.players.map((player) => (
                <li key={player.id}>
                  {player.name} - {player.role === 'mrX' ? '🎩 Mister X' : '🔍 Detective'}
                  {player.id === playerId && ' (You)'}
                </li>
              ))}
            </ul>

            {room.gameState?.mrX && (
              <div style={{ marginTop: '20px' }}>
                <h4>Mr. X Tickets</h4>
                <div>
                  <span className="ticket ticket-taxi">Taxi: {room.gameState.mrX.tickets.taxi}</span>
                  <span className="ticket ticket-bus">Bus: {room.gameState.mrX.tickets.bus}</span>
                  <span className="ticket ticket-underground">Underground: {room.gameState.mrX.tickets.underground}</span>
                  <span className="ticket ticket-black">Black: {room.gameState.mrX.tickets.black}</span>
                </div>
              </div>
            )}
          </div>

          <Board
            room={room}
            playerId={playerId}
            socket={socket}
            emit={emit}
          />

          <button
            className="button"
            onClick={handleLeaveRoom}
            style={{ marginTop: '20px', background: '#dc3545' }}
          >
            Leave Game
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
