# Scotland Yard - Realistic Game Mechanics

## Station Type Combinations (Authentic Scotland Yard Rules)

### ✅ Already Implemented

The game correctly implements Scotland Yard's authentic station type system:

1. **Underground Stations (20 total)** - Red markers 🚇
   - Has ALL three travel modes: **taxi + bus + underground**
   - These are major transit hubs where all vehicle types can reach
   - Players can use taxi, bus, OR underground tickets at these stations

2. **Bus Stations (80 total)** - Green markers 🚌
   - Has two travel modes: **taxi + bus**
   - Players can use taxi OR bus tickets at these stations
   - Cannot use underground tickets here

3. **Taxi-Only Stations (99 total)** - Yellow markers 🚕
   - Has one travel mode: **taxi only**
   - Players can ONLY use taxi tickets at these stations
   - Most common station type (fills in the gaps)

**Code Reference**: `client/src/services/stationGenerator.js:220-246`

## Strategic Underground Travel

### New Feature: Minimum Distance Filtering

**Problem**: Underground stations were sometimes too close together, making underground travel feel like short hops instead of strategic long-distance moves.

**Solution**: Implemented 700-meter minimum spacing between underground stations.

### How It Works

```javascript
const UNDERGROUND_MIN_DISTANCE = 700; // meters
```

When selecting underground stations:
1. **First Pass**: Select best stations from each quadrant (NE, NW, SE, SW)
2. **Distance Check**: Before adding a station, verify it's at least 700m from ALL already-selected underground stations
3. **Skip if Too Close**: If a station is too close to an existing one, skip it and try the next candidate
4. **Second Pass**: Fill remaining slots with best quality stations that meet distance requirement

**Result**: Underground travel becomes strategic for longer journeys across the map.

### Expected Behavior

**Before** (without minimum distance):
```
Underground Station 1: Köln Hbf (823m from center)
Underground Station 2: Dom/Hbf (925m from center)  ← Only 102m apart!
Underground Station 3: Breslauer Platz (987m)      ← Only 62m from #2!
```

**After** (with 700m minimum distance):
```
Underground Station 1: Köln Hbf (823m from center)
Underground Station 2: Neumarkt (1654m from center) ✓ 831m from #1
Underground Station 3: Eifelplatz (2401m)          ✓ 747m from #2
```

### Console Output

When generating a board, you'll see:

```
🚂 Underground Strategy: Selecting stations with 700m minimum spacing
   This ensures underground travel is for longer distances, not short hops

📐 Distributing 20 stations across game area...
   - Minimum distance filter: 700m (ensures longer-distance travel)
   - Quadrant distribution:
     NE: 7 | NW: 6
     SE: 5 | SW: 4
   - Selected 20 stations distributed across quadrants
   - Distance range: 823m - 5234m
```

If some stations are filtered out:
```
⚠️ Could only select 18/20 stations (2 filtered by 700m minimum distance)
```

This means the area has many closely-clustered stations, and 2 were rejected to maintain strategic spacing.

## Game Balance

### Travel Distance Strategy

| Transport | Min Distance | Max Distance | Best For |
|-----------|--------------|--------------|----------|
| **Taxi** 🚕 | Any | Short | Quick local moves, filling gaps |
| **Bus** 🚌 | Any | Medium | Flexible mid-range travel |
| **Underground** 🚇 | 700m+ | Long | Strategic cross-map movement |

### Why This Matters for Gameplay

1. **Underground is Precious**: Limited to 20 stations with 700m+ spacing makes underground tickets valuable for escaping across the map

2. **Bus is Flexible**: 80 bus stations with no minimum distance means buses are available for medium-distance tactical moves

3. **Taxi is Everywhere**: 99 taxi-only stations plus access to all 100 underground/bus stations = maximum flexibility for local movement

4. **Mr. X Strategy**: The underground's long distances and sparse coverage make it perfect for Mr. X to create distance from detectives

5. **Detective Strategy**: Detectives must coordinate using buses and taxis to cover the gaps between underground stations

## Technical Implementation

### Files Modified

1. **`client/src/services/stationGenerator.js`**
   - Added `minDistanceMeters` parameter to `selectStationsWithDistribution()`
   - Implemented `isFarEnoughFromSelected()` helper function
   - Applied 700m filter to underground stations only
   - Bus stops have 0m minimum (no distance restriction)

### Configuration

To adjust the minimum distance:

```javascript
// In assignStationTypes() function
const UNDERGROUND_MIN_DISTANCE = 700; // Change this value

// Smaller value (400-600m) = More underground stations, shorter distances
// Larger value (800-1000m) = Fewer underground stations, longer distances
// 700m = Balanced for realistic strategic play
```

## Testing Checklist

After generating a board:

- [ ] **Station Types**: Verify red (underground), green (bus), yellow (taxi) markers
- [ ] **Type Combinations**: Click station info to verify:
  - Red stations show: taxi + bus + underground
  - Green stations show: taxi + bus
  - Yellow stations show: taxi only
- [ ] **Underground Spacing**: Check console logs for minimum distance warnings
- [ ] **Distance Range**: Underground stations should span 800m - 5000m+ from center
- [ ] **No Duplicates**: Each station name appears only once
- [ ] **Distribution**: Stations spread across all four quadrants

## Real Game Experience

With these mechanics, the board now feels like a real Scotland Yard game:

✅ **Underground is strategic** - Used for major cross-map escapes (700m+ jumps)
✅ **Bus is tactical** - Used for flexible mid-range movement
✅ **Taxi is ubiquitous** - Available everywhere for local repositioning
✅ **Station types combine naturally** - Major hubs have all modes, outlying areas have limited options
✅ **Geographic authenticity** - Uses real transit stations from OpenStreetMap
✅ **No duplicate stations** - Each station name appears once
✅ **Balanced distribution** - Stations spread across all areas

The result: A game board that feels authentic and plays strategically! 🎲
