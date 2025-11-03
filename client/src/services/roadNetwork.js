/**
 * Road Network Service
 *
 * Fetches road data from Mapbox Tilequery API and detects intersections
 * for intelligent station placement
 */

import * as turf from '@turf/turf';

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

/**
 * Fetch road network for an area using Mapbox Tilequery API
 *
 * @param {Object} center - Center coordinates {lng, lat}
 * @param {Array} roadClasses - Array of road classes to include
 * @param {number} radiusMeters - Search radius in meters
 * @returns {Promise<Array>} Array of road features
 */
export async function fetchRoadNetwork(center, roadClasses, radiusMeters = 2000) {
  if (!MAPBOX_TOKEN || MAPBOX_TOKEN === 'your_mapbox_token_here') {
    throw new Error('Mapbox token not configured');
  }

  const { lng, lat } = center;

  // Mapbox Tilequery API
  // Fetch road features within radius (limit 50 is API maximum)
  const url = `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8/tilequery/${lng},${lat}.json?radius=${radiusMeters}&layers=road&limit=50&access_token=${MAPBOX_TOKEN}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Road network fetch failed: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      console.warn('No roads found in this area');
      return [];
    }

    // Filter roads by class
    const filteredRoads = data.features.filter(feature => {
      const roadClass = feature.properties.class;
      return roadClasses.includes(roadClass);
    });

    console.log(`Found ${filteredRoads.length} roads matching classes:`, roadClasses);

    return filteredRoads;
  } catch (error) {
    console.error('Road network fetch error:', error);
    throw error;
  }
}

/**
 * Detect intersections in a road network
 *
 * @param {Array} roads - Array of road features from fetchRoadNetwork
 * @param {number} minRoads - Minimum number of roads at intersection (default 3)
 * @returns {Array} Array of intersection points with metadata
 */
export function detectIntersections(roads, minRoads = 3) {
  const intersections = [];
  const processedPoints = new Map();  // Track unique intersection points

  // Convert roads to turf LineStrings for easier geometric operations
  const roadLines = roads.map((road, index) => ({
    line: turf.lineString(road.geometry.coordinates),
    feature: road,
    index: index
  }));

  // Find all pairwise intersections
  for (let i = 0; i < roadLines.length; i++) {
    for (let j = i + 1; j < roadLines.length; j++) {
      try {
        const intersection = turf.lineIntersect(roadLines[i].line, roadLines[j].line);

        if (intersection.features.length > 0) {
          // Process each intersection point
          intersection.features.forEach(point => {
            const coords = point.geometry.coordinates;
            const key = `${coords[0].toFixed(6)},${coords[1].toFixed(6)}`;

            if (!processedPoints.has(key)) {
              // New intersection point - count how many roads meet here
              const roadsAtPoint = countRoadsAtPoint(coords, roadLines);

              if (roadsAtPoint.length >= minRoads) {
                processedPoints.set(key, {
                  coordinates: coords,
                  roadCount: roadsAtPoint.length,
                  roads: roadsAtPoint,
                  roadClasses: roadsAtPoint.map(r => r.feature.properties.class),
                  roadNames: roadsAtPoint
                    .map(r => r.feature.properties.name)
                    .filter(name => name)  // Remove null names
                });
              }
            }
          });
        }
      } catch (error) {
        // Skip invalid intersections
        console.warn('Intersection detection error:', error.message);
      }
    }
  }

  // Convert map to array and sort by road count (more roads = better intersection)
  const sortedIntersections = Array.from(processedPoints.values())
    .sort((a, b) => b.roadCount - a.roadCount);

  console.log(`Detected ${sortedIntersections.length} valid intersections`);

  return sortedIntersections;
}

/**
 * Count how many roads pass through a specific point
 *
 * @param {Array} point - Coordinates [lng, lat]
 * @param {Array} roadLines - Array of road line features
 * @param {number} tolerance - Distance tolerance in meters (default 10m)
 * @returns {Array} Array of roads passing through the point
 */
function countRoadsAtPoint(point, roadLines, tolerance = 0.00015) {
  const pointFeature = turf.point(point);
  const roadsAtPoint = [];

  roadLines.forEach(roadLine => {
    try {
      // Check if point is on or very close to this road
      const distance = turf.pointToLineDistance(pointFeature, roadLine.line, { units: 'degrees' });

      if (distance < tolerance) {
        roadsAtPoint.push(roadLine);
      }
    } catch (error) {
      // Skip invalid geometries
    }
  });

  return roadsAtPoint;
}

/**
 * Calculate importance score for an intersection
 * Higher score = more important intersection
 *
 * @param {Object} intersection - Intersection object from detectIntersections
 * @returns {number} Importance score
 */
export function calculateIntersectionScore(intersection) {
  let score = 0;

  // Base score from number of roads
  score += intersection.roadCount * 10;

  // Bonus for major roads
  const roadClassScores = {
    'motorway': 50,
    'trunk': 40,
    'primary': 30,
    'secondary': 20,
    'tertiary': 10,
    'residential': 5,
    'unclassified': 2
  };

  intersection.roadClasses.forEach(roadClass => {
    score += roadClassScores[roadClass] || 0;
  });

  // Bonus for having road names (usually more important)
  const namedRoads = intersection.roadNames.filter(name => name && name.length > 0);
  score += namedRoads.length * 5;

  return score;
}

/**
 * Filter intersections by spatial distribution
 * Ensures stations are spread out across the map
 *
 * @param {Array} intersections - Array of intersection objects
 * @param {number} minDistance - Minimum distance between intersections in meters
 * @param {number} targetCount - Target number of intersections to return
 * @returns {Array} Filtered array of intersections
 */
export function filterByDistribution(intersections, minDistance, targetCount) {
  if (intersections.length <= targetCount) {
    return intersections;
  }

  // Add importance scores
  const scored = intersections.map(intersection => ({
    ...intersection,
    score: calculateIntersectionScore(intersection)
  }));

  // Sort by score (highest first)
  scored.sort((a, b) => b.score - a.score);

  const selected = [];
  const minDistanceDegrees = minDistance / 111320;  // Convert meters to degrees (approximate)

  for (const intersection of scored) {
    if (selected.length >= targetCount) break;

    // Check if far enough from already selected intersections
    const isFarEnough = selected.every(selectedIntersection => {
      const distance = turf.distance(
        turf.point(intersection.coordinates),
        turf.point(selectedIntersection.coordinates),
        { units: 'degrees' }
      );
      return distance >= minDistanceDegrees;
    });

    if (isFarEnough) {
      selected.push(intersection);
    }
  }

  // If we didn't get enough intersections, relax the distance constraint
  if (selected.length < targetCount && minDistance > 50) {
    console.log(`Only found ${selected.length}/${targetCount} intersections with ${minDistance}m spacing. Relaxing constraint...`);
    return filterByDistribution(intersections, minDistance * 0.7, targetCount);
  }

  console.log(`Selected ${selected.length} well-distributed intersections`);

  return selected;
}
