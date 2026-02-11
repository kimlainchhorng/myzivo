

## Map-First Home Screen Redesign

Transform AppHome.tsx from a scrolling feed layout into a map-first super app experience (like Uber/Grab), with a full-screen map showing nearby drivers and a draggable bottom panel containing all content.

---

### New Layout Structure

```text
+----------------------------------+
| Status Bar (safe area)           |
+----------------------------------+
| Top Overlay:                     |
|   Avatar  Greeting    Bell icon  |
|   [Search Bar - "Where to?"]    |
+----------------------------------+
|                                  |
|        FULL-SCREEN MAP           |
|   (nearby cars + restaurants)    |
|                                  |
+----------------------------------+
| === BOTTOM SLIDING PANEL ===     |
| [drag handle]                    |
|                                  |
| Quick Actions (6 icons):         |
| Ride | Eats | Delivery           |
| Flights | Hotels | Rentals       |
|                                  |
| [Promo Banner Carousel]         |
|                                  |
| Recently Used [scroll ->]        |
| Favorites [scroll ->]            |
| Recommended for You [scroll ->]  |
+----------------------------------+
| Bottom Nav                       |
+----------------------------------+
```

**Snap points**: Panel snaps to 40% (default -- shows quick actions), 75% (shows all content), and can be dragged down to ~25% (map focused).

---

### Changes (single file: `src/pages/app/AppHome.tsx`)

**1. Full-screen map background**
- Wrap the page in a relative container with `h-[100dvh]`
- Add `GoogleMapProvider` and `GoogleMap` as a full-screen background layer (absolute, inset-0)
- Use `darkMode={false}` for the light ZIVO map style
- Include `NearbyCars` for animated nearby driver dots
- Default center: user's location via `useCurrentLocation` or fallback to NYC (40.7128, -74.006)

**2. Top overlay (floating over map)**
- Semi-transparent white bar (`bg-white/90 backdrop-blur-xl`) with safe-area-top padding
- Contains: avatar, greeting text, bell icon (same as current)
- Below it: the "Where to?" search bar as a floating card

**3. Bottom sliding panel**
- Reuse the `RideBottomSheet` component pattern (framer-motion drag with snap points)
- Three snap points: `[0.25, 0.45, 0.80]` (collapsed / default / expanded)
- White background with rounded top corners and shadow
- Drag handle at top

**4. Panel content (inside the sheet)**

**Quick Actions Grid (3x2 icon grid):**
| Icon | Label | Route |
|------|-------|-------|
| Car | Ride | `/rides` |
| UtensilsCrossed | Eats | `/eats` |
| Package | Delivery | `/move` |
| Plane | Flights | `/search?tab=flights` |
| BedDouble | Hotels | `/search?tab=hotels` |
| Car | Rentals | `/rent-car` |

Each: rounded-2xl card, verdant icon circle, label below. Large 48px+ touch targets.

**Promo Banner Carousel:**
- Horizontal auto-scrolling carousel with 2-3 promo banners
- Uses `embla-carousel-react` (already installed)
- Cards: gradient backgrounds, bold headlines, CTA buttons
- Dot indicators below

**Scrolling sections (same data, same hooks):**
- Recently Used (from `useRecentlyViewed`)
- Favorites (from `usePersonalizedHome().favorites` + `useSavedLocations`)
- Recommended for You (from `recommended` + `useRecommendedDeals`)

**5. Remove from current layout:**
- Remove the static promo banner (replaced by carousel)
- Remove the old services grid (replaced by quick actions in panel)
- Remove the Nearby Rides section (map shows this visually now)
- Remove the standalone quick actions bar (merged into grid)

---

### Technical Details

**New imports:**
- `GoogleMapProvider`, `GoogleMap` from `@/components/maps`
- `NearbyCars` from `@/components/maps`
- `useCurrentLocation` from `@/hooks/useCurrentLocation`
- `useEmblaCarousel` from `embla-carousel-react`

**Map setup:**
```text
<GoogleMapProvider>
  <GoogleMap
    center={userLocation || { lat: 40.7128, lng: -74.006 }}
    zoom={14}
    darkMode={false}
    showControls={false}
    className="absolute inset-0 w-full h-full"
  />
</GoogleMapProvider>
```

**Bottom sheet** -- inline implementation (not importing RideBottomSheet to avoid coupling):
- `motion.div` with `drag="y"`, snap behavior, spring animation
- Three snaps: 25% (map view), 45% (default), 80% (full content)
- `overscroll-contain` and internal scrolling when expanded

**Promo carousel** -- 3 static banners:
```text
const promos = [
  { title: "50% off first ride", subtitle: "Use code ZIVO50", gradient: "from-primary to-emerald-400" },
  { title: "Free delivery", subtitle: "On orders over $25", gradient: "from-orange-400 to-amber-500" },
  { title: "Flight deals from $49", subtitle: "Book by this weekend", gradient: "from-sky-400 to-blue-500" },
];
```
Auto-advances every 4 seconds with dot indicators.

**Quick actions grid styling:**
```text
<div className="grid grid-cols-3 gap-3">
  {actions.map(action => (
    <button className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-card border border-border shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-{color}/10 flex items-center justify-center">
        <Icon className="w-6 h-6 text-{color}" />
      </div>
      <span className="text-xs font-semibold">{label}</span>
    </button>
  ))}
</div>
```

---

### Summary

| Item | Detail |
|------|--------|
| Files modified | 1 (`src/pages/app/AppHome.tsx`) |
| Layout change | Scrolling feed to map-first with bottom panel |
| New components used | GoogleMapProvider, GoogleMap, NearbyCars, embla-carousel |
| New hooks used | useCurrentLocation |
| Sections in panel | Quick Actions grid, Promo Carousel, Recently Used, Favorites, Recommendations |
| Sections removed | Static promo banner, old services grid, standalone quick actions bar, Nearby Rides cards |

