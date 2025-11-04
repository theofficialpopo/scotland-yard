# Scotland Yard - Authentic Station Symbols

## Visual Design - Matching the Classic Board Game

The game now uses authentic Scotland Yard station symbols based on the classic Ravensburger board game design, replacing simple colored circles with proper SVG symbols.

## Station Symbol Types

### 🔴 Underground + Bus + Taxi Stations (20 total)

**Visual Design**:
- **Main symbol**: Red circle with white dot in center (underground indicator)
- **Secondary symbol**: Small green square in corner (bus indicator)
- **All three transport modes available**: taxi + bus + underground

**SVG Implementation**:
```
- Outer circle: Red (#E63946) with dark red border
- Inner dot: White circle (25% of radius)
- Corner square: Green (#2A9D8F) overlay
- Station number: White text, centered
```

**Game Significance**:
- These are major transit hubs
- Players can use ANY ticket type here (taxi, bus, or underground)
- Limited to 20 stations with 700m minimum spacing
- Strategic for long-distance escapes

---

### 🟢 Bus + Taxi Stations (80 total)

**Visual Design**:
- **Symbol**: Green square/rectangle
- **Two transport modes available**: taxi + bus

**SVG Implementation**:
```
- Square shape: Green (#2A9D8F) with dark green border
- Rounded corners (3px radius)
- Station number: White text, centered
```

**Game Significance**:
- Mid-level transit options
- Can use taxi OR bus tickets
- No underground access
- 80 stations provide good coverage

---

### 🟡 Taxi-Only Stations (99 total)

**Visual Design**:
- **Symbol**: Yellow/Orange circle
- **One transport mode available**: taxi only

**SVG Implementation**:
```
- Circle shape: Orange (#F4A261) with darker orange border
- Station number: White text, centered
```

**Game Significance**:
- Most common station type (99 total)
- Can ONLY use taxi tickets
- Fills in gaps between major transit stations
- Short-distance connections

---

## Color Scheme

Matches classic Scotland Yard board game colors:

| Transport Type | Primary Color | Border Color | Symbol Shape |
|----------------|---------------|--------------|--------------|
| **Underground** | Red (#E63946) | Dark Red (#8B0000) | Circle with dot |
| **Bus** | Green (#2A9D8F) | Dark Green (#1B5E4F) | Square |
| **Taxi** | Orange (#F4A261) | Dark Orange (#D68A45) | Circle |

## Interactive Features

### Hover Effects
- **Scale**: Symbols grow 40% larger on hover (1.0x → 1.4x)
- **Shadow**: Enhanced drop shadow for depth
- **Z-index**: Hovered station appears above others
- **Smooth transition**: 0.2s ease animation

### Station Information
- **Tooltip**: Shows station ID, name, and available transport types
- **Example**: "Station 1: Köln Hauptbahnhof\nUnderground + Bus + Taxi"

## Size Hierarchy

Stations are sized by importance:

1. **Underground stations**: 18px base size (largest)
2. **Bus stations**: 15px base size (medium)
3. **Taxi stations**: 12px base size (smallest)

This creates visual hierarchy matching gameplay importance.

## Z-Index Layering

Stations stack by priority:

- **Underground**: z-index 30 (top layer)
- **Bus**: z-index 20 (middle layer)
- **Taxi**: z-index 10 (bottom layer)
- **Hovered**: z-index 100 (always on top)

This ensures underground stations are always visible when overlapping.

## Technical Implementation

### Component Structure

**StationSymbol.jsx**:
```jsx
- getStationSymbol(types) - Determines symbol configuration
- StationSymbol component - Renders SVG symbols
- Three symbol variants:
  1. underground-bus-taxi (circle + square)
  2. bus-taxi (square)
  3. taxi (circle)
```

**MapTest.jsx**:
```jsx
- Imports StationSymbol component
- Manages hover state per station
- Renders Marker with StationSymbol inside
- Passes isHovered prop for interactive scaling
```

## Before vs After

### Before (Simple Circles)
```
🔴 Red circle with emoji 🚇 and number
🟢 Green circle with emoji 🚌 and number
🟡 Yellow circle with emoji 🚕 and number
```

**Problems**:
- Generic appearance
- Emojis inconsistent across devices
- No visual distinction for combined types
- Didn't match board game aesthetic

### After (Authentic Symbols)
```
🔴 Red circle with white dot + green corner square
🟢 Green square with rounded corners
🟡 Orange circle
```

**Benefits**:
- ✅ Matches classic Scotland Yard board game
- ✅ Consistent rendering across all devices
- ✅ Combined stations show both symbols clearly
- ✅ Professional, polished appearance
- ✅ Clear visual hierarchy by size and shape
- ✅ Authentic game board feeling

## SVG Advantages

1. **Scalable**: Perfect rendering at any zoom level
2. **Lightweight**: Smaller file size than images
3. **Crisp**: Sharp edges on all displays
4. **Customizable**: Easy to adjust colors/sizes
5. **Animatable**: Smooth hover transitions
6. **Accessible**: Pure HTML/CSS/SVG (no external assets)

## Example Station Renderings

### Station 1: Köln Hauptbahnhof
```
Type: Underground + Bus + Taxi
Symbol: Red circle (white dot) + green square overlay
Size: 18px base (25.2px when hovered)
Z-index: 30 (100 when hovered)
Modes: 🚇 + 🚌 + 🚕
```

### Station 25: Neumarkt
```
Type: Bus + Taxi
Symbol: Green square
Size: 15px base (21px when hovered)
Z-index: 20 (100 when hovered)
Modes: 🚌 + 🚕
```

### Station 150: Taxi Station 150
```
Type: Taxi Only
Symbol: Orange circle
Size: 12px base (16.8px when hovered)
Z-index: 10 (100 when hovered)
Modes: 🚕
```

## Testing Checklist

After implementing symbols, verify:

- [ ] **Underground stations**: Red circles with white dots + green corner squares
- [ ] **Bus stations**: Green squares with rounded corners
- [ ] **Taxi stations**: Orange circles
- [ ] **Station numbers**: Visible and centered in all symbols
- [ ] **Hover effect**: Symbols scale 40% larger smoothly
- [ ] **Tooltips**: Show correct station info on hover
- [ ] **Z-index**: Underground stations appear above buses and taxis
- [ ] **Hovered stations**: Always appear on top (z-index 100)
- [ ] **Consistent rendering**: Same appearance across browsers
- [ ] **No emoji artifacts**: No fallback emoji symbols

## Future Enhancements (Optional)

1. **Station connections**: Draw lines between connected stations
2. **Route highlighting**: Show possible moves from selected station
3. **Distance indicators**: Display travel distance on hover
4. **Connection types**: Different line styles for taxi/bus/underground routes
5. **Player tokens**: Add detective and Mr. X marker symbols
6. **Animation**: Pulse effect for current player's location

## Files Modified

1. **`client/src/components/StationSymbol.jsx`** (NEW)
   - SVG symbol rendering component
   - Station type configuration
   - Three symbol variants

2. **`client/src/MapTest.jsx`** (MODIFIED)
   - Import StationSymbol component
   - Add hover state management
   - Replace circle rendering with StationSymbol
   - Cleaner marker implementation

## Result

The game board now has an authentic Scotland Yard appearance with professional, board-game-style station symbols! 🎲
