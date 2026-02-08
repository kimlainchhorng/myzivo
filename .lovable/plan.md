
# Tips + Receipt Breakdown Enhancement

## Overview
Add tip selection to the cart page and display a complete receipt breakdown on order details.

---

## Current State Analysis

### Already Exists
| Feature | Status | Location |
|---------|--------|----------|
| `tip_amount` column | ✅ Exists | `food_orders` table |
| `service_fee` column | ✅ Exists | `food_orders` table |
| `EatsPriceBreakdown` component | ✅ Exists | Has tip selector built in (uses fixed dollar amounts) |
| `calculateEatsFare()` pricing | ✅ Exists | `lib/pricing.ts` accepts `tipAmount` parameter |
| Cart price breakdown | ⚠️ Partial | Shows fees but no tip selector |
| Order detail breakdown | ⚠️ Partial | Shows subtotal, delivery, tax — missing service_fee, tip |

### What's Missing
| Feature | Status |
|---------|--------|
| Tip selector in `/eats/cart` | ❌ Not integrated |
| Custom tip input | ❌ Only fixed values in existing component |
| `tip_amount` saved on order | ❌ Not included in `useCreateFoodOrder` |
| `service_fee` saved on order | ❌ Not included in order creation |
| Service fee shown on order detail | ❌ Missing from receipt |
| Tip shown on order detail | ❌ Missing from receipt |

---

## Implementation Plan

### 1. Create Standalone TipSelector Component

Create a reusable tip selector with percentage-based and custom options.

**File to Create:**
- `src/components/eats/TipSelector.tsx`

**Props:**
```typescript
interface TipSelectorProps {
  subtotal: number;
  tipAmount: number;
  onTipChange: (amount: number) => void;
  className?: string;
}
```

**Preset Options:**
- 0% (No tip)
- 5%
- 10%
- 15%
- Custom

**Features:**
- Calculate percentage from subtotal
- Custom amount input with modal/inline input
- Visual feedback for selected option
- Show calculated dollar amount

### 2. Add Tip State to EatsCart Page

Update cart page to manage tip selection and include in order creation.

**File to Modify:**
- `src/pages/EatsCart.tsx`

**Changes:**
1. Add `tipAmount` state (default 0)
2. Add `serviceFee` calculation (already exists as variable, just needs to be saved)
3. Integrate `TipSelector` component below promo code or payment method
4. Update total calculation to include tip
5. Pass `tip_amount` and `service_fee` to order creation

**Price Calculations Update:**
```typescript
const serviceFee = subtotal * 0.05; // 5% service fee
const tax = (subtotal - promo.discountAmount) * 0.08;
const tipAmount = tipState; // From selector
const total = subtotal - promo.discountAmount + deliveryFee + serviceFee + tax + tipAmount;
```

### 3. Update Order Creation to Include Tip + Service Fee

Extend `CreateFoodOrderInput` interface and mutation.

**File to Modify:**
- `src/hooks/useEatsOrders.ts`

**Interface Update:**
```typescript
export interface CreateFoodOrderInput {
  // ... existing fields ...
  service_fee?: number;
  tip_amount?: number;
  tax?: number;
}
```

**Insert Update:**
Add to the `.insert()` call:
```typescript
service_fee: input.service_fee || 0,
tip_amount: input.tip_amount || 0,
tax: input.tax || 0,
```

### 4. Update LiveEatsOrder Interface

Ensure tip and service fee are included in realtime order data.

**File to Modify:**
- `src/hooks/useLiveEatsOrder.ts`

**Add to Interface:**
```typescript
export interface LiveEatsOrder {
  // ... existing fields ...
  tip_amount?: number | null;
  service_fee?: number | null;
}
```

### 5. Enhance Order Detail Receipt Breakdown

Show complete breakdown: subtotal, discount, delivery, service fee, tax, tip, total.

**File to Modify:**
- `src/pages/EatsOrderDetail.tsx`

**Update Price Breakdown Section:**
```typescript
{/* Price Breakdown */}
<div className="space-y-3">
  {/* Subtotal */}
  <div className="flex justify-between text-sm">
    <span className="text-zinc-400">Subtotal</span>
    <span>${order.subtotal?.toFixed(2)}</span>
  </div>
  
  {/* Discount (if any) */}
  {order.discount_amount > 0 && (
    <div className="flex justify-between text-sm text-emerald-400">
      <span>Discount {order.promo_code && `(${order.promo_code})`}</span>
      <span>-${order.discount_amount.toFixed(2)}</span>
    </div>
  )}
  
  {/* Delivery Fee */}
  <div className="flex justify-between text-sm">
    <span className="text-zinc-400">Delivery Fee</span>
    <span>${order.delivery_fee?.toFixed(2)}</span>
  </div>
  
  {/* Service Fee (NEW) */}
  {order.service_fee > 0 && (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-400">Service Fee</span>
      <span>${order.service_fee.toFixed(2)}</span>
    </div>
  )}
  
  {/* Tax */}
  {order.tax > 0 && (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-400">Tax</span>
      <span>${order.tax.toFixed(2)}</span>
    </div>
  )}
  
  {/* Tip (NEW) */}
  {order.tip_amount > 0 && (
    <div className="flex justify-between text-sm">
      <span className="text-zinc-400">Tip</span>
      <span>${order.tip_amount.toFixed(2)}</span>
    </div>
  )}
  
  {/* Total */}
  <div className="border-t border-white/10 pt-3">
    <div className="flex justify-between font-bold text-lg">
      <span>Total</span>
      <span className="text-orange-400">${order.total_amount?.toFixed(2)}</span>
    </div>
  </div>
</div>
```

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/components/eats/TipSelector.tsx` | Percentage-based tip selector with custom input |

### Modified Files
| File | Changes |
|------|---------|
| `src/pages/EatsCart.tsx` | Add tip state, integrate TipSelector, pass tip to order creation |
| `src/hooks/useEatsOrders.ts` | Add `tip_amount`, `service_fee`, `tax` to order insert |
| `src/hooks/useLiveEatsOrder.ts` | Add `tip_amount`, `service_fee` to interface |
| `src/pages/EatsOrderDetail.tsx` | Add service fee and tip to receipt breakdown |

---

## UI Design

### Cart Page — Tip Selector
```text
┌────────────────────────────────────────┐
│ Add a tip                              │
│                                        │
│ ┌──────┬──────┬──────┬──────┬───────┐ │
│ │ None │  5%  │ 10%  │ 15%  │ Other │ │
│ │      │$2.50 │$5.00 │$7.50 │       │ │
│ └──────┴──────┴──────┴──────┴───────┘ │
│                                        │
│ 100% of tip goes to your driver        │
└────────────────────────────────────────┘
```

### Order Detail — Full Receipt
```text
┌────────────────────────────────────────┐
│ Subtotal                      $50.00   │
│ Discount (SAVE10)            -$5.00   │
│ Delivery Fee                   $3.99   │
│ Service Fee                    $2.50   │
│ Tax                            $3.60   │
│ Tip                            $5.00   │
│ ────────────────────────────────────   │
│ Total                         $60.09   │
└────────────────────────────────────────┘
```

---

## Tip Calculation Logic

```typescript
const TIP_PERCENTAGES = [0, 5, 10, 15] as const;

function calculateTipFromPercentage(subtotal: number, percentage: number): number {
  return Math.round(subtotal * (percentage / 100) * 100) / 100;
}

// Example for $50 subtotal:
// 5%  → $2.50
// 10% → $5.00
// 15% → $7.50
```

---

## Summary

This update adds:

1. **TipSelector Component**: Percentage-based options (0%, 5%, 10%, 15%) plus custom amount
2. **Cart Integration**: Tip selection before placing order, included in totals
3. **Order Storage**: `tip_amount`, `service_fee`, `tax` saved to `food_orders`
4. **Receipt Breakdown**: Complete line-item receipt on order detail page showing all fees
5. **Driver Message**: "100% of tip goes to your driver" for transparency
