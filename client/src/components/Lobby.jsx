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
      <div className="card" style={{ maxWidth: '500px', margin: '40px auto' }}>
        <h2>Welcome to Scotland Yard!</h2>
        <p style={{ marginBottom: '20px' }}>
          A multiplayer chase game where one player (Mister X) tries to evade
          detectives across London's transit network.
        </p>

        <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
          <button
            className="button"
            onClick={() => setMode('create')}
            disabled={!connected}
            style={{ width: '100%', padding: '15px' }}
          >
            Create New Game
          </button>

          <button
            className="button"
            onClick={() => setMode('join')}
            disabled={!connected}
            style={{ width: '100%', padding: '15px' }}
          >
            Join Existing Game
          </button>
        </div>

        {!connected && (
          <p style={{ color: '#dc3545', marginTop: '15px', textAlign: 'center' }}>
            Connecting to server...
          </p>
        )}
      </div>
    );
  }

  if (mode === 'create') {
    return (
      <div className="card" style={{ maxWidth: '500px', margin: '40px auto' }}>
        <h2>Create New Game</h2>
        <form onSubmit={handleCreate}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="playerName" style={{ display: 'block', marginBottom: '5px' }}>
              Your Name:
            </label>
            <input
              id="playerName"
              className="input"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              required
              maxLength={20}
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="button"
              disabled={!playerName.trim() || !connected}
            >
              Create Room
            </button>
            <button
              type="button"
              className="button"
              onClick={() => setMode(null)}
              style={{ background: '#6c757d' }}
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
      <div className="card" style={{ maxWidth: '500px', margin: '40px auto' }}>
        <h2>Join Existing Game</h2>
        <form onSubmit={handleJoin}>
          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="roomCode" style={{ display: 'block', marginBottom: '5px' }}>
              Room Code:
            </label>
            <input
              id="roomCode"
              className="input"
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder="Enter 6-character code"
              required
              maxLength={6}
              autoFocus
              style={{ textTransform: 'uppercase' }}
            />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label htmlFor="playerName" style={{ display: 'block', marginBottom: '5px' }}>
              Your Name:
            </label>
            <input
              id="playerName"
              className="input"
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              required
              maxLength={20}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              className="button"
              disabled={!playerName.trim() || !roomCode.trim() || !connected}
            >
              Join Room
            </button>
            <button
              type="button"
              className="button"
              onClick={() => setMode(null)}
              style={{ background: '#6c757d' }}
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
