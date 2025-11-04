/**
 * StationSymbol Component
 *
 * Renders authentic Scotland Yard station symbols using SVG
 * Based on the classic Ravensburger board game design
 *
 * Symbol structure:
 * - Top: Semicircle (colored by available modes)
 * - Bottom: Rectangle (colored by available modes)
 * - Station number in center
 */

// Scotland Yard authentic colors
const COLORS = {
  TAXI: '#F9D71C',      // Yellow for taxi
  BUS: '#86BC25',       // Green for bus
  UNDERGROUND: '#E63946' // Red for underground
};

/**
 * Get station symbol configuration based on transport types
 * @param {Array} types - Array of transport types: ['taxi', 'bus', 'underground']
 */
export function getStationSymbol(types) {
  const hasUnderground = types.includes('underground');
  const hasBus = types.includes('bus');
  const hasTaxi = types.includes('taxi');

  // Determine colors for semicircle and rectangle based on available modes
  let semicircleColor = COLORS.TAXI; // Default
  let rectangleColor = COLORS.TAXI;  // Default
  let type = 'taxi';
  let label = 'Taxi Only';
  let size = 14;
  let zIndex = 10;

  // Underground + Bus + Taxi (all three modes)
  if (hasUnderground && hasBus && hasTaxi) {
    semicircleColor = COLORS.UNDERGROUND; // Red top
    rectangleColor = COLORS.UNDERGROUND;  // Red bottom
    type = 'underground-bus-taxi';
    label = 'Underground + Bus + Taxi';
    size = 18;
    zIndex = 30;
  }
  // Bus + Taxi (two modes)
  else if (hasBus && hasTaxi) {
    semicircleColor = COLORS.BUS;  // Green top
    rectangleColor = COLORS.BUS;   // Green bottom
    type = 'bus-taxi';
    label = 'Bus + Taxi';
    size = 16;
    zIndex = 20;
  }
  // Taxi only (one mode)
  else if (hasTaxi) {
    semicircleColor = COLORS.TAXI; // Yellow top
    rectangleColor = COLORS.TAXI;  // Yellow bottom
    type = 'taxi';
    label = 'Taxi Only';
    size = 14;
    zIndex = 10;
  }

  return {
    type,
    semicircleColor,
    rectangleColor,
    label,
    size,
    zIndex
  };
}

/**
 * StationSymbol Component - Renders authentic Scotland Yard symbols
 *
 * Symbol design (as seen in real Scotland Yard board):
 * - Top: Semicircle (half circle on top)
 * - Bottom: Small rectangle in center
 * - Colors indicate available transport modes
 */
export default function StationSymbol({ station, isHovered = false }) {
  const symbol = getStationSymbol(station.types || ['taxi']);
  const scale = isHovered ? 1.4 : 1;
  const baseSize = symbol.size;
  const size = baseSize * scale;

  // Authentic Scotland Yard symbol: Semicircle top + Rectangle bottom
  return (
    <svg
      width={size * 2.2}
      height={size * 2.4}
      viewBox="0 0 100 110"
      style={{
        cursor: 'pointer',
        filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Top Semicircle - colored by transport type */}
      <path
        d="M 20,50 A 30,30 0 0,1 80,50 Z"
        fill={symbol.semicircleColor}
        stroke="#1a1a1a"
        strokeWidth="2.5"
      />

      {/* Bottom Rectangle - colored by transport type */}
      <rect
        x="35"
        y="50"
        width="30"
        height="40"
        fill={symbol.rectangleColor}
        stroke="#1a1a1a"
        strokeWidth="2.5"
        rx="2"
      />

      {/* White background circle for station number */}
      <circle
        cx="50"
        cy="55"
        r="18"
        fill="#FFFFFF"
        stroke="none"
      />

      {/* Station number */}
      <text
        x="50"
        y="60"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#1a1a1a"
        fontSize="18"
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        style={{ pointerEvents: 'none' }}
      >
        {station.id}
      </text>
    </svg>
  );
}
