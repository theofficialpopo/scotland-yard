/**
 * Simplified London map data for Scotland Yard (client-side)
 * Matches server-side map.js
 */

// Simplified station positions (50 key stations for MVP)
export const stations = {
  1: { x: 100, y: 680 },
  8: { x: 180, y: 680 },
  9: { x: 180, y: 600 },
  13: { x: 260, y: 440 },
  14: { x: 340, y: 440 },
  15: { x: 340, y: 520 },
  16: { x: 420, y: 520 },
  18: { x: 260, y: 680 },
  19: { x: 260, y: 600 },
  20: { x: 100, y: 520 },
  23: { x: 260, y: 360 },
  24: { x: 180, y: 440 },
  25: { x: 420, y: 360 },
  26: { x: 340, y: 600 },
  27: { x: 420, y: 600 },
  28: { x: 500, y: 520 },
  29: { x: 420, y: 440 },
  31: { x: 340, y: 760 },
  32: { x: 340, y: 680 },
  33: { x: 180, y: 520 },
  34: { x: 500, y: 680 },
  37: { x: 180, y: 360 },
  38: { x: 100, y: 440 },
  39: { x: 500, y: 360 },
  40: { x: 500, y: 600 },
  41: { x: 580, y: 520 },
  42: { x: 580, y: 440 },
  43: { x: 420, y: 760 },
  44: { x: 420, y: 680 },
  45: { x: 260, y: 520 },
  46: { x: 180, y: 440 },
  47: { x: 580, y: 680 },
  48: { x: 580, y: 600 },
  50: { x: 100, y: 360 },
  51: { x: 100, y: 280 },
  52: { x: 580, y: 360 },
  53: { x: 660, y: 600 },
  54: { x: 660, y: 520 },
  56: { x: 660, y: 440 },
  57: { x: 500, y: 760 },
  58: { x: 500, y: 680 },
  60: { x: 180, y: 600 },
  61: { x: 100, y: 520 },
  62: { x: 660, y: 680 },
  63: { x: 660, y: 600 },
  67: { x: 180, y: 280 },
  68: { x: 100, y: 200 },
  69: { x: 660, y: 360 },
  70: { x: 740, y: 520 },
  72: { x: 660, y: 280 },
  73: { x: 580, y: 760 },
  74: { x: 580, y: 680 },
  75: { x: 420, y: 600 },
  76: { x: 100, y: 600 },
  78: { x: 180, y: 520 },
  79: { x: 660, y: 760 },
  80: { x: 740, y: 600 },
  81: { x: 740, y: 680 },
  82: { x: 260, y: 280 },
  84: { x: 100, y: 280 },
  85: { x: 100, y: 120 },
  86: { x: 740, y: 360 },
  87: { x: 820, y: 520 },
  88: { x: 820, y: 440 },
  90: { x: 740, y: 280 },
  91: { x: 740, y: 200 },
  92: { x: 660, y: 760 },
  94: { x: 420, y: 520 },
  97: { x: 260, y: 600 },
  100: { x: 820, y: 680 },
  101: { x: 340, y: 280 },
  103: { x: 180, y: 120 },
  105: { x: 820, y: 280 },
  106: { x: 900, y: 280 },
  108: { x: 900, y: 200 },
  109: { x: 340, y: 680 },
  112: { x: 900, y: 680 },
  114: { x: 420, y: 280 },
  115: { x: 500, y: 120 },
  116: { x: 900, y: 360 },
  117: { x: 820, y: 360 },
  118: { x: 980, y: 360 },
  124: { x: 420, y: 760 },
  126: { x: 500, y: 40 },
  127: { x: 580, y: 120 },
  129: { x: 900, y: 440 },
  130: { x: 500, y: 760 },
  131: { x: 500, y: 680 },
  132: { x: 500, y: 280 },
  134: { x: 1060, y: 360 },
  138: { x: 340, y: 760 },
  139: { x: 580, y: 760 },
  140: { x: 420, y: 200 },
  141: { x: 1060, y: 280 },
  142: { x: 980, y: 440 },
  143: { x: 1060, y: 440 },
  150: { x: 260, y: 760 },
  153: { x: 660, y: 760 },
  154: { x: 580, y: 200 },
  155: { x: 660, y: 200 },
  156: { x: 740, y: 200 },
  157: { x: 820, y: 200 },
  158: { x: 1060, y: 520 },
  166: { x: 740, y: 760 },
  167: { x: 660, y: 120 },
  168: { x: 740, y: 120 },
  169: { x: 820, y: 120 },
  170: { x: 900, y: 200 },
  174: { x: 260, y: 40 },
  175: { x: 340, y: 40 },
  183: { x: 820, y: 760 },
  184: { x: 820, y: 40 },
  185: { x: 900, y: 120 },
  194: { x: 500, y: 840 },
  195: { x: 580, y: 840 },
  196: { x: 900, y: 40 },
  197: { x: 660, y: 840 },
  198: { x: 740, y: 840 }
};

// Connection types between stations (matches server-side map)
// Connections are bidirectional by default
export const connections = [
  // Station 1 connections
  { from: 1, to: 8, types: ['taxi'] },
  { from: 1, to: 9, types: ['taxi'] },
  // Station 8 connections
  { from: 8, to: 9, types: ['taxi'] },
  { from: 8, to: 18, types: ['bus'] },
  { from: 8, to: 19, types: ['taxi'] },
  // Station 9 connections
  { from: 9, to: 19, types: ['bus'] },
  { from: 9, to: 20, types: ['taxi'] },
  // Station 13 (start) connections
  { from: 13, to: 23, types: ['taxi', 'bus'] },
  { from: 13, to: 24, types: ['taxi'] },
  { from: 13, to: 14, types: ['taxi'] },
  { from: 13, to: 46, types: ['underground'] },
  // Station 14 connections
  { from: 14, to: 15, types: ['taxi'] },
  { from: 14, to: 23, types: ['taxi'] },
  { from: 14, to: 25, types: ['bus'] },
  // Station 15 connections
  { from: 15, to: 16, types: ['taxi'] },
  { from: 15, to: 26, types: ['bus'] },
  { from: 15, to: 28, types: ['bus'] },
  { from: 15, to: 29, types: ['taxi'] },
  // Station 16 connections
  { from: 16, to: 28, types: ['taxi'] },
  { from: 16, to: 29, types: ['taxi'] },
  // Station 18 connections
  { from: 18, to: 31, types: ['taxi'] },
  { from: 18, to: 43, types: ['taxi'] },
  // Station 19 connections
  { from: 19, to: 32, types: ['taxi'] },
  // Station 20 connections
  { from: 20, to: 33, types: ['taxi'] },
  // Station 23 connections
  { from: 23, to: 37, types: ['taxi'] },
  // Station 24 connections
  { from: 24, to: 37, types: ['bus'] },
  { from: 24, to: 38, types: ['taxi'] },
  // Station 25 connections
  { from: 25, to: 38, types: ['bus'] },
  { from: 25, to: 39, types: ['taxi'] },
  // Station 26 (start) connections
  { from: 26, to: 27, types: ['taxi'] },
  { from: 26, to: 39, types: ['bus'] },
  // Station 27 connections
  { from: 27, to: 28, types: ['taxi'] },
  { from: 27, to: 40, types: ['taxi'] },
  // Station 28 connections
  { from: 28, to: 41, types: ['taxi'] },
  // Station 29 (start) connections
  { from: 29, to: 41, types: ['taxi'] },
  { from: 29, to: 42, types: ['bus'] },
  // Station 31 connections
  { from: 31, to: 43, types: ['taxi'] },
  { from: 31, to: 44, types: ['taxi'] },
  // Station 32 connections
  { from: 32, to: 33, types: ['taxi'] },
  { from: 32, to: 44, types: ['taxi'] },
  { from: 32, to: 45, types: ['taxi'] },
  // Station 33 connections
  { from: 33, to: 46, types: ['taxi'] },
  // Station 34 (start) connections
  { from: 34, to: 47, types: ['taxi'] },
  { from: 34, to: 48, types: ['taxi'] },
  // Station 37 connections
  { from: 37, to: 50, types: ['taxi'] },
  // Station 38 connections
  { from: 38, to: 50, types: ['taxi'] },
  { from: 38, to: 51, types: ['bus'] },
  // Station 39 connections
  { from: 39, to: 51, types: ['taxi'] },
  { from: 39, to: 52, types: ['taxi'] },
  // Station 40 connections
  { from: 40, to: 52, types: ['bus'] },
  { from: 40, to: 53, types: ['taxi'] },
  // Station 41 connections
  { from: 41, to: 54, types: ['taxi'] },
  // Station 42 connections
  { from: 42, to: 56, types: ['taxi'] },
  { from: 42, to: 72, types: ['bus'] },
  // Station 43 connections
  { from: 43, to: 57, types: ['taxi'] },
  // Station 44 connections
  { from: 44, to: 58, types: ['taxi'] },
  // Station 45 connections
  { from: 45, to: 46, types: ['taxi'] },
  { from: 45, to: 58, types: ['bus'] },
  { from: 45, to: 60, types: ['taxi'] },
  // Station 46 connections
  { from: 46, to: 61, types: ['taxi'] },
  // Station 47 connections
  { from: 47, to: 62, types: ['taxi'] },
  // Station 48 connections
  { from: 48, to: 62, types: ['bus'] },
  { from: 48, to: 63, types: ['taxi'] },
  // Station 50 (start) connections
  { from: 50, to: 49, types: ['taxi'] },
  // Station 51 connections
  { from: 51, to: 67, types: ['taxi'] },
  { from: 51, to: 68, types: ['taxi'] },
  // Station 52 connections
  { from: 52, to: 67, types: ['bus'] },
  { from: 52, to: 69, types: ['taxi'] },
  // Station 53 (start) connections
  { from: 53, to: 54, types: ['taxi'] },
  { from: 53, to: 69, types: ['bus'] },
  // Station 54 connections
  { from: 54, to: 70, types: ['taxi'] },
  // Station 56 connections
  { from: 56, to: 91, types: ['bus'] },
  // Station 57 connections
  { from: 57, to: 73, types: ['taxi'] },
  // Station 58 connections
  { from: 58, to: 74, types: ['bus'] },
  { from: 58, to: 75, types: ['taxi'] },
  // Station 60 connections
  { from: 60, to: 76, types: ['taxi'] },
  // Station 61 connections
  { from: 61, to: 76, types: ['taxi'] },
  { from: 61, to: 78, types: ['bus'] },
  // Station 62 connections
  { from: 62, to: 79, types: ['taxi'] },
  // Station 63 connections
  { from: 63, to: 79, types: ['taxi'] },
  { from: 63, to: 80, types: ['taxi'] },
  { from: 63, to: 81, types: ['bus'] },
  // Station 67 connections
  { from: 67, to: 82, types: ['taxi'] },
  { from: 67, to: 84, types: ['taxi'] },
  // Station 68 connections
  { from: 68, to: 85, types: ['taxi'] },
  // Station 69 connections
  { from: 69, to: 86, types: ['taxi'] },
  // Station 70 connections
  { from: 70, to: 87, types: ['taxi'] },
  // Station 72 connections
  { from: 72, to: 90, types: ['taxi'] },
  { from: 72, to: 91, types: ['bus'] },
  // Station 73 connections
  { from: 73, to: 92, types: ['taxi'] },
  // Station 74 connections
  { from: 74, to: 92, types: ['taxi'] },
  // Station 75 connections
  { from: 75, to: 94, types: ['taxi'] },
  // Station 78 connections
  { from: 78, to: 79, types: ['taxi'] },
  { from: 78, to: 97, types: ['bus'] },
  // Station 80 connections
  { from: 80, to: 100, types: ['taxi'] },
  // Station 81 connections
  { from: 81, to: 82, types: ['bus'] },
  { from: 81, to: 100, types: ['taxi'] },
  // Station 82 connections
  { from: 82, to: 101, types: ['taxi'] },
  { from: 82, to: 140, types: ['underground'] },
  // Station 84 connections
  { from: 84, to: 85, types: ['taxi'] },
  // Station 85 connections
  { from: 85, to: 103, types: ['taxi'] },
  // Station 86 connections
  { from: 86, to: 116, types: ['bus'] },
  { from: 86, to: 117, types: ['taxi'] },
  // Station 87 connections
  { from: 87, to: 88, types: ['taxi'] },
  // Station 88 connections
  { from: 88, to: 117, types: ['bus'] },
  // Station 90 connections
  { from: 90, to: 91, types: ['taxi'] },
  { from: 90, to: 105, types: ['taxi'] },
  // Station 91 (start) connections
  { from: 91, to: 105, types: ['taxi'] },
  // Station 97 connections
  { from: 97, to: 109, types: ['taxi'] },
  // Station 100 connections
  { from: 100, to: 112, types: ['taxi'] },
  // Station 101 connections
  { from: 101, to: 114, types: ['taxi'] },
  // Station 103 (start) connections
  { from: 103, to: 112, types: ['bus'] },
  // Station 105 connections
  { from: 105, to: 106, types: ['taxi'] },
  { from: 105, to: 108, types: ['taxi'] },
  // Station 106 connections
  { from: 106, to: 116, types: ['taxi'] },
  // Station 108 connections
  { from: 108, to: 116, types: ['taxi'] },
  { from: 108, to: 117, types: ['bus'] },
  // Station 109 connections
  { from: 109, to: 124, types: ['taxi'] },
  // Station 114 connections
  { from: 114, to: 132, types: ['taxi'] },
  // Station 115 connections
  { from: 115, to: 126, types: ['taxi'] },
  { from: 115, to: 127, types: ['taxi'] },
  // Station 116 connections
  { from: 116, to: 118, types: ['taxi'] },
  // Station 117 (start) connections
  { from: 117, to: 129, types: ['taxi'] },
  // Station 118 connections
  { from: 118, to: 129, types: ['bus'] },
  { from: 118, to: 134, types: ['taxi'] },
  // Station 124 connections
  { from: 124, to: 130, types: ['taxi'] },
  { from: 124, to: 138, types: ['bus'] },
  // Station 126 connections
  { from: 126, to: 127, types: ['taxi'] },
  { from: 126, to: 140, types: ['bus'] },
  // Station 127 connections
  { from: 127, to: 134, types: ['taxi'] },
  // Station 129 connections
  { from: 129, to: 142, types: ['taxi'] },
  // Station 130 connections
  { from: 130, to: 131, types: ['taxi'] },
  { from: 130, to: 139, types: ['taxi'] },
  // Station 131 connections
  { from: 131, to: 114, types: ['bus'] },
  // Station 132 (start) connections
  { from: 132, to: 140, types: ['taxi'] },
  // Station 134 connections
  { from: 134, to: 141, types: ['taxi'] },
  // Station 138 (start) connections
  { from: 138, to: 150, types: ['taxi'] },
  // Station 139 connections
  { from: 139, to: 153, types: ['taxi'] },
  // Station 140 connections
  { from: 140, to: 154, types: ['taxi'] },
  // Station 141 (start) connections
  { from: 141, to: 142, types: ['taxi'] },
  // Station 142 connections
  { from: 142, to: 143, types: ['taxi'] },
  { from: 142, to: 158, types: ['bus'] },
  // Station 143 connections
  { from: 143, to: 158, types: ['taxi'] },
  // Station 153 connections
  { from: 153, to: 154, types: ['taxi'] },
  { from: 153, to: 166, types: ['taxi'] },
  // Station 154 connections
  { from: 154, to: 155, types: ['taxi'] },
  // Station 155 (start) connections
  { from: 155, to: 156, types: ['taxi'] },
  { from: 155, to: 167, types: ['bus'] },
  // Station 156 connections
  { from: 156, to: 157, types: ['taxi'] },
  { from: 156, to: 169, types: ['taxi'] },
  // Station 157 connections
  { from: 157, to: 158, types: ['taxi'] },
  { from: 157, to: 170, types: ['bus'] },
  // Station 166 connections
  { from: 166, to: 183, types: ['taxi'] },
  // Station 167 connections
  { from: 167, to: 168, types: ['taxi'] },
  // Station 168 connections
  { from: 168, to: 184, types: ['taxi'] },
  // Station 169 connections
  { from: 169, to: 184, types: ['taxi'] },
  // Station 170 connections
  { from: 170, to: 185, types: ['taxi'] },
  // Station 174 (start) connections
  { from: 174, to: 175, types: ['taxi'] },
  // Station 183 connections
  { from: 183, to: 185, types: ['taxi'] },
  // Station 184 connections
  { from: 184, to: 185, types: ['taxi'] },
  { from: 184, to: 196, types: ['bus'] },
  // Station 194 (start) connections
  { from: 194, to: 195, types: ['taxi'] },
  // Station 195 connections
  { from: 195, to: 197, types: ['taxi'] },
  // Station 196 connections
  { from: 196, to: 197, types: ['taxi'] },
  // Underground connections (major hubs)
  { from: 13, to: 46, types: ['underground'] },
  { from: 46, to: 74, types: ['underground'] },
  { from: 74, to: 89, types: ['underground'] },
  { from: 89, to: 128, types: ['underground'] },
  { from: 67, to: 111, types: ['underground'] },
  { from: 111, to: 153, types: ['underground'] },
  // Ferry connections (Mr. X only with black ticket)
  { from: 108, to: 115, types: ['ferry'] },
  { from: 115, to: 157, types: ['ferry'] },
  { from: 157, to: 194, types: ['ferry'] }
];
