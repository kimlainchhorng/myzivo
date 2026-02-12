

# Mobile Home Screen Upgrade -- Remove Map, Add Premium Travel-First Layout

## Problem

The current mobile home (`AppHome.tsx`) uses a full-screen Google Map as the background. This causes:

1. **Permanent loading spinner** visible in the middle of the screen while the map loads
2. **Wasted space** -- the map serves no functional purpose for a travel search platform
3. **Slow performance** -- loading the entire Google Maps JS API just for a background image
4. **Draggable bottom sheet complexity** -- the Framer Motion drag system adds overhead and can feel janky

The user's screenshot clearly shows the spinner and empty map area dominating the viewport.

## Solution

Replace the map-first "ride-hailing" layout with a **scrollable, travel-first home screen** that looks polished immediately on load. No map, no spinner, no drag physics.

### New Layout Structure

```text
+----------------------------------+
| [Avatar]  GOOD EVENING    [Bell] |  <- Header bar (keep existing)
|  Traveler                        |
+----------------------------------+
| [Q] Where to?            [Pin]   |  <- Search bar (keep existing)
+----------------------------------+
|  [Ride] [Eats] [Delivery]        |  <- 3x2 service grid (keep)
|  [Flights] [Hotels] [Rentals]    |
+----------------------------------+
| [ Promo carousel banner ]        |  <- Keep promos
+----------------------------------+
| [ Rewards card ]                 |  <- Keep if logged in
+----------------------------------+
| [ Upcoming bookings ]            |  <- Keep if any
+----------------------------------+
| [ Wallet summary ]               |  <- Keep if logged in
+----------------------------------+
| [ Recently Used carousel ]       |  <- Keep
| [ Favorites carousel ]           |  <- Keep
| [ Recommendations ]              |  <- Keep
+----------------------------------+
|  Home  Search  Trips  Alerts  Account
+----------------------------------+
```

### Changes to `src/pages/app/AppHome.tsx`

1. **Remove** the full-screen map background (`GoogleMapProvider`, `GoogleMap` import and JSX block at lines 211-222)
2. **Remove** all bottom sheet drag mechanics: `sheetY`, `useMotionValue`, `useTransform`, `animate`, `PanInfo`, snap points, `handleDragEnd`, the `motion.div` wrapper with drag props
3. **Remove** `useCurrentLocation` and `userLocation` state (no longer needed without map)
4. **Remove** `GoogleMapProvider` and `GoogleMap` imports
5. **Convert** the layout to a simple scrollable `div` with padding:
   - Top: Header bar with greeting + avatar + bell (keep as-is, but as part of normal flow, not absolute-positioned)
   - Search bar below header
   - Service grid, promos, rewards, wallet, etc. all in normal document flow
   - Bottom padding for nav bar (`pb-20`)
6. **Add** a subtle gradient background at the top instead of the map (`bg-gradient-to-b from-primary/5 to-background`)
7. **Keep** all existing content sections (service grid, promos, rewards, referrals, scheduled bookings, wallet, recently used, favorites, recommendations) -- just remove the drag container

### Visual Improvements

- Header and search bar become part of the scrollable content with a subtle gradient header zone
- Service grid cards get slightly larger touch targets
- No more absolute positioning chaos -- clean top-to-bottom scroll
- Instant render with no loading spinner

### Files Changed

| File | Change |
|------|--------|
| `src/pages/app/AppHome.tsx` | Remove map + drag system, convert to scrollable layout |

### What Stays the Same

- All content sections (service grid, promos, rewards, referrals, wallet, recently used, favorites, recommendations)
- `ZivoMobileNav` bottom navigation
- `UniversalSearchOverlay` search experience
- Greeting logic and user profile display
- All hooks and data fetching

