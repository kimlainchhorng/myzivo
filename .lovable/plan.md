

# Fix duplicate "Reservations" sidebar entry for hotels

The sidebar shows **two "Reservations" rows** because the existing "Payment" tab is being renamed to "Reservations" for lodging (in `StoreOwnerLayout.tsx` line 122) AND a separate `lodge-reservations` HOTEL OPS item also exists. Clicking the top one opens the Payment Method screen, which is confusing.

## Fix

`src/components/admin/StoreOwnerLayout.tsx`
- Stop renaming the `payment` tab for lodging. Keep it labeled **"Payment & Payouts"** so it remains clearly the money settings screen (Stripe / ABA PayWay / payout config).
- Change line 122: `const paymentLabel = isAutoRepair ? "Bookings" : "Payment & Payouts";` (drop the lodging branch).

`src/pages/admin/AdminStoreEditPage.tsx`
- Mirror the same in `paymentLabelTitle` (line 1837): drop the `isLodging ? "Reservations"` branch so the page header reads **"Payment & Payouts"** when the Payment tab is active.

## Result

- Top sidebar **MANAGE → Payment & Payouts** = money settings (Stripe, ABA, payout config).
- HOTEL OPS → **Reservations** = the actual booking list (LodgingReservationsSection).

No DB changes, no new files. Two one-line edits.

