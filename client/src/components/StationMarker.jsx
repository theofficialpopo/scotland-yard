/**
 * StationMarker - Authentic Scotland Yard board game station component
 * Renders a station with ticket type indicators matching the classic board game aesthetic
 */

// Authentic Scotland Yard color scheme
const TICKET_COLORS = {
  taxi: '#FDB913',        // Yellow/Gold
  bus: '#00A651',         // Green
  underground: '#DC241F', // London Underground Red
  ferry: '#0098D4'        // Blue
};

const TICKET_ORDER = ['taxi', 'bus', 'underground', 'ferry'];

function StationMarker({
  stationId,
  x,
  y,
  availableTickets = new Set(),
  isSelected = false,
  isReachable = false,
  isCurrent = false,
  onClick
}) {
  const mainRadius = 12;
  const ticketIndicatorRadius = 4;
  const ticketIndicatorDistance = 18; // Distance from center

  // Filter and order available tickets
  const orderedTickets = TICKET_ORDER.filter(type => availableTickets.has(type));

  // Calculate positions for ticket indicators around the station
  const getTicketIndicatorPosition = (index, total) => {
    // Distribute indicators evenly around the circle
    // Start from top (270 degrees) and go clockwise
    const angleOffset = -90; // Start from top
    const angleStep = total === 1 ? 0 : 360 / total;
    const angle = angleOffset + (index * angleStep);
    const radians = (angle * Math.PI) / 180;

    return {
      x: x + Math.cos(radians) * ticketIndicatorDistance,
      y: y + Math.sin(radians) * ticketIndicatorDistance
    };
  };

  // Determine station fill and stroke based on state
  const getStationStyle = () => {
    if (isSelected) {
      return {
        fill: '#4A90E2',
        stroke: '#2E5C8A',
        strokeWidth: 3,
        filter: 'drop-shadow(0px 0px 8px rgba(74, 144, 226, 0.6))'
      };
    }

    if (isCurrent) {
      return {
        fill: '#28a745',
        stroke: '#1e7e34',
        strokeWidth: 3,
        filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.3))'
      };
    }

    if (isReachable) {
      return {
        fill: '#FFF8DC',
        stroke: '#333',
        strokeWidth: 2.5,
        filter: 'drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.25))',
        animation: 'pulse'
      };
    }

    return {
      fill: '#F5F5DC',
      stroke: '#333',
      strokeWidth: 2,
      filter: 'drop-shadow(0px 1px 2px rgba(0, 0, 0, 0.2))'
    };
  };

  const stationStyle = getStationStyle();

  return (
    <g className="station-marker">
      {/* Define filters for drop shadows */}
      <defs>
        <filter id={`station-shadow-${stationId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
          <feOffset dx="0" dy="2" result="offsetblur"/>
          <feComponentTransfer>
            <feFuncA type="linear" slope="0.3"/>
          </feComponentTransfer>
          <feMerge>
            <feMergeNode/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>

        {/* Pulse animation for reachable stations */}
        {isReachable && (
          <style>
            {`
              @keyframes pulse-${stationId} {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
              }
              .pulse-${stationId} {
                animation: pulse-${stationId} 2s ease-in-out infinite;
              }
            `}
          </style>
        )}
      </defs>

      {/* Ticket type indicators */}
      {orderedTickets.map((ticketType, index) => {
        const pos = getTicketIndicatorPosition(index, orderedTickets.length);
        return (
          <g key={`ticket-${ticketType}`}>
            {/* White background for contrast */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={ticketIndicatorRadius + 1}
              fill="#fff"
              stroke="#333"
              strokeWidth="0.5"
              filter={`url(#station-shadow-${stationId})`}
            />
            {/* Colored ticket indicator */}
            <circle
              cx={pos.x}
              cy={pos.y}
              r={ticketIndicatorRadius}
              fill={TICKET_COLORS[ticketType]}
              stroke="#333"
              strokeWidth="1"
            />
          </g>
        );
      })}

      {/* Main station circle */}
      <circle
        cx={x}
        cy={y}
        r={mainRadius}
        fill={stationStyle.fill}
        stroke={stationStyle.stroke}
        strokeWidth={stationStyle.strokeWidth}
        filter={`url(#station-shadow-${stationId})`}
        style={{
          cursor: isReachable ? 'pointer' : 'default',
          transition: 'all 0.2s ease'
        }}
        className={isReachable ? `pulse-${stationId}` : ''}
        onClick={onClick}
      />

      {/* Station number */}
      <text
        x={x}
        y={y}
        fontSize="11"
        fontWeight="bold"
        fontFamily="'Arial', 'Helvetica', sans-serif"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#000"
        stroke="#fff"
        strokeWidth="0.3"
        paintOrder="stroke"
        pointerEvents="none"
        style={{ userSelect: 'none' }}
      >
        {stationId}
      </text>

      {/* Selection ring for selected stations */}
      {isSelected && (
        <circle
          cx={x}
          cy={y}
          r={mainRadius + 4}
          fill="none"
          stroke="#4A90E2"
          strokeWidth="2"
          strokeDasharray="4,2"
          opacity="0.8"
        >
          <animate
            attributeName="r"
            values={`${mainRadius + 4};${mainRadius + 6};${mainRadius + 4}`}
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
      )}
    </g>
  );
}

export default StationMarker;
