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
// Connections are bidirectional by default (checked in helper functions)
export const connections = [
  // Station 1 connections
  { from: 1, to: 8, types: [TICKET_TYPES.TAXI] },
  { from: 1, to: 9, types: [TICKET_TYPES.TAXI] },

  // Station 8 connections
  { from: 8, to: 9, types: [TICKET_TYPES.TAXI] },
  { from: 8, to: 18, types: [TICKET_TYPES.BUS] },
  { from: 8, to: 19, types: [TICKET_TYPES.TAXI] },

  // Station 9 connections
  { from: 9, to: 19, types: [TICKET_TYPES.BUS] },
  { from: 9, to: 20, types: [TICKET_TYPES.TAXI] },

  // Station 13 (start) connections
  { from: 13, to: 23, types: [TICKET_TYPES.TAXI, TICKET_TYPES.BUS] },
  { from: 13, to: 24, types: [TICKET_TYPES.TAXI] },
  { from: 13, to: 14, types: [TICKET_TYPES.TAXI] },
  { from: 13, to: 46, types: [TICKET_TYPES.UNDERGROUND] },

  // Station 14 connections
  { from: 14, to: 15, types: [TICKET_TYPES.TAXI] },
  { from: 14, to: 23, types: [TICKET_TYPES.TAXI] },
  { from: 14, to: 25, types: [TICKET_TYPES.BUS] },

  // Station 15 connections
  { from: 15, to: 16, types: [TICKET_TYPES.TAXI] },
  { from: 15, to: 26, types: [TICKET_TYPES.BUS] },
  { from: 15, to: 28, types: [TICKET_TYPES.BUS] },
  { from: 15, to: 29, types: [TICKET_TYPES.TAXI] },

  // Station 16 connections
  { from: 16, to: 28, types: [TICKET_TYPES.TAXI] },
  { from: 16, to: 29, types: [TICKET_TYPES.TAXI] },

  // Station 18 connections
  { from: 18, to: 31, types: [TICKET_TYPES.TAXI] },
  { from: 18, to: 43, types: [TICKET_TYPES.TAXI] },

  // Station 19 connections
  { from: 19, to: 32, types: [TICKET_TYPES.TAXI] },

  // Station 20 connections
  { from: 20, to: 33, types: [TICKET_TYPES.TAXI] },

  // Station 23 connections
  { from: 23, to: 37, types: [TICKET_TYPES.TAXI] },

  // Station 24 connections
  { from: 24, to: 37, types: [TICKET_TYPES.BUS] },
  { from: 24, to: 38, types: [TICKET_TYPES.TAXI] },

  // Station 25 connections
  { from: 25, to: 38, types: [TICKET_TYPES.BUS] },
  { from: 25, to: 39, types: [TICKET_TYPES.TAXI] },

  // Station 26 (start) connections
  { from: 26, to: 27, types: [TICKET_TYPES.TAXI] },
  { from: 26, to: 39, types: [TICKET_TYPES.BUS] },

  // Station 27 connections
  { from: 27, to: 28, types: [TICKET_TYPES.TAXI] },
  { from: 27, to: 40, types: [TICKET_TYPES.TAXI] },

  // Station 28 connections
  { from: 28, to: 41, types: [TICKET_TYPES.TAXI] },

  // Station 29 (start) connections
  { from: 29, to: 41, types: [TICKET_TYPES.TAXI] },
  { from: 29, to: 42, types: [TICKET_TYPES.BUS] },

  // Station 31 connections
  { from: 31, to: 43, types: [TICKET_TYPES.TAXI] },
  { from: 31, to: 44, types: [TICKET_TYPES.TAXI] },

  // Station 32 connections
  { from: 32, to: 33, types: [TICKET_TYPES.TAXI] },
  { from: 32, to: 44, types: [TICKET_TYPES.TAXI] },
  { from: 32, to: 45, types: [TICKET_TYPES.TAXI] },

  // Station 33 connections
  { from: 33, to: 46, types: [TICKET_TYPES.TAXI] },

  // Station 34 (start) connections
  { from: 34, to: 47, types: [TICKET_TYPES.TAXI] },
  { from: 34, to: 48, types: [TICKET_TYPES.TAXI] },

  // Station 37 connections
  { from: 37, to: 50, types: [TICKET_TYPES.TAXI] },

  // Station 38 connections
  { from: 38, to: 50, types: [TICKET_TYPES.TAXI] },
  { from: 38, to: 51, types: [TICKET_TYPES.BUS] },

  // Station 39 connections
  { from: 39, to: 51, types: [TICKET_TYPES.TAXI] },
  { from: 39, to: 52, types: [TICKET_TYPES.TAXI] },

  // Station 40 connections
  { from: 40, to: 52, types: [TICKET_TYPES.BUS] },
  { from: 40, to: 53, types: [TICKET_TYPES.TAXI] },

  // Station 41 connections
  { from: 41, to: 54, types: [TICKET_TYPES.TAXI] },

  // Station 42 connections
  { from: 42, to: 56, types: [TICKET_TYPES.TAXI] },
  { from: 42, to: 72, types: [TICKET_TYPES.BUS] },

  // Station 43 connections
  { from: 43, to: 57, types: [TICKET_TYPES.TAXI] },

  // Station 44 connections
  { from: 44, to: 58, types: [TICKET_TYPES.TAXI] },

  // Station 45 connections
  { from: 45, to: 46, types: [TICKET_TYPES.TAXI] },
  { from: 45, to: 58, types: [TICKET_TYPES.BUS] },
  { from: 45, to: 60, types: [TICKET_TYPES.TAXI] },

  // Station 46 connections
  { from: 46, to: 61, types: [TICKET_TYPES.TAXI] },

  // Station 47 connections
  { from: 47, to: 62, types: [TICKET_TYPES.TAXI] },

  // Station 48 connections
  { from: 48, to: 62, types: [TICKET_TYPES.BUS] },
  { from: 48, to: 63, types: [TICKET_TYPES.TAXI] },

  // Station 50 (start) connections
  { from: 50, to: 49, types: [TICKET_TYPES.TAXI] },

  // Station 51 connections
  { from: 51, to: 67, types: [TICKET_TYPES.TAXI] },
  { from: 51, to: 68, types: [TICKET_TYPES.TAXI] },

  // Station 52 connections
  { from: 52, to: 67, types: [TICKET_TYPES.BUS] },
  { from: 52, to: 69, types: [TICKET_TYPES.TAXI] },

  // Station 53 (start) connections
  { from: 53, to: 54, types: [TICKET_TYPES.TAXI] },
  { from: 53, to: 69, types: [TICKET_TYPES.BUS] },

  // Station 54 connections
  { from: 54, to: 70, types: [TICKET_TYPES.TAXI] },

  // Station 56 connections
  { from: 56, to: 91, types: [TICKET_TYPES.BUS] },

  // Station 57 connections
  { from: 57, to: 73, types: [TICKET_TYPES.TAXI] },

  // Station 58 connections
  { from: 58, to: 74, types: [TICKET_TYPES.BUS] },
  { from: 58, to: 75, types: [TICKET_TYPES.TAXI] },

  // Station 60 connections
  { from: 60, to: 76, types: [TICKET_TYPES.TAXI] },

  // Station 61 connections
  { from: 61, to: 76, types: [TICKET_TYPES.TAXI] },
  { from: 61, to: 78, types: [TICKET_TYPES.BUS] },

  // Station 62 connections
  { from: 62, to: 79, types: [TICKET_TYPES.TAXI] },

  // Station 63 connections
  { from: 63, to: 79, types: [TICKET_TYPES.TAXI] },
  { from: 63, to: 80, types: [TICKET_TYPES.TAXI] },
  { from: 63, to: 81, types: [TICKET_TYPES.BUS] },

  // Station 67 connections
  { from: 67, to: 82, types: [TICKET_TYPES.TAXI] },
  { from: 67, to: 84, types: [TICKET_TYPES.TAXI] },

  // Station 68 connections
  { from: 68, to: 85, types: [TICKET_TYPES.TAXI] },

  // Station 69 connections
  { from: 69, to: 86, types: [TICKET_TYPES.TAXI] },

  // Station 70 connections
  { from: 70, to: 87, types: [TICKET_TYPES.TAXI] },

  // Station 72 connections
  { from: 72, to: 90, types: [TICKET_TYPES.TAXI] },
  { from: 72, to: 91, types: [TICKET_TYPES.BUS] },

  // Station 73 connections
  { from: 73, to: 92, types: [TICKET_TYPES.TAXI] },

  // Station 74 connections
  { from: 74, to: 92, types: [TICKET_TYPES.TAXI] },

  // Station 75 connections
  { from: 75, to: 94, types: [TICKET_TYPES.TAXI] },

  // Station 76 connections (no new connections, already defined)

  // Station 78 connections
  { from: 78, to: 79, types: [TICKET_TYPES.TAXI] },
  { from: 78, to: 97, types: [TICKET_TYPES.BUS] },

  // Station 79 connections (all already defined)

  // Station 80 connections
  { from: 80, to: 100, types: [TICKET_TYPES.TAXI] },

  // Station 81 connections
  { from: 81, to: 82, types: [TICKET_TYPES.BUS] },
  { from: 81, to: 100, types: [TICKET_TYPES.TAXI] },

  // Station 82 connections
  { from: 82, to: 101, types: [TICKET_TYPES.TAXI] },
  { from: 82, to: 140, types: [TICKET_TYPES.UNDERGROUND] },

  // Station 84 connections
  { from: 84, to: 85, types: [TICKET_TYPES.TAXI] },

  // Station 85 connections
  { from: 85, to: 103, types: [TICKET_TYPES.TAXI] },

  // Station 86 connections
  { from: 86, to: 116, types: [TICKET_TYPES.BUS] },
  { from: 86, to: 117, types: [TICKET_TYPES.TAXI] },

  // Station 87 connections
  { from: 87, to: 88, types: [TICKET_TYPES.TAXI] },

  // Station 88 connections
  { from: 88, to: 117, types: [TICKET_TYPES.BUS] },

  // Station 90 connections
  { from: 90, to: 91, types: [TICKET_TYPES.TAXI] },
  { from: 90, to: 105, types: [TICKET_TYPES.TAXI] },

  // Station 91 (start) connections
  { from: 91, to: 105, types: [TICKET_TYPES.TAXI] },

  // Station 92 connections (all already defined)

  // Station 94 (start) connections (all already defined)

  // Station 97 connections
  { from: 97, to: 109, types: [TICKET_TYPES.TAXI] },

  // Station 100 connections
  { from: 100, to: 112, types: [TICKET_TYPES.TAXI] },

  // Station 101 connections
  { from: 101, to: 114, types: [TICKET_TYPES.TAXI] },

  // Station 103 (start) connections
  { from: 103, to: 112, types: [TICKET_TYPES.BUS] },

  // Station 105 connections
  { from: 105, to: 106, types: [TICKET_TYPES.TAXI] },
  { from: 105, to: 108, types: [TICKET_TYPES.TAXI] },

  // Station 106 connections
  { from: 106, to: 116, types: [TICKET_TYPES.TAXI] },

  // Station 108 connections
  { from: 108, to: 116, types: [TICKET_TYPES.TAXI] },
  { from: 108, to: 117, types: [TICKET_TYPES.BUS] },

  // Station 109 connections
  { from: 109, to: 124, types: [TICKET_TYPES.TAXI] },

  // Station 112 (start) connections (all already defined)

  // Station 114 connections
  { from: 114, to: 132, types: [TICKET_TYPES.TAXI] },

  // Station 115 connections
  { from: 115, to: 126, types: [TICKET_TYPES.TAXI] },
  { from: 115, to: 127, types: [TICKET_TYPES.TAXI] },

  // Station 116 connections
  { from: 116, to: 118, types: [TICKET_TYPES.TAXI] },

  // Station 117 (start) connections
  { from: 117, to: 129, types: [TICKET_TYPES.TAXI] },

  // Station 118 connections
  { from: 118, to: 129, types: [TICKET_TYPES.BUS] },
  { from: 118, to: 134, types: [TICKET_TYPES.TAXI] },

  // Station 124 connections
  { from: 124, to: 130, types: [TICKET_TYPES.TAXI] },
  { from: 124, to: 138, types: [TICKET_TYPES.BUS] },

  // Station 126 connections
  { from: 126, to: 127, types: [TICKET_TYPES.TAXI] },
  { from: 126, to: 140, types: [TICKET_TYPES.BUS] },

  // Station 127 connections
  { from: 127, to: 134, types: [TICKET_TYPES.TAXI] },

  // Station 129 connections
  { from: 129, to: 142, types: [TICKET_TYPES.TAXI] },

  // Station 130 connections
  { from: 130, to: 131, types: [TICKET_TYPES.TAXI] },
  { from: 130, to: 139, types: [TICKET_TYPES.TAXI] },

  // Station 131 connections
  { from: 131, to: 114, types: [TICKET_TYPES.BUS] },

  // Station 132 (start) connections
  { from: 132, to: 140, types: [TICKET_TYPES.TAXI] },

  // Station 134 connections
  { from: 134, to: 141, types: [TICKET_TYPES.TAXI] },

  // Station 138 (start) connections
  { from: 138, to: 150, types: [TICKET_TYPES.TAXI] },

  // Station 139 connections
  { from: 139, to: 153, types: [TICKET_TYPES.TAXI] },

  // Station 140 connections
  { from: 140, to: 154, types: [TICKET_TYPES.TAXI] },

  // Station 141 (start) connections
  { from: 141, to: 142, types: [TICKET_TYPES.TAXI] },

  // Station 142 connections
  { from: 142, to: 143, types: [TICKET_TYPES.TAXI] },
  { from: 142, to: 158, types: [TICKET_TYPES.BUS] },

  // Station 143 connections
  { from: 143, to: 158, types: [TICKET_TYPES.TAXI] },

  // Station 150 connections (all already defined)

  // Station 153 connections
  { from: 153, to: 154, types: [TICKET_TYPES.TAXI] },
  { from: 153, to: 166, types: [TICKET_TYPES.TAXI] },

  // Station 154 connections
  { from: 154, to: 155, types: [TICKET_TYPES.TAXI] },

  // Station 155 (start) connections
  { from: 155, to: 156, types: [TICKET_TYPES.TAXI] },
  { from: 155, to: 167, types: [TICKET_TYPES.BUS] },

  // Station 156 connections
  { from: 156, to: 157, types: [TICKET_TYPES.TAXI] },
  { from: 156, to: 169, types: [TICKET_TYPES.TAXI] },

  // Station 157 connections
  { from: 157, to: 158, types: [TICKET_TYPES.TAXI] },
  { from: 157, to: 170, types: [TICKET_TYPES.BUS] },

  // Station 158 connections (all already defined)

  // Station 166 connections
  { from: 166, to: 183, types: [TICKET_TYPES.TAXI] },

  // Station 167 connections
  { from: 167, to: 168, types: [TICKET_TYPES.TAXI] },

  // Station 168 connections
  { from: 168, to: 184, types: [TICKET_TYPES.TAXI] },

  // Station 169 connections
  { from: 169, to: 184, types: [TICKET_TYPES.TAXI] },

  // Station 170 connections
  { from: 170, to: 185, types: [TICKET_TYPES.TAXI] },

  // Station 174 (start) connections
  { from: 174, to: 175, types: [TICKET_TYPES.TAXI] },

  // Station 175 connections (all already defined)

  // Station 183 connections
  { from: 183, to: 185, types: [TICKET_TYPES.TAXI] },

  // Station 184 connections
  { from: 184, to: 185, types: [TICKET_TYPES.TAXI] },
  { from: 184, to: 196, types: [TICKET_TYPES.BUS] },

  // Station 185 connections (all already defined)

  // Station 194 (start) connections
  { from: 194, to: 195, types: [TICKET_TYPES.TAXI] },

  // Station 195 connections
  { from: 195, to: 197, types: [TICKET_TYPES.TAXI] },

  // Station 196 connections
  { from: 196, to: 197, types: [TICKET_TYPES.TAXI] },

  // Station 197 (start) connections (all already defined)

  // Underground connections (major hubs)
  { from: 13, to: 46, types: [TICKET_TYPES.UNDERGROUND] },
  { from: 46, to: 74, types: [TICKET_TYPES.UNDERGROUND] },
  { from: 74, to: 89, types: [TICKET_TYPES.UNDERGROUND] },
  { from: 89, to: 128, types: [TICKET_TYPES.UNDERGROUND] },
  { from: 67, to: 111, types: [TICKET_TYPES.UNDERGROUND] },
  { from: 111, to: 153, types: [TICKET_TYPES.UNDERGROUND] },

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
