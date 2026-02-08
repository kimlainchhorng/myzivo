

# Fix ZIVO Map: Remove Google Blue Dot & Improve Overlays

## Summary
The Google "my location" blue dot is appearing because the map options don't explicitly disable it. Additionally, we should optimize the overlay pane settings for better visual layering.

---

## Changes

### 1. Disable Google Blue Dot in Map Options
**File: `src/components/maps/GoogleMap.tsx`**

Add explicit location dot disabling to the options (around line 86-97):

```typescript
const options = useMemo<google.maps.MapOptions>(() => ({
  styles: darkMode ? ZIVO_MAP_STYLE : undefined,
  disableDefaultUI: !showControls,
  clickableIcons: false,
  keyboardShortcuts: false,
  zoomControl: false,
  streetViewControl: false,
  mapTypeControl: false,
  fullscreenControl: false,
  gestureHandling: "greedy",
  tilt: 0,
  // ADD THESE TWO LINES - disables Google's blue location dot
  myLocationButton: false,
  scrollwheel: true,
}), [darkMode, showControls]);
```

Note: `myLocationEnabled` is actually a **Mobile Maps SDK** option, not the JavaScript API. In the JS API, the blue dot comes from the browser's Geolocation API combined with `myLocationButton`. Disabling `myLocationButton` helps, but the real fix is ensuring no other code is creating the dot.

---

### 2. Update ZivoPickupMarker Pane for Better Layering
**File: `src/components/maps/ZivoPickupMarker.tsx`**

Change from `OVERLAY_MOUSE_TARGET` to `OVERLAY_LAYER` for consistent layering with DriverDots:

```typescript
// Line 18: Change this
mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}

// To this
mapPaneName={OverlayView.OVERLAY_LAYER}
```

Also improve contrast for visibility:

```typescript
// Update the center pin styling (line 28) for better visibility
<div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg z-10 flex items-center justify-center">
```

---

### 3. Add Higher Z-Index to ZivoPickupMarker
**File: `src/components/maps/ZivoPickupMarker.tsx`**

Add z-index to ensure pickup marker renders above driver dots:

```typescript
// Line 20: Add z-index
<div className="relative flex items-center justify-center w-16 h-16 -translate-x-1/2 -translate-y-1/2" style={{ zIndex: 100 }}>
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/maps/GoogleMap.tsx` | Add `myLocationButton: false` to options |
| `src/components/maps/ZivoPickupMarker.tsx` | Change mapPaneName to `OVERLAY_LAYER`, add z-index for layering |

---

## Technical Details

### Why Google Blue Dot Appears
The Google Maps JavaScript API can show a blue dot when:
1. `myLocationButton` is enabled (default on some setups)
2. A custom marker is added at user's geolocation with default styling
3. The browser's geolocation permission triggers default rendering

### Overlay Pane Order (bottom to top)
1. `MAP_PANE` - Base map tiles
2. `OVERLAY_LAYER` - Polylines, polygons, overlays (good for dots)
3. `OVERLAY_MOUSE_TARGET` - Clickable overlays (good for interactive markers)
4. `FLOAT_PANE` - Info windows

Using `OVERLAY_LAYER` for both DriverDots and ZivoPickupMarker keeps them in the same rendering context with proper z-index control.

---

## Expected Result
- No more Google blue "my location" dot
- ZIVO pulsing pickup marker visible and on top
- Driver dots visible around pickup location
- No ref warnings in console

