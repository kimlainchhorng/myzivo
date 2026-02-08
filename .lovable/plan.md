

# Dynamic Surge Pricing from Database

## Overview
Implement dynamic surge pricing that fetches the multiplier directly from the `surge_multipliers` table (zone='GLOBAL') instead of calculating it from demand/supply ratios. This provides admin control over surge pricing with a max cap of 2.5x.

---

## Current State

The system currently calculates surge based on demand/supply ratio:
- Counts active rides in last 5 minutes
- Counts online drivers in last 2 minutes
- Applies tiered multipliers (1.0x → 2.0x)

**Database:** `surge_multipliers` table exists with a GLOBAL row:
```
zone: GLOBAL, multiplier: 1.0, reason: normal
```

---

## New Behavior

1. **Fetch multiplier** from `surge_multipliers` where `zone='GLOBAL'`
2. **Apply cap:** `min(multiplier, 2.5)`
3. **Calculate:** `final_price = base_price × multiplier`
4. **UI Badge:** When multiplier > 1, show: `"Busy time pricing ×{multiplier}"`

---

## Files to Update

### 1. `src/lib/quoteRidePrice.ts`
Update `getSurgeMultiplier()` to fetch from database:

```text
async function getSurgeMultiplier(): Promise<number> {
  1. Query surge_multipliers where zone = 'GLOBAL'
  2. Get multiplier value (default to 1.0 if not found)
  3. Apply cap: min(multiplier, 2.5)
  4. Return the capped value
}
```

### 2. `src/lib/surge.ts`
Add new function to fetch from database:

```text
async function fetchGlobalSurgeMultiplier(): Promise<number> {
  1. Query surge_multipliers table
  2. Filter by zone = 'GLOBAL'
  3. Return multiplier (capped at 2.5)
}
```

Update `calculateSurge` to optionally accept a database override.

### 3. `src/hooks/useSurgePricing.ts`
Update to fetch from `surge_multipliers` table:

```text
- Replace demand-based calculation with database fetch
- Query surge_multipliers where zone = 'GLOBAL'
- Cap at 2.5x
- Return multiplier, level, and label
```

### 4. `src/hooks/useZoneSurgePricing.ts`
Update to use database multiplier:

```text
- Fetch from surge_multipliers (zone='GLOBAL' or zone-specific)
- Apply 2.5x cap
- Return surge info for UI
```

### 5. `src/components/ride/RideCard.tsx`
Update badge text from "Busy now" to dynamic text:

```text
Current (line 68-72):
  <span>🔥</span>
  <span>Busy now</span>

New:
  <span>🔥</span>
  <span>Busy time pricing ×{multiplier.toFixed(1)}</span>
```

### 6. `src/components/ride/UberLikeRideRow.tsx`
Already shows multiplier correctly with `×{surgeMultiplier.toFixed(1)}`, but update label context.

### 7. `src/components/ride/SurgeBanner.tsx`
Update text to use "Busy time pricing" terminology.

---

## Technical Details

### Database Query
```sql
SELECT multiplier FROM surge_multipliers 
WHERE zone = 'GLOBAL' 
LIMIT 1;
```

### Max Cap Constant
```typescript
const MAX_SURGE_MULTIPLIER = 2.5;
```

### Level Mapping
| Multiplier | Level | Label |
|------------|-------|-------|
| 1.0 | Low | (no badge) |
| 1.1-1.5 | Medium | Busy time pricing ×1.x |
| 1.5+ | High | Busy time pricing ×1.x |

---

## Surge Level Logic
```text
multiplier = 1.0       → Low (no badge shown)
multiplier 1.01-1.5    → Medium
multiplier > 1.5       → High
```

---

## Testing Checklist
- Verify surge fetches from `surge_multipliers` table
- Confirm 2.5x cap is enforced
- Check "Busy time pricing ×X.X" badge appears when multiplier > 1
- Verify no badge when multiplier = 1.0
- Test admin can update multiplier in database and see changes

