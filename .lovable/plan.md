

# Fix Ride Hub Map — Layout, Initialization, and User Location

## Problem Analysis

After inspecting the code, there are three root causes for the blank map:

1. **Container height is zero**: `NativeGoogleMap` renders with `className="absolute inset-0"` inside `MapSection` which has `flex-1 min-h-0`. The Google Maps API requires the container to have computed dimensions at init time. With the current flex chain + AnimatePresence, the container can have 0px height when the map initializes.

2. **Auth failure is permanent**: The global `googleMapsAuthFailed` flag is set once and never reset. If the edge function call fails or auth fails on first load, all subsequent renders show the fallback forever (until page refresh).

3. **No user location**: The map centers on NYC default coords but never requests the user's actual location.

## Plan

### 1. Fix Map Container Sizing (RideMap.tsx)
- In `NativeGoogleMap`, replace `absolute inset-0` with `w-full h-full` 
- In `MapSection` (RideBookingHome.tsx), ensure the map wrapper div has `relative` and a minimum height fallback: `min-h-[200px]` so Google Maps always gets a non-zero container
- Add a `ResizeObserver` or `google.maps.event.trigger(map, 'resize')` after mount to handle late-layout cases

### 2. Fix Auth Failure Recovery (RideMap.tsx)
- Add a retry mechanism: if `googleMapsAuthFailed` is true, allow a retry after 5 seconds instead of permanent failure
- Reset the singleton state when retrying
- Add better error logging

### 3. Add User Location (RideBookingHome.tsx)
- Import and use `useCurrentLocation` hook
- On mount (home view), call `getCurrentLocation()` and pass the result as `pickupCoords` to `MapSection`/`RideMap`
- Add a user location blue dot marker in `NativeGoogleMap` when no pickup is explicitly set
- Wire the floating location button in `MapSection` to re-center on user location

### 4. Ensure Map Re-renders on Mobile (RideMap.tsx)
- After map initialization, call `google.maps.event.trigger(map, 'resize')` with a short delay
- Use `requestAnimationFrame` to ensure the container has layout before initializing

### Files Modified
- `src/components/maps/RideMap.tsx` — container fix, resize trigger, auth retry, user location marker
- `src/components/rides/RideBookingHome.tsx` — user location hook, pass coords to map, wire location button

