import { useState } from 'react';

function Lobby({ onCreateRoom, onJoinRoom, connected }) {
  const [playerName, setPlayerName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [mode, setMode] = useState(null); // null, 'create', or 'join'

  const handleCreate = (e) => {
    e.preventDefault();
    if (playerName.trim()) {
      onCreateRoom(playerName.trim());
    }
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (playerName.trim() && roomCode.trim()) {
      onJoinRoom(roomCode.trim().toUpperCase(), playerName.trim());
    }
  };

  if (!mode) {
    return (
      <div>
        <h2 style={{ marginBottom: '15px', textAlign: 'center' }}>Welcome!</h2>
        <p style={{ marginBottom: '30px', color: '#ccc', textAlign: 'center', lineHeight: '1.6' }}>
          A multiplayer chase game where one player (Mister X) tries to evade
          detectives across London's transit network.
        </p>

        <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
          <button
            onClick={() => setMode('create')}
            disabled={!connected}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: connected ? '#4CAF50' : '#555',
              color: '#fff',
              border: '2px solid #8B4513',
              borderRadius: '8px',
              cursor: connected ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            Create New Game
          </button>

          <button
            onClick={() => setMode('join')}
            disabled={!connected}
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '16px',
              fontWeight: 'bold',
              background: connected ? '#007bff' : '#555',
              color: '#fff',
              border: '2px solid #8B4513',
              borderRadius: '8px',
              cursor: connected ? 'pointer' : 'not-allowed',
              transition: 'all 0.2s',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
            }}
          >
            Join Existing Game
          </button>
        </div>

        {!connected && (
          <p style={{ color: '#f44336', marginTop: '20px', textAlign: 'center', fontSize: '14px' }}>
            Connecting to server...
          </p>
        )}
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div>
        <h2 style={{ marginBottom: '25px', textAlign: 'center' }}>Create New Game</h2>
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="playerName" style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px' }}>
              Your Name:
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              required
              maxLength={20}
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                background: 'rgba(50, 45, 40, 0.6)',
                border: '2px solid #8B4513',
                borderRadius: '6px',
                color: '#f5f5f5',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={!playerName.trim() || !connected}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: playerName.trim() && connected ? '#4CAF50' : '#555',
                color: '#fff',
                border: '2px solid #8B4513',
                borderRadius: '8px',
                cursor: playerName.trim() && connected ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            >
              Create Room
            </button>
            <button
              type="button"
              onClick={() => setMode(null)}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: '#6c757d',
                color: '#fff',
                border: '2px solid #8B4513',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    );
  }

  if (mode === 'join') {
    return (
      <div>
        <h2 style={{ marginBottom: '25px', textAlign: 'center' }}>Join Existing Game</h2>
        <form onSubmit={handleJoin}>
          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="roomCode" style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px' }}>
              Room Code:
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              required
              maxLength={6}
              autoFocus
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                textAlign: 'center',
                background: 'rgba(50, 45, 40, 0.6)',
                border: '2px solid #8B4513',
                borderRadius: '6px',
                color: '#f5f5f5',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label htmlFor="playerName" style={{ display: 'block', marginBottom: '8px', color: '#ccc', fontSize: '14px' }}>
              Your Name:
            </label>
            <input
              id="playerName"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              required
              maxLength={20}
              style={{
                width: '100%',
                padding: '12px',
                fontSize: '16px',
                background: 'rgba(50, 45, 40, 0.6)',
                border: '2px solid #8B4513',
                borderRadius: '6px',
                color: '#f5f5f5',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              disabled={!playerName.trim() || !roomCode.trim() || !connected}
              style={{
                flex: 1,
                padding: '12px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: playerName.trim() && roomCode.trim() && connected ? '#007bff' : '#555',
                color: '#fff',
                border: '2px solid #8B4513',
                borderRadius: '8px',
                cursor: playerName.trim() && roomCode.trim() && connected ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            >
              Join Room
            </button>
            <button
              type="button"
              onClick={() => setMode(null)}
              style={{
                padding: '12px 20px',
                fontSize: '16px',
                fontWeight: 'bold',
                background: '#6c757d',
                color: '#fff',
                border: '2px solid #8B4513',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
              }}
            >
              Back
            </button>
          </div>
        </form>
      </div>
    );
  }

  return null;
}

export default Lobby;
