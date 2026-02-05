

# Upgrade: ZIVO Rides Premium with Category Tabs

## Overview

Replace the current single-tier vehicle display with the new **"ZivoRidesPremium"** design featuring:
- **3 Category Tabs**: Economy, Premium, Elite
- **12 Vehicle Options** across categories
- **4-Column Grid Layout** on desktop
- **Animated Tab Switching** with AnimatePresence

---

## Implementation Plan

### Phase 1: Update Data Structure

Replace the current 3-option `rideOptions` array with a categorized `rideCategories` object:

**New Structure:**
```text
rideCategories = {
  Economy: [Wait & Save, Standard, Green, Priority]
  Premium: [Extra Comfort, ZIVO Black, Black SUV, XXL]
  Elite: [ZIVO Lux, Executive Sprinter, Secure Transit, Pet Premium]
}
```

Each option includes:
- `id`, `name`, `desc`, `price`, `time`
- `icon` (Lucide icon component)
- `image` (premium vehicle photo URL)

### Phase 2: Add Category Tab Selector

Replace the current "Choose your Ride" heading with a horizontal pill-style tab selector:

```text
┌─────────────────────────────────────────────────┐
│  [ Economy ]  [✓ Premium ]  [ Elite ]           │
│  (rounded-full pills with blue active state)    │
└─────────────────────────────────────────────────┘
```

- Active tab: `bg-blue-600 text-white shadow-lg`
- Inactive: `text-zinc-400 hover:bg-white/5`

### Phase 3: Update Vehicle Grid

Replace the current 1-column stacked layout with a responsive grid:

| Breakpoint | Columns |
|------------|---------|
| Mobile | 1 column |
| md (768px+) | 2 columns |
| lg (1024px+) | 4 columns |

### Phase 4: Enhanced Vehicle Cards

New card design with:
- **Vertical layout** (image on top, content below)
- **Price badge** overlaid on the image
- **Category icon** next to the vehicle name
- **ETA indicator** with Zap icon
- **Selection animation** with `layoutId` border outline

### Phase 5: Preserve Existing Functionality

All existing logic remains intact:
- Location detection (`useCurrentLocation`)
- Fare calculation (`calculateFare`)
- Step state machine (request → options → confirm → processing → success)
- Stripe checkout integration
- Success/cancelled URL handling

---

## Technical Changes

### File: `src/pages/Rides.tsx`

**Add new imports:**
```tsx
import { Leaf, Zap, Briefcase, Crown, Anchor, Dog } from "lucide-react";
```

**Replace `rideOptions` with `rideCategories`:**
```tsx
const rideCategories = {
  Economy: [
    { id: "wait_save", name: "Wait & Save", desc: "Lowest price, longer wait.", ... },
    { id: "standard", name: "Standard", ... },
    { id: "green", name: "Green", icon: Leaf, ... },
    { id: "priority", name: "Priority", icon: Zap, ... }
  ],
  Premium: [
    { id: "comfort", name: "Extra Comfort", ... },
    { id: "black", name: "ZIVO Black", icon: Briefcase, ... },
    { id: "black_suv", name: "Black SUV", ... },
    { id: "xxl", name: "XXL", icon: Anchor, ... }
  ],
  Elite: [
    { id: "lux", name: "ZIVO Lux", icon: Crown, ... },
    { id: "sprinter", name: "Executive Sprinter", ... },
    { id: "secure", name: "Secure Transit", ... },
    { id: "pet", name: "Pet Premium", icon: Dog, ... }
  ]
};
```

**Add new state:**
```tsx
const [activeTab, setActiveTab] = useState<keyof typeof rideCategories>("Premium");
```

**Update the vehicle selection JSX:**
- Add horizontal tab selector with `Object.keys(rideCategories).map()`
- Replace single-column grid with `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4`
- Wrap cards in `<AnimatePresence mode="popLayout">` for smooth transitions
- Use vertical card layout with image area + content area

**Update fare calculation:**
- Modify `getFareFixed()` to accept the new ride object structure (static price or calculated)

---

## Visual Preview

```text
┌─────────────────────────────────────────────────────────────────┐
│                      LIVE STATUS: 42 Drivers                    │
│                   Choose Your Ride                              │
│                                                                 │
│        [ Economy ]    [✓ Premium ]    [ Elite ]                 │
│                                                                 │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│  │   $38.00   │ │   $65.00   │ │   $85.00   │ │   $90.00   │   │
│  │  [image]   │ │  [image]   │ │  [image]   │ │  [image]   │   │
│  │────────────│ │────────────│ │────────────│ │────────────│   │
│  │ ★ Comfort  │ │ 💼 Black   │ │ 🛡 SUV     │ │ ⚓ XXL     │   │
│  │ More legroom│ │ Leather   │ │ Luxury 6  │ │ Max space  │   │
│  │ ⚡ 5 min   │ │ ⚡ 8 min   │ │ ⚡ 10 min  │ │ ⚡ 12 min  │   │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
│                                                                 │
│           ┌────────────────────────────────────────┐            │
│           │    REQUEST ZIVO BLACK  →               │            │
│           └────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Summary of Changes

| Area | Change |
|------|--------|
| Data | Replace 3-option array with 12-option categorized object |
| UI | Add horizontal tab selector for Economy/Premium/Elite |
| Layout | Switch to responsive 4-column grid |
| Cards | Use vertical layout with image overlay price badge |
| Animation | Add AnimatePresence for smooth category switching |
| Icons | Import and use Leaf, Zap, Briefcase, Crown, Anchor, Dog |

All existing booking flow logic (location detection, fare calculation, Stripe checkout) remains unchanged.

