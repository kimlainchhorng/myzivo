

## Phase 5: Fix Missing Tip in Cash/Wallet Orders

### Problem

The tip integration from Phase 4 correctly passes `tipAmount` to Stripe card payments, but the **cash and wallet-only order path** in `EatsCheckout.tsx` does not include `tip_amount` in the `createOrder.mutateAsync()` call (line 365-387). This means:

- Cash orders silently drop the tip -- the driver gets no tip recorded
- The `total` already includes the tip amount, so the financial total is correct, but the `tip_amount` field on the order record is 0

The `CreateFoodOrderInput` interface and the `useCreateFoodOrder` mutation both already support `tip_amount` -- it just needs to be passed.

### Changes

**1. Pass `tip_amount` in the cash/wallet order creation (EatsCheckout.tsx)**
- Add `tip_amount: tipAmount` to the object passed to `createOrder.mutateAsync()` on line ~383
- This ensures the `food_orders.tip_amount` column is populated for all payment types

### Files to modify
- `src/pages/EatsCheckout.tsx` -- Add `tip_amount: tipAmount` to the cash order creation call (1 line addition)

This is a small but important fix to ensure tip data consistency across all payment methods.
