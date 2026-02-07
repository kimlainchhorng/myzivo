
# Surge Pricing Integration Plan

## Overview

Integrate dynamic surge pricing into ride quotes based on real-time demand (requested rides) vs supply (online drivers). This uses the same algorithm specified for Analytics, replacing the current simple driver-count-based surge with a proper demand/supply ratio calculation.

---

## Current State

| Component | Status | Notes |
|-----------|--------|-------|
| `useSurgePricing` hook | Exists | Currently uses only driver count (< 2 = 1.8x, < 3 = 1.5x) |
| `useAvailableDrivers` hook | Exists | Fetches online, verified drivers with schedules |
| `RidePage.tsx` | Uses surge | Passes `surgeMultiplier` to RideGrid and confirm page |
| `RideCard.tsx` | Shows badge | Shows "High demand" badge when `surgeActive` |
| `trips` table | Has columns | Already has `surge_multiplier`, `surged_fare` columns |
| `createRideInDb` | Saves fare | Saves `fare_amount` but not surge details separately |

---

## Changes Required

### 1. Create `src/lib/surge.ts` (New File)

Core surge calculation logic matching Analytics rules:

```typescript
export interface SurgeResult {
  multiplier: number;
  level: 'Low' | 'Medium' | 'High';
  finalPrice: number;
}

export function calculateSurge({
  requestedCount,
  availableDrivers,
  basePrice,
}: {
  requestedCount: number;
  availableDrivers: number;
  basePrice: number;
}): SurgeResult {
  let multiplier = 1.0;
  let level: 'Low' | 'Medium' | 'High' = 'Low';

  if (availableDrivers <= 0) {
    multiplier = 2.0;
    level = 'High';
  } else {
    const ratio = requestedCount / Math.max(1, availableDrivers);
    
    if (ratio >= 2.0) {
      multiplier = 2.0;
      level = 'High';
    } else if (ratio >= 1.5) {
      multiplier = 1.6;
      level = 'High';
    } else if (ratio >= 1.0) {
      multiplier = 1.3;
      level = 'Medium';
    }
  }

  return {
    multiplier,
    level,
    finalPrice: Math.round(basePrice * multiplier * 100) / 100,
  };
}
```

---

### 2. Create Demand Metrics Helper in `src/lib/surge.ts`

Add helper to fetch live demand from Supabase:

```typescript
export async function getDemandMetrics(
  supabase: SupabaseClient,
  windowMinutes: number = 5
): Promise<{ requestedCount: number; availableDrivers: number }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - windowMinutes * 60 * 1000);
  const driverActiveThreshold = new Date(now.getTime() - 2 * 60 * 1000);

  // Count rides in 'requested' or 'accepted' status from last 5 min
  const { count: requestedCount } = await supabase
    .from('trips')
    .select('*', { count: 'exact', head: true })
    .in('status', ['requested', 'accepted', 'en_route'])
    .gte('created_at', windowStart.toISOString());

  // Count online drivers active within 2 min
  const { count: availableDrivers } = await supabase
    .from('drivers')
    .select('*', { count: 'exact', head: true })
    .eq('is_online', true)
    .eq('status', 'verified')
    .gte('updated_at', driverActiveThreshold.toISOString());

  return {
    requestedCount: requestedCount || 0,
    availableDrivers: availableDrivers || 0,
  };
}
```

---

### 3. Update `src/hooks/useSurgePricing.ts`

Replace the current simple logic with the new demand-based calculation:

**Key changes:**
- Add new `useDemandMetrics` query that fetches every 15 seconds
- Use the new `calculateSurge` function
- Expose `level` for badge display and `multiplier` text

```typescript
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { calculateSurge, getDemandMetrics } from "@/lib/surge";

export interface SurgePricingInfo {
  multiplier: number;
  isActive: boolean;
  label: string;
  level: 'Low' | 'Medium' | 'High';
  requestedCount: number;
  availableDrivers: number;
  isLoading: boolean;
  refetch: () => void;
}

export function useSurgePricing(): SurgePricingInfo {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['demand-metrics'],
    queryFn: () => getDemandMetrics(supabase, 5),
    refetchInterval: 15000, // Every 15 seconds
    staleTime: 10000,
  });

  const requestedCount = data?.requestedCount || 0;
  const availableDrivers = data?.availableDrivers || 0;

  const surgeResult = calculateSurge({
    requestedCount,
    availableDrivers,
    basePrice: 1, // Base price applied elsewhere
  });

  const labelMap = {
    Low: '',
    Medium: 'Moderate demand',
    High: 'High demand',
  };

  return {
    multiplier: surgeResult.multiplier,
    isActive: surgeResult.multiplier > 1.0,
    label: labelMap[surgeResult.level],
    level: surgeResult.level,
    requestedCount,
    availableDrivers,
    isLoading,
    refetch,
  };
}
```

---

### 4. Update `RideCard.tsx` - Enhanced Badge Display

Update the surge badge to show:
- Demand level text ("Low/Medium/High demand")
- Multiplier when > 1.0 (e.g., "1.3x")

**Props changes:**
```typescript
interface RideCardProps {
  ride: RideOption;
  isSelected: boolean;
  onSelect: () => void;
  calculatedPrice?: number;
  surgeActive?: boolean;
  surgeMultiplier?: number;  // NEW
  surgeLevel?: 'Low' | 'Medium' | 'High';  // NEW
}
```

**Badge update:**
```tsx
{surgeActive && (
  <div className={cn(
    "absolute top-2 left-2 backdrop-blur-sm px-2 py-1 rounded-full",
    surgeLevel === 'High' ? "bg-amber-500/90" : "bg-yellow-500/80"
  )}>
    <span className="text-[10px] font-bold text-white">
      {surgeLevel} demand {surgeMultiplier && surgeMultiplier > 1 && `• ${surgeMultiplier}x`}
    </span>
  </div>
)}
```

---

### 5. Update `RideGrid.tsx` - Pass Surge Level

Pass the new `surgeLevel` and `surgeMultiplier` to each RideCard:

```typescript
interface RideGridProps {
  rides: RideOption[];
  selectedRideId: string | null;
  onSelectRide: (ride: RideOption) => void;
  tripDetails: TripDetails | null;
  surgeMultiplier?: number;
  surgeLevel?: 'Low' | 'Medium' | 'High';  // NEW
}
```

---

### 6. Update `RidePage.tsx` - Surge Refresh and Level

**Changes:**
- Get `level` and `refetch` from `useSurgePricing`
- Pass `surgeLevel` to RideGrid
- Trigger `refetch` when pickup/destination changes

```typescript
const { 
  multiplier: surgeMultiplier, 
  isActive: surgeActive, 
  label: surgeLabel, 
  level: surgeLevel,
  refetch: refetchSurge 
} = useSurgePricing();

// Recompute surge when route changes
useEffect(() => {
  refetchSurge();
}, [pickup, destination, refetchSurge]);
```

---

### 7. Update `RideConfirmPage.tsx` - Save Surge to DB

When creating the ride, include surge data:

**In `createRideInDb` call, add:**
```typescript
const result = await createRideInDb({
  // ... existing fields
  surgeMultiplier,  // Add this
  surgedFare: finalPrice,  // Add this
});
```

---

### 8. Update `src/lib/supabaseRide.ts` - Accept Surge Fields

**Update `CreateRideDbPayload` interface:**
```typescript
export interface CreateRideDbPayload {
  // ... existing fields
  surgeMultiplier?: number;
  surgedFare?: number;
  surgeLevel?: string;
}
```

**Update insert operation:**
```typescript
const insertData = {
  // ... existing fields
  surge_multiplier: payload.surgeMultiplier || 1,
  surged_fare: payload.surgedFare || payload.price,
};
```

---

## File Summary

| File | Action | Description |
|------|--------|-------------|
| `src/lib/surge.ts` | **Create** | Core surge calculation + demand metrics fetcher |
| `src/hooks/useSurgePricing.ts` | **Modify** | Use new demand-based calculation, 15s refresh |
| `src/components/ride/RideCard.tsx` | **Modify** | Show level badge + multiplier text |
| `src/components/ride/RideGrid.tsx` | **Modify** | Pass surgeLevel prop to cards |
| `src/pages/ride/RidePage.tsx` | **Modify** | Pass surgeLevel, refetch on address change |
| `src/pages/ride/RideConfirmPage.tsx` | **Modify** | Save surge_multiplier + surged_fare to DB |
| `src/lib/supabaseRide.ts` | **Modify** | Accept and save surge fields |

---

## UI Changes (Minimal)

```text
RideCard with surge:
┌───────────────────────────────┐
│ [High demand • 1.3x]  [$15.50]│  ← Badge shows level + multiplier
│                               │
│      [Vehicle Image]          │
│                               │
│ Economy                       │
│ Reliable everyday rides       │
│ ⏱ 4 min                       │
└───────────────────────────────┘
```

---

## Database

The `trips` table already has the required columns:
- `surge_multiplier` (numeric) - stores the multiplier applied
- `surged_fare` (numeric) - stores the final price after surge

No migration needed.

---

## Technical Details

### Surge Rules (matching Analytics)

| Condition | Multiplier | Level |
|-----------|------------|-------|
| availableDrivers <= 0 | 2.0x | High |
| ratio >= 2.0 | 2.0x | High |
| ratio >= 1.5 | 1.6x | High |
| ratio >= 1.0 | 1.3x | Medium |
| ratio < 1.0 | 1.0x | Low |

Where `ratio = requestedCount / max(1, availableDrivers)`

### Refresh Strategy
- **Automatic**: Every 15 seconds via React Query `refetchInterval`
- **On change**: When user changes pickup or destination
- **Stale time**: 10 seconds (prevents excessive refetches)

---

## Testing Checklist

- [ ] Surge calculates correctly based on demand/supply ratio
- [ ] Badge shows "Low/Medium/High demand" label
- [ ] Multiplier text (1.3x, 1.6x, 2.0x) appears when active
- [ ] Prices update every 15 seconds on quote screen
- [ ] Prices recalculate when pickup/destination changes
- [ ] Surge multiplier is saved to `trips.surge_multiplier`
- [ ] Surged fare is saved to `trips.surged_fare`
- [ ] Confirm page shows correct surged price
