import { useState, useEffect } from 'react';

function AdminPanel({ socket, connected }) {
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Fetch room data from server
  useEffect(() => {
    if (!socket || !connected) return;

    // Request initial admin data
    socket.emit('admin:fetch');

    // Listen for admin data updates
    const handleAdminData = ({ rooms: roomsData, stats: statsData }) => {
      setRooms(roomsData);
      setStats(statsData);
      setError(null);
    };

    const handleAdminError = ({ message }) => {
      setError(message);
      setTimeout(() => setError(null), 5000);
    };

    const handleAdminSuccess = ({ message }) => {
      setSuccessMessage(message);
      setTimeout(() => setSuccessMessage(null), 3000);
    };

    socket.on('admin:data', handleAdminData);
    socket.on('admin:error', handleAdminError);
    socket.on('admin:action-success', handleAdminSuccess);

    // Poll for updates every 2 seconds
    const interval = setInterval(() => {
      socket.emit('admin:fetch');
    }, 2000);

    return () => {
      socket.off('admin:data', handleAdminData);
      socket.off('admin:error', handleAdminError);
      socket.off('admin:action-success', handleAdminSuccess);
      clearInterval(interval);
    };
  }, [socket, connected]);

  const handleKickPlayer = (roomCode, playerName) => {
    if (confirm(`Are you sure you want to kick ${playerName} from room ${roomCode}?`)) {
      socket.emit('admin:kick-player', { roomCode, playerName });
    }
  };

  const handleCloseRoom = (roomCode) => {
    if (confirm(`Are you sure you want to close room ${roomCode}? All players will be disconnected.`)) {
      socket.emit('admin:close-room', { roomCode });
      setSelectedRoom(null);
    }
  };

  if (error) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        background: 'rgba(30, 25, 20, 0.95)',
        minHeight: '100vh',
        color: '#f5f5f5'
      }}>
        <h1 style={{ color: '#dc3545', marginBottom: '20px' }}>Access Denied</h1>
        <p style={{ fontSize: '18px' }}>{error}</p>
      </div>
    );
  }

  return (
    <div style={{
      background: 'rgba(30, 25, 20, 0.95)',
      minHeight: '100vh',
      padding: '20px',
      color: '#f5f5f5'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(50, 45, 40, 0.8)',
        border: '2px solid #FFD700',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px'
      }}>
        <h1 style={{
          margin: '0 0 10px 0',
          color: '#FFD700',
          fontSize: '32px'
        }}>
          Scotland Yard Admin Panel
        </h1>
        <p style={{ margin: 0, color: '#ccc', fontSize: '14px' }}>
          Real-time monitoring and statistics
        </p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          <StatCard title="Active Rooms" value={stats.activeRooms} color="#4CAF50" />
          <StatCard title="Total Players" value={stats.totalPlayers} color="#2196F3" />
          <StatCard title="Games Playing" value={stats.gamesPlaying} color="#FF9800" />
          <StatCard title="Games Waiting" value={stats.gamesWaiting} color="#9C27B0" />
        </div>
      )}

      {/* Success Message */}
      {successMessage && (
        <div style={{
          background: 'rgba(76, 175, 80, 0.9)',
          border: '2px solid #4CAF50',
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          ✓ {successMessage}
        </div>
      )}

      {/* Room List */}
      <div style={{
        background: 'rgba(50, 45, 40, 0.8)',
        border: '2px solid #8B4513',
        borderRadius: '8px',
        padding: '20px'
      }}>
        <h2 style={{
          margin: '0 0 15px 0',
          fontSize: '24px',
          borderBottom: '2px solid #8B4513',
          paddingBottom: '10px'
        }}>
          Active Rooms ({rooms.length})
        </h2>

        {rooms.length === 0 ? (
          <p style={{ color: '#999', textAlign: 'center', padding: '40px' }}>
            No active rooms
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '10px' }}>
            {rooms.map((room) => (
              <RoomCard
                key={room.code}
                room={room}
                selected={selectedRoom === room.code}
                onClick={() => setSelectedRoom(selectedRoom === room.code ? null : room.code)}
                onKickPlayer={handleKickPlayer}
                onCloseRoom={handleCloseRoom}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, color }) {
  return (
    <div style={{
      background: 'rgba(50, 45, 40, 0.8)',
      border: `2px solid ${color}`,
      borderRadius: '8px',
      padding: '20px',
      textAlign: 'center'
    }}>
      <div style={{
        fontSize: '36px',
        fontWeight: 'bold',
        color: color,
        marginBottom: '5px'
      }}>
        {value}
      </div>
      <div style={{
        fontSize: '14px',
        color: '#ccc',
        textTransform: 'uppercase',
        letterSpacing: '1px'
      }}>
        {title}
      </div>
    </div>
  );
}

function RoomCard({ room, selected, onClick, onKickPlayer, onCloseRoom }) {
  const getStatusColor = (status) => {
    switch (status) {
      case 'PLAYING': return '#4CAF50';
      case 'WAITING': return '#FF9800';
      case 'FINISHED': return '#dc3545';
      default: return '#999';
    }
  };

  const getTimeElapsed = (createdAt) => {
    const elapsed = Date.now() - createdAt;
    const minutes = Math.floor(elapsed / 60000);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div
      style={{
        background: selected ? 'rgba(70, 60, 50, 0.9)' : 'rgba(60, 55, 50, 0.6)',
        border: `2px solid ${selected ? '#FFD700' : '#8B4513'}`,
        borderRadius: '8px',
        padding: '15px',
        transition: 'all 0.2s'
      }}
    >
      <div
        onClick={onClick}
        style={{
          display: 'grid',
          gridTemplateColumns: '120px 1fr 100px 100px 150px 120px',
          gap: '15px',
          alignItems: 'center',
          cursor: 'pointer'
        }}
      >
        {/* Room Code */}
        <div>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
            Room Code
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: 'bold',
            color: '#FFD700',
            fontFamily: 'monospace'
          }}>
            {room.code}
          </div>
        </div>

        {/* Players */}
        <div>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
            Players / Host
          </div>
          <div style={{ fontSize: '14px' }}>
            {room.players.length}/{room.maxPlayers} players
            {room.hostName && ` • Host: ${room.hostName}`}
          </div>
        </div>

        {/* Status */}
        <div>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
            Status
          </div>
          <div style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: getStatusColor(room.status)
          }}>
            {room.status}
          </div>
        </div>

        {/* Round */}
        <div>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
            Round
          </div>
          <div style={{ fontSize: '14px' }}>
            {room.currentRound ? `${room.currentRound}/24` : 'N/A'}
          </div>
        </div>

        {/* Time */}
        <div>
          <div style={{ fontSize: '12px', color: '#999', marginBottom: '5px' }}>
            Time Elapsed
          </div>
          <div style={{ fontSize: '14px' }}>
            {getTimeElapsed(room.createdAt)}
          </div>
        </div>

        {/* Close Room Button */}
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onCloseRoom(room.code);
            }}
            style={{
              padding: '8px 12px',
              background: '#dc3545',
              color: '#fff',
              border: '2px solid #8B4513',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#c82333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#dc3545';
            }}
          >
            Close Room
          </button>
        </div>
      </div>

      {/* Expanded Details */}
      {selected && (
        <div style={{
          marginTop: '15px',
          paddingTop: '15px',
          borderTop: '1px solid #8B4513'
        }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#FFD700' }}>
            Player Details
          </h3>
          <div style={{ display: 'grid', gap: '8px' }}>
            {room.players.map((player, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(40, 35, 30, 0.5)',
                  padding: '10px',
                  borderRadius: '4px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontWeight: 'bold' }}>{player.name}</span>
                  {player.role && (
                    <span style={{
                      marginLeft: '10px',
                      color: player.role === 'mrX' ? '#FFD700' : '#4CAF50'
                    }}>
                      {player.role === 'mrX' ? '🎩 Mr. X' : '🔍 Detective'}
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{
                    fontSize: '12px',
                    color: player.connected ? '#4CAF50' : '#dc3545'
                  }}>
                    {player.connected ? '● Online' : '○ Offline'}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onKickPlayer(room.code, player.name);
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#ff5722',
                      color: '#fff',
                      border: '1px solid #8B4513',
                      borderRadius: '4px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e64a19';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#ff5722';
                    }}
                  >
                    Kick
                  </button>
                </div>
              </div>
            ))}
          </div>

          {room.moveHistory && room.moveHistory.length > 0 && (
            <>
              <h3 style={{ margin: '15px 0 10px 0', fontSize: '16px', color: '#FFD700' }}>
                Recent Moves ({room.moveHistory.length})
              </h3>
              <div style={{
                maxHeight: '200px',
                overflowY: 'auto',
                fontSize: '13px',
                color: '#ccc'
              }}>
                {room.moveHistory.slice(-10).reverse().map((move, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '8px',
                      borderBottom: '1px solid rgba(139, 69, 19, 0.3)'
                    }}
                  >
                    Round {move.round}: {move.playerName} moved {move.from} → {move.to} ({move.ticketType})
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminPanel;
