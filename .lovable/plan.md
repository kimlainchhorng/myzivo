

# Google Maps Integration for ZIVO Ride Flow

## Overview

Replace the current Mapbox implementation with Google Maps JavaScript API for geocoding, routing, and map display. This maintains the existing UI design while switching the underlying map provider.

---

## Current State

| Feature | Current Implementation |
|---------|------------------------|
| Maps | Mapbox GL JS via `MapboxMap.tsx` |
| Geocoding | Mapbox Geocoding API via `src/services/mapbox.ts` |
| Routing | Mapbox Directions API |
| Pricing | Real formula with Mapbox distance/duration data |
| API Key | `VITE_MAPBOX_ACCESS_TOKEN` |

**Existing Google Maps components**: `GoogleMap.tsx` and `GoogleMapProvider.tsx` already exist in the codebase but are not currently used.

**API Key**: `VITE_GOOGLE_MAPS_API_KEY` is already configured as a secret.

---

## Implementation Plan

### Phase 1: Create Google Maps Service Layer

Create `src/services/googleMaps.ts` to mirror the Mapbox service:

| Function | Purpose |
|----------|---------|
| `hasGoogleMapsKey()` | Check if API key is available |
| `geocodeAddress(query)` | Convert address string to lat/lng |
| `reverseGeocode(lat, lng)` | Convert coordinates to address |
| `getRoute(origin, dest)` | Get distance, duration, and route polyline |
| `getAddressSuggestions(query)` | Autocomplete via Places API |
| `interpolateRoutePosition(coords, progress)` | Calculate position along route |
| `decodePolyline(encoded)` | Decode Google's encoded polyline format |

All functions will:
- Use `VITE_GOOGLE_MAPS_API_KEY` from environment
- Cache results in memory and localStorage (30-minute TTL)
- Return graceful fallbacks if API fails

---

### Phase 2: Create Google Maps Hooks

**New File**: `src/hooks/useGoogleMapsRoute.ts`
- Fetches route data between two addresses
- Returns distance (miles), duration (minutes), and route coordinates
- Falls back to mock calculation if API fails

**New File**: `src/hooks/useGoogleMapsGeocode.ts`
- Provides debounced address autocomplete
- Uses Google Places API for suggestions
- Falls back to mock Louisiana addresses if API fails

---

### Phase 3: Update Map View Components

**Update `src/components/ride/DriverMapView.tsx`**:
- Replace Mapbox with GoogleMap component
- Use `GoogleMapProvider` wrapper
- Check for Google Maps API availability
- Pass route as origin/destination for Directions rendering

**Update `src/components/ride/TripMapView.tsx`**:
- Replace Mapbox with GoogleMap component
- Show pickup, destination, and moving car markers
- Display route polyline

**Update `src/components/ride/RidesMapBackground.tsx`**:
- Switch to GoogleMap for background
- Show pickup/dropoff markers when set
- Display route preview

---

### Phase 4: Update Rides Page

**Update `src/pages/Rides.tsx`**:
- Replace `useMapboxRoute` with `useGoogleMapsRoute`
- Replace `useMapboxGeocode` with `useGoogleMapsGeocode`
- Import `GoogleMapProvider` and wrap map background
- Real pricing calculation unchanged (already uses correct formula)

---

### Phase 5: Update Ride Flow Pages

**Update `src/pages/ride/RideDriverPage.tsx`**:
- Replace `interpolateRoutePosition` from mapbox.ts with Google version
- Wrap in `GoogleMapProvider` if needed
- Driver marker moves along Google route coordinates

**Update `src/pages/ride/RideTripPage.tsx`**:
- Replace Mapbox interpolation with Google Maps version
- Car marker follows actual route polyline
- Progress bar based on route completion

---

## Technical Details

### Google Directions API Response Format

Google returns encoded polylines that need decoding:

```text
overview_polyline: { points: "a~l~Fjk~uOwHJy@P..." }
legs[0].distance.value: 12345  // meters
legs[0].duration.value: 900    // seconds
```

The service will decode polylines to `[{lat, lng}]` coordinate arrays.

### Pricing Formula (Unchanged)

```text
fare = (baseFare + miles × perMile + minutes × perMin) × multiplier

Constants:
- baseFare = $2.00
- perMile = $1.25
- perMin = $0.20

Multipliers (from tripCalculator.ts):
- Economy: 0.75 - 1.30
- Premium: 1.55 - 3.70
- Elite: 3.0 - 20.0
```

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/services/googleMaps.ts` | Centralized Google Maps API service |
| `src/hooks/useGoogleMapsRoute.ts` | Route fetching hook |
| `src/hooks/useGoogleMapsGeocode.ts` | Address autocomplete hook |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/Rides.tsx` | Switch to Google Maps hooks, wrap map in provider |
| `src/pages/ride/RideDriverPage.tsx` | Use Google route interpolation |
| `src/pages/ride/RideTripPage.tsx` | Use Google route interpolation |
| `src/components/ride/DriverMapView.tsx` | Use GoogleMap component |
| `src/components/ride/TripMapView.tsx` | Use GoogleMap component |
| `src/components/ride/RidesMapBackground.tsx` | Use GoogleMap component |

---

## Graceful Fallbacks

If Google Maps API fails or key is missing:

| Feature | Fallback Behavior |
|---------|-------------------|
| Map display | Static placeholder image with "Map key not set" message |
| Address suggestions | Mock Louisiana addresses (hardcoded list) |
| Geocoding | Mock Baton Rouge coordinates |
| Route/Distance | Mock hash-based calculation (existing in tripCalculator.ts) |
| Driver movement | Time-based animation |

---

## Driver & Trip Animation

**Driver Page (`/ride/driver`)**:
1. Receive route coordinates from confirm page
2. Create mock driver start position (offset from pickup)
3. Move driver marker along route every 200ms
4. When driver reaches pickup (progress >= 1):
   - Show "Driver has arrived!"
   - Enable "START TRIP" button

**Trip Page (`/ride/trip`)**:
1. Move car marker from pickup → destination along route
2. Calculate progress: `(traveled / total) × 100%`
3. Update ETA based on remaining distance
4. When complete, enable "END TRIP"

---

## State Flow

```text
[/ride]
   User enters pickup → Google Geocoding → pickupCoords
   User enters destination → Google Geocoding → dropoffCoords
   Both set → Google Directions → { distance, duration, routeCoords }
   Update all ride card prices with real fare
              ↓
[/ride/confirm]
   Display real distance/duration/price
   Save route coordinates to localStorage
              ↓
[/ride/searching]
   (unchanged - animated search)
              ↓
[/ride/driver]
   Load route coordinates
   Driver marker follows route → pickup
   Arrival triggers "Driver has arrived!"
              ↓
[/ride/trip]
   Car marker follows route → destination
   Progress % = (traveled / total)
   Arrival enables "END TRIP"
```

---

## Summary

| Enhancement | Implementation |
|-------------|----------------|
| Real maps | Google Maps JavaScript API with dark styling |
| Real geocoding | Google Geocoding API |
| Real autocomplete | Google Places API |
| Real routes | Google Directions API |
| Real pricing | Distance × $1.25 + Duration × $0.20 + $2 base |
| Driver animation | Follow actual route polyline |
| API key missing | Graceful fallback to mock/static content |

