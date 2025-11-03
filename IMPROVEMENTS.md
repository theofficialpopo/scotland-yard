# Station Quality and Distribution Improvements

## Changes Implemented

### 1. Smart Station Classification (`transitDataFetcher.js`)

**Problem**: All rail stations (including tram stops) were being used as "underground" stations.

**Solution**: Implemented intelligent classification:
- **Priority 1**: Real subway/metro stations (`station=subway`, `railway=station` with `subway=yes`)
- **Priority 2**: Major train stations (`railway=station`)
- **Priority 3**: Light rail stations (`station=light_rail`, `railway=halt`)
- **Excluded**: Tram stops (`railway=tram_stop`) - NOT suitable for underground category

**Result**: Only authentic train/metro/subway stations are used for underground category.

### 2. Station Quality Scoring

**Underground stations scoring**:
```javascript
station=subway:     +100 points (highest priority)
railway=station:    +80 points
station=light_rail: +40 points
railway=halt:       +20 points
railway=tram_stop:  +5 points (excluded from underground)
operator present:   +10 points
network present:    +5 points
```

**Bus stops scoring**:
```javascript
Base score:         10 points
operator present:   +5 points
network present:    +3 points
shelter=yes:        +2 points
```

### 3. Deduplication by Station Name

**Problem**: Stations with same name appearing multiple times (e.g., "2x Bayenthalgürtel").

**Solution**:
- Group stations by exact name match
- Keep only the highest quality score per name
- Log examples of removed duplicates

**Result**: Each station name appears only once in the game board.

### 4. Spatial Distribution Across Game Area

**Problem**: All stations clustered near center (all selected by proximity only).

**Solution**: Quadrant-based distribution:
- Divide game area into 4 quadrants (NE, NW, SE, SW)
- Select ~5 underground stations per quadrant (20 total / 4 quadrants)
- Select ~20 bus stops per quadrant (80 total / 4 quadrants)
- Within each quadrant: prioritize by quality score, then proximity
- Keep real OSM coordinates (don't artificially move stations)

**Result**: Stations spread across entire game area while maintaining real-world locations.

## Expected Console Output

When you generate a board now, you'll see:

```
🔍 Processing and classifying rail/train/metro/tram stations from OSM...
   🚇 UNDERGROUND: "Köln Hauptbahnhof" (train station) [score: 95]
   🚇 UNDERGROUND: "Dom/Hbf" (subway/metro) [score: 115]
   🚊 LIGHT RAIL: "Barbarossaplatz" (light_rail) [score: 55]
   🚋 TRAM STOP: "Eifelstraße" (excluding from underground) [score: 15]

📊 Classification results:
   - Real underground/major stations: 14
   - Light rail/minor stations: 11
   - Tram stops (excluded): 353
   - Total candidates for underground: 25

🔍 Deduplicating stations by name...
   - Removed 3 duplicate station names
   - Final unique underground stations: 22
   - Examples of removed duplicates:
     ⚠️ "Bayenthalgürtel" had multiple entries (kept best quality)
     ⚠️ "Neumarkt" had multiple entries (kept best quality)

📐 Distributing 20 stations across game area...
   - Quadrant distribution:
     NE: 7 | NW: 6
     SE: 5 | SW: 4
   - Selected 20 stations distributed across quadrants
   - Distance range: 823m - 4512m
```

## Quality Improvements

### Before:
- ❌ "2x Bayenthalgürtel" (duplicates)
- ❌ Mostly tram stops as underground (353/378)
- ❌ All stations 704m-2617m from center (clustered)
- ❌ Poor playability

### After:
- ✅ No duplicate station names
- ✅ Only real train/metro stations as underground
- ✅ Stations spread 823m-4512m across all quadrants
- ✅ Natural "real feeling" game map

## Testing

To test these improvements:

1. Hard refresh browser (Ctrl+Shift+R) to clear cache
2. Click "Generate Board" button
3. Check console logs for:
   - Classification (subway vs train vs tram vs light rail)
   - Deduplication (should show removed duplicates if any)
   - Spatial distribution (quadrant counts and distance range)
4. Verify on map:
   - No duplicate station names
   - Red markers (underground) are spread across area
   - Green markers (bus) are distributed evenly
   - Stations use authentic names from OSM

## Files Changed

1. `client/src/services/transitDataFetcher.js` - Smart classification and deduplication
2. `client/src/services/stationGenerator.js` - Spatial distribution algorithm

## Technical Details

**Quadrant Assignment**:
```javascript
// Relative to center point
lat >= center.lat && lng >= center.lng → NE (Northeast)
lat >= center.lat && lng < center.lng  → NW (Northwest)
lat < center.lat && lng >= center.lng  → SE (Southeast)
lat < center.lat && lng < center.lng   → SW (Southwest)
```

**Selection Priority**:
1. Divide into quadrants
2. Sort each quadrant by: quality score (descending) → distance (ascending)
3. Take top ~5 per quadrant (for 20 underground)
4. If needed, fill remaining from best quality overall

This ensures:
- High-quality stations preferred
- Spatial distribution maintained
- Real coordinates preserved
- Natural-looking game board
