/**
 * Game constants for Scotland Yard
 */

export const TICKET_TYPES = {
  TAXI: 'taxi',
  BUS: 'bus',
  UNDERGROUND: 'underground',
  BLACK: 'black',
  FERRY: 'ferry' // Thames ferry (Mr. X only with black ticket)
};

export const ROLES = {
  MR_X: 'mrX',
  DETECTIVE: 'detective'
};

export const GAME_STATUS = {
  WAITING: 'WAITING',
  PLAYING: 'PLAYING',
  FINISHED: 'FINISHED'
};

export const MAX_PLAYERS = 6;
export const MIN_PLAYERS = 2;
export const MAX_ROUNDS = 24;

// Rounds when Mr. X reveals his position
export const REVEAL_ROUNDS = [3, 8, 13, 18, 24];

// Starting tickets for Mr. X
export const MR_X_STARTING_TICKETS = {
  taxi: 4,
  bus: 3,
  underground: 3,
  // black tickets = number of detectives (set dynamically)
};

// Starting tickets for each detective
export const DETECTIVE_STARTING_TICKETS = {
  taxi: 10,
  bus: 8,
  underground: 4
};

// Mr. X gets 2 double-move cards
export const MR_X_DOUBLE_MOVES = 2;

// Starting station IDs for simplified test map
// Spread across both sides of the map for strategic gameplay
export const STARTING_STATIONS = [
  1, 2, 4, 7, 9, 10, 12, 14, 16  // Various stations on both banks
];

// Thames ferry stations (Mr. X only, requires black ticket)
export const FERRY_STATIONS = [17, 18];

// Color codes for UI
export const TICKET_COLORS = {
  taxi: '#FDB913',      // Yellow
  bus: '#00B140',       // Green
  underground: '#EE1C25', // Red
  black: '#000000',     // Black
  ferry: '#0098D4'      // Blue
};

export const WIN_CONDITIONS = {
  DETECTIVE_CAPTURE: 'DETECTIVE_CAPTURE', // Detective lands on Mr. X
  MR_X_ESCAPED: 'MR_X_ESCAPED',          // Turn 24 completed
  DETECTIVES_STUCK: 'DETECTIVES_STUCK'   // No detective can move
};
