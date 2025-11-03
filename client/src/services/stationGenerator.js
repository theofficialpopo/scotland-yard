/**
 * Station Generator Service
 *
 * Generates Scotland Yard game boards from any address worldwide
 * using the classic board game layout as a template
 */

import { geocodeAddress, reverseGeocode, calculateBounds } from './geocoding.js';
import { scaleStationsToBox } from '../data/stationTemplate.js';
import { snapMultipleToRoads } from './roadSnapping.js';
import { fetchTransitStationsForGameBoard } from './transitDataFetcher.js';

/**
 * Authentic Scotland Yard station type distribution
 * Based on original board game data analysis
 */
const SCOTLAND_YARD_RATIOS = {
  underground: 20,  // 10.1% - Stations with taxi+bus+underground
  bus: 80,          // 40.2% - Stations with taxi+bus
  taxiOnly: 99      // 49.7% - Stations with taxi only
};

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(lng1, lat1, lng2, lat2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Assign station types based on real transit data + template fallback
 * Implements authentic Scotland Yard ratios: 20 underground, 80 bus, 99 taxi-only
 */
function assignStationTypes(templateStations, transitData) {
  console.log('\n🎯 Assigning station types with authentic Scotland Yard ratios...');
  console.log(`   Target: ${SCOTLAND_YARD_RATIOS.underground} underground, ${SCOTLAND_YARD_RATIOS.bus} bus, ${SCOTLAND_YARD_RATIOS.taxiOnly} taxi-only`);

  const stationsWithTypes = [];
  const { underground: realUnderground, bus: realBus } = transitData;

  // Step 1: Assign underground stations (first 20 template positions)
  console.log('\n📍 Step 1: Assigning UNDERGROUND stations (20 total)...');
  for (let i = 0; i < SCOTLAND_YARD_RATIOS.underground; i++) {
    const templateStation = templateStations[i];

    // Try to find closest real underground station
    let closestUnderground = null;
    let minDistance = Infinity;

    for (const realStation of realUnderground) {
      const distance = calculateDistance(
        templateStation.lng,
        templateStation.lat,
        realStation.coordinates[0],
        realStation.coordinates[1]
      );

      if (distance < minDistance && distance < 1000) { // Within 1km
        minDistance = distance;
        closestUnderground = realStation;
      }
    }

    if (closestUnderground) {
      // Use real underground station
      stationsWithTypes.push({
        id: i + 1,
        name: closestUnderground.name,
        coordinates: closestUnderground.coordinates,
        types: ['taxi', 'bus', 'underground'],
        realTransit: true,
        matchDistance: Math.round(minDistance)
      });
      console.log(`   ✅ Station ${i + 1}: Matched to real underground "${closestUnderground.name}" (${Math.round(minDistance)}m)`);
    } else {
      // Use template position (fallback)
      stationsWithTypes.push({
        id: i + 1,
        name: `Underground Station ${i + 1}`,
        coordinates: [templateStation.lng, templateStation.lat],
        types: ['taxi', 'bus', 'underground'],
        realTransit: false,
        matchDistance: 0
      });
      console.log(`   ⚠️ Station ${i + 1}: No real underground nearby, using template position`);
    }
  }

  // Step 2: Assign bus stations (next 80 template positions)
  console.log('\n🚌 Step 2: Assigning BUS stations (80 total)...');
  for (let i = SCOTLAND_YARD_RATIOS.underground; i < SCOTLAND_YARD_RATIOS.underground + SCOTLAND_YARD_RATIOS.bus; i++) {
    const templateStation = templateStations[i];

    // Try to find closest real bus stop
    let closestBus = null;
    let minDistance = Infinity;

    for (const realStation of realBus) {
      const distance = calculateDistance(
        templateStation.lng,
        templateStation.lat,
        realStation.coordinates[0],
        realStation.coordinates[1]
      );

      if (distance < minDistance && distance < 500) { // Within 500m
        minDistance = distance;
        closestBus = realStation;
      }
    }

    if (closestBus) {
      // Use real bus stop
      stationsWithTypes.push({
        id: i + 1,
        name: closestBus.name,
        coordinates: closestBus.coordinates,
        types: ['taxi', 'bus'],
        realTransit: true,
        matchDistance: Math.round(minDistance)
      });

      if (i < SCOTLAND_YARD_RATIOS.underground + 5) {
        console.log(`   ✅ Station ${i + 1}: Matched to real bus stop "${closestBus.name}" (${Math.round(minDistance)}m)`);
      }
    } else {
      // Use template position (fallback)
      stationsWithTypes.push({
        id: i + 1,
        name: `Bus Station ${i + 1}`,
        coordinates: [templateStation.lng, templateStation.lat],
        types: ['taxi', 'bus'],
        realTransit: false,
        matchDistance: 0
      });

      if (i < SCOTLAND_YARD_RATIOS.underground + 5) {
        console.log(`   ⚠️ Station ${i + 1}: No real bus stop nearby, using template position`);
      }
    }
  }

  console.log(`   ... (showing first 5 of 80 bus stations)`);

  // Step 3: Assign taxi-only stations (remaining 99)
  console.log('\n🚕 Step 3: Assigning TAXI-ONLY stations (99 total)...');
  for (let i = SCOTLAND_YARD_RATIOS.underground + SCOTLAND_YARD_RATIOS.bus; i < templateStations.length; i++) {
    const templateStation = templateStations[i];

    stationsWithTypes.push({
      id: i + 1,
      name: `Taxi Station ${i + 1}`,
      coordinates: [templateStation.lng, templateStation.lat],
      types: ['taxi'],
      realTransit: false,
      matchDistance: 0
    });
  }
  console.log(`   ✅ Assigned 99 taxi-only stations (template positions)`);

  // Summary
  const realUndergroundCount = stationsWithTypes.filter(s =>
    s.types.includes('underground') && s.realTransit
  ).length;

  const realBusCount = stationsWithTypes.filter(s =>
    s.types.includes('bus') && !s.types.includes('underground') && s.realTransit
  ).length;

  console.log('\n' + '='.repeat(80));
  console.log('📊 STATION TYPE ASSIGNMENT SUMMARY');
  console.log('='.repeat(80));
  console.log(`Underground: ${SCOTLAND_YARD_RATIOS.underground} total (${realUndergroundCount} real, ${SCOTLAND_YARD_RATIOS.underground - realUndergroundCount} template)`);
  console.log(`Bus: ${SCOTLAND_YARD_RATIOS.bus} total (${realBusCount} real, ${SCOTLAND_YARD_RATIOS.bus - realBusCount} template)`);
  console.log(`Taxi-only: ${SCOTLAND_YARD_RATIOS.taxiOnly} total (all template)`);
  console.log(`Total: ${stationsWithTypes.length} stations`);
  console.log('='.repeat(80) + '\n');

  return stationsWithTypes;
}

/**
 * Generate a complete game board from map bounds (not just an address)
 *
 * @param {Array} bounds - Bounding box [[swLng, swLat], [neLng, neLat]]
 * @param {Object} center - Center point {lng, lat}
 * @param {string} address - The address for display purposes
 * @returns {Promise<Object>} Complete game board configuration
 */
export async function generateGameBoardFromBounds(bounds, center, address) {
  console.log('\n' + '='.repeat(80));
  console.log('🎲 GENERATING SCOTLAND YARD GAME BOARD');
  console.log('='.repeat(80));
  console.log(`Location: ${address}`);
  console.log(`Center: [${center.lng.toFixed(6)}, ${center.lat.toFixed(6)}]`);
  console.log(`Bounds: SW[${bounds[0][0].toFixed(4)}, ${bounds[0][1].toFixed(4)}] NE[${bounds[1][0].toFixed(4)}, ${bounds[1][1].toFixed(4)}]`);
  console.log('='.repeat(80));

  try {
    // Step 1: Fetch real transit data (underground + bus stations)
    console.log('\n🚇 Step 1: Fetching real transit data from Mapbox...');
    const transitData = await fetchTransitStationsForGameBoard(bounds, center);

    // Step 2: Scale Scotland Yard template to these bounds
    console.log('\n📐 Step 2: Placing stations using Scotland Yard template...');
    const templateCoordinates = scaleStationsToBox(bounds);
    console.log(`   Placed ${templateCoordinates.length} template stations`);

    // Step 3: Assign station types (underground/bus/taxi) using authentic ratios
    const stationsWithTypes = assignStationTypes(templateCoordinates, transitData);

    // Step 4: Create game board configuration
    const gameBoard = {
      address: address,
      center: center,
      bounds: bounds,
      stations: stationsWithTypes,
      metadata: {
        generatedAt: new Date().toISOString(),
        template: 'classic',
        totalStations: stationsWithTypes.length,
        undergroundStations: stationsWithTypes.filter(s => s.types.includes('underground')).length,
        busStations: stationsWithTypes.filter(s => s.types.includes('bus') && !s.types.includes('underground')).length,
        taxiOnlyStations: stationsWithTypes.filter(s => s.types.length === 1 && s.types[0] === 'taxi').length,
        realTransitStations: stationsWithTypes.filter(s => s.realTransit).length
      }
    };

    console.log('\n' + '='.repeat(80));
    console.log('✅ GAME BOARD GENERATED SUCCESSFULLY!');
    console.log('='.repeat(80));
    console.log(`Total stations: ${gameBoard.metadata.totalStations}`);
    console.log(`  - Underground (🚇): ${gameBoard.metadata.undergroundStations} stations`);
    console.log(`  - Bus (🚌): ${gameBoard.metadata.busStations} stations`);
    console.log(`  - Taxi-only (🚕): ${gameBoard.metadata.taxiOnlyStations} stations`);
    console.log(`Real transit matches: ${gameBoard.metadata.realTransitStations} stations`);
    console.log('='.repeat(80) + '\n');

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
