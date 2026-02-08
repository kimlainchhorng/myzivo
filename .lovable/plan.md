

# Add Surge Pricing Indicators for Zone-Based Demand

## Overview

Add real-time surge pricing indicators that display when demand is high in the user's pickup zone. The surge multiplier will be calculated based on live demand (active ride requests) vs supply (online drivers) in the detected pricing zone, and visually communicated to users throughout the booking flow.

## Current State

| Component | Status |
|-----------|--------|
| `useSurgePricing` hook | Exists but fetches global metrics (not zone-specific) |
| `calculateSurge` function | Works correctly with ratio-based rules |
| Zone detection | Working via `usePricingZone` hook |
| Surge UI in RideCard | Exists but not connected |
| Surge in Rides.tsx | Marked as TODO on line 570 |

## Implementation Plan

### Step 1: Create Zone-Specific Surge Hook
**File**: `src/hooks/useZoneSurgePricing.ts` (NEW)

Create a new hook that calculates surge based on demand in the specific pickup zone:

```text
useZoneSurgePricing(zoneId: string | null, pickupCoords: {lat, lng} | null)
  → { multiplier, level, label, isActive, isLoading }
```

The hook will:
- Query trips in "requested/accepted/en_route" status within the zone's bounding box
- Query online drivers within the zone's bounding box
- Calculate surge using existing `calculateSurge()` function
- Refresh every 15 seconds

### Step 2: Add Surge Banner Component
**File**: `src/components/ride/SurgeBanner.tsx` (NEW)

A reusable banner that displays surge status:

```text
+--------------------------------------------------+
|  ⚡ High demand in this area • Prices are 1.6x   |
+--------------------------------------------------+
```

Features:
- Animates in/out based on surge state
- Color coding: amber for Medium, red for High
- Shows zone name and multiplier
- Dismissible with "Got it" button

### Step 3: Update UberLikeRideRow with Surge Indicator
**File**: `src/components/ride/UberLikeRideRow.tsx`

Add optional surge props:
- `surgeMultiplier?: number`
- `surgeLevel?: SurgeLevel`
- `surgeActive?: boolean`

When surge is active, show a small lightning bolt icon and adjusted price styling.

### Step 4: Integrate Surge into Rides.tsx
**File**: `src/pages/Rides.tsx`

1. Import and use `useZoneSurgePricing(pricingZone?.id, pickupCoords)`
2. Add `<SurgeBanner>` above the ride options list when surge is active
3. Pass surge data to `UberLikeRideRow` components
4. Include `surge_multiplier` in the payment intent request (line 570)
5. Update `getQuoteForOption` to include surge in price calculation

### Step 5: Update Pricing Calculation
**File**: `src/lib/pricing.ts`

Ensure `quoteRidePrice` accepts and applies surge multiplier on top of ride-type multiplier:

```text
finalMultiplier = rideTypeMultiplier × surgeMultiplier
```

## Visual Design

### Surge Banner (above ride options)
```text
┌─────────────────────────────────────────────────┐
│  ⚡ High demand near Baton Rouge                │
│     Prices are currently 1.6× higher            │
│                                        [Got it] │
└─────────────────────────────────────────────────┘
```

### Surge on Ride Row
```text
┌─────────────────────────────────────────────────┐
│  🚗  Standard                    👤 4    $45.00 │
│       4:15 PM · 4 min          ⚡1.6x           │
└─────────────────────────────────────────────────┘
```

## Database Query (Zone-Specific)

The zone-specific demand metrics query:

```sql
-- Rides in zone (last 5 min)
SELECT COUNT(*) FROM trips
WHERE status IN ('requested', 'accepted', 'en_route')
  AND pickup_lat BETWEEN zone.min_lat AND zone.max_lat
  AND pickup_lng BETWEEN zone.min_lng AND zone.max_lng
  AND created_at >= NOW() - INTERVAL '5 minutes'

-- Drivers in zone (active in last 2 min)
SELECT COUNT(*) FROM drivers
WHERE is_online = true
  AND status = 'verified'
  AND current_lat BETWEEN zone.min_lat AND zone.max_lat
  AND current_lng BETWEEN zone.min_lng AND zone.max_lng
  AND updated_at >= NOW() - INTERVAL '2 minutes'
```

## Surge Rules (Unchanged)

| Condition | Multiplier | Level |
|-----------|------------|-------|
| No drivers available | 2.0× | High |
| Ratio >= 2.0 | 2.0× | High |
| Ratio >= 1.5 | 1.6× | High |
| Ratio >= 1.0 | 1.3× | Medium |
| Ratio < 1.0 | 1.0× | Low |

## Files to Create/Modify

| File | Action |
|------|--------|
| `src/hooks/useZoneSurgePricing.ts` | Create |
| `src/components/ride/SurgeBanner.tsx` | Create |
| `src/components/ride/UberLikeRideRow.tsx` | Modify |
| `src/pages/Rides.tsx` | Modify |
| `src/lib/pricing.ts` | Modify (ensure surge × type multiplier) |
| `src/lib/surge.ts` | Modify (add zone-aware metrics function) |

## Testing Checklist

1. Navigate to `/rides`
2. Enter pickup address in a zone with active trips
3. Verify surge banner appears when demand is high
4. Verify each ride card shows surge indicator
5. Verify prices include surge multiplier
6. Confirm payment request includes correct surge_multiplier
7. Verify surge refreshes every 15 seconds

