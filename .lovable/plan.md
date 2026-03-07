# Layout & Interaction Improvements for Route Preview

## Changes — single file: `src/components/rides/RideBookingHome.tsx`

### 1. Increase map height (60-65% of screen)

- **MapSection** (line 136): Change `max-h-[40vh]` → `max-h-[65vh]` and `flex-[2]` → `flex-[3]` for non-compact mode
- This gives the map ~60-65% of available space

### 2. Route line / pins

- Already working — `routePolyline`, `pickupCoords`, and `dropoffCoords` are passed to `RideMap`. No changes needed here.

### 3. Convert bottom card to draggable bottom sheet

- Replace the static `div` bottom card (line 656) with a `motion.div` that supports drag gestures using framer-motion's `drag="y"` with `dragConstraints` and `dragElastic`
- Add a drag handle indicator bar at the top of the sheet
- Two snap positions: collapsed (route summary only, ~35%) and expanded (ride options visible)
- When swiped up from route-preview, transition to `vehicle` step inline (no separate page)
- When swiped down, collapse back to route summary
- Map remains visible behind the sheet via `position: absolute` + `bottom: 0`

### 4. Trip info cards

- Tighten spacing: reduce `gap-2` → `gap-1.5`, ensure icon+text alignment with `items-center`
- Make font sizes consistent across all three stat cards

### 5. Merge route-preview and vehicle steps

- Instead of two separate `viewStep` values, combine them into one view where the bottom sheet has two heights:
  - **Collapsed**: Shows addresses + trip stats + "Choose a ride" button (current route-preview content)
  - **Expanded**: Shows the full vehicle list + confirm button (current vehicle content)
- Use a `sheetExpanded` boolean state toggled by drag or button tap
- The "Choose a ride" button expands the sheet instead of changing viewStep

### 6. Reposition map controls

- Move zoom buttons to `bottom-[45%]` (above the collapsed sheet)
- Keep locate button at `top-14 right-3`

## Implementation detail

```text
┌──────────────────────┐
│     Header + Tabs    │  fixed
├──────────────────────┤
│                      │
│      Google Map      │  ~60-65%
│   (route + pins)     │
│                      │
├──── drag handle ─────┤
│  Pickup → Dest       │  collapsed ~35%
│  Time | Dist | Traffic│
│  [Choose a ride]     │
│                      │
│  ── expanded ──      │  swipe up
│  Vehicle list        │
│  [Confirm ZIVO Eco]  │
└──────────────────────┘
```

### Key code changes:

- Add `sheetExpanded` state, remove the `vehicle` viewStep transition from "Choose a ride" button
- Wrap bottom card in `motion.div` with `drag="y"`, `onDragEnd` handler that checks velocity/offset to snap
- When expanded, render vehicle list below trip stats
- Animate sheet height with `animate={{ height: sheetExpanded ? "60vh" : "auto" }}`
- Keep all existing styling, colors, header, tabs untouched .
- Apply these layout and interaction improvements to the route preview screen.
  Single file:
  src/components/rides/RideBookingHome.tsx
  1. Increase map height
  - In MapSection, change max-h-[40vh] to max-h-[65vh]
  - Change flex-[2] to flex-[3] for non-compact mode
  - Keep header and tabs fixed and always visible
  2. Keep route line and pins
  - Route polyline, pickupCoords, and dropoffCoords are already working
  - Keep them as is
  - Make sure fitBounds uses padding so the route and pins are not hidden behind the bottom sheet
  3. Convert bottom card to draggable bottom sheet
  - Replace the static bottom card with motion.div using framer-motion
  - Add a drag handle indicator at the top
  - Support drag="y" with snap behavior
  - Two states:
    - collapsed = route summary only
    - expanded = ride options visible
  - Swipe up expands
  - Swipe down collapses
  - Small drags snap to nearest state
  - Use drag threshold and velocity threshold
  - Keep map visible behind the sheet
  - Keep header and tabs visible when sheet is expanded
  4. Merge route-preview and vehicle steps
  - Combine route-preview and vehicle into one screen
  - Use a sheetExpanded boolean state
  - “Choose a ride” expands the sheet instead of switching to a separate viewStep
  - Remove separate vehicle page transition
  5. Trip info cards
  - Reduce gap-2 to gap-1.5
  - Keep icon and text aligned with items-center
  - Normalize font sizes across time, distance, and traffic cards
  - Keep spacing balanced and compact
  6. Expanded sheet behavior
  - When expanded, render vehicle list below trip stats
  - Vehicle list should scroll independently inside the sheet
  - Keep confirm button sticky at the bottom of the expanded sheet
  - Make ride cards slightly more compact so more options fit on screen
  7. Reposition map controls
  - Keep locate button at top-14 right-3
  - Move zoom controls so they always sit above the collapsed sheet
  - Position controls relative to the sheet height, not with a hardcoded value that may break on small screens
  8. Animation
  - Animate bottom sheet smoothly between collapsed and expanded states
  - Expanded height can be around 60vh, but must not cover header and top tabs
  9. Keep current design
  - Keep existing styling, colors, header, tabs, and map integration unchanged
  - Only improve layout, drag interaction, route preview, and ride selection flow
  Goal:
  Make the route preview screen behave like a polished rideshare bottom sheet similar to Uber/Lyft while keeping the current ZIVO design.