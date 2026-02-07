

# ZIVO Map Styling + Pulsing Pickup Marker Animation

## Overview
This update applies your requested map configuration and adds an animated pulsing ring around the pickup marker for a premium Uber-style experience.

---

## Changes

### 1. Update Map Styles to Your Specification

**File: `src/components/maps/GoogleMap.tsx`** (lines 52-64)

Update `zivoMapStyles` with your exact color values (slightly refined water color):

```typescript
// ZIVO Dark map theme - premium, removes "Google look"
const zivoMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0b1220" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b1220" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1f2a44" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0b1220" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#061226" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#475569" }] },
];
```

### 2. Confirm Map Options

**File: `src/components/maps/GoogleMap.tsx`** (lines 108-120)

Already correctly configured:
- `disableDefaultUI: true` (when showControls is false)
- `clickableIcons: false`
- `gestureHandling: "greedy"`
- `zoomControl: false`

Add `keyboardShortcuts: false` for cleaner experience:

```typescript
mapInstanceRef.current = new window.google.maps.Map(mapRef.current, {
  center,
  zoom,
  mapId: resolvedMapId || undefined,
  styles: resolvedMapId ? undefined : (darkMode ? zivoMapStyles : undefined),
  disableDefaultUI: !showControls,
  zoomControl: false,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  gestureHandling: "greedy",
  clickableIcons: false,
  keyboardShortcuts: false,  // NEW: cleaner experience
});
```

### 3. Add Pulsing Keyframes to Tailwind

**File: `tailwind.config.ts`** (keyframes section)

Add the pulsing ring animation:

```typescript
keyframes: {
  // ...existing keyframes...
  'ping-slow': {
    '75%, 100%': { transform: 'scale(2.5)', opacity: '0' }
  },
  'ping-medium': {
    '75%, 100%': { transform: 'scale(2)', opacity: '0' }
  }
},
animation: {
  // ...existing animations...
  'ping-slow': 'ping-slow 2s cubic-bezier(0, 0, 0.2, 1) infinite',
  'ping-medium': 'ping-medium 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
}
```

### 4. Create Pulsing Pickup Marker Component

**New File: `src/components/maps/ZivoPickupMarker.tsx`**

Create a custom HTML overlay marker with pulsing animation rings:

```tsx
/**
 * ZivoPickupMarker - Custom pulsing pickup marker overlay
 */

interface ZivoPickupMarkerProps {
  position: { lat: number; lng: number };
  map: google.maps.Map;
}

// Renders pulsing pickup marker using CSS animations
// - Outer ring: slow ping animation (2s)
// - Middle ring: medium ping animation (1.5s)
// - Center: solid blue circle with white border
```

### 5. Integrate Pulsing Marker in GoogleMap Component

**File: `src/components/maps/GoogleMap.tsx`**

For pickup markers, use DOM-based overlay instead of standard marker to enable CSS animations:

```typescript
// In the marker creation loop, for pickup type:
if (marker.type === "pickup") {
  // Create a custom overlay with pulsing animation
  const overlayDiv = document.createElement('div');
  overlayDiv.innerHTML = `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-16 h-16 rounded-full bg-blue-500/30 animate-ping-slow"></div>
      <div class="absolute w-12 h-12 rounded-full bg-blue-500/40 animate-ping-medium"></div>
      <div class="w-6 h-6 rounded-full bg-blue-500 border-[3px] border-white shadow-lg relative z-10"></div>
    </div>
  `;
  // Use OverlayView to position it on the map
}
```

### 6. Gradient Overlay (Already Added)

**File: `src/pages/Rides.tsx`** (line 246)

The gradient overlay is already in place:
```tsx
<div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/50" />
```

---

## Summary

| File | Change |
|------|--------|
| `src/components/maps/GoogleMap.tsx` | Update styles to `#0b1220` base, `#061226` water; add `keyboardShortcuts: false`; implement pulsing pickup overlay |
| `tailwind.config.ts` | Add `ping-slow` and `ping-medium` keyframes/animations |
| `src/pages/Rides.tsx` | Already has gradient overlay and `darkMode={true}` |

---

## Visual Result

The map will display with:
- Deep navy ZIVO background (`#0b1220`)
- No POIs or transit markers
- Smoother dark water (`#061226`)
- Custom pulsing pickup marker with 2 expanding rings
- Premium gradient overlay for depth
- Bottom sheet UI unchanged

