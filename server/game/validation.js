/**
 * Move validation logic for Scotland Yard
 */

import { areStationsConnected, stations, connections } from './map.js';
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

  // SECURITY: Verify 'from' position matches player's actual position
  const actualPosition = player.role === 'mrX'
    ? gameState.mrX.position
    : gameState.detectives[player.detectiveIndex]?.position;

  if (from !== actualPosition) {
    return { valid: false, error: 'Invalid starting position' };
  }

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
    // Black ticket can use any connection type including ferry
    const hasConnection = areStationsConnected(from, to, TICKET_TYPES.TAXI) ||
                         areStationsConnected(from, to, TICKET_TYPES.BUS) ||
                         areStationsConnected(from, to, TICKET_TYPES.UNDERGROUND) ||
                         areStationsConnected(from, to, TICKET_TYPES.FERRY);

    if (!hasConnection) {
      return { valid: false, error: 'Stations are not connected' };
    }

    // Only Mr. X can use black tickets (which includes ferry)
    if (player.role !== 'mrX') {
      return { valid: false, error: 'Only Mr. X can use black tickets' };
    }
  } else if (ticketType === TICKET_TYPES.FERRY) {
    // Ferry requires black ticket and only Mr. X can use it
    return { valid: false, error: 'Ferry can only be used with black tickets' };
  } else {
    if (!areStationsConnected(from, to, ticketType)) {
      return { valid: false, error: `Stations are not connected by ${ticketType}` };
    }
  }

  // Check if destination is occupied
  // IMPORTANT: Detectives CAN move to Mr. X's position (that's how they win!)
  // Only block detective-to-detective collisions and Mr. X moving to detective positions

  // If Mr. X is moving, check if any detective is at the destination
  if (player.role === 'mrX') {
    const detectiveAtDestination = gameState.detectives.some(detective =>
      detective.position === to
    );
    if (detectiveAtDestination) {
      return { valid: false, error: 'Destination station is occupied by a detective' };
    }
  }

  // If detective is moving, check if another detective is at the destination
  // NOTE: Detectives CAN move to Mr. X's position to capture him!
  if (player.role === 'detective') {
    const otherDetectiveAtDestination = gameState.detectives.some((detective, index) => {
      // Skip if this is the moving detective
      if (player.detectiveIndex === index) {
        return false;
      }
      return detective.position === to;
    });

    if (otherDetectiveAtDestination) {
      return { valid: false, error: 'Destination station is occupied by another detective' };
    }
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

    // Get all adjacent stations with their required ticket types
    const adjacentStations = new Map(); // Map<stationId, Set<ticketTypes>>

    for (const conn of connections) {
      if (conn.from === detective.position) {
        if (!adjacentStations.has(conn.to)) {
          adjacentStations.set(conn.to, new Set());
        }
        conn.types.forEach(type => adjacentStations.get(conn.to).add(type));
      }
      // Connections are bidirectional
      if (conn.to === detective.position) {
        if (!adjacentStations.has(conn.from)) {
          adjacentStations.set(conn.from, new Set());
        }
        conn.types.forEach(type => adjacentStations.get(conn.from).add(type));
      }
    }

    // Check if any adjacent station is reachable and unoccupied
    for (const [stationId, requiredTicketTypes] of adjacentStations) {
      // IMPORTANT: Detectives CAN move to Mr. X's position (that's how they capture him!)
      // Only check if another detective is occupying the station
      const isOtherDetectiveThere = gameState.detectives.some((d, idx) =>
        d.position === stationId && idx !== gameState.detectives.indexOf(detective)
      );

      if (isOtherDetectiveThere) continue;

      // Check if detective has at least one ticket type that can reach this station
      const canReach = Array.from(requiredTicketTypes).some(ticketType => {
        // Detectives can't use black or ferry tickets
        if (ticketType === TICKET_TYPES.BLACK || ticketType === TICKET_TYPES.FERRY) {
          return false;
        }
        return detective.tickets[ticketType] > 0;
      });

      if (canReach) return true;
    }

    return false;
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
