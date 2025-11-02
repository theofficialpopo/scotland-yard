import { useState, useMemo } from 'react';
import { stations, connections } from '../data/londonMap';

function Board({ room, playerId, emit }) {
  const [selectedStation, setSelectedStation] = useState(null);
  const [useDoubleMove, setUseDoubleMove] = useState(false);

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

  // Get current player's position
  const currentPosition = useMemo(() => {
    if (!myPlayer || !isMyTurn) return null;
    return myPlayer.role === 'mrX'
      ? room.gameState.mrX.position
      : room.gameState.detectives[myPlayer.detectiveIndex]?.position;
  }, [myPlayer, isMyTurn, room.gameState]);

  // Helper function to check if two stations are connected by a specific ticket type
  const areStationsConnected = (from, to, ticketType) => {
    return connections.some(conn =>
      (conn.from === from && conn.to === to && conn.types.includes(ticketType)) ||
      (conn.to === from && conn.from === to && conn.types.includes(ticketType))
    );
  };

  // Get valid ticket types for a connection
  const getValidTicketTypes = (from, to) => {
    const validTypes = new Set();
    connections.forEach(conn => {
      if ((conn.from === from && conn.to === to) || (conn.to === from && conn.from === to)) {
        conn.types.forEach(type => validTypes.add(type));
      }
    });
    return Array.from(validTypes);
  };

  // Get reachable stations from current position
  const reachableStations = useMemo(() => {
    if (!currentPosition || !isMyTurn) return new Set();

    const reachable = new Set();
    connections.forEach(conn => {
      if (conn.from === currentPosition) reachable.add(conn.to);
      if (conn.to === currentPosition) reachable.add(conn.from);
    });
    return reachable;
  }, [currentPosition, isMyTurn]);

  const handleStationClick = (stationId) => {
    if (!isMyTurn) {
      console.log('Not your turn');
      return;
    }

    // Only allow selecting reachable stations
    if (!reachableStations.has(stationId)) {
      console.log('Station not reachable from current position');
      return;
    }

    setSelectedStation(stationId);
    console.log('Selected station:', stationId);
  };

  const handleMove = (ticketType) => {
    if (!selectedStation || !isMyTurn || !currentPosition) return;

    // Validate that the move is legal with this ticket type
    // Black tickets can use any connection type (taxi, bus, underground, ferry)
    if (ticketType === 'black') {
      const hasAnyConnection =
        areStationsConnected(currentPosition, selectedStation, 'taxi') ||
        areStationsConnected(currentPosition, selectedStation, 'bus') ||
        areStationsConnected(currentPosition, selectedStation, 'underground') ||
        areStationsConnected(currentPosition, selectedStation, 'ferry');

      if (!hasAnyConnection) {
        console.error('Invalid move: stations not connected');
        return;
      }
    } else {
      if (!areStationsConnected(currentPosition, selectedStation, ticketType)) {
        console.error('Invalid move: stations not connected by this ticket type');
        return;
      }
    }

    emit('game:move', {
      roomCode: room.code,
      from: currentPosition,
      to: selectedStation,
      ticketType,
      useDoubleMove: useDoubleMove
    });

    setSelectedStation(null);
    setUseDoubleMove(false); // Reset double-move flag after use
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
          const stationId = parseInt(id);
          const isSelected = stationId === selectedStation;
          const isReachable = isMyTurn && reachableStations.has(stationId);
          const isCurrent = stationId === currentPosition;

          return (
            <g key={`station-${id}`}>
              <circle
                cx={station.x}
                cy={station.y}
                r={isSelected ? 10 : isCurrent ? 8 : 6}
                fill={isSelected ? '#007bff' : isCurrent ? '#28a745' : isReachable ? '#ffc107' : '#fff'}
                stroke="#333"
                strokeWidth={isSelected ? 3 : isCurrent ? 2 : 1}
                className="station"
                onClick={() => handleStationClick(stationId)}
                style={{ cursor: isReachable ? 'pointer' : 'default', opacity: isReachable || !isMyTurn ? 1 : 0.5 }}
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

      {selectedStation && isMyTurn && currentPosition && (
        <div style={{ marginTop: '15px' }}>
          <p><strong>Selected Station:</strong> {selectedStation}</p>

          {/* Double-move option for Mr. X */}
          {myPlayer?.role === 'mrX' && room.gameState.mrX.doubleMoves > 0 && !room.gameState.doubleMoveInProgress && (
            <div style={{ marginBottom: '10px', padding: '10px', background: '#f8f9fa', borderRadius: '4px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={useDoubleMove}
                  onChange={(e) => setUseDoubleMove(e.target.checked)}
                  style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <span style={{ fontWeight: 'bold' }}>
                  Use Double-Move Card ({room.gameState.mrX.doubleMoves} remaining)
                </span>
              </label>
              <p style={{ fontSize: '12px', color: '#666', margin: '5px 0 0 26px' }}>
                Move twice in a row this turn
              </p>
            </div>
          )}

          {/* Show indicator if double-move is in progress */}
          {room.gameState.doubleMoveInProgress && isMyTurn && (
            <div style={{ marginBottom: '10px', padding: '10px', background: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
              <strong>🎯 Double-Move Active!</strong> Make your second move.
            </div>
          )}

          <p>Choose a ticket type:</p>
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            {(() => {
              const validTickets = getValidTicketTypes(currentPosition, selectedStation);
              const currentTickets = myPlayer?.role === 'mrX'
                ? room.gameState.mrX.tickets
                : room.gameState.detectives[myPlayer.detectiveIndex]?.tickets;

              return (
                <>
                  <button
                    className="button ticket-taxi"
                    onClick={() => handleMove('taxi')}
                    disabled={!validTickets.includes('taxi') || !currentTickets?.taxi}
                    style={{ opacity: validTickets.includes('taxi') && currentTickets?.taxi ? 1 : 0.5 }}
                  >
                    Taxi ({currentTickets?.taxi || 0})
                  </button>
                  <button
                    className="button ticket-bus"
                    onClick={() => handleMove('bus')}
                    disabled={!validTickets.includes('bus') || !currentTickets?.bus}
                    style={{ opacity: validTickets.includes('bus') && currentTickets?.bus ? 1 : 0.5 }}
                  >
                    Bus ({currentTickets?.bus || 0})
                  </button>
                  <button
                    className="button ticket-underground"
                    onClick={() => handleMove('underground')}
                    disabled={!validTickets.includes('underground') || !currentTickets?.underground}
                    style={{ opacity: validTickets.includes('underground') && currentTickets?.underground ? 1 : 0.5 }}
                  >
                    Underground ({currentTickets?.underground || 0})
                  </button>
                  {myPlayer?.role === 'mrX' && (
                    <button
                      className="button ticket-black"
                      onClick={() => handleMove('black')}
                      disabled={!currentTickets?.black}
                      style={{ opacity: currentTickets?.black ? 1 : 0.5 }}
                    >
                      Black ({currentTickets?.black || 0})
                    </button>
                  )}
                </>
              );
            })()}
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
