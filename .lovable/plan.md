
# ZIVO Ride Flow Completion

## Current State

The ride flow already has screens 1-4 implemented:
- `/ride` - Selection with blue border/glow, dynamic CTA (working)
- `/ride/confirm` - Summary, payment methods, "CONFIRM RIDE" (working)
- `/ride/finding` - Animated progress bar, auto-navigate (working)
- `/ride/driver` - Map, driver card, Call/Message/Cancel (working)

## What Needs to Be Added

### 1. Add Cancel Button to /ride/finding

The finding screen currently lacks a cancel button. Add a "Cancel" button below the progress bar that navigates back to `/ride`.

**File**: `src/pages/ride/RideFindingPage.tsx`

```text
+---------------------------------------+
|         [Animated Car Icon]           |
|      Finding your driver...           |
|      [===========         ] 65%       |
|      Connecting with nearby drivers   |
|                                       |
|           [Cancel Button]      <-- ADD
+---------------------------------------+
```

### 2. Add "START TRIP" Button to /ride/driver

The driver screen needs a primary action button to proceed to the trip screen.

**File**: `src/pages/ride/RideDriverPage.tsx`

Add a "START TRIP" button below the action buttons that navigates to `/ride/trip` with the current state.

### 3. Create /ride/trip (Trip in Progress)

**New File**: `src/pages/ride/RideTripPage.tsx`

Features:
- Static map placeholder (same style as driver page)
- Animated route indicator
- Trip status that toggles between "On the way" and "Arrived" (mock toggle every 5 seconds or button)
- "END TRIP" button that opens the receipt modal

```text
+---------------------------------------+
|          [Static Map Image]           |
|            [Route Line]               |
+---------------------------------------+
|  +---------------------------------+  |
|  |    On the way to destination   |  |
|  |    or                          |  |
|  |    You have arrived!           |  |
|  +---------------------------------+  |
|  |  [Destination Address]         |  |
|  |  ETA: 8 min                    |  |
|  +---------------------------------+  |
|  |       [END TRIP Button]        |  |
|  +---------------------------------+  |
+---------------------------------------+
| [Home] [Search] [Trips] [Alerts] [Me] |
+---------------------------------------+
```

### 4. Create Receipt Modal

Add a receipt modal component that appears when "END TRIP" is tapped.

**New File**: `src/components/ride/RideReceiptModal.tsx`

Features:
- Fare breakdown card:
  - Base fare: $2.50
  - Time (12 min): $3.60
  - Distance (4.2 mi): $8.40
  - Service fee: $1.50
  - **Total**: Display ride price from state
- 5-star rating input (interactive)
- "DONE" button that closes modal and navigates to `/ride`

```text
+---------------------------------------+
|           Trip Complete!              |
+---------------------------------------+
|  Base fare             $2.50          |
|  Time (12 min)         $3.60          |
|  Distance (4.2 mi)     $8.40          |
|  Service fee           $1.50          |
|  ------------------------------------ |
|  Total                 $16.00         |
+---------------------------------------+
|  Rate your driver                     |
|  [star] [star] [star] [star] [star]   |
+---------------------------------------+
|          [DONE Button]                |
+---------------------------------------+
```

### 5. Register New Route

**File**: `src/App.tsx`

Add lazy import and route for `/ride/trip`:

```tsx
const RideTripPage = lazy(() => import("./pages/ride/RideTripPage"));

// In routes section:
<Route path="/ride/trip" element={<RideTripPage />} />
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/pages/ride/RideFindingPage.tsx` | Modify | Add "Cancel" button below progress bar |
| `src/pages/ride/RideDriverPage.tsx` | Modify | Add "START TRIP" button, navigate to /ride/trip |
| `src/pages/ride/RideTripPage.tsx` | Create | Trip in progress screen with status toggle |
| `src/components/ride/RideReceiptModal.tsx` | Create | Receipt modal with fare breakdown and rating |
| `src/App.tsx` | Modify | Add route for /ride/trip |

---

## Technical Details

### RideTripPage.tsx

State management:
- `tripStatus`: "on_the_way" | "arrived" - toggles via mock timer or button
- `showReceipt`: boolean - controls modal visibility
- `etaMinutes`: number - countdown from ride.eta

The status will auto-progress from "On the way" to "Arrived" after a delay, or provide a "Simulate Arrival" button for testing.

### RideReceiptModal.tsx

Props:
- `isOpen`: boolean
- `onClose`: () => void
- `ride`: RideOption
- `onDone`: () => void

Uses Radix Dialog component with glassmorphic styling. Star rating uses local state (1-5) with interactive hover effects.

### Mock Fare Calculation

The fare breakdown will be mock values that sum to approximately the ride price:
- Base fare: Fixed $2.50
- Time: ride.eta * 0.30 (approx)
- Distance: Calculated to make total match ride.price
- Service fee: Fixed $1.50

---

## Navigation Flow (Complete)

```text
/ride (Select vehicle)
    ↓ [SELECT button]
/ride/confirm (Payment + Summary)
    ↓ [CONFIRM RIDE]
/ride/finding (Progress animation)
    ↓ [Auto after 6s] or ← [Cancel]
/ride/driver (Driver info)
    ↓ [START TRIP] or ← [Cancel Ride]
/ride/trip (Trip in progress)
    ↓ [END TRIP]
Receipt Modal (Fare + Rating)
    ↓ [DONE]
/ride (Back to start)
```

---

## No Breaking Changes

- All existing UI and styling preserved
- Same ZIVO branding, glassmorphism, and bottom nav
- No external API dependencies
- Smooth framer-motion transitions throughout
