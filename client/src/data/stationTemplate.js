/**
 * Scotland Yard Station Template
 *
 * Based on the classic Scotland Yard board game layout.
 * Positions are relative (0-1 range) for x and y coordinates,
 * which will be scaled to fit any geographic bounding box.
 *
 * The layout mimics the original board game's distribution:
 * - Central cluster (city center)
 * - Scattered peripheral stations
 * - Natural clustering patterns
 */

export const SCOTLAND_YARD_TEMPLATE = {
  id: 'classic',
  name: 'Classic Scotland Yard',
  description: 'Original board game layout with 18 strategic stations',
  stationCount: 18,

  // Relative positions (0-1 range for both x and y)
  // x: 0 = west edge, 1 = east edge
  // y: 0 = south edge, 1 = north edge
  stations: [
    // Central cluster (like Central London in the original)
    { x: 0.45, y: 0.50 },  // Station 1 - Central west
    { x: 0.50, y: 0.52 },  // Station 2 - True center
    { x: 0.55, y: 0.50 },  // Station 3 - Central east
    { x: 0.48, y: 0.45 },  // Station 4 - South-central
    { x: 0.52, y: 0.55 },  // Station 5 - North-central

    // Northern stations
    { x: 0.35, y: 0.75 },  // Station 6 - Northwest
    { x: 0.50, y: 0.78 },  // Station 7 - North
    { x: 0.65, y: 0.72 },  // Station 8 - Northeast

    // Eastern stations
    { x: 0.75, y: 0.55 },  // Station 9 - East
    { x: 0.80, y: 0.40 },  // Station 10 - Southeast

    // Southern stations
    { x: 0.60, y: 0.25 },  // Station 11 - South-center
    { x: 0.45, y: 0.22 },  // Station 12 - South
    { x: 0.30, y: 0.28 },  // Station 13 - Southwest

    // Western stations
    { x: 0.20, y: 0.50 },  // Station 14 - West
    { x: 0.25, y: 0.62 },  // Station 15 - Northwest-west

    // Additional scattered stations for balance
    { x: 0.38, y: 0.38 },  // Station 16 - Southwest quadrant
    { x: 0.62, y: 0.62 },  // Station 17 - Northeast quadrant
    { x: 0.42, y: 0.68 }   // Station 18 - North-west quadrant
  ]
};

/**
 * Scale template stations to a geographic bounding box
 *
 * @param {Array} bbox - Bounding box [[swLng, swLat], [neLng, neLat]]
 * @returns {Array} Array of {lng, lat} coordinates
 */
export function scaleStationsToBox(bbox) {
  const [[swLng, swLat], [neLng, neLat]] = bbox;

  const lngRange = neLng - swLng;
  const latRange = neLat - swLat;

  return SCOTLAND_YARD_TEMPLATE.stations.map(station => ({
    lng: swLng + (station.x * lngRange),
    lat: swLat + (station.y * latRange)
  }));
}

/**
 * Add slight randomness to station positions to make them feel more natural
 * (optional, can be disabled for exact template matching)
 *
 * @param {Array} stations - Array of {lng, lat} coordinates
 * @param {number} jitterPercent - Amount of random jitter (0-0.1 recommended)
 * @returns {Array} Jittered station coordinates
 */
export function addJitter(stations, jitterPercent = 0.03) {
  return stations.map(station => ({
    lng: station.lng + (Math.random() - 0.5) * jitterPercent,
    lat: station.lat + (Math.random() - 0.5) * jitterPercent
  }));
}
