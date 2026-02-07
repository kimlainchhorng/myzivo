
# Ride Selection UI Refinement Plan

## Overview
Update the Rides page UI to better match the reference designs, focusing on improved visual hierarchy, card layouts, and the booking flow aesthetics.

---

## Changes Summary

### 1. Step "request" — Location + Ride Selection Screen
This screen already has most elements but needs refinement:

**A. Location Input Panel Updates**
- Add clearer labels: "PICKUP LOCATION" and "DESTINATION" above each input (matching reference design 2)
- Ensure the connector line is visible between inputs
- Add edit icons (⊙) on the right side of each input row

**B. Distance/Duration Display**
- Move the "~9.1 mi ~21 min" info to appear **below** the location panel (currently it's in options step)
- Display format: `~9.1 mi  ~21 min`

**C. Category Tabs**
- Already present ✓
- Ensure proper styling matches reference (ECONOMY / PREMIUM / ELITE pills)

**D. Ride Cards Grid**
- Currently shows 2 cards per row ✓
- Update card layout to match reference:
  - Price badge on top-right of image (currently present ✓)
  - Vehicle name + star icon below image
  - Subtitle text
  - ETA with lightning icon at bottom-left

### 2. Step "options" — Ride List View  
This is the secondary selection view shown in reference image 1:

**A. Route Summary Header**
- Compact glassmorphic panel showing pickup and destination
- Blue dot for pickup, green dot for destination
- Display `~9.1 mi  ~21 min` below the addresses

**B. "Choose your ride" Heading**
- Keep the current styling

**C. List-Style Ride Cards** (matching reference image 1)
- Horizontal layout with image thumbnail on left
- Name + passenger count (👤 4) 
- Subtitle in muted gray
- Price in **green/primary color** on the right
- Chevron arrow on the right

### 3. Sticky Confirm Button
- Already present ✓
- Text: "CONFIRM ZIVO BLACK ›" (dynamic based on selection)
- White button with black text

---

## Technical Implementation

### File: `src/pages/Rides.tsx`

**Location Panel Labels (Step "request")**
```text
Lines ~478-567: Update the pickup/dropoff input containers
- Add small label: "PICKUP LOCATION" and "DESTINATION" 
- Labels: text-[9px] uppercase font-bold tracking-wider text-zinc-500
```

**Distance/Duration in Request Step**
```text
Lines ~617 area: Add distance/time display below location panel
- Show: ~{estimatedDistance} mi  ~{estimatedDuration} min
- Only when both pickup and dropoff are filled
```

**Ride Card Refinements (Grid Cards)**
```text
Lines ~650-704: Update card structure
- Add star/diamond icon next to vehicle name
- Improve spacing and typography
```

**Options Step List Cards**
```text
Lines ~738-777: Refine list card styling
- Price color: text-primary (or emerald-400 for green)
- Add passenger icon with count
- Ensure consistent spacing
```

### No New Files Required
All changes are refinements to existing components in `src/pages/Rides.tsx`.

---

## Visual Comparison

| Element | Current | After Update |
|---------|---------|--------------|
| Location labels | None | "PICKUP LOCATION" / "DESTINATION" |
| Distance display | Only in options step | Shown in request step too |
| Grid card icons | Custom icons per ride | Star/diamond badge for vehicle type |
| List card price | Primary color | Green/emerald for price emphasis |
| Passenger count | In options only | Consistent across both views |

---

## Summary
This update brings the Rides UI closer to the reference designs while maintaining the existing 2026 Spatial UI aesthetic. The changes are primarily styling refinements rather than structural changes, ensuring a smooth implementation.
