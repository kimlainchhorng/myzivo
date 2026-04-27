## Goal

Finish the end-to-end flow for the **Payouts & Finance** tab in the lodging admin (`/admin/stores/:id?tab=lodge-payouts`). Today it shows static stats only — the "Open Payment & Payouts" button leads nowhere, no real bank/Stripe linkage exists, and several computed values (paid count, upcoming count, upcoming revenue) are never displayed.

## Gaps Found in Current Flow

1. **Dead CTA** — `LodgingPayoutsSection.tsx` dispatches `lodge-set-tab` for tab `payment-payouts`, but that tab doesn't exist in `LODGING_TAB_IDS`. The button does nothing.
2. **No real payout account** — "Bank account & tax info" is just a label. No connection to the existing `connect-onboard` / `connect-status` Stripe Connect Express edge functions that already power `StripeConnectPayoutCard`.
3. **Unused computed stats** — `paidCount` and `upcomingCount` are calculated but never rendered. No "Upcoming revenue" stat (booked but not yet checked-in money the host can forecast).
4. **No payout history** — Host has no view of past payouts (date, amount, status, method). Only ad-hoc revenue shown.
5. **Export CSV is thin** — only month/revenue. No per-reservation breakdown (guest, dates, gross, fee, net).
6. **No status banner** — If Stripe Connect isn't onboarded yet, the host sees "Pending $383.23" with no warning that money cannot actually be paid out until they complete onboarding.

## Plan

### 1. Fix navigation — replace dead CTA with real Stripe Connect onboarding
In `LodgingPayoutsSection.tsx`, remove the `lodge-set-tab` dispatch and instead embed (or link to) the existing `StripeConnectPayoutCard` flow:
- Add a new **"Payout account"** card that uses `useConnectStatus()` to show:
  - Not connected → "Set up payouts" button calling `useConnectOnboard()` (returns to `?tab=lodge-payouts&connect=done`)
  - Connected but pending → badges for `details_submitted` / `payouts_enabled` / `charges_enabled`
  - Fully enabled → green "Payouts enabled" state with masked bank last-4 (from status payload)
- This reuses the proven driver/wallet onboarding path — no new edge functions needed.

### 2. Surface unused stats + add Upcoming revenue
Extend the stat grid from 4 → 6 cards (responsive 2/3/6):
- Total revenue, Platform fee (2%), Net payout, **Upcoming revenue** (sum of confirmed/checked-in not-yet-paid), Pending, **Paid bookings** (count).

### 3. Add Payout History table
New card "Payout history" listing rows from `paid` reservations grouped by payout batch (use `check_out` month as proxy until a real `payouts` table exists). Columns: period, gross, fee, net, status badge. Empty state messaging stays.

### 4. Warning banner when Stripe not connected
If `status.payouts_enabled === false` and `pendingAmount > 0`, show an amber alert at the top: *"You have $X pending but payouts are paused. Complete Stripe onboarding to receive funds."* with a "Finish setup" button.

### 5. Richer CSV export
Replace month-only CSV with a detailed reservation-level CSV: `Reservation ID, Guest, Check-in, Check-out, Gross USD, Platform Fee USD, Net USD, Status`. Keep filename pattern.

### 6. Wire `?connect=done` return handler
Mirror the `StripeConnectPayoutCard` effect: when the user returns from Stripe with `?connect=done`, invalidate `stripe-connect-status`, toast success, and strip the param while preserving `tab=lodge-payouts`.

## Files Touched

- `src/components/admin/store/lodging/LodgingPayoutsSection.tsx` — primary changes (stat grid, payout-account card, history table, warning banner, richer CSV, return-handler effect).

No DB migrations, no new edge functions — all required infra already exists (`connect-onboard`, `connect-status`, `useStripeConnect` hook).

## Out of Scope (can be follow-ups)

- Real `payouts` table with Stripe webhook reconciliation (today we approximate from reservations).
- Tax form (W-9/W-8) collection UI — Stripe Connect collects this during onboarding.
- Multi-currency display (USD only for now, matches rest of admin).
