

# Add Live Map Tracking Enhancements

## Current State

The project already has a comprehensive live tracking system:

- **Customer Rides**: `RideTripPage` with `TripMapView`, real-time driver location via `useDriverLocationRealtime`, route interpolation, progress bar, ETA countdown, auto-complete at 100m threshold
- **Customer Eats**: `DeliveryMap` with driver/restaurant/delivery markers, stale detection, heading rotation
- **Driver View**: `DriverMapView` + `RideDriverPage` with pickup route, arrival detection
- **Real-time Hooks**: `useLiveDriverTracking` (Supabase Realtime on drivers table), `useLiveDriverLocation` (driver_locations table), `useTrafficAwareEta` (traffic-aware via Google Directions)
- **Map Infrastructure**: `GoogleMap` component with DirectionsService routing, ZIVO-branded markers, dark/light themes, RealDriverMarkers with debug overlay

## What's Missing

1. **Smooth animated marker movement** -- Driver markers currently jump between positions. No CSS/JS interpolation between location updates for fluid motion.
2. **Restaurant driver-approaching map** -- Restaurant dashboard shows stats but no live map of the driver approaching for pickup.
3. **Floating ETA card on map** -- Trip/delivery maps show ETA in separate cards below the map, not as a floating overlay on the map itself.
4. **Driver heading on ride markers** -- Ride `TripMapView` uses a generic car icon without heading rotation (Eats `DeliveryMap` already supports heading).

## Plan

### 1. Animated Driver Marker Component

New file: `src/components/maps/AnimatedDriverMarker.tsx`

A reusable Google Maps overlay marker that smoothly animates between position updates using CSS transitions:

- Wraps `OverlayViewF` with a `transition: transform 1s ease-out` on the container div
- Tracks previous position and uses `requestAnimationFrame` to lerp between old and new coordinates over ~1 second
- Shows the existing white car SVG with heading-based rotation
- Falls back to instant positioning if the jump distance exceeds 1 mile (teleport detection)
- Replaces the static `MarkerF` used for driver type in `GoogleMap.tsx` and the static arrow in `DeliveryMap.tsx`

### 2. Floating ETA Overlay Card

New file: `src/components/maps/FloatingEtaCard.tsx`

A compact, glassmorphic card positioned absolutely over the map (top-right corner):

- Shows ETA in minutes, distance remaining, and a traffic indicator dot (green/yellow/red)
- Auto-updates when props change with a subtle number-flip animation
- Uses the design system: `rounded-2xl`, `backdrop-blur-xl`, `border-white/10`, verdant accent
- Accepts props: `etaMinutes`, `distanceMiles`, `trafficLevel`, `statusLabel`

### 3. Restaurant Driver Approaching Map

New file: `src/components/restaurant/RestaurantDriverMap.tsx`

A compact map card for the restaurant dashboard showing drivers approaching for pickup:

- Shows restaurant location (orange marker) at center
- Shows assigned drivers for active orders with animated markers
- Subscribes to `food_orders` filtered by restaurant_id with status "ready" or "out_for_delivery" + their assigned driver locations
- Displays floating ETA card for the nearest approaching driver
- Uses `GoogleMap` component with light theme

Integration: Add this as a card in `RestaurantDashboard.tsx` alongside the existing activity feed.

### 4. Update Existing Map Views

| File | Change |
|------|--------|
| `src/components/maps/GoogleMap.tsx` | Replace static `MarkerF` for driver-type markers with the new `AnimatedDriverMarker` |
| `src/components/ride/TripMapView.tsx` | Add `FloatingEtaCard` overlay, pass heading to animated marker |
| `src/components/ride/DriverMapView.tsx` | Add `FloatingEtaCard` overlay showing distance to pickup |
| `src/components/eats/DeliveryMap.tsx` | Replace static arrow `Marker` with `AnimatedDriverMarker`, add `FloatingEtaCard` |
| `src/pages/RestaurantDashboard.tsx` | Add `RestaurantDriverMap` card |

## Technical Details

### Smooth Animation Approach

The animated marker uses CSS `transform` transitions on the OverlayView container. When a new lat/lng arrives:

1. Convert lat/lng to pixel position (handled by Google Maps OverlayView)
2. The OverlayView automatically repositions -- we add `transition: transform 0.8s cubic-bezier(0.25, 0.1, 0.25, 1)` to the wrapper div
3. If distance between old and new position exceeds 1 mile, skip animation (driver likely reassigned or GPS jump)

This avoids complex requestAnimationFrame coordinate math and leverages the browser's GPU-accelerated CSS transitions.

### Performance

- Driver location updates arrive every 5-10 seconds via Supabase Realtime (existing pattern)
- CSS transitions consume minimal CPU vs JS animation loops
- Restaurant map only subscribes when restaurant dashboard is open
- FloatingEtaCard uses `React.memo` to prevent unnecessary re-renders

### No New Dependencies

All implementations use existing libraries: `@react-google-maps/api`, `framer-motion` (already installed), CSS transitions, and existing Supabase realtime hooks.

