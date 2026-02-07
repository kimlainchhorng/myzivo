

# Add Custom SVG Marker Support

## Overview
This update enhances the GoogleMap component to support custom SVG icon markers, allowing ZIVO-branded markers to be displayed on the map.

---

## Changes

### 1. Update MapMarker Interface

**File: `src/components/maps/GoogleMap.tsx`** (lines 15-22)

Extend the `MapMarker` interface to better support custom icons:

```typescript
export interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  type?: "pickup" | "dropoff" | "driver" | "custom";
  title?: string;
  icon?: string;           // URL to custom SVG/PNG icon
  iconSize?: number;       // Size in pixels (default: 36)
  label?: string;
}
```

### 2. Update Marker Creation Logic

**File: `src/components/maps/GoogleMap.tsx`** (lines 158-204)

Update the marker creation to prioritize custom icons:

```typescript
markers.forEach(marker => {
  let icon: google.maps.Symbol | google.maps.Icon | undefined;
  
  // Use custom icon if provided
  if (marker.icon) {
    icon = {
      url: marker.icon,
      scaledSize: new window.google.maps.Size(
        marker.iconSize || 36, 
        marker.iconSize || 36
      ),
      anchor: new window.google.maps.Point(
        (marker.iconSize || 36) / 2, 
        (marker.iconSize || 36) / 2
      ),
    };
  } else if (marker.type === "pickup") {
    // ... existing pickup icon
  } else if (marker.type === "dropoff") {
    // ... existing dropoff icon
  } else if (marker.type === "driver") {
    // ... existing driver icon
  }
  
  // ... rest of marker creation
});
```

### 3. Create ZIVO Marker SVG

**File: `public/zivo-marker.svg`**

Create a branded marker icon (blue circle with ZIVO branding or custom design):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
  <circle cx="18" cy="18" r="16" fill="#3b82f6" stroke="#ffffff" stroke-width="3"/>
  <circle cx="18" cy="18" r="6" fill="#ffffff"/>
</svg>
```

---

## Usage Examples

After implementation, you can use custom markers like this:

```typescript
// Custom ZIVO marker
const markers: MapMarker[] = [
  {
    id: "user-location",
    position: { lat: 30.4515, lng: -91.1871 },
    icon: "/zivo-marker.svg",
    iconSize: 36,
    title: "Your Location",
  },
];

// Or continue using type-based markers
const markers: MapMarker[] = [
  {
    id: "pickup",
    position: pickupCoords,
    type: "pickup",  // Uses default blue circle
    title: "Pickup",
  },
];
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/maps/GoogleMap.tsx` | Add `iconSize` prop to interface, update marker creation to handle custom SVG URLs |
| `public/zivo-marker.svg` | Create new branded marker icon |

---

## Marker Priority Logic

| Scenario | Icon Used |
|----------|-----------|
| `marker.icon` provided | Custom SVG/PNG at specified URL |
| `type: "pickup"` | Blue circle |
| `type: "dropoff"` | Green circle |
| `type: "driver"` | Amber pin with drop animation |
| `type: "custom"` | Default Google marker |

