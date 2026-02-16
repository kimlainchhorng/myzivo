

## Animate Route Polyline Drawing

### Overview
Instead of the route polyline appearing all at once, it will animate from the pickup point toward the dropoff, progressively revealing segments over ~1 second. This creates a polished "drawing" effect consistent with premium ride-hailing apps.

### Approach
Create a new `AnimatedPolyline` component that uses `requestAnimationFrame` to progressively increase the number of rendered path points from 1 to the full `routePath.length` over a configurable duration (~800ms).

### File Changes

**New file: `src/components/maps/AnimatedPolyline.tsx`**

- Accepts `path` (array of LatLngLiteral), `duration` (default 800ms), and polyline style options
- Uses a `useEffect` + `requestAnimationFrame` loop that interpolates the visible point count from 1 to `path.length` over the duration using easeOutCubic easing
- Renders a `PolylineF` with `path.slice(0, visibleCount)`
- Optionally renders a faint "shadow" polyline of the full path at low opacity for a subtle trail effect
- Resets and re-animates whenever the `path` reference changes (new route)

**Modified: `src/components/maps/GoogleMap.tsx`**

- Replace the static `PolylineF` block (lines 231-241) with the new `AnimatedPolyline` component
- Pass the same styling props (emerald color, weight 5, geodesic)

### Technical Details

```text
AnimatedPolyline logic:
  - state: visibleCount (number of points to show)
  - on mount / path change:
    - startTime = performance.now()
    - rAF loop:
      - elapsed = now - startTime
      - progress = min(elapsed / duration, 1)
      - eased = 1 - (1 - progress)^3  (easeOutCubic)
      - visibleCount = max(2, floor(eased * path.length))
      - if progress < 1: continue rAF
  - render: <PolylineF path={path.slice(0, visibleCount)} ... />
```

The easeOutCubic easing makes the animation start fast and decelerate, which feels natural -- like the route is "snapping" into place. The minimum of 2 points ensures a valid polyline is always rendered.

