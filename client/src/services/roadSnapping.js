/**
 * Road Snapping Service
 *
 * Snaps station coordinates to actual road intersections using Mapbox Tilequery API
 */

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * Calculate distance between two coordinates (Haversine formula)
 * @param {number} lng1 - Longitude of first point
 * @param {number} lat1 - Latitude of first point
 * @param {number} lng2 - Longitude of second point
 * @param {number} lat2 - Latitude of second point
 * @returns {number} Distance in meters
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
 * Find the closest point on a line segment to a given point
 * @param {Object} point - {lng, lat}
 * @param {Object} lineStart - {lng, lat}
 * @param {Object} lineEnd - {lng, lat}
 * @returns {Object} Closest point {lng, lat}
 */
function closestPointOnSegment(point, lineStart, lineEnd) {
  const dx = lineEnd.lng - lineStart.lng;
  const dy = lineEnd.lat - lineStart.lat;

  if (dx === 0 && dy === 0) {
    return lineStart;
  }

  const t = Math.max(0, Math.min(1,
    ((point.lng - lineStart.lng) * dx + (point.lat - lineStart.lat) * dy) /
    (dx * dx + dy * dy)
  ));

  return {
    lng: lineStart.lng + t * dx,
    lat: lineStart.lat + t * dy
  };
}

/**
 * Find the closest point on a line geometry to a given point
 * @param {Object} point - {lng, lat}
 * @param {Array} lineCoordinates - Array of [lng, lat] coordinates
 * @returns {Object} {point: {lng, lat}, distance: number}
 */
function closestPointOnLine(point, lineCoordinates) {
  let minDistance = Infinity;
  let closestPoint = null;

  for (let i = 0; i < lineCoordinates.length - 1; i++) {
    const segmentStart = { lng: lineCoordinates[i][0], lat: lineCoordinates[i][1] };
    const segmentEnd = { lng: lineCoordinates[i + 1][0], lat: lineCoordinates[i + 1][1] };

    const pointOnSegment = closestPointOnSegment(point, segmentStart, segmentEnd);
    const distance = calculateDistance(point.lng, point.lat, pointOnSegment.lng, pointOnSegment.lat);

    if (distance < minDistance) {
      minDistance = distance;
      closestPoint = pointOnSegment;
    }
  }

  return { point: closestPoint, distance: minDistance };
}

/**
 * Snap a coordinate to the nearest road using Mapbox Tilequery API
 * @param {number} lng - Longitude
 * @param {number} lat - Latitude
 * @param {number} radiusMeters - Search radius in meters (default: 100)
 * @returns {Promise<Object>} Snapped coordinate {lng, lat, roadName, distance}
 */
export async function snapToRoad(lng, lat, radiusMeters = 100) {
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
    throw new Error('Mapbox token not configured');
  }

  // Convert radius to approximate degrees (rough approximation)
  const radiusDegrees = radiusMeters / 111000; // 1 degree ≈ 111km

  const url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lng},${lat}.json?radius=${radiusDegrees * 111000}&limit=50&layers=road&access_token=${MAPBOX_TOKEN}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Tilequery failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      console.warn(`No roads found within ${radiusMeters}m of [${lng}, ${lat}]`);
      return {
        lng,
        lat,
        roadName: null,
        distance: 0,
        snapped: false
      };
    }

    // Filter for actual roads (exclude paths, service roads, etc.)
    const roads = data.features.filter(f =>
      f.geometry.type === 'LineString' &&
      f.properties.class &&
      ['motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'street', 'street_limited'].includes(f.properties.class)
    );

    if (roads.length === 0) {
      console.warn(`No major roads found near [${lng}, ${lat}]`);
      return {
        lng,
        lat,
        roadName: null,
        distance: 0,
        snapped: false
      };
    }

    // Find the closest point on any of the roads
    let closestSnap = null;
    let closestDistance = Infinity;
    let roadName = null;

    for (const road of roads) {
      const snap = closestPointOnLine({ lng, lat }, road.geometry.coordinates);

      if (snap.distance < closestDistance) {
        closestDistance = snap.distance;
        closestSnap = snap.point;
        roadName = road.properties.name || road.properties.class;
      }
    }

    return {
      lng: closestSnap.lng,
      lat: closestSnap.lat,
      roadName: roadName,
      distance: closestDistance,
      snapped: true
    };

  } catch (error) {
    console.error('Road snapping error:', error);
    // Return original coordinates if snapping fails
    return {
      lng,
      lat,
      roadName: null,
      distance: 0,
      snapped: false
    };
  }
}

/**
 * Snap multiple coordinates to roads in parallel
 * @param {Array} coordinates - Array of {lng, lat} objects
 * @param {number} radiusMeters - Search radius in meters
 * @returns {Promise<Array>} Array of snapped coordinates
 */
export async function snapMultipleToRoads(coordinates, radiusMeters = 100) {
  console.log(`🔧 Snapping ${coordinates.length} stations to roads...`);

  const snapPromises = coordinates.map(coord =>
    snapToRoad(coord.lng, coord.lat, radiusMeters)
  );

  const snappedCoords = await Promise.all(snapPromises);

  const successCount = snappedCoords.filter(c => c.snapped).length;
  console.log(`✅ Successfully snapped ${successCount}/${coordinates.length} stations to roads`);

  return snappedCoords;
}
