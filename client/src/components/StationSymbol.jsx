/**
 * StationSymbol Component
 *
 * Renders authentic Scotland Yard station symbols using SVG
 * Based on the classic Ravensburger board game design
 */

/**
 * Get station symbol configuration based on transport types
 * @param {Array} types - Array of transport types: ['taxi', 'bus', 'underground']
 */
export function getStationSymbol(types) {
  const hasUnderground = types.includes('underground');
  const hasBus = types.includes('bus');
  const hasTaxi = types.includes('taxi');

  // Underground + Bus + Taxi (all three)
  if (hasUnderground && hasBus && hasTaxi) {
    return {
      type: 'underground-bus-taxi',
      color: '#E63946', // Red for underground
      secondaryColor: '#2A9D8F', // Green for bus
      shape: 'circle-with-square',
      label: 'Underground + Bus + Taxi',
      size: 18,
      zIndex: 30
    };
  }

  // Bus + Taxi (no underground)
  if (hasBus && hasTaxi) {
    return {
      type: 'bus-taxi',
      color: '#2A9D8F', // Green for bus
      shape: 'square',
      label: 'Bus + Taxi',
      size: 15,
      zIndex: 20
    };
  }

  // Taxi only
  return {
    type: 'taxi',
    color: '#F4A261', // Yellow/Orange for taxi
    shape: 'circle',
    label: 'Taxi Only',
    size: 12,
    zIndex: 10
  };
}

/**
 * StationSymbol Component - Renders SVG symbols
 */
export default function StationSymbol({ station, isHovered = false }) {
  const symbol = getStationSymbol(station.types || ['taxi']);
  const scale = isHovered ? 1.4 : 1;
  const baseSize = symbol.size;
  const size = baseSize * scale;

  // Underground + Bus + Taxi (Circle with inner dot + Square overlay)
  if (symbol.type === 'underground-bus-taxi') {
    return (
      <svg
        width={size * 2}
        height={size * 2}
        style={{
          cursor: 'pointer',
          filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Outer circle (Underground - Red) */}
        <circle
          cx={size}
          cy={size}
          r={size * 0.85}
          fill={symbol.color}
          stroke="#8B0000"
          strokeWidth="2.5"
        />

        {/* Inner dot (Underground indicator) */}
        <circle
          cx={size}
          cy={size}
          r={size * 0.25}
          fill="#FFFFFF"
          stroke="none"
        />

        {/* Small square in corner (Bus indicator - Green) */}
        <rect
          x={size * 1.3}
          y={size * 0.3}
          width={size * 0.6}
          height={size * 0.6}
          fill={symbol.secondaryColor}
          stroke="#1B5E4F"
          strokeWidth="1.5"
          rx="2"
        />

        {/* Station number */}
        <text
          x={size}
          y={size + (size * 0.05)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize={size * 0.45}
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          style={{ pointerEvents: 'none' }}
        >
          {station.id}
        </text>
      </svg>
    );
  }

  // Bus + Taxi (Square - Green)
  if (symbol.type === 'bus-taxi') {
    return (
      <svg
        width={size * 2}
        height={size * 2}
        style={{
          cursor: 'pointer',
          filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
          transition: 'all 0.2s ease'
        }}
      >
        {/* Square (Bus - Green) */}
        <rect
          x={size * 0.2}
          y={size * 0.2}
          width={size * 1.6}
          height={size * 1.6}
          fill={symbol.color}
          stroke="#1B5E4F"
          strokeWidth="2.5"
          rx="3"
        />

        {/* Station number */}
        <text
          x={size}
          y={size + (size * 0.05)}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#FFFFFF"
          fontSize={size * 0.5}
          fontWeight="bold"
          fontFamily="Arial, sans-serif"
          style={{ pointerEvents: 'none' }}
        >
          {station.id}
        </text>
      </svg>
    );
  }

  // Taxi only (Circle - Yellow/Orange)
  return (
    <svg
      width={size * 2}
      height={size * 2}
      style={{
        cursor: 'pointer',
        filter: isHovered ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))' : 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
        transition: 'all 0.2s ease'
      }}
    >
      {/* Circle (Taxi - Yellow/Orange) */}
      <circle
        cx={size}
        cy={size}
        r={size * 0.85}
        fill={symbol.color}
        stroke="#D68A45"
        strokeWidth="2"
      />

      {/* Station number */}
      <text
        x={size}
        y={size + (size * 0.05)}
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#FFFFFF"
        fontSize={size * 0.55}
        fontWeight="bold"
        fontFamily="Arial, sans-serif"
        style={{ pointerEvents: 'none' }}
      >
        {station.id}
      </text>
    </svg>
  );
}
