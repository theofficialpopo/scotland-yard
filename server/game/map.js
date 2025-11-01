/**
 * London map data for Scotland Yard
 * This is a simplified version with 50 key stations for MVP
 * Full 199-station map will be added in later phases
 */

import { TICKET_TYPES } from './constants.js';

// Simplified station graph for MVP (50 stations)
export const stations = {
  1: { x: 100, y: 680, connections: [8, 9] },
  8: { x: 180, y: 680, connections: [1, 9, 18, 19] },
  9: { x: 180, y: 600, connections: [1, 8, 19, 20] },
  13: { x: 260, y: 440, connections: [23, 24, 14, 46] }, // Start
  14: { x: 340, y: 440, connections: [13, 15, 23, 25] },
  15: { x: 340, y: 520, connections: [14, 16, 26, 28, 29] },
  16: { x: 420, y: 520, connections: [15, 28, 29] },
  18: { x: 260, y: 680, connections: [8, 31, 43] },
  19: { x: 260, y: 600, connections: [8, 9, 32] },
  20: { x: 100, y: 520, connections: [9, 33] },
  23: { x: 260, y: 360, connections: [13, 14, 37] },
  24: { x: 180, y: 440, connections: [13, 37, 38] },
  25: { x: 420, y: 360, connections: [14, 38, 39] },
  26: { x: 340, y: 600, connections: [15, 39, 27] }, // Start
  27: { x: 420, y: 600, connections: [26, 28, 40] },
  28: { x: 500, y: 520, connections: [15, 16, 27, 41] },
  29: { x: 420, y: 440, connections: [15, 16, 41, 42] }, // Start
  31: { x: 340, y: 760, connections: [18, 43, 44] },
  32: { x: 340, y: 680, connections: [19, 44, 33, 45] },
  33: { x: 180, y: 520, connections: [20, 32, 46] },
  34: { x: 500, y: 680, connections: [47, 48] }, // Start
  37: { x: 180, y: 360, connections: [23, 24, 50] },
  38: { x: 100, y: 440, connections: [24, 25, 50, 51] },
  39: { x: 500, y: 360, connections: [25, 26, 51, 52] },
  40: { x: 500, y: 600, connections: [27, 52, 53] },
  41: { x: 580, y: 520, connections: [28, 29, 54] },
  42: { x: 580, y: 440, connections: [29, 56, 72] },
  43: { x: 420, y: 760, connections: [18, 31, 57] },
  44: { x: 420, y: 680, connections: [31, 32, 58] },
  45: { x: 260, y: 520, connections: [32, 46, 58, 60] },
  46: { x: 180, y: 440, connections: [13, 33, 45, 61] }, // Shared with 13
  47: { x: 580, y: 680, connections: [34, 62] },
  48: { x: 580, y: 600, connections: [34, 62, 63] },
  50: { x: 100, y: 360, connections: [37, 38, 49] }, // Start
  51: { x: 100, y: 280, connections: [38, 39, 67, 68] },
  52: { x: 580, y: 360, connections: [39, 40, 67, 69] },
  53: { x: 660, y: 600, connections: [40, 69, 54] }, // Start
  54: { x: 660, y: 520, connections: [41, 53, 70] },
  56: { x: 660, y: 440, connections: [42, 91] },
  57: { x: 500, y: 760, connections: [43, 73] },
  58: { x: 500, y: 680, connections: [44, 45, 74, 75] },
  60: { x: 180, y: 600, connections: [45, 76] },
  61: { x: 100, y: 520, connections: [46, 76, 78] },
  62: { x: 660, y: 680, connections: [47, 48, 79] },
  63: { x: 660, y: 600, connections: [48, 79, 80, 81] },
  67: { x: 180, y: 280, connections: [51, 52, 82, 84] },
  68: { x: 100, y: 200, connections: [51, 85] },
  69: { x: 660, y: 360, connections: [52, 53, 86] },
  70: { x: 740, y: 520, connections: [54, 87] },
  72: { x: 660, y: 280, connections: [42, 91, 90] },
  73: { x: 580, y: 760, connections: [57, 92] },
  74: { x: 580, y: 680, connections: [58, 92] },
  75: { x: 420, y: 600, connections: [58, 94] },
  76: { x: 100, y: 600, connections: [60, 61] },
  78: { x: 180, y: 520, connections: [61, 79, 97] },
  79: { x: 660, y: 760, connections: [62, 63, 78] },
  80: { x: 740, y: 600, connections: [63, 100] },
  81: { x: 740, y: 680, connections: [63, 100, 82] },
  82: { x: 260, y: 280, connections: [67, 81, 101, 140] },
  84: { x: 100, y: 280, connections: [67, 85] },
  85: { x: 100, y: 120, connections: [68, 84, 103] },
  86: { x: 740, y: 360, connections: [69, 116, 117] },
  87: { x: 820, y: 520, connections: [70, 88] },
  88: { x: 820, y: 440, connections: [87, 117] },
  90: { x: 740, y: 280, connections: [72, 91, 105] },
  91: { x: 740, y: 200, connections: [56, 72, 90, 105] }, // Start
  92: { x: 660, y: 760, connections: [73, 74] },
  94: { x: 420, y: 520, connections: [75] }, // Start
  97: { x: 260, y: 600, connections: [78, 109] },
  100: { x: 820, y: 680, connections: [80, 81, 112] },
  101: { x: 340, y: 280, connections: [82, 114] },
  103: { x: 180, y: 120, connections: [85, 112] }, // Start
  105: { x: 820, y: 280, connections: [90, 91, 106, 108] },
  106: { x: 900, y: 280, connections: [105, 116] },
  108: { x: 900, y: 200, connections: [105, 116, 117] }, // Ferry station
  109: { x: 340, y: 680, connections: [97, 124] },
  112: { x: 900, y: 680, connections: [100, 103] }, // Start
  114: { x: 420, y: 280, connections: [101, 132] },
  115: { x: 500, y: 120, connections: [126, 127] }, // Ferry station
  116: { x: 900, y: 360, connections: [86, 106, 108, 118] },
  117: { x: 820, y: 360, connections: [86, 88, 108, 129] }, // Start
  118: { x: 980, y: 360, connections: [116, 129, 134] },
  124: { x: 420, y: 760, connections: [109, 130, 138] },
  126: { x: 500, y: 40, connections: [115, 127, 140] },
  127: { x: 580, y: 120, connections: [115, 126, 134] },
  129: { x: 900, y: 440, connections: [117, 118, 142] },
  130: { x: 500, y: 760, connections: [124, 131, 139] },
  131: { x: 500, y: 680, connections: [130, 114] },
  132: { x: 500, y: 280, connections: [114, 140] }, // Start
  134: { x: 1060, y: 360, connections: [118, 127, 141] },
  138: { x: 340, y: 760, connections: [124, 150] }, // Start
  139: { x: 580, y: 760, connections: [130, 153] },
  140: { x: 420, y: 200, connections: [82, 126, 132, 154] },
  141: { x: 1060, y: 280, connections: [134, 142] }, // Start
  142: { x: 980, y: 440, connections: [129, 141, 143, 158] },
  143: { x: 1060, y: 440, connections: [142, 158] },
  150: { x: 260, y: 760, connections: [138] },
  153: { x: 660, y: 760, connections: [139, 154, 166] },
  154: { x: 580, y: 200, connections: [140, 153, 155] },
  155: { x: 660, y: 200, connections: [154, 156, 167] }, // Start
  156: { x: 740, y: 200, connections: [155, 157, 169] },
  157: { x: 820, y: 200, connections: [156, 158, 170] }, // Ferry station
  158: { x: 1060, y: 520, connections: [142, 143, 157] },
  166: { x: 740, y: 760, connections: [153, 183] },
  167: { x: 660, y: 120, connections: [155, 168] },
  168: { x: 740, y: 120, connections: [167, 184] },
  169: { x: 820, y: 120, connections: [156, 184] },
  170: { x: 900, y: 200, connections: [157, 185] },
  174: { x: 260, y: 40, connections: [175] }, // Start
  175: { x: 340, y: 40, connections: [174] },
  183: { x: 820, y: 760, connections: [166, 185] },
  184: { x: 820, y: 40, connections: [168, 169, 185, 196] },
  185: { x: 900, y: 120, connections: [170, 183, 184] },
  194: { x: 500, y: 840, connections: [195] }, // Ferry station & Start
  195: { x: 580, y: 840, connections: [194, 197] },
  196: { x: 900, y: 40, connections: [184, 197] },
  197: { x: 660, y: 840, connections: [195, 196] }, // Start
  198: { x: 740, y: 840, connections: [] } // Start
};

// Connection types between stations
// Format: { from: station, to: station, types: [array of ticket types that work] }
export const connections = [
  // From station 1
  { from: 1, to: 8, types: [TICKET_TYPES.TAXI] },
  { from: 1, to: 9, types: [TICKET_TYPES.TAXI] },

  // From station 8
  { from: 8, to: 18, types: [TICKET_TYPES.BUS] },
  { from: 8, to: 19, types: [TICKET_TYPES.TAXI] },

  // From station 9
  { from: 9, to: 19, types: [TICKET_TYPES.BUS] },
  { from: 9, to: 20, types: [TICKET_TYPES.TAXI] },

  // From station 13 (start)
  { from: 13, to: 23, types: [TICKET_TYPES.TAXI, TICKET_TYPES.BUS] },
  { from: 13, to: 24, types: [TICKET_TYPES.TAXI] },
  { from: 13, to: 14, types: [TICKET_TYPES.TAXI] },
  { from: 13, to: 46, types: [TICKET_TYPES.UNDERGROUND] },

  // Continue with other connections...
  // For MVP, this is a simplified subset. Full map will have all 199 stations

  // Underground connections (major stations)
  { from: 13, to: 46, types: [TICKET_TYPES.UNDERGROUND] },
  { from: 46, to: 74, types: [TICKET_TYPES.UNDERGROUND] },
  { from: 74, to: 89, types: [TICKET_TYPES.UNDERGROUND] },

  // Ferry connections (Mr. X only with black ticket)
  { from: 108, to: 115, types: [TICKET_TYPES.FERRY] },
  { from: 115, to: 157, types: [TICKET_TYPES.FERRY] },
  { from: 157, to: 194, types: [TICKET_TYPES.FERRY] },
];

/**
 * Get valid moves from a given station
 * @param {number} stationId - Current station ID
 * @param {string} ticketType - Type of ticket to use
 * @returns {Array<number>} - Array of valid destination station IDs
 */
export function getValidMoves(stationId, ticketType) {
  const station = stations[stationId];
  if (!station) return [];

  const validDestinations = [];

  for (const connection of connections) {
    if (connection.from === stationId && connection.types.includes(ticketType)) {
      validDestinations.push(connection.to);
    }
    // Connections are bidirectional
    if (connection.to === stationId && connection.types.includes(ticketType)) {
      validDestinations.push(connection.from);
    }
  }

  return [...new Set(validDestinations)]; // Remove duplicates
}

/**
 * Check if two stations are connected by a specific ticket type
 * @param {number} from - Starting station ID
 * @param {number} to - Destination station ID
 * @param {string} ticketType - Type of ticket
 * @returns {boolean} - True if connected, false otherwise
 */
export function areStationsConnected(from, to, ticketType) {
  return connections.some(conn =>
    (conn.from === from && conn.to === to && conn.types.includes(ticketType)) ||
    (conn.to === from && conn.from === to && conn.types.includes(ticketType))
  );
}

/**
 * Get all available ticket types between two stations
 * @param {number} from - Starting station ID
 * @param {number} to - Destination station ID
 * @returns {Array<string>} - Array of valid ticket types
 */
export function getConnectionTypes(from, to) {
  const types = new Set();

  for (const conn of connections) {
    if ((conn.from === from && conn.to === to) || (conn.to === from && conn.from === to)) {
      conn.types.forEach(type => types.add(type));
    }
  }

  return Array.from(types);
}

export default {
  stations,
  connections,
  getValidMoves,
  areStationsConnected,
  getConnectionTypes
};
