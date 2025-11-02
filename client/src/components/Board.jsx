import { useState, useMemo } from 'react';
import { stations, connections, stationTicketTypes } from '../data/londonMap';
import StationMarker from './StationMarker';

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
    if (!currentPosition || !isMyTurn || !myPlayer) return new Set();

    const reachable = new Set();
    const currentTickets = myPlayer.role === 'mrX'
      ? room.gameState.mrX.tickets
      : room.gameState.detectives[myPlayer.detectiveIndex]?.tickets;

    if (!currentTickets) return new Set();

    // Get all occupied positions (for collision detection)
    const occupiedPositions = new Set();

    // For detectives, mark all detective positions and Mr. X position as occupied
    if (myPlayer.role === 'detective') {
      // Add Mr. X position
      if (room.gameState.mrX.position) {
        occupiedPositions.add(room.gameState.mrX.position);
      }

      // Add other detectives' positions
      room.gameState.detectives.forEach((detective, index) => {
        if (index !== myPlayer.detectiveIndex && detective.position) {
          occupiedPositions.add(detective.position);
        }
      });
    } else if (myPlayer.role === 'mrX') {
      // For Mr. X, mark detective positions as occupied
      room.gameState.detectives.forEach(detective => {
        if (detective.position) {
          occupiedPositions.add(detective.position);
        }
      });
    }

    // Find all connected stations where player has valid tickets
    connections.forEach(conn => {
      let targetStation = null;

      if (conn.from === currentPosition) {
        targetStation = conn.to;
      } else if (conn.to === currentPosition) {
        targetStation = conn.from;
      }

      if (targetStation === null || occupiedPositions.has(targetStation)) {
        return; // Skip occupied or irrelevant stations
      }

      // Check if player has any valid ticket for this connection
      const hasValidTicket = conn.types.some(ticketType => {
        // Mr. X can use black tickets for any connection
        if (myPlayer.role === 'mrX' && currentTickets.black > 0) {
          return true;
        }
        // Check if player has this specific ticket type
        return currentTickets[ticketType] > 0;
      });

      if (hasValidTicket) {
        reachable.add(targetStation);
      }
    });

    return reachable;
  }, [currentPosition, isMyTurn, myPlayer, room.gameState]);

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

    // Note: 'from' is determined server-side for security (prevents cheating)
    emit('game:move', {
      roomCode: room.code,
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
        viewBox="100 0 800 750"
        style={{
          width: '100%',
          maxWidth: '900px',
          height: 'auto',
          border: '4px solid #8B4513',
          borderRadius: '4px',
          background: '#F0E6D2',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3), inset 0 0 20px rgba(139, 69, 19, 0.1)'
        }}
      >
        {/* Render connections */}
        {connections.map((conn, i) => {
          const from = stations[conn.from];
          const to = stations[conn.to];

          if (!from || !to) return null;

          // Authentic Scotland Yard colors
          const color = conn.types[0] === 'taxi' ? '#FDB913' :
                       conn.types[0] === 'bus' ? '#00A651' :
                       conn.types[0] === 'underground' ? '#DC241F' :
                       conn.types[0] === 'ferry' ? '#0098D4' :
                       '#999';

          return (
            <line
              key={`conn-${i}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={color}
              strokeWidth="3.5"
              strokeDasharray={conn.types[0] === 'underground' ? '8,4' : '0'}
              strokeLinecap="round"
              className="connection"
              opacity="0.8"
              style={{
                filter: 'drop-shadow(0px 1px 1px rgba(0, 0, 0, 0.2))'
              }}
            />
          );
        })}

        {/* Render stations with new StationMarker component */}
        {Object.entries(stations).map(([id, station]) => {
          const stationId = parseInt(id);
          const isSelected = stationId === selectedStation;
          const isReachable = isMyTurn && reachableStations.has(stationId);
          const isCurrent = stationId === currentPosition;
          const availableTickets = stationTicketTypes.get(stationId) || new Set();

          return (
            <StationMarker
              key={`station-${id}`}
              stationId={stationId}
              x={station.x}
              y={station.y}
              availableTickets={availableTickets}
              isSelected={isSelected}
              isReachable={isReachable}
              isCurrent={isCurrent}
              onClick={() => handleStationClick(stationId)}
            />
          );
        })}

        {/* Render player pieces with board game styling */}
        {room.players.map((player, i) => {
          if (player.role === 'mrX' && room.gameState.mrX.position) {
            const pos = stations[room.gameState.mrX.position];
            if (!pos) return null;

            return (
              <g key={`player-${player.id}`}>
                {/* Shadow */}
                <circle
                  cx={pos.x}
                  cy={pos.y + 2}
                  r="16"
                  fill="rgba(0, 0, 0, 0.3)"
                  filter="blur(2px)"
                />
                {/* Player piece */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="16"
                  fill="#1a1a1a"
                  stroke="#fff"
                  strokeWidth="3"
                  className="player-piece"
                  style={{
                    filter: 'drop-shadow(0px 3px 4px rgba(0, 0, 0, 0.4))'
                  }}
                />
                {/* Mr. X label */}
                <text
                  x={pos.x}
                  y={pos.y}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="'Arial', sans-serif"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#fff"
                  pointerEvents="none"
                >
                  X
                </text>
              </g>
            );
          } else if (player.role === 'detective' && player.detectiveIndex !== null) {
            const detectivePos = room.gameState.detectives[player.detectiveIndex]?.position;

            if (!detectivePos) return null;

            const pos = stations[detectivePos];
            if (!pos) return null;

            // More vibrant, board game-style detective colors
            const colors = ['#E74C3C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6'];
            const color = colors[player.detectiveIndex % colors.length];

            return (
              <g key={`player-${player.id}`}>
                {/* Shadow */}
                <circle
                  cx={pos.x}
                  cy={pos.y + 2}
                  r="16"
                  fill="rgba(0, 0, 0, 0.3)"
                  filter="blur(2px)"
                />
                {/* Player piece */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r="16"
                  fill={color}
                  stroke="#fff"
                  strokeWidth="3"
                  className="player-piece"
                  style={{
                    filter: 'drop-shadow(0px 3px 4px rgba(0, 0, 0, 0.4))'
                  }}
                />
                {/* Detective number */}
                <text
                  x={pos.x}
                  y={pos.y}
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="'Arial', sans-serif"
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill="#fff"
                  pointerEvents="none"
                >
                  {player.detectiveIndex + 1}
                </text>
              </g>
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
