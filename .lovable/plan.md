

# Tax Transparency

## What's Already Working

The checkout (`DeliveryFeeBreakdownCard`) already shows: Subtotal, Delivery Fee, Service Fee, Small Order Fee, Tax, and Total. The in-app receipt (`OrderReceipt.tsx`) also shows all these lines. The downloadable invoice (`receiptUtils.ts`) renders them too.

**What's missing**: The tax line everywhere just says "Tax — $X.XX" without showing the rate (e.g., 8.25%). The tax rate is calculated in `useEatsDeliveryPricing` from `zone.tax_rate` but never exposed to the UI.

## Changes

### 1. Expose `taxRate` from the pricing hook

Update `EatsDeliveryPricing` interface and the hook return value to include `taxRate: number` (the decimal rate from the zone, e.g., 0.0825).

**File**: `src/hooks/useEatsDeliveryPricing.ts`
- Add `taxRate: number` to the `EatsDeliveryPricing` interface
- Add `taxRate: zone.tax_rate` to the return object

### 2. Show tax rate in checkout breakdown

Update `DeliveryFeeBreakdownCard` to display the rate next to the tax amount:
- Change "Tax" label to "Tax (8.25%)" using `(pricing.taxRate * 100).toFixed(2)%`

**File**: `src/components/eats/DeliveryFeeBreakdownCard.tsx`
- Update the Tax row label to include the percentage

### 3. Add `taxRate` to UnifiedOrder and persist it

Update the `UnifiedOrder` interface with an optional `taxRate` field. The `food_orders` table already has a `tax_rate` column (confirmed in types). Map it in the spending stats query.

**File**: `src/hooks/useSpendingStats.ts`
- Add `taxRate?: number` to `UnifiedOrder`
- Add `tax_rate` to the food_orders select query
- Map `o.tax_rate` to `taxRate` in the UnifiedOrder mapping

### 4. Show tax rate in the in-app receipt

Update `OrderReceipt.tsx` to display the tax rate percentage when available.

**File**: `src/components/eats/OrderReceipt.tsx`
- Change "Tax" label to include rate if `order.tax_rate` exists (e.g., "Tax (8.25%)")

### 5. Show tax rate in the downloadable invoice

Update `receiptUtils.ts` to render the tax rate percentage in the breakdown.

**File**: `src/lib/receiptUtils.ts`
- Accept `taxRate` on `UnifiedOrder` (already adding to interface)
- Change the Tax row label from "Tax" to "Tax (X.XX%)" when `order.taxRate` is defined
- Update the `OrderReceipt` download button to pass `taxRate` in the UnifiedOrder conversion

### 6. Store tax_rate on order creation

Update the order submission in `EatsCheckout.tsx` to save `pricing.taxRate` alongside `pricing.tax` in the `food_orders` insert, so receipts can show the rate even after the zone config changes.

**File**: `src/pages/EatsCheckout.tsx`
- Add `tax_rate: pricing.taxRate` to the order creation payload (if the column exists)

## Files Summary

| File | Action | What |
|------|--------|------|
| `src/hooks/useEatsDeliveryPricing.ts` | Update | Add `taxRate` to interface and return value |
| `src/components/eats/DeliveryFeeBreakdownCard.tsx` | Update | Show tax rate percentage in label |
| `src/hooks/useSpendingStats.ts` | Update | Add `taxRate` to UnifiedOrder, expand query |
| `src/components/eats/OrderReceipt.tsx` | Update | Show tax rate in receipt tax line |
| `src/lib/receiptUtils.ts` | Update | Show tax rate in downloadable invoice |
| `src/pages/EatsCheckout.tsx` | Update | Store tax_rate on order creation |

## Technical Details

### Tax rate display format

The rate is stored as a decimal (e.g., 0.0825). Display as percentage: `(rate * 100).toFixed(2)%` producing "8.25%".

### Checkout tax line (before and after)

```text
Before:  Tax                    $3.30
After:   Tax (8.25%)            $3.30
```

### Receipt tax line (before and after)

```text
Before:  Tax                    $3.30
After:   Tax (8.25%)            $3.30
```

### Downloadable invoice (before and after)

```text
Before:  Tax          $3.30
After:   Tax (8.25%)  $3.30
```

### Edge cases

- Zone has 0% tax rate: show "Tax (0.00%)" with $0.00 (or hide the line entirely -- current behavior hides when tax is 0)
- Tax rate not available on older orders (taxRate is undefined): fall back to just "Tax" without percentage
- Rides and travel orders: no change -- they don't have a tax rate field, so receipts continue showing just the total
