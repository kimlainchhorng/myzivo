

## Phase 4: Add Tip Support to Eats Checkout + Include Tip in Stripe Payment

### Problem

The `TipSelector` component is used on the Eats Cart page (`EatsCart.tsx`) but is completely absent from the Eats Checkout page (`EatsCheckout.tsx`). This means:

1. Users cannot add a tip to their delivery driver during checkout
2. The Stripe payment intent does not include tip in the charged amount
3. The `food_orders` record created by the edge function does not store `tip_amount`
4. The `confirmPaymentSuccess` flow has no awareness of tip

The cart page (`EatsCart.tsx`) already handles tips correctly -- it stores `tip_amount` on the order and includes it in the total. The checkout page needs the same treatment.

### Changes

**1. Add TipSelector to EatsCheckout.tsx**
- Import the existing `TipSelector` component
- Add `tipAmount` state (default 0)
- Place the TipSelector in the Order Summary sidebar, between the delivery fee breakdown and the promo/discount section
- Include tip in the total calculation: `total = totalAfterReward - walletDeduction + tipAmount`
- Pass tip to `createPaymentIntent()` call so Stripe charges the correct amount
- Pass tip to `createOrder.mutateAsync()` for cash orders
- Show tip as a line item in the order summary when tip > 0

**2. Update the edge function `create-eats-payment-intent/index.ts`**
- Add `tipAmount` to the `CreatePaymentIntentRequest` interface
- Include `tip_amount` in the `food_orders` insert
- Ensure the total passed to Stripe includes the tip

**3. Update `useEatsPayment.ts` hook**
- Add `tipAmount` to the `CreatePaymentIntentParams` interface so it can be passed through to the edge function

### Technical Details

**Checkout total calculation change:**
```text
Current:  total = totalAfterReward - walletDeduction
Updated:  total = totalAfterReward - walletDeduction + tipAmount
```

**Edge function order insert change:**
- Add field: `tip_amount: body.tipAmount || 0`
- The `total_amount` already comes from the frontend, which will now include tip

**Files to modify:**
- `src/pages/EatsCheckout.tsx` -- Add TipSelector, tip state, include tip in totals and payment calls
- `src/hooks/useEatsPayment.ts` -- Add `tipAmount` to `CreatePaymentIntentParams`
- `supabase/functions/create-eats-payment-intent/index.ts` -- Accept and store `tipAmount`

### Order Summary sidebar layout (after changes):

```text
Items list
---
Reward Selector (if any)
Promo Code Input
---
Demand/ETA banners
ETA Breakdown
---
Delivery Fee Breakdown
Tip Selector          <-- NEW
---
Promo discount line
Reward discount line
Wallet credit line
Tip line item         <-- NEW (when tip > 0)
---
[Pay $XX.XX] button
```

