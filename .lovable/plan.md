

# Fix Map: Custom Pickup Marker, Driver Dots, and Route Line

## Overview
The map is styled correctly but missing three key features:
1. **Custom Pickup Marker** - Currently showing Google's default blue dot instead of the ZIVO pulsing marker
2. **Driver Dots Overlay** - No nearby drivers shown on the map
3. **Route Preview Line** - No polyline connecting pickup to destination

---

## Changes

### 1. Ensure ZivoPickupMarker Always Renders
**File: `src/components/maps/GoogleMap.tsx`**

The code already has `<ZivoPickupMarker position={pickup ?? center} />` at line 174, but we need to verify there's no other marker being rendered. The issue is likely that the pickup marker is rendering but other default Google Maps markers may also appear.

**Verification**: Confirm no `<MarkerF>` is rendering for the pickup position. The current code skips pickup-type markers in the legacy markers loop (line 187), which is correct.

---

### 2. Create DriverDots Component
**New File: `src/components/maps/DriverDots.tsx`**

Create a new overlay component that renders animated driver dots around the pickup location:

```typescript
// Shows ~20 moving dots (simulated nearby drivers) around pickup
import { useEffect, useState } from "react";
import { OverlayViewF, OverlayView } from "@react-google-maps/api";

interface DriverDotsProps {
  center: google.maps.LatLngLiteral;
  count?: number;
  radiusMeters?: number;
}

export default function DriverDots({ center, count = 20, radiusMeters = 1000 }: DriverDotsProps) {
  // Generate random positions around center
  // Each dot slowly drifts to simulate moving vehicles
  // Renders small dark dots with subtle animation
}
```

---

### 3. Add DriverDots to GoogleMap
**File: `src/components/maps/GoogleMap.tsx`**

Add the DriverDots overlay inside the `<GMap>` component:

```tsx
import DriverDots from "./DriverDots";

// Inside <GMap>...</GMap>:
<DriverDots center={pickup ?? center} count={20} radiusMeters={1000} />
```

---

### 4. Decode and Pass Route Polyline
**File: `src/pages/Rides.tsx`**

The `routeData.polyline` is an encoded string that needs to be decoded before passing to the map. Import and use the `decodePolyline` function:

```tsx
import { decodePolyline } from "@/services/googleMaps";

// In RidesMapView component:
const routePath = useMemo(() => {
  if (routeData?.polyline) {
    // decodePolyline returns [lng, lat] pairs, convert to LatLngLiteral
    return decodePolyline(routeData.polyline).map(([lng, lat]) => ({ lat, lng }));
  }
  return undefined;
}, [routeData?.polyline]);

// Pass to GoogleMap:
<GoogleMap
  ...
  routePath={routePath}
/>
```

---

### 5. Update RidesMapView to Accept routeData
**File: `src/pages/Rides.tsx`**

Add `routeData` to the RidesMapView props interface and pass it from the parent:

```tsx
interface RidesMapViewProps {
  // ... existing props
  routeData?: ServerRouteData | null;
}

function RidesMapView({ 
  // ... existing props
  routeData,
}: RidesMapViewProps) {
  // Decode polyline logic here
}

// In parent component, pass routeData:
<RidesMapView
  ...
  routeData={routeData}
/>
```

---

## Files Modified

| File | Action |
|------|--------|
| `src/components/maps/DriverDots.tsx` | **Create** - New component for animated nearby driver dots |
| `src/components/maps/GoogleMap.tsx` | Add DriverDots import and render inside GMap |
| `src/components/maps/index.ts` | Export DriverDots component |
| `src/pages/Rides.tsx` | Pass routeData to RidesMapView, decode polyline, pass as routePath prop |

---

## Technical Details

### DriverDots Implementation
- Generate 20 random positions within 1km radius of pickup
- Use `OverlayViewF` for each dot (or single overlay with multiple dots)
- Small dark circles (6-8px) with subtle pulse animation
- Positions drift slowly every 2-3 seconds to simulate movement
- Use memoization to prevent excessive re-renders

### Polyline Decoding
- The `decodePolyline` function from `src/services/googleMaps.ts` returns `[lng, lat][]` format
- Convert to `{ lat, lng }[]` for Google Maps PolylineF component
- The PolylineF in GoogleMap.tsx already renders with correct styling (blue, 5px stroke)

---

## Result

After these changes:
- **Custom pulsing pickup marker** renders at pickup location (or center fallback)
- **20 animated driver dots** appear around pickup location
- **Route preview line** shows when destination is selected
- **No Google default blue dot** visible

