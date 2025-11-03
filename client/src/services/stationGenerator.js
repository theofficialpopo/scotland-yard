/**
 * Station Generator Service
 *
 * Generates Scotland Yard game boards from any address worldwide
 * using the classic board game layout as a template
 */

import { geocodeAddress, reverseGeocode, calculateBounds } from './geocoding.js';
import { scaleStationsToBox } from '../data/stationTemplate.js';

/**
 * Generate a complete game board from an address
 *
 * @param {string} address - The address to generate a game board for
 * @returns {Promise<Object>} Complete game board configuration
 */
export async function generateGameBoard(address) {
  console.log(`🎲 Generating game board for: ${address}`);

  try {
    // Step 1: Geocode the address
    console.log('📍 Step 1: Geocoding address...');
    const geocodingResult = await geocodeAddress(address);
    console.log(`Found: ${geocodingResult.address}`);
    console.log(`Coordinates: ${geocodingResult.coordinates.lng}, ${geocodingResult.coordinates.lat}`);

    // Step 2: Determine map bounds
    console.log('\n🗺️ Step 2: Calculating game board bounds...');
    const radiusMeters = 1500; // 1.5km radius for game board
    const bounds = calculateBounds(
      geocodingResult.coordinates.lng,
      geocodingResult.coordinates.lat,
      radiusMeters
    );
    console.log(`Bounds: ${JSON.stringify(bounds)}`);

    // Step 3: Scale Scotland Yard template to these bounds
    console.log('\n📐 Step 3: Placing stations using Scotland Yard template...');
    const stationCoordinates = scaleStationsToBox(bounds);
    console.log(`Placed ${stationCoordinates.length} stations`);

    // Step 4: Reverse geocode each station to get street names
    console.log('\n🔍 Step 4: Finding street names for stations...');
    const stationsWithNames = await Promise.all(
      stationCoordinates.map(async (coords, index) => {
        try {
          const streetInfo = await reverseGeocode(coords.lng, coords.lat);
          return {
            id: index + 1,
            name: streetInfo.streetName || `Station ${index + 1}`,
            coordinates: [coords.lng, coords.lat],
            fullAddress: streetInfo.fullAddress,
            neighborhood: streetInfo.neighborhood
          };
        } catch (error) {
          console.warn(`Failed to geocode station ${index + 1}:`, error.message);
          return {
            id: index + 1,
            name: `Station ${index + 1}`,
            coordinates: [coords.lng, coords.lat]
          };
        }
      })
    );

    console.log(`✅ Named ${stationsWithNames.length} stations`);

    // Step 5: Create game board configuration
    const gameBoard = {
      address: geocodingResult.address,
      center: geocodingResult.coordinates,
      bounds: bounds,
      stations: stationsWithNames,
      metadata: {
        generatedAt: new Date().toISOString(),
        template: 'classic',
        radiusMeters: radiusMeters,
        placeType: geocodingResult.placeType,
        country: geocodingResult.context.country || 'Unknown'
      }
    };

    console.log('\n✅ Game board generated successfully!');
    console.log(`📊 Stats: ${gameBoard.stations.length} stations`);

    return gameBoard;

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
