

# Fix: Show Real Address Instead of Raw Coordinates

## Problem

When the user's location is detected on the Rides page, the pickup field shows raw coordinates like `30.471521, -90.959525` instead of a human-readable address like "109 Hickory St, Denham Springs, LA".

## Root Cause

The `reverseGeocode` function in `useCurrentLocation.ts` (line 65-79) calls the **Mapbox** geocoding API using `VITE_MAPBOX_ACCESS_TOKEN`. This token is empty/not configured, so the API call fails and the code falls back to returning raw coordinates:

```
return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
```

The rest of the app has already migrated to **Google Maps via edge functions** (the `maps-autocomplete`, `maps-place-details`, `maps-route` edge functions all use `GOOGLE_MAPS_API_KEY` server-side). But `reverseGeocode` was never migrated -- it still relies on the old Mapbox client-side token.

## Solution

Two changes:

### 1. New edge function: `maps-reverse-geocode`

Create a new Supabase edge function that calls Google's Geocoding API server-side to convert coordinates to an address. Pattern matches the existing `maps-place-details` function.

- Accepts `{ lat, lng }` in the request body
- Calls `https://maps.googleapis.com/maps/api/geocode/json?latlng={lat},{lng}&key={KEY}`
- Returns `{ ok: true, address: "109 Hickory St, Denham Springs, LA 70726" }`

### 2. Update `reverseGeocode` in `useCurrentLocation.ts`

Replace the broken Mapbox API call with a call to the new edge function via `supabase.functions.invoke("maps-reverse-geocode", { body: { lat, lng } })`. Remove the `MAPBOX_TOKEN` constant since it's no longer needed.

### 3. Add `reverseGeocode` to `mapsApi.ts`

Add a `reverseGeocode(lat, lng)` function to the centralized maps API service, following the same pattern as `getPlaceDetails`. Then `useCurrentLocation.ts` imports and uses it.

### Files Changed

| File | Change |
|------|--------|
| `supabase/functions/maps-reverse-geocode/index.ts` | New edge function for Google reverse geocoding |
| `src/services/mapsApi.ts` | Add `reverseGeocode(lat, lng)` function |
| `src/hooks/useCurrentLocation.ts` | Replace Mapbox call with `mapsApi.reverseGeocode`, remove `MAPBOX_TOKEN` |

### Result

The pickup field will show a real street address like "109 Hickory St, Denham Springs, LA" instead of raw coordinates. The floating pickup card on the map will also show the real address.

