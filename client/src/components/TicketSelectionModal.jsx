/**
 * TicketSelectionModal - Ticket to Ride inspired ticket selection overlay
 * Shows available tickets as cards with proper styling and game atmosphere
 */

const TICKET_CONFIG = {
  taxi: {
    emoji: '🚕',
    color: '#FDB913',
    label: 'Taxi'
  },
  bus: {
    emoji: '🚌',
    color: '#00A651',
    label: 'Bus'
  },
  underground: {
    emoji: '🚇',
    color: '#DC241F',
    label: 'Underground'
  },
  black: {
    emoji: '⚫',
    color: '#1a1a1a',
    label: 'Black Ticket'
  }
};

function TicketSelectionModal({
  selectedStation,
  validTickets,
  currentTickets,
  isMrX,
  doubleMoves,
  doubleMoveInProgress,
  useDoubleMove,
  onDoubleMoveToggle,
  onTicketSelect,
  onCancel
}) {
  if (!selectedStation) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: 'rgba(30, 25, 20, 0.98)',
        border: '4px solid #8B4513',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
        padding: '40px',
        maxWidth: '700px',
        width: '90%',
        color: '#f5f5f5'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '30px',
          borderBottom: '2px solid #8B4513',
          paddingBottom: '20px'
        }}>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '28px' }}>
            Choose Your Ticket
          </h2>
          <p style={{ margin: 0, color: '#ccc', fontSize: '16px' }}>
            Moving to Station <span style={{ color: '#FFD700', fontWeight: 'bold', fontSize: '18px' }}>{selectedStation}</span>
          </p>
        </div>

        {/* Double-Move Indicator (when active) */}
        {doubleMoveInProgress && (
          <div style={{
            background: 'rgba(255, 193, 7, 0.2)',
            border: '2px solid #FFD700',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '25px',
            textAlign: 'center'
          }}>
            <strong style={{ fontSize: '18px' }}>🎯 Double-Move Active!</strong>
            <p style={{ margin: '5px 0 0 0', color: '#FFD700' }}>Make your second move</p>
          </div>
        )}

        {/* Double-Move Option (for Mr. X) */}
        {isMrX && doubleMoves > 0 && !doubleMoveInProgress && (
          <div style={{
            background: 'rgba(50, 45, 40, 0.6)',
            border: '2px solid #8B4513',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '25px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer'
            }}>
              <input
                type="checkbox"
                checked={useDoubleMove}
                onChange={(e) => onDoubleMoveToggle(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  cursor: 'pointer',
                  accentColor: '#FFD700'
                }}
              />
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                  🎴 Use Double-Move Card
                </span>
                <span style={{ marginLeft: '10px', color: '#FFD700' }}>
                  ({doubleMoves} remaining)
                </span>
                <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#999' }}>
                  Move twice in a row this turn
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Ticket Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '15px',
          marginBottom: '25px'
        }}>
          {['taxi', 'bus', 'underground'].map(ticketType => {
            const config = TICKET_CONFIG[ticketType];
            const isAvailable = validTickets.includes(ticketType) && currentTickets[ticketType] > 0;

            return (
              <button
                key={ticketType}
                onClick={() => isAvailable && onTicketSelect(ticketType)}
                disabled={!isAvailable}
                style={{
                  background: isAvailable
                    ? `linear-gradient(135deg, ${config.color} 0%, ${config.color}dd 100%)`
                    : 'rgba(80, 80, 80, 0.4)',
                  border: isAvailable
                    ? `3px solid ${config.color}`
                    : '3px solid #555',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: isAvailable ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  opacity: isAvailable ? 1 : 0.4,
                  transform: 'scale(1)',
                  boxShadow: isAvailable
                    ? '0 4px 8px rgba(0, 0, 0, 0.3)'
                    : 'none',
                  color: ticketType === 'taxi' ? '#000' : '#fff',
                  ':hover': {
                    transform: isAvailable ? 'scale(1.05)' : 'scale(1)'
                  }
                }}
                onMouseEnter={(e) => {
                  if (isAvailable) {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = isAvailable
                    ? '0 4px 8px rgba(0, 0, 0, 0.3)'
                    : 'none';
                }}
              >
                <div style={{
                  fontSize: '40px',
                  marginBottom: '10px',
                  textAlign: 'center'
                }}>
                  {config.emoji}
                </div>
                <div style={{
                  fontWeight: 'bold',
                  fontSize: '16px',
                  textAlign: 'center',
                  marginBottom: '5px'
                }}>
                  {config.label}
                </div>
                <div style={{
                  fontSize: '14px',
                  textAlign: 'center',
                  opacity: 0.9
                }}>
                  {currentTickets[ticketType] || 0} remaining
                </div>
              </button>
            );
          })}

          {/* Black Ticket (Mr. X only) */}
          {isMrX && (
            <button
              onClick={() => currentTickets.black > 0 && onTicketSelect('black')}
              disabled={!currentTickets.black}
              style={{
                background: currentTickets.black > 0
                  ? 'linear-gradient(135deg, #1a1a1a 0%, #000 100%)'
                  : 'rgba(80, 80, 80, 0.4)',
                border: currentTickets.black > 0
                  ? '3px solid #FFD700'
                  : '3px solid #555',
                borderRadius: '12px',
                padding: '20px',
                cursor: currentTickets.black > 0 ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
                opacity: currentTickets.black > 0 ? 1 : 0.4,
                transform: 'scale(1)',
                boxShadow: currentTickets.black > 0
                  ? '0 4px 8px rgba(0, 0, 0, 0.3)'
                  : 'none',
                color: '#fff'
              }}
              onMouseEnter={(e) => {
                if (currentTickets.black > 0) {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = currentTickets.black > 0
                  ? '0 4px 8px rgba(0, 0, 0, 0.3)'
                  : 'none';
              }}
            >
              <div style={{
                fontSize: '40px',
                marginBottom: '10px',
                textAlign: 'center'
              }}>
                ⚫
              </div>
              <div style={{
                fontWeight: 'bold',
                fontSize: '16px',
                textAlign: 'center',
                marginBottom: '5px'
              }}>
                Black Ticket
              </div>
              <div style={{
                fontSize: '14px',
                textAlign: 'center',
                opacity: 0.9
              }}>
                {currentTickets.black || 0} remaining
              </div>
            </button>
          )}
        </div>

        {/* Cancel Button */}
        <button
          onClick={onCancel}
          style={{
            width: '100%',
            padding: '15px',
            background: '#6c757d',
            color: '#fff',
            border: '2px solid #8B4513',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#5a6268';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#6c757d';
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

export default TicketSelectionModal;
