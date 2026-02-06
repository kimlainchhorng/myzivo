

# ZIVO Ride Flow Enhancement

## Overview

This plan adds two new screens (`/ride/finding` and `/ride/driver`) to complete the ZIVO Ride booking flow while ensuring the existing selection behavior continues working correctly.

---

## Current State Analysis

The existing implementation at `/ride` and `/ride/confirm` is already functional:
- Ride selection with blue border/glow works
- CTA updates dynamically with ride name and price
- Only one ride can be selected at a time
- Navigation to `/ride/confirm` passes state correctly

The confirm page (`/ride/confirm`) currently handles the "Finding driver" state inline with a modal. We will redirect to a dedicated `/ride/finding` page instead.

---

## Changes Summary

```text
+------------------+     +-------------------+     +-------------------+     +------------------+
|   /ride          | --> |   /ride/confirm   | --> |   /ride/finding   | --> |   /ride/driver   |
| (Select vehicle) |     | (Payment + CTA)   |     | (Progress anim)   |     | (Driver card)    |
+------------------+     +-------------------+     +-------------------+     +------------------+
```

---

## Part A: Verify Selection Behavior on /ride

**Status**: Already implemented correctly

| Requirement | Implementation |
|-------------|----------------|
| Tap card sets selected state | `RidePage.tsx` line 109: `onSelectRide={setSelectedRide}` |
| Blue border + glow styling | `RideCard.tsx` line 30: `border-primary ring-2 ring-primary/30 shadow-lg shadow-primary/20` |
| Enable CTA when selected | `RideStickyCTA.tsx` line 12: `isDisabled = !selectedRide` |
| Dynamic CTA text | `RideStickyCTA.tsx` line 34: `SELECT {name.toUpperCase()} ($price)` |
| Single selection only | State holds one `RideOption` object |

No changes needed for Part A.

---

## Part B: Improve /ride/confirm

**File**: `src/pages/ride/RideConfirmPage.tsx`

Updates:
1. Remove inline "Finding driver" modal and loading state
2. On "CONFIRM RIDE" click, navigate to `/ride/finding` with full state (ride, pickup, destination, payment method)
3. Keep existing trip summary display (pickup, destination, ride, price, ETA)
4. Keep payment method selection (Card, Apple Pay, Cash)

---

## Part C: New Route /ride/finding

**New File**: `src/pages/ride/RideFindingPage.tsx`

Features:
- Full-screen modal-style overlay with dark backdrop
- Animated pulsing icon (car or radar)
- "Finding your driver..." heading
- Progress bar animating from 0% to 100% over 6 seconds
- Auto-navigate to `/ride/driver` when progress completes
- Pass all state (ride, pickup, destination, payment) forward

UI Structure:
```
+---------------------------------------+
|                                       |
|         [Animated Car Icon]           |
|                                       |
|      Finding your driver...           |
|                                       |
|      [===========         ] 65%       |
|                                       |
|      Connecting with nearby drivers   |
|                                       |
+---------------------------------------+
```

---

## Part D: New Route /ride/driver

**New File**: `src/pages/ride/RideDriverPage.tsx`

Features:
- Static map placeholder image at top (40% height)
- Pickup marker indicator on map
- Driver card as bottom sheet overlay:
  - Driver avatar, name (mock), rating (4.9 stars)
  - Car model and plate number (mock)
  - ETA countdown display (mock, starts at ride.eta)
  - Action buttons: Call, Message, Cancel Ride
- ZIVO branding consistent with other ride pages
- Bottom nav (RideBottomNav component)

Mock Driver Data:
```typescript
const mockDriver = {
  name: "Marcus Johnson",
  rating: 4.9,
  trips: 2847,
  car: "Toyota Camry",
  plate: "ABC 1234",
  avatar: "unsplash-url"
};
```

UI Structure:
```
+---------------------------------------+
|                                       |
|          [Static Map Image]           |
|              [Pickup Pin]             |
|                                       |
+---------------------------------------+
|  +---------------------------------+  |
|  |  [Avatar]  Marcus J.    4.9    |  |
|  |            2,847 trips         |  |
|  +---------------------------------+  |
|  |  Toyota Camry  |  ABC 1234     |  |
|  +---------------------------------+  |
|  |     Arriving in 4 min          |  |
|  +---------------------------------+  |
|  | [Call]  [Message]  [Cancel]    |  |
|  +---------------------------------+  |
+---------------------------------------+
| [Home] [Search] [Trips] [Alerts] [Me] |
+---------------------------------------+
```

---

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `src/pages/ride/RideConfirmPage.tsx` | Modify | Remove inline loading, navigate to /ride/finding on confirm |
| `src/pages/ride/RideFindingPage.tsx` | Create | New animated progress screen |
| `src/pages/ride/RideDriverPage.tsx` | Create | New driver assigned screen with map and driver card |
| `src/App.tsx` | Modify | Add routes for /ride/finding and /ride/driver |

---

## Technical Implementation

### RideFindingPage.tsx

Key implementation details:
- `useEffect` with `setInterval` to increment progress from 0 to 100 over 6 seconds
- `useNavigate` to auto-redirect when progress reaches 100
- `framer-motion` for pulsing icon and smooth progress bar
- Radix `Progress` component for the progress bar
- Receive state via `useLocation().state`

### RideDriverPage.tsx

Key implementation details:
- Bottom sheet using absolute positioning (not a drawer component)
- Mock countdown timer using `useState` + `useEffect`
- Action buttons with icons (Phone, MessageCircle, X)
- Static Unsplash map image as placeholder
- `RideBottomNav` for consistent navigation

### Route Registration (App.tsx)

Add after existing `/ride/confirm` route:
```tsx
<Route path="/ride/finding" element={<RideFindingPage />} />
<Route path="/ride/driver" element={<RideDriverPage />} />
```

---

## Dependencies

All required packages are already installed:
- `framer-motion` for animations
- `lucide-react` for icons
- `@radix-ui/react-progress` for progress bar
- `sonner` for toast notifications
- `react-router-dom` for navigation

No new dependencies needed.

