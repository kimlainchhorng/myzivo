
# ZIVO Ride Enhanced UX Update

## Overview

This update enhances the location input UX with better suggestions and clear buttons, and ensures dynamic pricing is consistently shown across all screens including the CTA and confirm page.

---

## Current State Analysis

Most of the requested functionality already exists:
- Trip calculation is stable (uses deterministic hash)
- Dynamic pricing formula is implemented
- CTA validation for pickup/destination/ride is working
- RideGrid shows dynamic prices

**What's Missing:**
1. Louisiana mock addresses (currently NY addresses)
2. Clear button (X) in inputs
3. CTA shows static `ride.price` instead of calculated price
4. Confirm page missing trip estimate line and calculated price

---

## Implementation Plan

### A) Update Mock Suggestions + Add Clear Button

**File**: `src/components/ride/RideLocationCard.tsx`

1. Replace mock suggestions with Louisiana addresses:
```text
- 109 Hickory Street, Denham Springs, LA
- 875 Florida Blvd, Baton Rouge, LA
- 6401 Bluebonnet Blvd, Baton Rouge, LA
- 660 Arlington Creek Centre, Baton Rouge, LA
- 1 Airport Rd, Baton Rouge, LA
- 3900 N I-10 Service Rd, Metairie, LA
- 10000 Perkins Rowe, Baton Rouge, LA
- 2142 O'Neal Lane, Baton Rouge, LA
```

2. Show 6 suggestions instead of 4

3. Add X clear button inside each input (when value exists):
```text
+--------------------------------------+
| [icon] 109 Hickory Street...   [X]  |
+--------------------------------------+
```

The clear button appears only when the input has content and clears the field on click.

---

### B) CTA With Dynamic Pricing

**File**: `src/components/ride/RideStickyCTA.tsx`

Add props for `tripDetails` and calculate the display price:

```typescript
interface RideStickyCTAProps {
  selectedRide: RideOption | null;
  pickup: string;
  destination: string;
  tripDetails: TripDetails | null;  // NEW
  onConfirm: () => void;
}
```

Calculate and display the dynamic price:
```typescript
const displayPrice = tripDetails && selectedRide
  ? calculateRidePrice(selectedRide.id, tripDetails.distance, tripDetails.duration)
  : selectedRide?.price || 0;

// Button text:
`SELECT ${name} ($${displayPrice.toFixed(2)}) →`
```

---

### C) Update RidePage to Pass Trip Details to CTA

**File**: `src/pages/ride/RidePage.tsx`

Pass `tripDetails` to `RideStickyCTA`:

```tsx
<RideStickyCTA 
  selectedRide={selectedRide} 
  pickup={pickup}
  destination={destination}
  tripDetails={tripDetails}  // NEW
  onConfirm={handleConfirm} 
/>
```

Also pass `tripDetails` in navigation state to confirm page:

```tsx
navigate("/ride/confirm", {
  state: {
    ride: selectedRide,
    pickup,
    destination,
    tripDetails,  // NEW
  },
});
```

---

### D) Update Confirm Page with Trip Estimate

**File**: `src/pages/ride/RideConfirmPage.tsx`

1. Add `tripDetails` to LocationState interface:
```typescript
interface LocationState {
  ride: RideOption;
  pickup: string;
  destination: string;
  tripDetails?: TripDetails;  // NEW
}
```

2. Add trip estimate line below location details:
```text
+-------------------------------------+
|  📍 Pickup: 109 Hickory Street...   |
|  📍 Destination: 875 Florida...     |
|  ---------------------------------- |
|     5.4 miles • 14 min              | <-- NEW
|  ---------------------------------- |
|  ⏱ 4 min away        $12.50        |
+-------------------------------------+
```

3. Calculate and display dynamic price instead of `ride.price`:
```typescript
const displayPrice = tripDetails
  ? calculateRidePrice(ride.id, tripDetails.distance, tripDetails.duration)
  : ride.price;
```

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/ride/RideLocationCard.tsx` | Modify | Update to LA addresses, show 6 suggestions, add X clear button |
| `src/components/ride/RideStickyCTA.tsx` | Modify | Accept tripDetails, show calculated price |
| `src/pages/ride/RidePage.tsx` | Modify | Pass tripDetails to CTA and navigation state |
| `src/pages/ride/RideConfirmPage.tsx` | Modify | Show trip estimate line, use calculated price |

---

## Technical Details

### Clear Button Behavior
- Appears only when input has content
- Clicking clears the input value
- Uses `X` icon from lucide-react
- Positioned inside the input container (right side)
- Does not interfere with suggestion dropdown

### Suggestion Dropdown
- Shows 6 suggestions on focus (increased from 4)
- Filters as user types
- Solid background with `bg-zinc-900/95` (not transparent)
- High z-index (z-50) to appear above other elements

### Price Consistency
The same price calculation is used everywhere:
- Ride cards in grid
- CTA button
- Confirm page

Formula: `(2.00 + distance*1.25 + duration*0.20) * multiplier`

---

## No Breaking Changes

- Existing UI layout preserved exactly
- Same glassmorphic styling throughout
- Trip calculation already stable (hash-based)
- CTA validation logic unchanged
