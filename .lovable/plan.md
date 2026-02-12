

# Fix: Rides Page Map Shows Blank/Loading Area

## Problem

The `/rides` page uses a full-screen map in the top half of the screen. When the Google Maps API hasn't loaded (no API key, user not logged in, slow network), this area shows either a blank white space or a grid pattern with a spinner -- making the page look broken, as shown in your screenshot.

## Solution

Improve the `RidesMapView` fallback to show a polished, branded placeholder instead of a broken-looking loading state. The map area will show a clean ZIVO-branded static background with a subtle gradient and location pin -- making it look intentional rather than broken.

### Changes to `src/pages/Rides.tsx`

**Replace the loading/fallback states in `RidesMapView`** (lines 157-210):

1. **Loading state**: Replace the grid-pattern + spinner with a clean gradient background (`bg-gradient-to-br from-emerald-50 to-teal-50`) showing a subtle animated location pulse -- looks polished instead of broken
2. **Error fallback**: Replace the fake road lines with the same clean gradient + a small "Map unavailable" label so users know it's not broken
3. Both states still render all the floating cards (pickup card, dropoff card, locate button) so the UI remains functional

### What stays the same

- The actual Google Map renders normally when the API loads
- All floating cards (pickup, dropoff, ETA badge) remain
- Bottom sheet with booking flow is unchanged
- All pricing, routing, and booking logic untouched

### Result

Instead of a blank white area or janky grid pattern, users see a clean branded background that looks intentional. The booking flow works identically -- the map is just a visual enhancement, not a requirement.

