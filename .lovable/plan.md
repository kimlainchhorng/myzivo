

# Real-Time Pricing with Short Cache (60s)

## Overview

Update the pricing hooks to use a short 60-second cache for zone pricing rates, ensuring riders always see the latest prices. Add automatic refetch when pickup location changes, and optionally display a "Pricing updated in real time" indicator.

## Current State

| Component | Current Setting | Target |
|-----------|-----------------|--------|
| `useAllZoneRatesMap` staleTime | 5 minutes | 60 seconds |
| `useZonePricingRates` staleTime | 5 minutes | 60 seconds |
| Refetch on pickup change | Not explicit | Yes |
| "Real-time" indicator | Not present | Optional |

## Implementation Plan

### Step 1: Update Cache Settings in useZonePricingRates.ts

**File**: `src/hooks/useZonePricingRates.ts`

Reduce cache times from 5 minutes to 60 seconds:

```text
useZonePricingRates():
  staleTime: 5 * 60 * 1000 → 60 * 1000 (60 seconds)
  gcTime: 10 * 60 * 1000 → 2 * 60 * 1000 (2 minutes)
  
useAllZoneRates():
  staleTime: 5 * 60 * 1000 → 60 * 1000 (60 seconds)
  
useAllZoneRatesMap():
  staleTime: 5 * 60 * 1000 → 60 * 1000 (60 seconds)
  gcTime: 10 * 60 * 1000 → 2 * 60 * 1000 (2 minutes)
```

Also add `refetchInterval: 60 * 1000` to auto-refresh every 60 seconds while the component is mounted.

### Step 2: Add Zone ID to Query Key for Automatic Refetch

**File**: `src/hooks/useZonePricingRates.ts`

The `useAllZoneRatesMap` hook already includes `zoneId` in its query key:

```text
queryKey: ["zone-pricing-rates-map", zoneId]
```

This means when `pricingZone.id` changes (triggered by pickup location change), TanStack Query automatically:
1. Invalidates the cached data
2. Fetches fresh rates for the new zone

No changes needed here - the architecture already handles pickup-change refetch.

### Step 3: Add "lastUpdated" Timestamp to Hook Return

**File**: `src/hooks/useZonePricingRates.ts`

Return additional metadata from `useAllZoneRatesMap`:

```text
return {
  ratesMap: data ?? new Map(),
  isLoading,
  error,
  dataUpdatedAt,    // Timestamp of last successful fetch
  isRefetching,     // True when background refetch in progress
}
```

### Step 4: Add Real-Time Indicator to UberLikeRideRow

**File**: `src/components/ride/UberLikeRideRow.tsx`

Add optional prop `showRealTimeIndicator`:

```text
interface UberLikeRideRowProps {
  ...existing props...
  showRealTimeIndicator?: boolean; // Show "Live pricing" text
}
```

When enabled, display subtle text below the price:

```text
┌─────────────────────────────────────────────────┐
│  🚗  Standard                    👤 4   $20.00  │
│       4:15 PM · 4 min               Live prices │
└─────────────────────────────────────────────────┘
```

### Step 5: Verify UI Only Uses quoteRidePrice()

**File**: `src/pages/Rides.tsx`

Current implementation already correct:
- `getFareDisplay()` calls `getQuoteForOption()` which uses `quoteRidePrice()`
- No additional math is performed on the price
- Price breakdown also comes from the quote

No changes needed - architecture is already clean.

## Visual Design

### Real-Time Indicator (subtle, optional)

```text
┌─────────────────────────────────────────────────┐
│  🚗  Wait & Save                 👤 4   $18.40  │
│       4:15 PM · 15 min              Live prices │
│                                   ↑ text-[10px] │
│                                     text-zinc-400│
└─────────────────────────────────────────────────┘
```

Only shown when `showRealTimeIndicator={true}` is passed to the component.

## Technical Details

### Updated Cache Configuration

```text
// Before (5 minutes)
staleTime: 5 * 60 * 1000,
gcTime: 10 * 60 * 1000,

// After (60 seconds with auto-refresh)
staleTime: 60 * 1000,
gcTime: 2 * 60 * 1000,
refetchInterval: 60 * 1000,
refetchOnWindowFocus: true,  // Also refetch when user returns to tab
```

### Pickup Change Flow

```text
User enters new pickup address
    ↓
pickupCoords state updates
    ↓
usePricingZone(lat, lng) finds new zone
    ↓
pricingZone.id changes
    ↓
useAllZoneRatesMap(pricingZone.id) detects key change
    ↓
TanStack Query fetches fresh rates for new zone
    ↓
getQuoteForOption() recalculates with new rates
    ↓
UI re-renders with updated prices
```

### Query Key Structure

```text
["zone-pricing-rates-map", "00000000-0000-0000-0000-000000000001"]  // Default US
["zone-pricing-rates-map", "baton-rouge-zone-id"]                   // After pickup change
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useZonePricingRates.ts` | Reduce staleTime to 60s, add refetchInterval, return metadata |
| `src/components/ride/UberLikeRideRow.tsx` | Add optional "Live prices" indicator |
| `src/pages/Rides.tsx` | Pass `showRealTimeIndicator` prop (optional) |

## Testing Checklist

1. Navigate to `/rides` and enter pickup/destination
2. Verify prices load correctly
3. Wait 60+ seconds - confirm background refetch occurs (check Network tab)
4. Change pickup to a different zone - verify prices update immediately
5. Verify "Live prices" indicator appears under price (if enabled)
6. Confirm no extra math is applied to prices in UI

