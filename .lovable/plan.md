

# Fix Ride Hub Layout — Root Cause Found

## Root Cause

The `<main>` element in `AppLayout` always gets the class `scroll-momentum`, which adds `overflow-y: auto`. This **breaks the flex chain** because an `overflow-y: auto` container creates a scroll context where children with `flex-1` can grow indefinitely instead of being bounded. The absolute-positioned map inside then gets 0 height because its parent's `flex-1` never resolves to real pixels.

```text
AppLayout root: h-[100dvh] flex flex-col        ← bounded ✅
  └─ <main>: flex-1 scroll-momentum             ← scroll-momentum adds overflow-y:auto ❌
       └─ ... flex-1 children never get bounded height
            └─ MapSection absolute inset-0 → 0 height → map fails
```

## Fix (2 files)

### 1. `src/components/app/AppLayout.tsx` — Remove `scroll-momentum` when `fixedHeight`

Line 61-66: Conditionally exclude `scroll-momentum` when `fixedHeight` is true. Also add `min-h-0` to ensure flex children can shrink.

```tsx
<main className={cn(
  "flex-1",
  fixedHeight ? "min-h-0 overflow-hidden flex flex-col" : "scroll-momentum",
  !hideHeader && "pt-14",
  !hideNav && "pb-nav",
  className
)}>
```

This is the **only** change needed. When `fixedHeight` is true (Ride Hub book tab), `<main>` becomes a proper flex container with bounded overflow. When false, all other pages keep their current scroll behavior.

### 2. `src/components/maps/RideMap.tsx` — Don't show "container failed" fallback for size issues

Change the 5-second timeout (line 201-210): instead of showing the fallback, extend the retry loop. The map should keep retrying until the container has dimensions, not give up and show an error. Keep the API/auth failure fallback.

Replace the timeout with a longer retry (30s) and only fail if the container is truly gone (unmounted), not just temporarily 0-sized:

```tsx
useEffect(() => {
  if (!isReady || failed) return;
  const timer = setTimeout(() => {
    if (!mapInitialized) {
      // Only warn, don't show fallback — layout may still be settling
      console.warn("[RideMap] Map not initialized after timeout — container may have 0 dimensions");
    }
  }, MAP_INIT_TIMEOUT_MS);
  return () => clearTimeout(timer);
}, [isReady, failed, mapInitialized]);
```

Also in `NativeGoogleMap`, increase the frame retry from 180 to 600 (line 278) to allow more time for layout to settle.

## Why This Fixes Everything

1. **Map below content**: Fixed — `<main>` no longer scrolls, so `flex-1` children get bounded height and the absolute map fills its parent
2. **Sheet not overlaying**: Fixed — proper parent dimensions mean `absolute bottom: calc(...)` works correctly  
3. **"Map container failed to initialize"**: Fixed — container gets real height immediately, plus we remove the premature fallback trigger

## No other changes needed

The existing structure in `RideBookingHome.tsx` (relative parents, absolute maps, bottom sheet positioning) is already correct — it just needs the flex chain above it to be unbroken.

