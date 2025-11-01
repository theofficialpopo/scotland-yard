import { useState } from 'react';
import { stations, connections } from '../data/londonMap';

function Board({ room, playerId, emit }) {
  const [selectedStation, setSelectedStation] = useState(null);

  if (!room || !room.gameState) {
    return (
      <div className="board-container">
        <p>Loading game board...</p>
      </div>
    );
  }

  const currentPlayer = room.players[room.gameState.currentPlayerIndex];
  const isMyTurn = currentPlayer?.id === playerId;
  const myPlayer = room.players.find(p => p.id === playerId);

  const handleStationClick = (stationId) => {
    if (!isMyTurn) {
      console.log('Not your turn');
      return;
    }

    setSelectedStation(stationId);
    console.log('Selected station:', stationId);
  };

  const handleMove = (ticketType) => {
    if (!selectedStation || !isMyTurn) return;

    // Get current player's position using detectiveIndex
    const currentPosition = myPlayer.role === 'mrX'
      ? room.gameState.mrX.position
      : room.gameState.detectives[myPlayer.detectiveIndex]?.position;

    if (!currentPosition) {
      console.log('No current position set');
      return;
    }

    emit('game:move', {
      roomCode: room.code,
      from: currentPosition,
      to: selectedStation,
      ticketType
    });

    setSelectedStation(null);
  };

  return (
    <div className="board-container">
      <div style={{ marginBottom: '15px' }}>
        <strong>Current Turn:</strong> {currentPlayer?.name}
        {isMyTurn && <span style={{ color: 'green', marginLeft: '10px' }}>(Your Turn!)</span>}
      </div>

      <svg
        viewBox="0 0 1100 900"
        style={{
          width: '100%',
          maxWidth: '1100px',
          height: 'auto',
          border: '2px solid #ccc',
          borderRadius: '8px',
          background: '#fafafa'
        }}
      >
        {/* Render connections */}
        {connections.map((conn, i) => {
          const from = stations[conn.from];
          const to = stations[conn.to];

          if (!from || !to) return null;

          const color = conn.types[0] === 'taxi' ? '#FDB913' :
                       conn.types[0] === 'bus' ? '#00B140' :
                       conn.types[0] === 'underground' ? '#EE1C25' :
                       '#999';

          return (
            <line
              key={`conn-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={color}
              strokeWidth="2"
              strokeDasharray={conn.types[0] === 'underground' ? '5,5' : '0'}
              className="connection"
              opacity="0.6"
            />
          );
        })}

        {/* Render stations */}
        {Object.entries(stations).map(([id, station]) => {
          const isSelected = parseInt(id) === selectedStation;

          return (
            <g key={`station-${id}`}>
              <circle
                cx={station.x}
                cy={station.y}
                r={isSelected ? 10 : 6}
                fill={isSelected ? '#007bff' : '#fff'}
                stroke="#333"
                strokeWidth={isSelected ? 3 : 1}
                className="station"
                onClick={() => handleStationClick(parseInt(id))}
              />
              <text
                x={station.x}
                y={station.y - 12}
                fontSize="10"
                textAnchor="middle"
                fill="#333"
                pointerEvents="none"
              >
                {id}
              </text>
            </g>
          );
        })}

        {/* Render player pieces */}
        {room.players.map((player, i) => {
          if (player.role === 'mrX' && room.gameState.mrX.position) {
            const pos = stations[room.gameState.mrX.position];
            if (!pos) return null;

            return (
              <circle
                key={`player-${player.id}`}
                cx={pos.x}
                cy={pos.y}
                r="15"
                fill="#000"
                stroke="#fff"
                strokeWidth="2"
                className="player-piece"
              />
            );
          } else if (player.role === 'detective' && player.detectiveIndex !== null) {
            const detectivePos = room.gameState.detectives[player.detectiveIndex]?.position;

            if (!detectivePos) return null;

            const pos = stations[detectivePos];
            if (!pos) return null;

            const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#6c5ce7'];

            return (
              <circle
                key={`player-${player.id}`}
                cx={pos.x}
                cy={pos.y}
                r="15"
                fill={colors[player.detectiveIndex % colors.length]}
                stroke="#fff"
                strokeWidth="2"
                className="player-piece"
              />
            );
          }
          return null;
        })}
      </svg>

      {selectedStation && isMyTurn && (
        <div style={{ marginTop: '15px' }}>
          <p><strong>Selected Station:</strong> {selectedStation}</p>
          <p>Choose a ticket type:</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              className="button ticket-taxi"
              onClick={() => handleMove('taxi')}
            >
              Taxi
            </button>
            <button
              className="button ticket-bus"
              onClick={() => handleMove('bus')}
            >
              Bus
            </button>
            <button
              className="button ticket-underground"
              onClick={() => handleMove('underground')}
            >
              Underground
            </button>
            {myPlayer?.role === 'mrX' && (
              <button
                className="button ticket-black"
                onClick={() => handleMove('black')}
              >
                Black
              </button>
            )}
          </div>
          <button
            className="button"
            onClick={() => setSelectedStation(null)}
            style={{ marginTop: '10px', background: '#6c757d' }}
          >
            Cancel
          </button>
        </div>
      )}

      {!isMyTurn && (
        <div style={{ marginTop: '15px', color: '#666' }}>
          <p>Waiting for {currentPlayer?.name} to make a move...</p>
        </div>
      )}
    </div>
  );
}

export default Board;
