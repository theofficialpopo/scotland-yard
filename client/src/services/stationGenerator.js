/**
 * Station Generator Service
 *
 * Main orchestrator for generating Scotland Yard game boards
 * from any address worldwide
 */

import { geocodeAddress, classifyAreaDensity, calculateBounds } from './geocoding.js';
import { fetchRoadNetwork, detectIntersections, filterByDistribution } from './roadNetwork.js';

/**
 * Generate a complete game board from an address
 *
 * @param {string} address - The address to generate a game board for
 * @param {number} stationCount - Optional override for number of stations
 * @returns {Promise<Object>} Complete game board configuration
 */
export async function generateGameBoard(address, stationCount = null) {
  console.log(`🎲 Generating game board for: ${address}`);

  try {
    // Step 1: Geocode the address
    console.log('📍 Step 1: Geocoding address...');
    const geocodingResult = await geocodeAddress(address);
    console.log(`Found: ${geocodingResult.address}`);
    console.log(`Coordinates: ${geocodingResult.coordinates.lng}, ${geocodingResult.coordinates.lat}`);

    // Step 2: Classify area density
    console.log('\n🏙️ Step 2: Classifying area density...');
    const areaType = classifyAreaDensity(geocodingResult);
    console.log(`Area type: ${areaType.name} (${areaType.description})`);
    console.log(`Road classes: ${areaType.roadClasses.join(', ')}`);
    console.log(`Target stations: ${stationCount || areaType.stationCount}`);

    // Step 3: Fetch road network
    console.log('\n🛣️ Step 3: Fetching road network...');
    const roads = await fetchRoadNetwork(
      geocodingResult.coordinates,
      areaType.roadClasses,
      areaType.searchRadius
    );

    if (roads.length === 0) {
      throw new Error('No suitable roads found in this area. Try a different location.');
    }

    console.log(`Found ${roads.length} roads`);

    // Step 4: Detect intersections
    console.log('\n⚡ Step 4: Detecting intersections...');
    const intersections = detectIntersections(roads, 2);  // Minimum 2 roads (any intersection)

    if (intersections.length === 0) {
      throw new Error('No intersections found. This area may be too sparse. Try a more urban location.');
    }

    console.log(`Found ${intersections.length} intersections`);

    // Step 5: Select best stations
    console.log('\n🎯 Step 5: Selecting optimal stations...');
    const targetCount = stationCount || areaType.stationCount;
    const selectedStations = filterByDistribution(
      intersections,
      areaType.minRoadSpacing,
      targetCount
    );

    console.log(`Selected ${selectedStations.length} stations`);

    // Step 6: Calculate game board bounds
    console.log('\n🗺️ Step 6: Calculating game board bounds...');
    const bounds = calculateGameBoardBounds(selectedStations, areaType.searchRadius);

    // Step 7: Create game board configuration
    const gameBoard = {
      address: geocodingResult.address,
      center: geocodingResult.coordinates,
      areaType: areaType.id,
      bounds: bounds,
      stations: selectedStations.map((station, index) => ({
        id: index + 1,
        name: generateStationName(station, index),
        coordinates: station.coordinates,
        roadCount: station.roadCount,
        roadNames: station.roadNames.slice(0, 2)  // Top 2 road names
      })),
      metadata: {
        generatedAt: new Date().toISOString(),
        roadCount: roads.length,
        intersectionCount: intersections.length,
        areaTypeDetails: areaType
      }
    };

    console.log('\n✅ Game board generated successfully!');
    console.log(`📊 Stats: ${gameBoard.stations.length} stations, ${roads.length} roads analyzed`);

    return gameBoard;

  } catch (error) {
    console.error('❌ Game board generation failed:', error);
    throw error;
  }
}

/**
 * Calculate optimal bounds to contain all stations
 *
 * @param {Array} stations - Array of selected stations
 * @param {number} padding - Padding in meters around stations
 * @returns {Array} Bounds [[swLng, swLat], [neLng, neLat]]
 */
function calculateGameBoardBounds(stations, padding = 500) {
  if (stations.length === 0) {
    throw new Error('Cannot calculate bounds with no stations');
  }

  // Find min/max coordinates
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  stations.forEach(station => {
    const [lng, lat] = station.coordinates;
    minLng = Math.min(minLng, lng);
    maxLng = Math.max(maxLng, lng);
    minLat = Math.min(minLat, lat);
    maxLat = Math.max(maxLat, lat);
  });

  // Add padding (convert meters to degrees approximately)
  const latPadding = padding / 111320;
  const lngPadding = padding / (111320 * Math.cos(((minLat + maxLat) / 2) * Math.PI / 180));

  return [
    [minLng - lngPadding, minLat - latPadding],  // Southwest
    [maxLng + lngPadding, maxLat + latPadding]   // Northeast
  ];
}

/**
 * Generate a name for a station
 *
 * @param {Object} station - Station object with intersection data
 * @param {number} index - Station index
 * @returns {string} Station name
 */
function generateStationName(station, index) {
  // Try to use road names if available
  if (station.roadNames && station.roadNames.length > 0) {
    const validNames = station.roadNames.filter(name => name && name.length > 0);
    if (validNames.length >= 2) {
      // Use intersection of two roads
      return `${validNames[0]} & ${validNames[1]}`;
    } else if (validNames.length === 1) {
      // Use single road name
      return validNames[0];
    }
  }

  // Fallback to generic name
  return `Station ${index + 1}`;
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
  if (gameBoard.stations.length < 10) {
    warnings.push(`Low station count (${gameBoard.stations.length}). Gameplay may be limited.`);
  }

  // Check station distribution
  const distances = [];
  for (let i = 0; i < gameBoard.stations.length; i++) {
    for (let j = i + 1; j < gameBoard.stations.length; j++) {
      const [lng1, lat1] = gameBoard.stations[i].coordinates;
      const [lng2, lat2] = gameBoard.stations[j].coordinates;

      const distance = Math.sqrt(
        Math.pow(lng2 - lng1, 2) + Math.pow(lat2 - lat1, 2)
      ) * 111320;  // Approximate meters

      distances.push(distance);
    }
  }

  const avgDistance = distances.reduce((a, b) => a + b, 0) / distances.length;
  const minDistance = Math.min(...distances);

  if (minDistance < 50) {
    warnings.push(`Some stations are very close (${minDistance.toFixed(0)}m apart). May cause gameplay issues.`);
  }

  if (avgDistance < 100) {
    warnings.push(`Stations are clustered closely (avg ${avgDistance.toFixed(0)}m). Consider a larger area.`);
  }

  return {
    valid: errors.length === 0,
    warnings: warnings,
    errors: errors,
    stats: {
      stationCount: gameBoard.stations.length,
      avgStationDistance: avgDistance.toFixed(0),
      minStationDistance: minDistance.toFixed(0)
    }
  };
}
