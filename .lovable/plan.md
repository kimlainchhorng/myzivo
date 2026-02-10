

# ETA Accuracy Improvement via Live Driver Density

## Overview
Improve ETA accuracy by feeding live driver availability and proximity data into both Ride and Eats estimates. This requires no major UI changes -- the existing ETA display components will automatically show better numbers.

## Current Gaps

**Eats (EatsCart / EatsCheckout):**
- `useEatsDeliveryFactors` already computes a `supplyMultiplier` (1.0x / 1.2x / 1.5x) based on live driver count, but this multiplier is **never passed** into `useQueueAwareEta`. The `driverMinutes` parameter stays at its default (12 min) regardless of driver density.

**Rides (Rides.tsx):**
- ETAs are entirely static, pulled from hardcoded ride option objects (e.g., `eta: 3`, `eta: 5`). The page does not use `useDriverAvailability` or any live driver proximity data to adjust pickup ETAs.

## Changes

### 1. Eats: Pass supply multiplier into queue-aware ETA

**Files:** `src/pages/EatsCart.tsx`, `src/pages/EatsCheckout.tsx`

Both pages already call `useEatsDeliveryFactors()` and get `supplyMultiplier` back. The fix is to pass `supplyMultiplier` as a driver-time inflation factor into `useQueueAwareEta`.

- `useQueueAwareEta` already accepts multipliers for surge, incentive, schedule, and forecast -- the supply multiplier will be applied the same way to `driverMinutes`.

**File:** `src/hooks/useQueueAwareEta.ts`

- Add a new optional `supplyMultiplier` parameter (default 1.0)
- Apply it to `driverMinutes` alongside the existing schedule/incentive/surge multipliers.

### 2. Rides: Use closest-driver ETA from live data

**File:** `src/pages/Rides.tsx`

- Import and call `useDriverAvailability` with the user's pickup coordinates.
- When the closest driver ETA is available, use it to adjust the displayed ETA for each ride option, replacing the static `ride.eta` with a blended value that accounts for actual driver proximity.
- Fallback to the static ETA when no live data is available.

### 3. Eats: Use closest-driver distance for driverMinutes

**File:** `src/pages/EatsCart.tsx`, `src/pages/EatsCheckout.tsx`

- Import `useDriverAvailability` with the delivery address coordinates (or restaurant coordinates as proxy).
- When `closestETAMinutes` is available, pass it as `driverMinutes` to `useQueueAwareEta` instead of the default 12 minutes.
- This makes the "driver leg" of the ETA reflect actual driver proximity rather than a fixed assumption.

## Technical Details

### Modified Files

1. **`src/hooks/useQueueAwareEta.ts`**
   - Add `supplyMultiplier?: number` to options (default 1.0)
   - Apply to `adjustedDriverMinutes` calculation: multiply by `supplyMultiplier`

2. **`src/pages/EatsCart.tsx`**
   - Import `useDriverAvailability`
   - Call with restaurant coordinates (from cart items)
   - Pass `closestETAMinutes` as `driverMinutes` and `supplyMultiplier` from `deliveryFactors` to `useQueueAwareEta`

3. **`src/pages/EatsCheckout.tsx`**
   - Same as EatsCart: import `useDriverAvailability`, pass real driver time and supply multiplier into the ETA hook

4. **`src/pages/Rides.tsx`**
   - Import `useDriverAvailability`
   - Call with `pickupCoords`
   - Blend `closestETAMinutes` with static ride option ETAs for display (e.g., use the larger of closest-driver ETA and ride-type minimum)

### No New Files or Database Changes
All data sources already exist. This is purely about wiring existing hooks together.

### Impact
- Eats ETAs will reflect real driver proximity (could show 5 min instead of default 12 when a driver is nearby, or 20+ min when supply is low)
- Ride pickup ETAs will reflect actual nearest driver distance rather than static guesses
- Supply shortages will properly inflate ETAs via the supply multiplier that was already computed but unused

