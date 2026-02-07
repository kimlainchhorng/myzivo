
# Refactor to @react-google-maps/api Library

## Overview
This update refactors the map system to use the `@react-google-maps/api` library for cleaner, declarative React components. This replaces the imperative DOM manipulation approach with React-native components like `<GoogleMap>`, `<MarkerF>`, `<OverlayViewF>`, and `<PolylineF>`.

---

## Changes

### 1. Install @react-google-maps/api

Add the library for declarative Google Maps React components:

```bash
npm install @react-google-maps/api
```

---

### 2. Refactor GoogleMapProvider

**File: `src/components/maps/GoogleMapProvider.tsx`**

Replace custom script loading with `LoadScriptNext`:

```tsx
import { LoadScriptNext } from "@react-google-maps/api";

const LIBRARIES: ("places" | "geometry")[] = ["places", "geometry"];

export default function GoogleMapProvider({ children }) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  if (!apiKey) {
    return <div className="...">Missing VITE_GOOGLE_MAPS_API_KEY</div>;
  }

  return (
    <LoadScriptNext googleMapsApiKey={apiKey} libraries={LIBRARIES}>
      {children}
    </LoadScriptNext>
  );
}
```

**Benefits:**
- Cleaner API loading
- Built-in loading states
- Proper library management

---

### 3. Refactor ZivoPickupMarker

**File: `src/components/maps/ZivoPickupMarker.tsx`**

Use `OverlayViewF` for declarative overlay:

```tsx
import { OverlayViewF } from "@react-google-maps/api";

export default function ZivoPickupMarker({ position }) {
  return (
    <OverlayViewF position={position} mapPaneName="overlayMouseTarget">
      <div className="relative flex items-center justify-center w-16 h-16 -translate-x-1/2 -translate-y-1/2">
        <div className="absolute w-16 h-16 rounded-full bg-blue-500/30 animate-ping" />
        <div className="absolute w-10 h-10 rounded-full bg-blue-500/20 animate-pulse" />
        <div className="w-5 h-5 rounded-full bg-blue-500 border-2 border-white shadow-lg z-10">
          <div className="w-1.5 h-1.5 bg-white/80 rounded-full m-auto mt-1" />
        </div>
      </div>
    </OverlayViewF>
  );
}
```

**Benefits:**
- No manual DOM manipulation
- React state management
- Clean component lifecycle

---

### 4. Refactor GoogleMap Component

**File: `src/components/maps/GoogleMap.tsx`**

Complete rewrite using declarative components:

```tsx
import { GoogleMap as GMap, MarkerF, PolylineF, useJsApiLoader } from "@react-google-maps/api";
import ZivoPickupMarker from "./ZivoPickupMarker";

const ZIVO_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0b1220" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1f2a44" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#061226" }] },
];

export default function GoogleMap({ center, pickup, dropoff, routePath, className }) {
  const options = useMemo(() => ({
    styles: ZIVO_MAP_STYLE,
    disableDefaultUI: true,
    clickableIcons: false,
    keyboardShortcuts: false,
    gestureHandling: "greedy",
    tilt: 0,
  }), []);

  return (
    <div className={`relative ${className}`}>
      <GMap mapContainerClassName="w-full h-full" center={center} zoom={14} options={options}>
        {pickup && <ZivoPickupMarker position={pickup} />}
        {dropoff && <MarkerF position={dropoff} icon={{
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: "#000000",
          fillOpacity: 1,
          strokeColor: "#ffffff",
          strokeWeight: 2,
        }} />}
        {routePath?.length && <PolylineF path={routePath} options={{
          strokeColor: "#3b82f6",
          strokeOpacity: 0.9,
          strokeWeight: 5,
        }} />}
      </GMap>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60" />
    </div>
  );
}
```

---

### 5. Update RidesMapBackground

**File: `src/components/ride/RidesMapBackground.tsx`**

Simplified wrapper with extra bottom fade:

```tsx
import GoogleMap from "../maps/GoogleMap";

export default function RidesMapBackground({ center, pickup, dropoff, routePath }) {
  return (
    <div className="absolute inset-0 z-0">
      <GoogleMap
        center={center}
        pickup={pickup}
        dropoff={dropoff}
        routePath={routePath}
        className="w-full h-full"
      />
      <div className="pointer-events-none absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/80 to-transparent" />
    </div>
  );
}
```

---

## Comparison: Before vs After

| Aspect | Current (Imperative) | New (Declarative) |
|--------|---------------------|-------------------|
| **API Loading** | Custom script injection | `LoadScriptNext` |
| **Markers** | `new google.maps.Marker()` | `<MarkerF position={...} />` |
| **Overlays** | Custom `OverlayView` class | `<OverlayViewF>` |
| **Routes** | `DirectionsService` + imperative | `<PolylineF path={...} />` |
| **Cleanup** | Manual ref management | Automatic via React |
| **Code Size** | ~370 lines | ~100 lines |

---

## Files Modified

| File | Action |
|------|--------|
| `package.json` | Add `@react-google-maps/api` |
| `src/components/maps/GoogleMapProvider.tsx` | Refactor to use `LoadScriptNext` |
| `src/components/maps/ZivoPickupMarker.tsx` | Refactor to use `OverlayViewF` |
| `src/components/maps/GoogleMap.tsx` | Complete rewrite with declarative components |
| `src/components/ride/RidesMapBackground.tsx` | Simplify props interface |

---

## Result

- **Cleaner code**: React-native components instead of imperative DOM
- **Better React integration**: Proper lifecycle management
- **Simpler API**: Just pass props, components handle the rest
- **Premium look preserved**: ZIVO dark theme + pulsing pickup marker + gradient overlay
- **Bottom sheet UI**: Unchanged
