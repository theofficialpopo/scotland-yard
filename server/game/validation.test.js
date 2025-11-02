/**
 * Test suite for game validation logic
 * Run with: node --test server/game/validation.test.js
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { validateMove, checkWinCondition, canDetectivesMove } from './validation.js';
import { TICKET_TYPES } from './constants.js';

// Test validateMove function
test('validateMove - should validate basic taxi move', () => {
  const move = { from: 1, to: 8, ticketType: TICKET_TYPES.TAXI };
  const player = { role: 'detective', detectiveIndex: 0 };
  const gameState = {
    mrX: { position: 50 },
    detectives: [
      { position: 1, tickets: { taxi: 10, bus: 8, underground: 4 } }
    ]
  };

  const result = validateMove(move, player, gameState);
  assert.strictEqual(result.valid, true, 'Valid taxi move should be accepted');
});

test('validateMove - should reject move with wrong starting position', () => {
  const move = { from: 5, to: 8, ticketType: TICKET_TYPES.TAXI };
  const player = { role: 'detective', detectiveIndex: 0 };
  const gameState = {
    mrX: { position: 50 },
    detectives: [
      { position: 1, tickets: { taxi: 10, bus: 8, underground: 4 } }
    ]
  };

  const result = validateMove(move, player, gameState);
  assert.strictEqual(result.valid, false, 'Move from wrong position should be rejected');
  assert.strictEqual(result.error, 'Invalid starting position');
});

test('validateMove - should reject move without required ticket', () => {
  const move = { from: 1, to: 8, ticketType: TICKET_TYPES.TAXI };
  const player = { role: 'detective', detectiveIndex: 0 };
  const gameState = {
    mrX: { position: 50 },
    detectives: [
      { position: 1, tickets: { taxi: 0, bus: 8, underground: 4 } }
    ]
  };

  const result = validateMove(move, player, gameState);
  assert.strictEqual(result.valid, false, 'Move without ticket should be rejected');
  assert.match(result.error, /No taxi tickets/i);
});

test('validateMove - should reject move to non-connected station', () => {
  const move = { from: 1, to: 100, ticketType: TICKET_TYPES.TAXI };
  const player = { role: 'detective', detectiveIndex: 0 };
  const gameState = {
    mrX: { position: 50 },
    detectives: [
      { position: 1, tickets: { taxi: 10, bus: 8, underground: 4 } }
    ]
  };

  const result = validateMove(move, player, gameState);
  assert.strictEqual(result.valid, false, 'Move to non-connected station should be rejected');
  assert.match(result.error, /not connected/i);
});

test('validateMove - should reject move to occupied station (Mr. X)', () => {
  const move = { from: 1, to: 8, ticketType: TICKET_TYPES.TAXI };
  const player = { role: 'detective', detectiveIndex: 0 };
  const gameState = {
    mrX: { position: 8 }, // Mr. X is at destination
    detectives: [
      { position: 1, tickets: { taxi: 10, bus: 8, underground: 4 } }
    ]
  };

  const result = validateMove(move, player, gameState);
  assert.strictEqual(result.valid, false, 'Move to Mr. X position should be rejected');
  assert.match(result.error, /occupied/i);
});

test('validateMove - should reject move to occupied station (detective)', () => {
  const move = { from: 1, to: 8, ticketType: TICKET_TYPES.TAXI };
  const player = { role: 'detective', detectiveIndex: 0 };
  const gameState = {
    mrX: { position: 50 },
    detectives: [
      { position: 1, tickets: { taxi: 10, bus: 8, underground: 4 } },
      { position: 8, tickets: { taxi: 10, bus: 8, underground: 4 } } // Another detective at destination
    ]
  };

  const result = validateMove(move, player, gameState);
  assert.strictEqual(result.valid, false, 'Move to detective position should be rejected');
  assert.match(result.error, /occupied/i);
});

test('validateMove - should accept Mr. X black ticket for any transport', () => {
  const move = { from: 1, to: 8, ticketType: TICKET_TYPES.BLACK };
  const player = { role: 'mrX' };
  const gameState = {
    mrX: { position: 1, tickets: { taxi: 4, bus: 3, underground: 3, black: 5 } },
    detectives: [
      { position: 50, tickets: { taxi: 10, bus: 8, underground: 4 } }
    ]
  };

  const result = validateMove(move, player, gameState);
  assert.strictEqual(result.valid, true, 'Mr. X black ticket should work for taxi route');
});

test('validateMove - should reject detective using black ticket', () => {
  const move = { from: 1, to: 8, ticketType: TICKET_TYPES.BLACK };
  const player = { role: 'detective', detectiveIndex: 0 };
  const gameState = {
    mrX: { position: 50 },
    detectives: [
      { position: 1, tickets: { taxi: 10, bus: 8, underground: 4, black: 1 } } // Has black ticket but still can't use it
    ]
  };

  const result = validateMove(move, player, gameState);
  assert.strictEqual(result.valid, false, 'Detective cannot use black tickets');
  assert.ok(result.error, 'Should have an error message');
});

test('validateMove - should reject move to same station', () => {
  const move = { from: 1, to: 1, ticketType: TICKET_TYPES.TAXI };
  const player = { role: 'detective', detectiveIndex: 0 };
  const gameState = {
    mrX: { position: 50 },
    detectives: [
      { position: 1, tickets: { taxi: 10, bus: 8, underground: 4 } }
    ]
  };

  const result = validateMove(move, player, gameState);
  assert.strictEqual(result.valid, false, 'Cannot move to same station');
  assert.match(result.error, /same station/i);
});

// Test checkWinCondition function
test('checkWinCondition - should detect detective catching Mr. X', () => {
  const gameState = {
    currentRound: 10,
    mrX: { position: 50 },
    detectives: [
      { position: 50, tickets: { taxi: 10, bus: 8, underground: 4 } }, // Same position as Mr. X
      { position: 51, tickets: { taxi: 10, bus: 8, underground: 4 } }
    ]
  };

  const result = checkWinCondition(gameState);
  assert.strictEqual(result.winner, 'detectives');
  assert.match(result.reason, /caught/i);
});

test('checkWinCondition - should detect Mr. X escape after round 24', () => {
  const gameState = {
    currentRound: 25,
    mrX: { position: 50 },
    detectives: [
      { position: 51, tickets: { taxi: 10, bus: 8, underground: 4 } },
      { position: 52, tickets: { taxi: 10, bus: 8, underground: 4 } }
    ]
  };

  const result = checkWinCondition(gameState);
  assert.strictEqual(result.winner, 'mrX');
  assert.match(result.reason, /escaped|Round 24/i);
});

test('checkWinCondition - should detect detectives stuck (Mr. X wins)', () => {
  const gameState = {
    currentRound: 10,
    mrX: { position: 50 },
    detectives: [
      { position: 51, tickets: { taxi: 0, bus: 0, underground: 0 } }, // No tickets
      { position: 52, tickets: { taxi: 0, bus: 0, underground: 0 } }  // No tickets
    ]
  };

  const result = checkWinCondition(gameState);
  assert.strictEqual(result.winner, 'mrX');
  assert.match(result.reason, /stuck/i);
});

test('checkWinCondition - should return no winner mid-game', () => {
  const gameState = {
    currentRound: 10,
    mrX: { position: 50 },
    detectives: [
      { position: 51, tickets: { taxi: 10, bus: 8, underground: 4 } },
      { position: 52, tickets: { taxi: 10, bus: 8, underground: 4 } }
    ]
  };

  const result = checkWinCondition(gameState);
  assert.strictEqual(result.winner, null);
  assert.strictEqual(result.reason, null);
});

// Test canDetectivesMove function
test('canDetectivesMove - should return true when detective can move', () => {
  const gameState = {
    mrX: { position: 100 },
    detectives: [
      { position: 1, tickets: { taxi: 10, bus: 8, underground: 4 } } // Can move to 8, 9
    ]
  };

  const result = canDetectivesMove(gameState);
  assert.strictEqual(result, true, 'Detective with tickets and free adjacent stations should be able to move');
});

test('canDetectivesMove - should return false when detective has no tickets', () => {
  const gameState = {
    mrX: { position: 100 },
    detectives: [
      { position: 1, tickets: { taxi: 0, bus: 0, underground: 0 } }
    ]
  };

  const result = canDetectivesMove(gameState);
  assert.strictEqual(result, false, 'Detective with no tickets cannot move');
});

test('canDetectivesMove - should return true when at least one detective can move', () => {
  const gameState = {
    mrX: { position: 100 },
    detectives: [
      { position: 1, tickets: { taxi: 0, bus: 0, underground: 0 } }, // Cannot move
      { position: 13, tickets: { taxi: 10, bus: 8, underground: 4 } } // Can move
    ]
  };

  const result = canDetectivesMove(gameState);
  assert.strictEqual(result, true, 'Should return true if at least one detective can move');
});

console.log('✅ All validation tests completed successfully!');
