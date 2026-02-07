

# Upgrade Ride Cards to Glassmorphism Design with Lucide Icons

## Overview
Replace the current CSS-based `CarIcon` and `RidePill` components with a refined glassmorphism card design using Lucide's `CarFront` and `UserRound` icons, matching the provided reference implementation.

---

## Visual Comparison

### Current Design
- CSS-based car shape (rounded divs for body/wheels)
- Simple zinc-colored pill badges
- Basic dark background cards

### New Design
- Lucide `CarFront` icon in a frosted glass circle
- Refined glassmorphism card styling with:
  - `bg-black/35 backdrop-blur-[14px]`
  - `shadow-[0_12px_30px_rgba(0,0,0,0.35)]`
- Tag pills with `backdrop-blur` glass effect
- Blue selection ring with glow effect
- Small selection dot on the right side of price

---

## Technical Changes

### 1. Update Imports
Add `CarFront` and `UserRound` from `lucide-react`

### 2. Replace `CarIcon` Component
**Current:**
```tsx
function CarIcon({ selected }: { selected?: boolean }) {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <div className={`h-8 w-10 rounded-full border ${...}`} />
      {/* CSS wheels */}
    </div>
  );
}
```

**New:**
```tsx
function CarIcon({ selected }: { selected?: boolean }) {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/5 ring-1 ring-white/10">
      <CarFront className="h-6 w-6 text-white/90" />
    </div>
  );
}
```

### 3. Replace `RidePill` with `TagPill`
**Current:**
```tsx
function RidePill({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="... bg-zinc-800 ...">
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  );
}
```

**New:**
```tsx
function TagPill({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-medium text-white/90 backdrop-blur">
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  );
}
```

### 4. Update Data Model
Change `pill` property to `tag` in `RideOption` interface and update the data:
```tsx
interface RideOption {
  // ... existing props
  tag?: RideTag;
}

type RideTag = "wait_save" | "priority" | "green" | "standard" | "lux";
```

### 5. Update Card Styling
Apply glassmorphism styling to ride buttons:
```tsx
className={[
  "w-full text-left rounded-[18px] p-[14px]",
  "bg-black/35 backdrop-blur-[14px]",
  "border border-white/10",
  "shadow-[0_12px_30px_rgba(0,0,0,0.35)]",
  "transition active:scale-[0.99]",
  selected
    ? "border-blue-500/90 shadow-[0_0_0_1px_rgba(59,130,246,0.65),...]"
    : "hover:bg-black/40",
].join(" ")}
```

### 6. Update Seat Display
Replace `Users` icon with `UserRound` icon:
```tsx
<span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[11px] font-medium text-white/80">
  <UserRound className="h-3.5 w-3.5" />
  {ride.seats}
</span>
```

### 7. Add Selection Dot
Add a small dot indicator next to price:
```tsx
<div className="flex items-center gap-3">
  <div className="text-[16px] font-bold text-white tabular-nums">
    {price}
  </div>
  <div className={[
    "h-2 w-2 rounded-full",
    selected ? "bg-blue-500 ring-2 ring-white/90" : "bg-white/20",
  ].join(" ")} />
</div>
```

---

## Files to Modify

### `src/pages/Rides.tsx`
1. Add `CarFront`, `UserRound` to imports (~line 14)
2. Add `RideTag` type definition (~line 37)
3. Replace `CarIcon` component (~lines 52-69)
4. Replace `RidePill` with `TagPill` component (~lines 71-79)
5. Update `RideOption` interface: change `pill` to `tag` (~line 49)
6. Update `rideCategories` data: replace `pill` with `tag` values (~lines 84-238)
7. Update card rendering in 3 locations:
   - Request step (~lines 718-763)
   - Options step (~lines 820-857)
   - Confirm step (~lines 866-883)

---

## Styling Notes
- Uses `blue-500` for selection states (matching reference)
- Glass effect with `backdrop-blur-[14px]` and `bg-black/35`
- Selection glow: `shadow-[0_0_0_1px_rgba(59,130,246,0.65)]`
- All text uses `text-white` with varying opacity levels
- Icons sized at `h-6 w-6` in the main icon container

