

## Add Route Loading Indicator

### Overview
When a user enters both pickup and dropoff addresses, there's a brief delay while the route is calculated via the server-side edge function. Currently there's no visual feedback during this time. This change adds a loading indicator on the map and in the vehicle options area.

### What Changes

**File: `src/pages/Rides.tsx`**

1. **Destructure `isLoading`** from `useServerRoute()` (it's already returned by the hook, just not used):
   - Change line 290 from `{ routeData, fetchRoute, clearRoute }` to `{ routeData, isLoading: isRouteLoading, fetchRoute, clearRoute }`

2. **Pass `isRouteLoading` to `RidesMapView`** so the map can show an overlay indicator while calculating.

3. **Add a loading state in the trip info area** (around line 1152): When `isRouteLoading` is true and both addresses are set, show a skeleton/spinner pill instead of the distance/duration info, giving the user immediate feedback that the route is being calculated.

4. **Add a loading overlay on the map**: Show a subtle "Calculating route..." pill floating on the map when `isRouteLoading` is true and both pickup and dropoff are set.

**File: `src/pages/Rides.tsx` (RidesMapView sub-component)**

5. Accept an `isRouteLoading` prop and render a floating indicator (a small pill with a spinner and "Calculating route..." text) centered on the map when loading.

### Technical Details

- The `useServerRoute` hook already tracks `isLoading` state -- no backend changes needed
- The loading indicator appears only when both addresses are entered (not during initial page load)
- Uses existing `Loader2` icon (already imported) with `animate-spin` for the spinner
- Styled consistently with existing ZIVO brand (emerald tones, rounded pills, backdrop blur)
