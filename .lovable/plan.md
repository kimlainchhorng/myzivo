

# Dynamic Pricing Display — Implementation Plan

## Overview
Replace the hardcoded `$3.99` delivery fee in Eats checkout with a real-time dynamic delivery fee breakdown that accounts for base fee, distance, and demand (surge). Show a clear transparency message when demand adjustment is active.

---

## Problem

The checkout page (`EatsCheckout.tsx`, line 68) currently has:

```text
const deliveryFee = 3.99;
```

This ignores all existing dynamic pricing infrastructure:
- `useEatsSurgePricing` hook (fetches real-time surge multiplier)
- `calculateEatsFare()` in `src/lib/pricing.ts` (computes delivery fee from base + per-mile)
- `EatsPriceBreakdown` component (shows detailed breakdown with service fee, tax, etc.)

---

## What Already Exists (No Changes Needed)

| Component | Purpose |
|-----------|---------|
| `useEatsSurgePricing` hook | Fetches surge multiplier, provides `calculateDeliveryFee()` |
| `calculateEatsFare()` | Zone-based pricing: base fee + per-mile + service fee + tax |
| `EatsPriceBreakdown` component | Full order summary UI with all line items |
| `DEFAULT_EATS_ZONE` | Base: $2.99, Per-mile: $0.50, Service: 15%, Tax: 8.25% |

---

## Implementation Plan

### 1) Create `useEatsDeliveryPricing` Hook

**File to Create:** `src/hooks/useEatsDeliveryPricing.ts`

**Purpose:** Combine zone-based pricing with surge to produce a complete delivery fee breakdown.

**Returned data:**
```text
{
  baseFee: number;          // Zone base ($2.99)
  distanceFee: number;      // Per-mile component
  demandAdjustment: number; // Surge markup amount ($0 if no surge)
  totalDeliveryFee: number; // Sum of above
  serviceFee: number;
  smallOrderFee: number;
  tax: number;
  orderTotal: number;       // Everything included
  surgeActive: boolean;
  surgeLabel: string;       // "Delivery fee adjusted due to high demand."
  isLoading: boolean;
}
```

**Logic:**
- Use `DEFAULT_EATS_ZONE` for base/per-mile rates (distance defaults to estimated ~2 miles for MVP, can be enhanced later with geocoding)
- Apply surge multiplier from `useEatsSurgePricing` to delivery fee only
- Calculate service fee, small order fee, and tax per existing `calculateEatsFare` logic

### 2) Create `DeliveryFeeBreakdownCard` Component

**File to Create:** `src/components/eats/DeliveryFeeBreakdownCard.tsx`

**Purpose:** Display the delivery fee breakdown with demand adjustment messaging.

**Design:**
```text
+----------------------------------------------+
|  Delivery Fee Breakdown                      |
|                                              |
|  Base delivery fee              $2.99        |
|  Distance fee (~2 mi)           $1.00        |
|  Demand adjustment              $1.20        |  <-- orange if active
|                                              |
|  ! Delivery fee adjusted due to high demand. |  <-- only if surge
|                                              |
|  Delivery fee total             $5.19        |
+----------------------------------------------+
```

- Shows demand adjustment line only when surge > 1.0
- Amber/orange styling for demand line and message
- Tooltip or info icon explaining demand pricing

### 3) Update `EatsCheckout.tsx` — Replace Hardcoded Fee

**File to Modify:** `src/pages/EatsCheckout.tsx`

**Changes:**
- Import `useEatsDeliveryPricing` hook
- Remove hardcoded `const deliveryFee = 3.99`
- Use hook values for all fee calculations
- Replace the simple "Subtotal / Delivery Fee / Total" display with `DeliveryFeeBreakdownCard` + full breakdown
- Add surge demand banner when active
- Update the `total` calculation to use dynamic values
- Pass dynamic fees to `createOrder.mutateAsync()` call

**Before (current):**
```text
const deliveryFee = 3.99;
const total = subtotal + deliveryFee;
```

**After:**
```text
const pricing = useEatsDeliveryPricing(subtotal);
const total = pricing.orderTotal;
```

**Order Summary section update:** Replace the simple 3-line breakdown (lines 598-611) with the full dynamic breakdown showing base fee, distance fee, demand adjustment, service fee, tax, and final total.

### 4) Add Demand Adjustment Banner

**Where:** Inside the Order Summary card in `EatsCheckout.tsx`, above the price breakdown.

**When visible:** Only when surge is active (multiplier > 1.0).

**Design:**
```text
+----------------------------------------------+
|  ! Delivery fee adjusted due to high demand. |
|    Demand is higher than usual in your area.  |
+----------------------------------------------+
```

- Amber background with warning icon
- Concise, transparent language

---

## File Summary

### New Files (2)
| File | Purpose |
|------|---------|
| `src/hooks/useEatsDeliveryPricing.ts` | Combines zone pricing + surge for complete fee calculation |
| `src/components/eats/DeliveryFeeBreakdownCard.tsx` | Visual breakdown of delivery fees with demand messaging |

### Modified Files (1)
| File | Changes |
|------|---------|
| `src/pages/EatsCheckout.tsx` | Replace hardcoded $3.99 with dynamic pricing hook, show breakdown card and demand banner |

---

## Updated Checkout Order Summary

```text
+----------------------------------------------+
|  Order Summary                               |
|  Burger Palace                               |
|                                              |
|  [Item list with +/- buttons]                |
|                                              |
|  --- ETA Breakdown ---                       |
|                                              |
|  --- Price Breakdown ---                     |
|  Subtotal                      $28.50        |
|  Base delivery fee              $2.99        |
|  Distance fee                   $1.00        |
|  Demand adjustment              $1.20   (*)  |
|  Service fee                    $4.28        |
|  Tax                            $2.35        |
|                                              |
|  (*) amber banner if active:                 |
|  "Delivery fee adjusted due to high demand." |
|                                              |
|  Total                         $40.32        |
|                                              |
|  [Place Order Request]                       |
+----------------------------------------------+
```

---

## Pricing Calculation Flow

```text
Cart Subtotal ($28.50)
       |
       v
useEatsDeliveryPricing hook
       |
       ├── Base delivery fee: $2.99 (from DEFAULT_EATS_ZONE)
       ├── Distance fee: $1.00 (est. 2 mi x $0.50/mi)
       ├── Demand adjustment: surge multiplier applied to delivery fee
       │      e.g. 1.3x surge on $3.99 base = $1.20 extra
       ├── Service fee: 15% of subtotal = $4.28
       ├── Small order fee: $2.00 if subtotal < $15
       ├── Tax: 8.25% of subtotal = $2.35
       |
       v
  Final total = subtotal + deliveryFee + serviceFee + smallOrderFee + tax
```

---

## Transparency Guarantees

| Requirement | How Addressed |
|-------------|--------------|
| Show base delivery fee | Separate line item in breakdown |
| Show distance fee | Separate line with approximate distance |
| Show demand adjustment | Orange-highlighted line, only when active |
| Demand message | Amber banner: "Delivery fee adjusted due to high demand." |
| Final total before payment | Bold total at bottom, always visible |
| No hidden fees | Every fee component shown as individual line |
