

# Payment Breakdown Transparency

## Overview

There are two separate receipt systems that need enhancement:

1. **In-app Order Receipt** (`OrderReceipt.tsx`) — shown on the Eats order detail/receipt page. Already displays subtotal, discount, delivery fee, tax, and total. Missing: service fee, tip, and wallet credit lines.

2. **Downloadable Receipt** (`receiptUtils.ts`) — generates a printable HTML receipt from the spending dashboard. Currently only shows service name and status with no line-item breakdown at all. The `UnifiedOrder` type lacks breakdown fields.

## What Changes

### 1. Enhance the in-app Order Receipt with missing fee lines

Update `OrderReceipt.tsx` to show:
- Service fee (from `order.service_fee`)
- Tip amount (from `order.tip_amount`)
- Wallet credit deduction (if applicable)

These fields already exist on `LiveEatsOrder` — they just aren't rendered.

### 2. Add breakdown fields to UnifiedOrder

Update `UnifiedOrder` interface in `useSpendingStats.ts` with optional breakdown fields:
- `subtotal`, `deliveryFee`, `serviceFee`, `tax`, `tip`, `discount`, `promoCode`

Populate these from the `food_orders` query (already fetches `total_amount` — expand the select to include `subtotal`, `delivery_fee`, `service_fee`, `tax`, `tip_amount`, `discount_amount`, `promo_code`). For rides and travel, populate what's available and leave others undefined.

### 3. Rewrite downloadable receipt with full breakdown

Update `generateReceiptHTML` in `receiptUtils.ts` to render a proper invoice-style receipt with all available line items: food total, delivery fee, service fee, tax, tip, discount, wallet credit, and final total. Only show lines where values exist and are non-zero.

### 4. Add a "Download Invoice" button to OrderReceipt

Add a download button alongside the existing "Print Receipt" that generates the full HTML invoice and triggers a print dialog — using the same `receiptUtils` pattern but with the richer `LiveEatsOrder` data.

## Files Summary

| File | Action | What |
|------|--------|------|
| `src/hooks/useSpendingStats.ts` | Update | Add breakdown fields to UnifiedOrder, expand food_orders select |
| `src/lib/receiptUtils.ts` | Update | Full line-item breakdown in generated HTML receipt |
| `src/components/eats/OrderReceipt.tsx` | Update | Add service fee, tip, wallet credit lines |
| `src/components/account/OrderReceiptCard.tsx` | No change | Already works with updated receiptUtils |

## Technical Details

### UnifiedOrder expanded interface

```text
export interface UnifiedOrder {
  id: string;
  type: "eats" | "rides" | "travel";
  title: string;
  amount: number;
  date: string;
  status: string;
  // Breakdown (optional — populated when available)
  subtotal?: number;
  deliveryFee?: number;
  serviceFee?: number;
  tax?: number;
  tip?: number;
  discount?: number;
  promoCode?: string;
}
```

### Eats query expansion

```text
Current select: "id, total_amount, status, created_at, restaurant:restaurants(name)"
New select:     "id, total_amount, subtotal, delivery_fee, service_fee, tax, tip_amount, discount_amount, promo_code, status, created_at, restaurant:restaurants(name)"
```

Map into UnifiedOrder:
- subtotal -> subtotal
- delivery_fee -> deliveryFee
- service_fee -> serviceFee
- tax -> tax
- tip_amount -> tip
- discount_amount -> discount
- promo_code -> promoCode

### Receipt HTML breakdown

The `generateReceiptHTML` function will render each line item conditionally:

```text
Items/Subtotal:  $XX.XX
Delivery Fee:    $X.XX
Service Fee:     $X.XX
Tax:             $X.XX
Tip:             $X.XX
Discount:       -$X.XX  (green, shown only if > 0)
─────────────────────────
Total Paid:      $XX.XX
```

Lines with zero or undefined values are hidden. Discount shown in green with a minus sign. Promo code name shown in parentheses if available.

### OrderReceipt.tsx additions

Add between the existing Tax row and Total row:

- Service fee row: shows `order.service_fee` if > 0
- Tip row: shows `order.tip_amount` if > 0

Both use the same styling pattern as existing rows.

### Edge cases

- Rides and travel orders have no subtotal/delivery breakdown — receipt falls back to showing just "Service" label and total amount (current behavior preserved)
- Orders with no service fee or tip simply omit those rows
- Discount of 0 is hidden
- All amounts use `.toFixed(2)` for consistent formatting

