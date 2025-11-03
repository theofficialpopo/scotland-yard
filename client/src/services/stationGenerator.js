/**
 * Station Generator Service
 *
 * Generates Scotland Yard game boards from any address worldwide
 * using the classic board game layout as a template
 */

import { geocodeAddress, reverseGeocode, calculateBounds } from './geocoding.js';
import { scaleStationsToBox } from '../data/stationTemplate.js';
import { snapMultipleToRoads } from './roadSnapping.js';

/**
 * Generate a complete game board from map bounds (not just an address)
 *
 * @param {Array} bounds - Bounding box [[swLng, swLat], [neLng, neLat]]
 * @param {Object} center - Center point {lng, lat}
 * @param {string} address - The address for display purposes
 * @returns {Promise<Object>} Complete game board configuration
 */
export async function generateGameBoardFromBounds(bounds, center, address) {
  console.log(`🎲 Generating game board for bounds:`, bounds);

  try {
    // Step 1: Scale Scotland Yard template to these bounds
    console.log('📐 Step 1: Placing stations using Scotland Yard template...');
    const templateCoordinates = scaleStationsToBox(bounds);
    console.log(`Placed ${templateCoordinates.length} template stations`);

    // Step 2: Snap each station to nearest road
    console.log('\n🔧 Step 2: Snapping stations to actual roads...');
    const snappedCoordinates = await snapMultipleToRoads(templateCoordinates, 150);

    // Step 3: Reverse geocode each station to get street names
    console.log('\n🔍 Step 3: Finding street names for stations...');
    const stationsWithNames = await Promise.all(
      snappedCoordinates.map(async (coords, index) => {
        try {
          const streetInfo = await reverseGeocode(coords.lng, coords.lat);
          return {
            id: index + 1,
            name: streetInfo.streetName || coords.roadName || `Station ${index + 1}`,
            coordinates: [coords.lng, coords.lat],
            fullAddress: streetInfo.fullAddress,
            neighborhood: streetInfo.neighborhood,
            snappedToRoad: coords.snapped,
            snapDistance: Math.round(coords.distance)
          };
        } catch (error) {
          console.warn(`Failed to geocode station ${index + 1}:`, error.message);
          return {
            id: index + 1,
            name: coords.roadName || `Station ${index + 1}`,
            coordinates: [coords.lng, coords.lat],
            snappedToRoad: coords.snapped,
            snapDistance: Math.round(coords.distance)
          };
        }
      })
    );

    console.log(`✅ Named ${stationsWithNames.length} stations`);

    // Step 4: Create game board configuration
    const gameBoard = {
      address: address,
      center: center,
      bounds: bounds,
      stations: stationsWithNames,
      metadata: {
        generatedAt: new Date().toISOString(),
        template: 'classic',
        snappedStations: stationsWithNames.filter(s => s.snappedToRoad).length
      }
    };

    console.log('\n✅ Game board generated successfully!');
    console.log(`📊 Stats: ${gameBoard.stations.length} stations, ${gameBoard.metadata.snappedStations} snapped to roads`);

    return gameBoard;

  } catch (error) {
    console.error('❌ Game board generation failed:', error);
    throw error;
  }
}

/**
 * Generate a complete game board from an address (legacy function)
 *
 * @param {string} address - The address to generate a game board for
 * @param {number} radiusMeters - Radius for game board (default: 1500m)
 * @returns {Promise<Object>} Complete game board configuration
 */
export async function generateGameBoard(address, radiusMeters = 1500) {
  console.log(`🎲 Generating game board for: ${address}`);

  try {
    // Step 1: Geocode the address
    console.log('📍 Step 1: Geocoding address...');
    const geocodingResult = await geocodeAddress(address);
    console.log(`Found: ${geocodingResult.address}`);
    console.log(`Coordinates: ${geocodingResult.coordinates.lng}, ${geocodingResult.coordinates.lat}`);

    // Step 2: Determine map bounds
    console.log('\n🗺️ Step 2: Calculating game board bounds...');
    const bounds = calculateBounds(
      geocodingResult.coordinates.lng,
      geocodingResult.coordinates.lat,
      radiusMeters
    );
    console.log(`Bounds: ${JSON.stringify(bounds)}`);

    // Step 3: Use the new bounds-based generation
    return await generateGameBoardFromBounds(
      bounds,
      geocodingResult.coordinates,
      geocodingResult.address
    );

  } catch (error) {
    console.error('❌ Game board generation failed:', error);
    throw error;
  }
}

/**
 * Validate a generated game board
 *
 * @param {Object} gameBoard - Game board from generateGameBoard()
 * @returns {Object} Validation result with warnings
 */
export function validateGameBoard(gameBoard) {
  const warnings = [];
  const errors = [];

  // Check station count
  if (gameBoard.stations.length < 15) {
    warnings.push(`Low station count (${gameBoard.stations.length}). Gameplay may be limited.`);
  }

  // Check that stations have names
  const unnamedStations = gameBoard.stations.filter(s => s.name.startsWith('Station '));
  if (unnamedStations.length > gameBoard.stations.length / 2) {
    warnings.push(`${unnamedStations.length} stations could not be named (no street data available).`);
  }

  // Check bounds are valid
  if (!gameBoard.bounds || gameBoard.bounds.length !== 2) {
    errors.push('Invalid game board bounds');
  }

  return {
    valid: errors.length === 0,
    warnings: warnings,
    errors: errors,
    stats: {
      stationCount: gameBoard.stations.length,
      namedStations: gameBoard.stations.length - unnamedStations.length,
      template: gameBoard.metadata.template
    }
  };
}
