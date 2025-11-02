# Map Generation - Feature Branch

This worktree contains the foundational map infrastructure for displaying real city maps in Scotland Yard.

## What's Implemented

### Phase 1: Map Selection & Display Infrastructure ✅

This phase establishes the basic map viewing infrastructure without implementing station generation yet.

**Completed Components:**

1. **City Configuration System** (`client/src/data/cityMaps.js`)
   - 5 pre-configured cities: London, New York, Paris, Berlin, Tokyo
   - Bounded map areas with specific lat/long coordinates
   - Zoom level constraints for consistent game board feeling
   - Helper functions for bounds checking and area calculations

2. **MapDisplay Component** (`client/src/components/MapDisplay.jsx`)
   - Mapbox GL JS integration with WebGL rendering
   - Bounded viewport that stays within city limits
   - Dark theme for Scotland Yard aesthetic
   - Navigation and scale controls
   - Loading states and error handling
   - City name badge overlay

3. **CitySelector Component** (`client/src/components/CitySelector.jsx`)
   - Visual card-based city selection UI
   - Compact dropdown mode for in-game use
   - Shows city stats (recommended stations, area size)
   - Scotland Yard themed styling

4. **Test Page** (`client/src/MapTest.jsx`)
   - Standalone testing environment
   - Toggle between city selection and map display
   - Compact city switcher on map view
   - Ready for future station overlay components

## Setup Instructions

### 1. Install Dependencies

Dependencies are already installed in this worktree:
- `mapbox-gl` - Mapbox GL JS library
- `react-map-gl` - React wrapper for Mapbox

### 2. Get Mapbox Token

1. Create a free account at [mapbox.com](https://account.mapbox.com/auth/signup/)
2. Get your access token from [your account page](https://account.mapbox.com/access-tokens/)
3. Create a `.env` file in the `client` directory:

```env
VITE_MAPBOX_TOKEN=your_token_here
```

**Free tier:** 50,000 map loads per month (plenty for development)

### 3. Run the Test Page

```bash
cd client
npm run dev
```

The app will automatically load `MapTest.jsx` instead of the main game.

## Testing the Map System

1. **City Selection Screen:**
   - View all 5 available cities
   - See city stats (recommended stations, area)
   - Select a city

2. **Map Display:**
   - Click "View Map" to see the bounded map
   - Use navigation controls to pan/zoom
   - Notice the map stays within defined bounds
   - Switch between cities using the compact selector
   - Map automatically recenters when city changes

## File Structure

```
client/src/
├── data/
│   └── cityMaps.js           # City configurations with bounds
├── components/
│   ├── MapDisplay.jsx         # Bounded map display component
│   └── CitySelector.jsx       # City selection UI
└── MapTest.jsx                # Standalone test page
```

## City Configurations

Each city has:
- **Center coordinates** - Map starting point
- **Bounds** - Southwest and Northeast corners defining the bounded area
- **Zoom levels** - Min/max zoom to maintain consistent scale
- **Map style** - Dark theme for Scotland Yard feel
- **Recommended stations** - Suggested number of stations for map size

### Available Cities:

| City      | Area (km²) | Recommended Stations | Special Note           |
|-----------|------------|----------------------|------------------------|
| London    | 103.4      | 20                   | Classic Scotland Yard  |
| New York  | 56.8       | 22                   | Manhattan area         |
| Paris     | 105.4      | 20                   | Central Paris          |
| Berlin    | 103.9      | 18                   | Historic center        |
| Tokyo     | 100.0      | 24                   | Shibuya & Shinjuku     |

## What's Next

### Phase 2: Station Placement (To Be Implemented)

The user wants **automated station placement** (not manual), but without the full complexity of GTFS processing.

**Possible approaches:**
1. **POI-based placement** - Use Mapbox Points of Interest API to place stations at landmarks
2. **Grid-based with density** - Algorithmic placement based on urban density
3. **Simplified transit data** - Use basic transit data without full GTFS processing
4. **Hybrid approach** - Combine multiple methods

**Requirements:**
- Automated/algorithmic (no manual clicking)
- Simpler than full GTFS implementation
- Maintains consistent game board feeling

### Phase 3: Game Integration

Once station placement is implemented:
1. Connect to main game logic
2. Add station markers overlay on map
3. Implement player position markers
4. Add ticket type visualization
5. Integrate with multiplayer system

## Key Features

### Bounded Viewport
- Maps are constrained to specific city areas
- Prevents players from zooming out too far or panning outside bounds
- Creates consistent "game board" feeling

### City Switching
- Seamlessly switch between cities
- Map automatically recenters and adjusts zoom
- Maintains consistent user experience

### Scotland Yard Theme
- Dark map style
- Gold/brown color scheme
- Consistent with existing game UI

## Notes

- This is a **standalone testing environment** - does not connect to the main game yet
- Station placement algorithm is **not yet implemented**
- Focus is on establishing map display infrastructure first
- All city bounds are carefully chosen to show interesting urban areas

## Switching Back to Main Game

To switch from MapTest to the main game, edit `client/src/main.jsx`:

```javascript
// Change from:
import MapTest from './MapTest.jsx';

// To:
import App from './App.jsx';
```

## Cost Considerations

**Mapbox Pricing:**
- Free tier: 50,000 map loads/month
- $0.50 per 1,000 loads above free tier
- For 10,000 games/month: ~$0-5/month (well within free tier)

## Technical Details

### Map Bounds Format
```javascript
bounds: [
  [swLng, swLat],  // Southwest corner
  [neLng, neLat]   // Northeast corner
]
```

### Viewport State
```javascript
{
  longitude: -0.1278,
  latitude: 51.5074,
  zoom: 12,
  pitch: 0,    // Flat (no 3D tilt)
  bearing: 0   // North up
}
```

### Preventing Rotation
- `dragRotate: false` - Disable mouse rotation
- `touchZoomRotate: false` - Disable touch rotation
- Creates consistent top-down game board view

## Future Enhancements

- Add multiple map styles (satellite, light, dark variants)
- Implement station generation algorithm
- Add heatmap overlay for station placement
- Create admin tools for adjusting city bounds
- Support for custom city additions

---

**Status:** Phase 1 Complete ✅
**Next:** Design automated station placement strategy
