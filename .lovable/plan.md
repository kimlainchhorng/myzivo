

# Fix Rides Page: Uber-Style Layout with Proper Layering

## Summary
Refactor the Rides page to properly separate the map (full screen background), floating location bubbles (over map), and a fixed bottom sheet with internal scrolling. This fixes the current layout issues where elements overlap incorrectly.

---

## Current Problems

| Issue | Description |
|-------|-------------|
| **Sheet height calculation** | Using `dvh` with animate doesn't work reliably |
| **Drag constraints** | Complex relative positioning breaks snap behavior |
| **Scroll bleeding** | Page body can scroll, not just sheet content |
| **Absolute vs fixed** | Sheet using `absolute` but should be `fixed` |
| **CTA positioning** | Using `absolute` inside scrollable content - breaks layout |

---

## Architecture (User's Pattern)

```text
┌─────────────────────────────────────────┐
│  [FULL SCREEN MAP - z-0]                │
│                                         │
│  ┌──────────────────┐                   │
│  │ Pickup Card      │ ← Floating z-10   │
│  └──────────────────┘                   │
│                                         │
│            🚗    📍                      │
│       🚗                                │
│                                         │
│  ┌──────────────────┐                   │
│  │ Dropoff Card     │ ← Floating z-10   │
│  └──────────────────┘                   │
│                                         │
├─────────────────────────────────────────┤
│  ═══════════════════ (handle)           │ ← Fixed Sheet z-50
│  Where to?                              │
│  ┌─────────────────────────────────┐    │
│  │ [Scrollable Content Area]       │    │ ← overflow-y-auto
│  │ - Inputs                        │    │
│  │ - Tabs                          │    │
│  │ - Ride Cards                    │    │
│  └─────────────────────────────────┘    │
│  ┌─────────────────────────────────┐    │
│  │ [CTA Button - sticky bottom]    │    │ ← sticky, not absolute
│  └─────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

---

## Changes

### 1. Prevent Body Scroll (Uber-style app behavior)
**File: `src/pages/Rides.tsx`**

Add useEffect to lock body scroll:

```tsx
useEffect(() => {
  const prev = document.body.style.overflow;
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = prev;
  };
}, []);
```

### 2. Simplify Container Structure
**File: `src/pages/Rides.tsx`**

Change from:
```tsx
<div className="fixed inset-0 bg-zinc-100 overflow-hidden">
```

To cleaner stacking:
```tsx
<div className="fixed inset-0 overflow-hidden bg-[#e5e3df]">
  {/* Map: absolute full screen, z-0 */}
  <div className="absolute inset-0 z-0">
    <RidesMapView ... />
  </div>
  
  {/* Bottom Sheet: fixed, z-50 */}
  <div className="fixed bottom-0 left-0 right-0 z-50 ...">
```

### 3. Replace Dynamic Height with Fixed Height + Snap
**File: `src/pages/Rides.tsx`**

Remove problematic `animate={{ height: getSheetHeight() }}` and use CSS-based heights:

```tsx
// Remove animate height - use fixed height based on step
const sheetHeight = step === "request" 
  ? "h-[55%]" 
  : step === "options" 
    ? "h-[60%]" 
    : "h-[75%]";

<motion.div
  className={`fixed bottom-0 left-0 right-0 ${sheetHeight} rounded-t-[28px] bg-white shadow-[0_-18px_40px_rgba(0,0,0,0.18)] flex flex-col z-50`}
  // Remove animate={{ height }} - use className instead
>
```

### 4. Move Floating Cards Outside Sheet
**File: `src/pages/Rides.tsx`**

Currently pickup/dropoff cards are inside `RidesMapView`. They should be positioned as siblings for proper z-indexing:

```tsx
<div className="fixed inset-0 overflow-hidden bg-[#e5e3df]">
  {/* Map */}
  <div className="absolute inset-0 z-0">
    <RidesMapView ... /> {/* Remove floating cards from here */}
  </div>
  
  {/* Floating Pickup Card - z-10 */}
  {pickup && (
    <button className="fixed top-4 left-4 z-10 ...">
      ...
    </button>
  )}
  
  {/* Floating Dropoff Card - z-10 */}
  {dropoff && (
    <button className="fixed bottom-[calc(55%+16px)] left-4 z-10 ...">
      ...
    </button>
  )}
  
  {/* Bottom Sheet - z-50 */}
  <div className="fixed bottom-0 ... z-50">
```

### 5. Fix CTA Button Positioning
**File: `src/pages/Rides.tsx`**

Change CTA from `absolute` to `sticky`:

```tsx
// Before (broken)
<div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t ...">

// After (works with scroll)
<div className="sticky bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-white via-white to-white/90 pt-4">
```

### 6. Proper Internal Scroll Container
**File: `src/pages/Rides.tsx`**

Wrap sheet content in proper scroll container:

```tsx
<motion.div className="fixed bottom-0 left-0 right-0 h-[55%] ... flex flex-col">
  {/* Handle - flex-shrink-0 */}
  <div className="flex-shrink-0 ...">
    <div className="w-12 h-1.5 bg-zinc-300 rounded-full" />
  </div>
  
  {/* Scrollable Content - flex-1 overflow-y-auto */}
  <div className="flex-1 overflow-y-auto overscroll-contain px-4 pb-20">
    {/* Inputs, tabs, ride cards */}
  </div>
  
  {/* CTA - sticky at bottom of scroll container */}
  {selectedOption && (
    <div className="sticky bottom-0 p-4 bg-gradient-to-t from-white via-white to-white/80">
      <Button ...>Choose {selectedOption.name}</Button>
    </div>
  )}
</motion.div>
```

### 7. Simplify Drag Logic
**File: `src/pages/Rides.tsx`**

Replace complex snap calculation with simpler approach:

```tsx
// Simplified snap: just 2 positions (collapsed/expanded)
const [isExpanded, setIsExpanded] = useState(false);

const handleDragEnd = (event: any, info: { offset: { y: number }; velocity: { y: number } }) => {
  // If dragged up fast or far, expand
  if (info.offset.y < -50 || info.velocity.y < -500) {
    setIsExpanded(true);
  }
  // If dragged down fast or far, collapse
  else if (info.offset.y > 50 || info.velocity.y > 500) {
    setIsExpanded(false);
  }
};

// Height based on state
const sheetHeightClass = isExpanded ? "h-[85%]" : "h-[55%]";
```

---

## Files Modified

| File | Changes |
|------|---------|
| `src/pages/Rides.tsx` | Body scroll lock, simplified stacking, fixed heights, proper scroll container, sticky CTA, simplified drag |

---

## Technical Notes

### Why Fixed Heights Over Dynamic
- `animate={{ height }}` with `dvh` units causes layout thrashing
- Fixed percentage heights are more predictable across devices
- Two-state (collapsed/expanded) is simpler and matches Uber UX

### Why `fixed` Over `absolute` for Sheet
- `absolute` is relative to nearest positioned ancestor
- `fixed` is relative to viewport - guarantees bottom positioning
- Sheet must always be at viewport bottom, not container bottom

### Safe Area Handling
- Use `pb-safe` utility for notched phones
- CTA gradient ensures content doesn't hide under button

