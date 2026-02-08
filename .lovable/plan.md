

# Uber-Style Ride Rows + Car Thumbnails Implementation

## Summary
Create a polished Uber-like ride row component with car thumbnails replacing generic icons, and integrate it into the Rides page for a premium booking experience.

---

## Current State

The ride options are rendered inline in `Rides.tsx` (lines 854-884) using:
- `RideImage` component: A gradient box with `CarFront` icon (not a car image)
- `TagPill` component: Colored dot badges (working well)
- Basic button styling with border/shadow on selection

**Current RideImage (lines 54-60):**
```tsx
function RideImage({ type }: { type?: string }) {
  return (
    <div className="w-14 h-10 bg-gradient-to-br from-zinc-100 to-zinc-200 rounded-lg flex items-center justify-center shrink-0">
      <CarFront className="w-7 h-5 text-zinc-600" />
    </div>
  );
}
```

---

## Changes

### 1. Create UberLikeRideRow Component
**File: `src/components/ride/UberLikeRideRow.tsx`** (NEW)

A reusable, self-contained ride row with:
- Inline SVG car thumbnail (no image file dependency)
- Name + badge pill + seats count
- Pickup time + ETA
- Price aligned right
- Premium selection styling (thick black border + shadow)

```text
┌──────────────────────────────────────────────────────────────┐
│  🚗  │  Standard  ● Standard  👤 4    │  6:44 PM · 4 min  │ $11.50 │
│      │                                 │                   │        │
└──────────────────────────────────────────────────────────────┘
```

### 2. Create Inline Car SVG Thumbnail
**Inside UberLikeRideRow component**

A clean sedan SVG (no external image files needed):
- White body with light gray stroke
- Shadow ellipse underneath for depth  
- Side windows and wheels for realism
- 60x36 viewport, fits in 64x40 container

### 3. Update Rides.tsx to Use New Component
**File: `src/pages/Rides.tsx`**

Replace the inline ride button mapping (lines 857-883) with:
```tsx
<UberLikeRideRow
  selected={selectedOption?.id === ride.id}
  name={ride.name}
  tag={ride.tag}
  seats={ride.seats}
  time={getPickupTime(ride.eta || 5)}
  eta={`${ride.eta} min`}
  price={getFareFixed(ride)}
  onClick={() => handleSelectOption(ride)}
/>
```

Remove the old inline `RideImage` component since it's replaced.

---

## Files to Create/Modify

| File | Action | Changes |
|------|--------|---------|
| `src/components/ride/UberLikeRideRow.tsx` | **CREATE** | New Uber-style ride row component with inline SVG car |
| `src/pages/Rides.tsx` | **MODIFY** | Import and use `UberLikeRideRow`, remove old `RideImage` |

---

## Component Design

### UberLikeRideRow Props
| Prop | Type | Description |
|------|------|-------------|
| `selected` | `boolean` | Whether this row is selected |
| `name` | `string` | Ride name (e.g., "Standard") |
| `tag` | `RideTag` | Optional badge type (wait_save, green, etc.) |
| `seats` | `number` | Passenger capacity |
| `time` | `string` | Pickup time (e.g., "6:44 PM") |
| `eta` | `string` | ETA (e.g., "4 min") |
| `price` | `string` | Fare (e.g., "$11.50") |
| `onClick` | `() => void` | Selection handler |

### Styling States
**Default:**
- White background with subtle shadow
- Light border (`border-black/5`)
- `shadow-[0_6px_16px_rgba(0,0,0,0.06)]`

**Selected:**
- 2px black border
- Deeper shadow: `shadow-[0_10px_24px_rgba(0,0,0,0.12)]`
- Light gray background tint

---

## Inline SVG Car (No Assets Needed)

Since `/public/cars/` doesn't exist, the component uses an inline SVG:

```text
     __________
    /          \
   [   🪟🪟    ]  ← Windows
   [__________]  ← Car body (white)
     ○      ○    ← Wheels (dark)
   ~~~~~~~~~~~   ← Shadow ellipse
```

This approach:
- Works immediately without asset uploads
- Renders identically across all browsers
- Can be customized per vehicle type later
- Lightweight (no network requests)

---

## Visual Result

```text
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│   🚗   Standard  ●  👤 4         6:44 PM · 4 min      $11.50   │
│        ────────  ○                                              │
│        (Selected: thick black border + shadow)                  │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   🚗   Priority  ● Fast  👤 4     6:45 PM · 1 min     $32.00   │
│                                                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   🚗   Green  ● Eco  👤 4         6:50 PM · 6 min     $25.00   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Technical Notes

### Why Inline SVG over Image
- No 404 risk (no `/public/cars/sedan.png` needed)
- Instant rendering (no network request)
- Easily styled with Tailwind
- Can be parameterized later for different vehicle types

### Reusing TagPill
The existing `TagPill` component works well and will be reused inside `UberLikeRideRow` for consistent badge styling.

### Active State Animation
Using `active:scale-[0.99]` for subtle press feedback (Uber-style micro-interaction).

