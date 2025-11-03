/**
 * Geocoding Service
 *
 * Converts addresses to coordinates using Mapbox Geocoding API
 * and classifies area density for intelligent station generation
 */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * Area density types for different location contexts
 * Determines which roads to use and how many stations to generate
 */
export const AREA_TYPES = {
  MAJOR_CITY: {
    id: 'MAJOR_CITY',
    name: 'Major City',
    description: 'Large metropolitan area (>1M population)',
    roadClasses: ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'],  // Include more road types
    minRoadSpacing: 300,  // meters between stations
    stationCount: 18,     // Reduced to match existing game configs
    searchRadius: 1500    // Smaller radius for denser coverage
  },
  CITY: {
    id: 'CITY',
    name: 'City',
    description: 'Mid-size city (100K-1M population)',
    roadClasses: ['motorway', 'trunk', 'primary', 'secondary', 'tertiary'],
    minRoadSpacing: 250,
    stationCount: 16,
    searchRadius: 1500
  },
  SUBURB: {
    id: 'SUBURB',
    name: 'Suburb',
    description: 'Suburban area',
    roadClasses: ['primary', 'secondary', 'tertiary'],
    minRoadSpacing: 250,
    stationCount: 16,
    searchRadius: 1500
  },
  TOWN: {
    id: 'TOWN',
    name: 'Town',
    description: 'Small town (10K-100K population)',
    roadClasses: ['secondary', 'tertiary', 'residential'],
    minRoadSpacing: 150,
    stationCount: 15,
    searchRadius: 1200
  },
  RURAL: {
    id: 'RURAL',
    name: 'Rural',
    description: 'Rural area or small village',
    roadClasses: ['tertiary', 'residential', 'unclassified'],
    minRoadSpacing: 100,
    stationCount: 12,
    searchRadius: 1000
  }
};

/**
 * Geocode an address to coordinates and context
 *
 * @param {string} address - The address to geocode
 * @returns {Promise<Object>} Geocoding result with coordinates and context
 */
export async function geocodeAddress(address) {
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
    throw new Error('Mapbox token not configured');
  }

  const encodedAddress = encodeURIComponent(address);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodedAddress}.json?access_token=${MAPBOX_TOKEN}&types=address,place,locality,neighborhood`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      throw new Error('No results found for this address');
    }

    // Get the first (best) result
    const feature = data.features[0];
    const [lng, lat] = feature.center;

    // Extract context information
    const context = feature.context || [];
    const placeType = feature.place_type[0];

    return {
      address: feature.place_name,
      coordinates: { lng, lat },
      placeType: placeType,
      context: extractContext(context),
      bbox: feature.bbox,  // Bounding box if available
      relevance: feature.relevance
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    throw error;
  }
}

/**
 * Extract useful context from Mapbox context array
 *
 * @param {Array} contextArray - Mapbox context array
 * @returns {Object} Extracted context information
 */
function extractContext(contextArray) {
  const context = {
    neighborhood: null,
    locality: null,
    place: null,
    region: null,
    country: null
  };

  contextArray.forEach(item => {
    const id = item.id.split('.')[0];
    context[id] = item.text;
  });

  return context;
}

/**
 * Classify area density based on geocoding result
 *
 * @param {Object} geocodingResult - Result from geocodeAddress()
 * @returns {Object} Area type configuration from AREA_TYPES
 */
export function classifyAreaDensity(geocodingResult) {
  const { placeType, context } = geocodingResult;

  // Check for major cities (known metropolitan areas)
  const majorCities = [
    'london', 'new york', 'tokyo', 'paris', 'beijing', 'shanghai',
    'los angeles', 'chicago', 'houston', 'phoenix', 'philadelphia',
    'san antonio', 'san diego', 'dallas', 'san jose', 'austin',
    'berlin', 'madrid', 'rome', 'barcelona', 'moscow', 'istanbul',
    'mumbai', 'delhi', 'bangalore', 'singapore', 'hong kong',
    'sydney', 'melbourne', 'toronto', 'vancouver', 'montreal'
  ];

  const placeName = (context.place || context.locality || '').toLowerCase();

  if (majorCities.some(city => placeName.includes(city))) {
    return AREA_TYPES.MAJOR_CITY;
  }

  // Classify based on place type
  switch (placeType) {
    case 'address':
      // Address - likely residential, check if in major city context
      if (context.place && majorCities.some(city => context.place.toLowerCase().includes(city))) {
        return AREA_TYPES.MAJOR_CITY;
      }
      // If in a named locality, likely suburb
      if (context.locality) {
        return AREA_TYPES.SUBURB;
      }
      // Otherwise town or rural
      return AREA_TYPES.TOWN;

    case 'neighborhood':
      // Neighborhood - likely urban or suburban
      if (context.place && majorCities.some(city => context.place.toLowerCase().includes(city))) {
        return AREA_TYPES.CITY;
      }
      return AREA_TYPES.SUBURB;

    case 'locality':
      // Locality - could be town or city
      // Use population heuristics if available
      return AREA_TYPES.TOWN;

    case 'place':
      // Place - city or town
      if (majorCities.some(city => placeName.includes(city))) {
        return AREA_TYPES.MAJOR_CITY;
      }
      return AREA_TYPES.CITY;

    default:
      // Default to suburb for safety
      return AREA_TYPES.SUBURB;
  }
}

/**
 * Get area type configuration by ID
 *
 * @param {string} areaTypeId - ID of area type
 * @returns {Object} Area type configuration
 */
export function getAreaType(areaTypeId) {
  return AREA_TYPES[areaTypeId] || AREA_TYPES.SUBURB;
}

/**
 * Calculate bounding box around a point
 *
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {number} radiusMeters - Radius in meters
 * @returns {Array} Bounding box [[swLng, swLat], [neLng, neLat]]
 */
export function calculateBounds(lng, lat, radiusMeters) {
  // Approximate degrees per meter
  // 1 degree latitude ≈ 110,574 meters
  // 1 degree longitude varies by latitude
  const latDegreePerMeter = 1 / 110574;
  const lngDegreePerMeter = 1 / (111320 * Math.cos(lat * Math.PI / 180));

  const latDelta = radiusMeters * latDegreePerMeter;
  const lngDelta = radiusMeters * lngDegreePerMeter;

  return [
    [lng - lngDelta, lat - latDelta],  // Southwest
    [lng + lngDelta, lat + latDelta]   // Northeast
  ];
}
