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
 * Fetch rail/train/metro/tram stations using OpenStreetMap Overpass API
 * OSM has comprehensive rail station data worldwide
 *
 * @param {number} lng - Center longitude
 * @param {number} lat - Center latitude
 * @param {number} radiusMeters - Search radius in meters
 * @param {number} retryCount - Retry attempt number (for timeout handling)
 * @returns {Promise<Object>} Rail station data with detailed logging
 */
async function fetchRailStationsFromOSM(lng, lat, radiusMeters, retryCount = 0) {
  // Overpass API query for rail stations
  // Query for: railway=station (train stations), railway=halt (small stops),
  //           railway=tram_stop (tram), station=subway/light_rail
  const query = `
    [out:json][timeout:30];
    (
      node["railway"="station"](around:${radiusMeters},${lat},${lng});
      node["railway"="halt"](around:${radiusMeters},${lat},${lng});
      node["railway"="tram_stop"](around:${radiusMeters},${lat},${lng});
      node["station"="subway"](around:${radiusMeters},${lat},${lng});
      node["station"="light_rail"](around:${radiusMeters},${lat},${lng});
    );
    out body;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  console.log(`\n🚂 OVERPASS API (OSM): Searching for rail/train/metro/tram stations`);
  console.log(`   Location: [${lng.toFixed(6)}, ${lat.toFixed(6)}]`);
  console.log(`   Radius: ${radiusMeters}m`);
  console.log(`   Query types: railway=station/halt/tram_stop, station=subway/light_rail`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`   ❌ API Error: ${response.status} ${response.statusText}`);

      // Retry once if timeout (504 Gateway Timeout is common with Overpass)
      if (response.status === 504 && retryCount === 0) {
        console.log(`   ⏳ Retrying after gateway timeout...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return fetchRailStationsFromOSM(lng, lat, radiusMeters, 1);
      }

      throw new Error(`Overpass API failed: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`   📦 Response received:`);
    console.log(`      - Features found: ${data.elements?.length || 0}`);

    if (data.elements && data.elements.length > 0) {
      console.log(`      - Sample rail stations (first 5):`);
      data.elements.slice(0, 5).forEach((element, i) => {
        const tags = element.tags || {};
        const name = tags.name || 'Unnamed Station';
        const railway = tags.railway || 'unknown';
        const stationType = tags.station || 'none';
        console.log(`        ${i + 1}. "${name}"`);
        console.log(`           Coords: [${element.lon?.toFixed(6)}, ${element.lat?.toFixed(6)}]`);
        console.log(`           Type: railway=${railway}, station=${stationType}`);
        console.log(`           Operator: ${tags.operator || 'N/A'}`);
      });

      // Count by type
      const typeCount = {};
      data.elements.forEach(element => {
        const tags = element.tags || {};
        const railway = tags.railway || tags.station || 'unknown';
        typeCount[railway] = (typeCount[railway] || 0) + 1;
      });

      console.log(`\n      - Rail station types found:`);
      Object.entries(typeCount).forEach(([type, count]) => {
        console.log(`        ${type}: ${count} stations`);
      });
    } else {
      console.warn(`   ⚠️ No rail stations found in this area`);
    }

    return {
      count: data.elements?.length || 0,
      features: data.elements || [],
      raw: data
    };

  } catch (error) {
    console.error(`   ❌ Error fetching rail stations from OSM:`, error.message);
    return {
      count: 0,
      features: [],
      error: error.message
    };
  }
}

/**
 * Fetch bus stops using OpenStreetMap Overpass API
 * OSM has comprehensive bus stop data worldwide
 *
 * @param {number} lng - Center longitude
 * @param {number} lat - Center latitude
 * @param {number} radiusMeters - Search radius in meters
 * @param {number} retryCount - Retry attempt number (for timeout handling)
 * @returns {Promise<Object>} Bus stop data with detailed logging
 */
async function fetchBusStopsFromOSM(lng, lat, radiusMeters, retryCount = 0) {
  // Overpass API query for bus stops
  // Query for: highway=bus_stop and public_transport=stop_position with bus=yes
  const query = `
    [out:json][timeout:30];
    (
      node["highway"="bus_stop"](around:${radiusMeters},${lat},${lng});
      node["public_transport"="stop_position"]["bus"="yes"](around:${radiusMeters},${lat},${lng});
    );
    out body;
  `;

  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  console.log(`\n🚌 OVERPASS API (OSM): Searching for bus stops`);
  console.log(`   Location: [${lng.toFixed(6)}, ${lat.toFixed(6)}]`);
  console.log(`   Radius: ${radiusMeters}m`);
  console.log(`   Query types: highway=bus_stop, public_transport=stop_position[bus=yes]`);

  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`   ❌ API Error: ${response.status} ${response.statusText}`);

      // Retry once if timeout (504 Gateway Timeout is common with Overpass)
      if (response.status === 504 && retryCount === 0) {
        console.log(`   ⏳ Retrying after gateway timeout...`);
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        return fetchBusStopsFromOSM(lng, lat, radiusMeters, 1);
      }

      throw new Error(`Overpass API failed: ${response.statusText}`);
    }

    const data = await response.json();

    console.log(`   📦 Response received:`);
    console.log(`      - Features found: ${data.elements?.length || 0}`);

    if (data.elements && data.elements.length > 0) {
      console.log(`      - Sample bus stops (first 5):`);
      data.elements.slice(0, 5).forEach((element, i) => {
        const tags = element.tags || {};
        const name = tags.name || 'Unnamed Bus Stop';
        console.log(`        ${i + 1}. "${name}"`);
        console.log(`           Coords: [${element.lon?.toFixed(6)}, ${element.lat?.toFixed(6)}]`);
        console.log(`           Operator: ${tags.operator || 'N/A'}`);
        console.log(`           Network: ${tags.network || 'N/A'}`);
      });
    } else {
      console.warn(`   ⚠️ No bus stops found in this area`);
    }

    return {
      count: data.elements?.length || 0,
      features: data.elements || [],
      raw: data
    };

  } catch (error) {
    console.error(`   ❌ Error fetching bus stops from OSM:`, error.message);
    return {
      count: 0,
      features: [],
      error: error.message
    };
  }
}

/**
 * Fetch and classify transit stations for game board generation
 * Pure OSM Overpass API approach with two separate calls
 *
 * @param {Array} bounds - Bounding box [[swLng, swLat], [neLng, neLat]]
 * @param {Object} center - Center point {lng, lat}
 * @returns {Promise<Object>} Classified transit data
 */
export async function fetchTransitStationsForGameBoard(bounds, center) {
  console.log('\n' + '='.repeat(80));
  console.log('🎲 FETCHING TRANSIT DATA FOR GAME BOARD (PURE OSM APPROACH)');
  console.log('='.repeat(80));

  const [[swLng, swLat], [neLng, neLat]] = bounds;
  const lngRange = neLng - swLng;
  const latRange = neLat - swLat;
  const radiusMeters = Math.max(lngRange, latRange) * 111000 / 2; // Approximate

  console.log(`Bounding box: SW[${swLng.toFixed(4)}, ${swLat.toFixed(4)}] NE[${neLng.toFixed(4)}, ${neLat.toFixed(4)}]`);
  console.log(`Estimated radius: ${Math.round(radiusMeters)}m`);

  // Strategy: Pure OSM approach with two separate calls
  // OSM Call 1 → Rail/train/metro/tram stations (comprehensive global coverage)
  // OSM Call 2 → Bus stops (comprehensive global coverage)

  console.log('\n📍 Strategy: Pure OpenStreetMap (Overpass API) for all transit data...');
  console.log('   1️⃣ Call 1: Rail/train/metro/tram stations');
  console.log('   2️⃣ Call 2: Bus stops');

  // Query 1: OSM Overpass for rail/train/metro/tram stations
  console.log('\n🚂 Query 1: Fetching RAIL/TRAIN/METRO/TRAM stations from OpenStreetMap...');
  const railRadius = radiusMeters * 1.5; // Slightly larger for rail stations
  const osmRailResult = await fetchRailStationsFromOSM(center.lng, center.lat, railRadius);

  // Query 2: OSM Overpass for bus stops
  console.log('\n🚌 Query 2: Fetching BUS stops from OpenStreetMap...');
  const osmBusResult = await fetchBusStopsFromOSM(center.lng, center.lat, radiusMeters);

  // Process results
  const undergroundStations = [];
  const busStations = [];
  const seenIds = new Set();

  console.log('\n🔍 Processing rail/train/metro/tram stations from OSM...');

  // Process OSM rail stations
  osmRailResult.features.forEach(element => {
    const tags = element.tags || {};
    const name = tags.name || 'Unnamed Station';
    const coords = [element.lon, element.lat];
    const featureId = `${coords[0]}_${coords[1]}_${name}`;

    // Skip duplicates
    if (seenIds.has(featureId)) return;
    seenIds.add(featureId);

    const station = {
      id: featureId,
      name: name,
      coordinates: coords,
      mode: 'rail', // All from rail query are rail/train/metro/tram
      railwayType: tags.railway,
      stationType: tags.station,
      operator: tags.operator,
      network: tags.network
    };

    undergroundStations.push(station);

    // Log first 10 stations
    if (undergroundStations.length <= 10) {
      console.log(`   ✅ Found rail station: "${name}" (${tags.railway || tags.station || 'unknown type'})`);
    }
  });

  if (undergroundStations.length > 10) {
    console.log(`   ... and ${undergroundStations.length - 10} more rail stations`);
  }

  console.log('\n🔍 Processing bus stops from OSM...');

  // Process OSM bus stops
  osmBusResult.features.forEach(element => {
    const tags = element.tags || {};
    const name = tags.name || 'Unnamed Bus Stop';
    const coords = [element.lon, element.lat];
    const featureId = `${coords[0]}_${coords[1]}_${name}`;

    // Skip duplicates
    if (seenIds.has(featureId)) return;
    seenIds.add(featureId);

    const station = {
      id: featureId,
      name: name,
      coordinates: coords,
      mode: 'bus',
      operator: tags.operator,
      network: tags.network
    };

    busStations.push(station);

    // Log first 10 stations
    if (busStations.length <= 10) {
      console.log(`   ✅ Found bus stop: "${name}"`);
    }
  });

  if (busStations.length > 10) {
    console.log(`   ... and ${busStations.length - 10} more bus stops`);
  }

  console.log(`\n✅ Processed ${undergroundStations.length} rail/train/metro/tram stations (from OSM)`);
  console.log(`✅ Processed ${busStations.length} bus stops (from OSM)`);

  // Summary
  console.log('\n' + '='.repeat(80));
  console.log('📊 TRANSIT DATA SUMMARY');
  console.log('='.repeat(80));
  console.log(`Underground stations: ${undergroundStations.length}`);
  console.log(`Bus stations: ${busStations.length}`);
  console.log(`Total transit stations: ${undergroundStations.length + busStations.length}`);

  // Calculate what we need for Scotland Yard ratios
  const targetUnderground = 20; // Stations with underground (Scotland Yard authentic ratio)
  const targetBus = 80; // Stations with bus (but no underground)
  const targetTaxiOnly = 99; // Taxi-only stations

  console.log('\n📋 TARGET vs ACTUAL (Scotland Yard authentic ratios):');
  console.log(`Underground: ${undergroundStations.length}/${targetUnderground} (need ${Math.max(0, targetUnderground - undergroundStations.length)} more)`);
  console.log(`Bus: ${busStations.length}/${targetBus} (need ${Math.max(0, targetBus - busStations.length)} more)`);
  console.log(`Taxi-only: Will fill remaining ${targetTaxiOnly} stations with template`);

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
