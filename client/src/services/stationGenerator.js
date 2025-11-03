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
 * Select stations with spatial distribution across game area
 * Instead of just taking closest stations, distribute them across quadrants
 *
 * @param {Array} stations - Stations with coordinates and quality scores
 * @param {Object} center - Center point {lng, lat}
 * @param {number} targetCount - How many stations to select
 * @returns {Array} Selected stations distributed across game area
 */
function selectStationsWithDistribution(stations, center, targetCount) {
  if (stations.length <= targetCount) {
    return stations; // Use all available stations
  }

  console.log(`\n📐 Distributing ${targetCount} stations across game area...`);

  // Add distance and classify into quadrants
  const stationsWithMetadata = stations.map(station => {
    const lng = station.coordinates[0];
    const lat = station.coordinates[1];
    const distance = calculateDistance(center.lng, center.lat, lng, lat);

    // Determine quadrant (NW, NE, SW, SE) relative to center
    const isNorth = lat >= center.lat;
    const isEast = lng >= center.lng;
    const quadrant = `${isNorth ? 'N' : 'S'}${isEast ? 'E' : 'W'}`;

    return {
      ...station,
      distanceFromCenter: distance,
      quadrant: quadrant,
      lng: lng,
      lat: lat
    };
  });

  // Group stations by quadrant
  const byQuadrant = {
    NE: stationsWithMetadata.filter(s => s.quadrant === 'NE'),
    NW: stationsWithMetadata.filter(s => s.quadrant === 'NW'),
    SE: stationsWithMetadata.filter(s => s.quadrant === 'SE'),
    SW: stationsWithMetadata.filter(s => s.quadrant === 'SW')
  };

  console.log(`   - Quadrant distribution:`);
  console.log(`     NE: ${byQuadrant.NE.length} | NW: ${byQuadrant.NW.length}`);
  console.log(`     SE: ${byQuadrant.SE.length} | SW: ${byQuadrant.SW.length}`);

  // Calculate how many to take from each quadrant (proportional to availability)
  const quadrants = ['NE', 'NW', 'SE', 'SW'];
  const totalAvailable = stations.length;
  const perQuadrantTarget = Math.ceil(targetCount / 4);

  const selected = [];

  // First pass: Select evenly from each quadrant (sorted by quality + distance)
  for (const quad of quadrants) {
    const quadStations = byQuadrant[quad];
    if (quadStations.length === 0) continue;

    // Sort by quality score (descending) then distance (ascending)
    // This prioritizes high-quality nearby stations in each quadrant
    quadStations.sort((a, b) => {
      const qualityDiff = (b.qualityScore || 0) - (a.qualityScore || 0);
      if (qualityDiff !== 0) return qualityDiff;
      return a.distanceFromCenter - b.distanceFromCenter;
    });

    // Take best stations from this quadrant
    const toTake = Math.min(perQuadrantTarget, quadStations.length);
    selected.push(...quadStations.slice(0, toTake));
  }

  // Second pass: If we need more stations, take the best remaining by quality
  if (selected.length < targetCount) {
    const remaining = stationsWithMetadata
      .filter(s => !selected.includes(s))
      .sort((a, b) => {
        const qualityDiff = (b.qualityScore || 0) - (a.qualityScore || 0);
        if (qualityDiff !== 0) return qualityDiff;
        return a.distanceFromCenter - b.distanceFromCenter;
      });

    const needed = targetCount - selected.length;
    selected.push(...remaining.slice(0, needed));
  }

  // Sort final selection by distance for logging purposes
  selected.sort((a, b) => a.distanceFromCenter - b.distanceFromCenter);

  console.log(`   - Selected ${selected.length} stations distributed across quadrants`);
  console.log(`   - Distance range: ${Math.round(selected[0].distanceFromCenter)}m - ${Math.round(selected[selected.length - 1].distanceFromCenter)}m`);

  return selected;
}

/**
 * Assign station types based on real transit data + template fallback
 * Implements authentic Scotland Yard ratios: 20 underground, 80 bus, 99 taxi-only
 * Uses real station coordinates when available with spatial distribution
 */
function assignStationTypes(templateStations, transitData, center) {
  console.log('\n🎯 Assigning station types with authentic Scotland Yard ratios...');
  console.log(`   Target: ${SCOTLAND_YARD_RATIOS.underground} underground, ${SCOTLAND_YARD_RATIOS.bus} bus, ${SCOTLAND_YARD_RATIOS.taxiOnly} taxi-only`);

  const stationsWithTypes = [];
  const { underground: realUnderground, bus: realBus } = transitData;

  // Use spatial distribution instead of pure proximity
  const undergroundWithDistance = selectStationsWithDistribution(
    realUnderground,
    center,
    SCOTLAND_YARD_RATIOS.underground
  );

  const busWithDistance = selectStationsWithDistribution(
    realBus,
    center,
    SCOTLAND_YARD_RATIOS.bus
  );

  // Step 1: Assign underground stations (20 total)
  console.log('\n📍 Step 1: Assigning UNDERGROUND stations (20 total)...');
  const numRealUnderground = Math.min(SCOTLAND_YARD_RATIOS.underground, undergroundWithDistance.length);

  // Use real underground stations (sorted by proximity)
  for (let i = 0; i < numRealUnderground; i++) {
    const station = undergroundWithDistance[i];
    stationsWithTypes.push({
      id: i + 1,
      name: station.name,
      coordinates: station.coordinates,
      types: ['taxi', 'bus', 'underground'],
      realTransit: true,
      distanceFromCenter: Math.round(station.distanceFromCenter)
    });
    console.log(`   ✅ Station ${i + 1}: "${station.name}" (${Math.round(station.distanceFromCenter)}m from center)`);
  }

  // Fill remaining with template positions
  for (let i = numRealUnderground; i < SCOTLAND_YARD_RATIOS.underground; i++) {
    const templateStation = templateStations[i];
    stationsWithTypes.push({
      id: i + 1,
      name: `Underground Station ${i + 1}`,
      coordinates: [templateStation.lng, templateStation.lat],
      types: ['taxi', 'bus', 'underground'],
      realTransit: false,
      distanceFromCenter: 0
    });
    console.log(`   ⚠️ Station ${i + 1}: Using template position (no real station available)`);
  }

  // Step 2: Assign bus stations (80 total)
  console.log('\n🚌 Step 2: Assigning BUS stations (80 total)...');
  const numRealBus = Math.min(SCOTLAND_YARD_RATIOS.bus, busWithDistance.length);

  // Use real bus stops (sorted by proximity)
  for (let i = 0; i < numRealBus; i++) {
    const station = busWithDistance[i];
    const stationId = SCOTLAND_YARD_RATIOS.underground + i + 1;
    stationsWithTypes.push({
      id: stationId,
      name: station.name,
      coordinates: station.coordinates,
      types: ['taxi', 'bus'],
      realTransit: true,
      distanceFromCenter: Math.round(station.distanceFromCenter)
    });

    if (i < 5) {
      console.log(`   ✅ Station ${stationId}: "${station.name}" (${Math.round(station.distanceFromCenter)}m from center)`);
    }
  }

  // Fill remaining with template positions
  for (let i = numRealBus; i < SCOTLAND_YARD_RATIOS.bus; i++) {
    const templateIdx = SCOTLAND_YARD_RATIOS.underground + i;
    const stationId = templateIdx + 1;
    const templateStation = templateStations[templateIdx];
    stationsWithTypes.push({
      id: stationId,
      name: `Bus Station ${stationId}`,
      coordinates: [templateStation.lng, templateStation.lat],
      types: ['taxi', 'bus'],
      realTransit: false,
      distanceFromCenter: 0
    });

    if (i < 5) {
      console.log(`   ⚠️ Station ${stationId}: Using template position (no real station available)`);
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
      distanceFromCenter: 0
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
    const stationsWithTypes = assignStationTypes(templateCoordinates, transitData, center);

    // Step 4: Snap real transit stations to roads for accurate placement
    console.log('\n🛣️ Step 4: Snapping real transit stations to roads...');
    const realTransitStations = stationsWithTypes.filter(s => s.realTransit);

    if (realTransitStations.length > 0) {
      console.log(`   Snapping ${realTransitStations.length} real transit stations to nearest roads...`);

      // Convert coordinates from [lng, lat] array to {lng, lat} object format
      const coordinatesForSnapping = realTransitStations.map(s => ({
        lng: s.coordinates[0],
        lat: s.coordinates[1]
      }));

      // Snap to roads
      const snappedStations = await snapMultipleToRoads(
        coordinatesForSnapping,
        50 // 50m snap radius
      );

      // Update coordinates with snapped positions
      let snappedCount = 0;
      realTransitStations.forEach((station, idx) => {
        const snapped = snappedStations[idx];
        if (snapped && snapped.snapped) {
          // Find station in main array and update coordinates
          const stationInArray = stationsWithTypes.find(s => s.id === station.id);
          if (stationInArray) {
            stationInArray.coordinates = [snapped.lng, snapped.lat];
            stationInArray.snappedToRoad = true;
            snappedCount++;
          }
        }
      });

      console.log(`   ✅ Snapped ${snappedCount}/${realTransitStations.length} stations to roads`);
    } else {
      console.log(`   ⚠️ No real transit stations to snap`);
    }

    // Step 5: Create game board configuration
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
