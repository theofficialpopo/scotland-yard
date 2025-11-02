/**
 * GameEndScreen - Display game results and complete move history
 */

const TICKET_EMOJIS = {
  taxi: '🚕',
  bus: '🚌',
  underground: '🚇',
  black: '⚫',
  ferry: '⛴️'
};

const TICKET_COLORS = {
  taxi: '#FDB913',
  bus: '#00A651',
  underground: '#DC241F',
  black: '#1a1a1a'
};

function GameEndScreen({ winner, reason, moveHistory = [], finalRound, onReturnToLobby, onRematch }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      overflow: 'auto',
      padding: '20px'
    }}>
      <div style={{
        background: 'rgba(30, 25, 20, 0.98)',
        border: '4px solid #8B4513',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        padding: '40px',
        maxWidth: '900px',
        width: '100%',
        color: '#f5f5f5',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        {/* Winner Announcement */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          borderBottom: '3px solid #8B4513',
          paddingBottom: '25px'
        }}>
          <h1 style={{
            margin: '0 0 15px 0',
            fontSize: '42px',
            color: '#FFD700',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            Game Over!
          </h1>
          <div style={{
            fontSize: '28px',
            marginBottom: '10px',
            fontWeight: 'bold'
          }}>
            {winner === 'detectives' ? '🔍 Detectives Win!' : '🎩 Mister X Wins!'}
          </div>
          <div style={{
            fontSize: '18px',
            color: '#ccc',
            marginBottom: '10px'
          }}>
            {reason}
          </div>
          <div style={{
            fontSize: '16px',
            color: '#999'
          }}>
            Game ended at Round {finalRound}
          </div>
        </div>

        {/* Move History */}
        <div style={{ marginBottom: '30px' }}>
          <h2 style={{
            margin: '0 0 20px 0',
            fontSize: '24px',
            borderBottom: '2px solid #8B4513',
            paddingBottom: '10px'
          }}>
            📜 Complete Move History
          </h2>

          {moveHistory.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>
              No moves recorded
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gap: '10px'
            }}>
              {moveHistory.map((move, index) => (
                <div
                  key={index}
                  style={{
                    background: 'rgba(50, 45, 40, 0.6)',
                    border: `2px solid ${move.playerRole === 'mrX' ? '#FFD700' : '#8B4513'}`,
                    borderRadius: '8px',
                    padding: '15px',
                    display: 'grid',
                    gridTemplateColumns: '80px 1fr 120px 100px 100px',
                    gap: '15px',
                    alignItems: 'center'
                  }}
                >
                  {/* Round */}
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: '#FFD700'
                  }}>
                    Round {move.round}
                  </div>

                  {/* Player */}
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    {move.playerRole === 'mrX' ? '🎩' : '🔍'} {move.playerName}
                  </div>

                  {/* Route */}
                  <div style={{
                    fontSize: '15px',
                    color: '#ccc',
                    fontFamily: 'monospace'
                  }}>
                    {move.from} → {move.to}
                  </div>

                  {/* Ticket */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '6px 12px',
                    background: TICKET_COLORS[move.ticketType] || '#666',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    color: move.ticketType === 'taxi' ? '#000' : '#fff',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '18px' }}>{TICKET_EMOJIS[move.ticketType]}</span>
                    <span style={{ textTransform: 'capitalize' }}>{move.ticketType}</span>
                  </div>

                  {/* Timestamp */}
                  <div style={{
                    fontSize: '12px',
                    color: '#999'
                  }}>
                    {new Date(move.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <button
            onClick={onRematch}
            style={{
              flex: 1,
              padding: '15px',
              background: '#4CAF50',
              color: '#fff',
              border: '2px solid #8B4513',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#45a049';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#4CAF50';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            🔄 Rematch
          </button>
          <button
            onClick={onReturnToLobby}
            style={{
              flex: 1,
              padding: '15px',
              background: '#dc3545',
              color: '#fff',
              border: '2px solid #8B4513',
              borderRadius: '8px',
              fontSize: '18px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#c82333';
              e.currentTarget.style.transform = 'scale(1.02)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#dc3545';
              e.currentTarget.style.transform = 'scale(1)';
            }}
          >
            Return to Lobby
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameEndScreen;
