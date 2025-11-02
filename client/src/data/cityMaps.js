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
    // This creates a bounded rectangular area for the game board
    bounds: [
      [-0.5103, 51.2867],  // Southwest corner (min lon, min lat)
      [0.3340, 51.6918]    // Northeast corner (max lon, max lat)
    ],

    // Zoom levels
    zoom: 12,        // Default zoom
    minZoom: 11,     // Prevent zooming out too far
    maxZoom: 14,     // Prevent zooming in too close

    // Visual settings
    style: 'mapbox://styles/mapbox/dark-v11',  // Dark theme for Scotland Yard feel

    // Game settings (future use)
    recommendedStations: 20,  // Suggested number of stations for this map size
    area: 'central'           // Area classification
  },

  newyork: {
    id: 'newyork',
    name: 'New York',
    description: 'Manhattan - The Big Apple',

    center: [-74.0060, 40.7128],

    bounds: [
      [-74.0479, 40.6829],  // Southwest
      [-73.9372, 40.7834]   // Northeast
    ],

    zoom: 12,
    minZoom: 11,
    maxZoom: 14,

    style: 'mapbox://styles/mapbox/dark-v11',

    recommendedStations: 22,
    area: 'manhattan'
  },

  paris: {
    id: 'paris',
    name: 'Paris',
    description: 'Central Paris - City of Lights',

    center: [2.3522, 48.8566],

    bounds: [
      [2.2241, 48.8156],   // Southwest
      [2.4699, 48.9022]    // Northeast
    ],

    zoom: 12,
    minZoom: 11,
    maxZoom: 14,

    style: 'mapbox://styles/mapbox/dark-v11',

    recommendedStations: 20,
    area: 'central'
  },

  berlin: {
    id: 'berlin',
    name: 'Berlin',
    description: 'Central Berlin - Historic Center',

    center: [13.4050, 52.5200],

    bounds: [
      [13.2288, 52.4329],  // Southwest
      [13.5582, 52.6171]   // Northeast
    ],

    zoom: 12,
    minZoom: 11,
    maxZoom: 14,

    style: 'mapbox://styles/mapbox/dark-v11',

    recommendedStations: 18,
    area: 'mitte'
  },

  tokyo: {
    id: 'tokyo',
    name: 'Tokyo',
    description: 'Central Tokyo - Shibuya & Shinjuku',

    center: [139.7690, 35.6762],

    bounds: [
      [139.6291, 35.6262],  // Southwest
      [139.8089, 35.7262]   // Northeast
    ],

    zoom: 12,
    minZoom: 11,
    maxZoom: 14,

    style: 'mapbox://styles/mapbox/dark-v11',

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
