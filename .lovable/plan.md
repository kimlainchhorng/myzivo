# Speed up Hotel pages + Map

Three concrete wins found in the code. Each ships independently and gets republished so we can measure.

## 1. Unify the Google Maps loader (biggest win)

Today the SDK is loaded from three separate files with different parameters:

- `src/components/lodging/HotelsMapView.tsx` → `?key=…&loading=async`
- `src/components/maps/RideMap.tsx` → `?key=…&libraries=marker,places&loading=async`
- `src/hooks/useNearbyPlaces.ts` → `?key=…&libraries=places,marker&loading=async`

If a user hits the Hotels map first and then a ride screen, the second request has a different URL so the browser refetches the SDK (~400 KB). Worse, two scripts can race and clobber `window.google`.

Fix: create `src/lib/maps/loadGoogleMaps.ts` — one promise-cached loader that always requests `libraries=marker,places` and `loading=async`. Replace all three call sites. Result: one network request site-wide, ~400 KB saved on the second map view, no race.

## 2. Defer the Hotels map until the user opens the Map tab

`HotelsMapView` is currently in the results bundle. On mobile most users scroll the list and never open Map. Move it behind a `React.lazy(() => import("@/components/lodging/HotelsMapView"))` in `HotelResultsPage.tsx`, wrapped in `<Suspense fallback={<MapSkeleton />}>`. Also drop `framer-motion` from `HotelLanding.tsx` — it's used for one fade-in that CSS handles in 6 lines.

Expected: ~30–50 KB off the Hotel route's first chunk, faster TTI on `/hotels` and `/hotels/results`.

## 3. Marker rendering: cap + cluster

`HotelsMapView` creates one `OverlayView` per hotel. With 50+ results on a city search this is the slowest paint on mobile. Two cheap fixes:

- Cap visible overlays to the 40 in the current map viewport (recompute on `idle` event, throttled 200ms).
- Replace HTML pill overlays with `google.maps.marker.AdvancedMarkerElement` (already part of the `marker` library we'll now always load). Native markers are GPU-composited and ~3× faster on iOS Safari.

## What this plan does NOT touch

- The hotel search API itself (waiting for real slow-query data).
- Map gestures / map-tile providers (already hardened per the maps memory).
- RideMap visual behavior — only its loader call site changes.

## Validation

After each step: publish → open `/hotels` then `/hotels/results?city=new-york` on a phone → paste back the `[vitals]` lines + the Network tab's "maps/api/js" request count. Roll back any step that doesn't move a metric.

## Technical notes

- No new runtime deps.
- The shared loader keys its cache on the script URL it injects, so concurrent callers from different components share one promise.
- AdvancedMarkerElement requires a Map ID; we'll add a Vite env var `VITE_GOOGLE_MAPS_MAP_ID` and fall back to classic markers if missing so prod doesn't break before the env is set.
