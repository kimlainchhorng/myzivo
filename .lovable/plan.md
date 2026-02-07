
Goal
- Make the /rides map “update” reliably (show real Google map tiles, and update markers/route when pickup/dropoff changes), instead of staying on the fallback background.

What’s happening now (from code + your logs)
- The map is showing the fallback because Google Maps JS API is not successfully loading.
- The browser is failing to call the Supabase Edge Function `maps-api-key` (“Failed to fetch …/functions/v1/maps-api-key”).
- The ride route/coords are also not being computed correctly because current hooks still attempt client-side Google HTTP APIs (`maps.googleapis.com`), which fail in your environment (“Failed to fetch (maps.googleapis.com)”), so the app falls back to mock route data (“Geocoding failed, using mock data”).
- Result: chips can change, but the actual map tiles/real routing never “updates” because we’re stuck in fallback + mock coords.

High-level fix
1) Ensure the `maps-api-key` edge function can be called from the web app (CORS headers + auth config), so the Google Maps JS script can load and show real tiles.
2) Remove remaining client-side calls to `maps.googleapis.com` for autocomplete/geocode/route and use the existing server-side edge functions (`maps-autocomplete`, `maps-place-details`, `maps-route`) via `src/services/mapsApi.ts`.
3) Update the /rides page state so it stores pickup/dropoff coordinates from Place Details (not from client geocoding), and then compute route via `useServerRoute` (already built and used elsewhere).
4) Add small map re-render behaviors (optional) so marker/route changes are always reflected quickly.

Detailed implementation plan (code changes)

A) Fix `maps-api-key` edge function so it works from the web app
- File: `supabase/functions/maps-api-key/index.ts`
  - Update `corsHeaders.Access-Control-Allow-Headers` to match the standard used in your other map functions:
    - Include: `authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version`
  - Keep OPTIONS preflight handler.

- File: `supabase/config.toml`
  - Add:
    - `[functions.maps-api-key]`
    - `verify_jwt = false`
  - Reason: map loading should work even before login; and it prevents auth-related fetch failures.

B) Stop client-side Google HTTP API usage for autocomplete/geocode/route on /rides
- We already have:
  - `supabase/functions/maps-autocomplete`
  - `supabase/functions/maps-place-details`
  - `supabase/functions/maps-route`
  - `src/services/mapsApi.ts` wrappers
  - `src/hooks/useServerRoute.ts` to compute distance/duration/polyline securely

So we will rewire /rides to use those.

C) Update autocomplete hook to use edge functions (no direct maps.googleapis.com)
- File: `src/hooks/useGoogleMapsGeocode.ts`
  - Replace use of `getAddressSuggestions` from `src/services/googleMaps.ts` with `getAutocompleteSuggestions` from `src/services/mapsApi.ts`.
  - Change Suggestion type to carry `place_id` (so we can fetch coordinates):
    - `Suggestion = { id, placeName, text, placeId }`
  - `fetchSuggestions()` should call `getAutocompleteSuggestions(input, proximity)` and map results to suggestions.
  - Keep the current MOCK_SUGGESTIONS fallback if the edge function returns empty or errors.

D) Update /rides page to store coordinates and compute route using `useServerRoute`
- File: `src/pages/Rides.tsx`
  1) Replace:
     - `useGoogleMapsRoute()` with `useServerRoute()`
  2) Add state:
     - `pickupCoords: {lat,lng} | null`
     - `dropoffCoords: {lat,lng} | null`
  3) When the user selects an autocomplete suggestion:
     - Call `getPlaceDetails(placeId)` (from `src/services/mapsApi.ts`)
     - Set:
       - `pickup` (use returned formatted address)
       - `pickupCoords` (lat/lng)
     - Same for dropoff.
  4) Update the existing effect that triggers route calculation:
     - Instead of `fetchRoute(pickup, dropoff)` (string geocoding),
     - Do `fetchRoute(pickupCoords, dropoffCoords, pickup, dropoff)` when both coords exist.
  5) Pass map props from coords/routeData:
     - `pickupCoords={pickupCoords}`
     - `dropoffCoords={dropoffCoords}`
     - `estimatedDistance/Duration` from `routeData.distance` / `routeData.duration`

E) Make the map react cleanly to changes
- File: `src/components/maps/GoogleMap.tsx`
  - Add a small effect to update center/zoom when props change (when map is already initialized):
    - On `center` change: `mapInstanceRef.current?.panTo(center)`
    - On `zoom` change: `mapInstanceRef.current?.setZoom(zoom)`
  - Ensure route cleanup:
    - When `route` becomes undefined/null, clear the directions renderer:
      - `directionsRendererRef.current?.setDirections({ routes: [] } as any)` OR `directionsRendererRef.current?.setMap(null); directionsRendererRef.current=null`
    - This prevents stale route lines when user clears destination.

F) (Optional but recommended) Make the fallback tell us the real failure
- File: `src/components/maps/GoogleMapProvider.tsx`
  - If the edge function call fails, set a clearer `loadError` (e.g., “Unable to reach maps key service”) so it’s obvious it’s connectivity/CORS vs missing secret.
  - This is purely debugging/UX.

Validation / testing steps (what we’ll verify after implementing)
1) Load /rides:
   - Google map tiles appear (no fallback grid).
2) Type pickup/dropoff, select suggestion:
   - pickup/dropoff chips update
   - markers move to the selected addresses
   - route line appears between them
   - distance/duration update (from `maps-route` edge function)
3) Clear destination:
   - route line disappears (no stale polyline)
4) “Locate me”:
   - pickup is set and pickup marker moves (existing Mapbox reverse geocode can remain for now; we can optionally migrate it later too).

Files expected to change
- supabase/functions/maps-api-key/index.ts
- supabase/config.toml
- src/hooks/useGoogleMapsGeocode.ts
- src/pages/Rides.tsx
- src/components/maps/GoogleMap.tsx
- (optional) src/components/maps/GoogleMapProvider.tsx

Notes / tradeoffs
- This aligns with your project’s stated standard: “migrate core Google Maps operations to server-side Edge Functions” and prevents exposing your Google API key.
- It also avoids flaky client-side fetches to `maps.googleapis.com` which are failing in your current environment.
