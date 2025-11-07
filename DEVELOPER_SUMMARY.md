# Scotland Yard - Automated Game Board Generator
## Developer Summary & Technical Overview

## Project Overview

This is an automated game board generator for **Scotland Yard**, the classic Ravensburger detective board game. The system generates playable game boards for any location worldwide using real transit data from OpenStreetMap, while maintaining authentic Scotland Yard game mechanics and visual design.

## What is Scotland Yard?

Scotland Yard is a board game where:
- **1 player** is "Mr. X" (the criminal trying to escape)
- **2-5 players** are detectives trying to catch Mr. X
- Players move across a network of 199 numbered stations using three transport types:
  - **Taxi** (yellow) - Short distances, available at most stations
  - **Bus** (green) - Medium distances, available at fewer stations
  - **Underground** (red) - Long distances, available at only 20 strategic stations
- The board is a map with stations connected by colored routes

## Core Game Mechanics

### Station Type Distribution (Authentic Scotland Yard Ratios)

**199 Total Stations**:
1. **20 Underground Stations** (Red)
   - Have ALL 3 transport modes: taxi + bus + underground
   - Strategic long-distance hubs
   - Minimum 700m spacing between underground stations
   - Examples: Major train/metro/subway stations

2. **80 Bus Stations** (Green)
   - Have 2 transport modes: taxi + bus
   - Medium-distance tactical movement
   - No minimum spacing requirement
   - Examples: Bus stops, smaller transit stations

3. **99 Taxi-Only Stations** (Yellow)
   - Have 1 transport mode: taxi only
   - Short-distance local movement
   - Fill gaps between major stations
   - Generated using template positions

### Strategic Spacing

**Underground stations** have a **700-meter minimum distance** requirement to ensure:
- Underground travel is strategic for long-distance escapes
- Prevents "short hop" underground movement
- Creates natural game balance between transport types

**Bus and Taxi stations** have no minimum distance requirement for flexible coverage.

## Visual Design - Authentic Scotland Yard Symbols

### Station Symbol Structure

Each station uses the **authentic Ravensburger Scotland Yard design**:

```
     ╭─────╮
    │  🔴  │  ← Top: Semicircle (colored by transport type)
    │       │
    │  [N]  │  ← Station number in white circle
    │       │
    └─┬───┬─┘  ← Bottom: Rectangle (colored by transport type)
```

### Color Coding

- **Red (#E63946)**: Underground stations (3 modes: taxi + bus + underground)
- **Green (#86BC25)**: Bus stations (2 modes: taxi + bus)
- **Yellow (#F9D71C)**: Taxi stations (1 mode: taxi only)

Both semicircle and rectangle are the same color to indicate available transport modes.

## Technical Architecture

### Tech Stack

**Frontend**:
- React (Vite)
- react-map-gl (Mapbox GL JS wrapper)
- SVG for station symbols

**Backend/APIs**:
- OpenStreetMap Overpass API (real transit data)
- Mapbox GL JS (map display)
- Mapbox Geocoding API (address search)

**Data Sources**:
- OSM transit stations (railway=station, station=subway, highway=bus_stop)
- Template-based fallback positions

### Project Structure

```
client/src/
├── MapTest.jsx                    # Main UI component
├── components/
│   ├── AddressInput.jsx          # Address search input
│   ├── MapDisplay.jsx            # Mapbox map wrapper
│   └── StationSymbol.jsx         # SVG station symbol rendering
├── services/
│   ├── geocoding.js              # Address geocoding
│   ├── transitDataFetcher.js     # OSM data fetching & classification
│   └── stationGenerator.js       # Station selection & placement
└── data/
    └── stationTemplate.js         # Fallback station positions

Documentation:
├── DEVELOPER_SUMMARY.md           # This file
├── GAME_MECHANICS.md              # Game rules & mechanics
├── STATION_SYMBOLS.md             # Visual design guide
└── IMPROVEMENTS.md                # Recent improvements log
```

### Key Components

#### 1. `transitDataFetcher.js` - Real Transit Data Acquisition

**Purpose**: Fetch and classify real transit stations from OpenStreetMap.

**Key Functions**:
- `fetchTransitStationsForGameBoard(bounds, center)` - Main entry point
- `fetchRailStationsFromOSM()` - Query rail/metro/subway/tram stations
- `fetchBusStopsFromOSM()` - Query bus stops
- `calculateStationQuality()` - Score stations by importance

**OSM Queries**:
```javascript
// Rail stations query
railway=station        // Major train stations (score: 80)
station=subway         // Subway/metro (score: 100)
railway=halt           // Small train stops (score: 20)
railway=tram_stop      // Tram stops (score: 5, EXCLUDED from underground)
station=light_rail     // Light rail (score: 40)

// Bus stops query
highway=bus_stop       // Bus stops
public_transport=stop_position[bus=yes]  // Bus stop positions
```

**Smart Classification**:
- Filters tram stops from underground category (353/378 in Köln were tram stops!)
- Prioritizes subway/metro stations over regular train stations
- Quality scoring based on tags (operator, network, station type)

**Deduplication**:
- Groups stations by exact name match
- Keeps highest quality score per unique name
- Removes geographic duplicates (same coordinates)

**Console Logging**:
- Comprehensive logs show classification process
- Examples of removed duplicates
- Quality scores for each station type

#### 2. `stationGenerator.js` - Intelligent Station Selection

**Purpose**: Select optimal stations with spatial distribution and minimum distance filtering.

**Key Functions**:
- `generateGameBoardFromBounds(bounds, center)` - Main generator
- `selectStationsWithDistribution()` - Quadrant-based selection
- `assignStationTypes()` - Assign transport modes
- `calculateDistance()` - Haversine distance calculation

**Spatial Distribution Algorithm**:

```javascript
// 1. Divide game area into 4 quadrants (NE, NW, SE, SW)
const quadrants = ['NE', 'NW', 'SE', 'SW'];

// 2. Select ~5 underground stations per quadrant (20 total / 4)
// 3. Select ~20 bus stations per quadrant (80 total / 4)

// 4. Within each quadrant, sort by:
//    - Quality score (descending) - prioritize important stations
//    - Distance from center (ascending) - prefer accessible locations

// 5. Apply 700m minimum distance filter for underground stations
```

**Minimum Distance Filter**:
```javascript
const UNDERGROUND_MIN_DISTANCE = 700; // meters

function isFarEnoughFromSelected(station) {
  for (const selectedStation of selected) {
    const distance = calculateDistance(station, selectedStation);
    if (distance < 700) return false; // Too close, skip
  }
  return true;
}
```

**Fallback Strategy**:
- If insufficient real stations available, use template positions
- Template has organic clustered layout matching Scotland Yard board
- 199 pre-defined positions in realistic city layout

#### 3. `StationSymbol.jsx` - Authentic Visual Rendering

**Purpose**: Render Scotland Yard station symbols using SVG.

**Symbol Design**:
```svg
<svg viewBox="0 0 100 110">
  <!-- Top semicircle -->
  <path d="M 20,50 A 30,30 0 0,1 80,50 Z" fill={color} />

  <!-- Bottom rectangle -->
  <rect x="35" y="50" width="30" height="40" fill={color} />

  <!-- White circle for number -->
  <circle cx="50" cy="55" r="18" fill="#FFFFFF" />

  <!-- Station number -->
  <text x="50" y="60">{station.id}</text>
</svg>
```

**Interactive Features**:
- Hover: 40% scale increase (1.0x → 1.4x)
- Drop shadow for depth
- Smooth CSS transitions
- Z-index layering (Underground: 30, Bus: 20, Taxi: 10)

#### 4. `MapTest.jsx` - Main UI

**Purpose**: Orchestrate the entire board generation workflow.

**User Flow**:
1. Enter address → Geocode location
2. Display map centered on location
3. User adjusts zoom/pan to desired game area
4. Click "Generate Board" → Create 199 stations
5. Display stations with authentic symbols

**State Management**:
```javascript
const [gameBoard, setGameBoard] = useState(null);
const [locationData, setLocationData] = useState(null);
const [generating, setGenerating] = useState(false);
const [hoveredStation, setHoveredStation] = useState(null);
```

**UI Elements**:
- Address input with autocomplete
- Map display (Mapbox GL JS)
- Generate/Research buttons
- Station list sidebar (199 stations with colors)
- Station markers with hover effects

## Data Flow

### Complete Generation Pipeline

```
1. USER INPUT
   └─> Enter address (e.g., "Times Square, New York")

2. GEOCODING
   └─> Mapbox Geocoding API
       └─> Returns: { lng: -73.9876, lat: 40.7553 }

3. MAP DISPLAY
   └─> User adjusts viewport
       └─> Captures: bounds [[swLng, swLat], [neLng, neLat]]

4. TRANSIT DATA FETCHING (transitDataFetcher.js)
   ├─> OSM Overpass API Call 1: Rail stations
   │   └─> Returns: 420 rail/metro/subway/tram stations
   │       ├─> Classify: 14 subway, 406 train, 0 tram (excluded)
   │       ├─> Quality score: subway=205, train=95-105
   │       └─> Deduplicate: 420 → 313 unique stations
   │
   └─> OSM Overpass API Call 2: Bus stops
       └─> Returns: 5,457 bus stops
           ├─> Quality score: 10-20 points
           └─> Deduplicate: 5,457 → 3,136 unique stops

5. SPATIAL DISTRIBUTION (stationGenerator.js)
   ├─> Underground (20 stations)
   │   ├─> Divide into quadrants (NE: 87, NW: 12, SE: 140, SW: 74)
   │   ├─> Select ~5 per quadrant
   │   ├─> Apply 700m minimum distance filter
   │   └─> Sort by quality + distance
   │
   ├─> Bus (80 stations)
   │   ├─> Divide into quadrants (NE: 970, NW: 348, SE: 1116, SW: 702)
   │   ├─> Select ~20 per quadrant
   │   └─> Sort by quality + distance
   │
   └─> Taxi (99 stations)
       └─> Use template positions

6. STATION ASSIGNMENT
   ├─> Station 1-20: Underground (types: ['taxi', 'bus', 'underground'])
   ├─> Station 21-100: Bus (types: ['taxi', 'bus'])
   └─> Station 101-199: Taxi (types: ['taxi'])

7. RENDERING
   └─> MapTest.jsx displays:
       ├─> 199 station markers (StationSymbol components)
       ├─> Authentic symbols (semicircle + rectangle)
       └─> Colors: Red (underground), Green (bus), Yellow (taxi)
```

## Key Algorithms

### 1. Station Quality Scoring

```javascript
function calculateStationQuality(tags) {
  let score = 0;

  // Station type
  if (tags.station === 'subway') score += 100;
  if (tags.railway === 'station') score += 80;
  if (tags.station === 'light_rail') score += 40;
  if (tags.railway === 'halt') score += 20;
  if (tags.railway === 'tram_stop') score += 5;

  // Additional quality indicators
  if (tags.operator) score += 10;
  if (tags.network) score += 5;
  if (tags.public_transport === 'station') score += 10;

  return score;
}
```

### 2. Quadrant-Based Selection

```javascript
function selectStationsWithDistribution(stations, center, targetCount, minDistance) {
  // 1. Classify into quadrants
  const byQuadrant = {
    NE: stations.filter(s => s.lat >= center.lat && s.lng >= center.lng),
    NW: stations.filter(s => s.lat >= center.lat && s.lng < center.lng),
    SE: stations.filter(s => s.lat < center.lat && s.lng >= center.lng),
    SW: stations.filter(s => s.lat < center.lat && s.lng < center.lng)
  };

  // 2. Calculate per-quadrant target
  const perQuadrantTarget = Math.ceil(targetCount / 4);

  // 3. Select from each quadrant
  const selected = [];
  for (const quad of ['NE', 'NW', 'SE', 'SW']) {
    const quadStations = byQuadrant[quad]
      .sort((a, b) => {
        // Sort by quality (desc), then distance (asc)
        const qualityDiff = b.qualityScore - a.qualityScore;
        if (qualityDiff !== 0) return qualityDiff;
        return a.distanceFromCenter - b.distanceFromCenter;
      });

    // Take best stations respecting minimum distance
    for (const station of quadStations) {
      if (selected.length >= targetCount) break;
      if (isFarEnoughFromSelected(station, selected, minDistance)) {
        selected.push(station);
      }
    }
  }

  return selected;
}
```

### 3. Haversine Distance Calculation

```javascript
function calculateDistance(lng1, lat1, lng2, lat2) {
  const R = 6371000; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distance in meters
}
```

## Configuration & Constants

### Scotland Yard Ratios
```javascript
const SCOTLAND_YARD_RATIOS = {
  underground: 20,  // Stations with underground access
  bus: 80,          // Stations with bus (but no underground)
  taxiOnly: 99,     // Taxi-only stations
  total: 199        // Total game board stations
};
```

### Underground Spacing
```javascript
const UNDERGROUND_MIN_DISTANCE = 700; // meters
```

### Station Colors
```javascript
const COLORS = {
  TAXI: '#F9D71C',       // Yellow
  BUS: '#86BC25',        // Green
  UNDERGROUND: '#E63946'  // Red
};
```

### OSM Query Radius
```javascript
const railRadius = radiusMeters * 1.5;  // Slightly larger for rail stations
const busRadius = radiusMeters;         // Standard radius for bus stops
```

## Example Output (Times Square, NYC)

### Console Logs
```
🎲 FETCHING TRANSIT DATA FOR GAME BOARD (PURE OSM APPROACH)
================================================================================
Bounding box: SW[-74.0701, 40.7257] NE[-73.9053, 40.7849]
Estimated radius: 9146m

🚂 Query 1: Fetching RAIL/TRAIN/METRO/TRAM stations from OpenStreetMap...
   📦 Response received:
      - Features found: 420

🔍 Processing and classifying rail/train/metro/tram stations from OSM...
   🚇 UNDERGROUND: "183rd Street" (subway/metro) [score: 205]
   🚇 UNDERGROUND: "Clinton–Washington Avenues" (subway/metro) [score: 205]

📊 Classification results:
   - Real underground/major stations: 420
   - Light rail/minor stations: 0
   - Tram stops (excluded): 0
   - Total candidates for underground: 420

🔍 Deduplicating stations by name...
   - Removed 107 duplicate station names
   - Final unique underground stations: 313

🚌 Query 2: Fetching BUS stops from OpenStreetMap...
   📦 Response received:
      - Features found: 5457

🔍 Deduplicating bus stops by name...
   - Removed 2321 duplicate bus stop names
   - Final unique bus stops: 3136

✅ Processed 313 rail/train/metro/tram stations (from OSM)
✅ Processed 3136 bus stops (from OSM)

📐 Distributing 20 stations across game area...
   - Minimum distance filter: 700m (ensures longer-distance travel)
   - Quadrant distribution:
     NE: 87 | NW: 12
     SE: 140 | SW: 74
   - Selected 20 stations distributed across quadrants
   - Distance range: 158m - 5155m

📍 Step 1: Assigning UNDERGROUND stations (20 total)...
   ✅ Station 1: "Times Square" (158m from center)
   ✅ Station 2: "Grand Central–42nd Street" (998m from center)
   ✅ Station 3: "33rd Street" (1110m from center)
   ...
   ✅ Station 20: "Tonnelle Avenue" (5155m from center)

🚌 Step 2: Assigning BUS stations (80 total)...
   ✅ Station 21: "5th Avenue & West 42nd Street" (593m from center)
   ...

🚕 Step 3: Assigning TAXI-ONLY stations (99 total)...
   ✅ Assigned 99 taxi-only stations (template positions)

✅ GAME BOARD GENERATED SUCCESSFULLY!
Total stations: 199
  - Underground (🚇): 20 stations
  - Bus (🚌): 80 stations
  - Taxi-only (🚕): 99 stations
Real transit matches: 100 stations
```

### Generated Stations
- **Station 1**: Times Square (Underground) - Red symbol
- **Station 2**: Grand Central (Underground) - Red symbol
- **Station 21**: 5th Ave & W 42nd St (Bus) - Green symbol
- **Station 101**: Taxi Station 101 (Taxi) - Yellow symbol

## Recent Improvements

### Quality & Distribution Fixes (Commit: 0322f37)
1. **Smart Station Classification**
   - Filter tram stops from underground category
   - Prioritize subway/metro over train stations
   - Quality scoring system (100 points for subway, 80 for train, etc.)

2. **Deduplication by Name**
   - Remove duplicate station names
   - Keep highest quality score per unique name
   - Examples: "Bayenthalgürtel" had 3 entries, kept 1

3. **Spatial Distribution**
   - Quadrant-based selection (NE, NW, SE, SW)
   - Distribute evenly across game area
   - Maintain real OSM coordinates (no artificial repositioning)

### Authentic Symbols (Commit: 9ddc0b9)
1. **SVG Station Symbols**
   - Semicircle top + Rectangle bottom
   - Matches Ravensburger board game design
   - Colored by available transport modes

2. **Strategic Underground Spacing**
   - 700m minimum distance between underground stations
   - Prevents "short hop" underground travel
   - Bus stops: no minimum distance (flexible coverage)

### Symbol Fix (Commit: b43bad0)
- Corrected symbol structure to match authentic design
- Both semicircle and rectangle use same color
- White circle for station number visibility

## Testing Checklist

After generating a board, verify:

- [ ] **Station Counts**: 20 underground + 80 bus + 99 taxi = 199 total
- [ ] **Symbol Design**: Semicircle top, rectangle bottom, number in white circle
- [ ] **Colors**: Red (underground), Green (bus), Yellow (taxi)
- [ ] **No Duplicates**: Each station name appears once
- [ ] **Underground Spacing**: Check console for 700m filter confirmation
- [ ] **Spatial Distribution**: Stations spread across all quadrants (NE, NW, SE, SW)
- [ ] **Real Coordinates**: Underground/bus use real OSM coordinates
- [ ] **Hover Effect**: Stations scale 40% larger on hover
- [ ] **Station List**: Sidebar shows all 199 stations with colors
- [ ] **Real Transit Badge**: Stations 1-100 have ✓ checkmark

## Common Issues & Solutions

### Issue: "getStationStyle is not defined"
**Cause**: Old function reference after refactoring
**Fix**: Updated to use `getStationSymbol()` instead

### Issue: Tram stops used as underground stations
**Cause**: OSM query returned `railway=tram_stop` mixed with subway stations
**Fix**: Added smart classification to exclude tram stops (score: 5 points, filtered out)

### Issue: Duplicate station names
**Cause**: Same station had multiple OSM entries (different platforms, entrances)
**Fix**: Group by name, keep highest quality score per unique name

### Issue: All stations clustered near center
**Cause**: Pure proximity-based sorting
**Fix**: Quadrant-based distribution with quality + distance sorting

### Issue: Underground stations too close together
**Cause**: No minimum distance requirement
**Fix**: Added 700m minimum distance filter for underground stations

## Future Enhancements

### Gameplay Features
- [ ] Route connections between stations (colored lines)
- [ ] Player tokens (detectives + Mr. X)
- [ ] Move validation (check if route exists)
- [ ] Ticket management system
- [ ] Game state tracking

### Visual Improvements
- [ ] Connection lines between stations (taxi/bus/underground routes)
- [ ] Distance indicators on hover
- [ ] Route highlighting for possible moves
- [ ] Animation: pulse effect for current position
- [ ] Zoom-based symbol sizing

### Data Quality
- [ ] Road snapping (currently disabled - primary/secondary roads not "major")
- [ ] Connection graph generation
- [ ] Validate connectivity (ensure all stations are reachable)
- [ ] Export board as JSON/image

### Multi-City Support
- [ ] Save/load generated boards
- [ ] Board difficulty rating
- [ ] City-specific customization
- [ ] Historical boards library

## Development Setup

### Prerequisites
```bash
Node.js >= 18.0.0
npm >= 9.0.0
```

### Installation
```bash
cd scotland-yard
git checkout feature/map-generation
npm install
```

### Environment Variables
Create `.env` file:
```env
VITE_MAPBOX_TOKEN=pk.your_mapbox_token_here
```

### Run Development Server
```bash
npm run dev
```

### Build for Production
```bash
npm run build
```

## Git Branch Structure

- **main**: Production-ready code
- **feature/map-generation**: Current development branch with all improvements

## API Dependencies

### OpenStreetMap Overpass API
- **Endpoint**: `https://overpass-api.de/api/interpreter`
- **Rate Limit**: Public instance, be respectful
- **Query Timeout**: 30 seconds
- **Retry Logic**: Automatic retry on 504 Gateway Timeout

### Mapbox
- **Geocoding API**: Address search
- **GL JS**: Map display and rendering
- **Token**: Required (free tier: 50,000 requests/month)

## Performance Considerations

### OSM Query Optimization
- Single query for all rail types (vs. multiple separate queries)
- Deduplication reduces data processing
- Quality scoring computed once during fetch

### Rendering Optimization
- SVG symbols (scalable, small file size)
- CSS transforms for hover (GPU-accelerated)
- Z-index layering (underground > bus > taxi)

### Memory Usage
- ~3,000 stations fetched from OSM
- ~200 stations rendered on map
- Minimal state (gameBoard + locationData)

## Debugging Tips

### Enable Console Logs
All major operations log to console:
- Transit data fetching
- Classification results
- Deduplication statistics
- Spatial distribution
- Station assignment

### Check OSM Data Quality
Use "Research Transit" button to see raw OSM data without generating board.

### Verify Station Coordinates
Hover over station to see tooltip with name and transport types.

### Test Different Locations
Try cities with different transit systems:
- **NYC**: Extensive subway network
- **London**: Dense underground system
- **Tokyo**: Massive rail network
- **Small Town**: Tests fallback to template

## Credits & References

- **Scotland Yard**: Ravensburger board game
- **OpenStreetMap**: Real transit data
- **Mapbox**: Map display and geocoding
- **React**: UI framework
- **Vite**: Build tool

## License

[Add your license information here]

---

**Last Updated**: 2025-01-07
**Current Version**: v1.0 (feature/map-generation branch)
**Status**: Fully functional with authentic symbols and strategic spacing
