

## Fix: Map Not Showing Route After Entering Addresses

### Problem Identified
After entering both pickup and dropoff addresses on the Rides page, the map fails to:
1. Zoom out to show both locations
2. Draw the route line between pickup and dropoff

### Root Causes

**1. Unstable `markers` dependency causing effect issues**
In `GoogleMap.tsx` (line 141), the `useEffect` that handles `fitBounds` includes `markers` in its dependency array. However, in `Rides.tsx` (line 206), `markers` is always passed as `[]` — a **new empty array on every render**. This causes the effect to re-run constantly, resetting `directionsRequested` to `false` each time, which triggers an infinite loop of `DirectionsService` requests that cancel each other out.

**2. DirectionsService race condition**
Because the effect keeps resetting `directionsRequested`, the `DirectionsService` component mounts, gets destroyed, and remounts repeatedly — never completing a successful route request.

### Fix Plan

**File: `src/components/maps/GoogleMap.tsx`**

1. **Remove `markers` from the useEffect dependency array** (line 141) — Since markers rarely change in the Rides context and the effect is specifically about pickup/dropoff changes, including markers causes unnecessary re-triggering. Instead, stabilize the reference.

2. **Memoize the markers array inside GoogleMap** or use a stable reference check to prevent re-running the effect when markers haven't actually changed.

3. **Remove debug console.log statements** added in previous attempts.

### Technical Details

```text
Current (broken):
  useEffect(() => {
    // Reset directions + fitBounds logic
  }, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng, fitBounds, markers]);
                                                                         ^^^^^^^^
                                                              new [] every render = infinite loop

Fixed:
  useEffect(() => {
    // Reset directions + fitBounds logic
  }, [pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng, fitBounds]);
  // markers removed — they don't affect pickup/dropoff route logic
```

Additionally, move the `markers.forEach(m => bounds.extend(m.position))` call to use a ref or the current value without it being a dependency, since extending bounds with markers is a nice-to-have but should not drive the effect.

### Files to Change
- `src/components/maps/GoogleMap.tsx` — Fix the useEffect dependency array and remove debug logs

