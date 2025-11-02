/**
 * SIMPLIFIED TEST MAP for Scotland Yard (Server-side)
 * Smaller map for easier testing with all transport types
 */

import { TICKET_TYPES } from './constants.js';

// Test map with 18 stations
// Layout: Two sides of a river with ferry crossing
export const stations = {
  // WEST SIDE (Left bank)
  1: { x: 200, y: 600, connections: [2, 4] },
  2: { x: 200, y: 450, connections: [1, 3, 5] },
  3: { x: 200, y: 300, connections: [2, 5, 7, 8] },
  4: { x: 350, y: 600, connections: [1, 5] },
  5: { x: 350, y: 450, connections: [2, 3, 4, 6, 17] },
  6: { x: 350, y: 300, connections: [5, 8] },
  7: { x: 200, y: 150, connections: [3, 8] },
  8: { x: 350, y: 150, connections: [3, 6, 7, 15] },

  // EAST SIDE (Right bank - across the river)
  9: { x: 650, y: 600, connections: [10, 12] },
  10: { x: 650, y: 450, connections: [9, 11, 18] },
  11: { x: 650, y: 300, connections: [10, 14, 15] },
  12: { x: 800, y: 600, connections: [9, 13, 14] },
  13: { x: 800, y: 450, connections: [12] },
  14: { x: 800, y: 300, connections: [11, 12, 15, 16] },
  15: { x: 650, y: 150, connections: [8, 11, 14, 16] },
  16: { x: 800, y: 150, connections: [14, 15] },

  // RIVER CROSSING POINTS (Ferry for Mr. X)
  17: { x: 500, y: 450, connections: [5, 18] },
  18: { x: 550, y: 450, connections: [10, 17] }
};

// Connection types between stations
// Format: { from: station, to: station, types: [array of ticket types that work] }
export const connections = [
  // === WEST SIDE NETWORK ===

  // Station 1 (Taxi/Bus hub)
  { from: 1, to: 2, types: [TICKET_TYPES.TAXI] },
  { from: 1, to: 4, types: [TICKET_TYPES.TAXI, TICKET_TYPES.BUS] },

  // Station 2 (Taxi only)
  { from: 2, to: 3, types: [TICKET_TYPES.TAXI] },
  { from: 2, to: 5, types: [TICKET_TYPES.TAXI] },

  // Station 3 (Taxi/Underground hub)
  { from: 3, to: 5, types: [TICKET_TYPES.UNDERGROUND] },
  { from: 3, to: 7, types: [TICKET_TYPES.TAXI] },
  { from: 3, to: 8, types: [TICKET_TYPES.UNDERGROUND] },

  // Station 4 (Taxi only)
  { from: 4, to: 5, types: [TICKET_TYPES.TAXI] },

  // Station 5 (Major hub - Taxi/Bus/Underground)
  { from: 5, to: 6, types: [TICKET_TYPES.BUS] },
  { from: 5, to: 17, types: [TICKET_TYPES.TAXI, TICKET_TYPES.BUS, TICKET_TYPES.UNDERGROUND] },

  // Station 6 (Bus only)
  { from: 6, to: 8, types: [TICKET_TYPES.BUS] },

  // Station 7 (Taxi only)
  { from: 7, to: 8, types: [TICKET_TYPES.TAXI] },

  // Station 8 (Underground only)
  { from: 8, to: 15, types: [TICKET_TYPES.UNDERGROUND] }, // Cross-river underground

  // === RIVER CROSSING (Ferry for Mr. X only) ===
  { from: 17, to: 18, types: [TICKET_TYPES.FERRY] },

  // === EAST SIDE NETWORK ===

  // Station 9 (Taxi only)
  { from: 9, to: 10, types: [TICKET_TYPES.TAXI] },
  { from: 9, to: 12, types: [TICKET_TYPES.TAXI] },

  // Station 10 (Taxi hub)
  { from: 10, to: 11, types: [TICKET_TYPES.TAXI] },
  { from: 10, to: 18, types: [TICKET_TYPES.TAXI, TICKET_TYPES.BUS, TICKET_TYPES.UNDERGROUND] },

  // Station 11 (Taxi/Underground hub)
  { from: 11, to: 14, types: [TICKET_TYPES.UNDERGROUND] },
  { from: 11, to: 15, types: [TICKET_TYPES.TAXI] },

  // Station 12 (Taxi/Bus hub)
  { from: 12, to: 13, types: [TICKET_TYPES.TAXI] },
  { from: 12, to: 14, types: [TICKET_TYPES.BUS] },

  // Station 13 (Taxi only)
  // No longer has bus connections

  // Station 14 (Major hub - Taxi/Bus/Underground)
  { from: 14, to: 15, types: [TICKET_TYPES.UNDERGROUND] },
  { from: 14, to: 16, types: [TICKET_TYPES.TAXI] },

  // Station 15 (Underground only)
  // Already connected to 8, 11, 14

  // Station 16 (Taxi only)
  { from: 16, to: 15, types: [TICKET_TYPES.TAXI] }
];

/**
 * Helper function to check if two stations are connected
 */
export function areStationsConnected(from, to, ticketType) {
  return connections.some(conn =>
    ((conn.from === from && conn.to === to) || (conn.to === from && conn.from === to)) &&
    conn.types.includes(ticketType)
  );
}

/**
 * Get all adjacent stations from a given station
 */
export function getAdjacentStations(stationId) {
  const adjacent = new Set();

  connections.forEach(conn => {
    if (conn.from === stationId) adjacent.add(conn.to);
    if (conn.to === stationId) adjacent.add(conn.from);
  });

  return Array.from(adjacent);
}
