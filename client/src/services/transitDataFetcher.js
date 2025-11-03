/**
 * Transit Data Fetcher
 *
 * Comprehensive module for fetching real underground/metro stations and bus stops
 * from Mapbox POI API. Includes extensive logging for debugging and understanding
 * what data is available for different locations.
 */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * Fetch transit stations using Mapbox Geocoding API with POI categories
 *
 * Mapbox POI categories we can search:
 * - 'transit.station.subway' - Subway/Underground/Metro stations
 * - 'transit.station.rail' - Train/Railway stations
 * - 'transit.station.bus' - Bus stations/terminals
 * - 'transit.stop.bus' - Bus stops
 *
 * @param {number} lng - Center longitude
 * @param {number} lat - Center latitude
 * @param {string} category - POI category to search
 * @param {number} radiusMeters - Search radius in meters
 * @param {number} limit - Maximum results (default: 50)
 * @returns {Promise<Object>} Transit station data with detailed logging
 */
async function fetchTransitPOIs(lng, lat, category, radiusMeters, limit = 50) {
  const proximity = `${lng},${lat}`;
  const bbox = calculateBBox(lng, lat, radiusMeters);

  // Mapbox Geocoding API with types=poi for transit stations
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${category}.json?` +
    `proximity=${proximity}&` +
    `bbox=${bbox[0]},${bbox[1]},${bbox[2]},${bbox[3]}&` +
    `types=poi&` +
    `limit=${limit}&` +
    `access_token=${MAPBOX_TOKEN}`;

  console.log(`\n🔍 Searching for: ${category}`);
  console.log(`   Location: [${lng.toFixed(6)}, ${lat.toFixed(6)}]`);
  console.log(`   Radius: ${radiusMeters}m`);
  console.log(`   API URL: ${url.substring(0, 120)}...`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`   ❌ API Error: ${response.status} ${response.statusText}`);
      throw new Error(`Mapbox API failed: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`   📦 Response received:`);
    console.log(`      - Features found: ${data.features?.length || 0}`);
    console.log(`      - Query: "${data.query?.join(' ')}"`);

    if (data.features && data.features.length > 0) {
      console.log(`      - Sample features:`);
      data.features.slice(0, 3).forEach((feature, i) => {
        console.log(`        ${i + 1}. "${feature.text}" (${feature.place_name})`);
        console.log(`           Coords: [${feature.center[0].toFixed(6)}, ${feature.center[1].toFixed(6)}]`);
        console.log(`           Properties:`, feature.properties);
        console.log(`           Category: ${feature.properties?.category}`);
        console.log(`           Maki icon: ${feature.properties?.maki}`);
      });
    } else {
      console.warn(`   ⚠️ No ${category} found in this area`);
    }

    return {
      category,
      count: data.features?.length || 0,
      features: data.features || [],
      bbox: data.bbox,
      query: data.query
    };

  } catch (error) {
    console.error(`   ❌ Error fetching ${category}:`, error.message);
    return {
      category,
      count: 0,
      features: [],
      error: error.message
    };
  }
}

/**
 * Calculate bounding box from center point and radius
 */
function calculateBBox(lng, lat, radiusMeters) {
  const latDelta = (radiusMeters / 111000); // 1 degree lat ≈ 111km
  const lngDelta = (radiusMeters / (111000 * Math.cos(lat * Math.PI / 180)));

  return [
    lng - lngDelta, // west
    lat - latDelta, // south
    lng + lngDelta, // east
    lat + latDelta  // north
  ];
}

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
 * Research transit availability for a specific location
 * This function queries multiple transit types and logs everything
 *
 * @param {number} lng - Center longitude
 * @param {number} lat - Center latitude
 * @param {number} radiusMeters - Search radius
 * @returns {Promise<Object>} Comprehensive transit data
 */
export async function researchTransitAvailability(lng, lat, radiusMeters) {
  console.log('\n' + '='.repeat(80));
  console.log('🚇 TRANSIT DATA RESEARCH - COMPREHENSIVE LOGGING');
  console.log('='.repeat(80));
  console.log(`Center: [${lng}, ${lat}]`);
  console.log(`Radius: ${radiusMeters}m`);
  console.log(`Time: ${new Date().toLocaleTimeString()}`);
  console.log('='.repeat(80));

  // Try different search terms for transit
  const searchQueries = [
    'subway',
    'metro',
    'underground',
    'train station',
    'railway station',
    'bus station',
    'bus stop',
    'transit'
  ];

  const results = [];

  for (const query of searchQueries) {
    const result = await fetchTransitPOIs(lng, lat, query, radiusMeters);
    results.push(result);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log('\n' + '='.repeat(80));
  console.log('📊 TRANSIT RESEARCH SUMMARY');
  console.log('='.repeat(80));

  results.forEach(result => {
    console.log(`${result.category.padEnd(20)} - Found: ${result.count} stations`);
  });

  const totalUnique = new Set(
    results.flatMap(r => r.features.map(f => f.id))
  ).size;

  console.log('\n' + '-'.repeat(80));
  console.log(`Total unique transit locations found: ${totalUnique}`);
  console.log('='.repeat(80) + '\n');

  return {
    center: { lng, lat },
    radius: radiusMeters,
    queries: results,
    totalUnique,
    timestamp: new Date().toISOString()
  };
}

/**
 * Fetch transit stations using Mapbox Tilequery API
 * Queries the 'transit_stop_label' layer from Mapbox Streets v8 tileset
 *
 * @param {number} lng - Center longitude
 * @param {number} lat - Center latitude
 * @param {number} radiusMeters - Search radius in meters
 * @param {number} limit - Maximum results (1-50, default: 50)
 * @returns {Promise<Object>} Transit station data with detailed logging
 */
async function fetchTransitViaTilequery(lng, lat, radiusMeters, limit = 50) {
  // Mapbox Tilequery API endpoint
  // Tileset: mapbox.mapbox-streets-v8
  // Layer: transit_stop_label (contains all transit stops/stations)
  const url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lng},${lat}.json?` +
    `radius=${radiusMeters}&` +
    `limit=${limit}&` +
    `layers=transit_stop_label&` +
    `access_token=${MAPBOX_TOKEN}`;

  console.log(`\n🔍 TILEQUERY API: Searching for transit stations`);
  console.log(`   Location: [${lng.toFixed(6)}, ${lat.toFixed(6)}]`);
  console.log(`   Radius: ${radiusMeters}m`);
  console.log(`   Layer: transit_stop_label`);
  console.log(`   API URL: ${url.substring(0, 120)}...`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`   ❌ API Error: ${response.status} ${response.statusText}`);
      throw new Error(`Mapbox Tilequery API failed: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`   📦 Response received:`);
    console.log(`      - Features found: ${data.features?.length || 0}`);

    if (data.features && data.features.length > 0) {
      console.log(`      - Sample features (first 5):`);
      data.features.slice(0, 5).forEach((feature, i) => {
        const props = feature.properties || {};
        console.log(`        ${i + 1}. "${props.name || 'Unnamed'}" (mode: ${props.mode || 'unknown'})`);
        console.log(`           Coords: [${feature.geometry?.coordinates?.[0]?.toFixed(6)}, ${feature.geometry?.coordinates?.[1]?.toFixed(6)}]`);
        console.log(`           Stop type: ${props.stop_type || 'unknown'}`);
        console.log(`           Network: ${props.network || 'N/A'}`);
        console.log(`           All properties:`, props);
      });

      // Count by mode
      const modeCount = {};
      data.features.forEach(feature => {
        const mode = feature.properties?.mode || 'unknown';
        modeCount[mode] = (modeCount[mode] || 0) + 1;
      });

      console.log(`\n      - Transit modes found:`);
      Object.entries(modeCount).forEach(([mode, count]) => {
        console.log(`        ${mode}: ${count} stations`);
      });
    } else {
      console.warn(`   ⚠️ No transit stations found in this area`);
    }

    return {
      count: data.features?.length || 0,
      features: data.features || [],
      raw: data
    };

  } catch (error) {
    console.error(`   ❌ Error fetching transit data:`, error.message);
    return {
      count: 0,
      features: [],
      error: error.message
    };
  }
}

/**
 * Fetch and classify transit stations for game board generation
 * Implements fallback logic for areas with limited transit
 *
 * @param {Array} bounds - Bounding box [[swLng, swLat], [neLng, neLat]]
 * @param {Object} center - Center point {lng, lat}
 * @returns {Promise<Object>} Classified transit data
 */
export async function fetchTransitStationsForGameBoard(bounds, center) {
  console.log('\n' + '='.repeat(80));
  console.log('🎲 FETCHING TRANSIT DATA FOR GAME BOARD (TILEQUERY API)');
  console.log('='.repeat(80));

  const [[swLng, swLat], [neLng, neLat]] = bounds;
  const lngRange = neLng - swLng;
  const latRange = neLat - swLat;
  const radiusMeters = Math.max(lngRange, latRange) * 111000 / 2; // Approximate

  console.log(`Bounding box: SW[${swLng.toFixed(4)}, ${swLat.toFixed(4)}] NE[${neLng.toFixed(4)}, ${neLat.toFixed(4)}]`);
  console.log(`Estimated radius: ${Math.round(radiusMeters)}m`);

  // Strategy: Multiple queries with different radii
  // Rail/Metro stations are fewer and farther apart → use LARGER radius
  // Bus stops are numerous and close together → use SMALLER radius

  console.log('\n📍 Strategy: Multiple targeted queries for better coverage...');
  console.log('   1️⃣ Large radius (2x) for rail/metro stations (fewer, farther apart)');
  console.log('   2️⃣ Standard radius for bus stops (numerous, close together)');

  // Query 1: LARGE radius for rail/metro/train stations (2x normal radius)
  console.log('\n🚇 Query 1: Searching for RAIL/METRO stations (large radius)...');
  const railRadius = radiusMeters * 2;
  const railResult = await fetchTransitViaTilequery(center.lng, center.lat, railRadius, 50);

  // Query 2: Standard radius for bus stops
  console.log('\n🚌 Query 2: Searching for BUS stations (standard radius)...');
  const busResult = await fetchTransitViaTilequery(center.lng, center.lat, radiusMeters, 50);

  // Classify by mode from BOTH queries
  const undergroundStations = [];
  const busStations = [];
  const seenIds = new Set();

  console.log('\n🔍 Classifying transit stations by mode...');

  // Process rail query first (priority for underground/train)
  railResult.features.forEach(feature => {
    const props = feature.properties || {};
    const mode = props.mode || 'unknown';
    const name = props.name || 'Unnamed Station';
    const coords = feature.geometry?.coordinates || [0, 0];
    const featureId = `${coords[0]}_${coords[1]}_${name}`;

    // Skip duplicates
    if (seenIds.has(featureId)) return;
    seenIds.add(featureId);

    const station = {
      id: featureId,
      name: name,
      coordinates: coords,
      mode: mode,
      stopType: props.stop_type,
      network: props.network
    };

    // Classify by mode
    // Metro/subway/rail modes → treat as "underground" for game purposes
    if (mode === 'metro' || mode === 'metro_rail' || mode === 'light_rail' ||
        mode === 'subway' || mode === 'rail' || mode === 'train' || mode === 'railway') {
      undergroundStations.push(station);
      console.log(`   ✅ Found ${mode} station: "${name}"`);
    }
    // Bus modes
    else if (mode === 'bus' || mode === 'bus_rapid_transit') {
      busStations.push(station);
    }
  });

  // Process bus query
  busResult.features.forEach(feature => {
    const props = feature.properties || {};
    const mode = props.mode || 'unknown';
    const name = props.name || 'Unnamed Station';
    const coords = feature.geometry?.coordinates || [0, 0];
    const featureId = `${coords[0]}_${coords[1]}_${name}`;

    // Skip duplicates
    if (seenIds.has(featureId)) return;
    seenIds.add(featureId);

    const station = {
      id: featureId,
      name: name,
      coordinates: coords,
      mode: mode,
      stopType: props.stop_type,
      network: props.network
    };

    // Bus modes only
    if (mode === 'bus' || mode === 'bus_rapid_transit') {
      busStations.push(station);
    }
    // Catch any rail stations we might have missed
    else if (mode === 'metro' || mode === 'metro_rail' || mode === 'light_rail' ||
             mode === 'subway' || mode === 'rail' || mode === 'train' || mode === 'railway') {
      undergroundStations.push(station);
      console.log(`   ✅ Found ${mode} station: "${name}" (from bus query)`);
    }
  });

  console.log(`\n✅ Classified ${undergroundStations.length} underground/metro/rail/train stations`);
  console.log(`✅ Classified ${busStations.length} bus stations`);

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TRANSIT DATA SUMMARY');
  console.log('='.repeat(80));
  console.log(`Underground stations: ${undergroundStations.length}`);
  console.log(`Bus stations: ${busStations.length}`);
  console.log(`Total transit stations: ${undergroundStations.length + busStations.length}`);

  // Calculate what we need for Scotland Yard ratios
  const targetUnderground = 17; // Stations with underground
  const targetBus = 62; // Stations with bus (but no underground)
  const targetTaxiOnly = 120; // Taxi-only stations

  console.log('\n📋 TARGET vs ACTUAL:');
  console.log(`Underground: ${undergroundStations.length}/${targetUnderground} (need ${Math.max(0, targetUnderground - undergroundStations.length)} more)`);
  console.log(`Bus: ${busStations.length}/${targetBus} (need ${Math.max(0, targetBus - busStations.length)} more)`);
  console.log(`Taxi-only: Will fill remaining ${targetTaxiOnly} stations`);

  // Determine if we need fallback
  const needsUndergroundFallback = undergroundStations.length < targetUnderground;
  const needsBusFallback = busStations.length < targetBus;

  if (needsUndergroundFallback || needsBusFallback) {
    console.log('\n⚠️ FALLBACK NEEDED:');
    if (needsUndergroundFallback) {
      console.log(`   - Not enough underground stations (have ${undergroundStations.length}, need ${targetUnderground})`);
      console.log(`   - Will use template-based placement for ${targetUnderground - undergroundStations.length} underground stations`);
    }
    if (needsBusFallback) {
      console.log(`   - Not enough bus stations (have ${busStations.length}, need ${targetBus})`);
      console.log(`   - Will use template-based placement for ${targetBus - busStations.length} bus stations`);
    }
  } else {
    console.log('\n✅ Sufficient real transit data found - will use real stations!');
  }

  console.log('='.repeat(80) + '\n');

  return {
    underground: undergroundStations,
    bus: busStations,
    needsFallback: {
      underground: needsUndergroundFallback,
      bus: needsBusFallback
    },
    summary: {
      undergroundFound: undergroundStations.length,
      busFound: busStations.length,
      undergroundTarget: targetUnderground,
      busTarget: targetBus
    }
  };
}
