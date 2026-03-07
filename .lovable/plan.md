

# Fix Ride Hub Layout Architecture

## Root Cause

The layout hierarchy has a fundamental structural problem. `RideBookingHome` renders inside `AppLayout` (which adds `pt-14` for header + `pb-nav` for bottom nav) and `RideHubPage` (which adds a sticky tab bar). The component uses `flex-1` chains and `h-[calc(100dvh-140px)]` but these conflict because:

1. **Home step**: `MapSection` with `compact` uses `absolute inset-0` but is inside a flex container without explicit height — so absolute positioning has no reference height, causing the map to collapse or render below content.
2. **Route-preview step**: Uses `h-[calc(100dvh-140px)]` which is a guess at header+tabs height. This creates the black gap / initialization failure when the actual offset differs.
3. The `MapSection` wrapper itself has redundant nesting — an `absolute inset-0` div inside another `absolute inset-0` div.

## Plan

### 1. Fix the parent container for ALL view steps that use map

For **home** and **route-preview** steps, the outermost `motion.div` must be a positioned container with explicit dimensions. Change from flex-based sizing to:

```tsx
className="relative flex-1 min-h-0"
```

This gives the absolute map a sized parent via `flex-1` in the existing flex chain from `AppLayout` → `RideHubPage` → `RideBookingHome`.

### 2. Simplify MapSection for compact mode

Remove the double-nested absolute wrappers. When `compact=true`, MapSection should just be:
```tsx
<div className="absolute inset-0">
  <RideMap ... className="h-full w-full" />
</div>
```

No inner `<div className="absolute inset-0 h-full w-full">` wrapper needed — just one layer.

### 3. Fix route-preview container

Replace `h-[calc(100dvh-140px)]` with `flex-1 min-h-0 relative` so it fills available space naturally through the flex chain rather than guessing pixel heights. The parent already provides `flex-1 flex flex-col min-h-0 overflow-hidden` all the way up.

### 4. Fix home step container  

The home step currently uses `flex flex-col flex-1 min-h-0 overflow-hidden` but the MapSection with `compact` (absolute) needs a **positioned parent with height**. Change to:
```tsx
className="relative flex-1 min-h-0 overflow-hidden"
```

The booking card at bottom overlays with `relative z-10 -mt-5` which is fine — it sits in normal flow below the map's flex space.

### 5. Bottom sheet positioning

Keep the current absolute positioning with `bottom: calc(72px + env(safe-area-inset-bottom))`. But the parent must now be `relative` with actual height (from flex-1), so absolute children will size correctly.

### 6. Zoom controls — no change needed

Already using dynamic `calc()` positioning which is correct.

## Files to Edit

**`src/components/rides/RideBookingHome.tsx`**:

| Line | Current | Change to |
|------|---------|-----------|
| 134-136 | MapSection compact: nested absolute divs | Single absolute wrapper, remove inner div |
| 502 | Root: `flex flex-col flex-1 min-h-0 overflow-hidden` | No change (correct) |
| 506 | Home step: `flex flex-col flex-1 min-h-0 overflow-hidden` | `relative flex-1 min-h-0 overflow-hidden flex flex-col` |
| 656 | Route-preview: `relative h-[calc(100dvh-140px)] overflow-hidden` | `relative flex-1 min-h-0 overflow-hidden` |

This removes the hardcoded viewport height calculation and lets the flex chain handle sizing naturally. The map container will have real dimensions because `flex-1` resolves to actual pixels in a complete flex chain.

## Why This Fixes All 3 Issues

1. **Map rendering below content**: Fixed because the map's absolute container now has a parent with real height from `flex-1`.
2. **Sheet not overlaying correctly**: Fixed because the parent is `relative` with proper dimensions, so `absolute left-0 right-0 bottom: calc(...)` works.
3. **Map container failed to initialize**: Fixed because the flex chain gives the container non-zero width/height before map initialization. The existing `requestAnimationFrame` retry loop in `NativeGoogleMap` (up to 180 frames) will find valid dimensions.

