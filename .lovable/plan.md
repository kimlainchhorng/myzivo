

# Uber-Style Map Experience: Route Line, Markers & Cars

## Summary
Transform the map to match Uber's polish with:
1. Google Directions-powered route line (reliable, styled)
2. Custom pickup/dropoff markers (Uber-style pins)
3. Car icons replacing driver dots (more realistic)
4. Black CTA button matching Uber's design

---

## Changes

### 1. Add Directions Service to GoogleMap.tsx
Replace the manual polyline with Google's DirectionsService/DirectionsRenderer for reliable route rendering.

**File: `src/components/maps/GoogleMap.tsx`**

```typescript
// Add to imports
import { DirectionsService, DirectionsRenderer } from "@react-google-maps/api";
import { useState, useEffect } from "react";

// Add state inside component
const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
const [directionsRequested, setDirectionsRequested] = useState(false);

// Reset when pickup/dropoff change
useEffect(() => {
  if (!pickup || !dropoff) {
    setDirections(null);
    setDirectionsRequested(false);
  } else {
    setDirectionsRequested(false); // Allow new request
  }
}, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng]);

// Inside <GMap>...</GMap> render:
{pickup && dropoff && !directionsRequested && (
  <DirectionsService
    options={{
      origin: pickup,
      destination: dropoff,
      travelMode: google.maps.TravelMode.DRIVING,
    }}
    callback={(result, status) => {
      setDirectionsRequested(true);
      if (status === "OK" && result) {
        setDirections(result);
      }
    }}
  />
)}

{directions && (
  <DirectionsRenderer
    directions={directions}
    options={{
      suppressMarkers: true, // We use custom markers
      polylineOptions: {
        strokeColor: "#111827", // Dark gray like Uber
        strokeOpacity: 0.9,
        strokeWeight: 6,
      },
    }}
  />
)}
```

---

### 2. Create Uber-Style Dropoff Marker
**File: `src/components/maps/ZivoDropoffMarker.tsx`** (NEW)

```typescript
import { OverlayViewF, OverlayView } from "@react-google-maps/api";

interface ZivoDropoffMarkerProps {
  position: google.maps.LatLngLiteral;
}

export default function ZivoDropoffMarker({ position }: ZivoDropoffMarkerProps) {
  return (
    <OverlayViewF position={position} mapPaneName={OverlayView.OVERLAY_LAYER}>
      <div 
        className="flex flex-col items-center -translate-x-1/2 -translate-y-full"
        style={{ zIndex: 90 }}
      >
        {/* Black square destination marker (Uber style) */}
        <div className="w-5 h-5 bg-black rounded-sm shadow-lg border-2 border-white" />
        {/* Pin stem */}
        <div className="w-0.5 h-3 bg-black" />
      </div>
    </OverlayViewF>
  );
}
```

---

### 3. Create NearbyCars Component (Uber-style cars)
**File: `src/components/maps/NearbyCars.tsx`** (NEW)

Replaces DriverDots with more realistic car icons:

```typescript
import { useState, useEffect } from "react";
import { OverlayViewF, OverlayView } from "@react-google-maps/api";

interface NearbyCarsProps {
  center: google.maps.LatLngLiteral;
  count?: number;
}

// Car SVG icon (simple top-down view)
function CarSvg({ rotation }: { rotation: number }) {
  return (
    <svg 
      width="20" 
      height="28" 
      viewBox="0 0 20 28" 
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <rect x="4" y="2" width="12" height="24" rx="3" fill="#1a1a1a" />
      <rect x="5" y="4" width="10" height="6" rx="1" fill="#4a4a4a" />
      <rect x="5" y="18" width="10" height="4" rx="1" fill="#4a4a4a" />
    </svg>
  );
}

export default function NearbyCars({ center, count = 10 }: NearbyCarsProps) {
  const [cars, setCars] = useState(() => generateCars(center, count));

  useEffect(() => {
    const interval = setInterval(() => {
      setCars(prev => prev.map(car => driftCar(car, center)));
    }, 1800);
    return () => clearInterval(interval);
  }, [center.lat, center.lng]);

  useEffect(() => {
    setCars(generateCars(center, count));
  }, [Math.round(center.lat * 1000), Math.round(center.lng * 1000), count]);

  return (
    <>
      {cars.map((car, i) => (
        <OverlayViewF key={i} position={car} mapPaneName={OverlayView.OVERLAY_LAYER}>
          <div className="-translate-x-1/2 -translate-y-1/2">
            <CarSvg rotation={car.rot} />
          </div>
        </OverlayViewF>
      ))}
    </>
  );
}

// Helper functions for random car positions
function generateCars(center, count) { ... }
function driftCar(car, center) { ... }
```

---

### 4. Update GoogleMap.tsx to Use New Components

```typescript
// Replace DriverDots with NearbyCars
import NearbyCars from "./NearbyCars";
import ZivoDropoffMarker from "./ZivoDropoffMarker";

// In render:
<NearbyCars center={pickup ?? center} count={12} />

{pickup && <ZivoPickupMarker position={pickup} />}
{dropoff && <ZivoDropoffMarker position={dropoff} />}

// Remove the old MarkerF for dropoff - use custom overlay instead
```

---

### 5. Update CTA Button to Black (Uber style)
**File: `src/pages/Rides.tsx`**

Find the "Choose" / confirm button and update:

```typescript
<Button
  className="w-full bg-black hover:bg-zinc-900 text-white h-14 text-base font-semibold"
  disabled={!selectedOption}
  onClick={handleConfirm}
>
  Choose {selectedOption?.name}
</Button>
```

---

## Files Modified

| File | Changes |
|------|---------|
| `src/components/maps/GoogleMap.tsx` | Add DirectionsService/DirectionsRenderer, integrate NearbyCars, ZivoDropoffMarker |
| `src/components/maps/ZivoDropoffMarker.tsx` | NEW - Uber-style black square destination marker |
| `src/components/maps/NearbyCars.tsx` | NEW - Realistic car icons replacing dots |
| `src/components/maps/index.ts` | Export new components |
| `src/pages/Rides.tsx` | Update CTA button to black |

---

## Visual Result

| Element | Before | After |
|---------|--------|-------|
| Route Line | Missing/broken polyline | Thick dark gray line via DirectionsRenderer |
| Pickup Marker | Pulsing blue circle | Pulsing blue circle (keep) |
| Dropoff Marker | Basic black dot | Black square with pin stem |
| Driver Dots | 16px white boxes | Realistic car SVG icons |
| CTA Button | Primary color | Black (Uber style) |

---

## Technical Notes

### Why DirectionsService is Better
- Automatically handles routing errors
- Returns pre-styled polyline
- Works with Google's styling engine
- No coordinate order confusion

### SVG Car Icon
Simple top-down car shape:
- Dark body with lighter windows
- Rotates based on heading
- 20x28px optimal for map visibility

### Marker Z-Index Order
1. Route line (base)
2. NearbyCars (z-index: 50)
3. ZivoDropoffMarker (z-index: 90)
4. ZivoPickupMarker (z-index: 100)

