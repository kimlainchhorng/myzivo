# Shared Location v2 — Settings, Route, Persistent Cache, Better UI, Fallback

## What we'll add

### 1. Privacy setting: "Show address from coordinates"
- New toggle in `ChatPrivacyHubPage` under a new **Location Sharing** section
- **Default OFF** — minimal location disclosure: cards show only the user-supplied label + coordinates, no Nominatim lookup
- Second toggle: "Show route from my location" (also OFF by default — needs geo permission)

### 2. Persistent address cache
- New `src/lib/geocodeCache.ts`
  - In-memory `Map` for instant lookups
  - **localStorage** persistence (7-day TTL, max 200 entries, oldest evicted)
  - Coordinates quantised to 4 decimals (~11 m) so nearby points share entries
- Replaces the in-memory-only cache currently inside `LocationShareBubble.tsx`
- Survives refresh, tab close, app reload

### 3. Distance + ETA route overview
- Haversine distance from user's current location → shared coordinates
- Rough driving ETA at 50 km/h average ("12 min", "1 h 5 min")
- Shown inline as a pill: `🧭 4.2 km · ~8 min`
- Only fetches `navigator.geolocation` once per card mount, only when the toggle is ON, and silently hides if permission is denied

### 4. Cleaner card UI
- 2-line clamped label (`line-clamp-2`) + 2-line clamped address with proper truncation
- Distinct visual hierarchy: bold label → muted address → route pill → action row
- **Explicit "Open in Maps" button** (primary pill with `Navigation` icon + chevron) replaces the "Tap to open in Maps" hint line; the whole card stays clickable too
- Coordinates always shown small at the bottom for verification

### 5. Map-image fallback UI
- `<img onError>` swaps to a **clean placeholder**: subtle dotted-grid SVG background, large pulsing pin, "Map preview unavailable" caption
- The "Open in Maps" button remains fully functional — placeholder doesn't break the action
- Same height/width to avoid layout shift

## Technical notes

**New files**
- `src/hooks/useLocationSharePrefs.ts` — `{ prefs, update }` with localStorage + cross-tab sync
- `src/lib/geocodeCache.ts` — `reverseGeocode()`, `getCachedAddress()`, `haversineMeters()`, `formatDistance()`, `formatDriveEta()`

**Edited files**
- `src/components/chat/LocationShareBubble.tsx` — full rewrite using the new hook + cache + route + fallback
- `src/pages/chat/settings/ChatPrivacyHubPage.tsx` — adds the **Location Sharing** section with the two toggles

**No DB / migrations / new deps.** Pure client-side privacy upgrade.

## Out of scope
- True driving distance/ETA via a routing API (would need Google Directions key)
- Live location sharing (continuously updating)
- Address lookup for sender at send-time (we keep the "what's stored is just lat/lng" privacy model)
