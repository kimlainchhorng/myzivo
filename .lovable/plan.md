
# Make Destination Field Required

## Overview

This is a simple validation enhancement to the `/ride` selection screen. The CTA button should only be enabled when **both** a ride is selected AND both pickup and destination fields have values.

---

## Current Behavior

Currently in `RideStickyCTA.tsx`:
```typescript
const isDisabled = !selectedRide;
```

The button only checks if a ride is selected, ignoring whether the destination is filled.

---

## Proposed Change

### File: `src/components/ride/RideStickyCTA.tsx`

Update the component to accept `pickup` and `destination` props and include them in the disabled logic:

**Props change:**
```typescript
interface RideStickyCTAProps {
  selectedRide: RideOption | null;
  pickup: string;        // NEW
  destination: string;   // NEW
  onConfirm: () => void;
}
```

**Validation change:**
```typescript
const isDisabled = !selectedRide || !pickup.trim() || !destination.trim();
```

**CTA text when missing location:**
- If no ride selected: "SELECT A RIDE"
- If ride selected but missing destination: "ENTER DESTINATION"

---

### File: `src/pages/ride/RidePage.tsx`

Pass the `pickup` and `destination` values to the `RideStickyCTA` component:

```tsx
<RideStickyCTA 
  selectedRide={selectedRide} 
  pickup={pickup}
  destination={destination}
  onConfirm={handleConfirm} 
/>
```

---

## User Experience

| State | CTA Text | Button State |
|-------|----------|--------------|
| No ride selected, no destination | "SELECT A RIDE" | Disabled (grey) |
| Ride selected, no destination | "ENTER DESTINATION" | Disabled (grey) |
| Ride selected, destination filled | "SELECT [NAME] ($X.XX) →" | Enabled (blue) |

---

## File Changes Summary

| File | Action | Description |
|------|--------|-------------|
| `src/components/ride/RideStickyCTA.tsx` | Modify | Add pickup/destination props, update validation logic |
| `src/pages/ride/RidePage.tsx` | Modify | Pass pickup/destination to RideStickyCTA |

---

## Technical Notes

- Uses `.trim()` to ensure empty/whitespace-only strings don't pass validation
- No changes to RideLocationCard needed - it already handles input correctly
- The confirm handler in RidePage already guards against missing data
