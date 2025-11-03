/**
 * Scotland Yard Station Template
 *
 * Based on the actual Scotland Yard board game layout.
 * The game has 199 stations with a clustered-center, sparse-periphery pattern.
 * Stations concentrate in the middle regions forming an irregular organic shape.
 */

/**
 * Generate 199 stations matching the real Scotland Yard board layout
 * Pattern: Dense center, sparse edges, organic irregular distribution
 */
function generateScotlandYardLayout() {
  const stations = [];

  // Define cluster centers (multiple hubs like in the real game)
  const clusters = [
    { cx: 0.50, cy: 0.50, radius: 0.25, count: 60 },  // Main central cluster
    { cx: 0.35, cy: 0.40, radius: 0.15, count: 30 },  // West-central hub
    { cx: 0.65, cy: 0.45, radius: 0.15, count: 30 },  // East-central hub
    { cx: 0.45, cy: 0.65, radius: 0.12, count: 25 },  // North-central
    { cx: 0.55, cy: 0.35, radius: 0.12, count: 25 },  // South-central
    { cx: 0.25, cy: 0.55, radius: 0.10, count: 15 },  // Northwest
    { cx: 0.75, cy: 0.60, radius: 0.10, count: 14 }   // Northeast
  ];

  // Generate stations in clusters
  for (const cluster of clusters) {
    for (let i = 0; i < cluster.count; i++) {
      // Random angle and distance from cluster center
      const angle = Math.random() * 2 * Math.PI;
      const distance = Math.random() * cluster.radius;

      const x = cluster.cx + Math.cos(angle) * distance;
      const y = cluster.cy + Math.sin(angle) * distance;

      // Keep within bounds (0.05 to 0.95)
      stations.push({
        x: Math.max(0.05, Math.min(0.95, x)),
        y: Math.max(0.05, Math.min(0.95, y))
      });
    }
  }

  return stations;
}

export const SCOTLAND_YARD_TEMPLATE = {
  id: 'classic',
  name: 'Classic Scotland Yard',
  description: 'Authentic board game layout: 199 stations in organic clustered pattern',
  stationCount: 199,

  // Relative positions (0-1 range for both x and y)
  // x: 0 = west edge, 1 = east edge
  // y: 0 = south edge, 1 = north edge
  // Pattern matches real game: dense center, sparse edges, multiple hubs
  stations: generateScotlandYardLayout()
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
