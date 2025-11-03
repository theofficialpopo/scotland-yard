/**
 * Scotland Yard Station Template
 *
 * Based on the classic Scotland Yard board game layout.
 * The original game has 199 stations (numbered 1-200 with station 108 or 200 missing).
 * Positions are relative (0-1 range) for x and y coordinates,
 * which will be scaled to fit any geographic bounding box.
 */

/**
 * Generate 199 stations in a well-distributed pattern
 * Mimics the Scotland Yard board game's extensive network
 */
function generateStationGrid() {
  const stations = [];
  const gridSize = Math.ceil(Math.sqrt(199)); // ~15x15 grid
  const cellSize = 1.0 / gridSize;

  // Generate grid positions with some randomization for natural layout
  for (let i = 0; i < 199; i++) {
    const row = Math.floor(i / gridSize);
    const col = i % gridSize;

    // Base position in grid
    const baseX = col * cellSize + cellSize / 2;
    const baseY = row * cellSize + cellSize / 2;

    // Add slight randomization (±25% of cell size) to avoid perfect grid
    // This makes the layout look more like a real city street network
    const randomX = (Math.random() - 0.5) * cellSize * 0.5;
    const randomY = (Math.random() - 0.5) * cellSize * 0.5;

    stations.push({
      x: Math.max(0.05, Math.min(0.95, baseX + randomX)),
      y: Math.max(0.05, Math.min(0.95, baseY + randomY))
    });
  }

  return stations;
}

export const SCOTLAND_YARD_TEMPLATE = {
  id: 'classic',
  name: 'Classic Scotland Yard',
  description: 'Original board game layout with 199 stations across the city',
  stationCount: 199,

  // Relative positions (0-1 range for both x and y)
  // x: 0 = west edge, 1 = east edge
  // y: 0 = south edge, 1 = north edge
  // Generated to cover the entire game area evenly like the original board
  stations: generateStationGrid()
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
