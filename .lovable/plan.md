
# Real Mapbox Integration for ZIVO Ride Flow

## Overview

This plan adds **real Mapbox maps** with **real geocoding**, **real routing (distance/duration)**, and **real dynamic pricing** throughout the ride booking flow. All changes maintain the existing UI design.

---

## Current State

| Feature | Current Implementation |
|---------|------------------------|
| Maps | Google Maps (requires `VITE_GOOGLE_MAPS_API_KEY`) |
| Geocoding | Mapbox reverse geocoding only (for current location) |
| Address Search | Mock Louisiana suggestions (hardcoded list) |
| Route/Distance | Mock hash-based calculation (2-12 miles) |
| Pricing | Formula-based but using mock distance/duration |
| Driver Movement | Time-based intervals, not route-based |

**Mapbox Token**: Already configured as `VITE_MAPBOX_ACCESS_TOKEN` (verified in secrets)

---

## Implementation Plan

### Phase 1: Mapbox Service Layer

Create `src/services/mapbox.ts` - a centralized service for all Mapbox API calls:

| Function | Purpose |
|----------|---------|
| `geocodeAddress(query)` | Convert address string → lat/lng |
| `reverseGeocode(lat, lng)` | Convert coordinates → address |
| `getRoute(origin, dest)` | Get distance (meters), duration (seconds), geometry |
| `getAddressSuggestions(query)` | Autocomplete suggestions via Places API |

All functions will:
- Check for `VITE_MAPBOX_ACCESS_TOKEN` availability
- Return graceful fallbacks if token missing
- Cache results to prevent duplicate API calls

---

### Phase 2: Mapbox Map Components

Create reusable Mapbox-powered map components:

**New File**: `src/components/maps/MapboxMap.tsx`
- Wrapper around mapbox-gl
- Dark mode styling matching ZIVO theme
- Marker support (pickup, dropoff, driver types)
- Route polyline rendering
- Graceful fallback message: "Map key not set"

**New File**: `src/components/maps/MapboxMapProvider.tsx`
- Context provider for shared map state
- Token availability check

---

### Phase 3: Real Geocoding & Routing on Rides Page

Update `src/pages/Rides.tsx`:

1. **Replace mock address suggestions** with Mapbox Places API
   - Debounced search (300ms) to reduce API calls
   - Cache recent searches

2. **Add geocoding when addresses are selected**
   - Store lat/lng for pickup and destination
   - New state: `pickupCoords`, `dropoffCoords`

3. **Fetch real route when both locations set**
   - Call Mapbox Directions API
   - Extract: `distance` (meters → miles), `duration` (seconds → minutes)
   - Store route geometry for map display
   - Update `estimatedDistance` and `estimatedDuration` with real values

4. **Update pricing with real distance/duration**
   - Use existing `calculateFare()` function
   - Feed in real values instead of mock values
   - All ride card prices update dynamically

---

### Phase 4: Real Pricing Formula

Update `src/lib/tripCalculator.ts` to add new multipliers matching your spec:

```text
Pricing Formula:
fare = (baseFare + miles × perMile + minutes × perMin) × multiplier

Constants:
- baseFare = $2.00
- perMile = $1.25
- perMin = $0.20

Multipliers:
- Economy (wait_save, standard, green, priority): 0.75 - 1.30
- Premium (comfort, black, black_suv, xxl): 1.55 - 3.70
- Elite (lux, sprinter, secure, pet): 3.0 - 20.0
```

The existing `calculateFare()` function in `Rides.tsx` already uses a compatible formula - we'll ensure it matches your spec exactly.

---

### Phase 5: Driver Movement on Real Route

**Update `/ride/driver` (RideDriverPage.tsx)**:

1. Receive route geometry from previous page via state
2. Create driver marker that follows the actual route polyline
3. Interpolate driver position every 1 second along route coordinates
4. When driver reaches pickup point (within threshold):
   - Show "Driver has arrived!"
   - Enable "START TRIP" button

**Update `/ride/trip` (RideTripPage.tsx)**:

1. Receive full route geometry
2. Move driver marker from pickup → destination along polyline
3. Calculate progress percentage based on route completion
4. Update ETA dynamically based on remaining route distance
5. When complete, enable "END TRIP"

---

### Phase 6: Map Components Integration

**Update `src/components/ride/DriverMapView.tsx`**:
- Replace Google Maps with Mapbox
- Accept route geometry prop
- Animate driver along actual route

**Update `src/components/ride/TripMapView.tsx`**:
- Replace Google Maps with Mapbox
- Show full pickup → destination route
- Animate car marker along route

**Update `src/components/ride/RidesMapBackground.tsx`**:
- Switch to Mapbox for background
- Show pickup/dropoff markers when set
- Display route preview

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/mapbox.ts` | Centralized Mapbox API service |
| `src/components/maps/MapboxMap.tsx` | Reusable Mapbox component |
| `src/components/maps/MapboxMapProvider.tsx` | Context for map state |
| `src/hooks/useMapboxRoute.ts` | Hook for fetching routes with caching |
| `src/hooks/useMapboxGeocode.ts` | Hook for geocoding with caching |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Rides.tsx` | Add geocoding, routing, real pricing display |
| `src/pages/ride/RideDriverPage.tsx` | Receive route data, animate driver on real path |
| `src/pages/ride/RideTripPage.tsx` | Animate trip progress on real route |
| `src/components/ride/DriverMapView.tsx` | Switch to Mapbox, add route animation |
| `src/components/ride/TripMapView.tsx` | Switch to Mapbox, add route animation |
| `src/components/ride/RidesMapBackground.tsx` | Switch to Mapbox background |
| `src/lib/tripCalculator.ts` | Ensure pricing formula matches spec |
| `src/components/maps/index.ts` | Export new Mapbox components |

---

## Graceful Fallbacks

If Mapbox API fails or token is missing:

| Feature | Fallback Behavior |
|---------|-------------------|
| Map display | Static placeholder image with message "Map key not set" |
| Address suggestions | Existing mock Louisiana addresses |
| Geocoding | Use mock Baton Rouge coordinates |
| Route/Distance | Use mock hash-based calculation |
| Driver movement | Time-based animation (current behavior) |

---

## State Flow

```text
[/ride]
   User enters pickup → Geocode → pickupCoords
   User enters destination → Geocode → dropoffCoords
   Both set → Fetch route → { distance, duration, geometry }
   Update all ride card prices with real fare
              ↓
[/ride/confirm]
   Display real distance/duration/price
   Save route geometry to localStorage
              ↓
[/ride/searching]
   (unchanged - animated search)
              ↓
[/ride/driver]
   Load route geometry
   Driver marker follows route polyline → pickup
   Arrival triggers "Driver has arrived!"
              ↓
[/ride/trip]
   Driver marker follows route polyline → destination
   Progress % = (traveled distance / total distance)
   Arrival enables "END TRIP"
```

---

## API Usage Estimates

Per ride booking session:
- 2 geocode requests (pickup + destination)
- 1 directions request
- ~5-10 autocomplete requests

All within Mapbox free tier (100,000 requests/month).

---

## Technical Details

### Route Geometry Interpolation

Driver position will be calculated by:
1. Storing route as array of coordinates from Mapbox
2. Using elapsed time to calculate expected progress
3. Finding the coordinate at that progress point
4. Smoothly animating marker between points (requestAnimationFrame)

### Caching Strategy

```text
Cache key: `zivo_geo_${address_hash}`
Cache key: `zivo_route_${origin_hash}_${dest_hash}`
TTL: 30 minutes (localStorage)
```

This prevents redundant API calls when user navigates back/forward.

---

## Summary

| Enhancement | Implementation |
|-------------|----------------|
| Real maps | Mapbox GL JS with dark styling |
| Real geocoding | Mapbox Geocoding API (forward + reverse) |
| Real autocomplete | Mapbox Places API |
| Real routes | Mapbox Directions API |
| Real pricing | Distance × $1.25 + Duration × $0.20 + $2 base |
| Driver animation | Follow actual route polyline |
| Token missing | Graceful fallback to mock/static content |
