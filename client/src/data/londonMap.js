/**
 * SIMPLIFIED TEST MAP for Scotland Yard
 * Smaller map for easier testing with all transport types
 */

// Test map with 18 stations showing all transport types
// Layout: Two sides of a river with ferry crossing
export const stations = {
  // WEST SIDE (Left bank)
  1: { x: 200, y: 600 },   // Taxi/Bus hub
  2: { x: 200, y: 450 },   // Taxi only
  3: { x: 200, y: 300 },   // Taxi/Underground hub
  4: { x: 350, y: 600 },   // Taxi only
  5: { x: 350, y: 450 },   // Taxi/Bus/Underground hub (major)
  6: { x: 350, y: 300 },   // Bus only
  7: { x: 200, y: 150 },   // Taxi only
  8: { x: 350, y: 150 },   // Underground only

  // EAST SIDE (Right bank - across the river)
  9: { x: 650, y: 600 },   // Taxi only
  10: { x: 650, y: 450 },  // Taxi/Bus hub
  11: { x: 650, y: 300 },  // Taxi/Underground hub
  12: { x: 800, y: 600 },  // Taxi/Bus hub
  13: { x: 800, y: 450 },  // Bus only
  14: { x: 800, y: 300 },  // Taxi/Bus/Underground hub (major)
  15: { x: 650, y: 150 },  // Underground only
  16: { x: 800, y: 150 },  // Taxi only

  // RIVER CROSSING POINTS (Ferry for Mr. X)
  17: { x: 500, y: 450 },  // West ferry dock
  18: { x: 550, y: 450 }   // East ferry dock
};

// Simplified connection network for testing
// Connections are bidirectional by default
export const connections = [
  // === WEST SIDE NETWORK ===

  // Station 1 (Taxi/Bus hub)
  { from: 1, to: 2, types: ['taxi'] },
  { from: 1, to: 4, types: ['taxi', 'bus'] },

  // Station 2 (Taxi only)
  { from: 2, to: 3, types: ['taxi'] },
  { from: 2, to: 5, types: ['taxi'] },

  // Station 3 (Taxi/Underground hub)
  { from: 3, to: 5, types: ['underground'] },
  { from: 3, to: 7, types: ['taxi'] },
  { from: 3, to: 8, types: ['underground'] },

  // Station 4 (Taxi only)
  { from: 4, to: 5, types: ['taxi'] },

  // Station 5 (Major hub - Taxi/Bus/Underground)
  { from: 5, to: 6, types: ['bus'] },
  { from: 5, to: 17, types: ['taxi', 'bus', 'underground'] },

  // Station 6 (Bus only)
  { from: 6, to: 8, types: ['bus'] },

  // Station 7 (Taxi only)
  { from: 7, to: 8, types: ['taxi'] },

  // Station 8 (Underground only)
  { from: 8, to: 15, types: ['underground'] }, // Cross-river underground

  // === RIVER CROSSING (Ferry for Mr. X only) ===
  { from: 17, to: 18, types: ['ferry'] },

  // === EAST SIDE NETWORK ===

  // Station 9 (Taxi only)
  { from: 9, to: 10, types: ['taxi'] },
  { from: 9, to: 12, types: ['taxi'] },

  // Station 10 (Taxi/Bus hub)
  { from: 10, to: 11, types: ['taxi'] },
  { from: 10, to: 13, types: ['bus'] },
  { from: 10, to: 18, types: ['taxi', 'bus', 'underground'] },

  // Station 11 (Taxi/Underground hub)
  { from: 11, to: 14, types: ['underground'] },
  { from: 11, to: 15, types: ['taxi'] },

  // Station 12 (Taxi/Bus hub)
  { from: 12, to: 13, types: ['taxi', 'bus'] },

  // Station 13 (Bus only)
  { from: 13, to: 14, types: ['bus'] },

  // Station 14 (Major hub - Taxi/Bus/Underground)
  { from: 14, to: 15, types: ['underground'] },
  { from: 14, to: 16, types: ['taxi'] },

  // Station 15 (Underground only)
  // Already connected to 8, 11, 14

  // Station 16 (Taxi only)
  { from: 16, to: 15, types: ['taxi'] }
];

/**
 * Calculate available ticket types for each station
 * Returns a Map of stationId => Set of ticket types
 */
export function getStationTicketTypes() {
  const stationTickets = new Map();

  // Initialize all stations with empty sets
  Object.keys(stations).forEach(stationId => {
    stationTickets.set(parseInt(stationId), new Set());
  });

  // Iterate through connections and add ticket types
  connections.forEach(conn => {
    const fromId = conn.from;
    const toId = conn.to;

    // Connections are bidirectional
    conn.types.forEach(type => {
      if (stationTickets.has(fromId)) {
        stationTickets.get(fromId).add(type);
      }
      if (stationTickets.has(toId)) {
        stationTickets.get(toId).add(type);
      }
    });
  });

  return stationTickets;
}

// Pre-calculate and export station ticket types
export const stationTicketTypes = getStationTicketTypes();
