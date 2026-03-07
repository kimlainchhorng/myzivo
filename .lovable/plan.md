

# Fix Ride Hub Layout Architecture

## Root Cause

The layout breaks because the flex chain from viewport to map container is incomplete. Here is the chain:

```text
AppLayout root:  min-h-screen flex flex-col   ← NOT bounded height
  └─ <main>:     flex-1 pt-14 pb-nav flex flex-col overflow-hidden
    └─ RideHubPage content: flex-1 flex flex-col min-h-0 overflow-hidden
      └─ motion.div: flex-1 flex flex-col min-h-0 overflow-hidden
        └─ RideBookingHome: flex flex-col flex-1 min-h-0
          └─ MapSection (absolute inset-0) ← NEEDS parent with real height
```

`min-h-screen` on the root does NOT constrain height — it allows the container to grow beyond viewport. So `flex-1` children never get a bounded height, meaning `absolute inset-0` resolves to 0 height → map fails to initialize.

Previous fixes tried `h-[calc(100dvh-140px)]` which guessed the header+tab offset incorrectly, or `flex-1 min-h-0` which still depends on the broken root.

## Fix

Two files need changes:

### 1. `src/components/app/AppLayout.tsx` — Add `fixedHeight` prop

Add an optional `fixedHeight?: boolean` prop. When true, change the root div from `min-h-screen` to `h-[100dvh] overflow-hidden`. This bounds the flex chain so all `flex-1` children resolve to real pixel heights.

```tsx
// Root div class changes:
// fixedHeight=true:  "h-[100dvh] bg-background flex flex-col overflow-hidden overscroll-none tap-highlight-none"
// fixedHeight=false: "min-h-screen bg-background flex flex-col overscroll-none tap-highlight-none" (current)
```

No other pages are affected because they don't pass `fixedHeight`.

### 2. `src/pages/app/RideHubPage.tsx` — Pass `fixedHeight` when book tab is active

Line 134: Add `fixedHeight={activeTab === "book"}` to `<AppLayout>`.

### 3. `src/components/rides/RideBookingHome.tsx` — Simplify containers

Now that the flex chain is bounded:

- **Line 502** (root): Keep `flex flex-col flex-1 min-h-0 overflow-hidden` — works correctly with bounded parent.
- **Line 506** (home step): Keep `relative flex-1 min-h-0 overflow-hidden flex flex-col` — MapSection absolute will have real height.
- **Line 656** (route-preview): Change back to `relative flex-1 min-h-0 overflow-hidden` — no hardcoded calc needed.
- **Lines 134-136** (MapSection compact): Ensure single layer: `absolute inset-0` with inner `absolute inset-0` for RideMap. Remove any extra nesting.

### Why this works

With `h-[100dvh]` on the root, the flex chain resolves:
- Root: exactly viewport height
- Main: fills remaining space after header (flex-1, bounded)
- Tab bar is sticky, content div fills remaining (flex-1, bounded)
- RideBookingHome fills remaining (flex-1, bounded)
- MapSection `absolute inset-0` → parent has real height → map container has real width/height → Google Maps initializes successfully
- Bottom sheet `absolute` with `bottom: calc(72px + safe-area)` → works because parent has real dimensions

