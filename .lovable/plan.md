

## Add Driver and Courier Tipping System

The tipping infrastructure is partially built but needs to be connected end-to-end. Here is the current state and what needs to change.

---

### What Already Exists (no changes needed)

| Feature | Location |
|---------|----------|
| Eats TipSelector (percentage-based, custom amount, modal) | `src/components/eats/TipSelector.tsx` |
| Tip in Eats checkout and cart | `EatsCheckout.tsx`, `EatsCart.tsx` |
| Eats tip saved to `food_orders.tip_amount` / `tip_cents` | Database columns exist |
| Post-ride tip UI ($1/$3/$5 buttons) | `RideReceiptModal.tsx` (lines 270-305) |
| `driver_earnings` table with `tip_amount` column | Database schema |
| `driver_payments` table with `tip_amount` column | Database schema |
| Admin driver earnings with tip totals | `AdminDriverEarnings.tsx` |
| Spending stats includes tips from food orders | `useSpendingStats.ts` |

### What Is Missing (gaps to fill)

1. **Ride tips are not saved to the database** -- the RideReceiptModal has tip buttons but `selectedTip` is local state only and never persisted
2. **No tip option before booking a ride** (pre-checkout tip)
3. **No tip for package deliveries** (Move service)
4. **Driver earnings dashboard does not include tips** -- `useDriverEarnings` only sums `fare_amount` / `delivery_fee` / `actual_payout`, ignoring tip columns
5. **No tip history visible in user transaction/order history**

---

### Changes

**1. Persist ride tips to the database**

File: `src/lib/supabaseRide.ts`

Add a new `saveRideTip` function that updates the `driver_earnings` table for the given trip, setting `tip_amount`. Also record the tip in the trip's `customer_total` update if possible.

File: `src/components/ride/RideReceiptModal.tsx`

- Call `saveRideTip` when the user selects a tip and taps "DONE"
- Add a "Custom" tip button alongside $1/$3/$5 (opens a small input like the Eats TipSelector custom modal)
- Show a confirmation toast after tip is saved
- Style the tip buttons with emerald green active state instead of the current primary color, matching the verdant theme

**2. Pre-ride tip option on the confirm page**

File: `src/pages/ride/RideConfirmPage.tsx`

- Add a compact TipSelector section below the fare breakdown (before the "Confirm Ride" button)
- Use quick buttons: $1, $3, $5, Custom
- Pass `tipAmount` to the ride creation flow so it's included in the trip record
- Store the tip in `driver_earnings.tip_amount` when the earnings record is created

**3. Post-delivery tip for packages (Move)**

File: `src/components/ride/RideReceiptModal.tsx` (or a new shared component)

Create a reusable `PostTripTipCard` component extracted from the existing tip section in RideReceiptModal. This component can be used by both rides and package delivery completion screens.

File: Look for the package delivery completion flow and add the tip card there. If no completion screen exists for package deliveries, add a tip option to the delivery detail/history page.

**4. Include tips in driver earnings dashboard**

File: `src/hooks/useDriverEarnings.ts`

- Update the trips query to also select `tip_amount` from `driver_earnings` table (join or separate query)
- Add `tips` field to `DriverEarningsData` interface (today/week/month tip totals)
- Add tip amount to each `JobEarning` item
- Include tips in the earnings totals (today, week, month)

**5. Show tips in user transaction history**

File: `src/hooks/useSpendingStats.ts` (already partially done for eats)

- For ride transactions, fetch the associated `driver_earnings.tip_amount` and include it in the transaction display
- Add a "Tip" line item in ride receipts when viewing past trips

---

### Technical Details

**Files modified (4-5):**

| File | Change |
|------|--------|
| `src/components/ride/RideReceiptModal.tsx` | Persist tip to DB, add custom tip button, emerald theme, confirmation message |
| `src/lib/supabaseRide.ts` | Add `saveRideTip()` function |
| `src/pages/ride/RideConfirmPage.tsx` | Add pre-ride tip selector with $1/$3/$5/Custom buttons |
| `src/hooks/useDriverEarnings.ts` | Include tip amounts in earnings calculations |

**Tip button design (consistent across all services):**

```text
+-------+  +-------+  +-------+  +----------+
|  $1   |  |  $3   |  |  $5   |  |  Custom  |
+-------+  +-------+  +-------+  +----------+
```

Active state: `bg-emerald-500 text-white border-emerald-500`
Inactive state: `bg-white/5 text-white/80 border-white/10`

**Confirmation after tipping:**

A toast notification: "Tip added! 100% goes to your driver."

Plus an inline emerald check badge in the receipt.

**Database interaction:**

- `saveRideTip` will update `driver_earnings` where `trip_id` matches, setting `tip_amount`
- If no `driver_earnings` row exists yet (edge case), it will insert one
- For pre-ride tips, the tip is passed through the ride creation payload and included when the `driver_earnings` record is created upon trip completion

**No new database columns needed** -- `driver_earnings.tip_amount`, `food_orders.tip_amount`, and `food_orders.tip_cents` already exist.

