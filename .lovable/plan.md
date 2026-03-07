

# Ride Hub: Replace SVG Map with Real Google Maps

## Problem
The current `RideBookingHome.tsx` uses a custom SVG-based `MapView` component (lines 123-280) with fake street grids and animated car icons. The project already has a fully functional `RideMap` component (`src/components/maps/RideMap.tsx`) that loads Google Maps via an API key from Supabase edge functions, with dark theme styling, markers, polylines, and a graceful fallback. This existing component is not being used on the Ride Hub.

## Plan

### 1. Replace the inline `MapView` with `RideMap` in RideBookingHome
- Remove the entire inline `MapView` function (lines 123-280) and the `NearbyCars` component (lines 82-121)
- Import `RideMap` from `@/components/maps/RideMap`
- Create a new wrapper component `MapSection` that:
  - Renders `<RideMap>` with appropriate props (`pickupCoords`, `dropoffCoords`, `routePolyline`)
  - Overlays the floating ride tabs, zoom controls, back button, and locator button on top of the Google Map using absolute positioning
  - Uses `className="h-[50vh] min-h-[300px]"` for sizing

### 2. Pass coordinates based on view step
- **Home screen**: Pass no pickup/dropoff coords (map shows default NYC center). No route.
- **Vehicle/Confirm screens**: Pass mock pickup coords (e.g. `{lat: 40.7128, lng: -73.9857}`) and dropoff coords (e.g. `{lat: 40.7580, lng: -73.9855}`) so `RideMap` draws markers and route.

### 3. Keep all existing UI elements
- Header bar (back arrow, "Ride Hub", notification bell) -- unchanged
- Floating ride mode tabs (Book/Reserve/Map/History) -- moved to overlay on `RideMap`
- Bottom booking panel (greeting, "Where to?", saved locations) -- unchanged
- Search screen, vehicle selection, confirm screens -- unchanged
- Vehicle options renamed to Economy/Comfort/Luxury per request

### 4. Vehicle options update
- Rename `zivoX` → "Economy", `black` → "Luxury", `zivoXL` → "Comfort"
- Update descriptions to match

### Files Modified
- `src/components/rides/RideBookingHome.tsx` -- replace MapView with RideMap, update vehicle names

### Technical Details
- The `RideMap` component handles its own API key fetching, script loading, auth failure fallback
- Overlays (tabs, zoom, locator) are positioned with `absolute` within a `relative` wrapper around `RideMap`
- The `RideMap` already has `disableDefaultUI: true` with `zoomControl: true`, so built-in zoom controls exist; we can keep custom ones or rely on Google's

