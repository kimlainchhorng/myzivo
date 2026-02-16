

## Fix: Map Route Not Rendering Reliably

### Root Cause Analysis

The GoogleMap component has **two competing route-rendering systems** that conflict with each other:

1. **DirectionsService (client-side)** -- A Google Maps JS API call made directly from the browser. Renders via `DirectionsRenderer`.
2. **Server-side polyline (edge function)** -- Route fetched via `maps-route` edge function, decoded, and rendered via `PolylineF`. But this **only renders when `!directions`** (i.e., when the client-side call hasn't produced a result).

The problem: the `DirectionsService` component fires a client-side Directions API request using the browser-loaded API key. If that key doesn't have the Directions API enabled (common for security-restricted keys), the request fails silently -- `directionsRequested` gets set to `true`, but `directions` stays `null`. Meanwhile, the `PolylineF` fallback checks `!directions`, which IS true, so it should render... but `routePath` may not be available yet because the server-side edge function call is still in flight.

Additionally, there's a **timing race**: the `useEffect` in GoogleMap resets `directionsRequested` to `false` each time coords change, which re-mounts `DirectionsService`, creating redundant API calls that may cancel each other.

### Solution: Remove Client-Side DirectionsService, Use Server Polyline Only

Since the `maps-route` edge function already calls Google Directions API server-side and returns an encoded polyline, we should:

- **Remove the `DirectionsService` and `DirectionsRenderer`** from `GoogleMap.tsx` entirely
- **Always render the `PolylineF`** from the server-decoded `routePath`
- **Remove the `directionsRequested`/`directions` state** (no longer needed)

This eliminates:
- Duplicate API calls (saving cost and quota)
- Client-side API key permission requirements for Directions API
- Race conditions between two rendering systems
- The infinite-loop risk from the effect resetting `directionsRequested`

### Files to Change

**`src/components/maps/GoogleMap.tsx`**

1. Remove `DirectionsService` and `DirectionsRenderer` imports
2. Remove `directions` and `directionsRequested` state variables
3. Remove the `useEffect` that resets `directionsRequested` (lines 117-133) -- replace with a simpler `fitBounds`-only effect
4. Remove the `DirectionsService` JSX block (lines 244-258)
5. Remove the `DirectionsRenderer` JSX block (lines 261-273)
6. Update the `PolylineF` condition: remove the `&& !directions` guard so it always renders when `routePath` exists
7. Keep `fitBounds` logic in a simpler `useEffect` that only adjusts viewport

### Technical Details

```text
Before (two systems, racing):
  DirectionsService (client) --> DirectionsRenderer
  routePath (server)         --> PolylineF (only if !directions)

After (single system, reliable):
  routePath (server)         --> PolylineF (always when available)
  fitBounds effect           --> adjusts viewport to show both points
```

The `fitBounds` effect becomes simpler:

```text
useEffect:
  if pickup and dropoff both exist:
    create LatLngBounds, extend with both, fitBounds(60px padding)
  deps: [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng, fitBounds]
```

