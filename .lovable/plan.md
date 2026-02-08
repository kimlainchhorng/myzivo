
## Goal
Drivers are “online” in the database, but no car appears on the rider map. We will make the live driver markers easier to debug and harder to “silently” disappear, while still showing **only real online drivers**.

## What I found (likely root cause)
- Your frontend query is working and returns 1 online + verified driver with valid coordinates.
- That driver’s coordinates are **lat 11.5564, lng 104.9282** (Cambodia).
- The rider map `/rides` is centered around pickup/user/default (often **Baton Rouge: 30.4515, -91.1871** when no location/pickup is set).
- `RealDriverMarkers` filters drivers to **radiusMiles=10** around the map center. A driver in Cambodia will never be within 10 miles of a US-centered map, so nothing renders.

So the markers are not “broken”; they are being filtered out due to a **location mismatch**.

## Implementation approach
We will do two things:
1) Add a lightweight **Driver Debug Overlay** (behind a localStorage toggle) to show exactly why markers aren’t appearing (counts, center, closest driver distance).
2) Improve marker filtering to be more “map-correct” by optionally filtering by **current map viewport bounds** (best UX for maps), while keeping the “only online verified drivers” requirement.

This keeps production behavior clean while giving you a reliable way to validate that realtime + coordinates are correct.

---

## Changes (frontend)

### A) Enhance `RealDriverMarkers` with debug + better filtering
**File:** `src/components/maps/RealDriverMarkers.tsx`

Add:
- Compute:
  - `totalOnlineDrivers` (returned from `useOnlineDrivers`)
  - `nearbyDrivers` (within radius as today)
  - `closestDriver` and `closestDistanceMiles` from `center`
- Add a debug toggle:
  - `localStorage.getItem("zivo_debug_drivers") === "true"`
- If `debug` is on, render a small overlay (non-click-blocking) on the map:
  - Center lat/lng
  - Radius miles
  - Total online drivers returned
  - Nearby drivers count
  - Closest driver distance + its lat/lng
  - A hint: “Driver is far away. Pan/zoom to them or update driver GPS.”

Optional improvement (recommended):
- Accept an additional prop like `filterMode?: "radius" | "bounds"`:
  - `"radius"` = current behavior
  - `"bounds"` = show drivers inside map viewport bounds (more intuitive than a fixed 10mi)
- To support bounds mode, `GoogleMap` will pass current map bounds into `RealDriverMarkers`.

Why this helps:
- You can immediately see “online drivers exist, but none are within radius; closest is 8,000 miles away”.

### B) Pass map bounds (optional but recommended)
**File:** `src/components/maps/GoogleMap.tsx`

Add:
- Track `bounds` via `onBoundsChanged` and store:
  - `const [bounds, setBounds] = useState<google.maps.LatLngBoundsLiteral | null>(null)`
- Pass it down:
  - `<RealDriverMarkers center={...} radiusMiles={10} bounds={bounds} filterMode="bounds" />`

### C) Add “how to enable debug” note (dev-only)
No UI clutter by default; only if you set:
- `localStorage.setItem("zivo_debug_drivers", "true")` and refresh.

---

## Changes (backend / data) — verification steps (no code required, but important)
To actually *see* a driver near the rider, the driver must have GPS coordinates near the rider center.

We’ll verify the driver update loop is working by checking:
- Driver app is calling `updateLocationWithRetry(driverId, lat, lng)`
- Driver row `current_lat/current_lng` updates every few seconds when online
- The rider pickup/user location is in the same general region

If needed for testing, we can provide a safe SQL snippet to place a test driver near your current pickup location (only in Test env).

---

## Acceptance criteria
1) On `/rides`, if an online driver exists but is far away, the map still shows no car (correct), but in debug mode it clearly states:
   - “Online drivers: 1, Nearby: 0, Closest: XXXX miles”
2) If a driver is online and within radius/bounds of the map center, the car marker appears.
3) Optional bounds mode: panning/zooming the map causes drivers in view to appear/disappear naturally.

---

## Step-by-step rollout
1) Implement debug overlay + closest-driver calculation in `RealDriverMarkers`.
2) Add optional bounds filtering plumbing in `GoogleMap` and `RealDriverMarkers`.
3) Test:
   - With `zivo_debug_drivers=true` and your current dataset (Cambodia driver), confirm overlay explains why not showing.
   - Update driver coordinates (via driver app GPS or test SQL) near your pickup center; confirm marker appears.
4) Confirm realtime updates: move driver, ensure marker moves (Supabase realtime invalidation already exists).

---

## Risks / notes
- This does not weaken the “only real online drivers” requirement; it only improves observability and filtering behavior.
- If you later enable stricter RLS on `drivers`, rider visibility may break unless we expose a minimal public view (id + lat/lng + is_online + status) via a secured view or an edge function. For now, your REST request shows status 200 with data, so visibility is currently allowed.

---

## Quick test commands
Enable debug:
- `localStorage.setItem("zivo_debug_drivers", "true"); location.reload();`

Disable debug:
- `localStorage.removeItem("zivo_debug_drivers"); location.reload();`
