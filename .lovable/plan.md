
# Fix ZIVO Map Styling & Pickup Marker

## Summary
The ZIVO dark theme and pulsing pickup marker are not displaying correctly because:
1. The `pickup` prop may be empty/undefined, so no marker renders
2. The `markers` array approach does render `ZivoPickupMarker` for pickup type, but there might be rendering issues
3. The `mapId` prop is defined but unused (which is fine - it's not being passed)

---

## Changes

### 1. Remove Unused `mapId` Prop
**File: `src/components/maps/GoogleMap.tsx`**

Remove the unused `mapId` prop from the interface since it's never used and would conflict with `styles[]` if it were:

```typescript
// Remove this line from GoogleMapProps interface:
// mapId?: string;
```

### 2. Always Show Pickup Marker at Center When No Pickup Set
**File: `src/components/maps/GoogleMap.tsx`**

Ensure the pickup marker always shows, defaulting to center position:

```typescript
// Change line 175 from:
{pickup && <ZivoPickupMarker position={pickup} />}

// To:
{/* Always show pickup marker - fall back to center */}
<ZivoPickupMarker position={pickup ?? center} />
```

### 3. Remove Duplicate Marker Rendering for Pickup Type
**File: `src/components/maps/GoogleMap.tsx`**

The legacy markers loop (lines 186-221) renders `ZivoPickupMarker` for markers with `type === "pickup"`. This could cause duplicate markers. We should skip pickup-type markers in the loop since we're already rendering the primary pickup marker above:

```typescript
// Update the markers.map() to skip pickup types:
{markers.map(marker => {
  // Skip pickup type - already rendered above
  if (marker.type === "pickup") {
    return null;
  }
  
  // ...rest of marker rendering
})}
```

### 4. Ensure RidesMapView Uses Correct Props
**File: `src/pages/Rides.tsx` (RidesMapView component ~line 235)**

The `GoogleMap` component is receiving `markers` array but not the `pickup` prop directly. Update to pass `pickup` prop:

```typescript
// Around line 235, change:
<GoogleMap
  className="w-full h-full"
  center={center}
  zoom={markers.length > 1 ? 12 : 15}
  markers={markers}
  route={route}
  fitBounds={markers.length > 1}
  showControls={false}
  darkMode={true}
/>

// To:
<GoogleMap
  className="w-full h-full"
  center={center}
  pickup={pickupCoords || userLocation || center}
  dropoff={dropoffCoords || undefined}
  zoom={pickupCoords && dropoffCoords ? 12 : 15}
  markers={[]} // Clear legacy markers since we use pickup/dropoff props
  route={route}
  fitBounds={!!(pickupCoords && dropoffCoords)}
  showControls={false}
  darkMode={true}
/>
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/maps/GoogleMap.tsx` | Remove unused `mapId` prop, always render pickup marker at `pickup ?? center`, skip pickup type in legacy markers loop |
| `src/pages/Rides.tsx` | Pass `pickup` and `dropoff` props directly to GoogleMap instead of using markers array |

---

## Result

After these changes:
- **ZIVO dark theme** will apply (no `mapId` conflict)
- **Pulsing pickup marker** will always show (at pickup location or center)
- **No duplicate markers** from legacy markers array
- **Blue Google dot removed** - only custom `ZivoPickupMarker` renders
