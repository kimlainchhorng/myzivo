
# Uber-Style Car Icon & Pill Badges

## Overview
Replace the current car emoji (`🚗`) with a stylized CSS-based car icon component matching your reference, and add support for optional pill badges (e.g., "⏱️ Wait & Save", "⚡ Priority").

---

## What Changes

### Current → New
- **Current**: Simple car emoji `🚗`
- **New**: Custom `CarIcon` component built with CSS shapes (rounded white "car body" with wheels)
- **Add**: Optional pill badges above ride names for special features

### Visual Reference
```text
┌─────────────────────────────────────────────────────────┐
│  [Car Icon]  │  ⏱️ Wait & Save                │ $24.57  │
│     ●   ●    │  Wait & Save                   │         │
│              │  👤 4                           │         │
│              │  5:01 PM · 12–21 min            │         │
│              │  Get a cheaper ride by wait...  │         │
└─────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### 1. Create CarIcon Component

Add a new component at the top of `Rides.tsx` (or in a separate file):

```tsx
function CarIcon({ selected }: { selected?: boolean }) {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      {/* Car body - rounded white/dark shape */}
      <div className={`h-8 w-10 rounded-full border ${
        selected ? "border-primary bg-zinc-800" : "border-zinc-600 bg-zinc-900"
      }`} />
      {/* Wheels */}
      <div className="absolute -left-0.5 -bottom-1 h-3 w-3 rounded-full border border-zinc-500 bg-zinc-800" />
      <div className="absolute -right-0.5 -bottom-1 h-3 w-3 rounded-full border border-zinc-500 bg-zinc-800" />
      {/* Selected indicator dot */}
      {selected && (
        <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-primary ring-2 ring-zinc-900" />
      )}
    </div>
  );
}
```

### 2. Create Pill Component

```tsx
function RidePill({ icon, label }: { icon: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-300">
      <span aria-hidden>{icon}</span>
      {label}
    </span>
  );
}
```

### 3. Add Pill Data to Ride Options

Update `rideCategories` to include optional `pill` property:

```tsx
{
  id: "wait-save",
  name: "Wait & Save",
  pill: { icon: "⏱️", label: "Wait & Save" },
  // ...other props
},
{
  id: "priority",
  name: "Priority",
  pill: { icon: "⚡", label: "Priority" },
  // ...other props
}
```

### 4. Update Card Rendering

Replace the emoji div with the CarIcon component and add pill support:

```tsx
{/* Left - Car Icon */}
<CarIcon selected={selectedOption?.id === ride.id} />

{/* Middle - Info section */}
<div className="flex-1 min-w-0 text-left">
  {/* Optional pill badge */}
  {ride.pill && (
    <div className="mb-1">
      <RidePill icon={ride.pill.icon} label={ride.pill.label} />
    </div>
  )}
  <div className="flex items-center gap-1.5">
    <h3 className="font-bold">{ride.name}</h3>
    <span className="text-xs text-zinc-500">👤 {ride.seats || 4}</span>
  </div>
  {/* ...time, eta, desc */}
</div>
```

---

## Files to Modify

### `src/pages/Rides.tsx`
1. Add `CarIcon` component function (~line 50)
2. Add `RidePill` component function (~line 65)
3. Add `pill` property type to ride options interface
4. Update `rideCategories` data with pill properties for relevant rides
5. Replace emoji `🚗` with `<CarIcon />` in:
   - Request step (~line 699)
   - Options step (~line 791)
   - Confirm step (~line 823)
6. Add conditional `<RidePill />` rendering above ride names

---

## Styling Notes
- Colors adapted for dark theme (zinc-800/900 instead of white/gray)
- Primary color used for selected states
- Selection dot uses `bg-primary` to match brand
- Pill badges use subtle zinc-800 background

