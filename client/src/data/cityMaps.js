/**
 * City Map Configurations
 *
 * Defines bounded map areas for each city with consistent viewport settings.
 * Each city has specific bounds to create a consistent game board feeling.
 */

export const CITY_CONFIGS = {
  london: {
    id: 'london',
    name: 'London',
    description: 'Classic Scotland Yard map - Central London',

    // Map center point [longitude, latitude]
    center: [-0.1278, 51.5074],

    // Southwest and Northeast corner bounds [longitude, latitude]
    // 3km x 3km area for optimal gameplay and performance
    bounds: [
      [-0.1493, 51.4939],  // Southwest corner
      [-0.1063, 51.5208]   // Northeast corner
    ],

    // Zoom levels
    zoom: 12.5,      // Default zoom (larger viewport)
    minZoom: 11.5,   // Allow more zoom out
    maxZoom: 16,     // Allow closer zoom for detail

    // Visual settings
    style: 'mapbox://styles/mapbox/streets-v12',  // Standard streets map

    // Game settings (future use)
    recommendedStations: 20,  // Suggested number of stations for this map size
    area: 'central'           // Area classification
  },

  newyork: {
    id: 'newyork',
    name: 'New York',
    description: 'Manhattan - The Big Apple',

    center: [-74.0060, 40.7128],

    // Compact 1.5km x 1.5km area (Midtown Manhattan)
    bounds: [
      [-74.0149, 40.7060],  // Southwest
      [-73.9971, 40.7195]   // Northeast
    ],

    zoom: 12.5,
    minZoom: 11.5,
    maxZoom: 16,

    style: 'mapbox://styles/mapbox/streets-v12',

    recommendedStations: 22,
    area: 'manhattan'
  },

  paris: {
    id: 'paris',
    name: 'Paris',
    description: 'Central Paris - City of Lights',

    center: [2.3522, 48.8566],

    // Compact 1.5km x 1.5km area (Around Louvre)
    bounds: [
      [2.3419, 48.8498],   // Southwest
      [2.3625, 48.8633]    // Northeast
    ],

    zoom: 12.5,
    minZoom: 11.5,
    maxZoom: 16,

    style: 'mapbox://styles/mapbox/streets-v12',

    recommendedStations: 20,
    area: 'central'
  },

  berlin: {
    id: 'berlin',
    name: 'Berlin',
    description: 'Central Berlin - Historic Center',

    center: [13.4050, 52.5200],

    // Compact 1.5km x 1.5km area (Brandenburg Gate area)
    bounds: [
      [13.3939, 52.5132],  // Southwest
      [13.4161, 52.5267]   // Northeast
    ],

    zoom: 12.5,
    minZoom: 11.5,
    maxZoom: 16,

    style: 'mapbox://styles/mapbox/streets-v12',

    recommendedStations: 18,
    area: 'mitte'
  },

  tokyo: {
    id: 'tokyo',
    name: 'Tokyo',
    description: 'Central Tokyo - Shibuya & Shinjuku',

    center: [139.7690, 35.6762],

    // Compact 1.5km x 1.5km area (Shibuya Station area)
    bounds: [
      [139.7606, 35.6694],  // Southwest
      [139.7774, 35.6829]   // Northeast
    ],

    zoom: 12.5,
    minZoom: 11.5,
    maxZoom: 16,

    style: 'mapbox://styles/mapbox/streets-v12',

    recommendedStations: 24,
    area: 'central'
  }
};

/**
 * Get list of all available cities
 */
export function getAvailableCities() {
  return Object.values(CITY_CONFIGS);
}

/**
 * Get city configuration by ID
 */
export function getCityConfig(cityId) {
  return CITY_CONFIGS[cityId] || CITY_CONFIGS.london;  // Default to London
}

/**
 * Check if coordinates are within city bounds
 */
export function isWithinBounds(lng, lat, cityId) {
  const city = getCityConfig(cityId);
  const [[swLng, swLat], [neLng, neLat]] = city.bounds;

  return lng >= swLng && lng <= neLng && lat >= swLat && lat <= neLat;
}

/**
 * Calculate the area of a city's bounds in square kilometers (approximate)
 */
export function getCityArea(cityId) {
  const city = getCityConfig(cityId);
  const [[swLng, swLat], [neLng, neLat]] = city.bounds;

  // Haversine approximation for small areas
  const lngDiff = neLng - swLng;
  const latDiff = neLat - swLat;

  // Rough conversion (1 degree ≈ 111km at equator, varies by latitude)
  const avgLat = (swLat + neLat) / 2;
  const kmPerLngDegree = 111.32 * Math.cos(avgLat * Math.PI / 180);
  const kmPerLatDegree = 110.57;

  const width = lngDiff * kmPerLngDegree;
  const height = latDiff * kmPerLatDegree;

  return width * height;
}
