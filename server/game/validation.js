/**
 * Move validation logic for Scotland Yard
 */

import { areStationsConnected, stations } from './map.js';
import { TICKET_TYPES, FERRY_STATIONS } from './constants.js';

/**
 * Validate a player's move
 * @param {Object} move - The move to validate
 * @param {number} move.from - Starting station
 * @param {number} move.to - Destination station
 * @param {string} move.ticketType - Type of ticket used
 * @param {Object} player - Player making the move
 * @param {Object} gameState - Current game state
 * @returns {Object} - { valid: boolean, error: string }
 */
export function validateMove(move, player, gameState) {
  const { from, to, ticketType } = move;

  // Check if stations exist
  if (!stations[from]) {
    return { valid: false, error: 'Invalid starting station' };
  }

  if (!stations[to]) {
    return { valid: false, error: 'Invalid destination station' };
  }

  // Check if stations are the same
  if (from === to) {
    return { valid: false, error: 'Cannot move to the same station' };
  }

  // Check if player has the required ticket
  const playerTickets = player.role === 'mrX'
    ? gameState.mrX.tickets
    : gameState.detectives[player.detectiveIndex].tickets;

  if (!playerTickets[ticketType] || playerTickets[ticketType] <= 0) {
    return { valid: false, error: `No ${ticketType} tickets available` };
  }

  // Check if stations are connected by this ticket type
  if (ticketType === TICKET_TYPES.BLACK) {
    // Black ticket can use any connection type
    const hasConnection = areStationsConnected(from, to, TICKET_TYPES.TAXI) ||
                         areStationsConnected(from, to, TICKET_TYPES.BUS) ||
                         areStationsConnected(from, to, TICKET_TYPES.UNDERGROUND);

    // Check for ferry (Mr. X only)
    const isFerry = FERRY_STATIONS.includes(from) && FERRY_STATIONS.includes(to);

    if (!hasConnection && !isFerry) {
      return { valid: false, error: 'Stations are not connected' };
    }

    // Only Mr. X can use ferry
    if (isFerry && player.role !== 'mrX') {
      return { valid: false, error: 'Only Mr. X can use the ferry' };
    }
  } else {
    if (!areStationsConnected(from, to, ticketType)) {
      return { valid: false, error: `Stations are not connected by ${ticketType}` };
    }
  }

  // Check if destination is occupied (no two players on same station)
  const isOccupied = gameState.players.some(p =>
    p.id !== player.id && p.position === to
  );

  if (isOccupied) {
    return { valid: false, error: 'Destination station is occupied' };
  }

  return { valid: true };
}

/**
 * Check if detectives can still move
 * @param {Object} gameState - Current game state
 * @returns {boolean} - True if at least one detective can move
 */
export function canDetectivesMove(gameState) {
  return gameState.detectives.some(detective => {
    // Check if detective has any tickets
    const hasTickets = detective.tickets.taxi > 0 ||
                      detective.tickets.bus > 0 ||
                      detective.tickets.underground > 0;

    if (!hasTickets) return false;

    // Check if any adjacent station is unoccupied
    const station = stations[detective.position];
    if (!station) return false;

    return station.connections.some(connectedStation => {
      const isOccupied = gameState.players.some(p => p.position === connectedStation);
      return !isOccupied;
    });
  });
}

/**
 * Check win condition
 * @param {Object} gameState - Current game state
 * @returns {Object} - { winner: string|null, reason: string|null }
 */
export function checkWinCondition(gameState) {
  const mrXPosition = gameState.mrX.position;

  // Check if any detective caught Mr. X
  const caught = gameState.detectives.some(d => d.position === mrXPosition);
  if (caught) {
    return {
      winner: 'detectives',
      reason: 'Detective caught Mr. X!'
    };
  }

  // Check if round 24 completed
  if (gameState.currentRound > 24) {
    return {
      winner: 'mrX',
      reason: 'Mr. X escaped! Round 24 completed.'
    };
  }

  // Check if all detectives are stuck
  if (!canDetectivesMove(gameState)) {
    return {
      winner: 'mrX',
      reason: 'Mr. X wins! All detectives are stuck.'
    };
  }

  return { winner: null, reason: null };
}

export default {
  validateMove,
  canDetectivesMove,
  checkWinCondition
};
