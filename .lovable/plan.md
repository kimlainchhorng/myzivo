
# Surge + Events + Price Cap Update

## Overview

This update caps surge pricing at 1.35x (from 1.5x), adds a max total multiplier of 1.60x, and displays distinct "Busy now" / "Event pricing" badges on ride cards.

## Current State Analysis

| Component | Status | Notes |
|-----------|--------|-------|
| `event_zones` table | ✅ Exists | Has all required columns |
| `getSurgeMultiplier()` | ✅ Exists | Needs caps adjusted |
| `getEventMultiplier()` | ✅ Exists | Already using Haversine distance |
| Surge badge | ✅ Exists | Shows "High/Medium demand" - needs "Busy now" |
| Debug panel | ✅ Exists | Needs surge/event/totalMult rows |
| `multipliers` JSON save | ⚠️ Partial | Needs to save full object |

## Implementation Plan

### A) Update Surge Caps in `quoteRidePrice.ts`

Current surge multipliers:
- No drivers: 1.5x
- ratio ≥ 2.0: 1.5x
- ratio ≥ 1.5: 1.3x
- ratio ≥ 1.0: 1.15x

**New caps (even cheaper):**
- No drivers: 1.35x
- ratio ≥ 2.0: 1.35x
- ratio ≥ 1.5: 1.25x
- ratio ≥ 1.0: 1.12x
- else: 1.00x

Also update `surge.ts` constants to match.

### B) Add MAX_TOTAL_MULTIPLIER Cap

Add a new constant and apply it:

```typescript
const MAX_TOTAL_MULTIPLIER = 1.60;

// In quoteRidePrice():
let totalMult = rideTypeMult * timeMult * weatherMult * surgeMult * eventMult * longTripMult;
if (totalMult > MAX_TOTAL_MULTIPLIER) {
  totalMult = MAX_TOTAL_MULTIPLIER;
}
```

This ensures final price never explodes even when multiple multipliers stack.

### C) Update RideQuoteResult Interface

Add `totalMult` to the return object for UI display:

```typescript
export interface RideQuoteResult {
  // ...existing fields
  multipliers: {
    rideType: number;
    time: number;
    weather: number;
    surge: number;
    event: number;
    longTrip: number;
    combined: number; // after cap applied
  };
}
```

The `combined` field already exists and will reflect the capped value.

### D) Update RideCard Badges

Replace current surge badge with two distinct badges:

| Condition | Badge | Color |
|-----------|-------|-------|
| `surge > 1.0` | "Busy now" | Amber/orange |
| `event > 1.0` | "Event pricing" | Purple/violet |

Both can appear simultaneously if both are active.

### E) Expand Debug Panel

Add rows for individual multipliers:

```text
Zone: Baton Rouge
Route: 10.2 mi / 23 min
─────────────────────
Subtotal: $15.03
× Surge: 1.25
× Event: 1.10
× LongTrip: 0.92
─────────────────────
× Total: 1.27 (capped)
+ Insurance: $1.38
+ Booking: $0.99
─────────────────────
= Final: $21.45
```

### F) Save Full Multipliers JSON on Confirm

Update `CreateRideDbPayload` interface and ensure the `multipliers` object is saved:

```typescript
// In createRideInDb():
const insertData = {
  // ...existing fields
  multipliers: JSON.stringify(payload.multipliers), // or as JSONB directly
  zone_name: payload.zoneName,
};
```

The trips table needs a `multipliers` JSONB column if not present.

## Files to Modify

| File | Changes |
|------|---------|
| `src/lib/quoteRidePrice.ts` | Lower surge caps to 1.35x, add MAX_TOTAL_MULTIPLIER = 1.60 |
| `src/lib/surge.ts` | Update calculateSurge() caps to match (1.35x max) |
| `src/components/ride/RideCard.tsx` | Add "Busy now" + "Event pricing" badges |
| `src/components/ride/RideGrid.tsx` | Pass eventMultiplier to RideCard |
| `src/lib/supabaseRide.ts` | Add zone_name and multipliers JSON to insert |

## Price Cap Math Example

10-mile ride with stacking multipliers:

```text
Base rates:
  subtotal = $2.00 + (10 × $1.10) + (23 × $0.18) + $0.99 = $18.13

Multipliers (before cap):
  rideType × 1.00
  time     × 1.10 (rush hour)
  surge    × 1.25 (busy)
  event    × 1.10 (stadium)
  longTrip × 1.00
  ─────────────
  rawTotal = 1.51 → capped to 1.60? No, 1.51 < 1.60

Insurance: $1.38

Final = ($18.13 × 1.51) + $1.38 = $28.76
```

If multipliers were extreme (1.10 × 1.35 × 1.15 × 1.00 = 1.71):
→ Would be capped to 1.60

## Surge Comparison

| Condition | Old Multiplier | New Multiplier |
|-----------|----------------|----------------|
| No drivers | 1.50x | 1.35x |
| ratio ≥ 2.0 | 1.50x | 1.35x |
| ratio ≥ 1.5 | 1.30x | 1.25x |
| ratio ≥ 1.0 | 1.15x | 1.12x |
| Low demand | 1.00x | 1.00x |

## UI Badge Mockup

```text
┌─────────────────────────────────────┐
│  [Image: Standard Sedan]            │
│                                     │
│  [Busy now 🔥]        [$21.45]      │
│  [Event 🎫]                         │
│                                     │
│  Standard                           │
│  Reliable everyday rides            │
│  ⏱ 4 min                            │
└─────────────────────────────────────┘
```

## Summary

- Surge capped at **1.35x** (down from 1.5x)
- Total multiplier capped at **1.60x**
- New badges: "Busy now" (surge) and "Event pricing" (event)
- Debug panel shows individual multipliers
- Full multipliers JSON saved on ride confirmation
