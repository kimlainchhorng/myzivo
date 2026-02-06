

# Google Maps Integration for ZIVO Ride Flow

## Overview

Replace all static map images in the ride booking flow with interactive Google Maps. This will provide real-time route visualization and a more premium user experience.

---

## Current State

| Page | Current Implementation |
|------|------------------------|
| `/rides` | Static Unsplash city background |
| `/ride/driver` | Static Unsplash map image |
| `/ride/trip` | Static Unsplash map image |

---

## Issue Identified

The `GOOGLE_MAPS_API_KEY` was added as a **server-side secret**, but the frontend code requires `VITE_GOOGLE_MAPS_API_KEY` (with the `VITE_` prefix) to access it in React components.

---

## Implementation Plan

### Step 1: Fix API Key Configuration

Add the Google Maps API key with the correct prefix so the frontend can access it:
- Create `VITE_GOOGLE_MAPS_API_KEY` environment variable
- This makes the key available to `import.meta.env.VITE_GOOGLE_MAPS_API_KEY`

### Step 2: Update Rides Page (`/rides`)

Replace the static city background with a Google Map:
- Show user's current location marker (blue pulsing dot)
- Dark mode styling to match ZIVO theme
- Disable UI controls for clean background appearance
- Fall back to static image if Maps fails to load

### Step 3: Update Driver Page (`/ride/driver`)

Replace static map with interactive Google Map showing:
- Pickup location marker (primary color)
- Animated driver marker moving toward pickup
- Route line from driver to pickup
- Dark mode styling

### Step 4: Update Trip Page (`/ride/trip`)

Replace static map with Google Map showing:
- Pickup marker (green)
- Destination marker (primary color)
- Route line between locations
- Animated car icon following the route
- Dark mode styling

---

## Technical Details

### GoogleMap Component Usage

```text
<GoogleMap
  center={{ lat: 30.4515, lng: -91.1871 }}  // Baton Rouge default
  zoom={14}
  darkMode={true}
  showControls={false}
  markers={[
    { position: { lat, lng }, type: "pickup" },
    { position: { lat, lng }, type: "driver" }
  ]}
  route={{ origin, destination }}
/>
```

### Dark Mode Map Styling

The GoogleMap component already includes premium dark mode styles matching ZIVO's aesthetic (dark gray roads, subtle water colors, hidden labels).

### Graceful Fallback

Each page will check `isLoaded` from `useGoogleMaps()` and show the existing static image during loading or if the API fails.

---

## Files to Modify

| File | Changes |
|------|---------|
| Project Secrets | Add `VITE_GOOGLE_MAPS_API_KEY` |
| `src/pages/Rides.tsx` | Replace static background with GoogleMap |
| `src/pages/ride/RideDriverPage.tsx` | Replace static image with route-enabled map |
| `src/pages/ride/RideTripPage.tsx` | Replace static image with animated trip map |

---

## User Experience After Changes

```text
[/rides]
   Live dark map background showing current location
              ↓
[/ride/confirm]
   (unchanged - uses glass overlay design)
              ↓
[/ride/finding]
   (unchanged - full-screen loading animation)
              ↓
[/ride/driver]
   Google Map with driver marker approaching pickup
              ↓
[/ride/trip]
   Google Map with animated car following route to destination
```

