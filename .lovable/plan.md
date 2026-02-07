

# Apply ZIVO Dark Map Theme

## Overview
This update applies the custom ZIVO dark map styling you provided to the GoogleMap component, giving the maps a cohesive branded look that removes the "Google look" and matches the ZIVO design system.

---

## Changes

### 1. Install @react-google-maps/api Library

Add the React wrapper library for cleaner Google Maps integration:

```bash
npm install @react-google-maps/api
```

This provides `GoogleMap`, `MarkerF`, `useJsApiLoader` components that work well with React.

### 2. Update Dark Map Styles

**File: `src/components/maps/GoogleMap.tsx`** (lines 52-73)

Replace the current `darkMapStyles` with your ZIVO-branded dark theme:

```typescript
// ZIVO Dark map theme - removes the "Google look"
const zivoMapStyles: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0b1220" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#cbd5e1" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0b1220" }] },
  { featureType: "poi", stylers: [{ visibility: "off" }] },
  { featureType: "transit", stylers: [{ visibility: "off" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1f2a44" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#0b1220" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a1b3d" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#7dd3fc" }] },
];
```

---

## Theme Comparison

| Element | Current Style | ZIVO Theme |
|---------|---------------|------------|
| Background | `#212121` (gray) | `#0b1220` (deep navy) |
| Roads | `#2c2c2c` (dark gray) | `#1f2a44` (navy-blue) |
| Water | `#000000` (black) | `#0a1b3d` (dark blue) |
| Labels | `#757575` (gray) | `#cbd5e1` (light slate) |
| POIs | Visible (dimmed) | Hidden |
| Transit | Visible (dimmed) | Hidden |

---

## Optional: Switch to @react-google-maps/api

If you want to use the library syntax you showed (`<GoogleMap>`, `<MarkerF>`), we can refactor the component to use `@react-google-maps/api`. This provides:

- Declarative React components (`<GoogleMap>`, `<MarkerF>`, `<Polyline>`)
- Built-in `useJsApiLoader` hook
- Easier marker management via props

However, the current custom component already works well and just needs the style update.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/maps/GoogleMap.tsx` | Replace `darkMapStyles` with `zivoMapStyles` |
| `src/pages/Rides.tsx` | Set `darkMode={true}` on GoogleMap to apply ZIVO theme |

---

## Result

The map will display with:
- Deep navy background instead of gray
- Blue-tinted roads and water
- Cleaner look with POIs and transit hidden
- ZIVO-branded color palette matching your design system

