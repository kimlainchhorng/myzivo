

# Hotels & Resort — Booking confirmation polish (5 upgrades)

## 1. Live availability re-check before Confirm

In `LodgingBookingDrawer.tsx` Step 4 (Review):

- Add a `useAvailabilityCheck` effect that re-runs `hasUnavailableNight(availabilityMap, checkIn, checkOut)` whenever the user lands on `review`, plus a fresh `lodge_reservations` query for any **active overlap** on the same `room_id` (status in `hold/confirmed/checked_in`, where `check_in < selectedCheckOut` and `check_out > selectedCheckIn`).
- Surface a red banner `"These dates are no longer available — please pick new dates"` when conflict detected.
- The Confirm button gets a new gating condition: `disabled = … || conflictDetected`. The `submit()` function also re-checks immediately before insert as a race-condition guard, and aborts with a toast if the check fails.

## 2. Auto-updating timeline + actor attribution on `TripDetailPage`

- **Migration**: add `actor_user_id uuid`, `actor_role text` (`guest | host | admin | system`), `note text` to existing `lodge_reservation_audit` table. Add a trigger `trg_lodge_reservation_status_audit` on `lodge_reservations` that fires on status change and inserts an audit row using `auth.uid()` and a lookup of the user's role vs the store owner.
- **`TripDetailPage.tsx`**: render `ReservationStatusTimeline` for any lodging trip (already created), then below it render a new `ReservationStatusHistory` component that lists audit rows reverse-chronologically: `{icon} {From → To} · {time ago} · by {actor name} ({actor_role})`. Cancelled / no-show rows highlight in destructive tone.
- A Supabase **Realtime** subscription on `lodge_reservations` (filter `id=eq.{id}`) and on `lodge_reservation_audit` (filter `reservation_id=eq.{id}`) refreshes the timeline live, so a host cancelling from the admin updates the guest's view without reload.

## 3. Stripe payment-status badge on the success screen + trips list

- New `LodgingPaymentBadge.tsx` that maps `lodge_reservations.payment_status` (`unpaid | pending | authorized | paid | captured | refunded | failed`) to a chip:
  - `authorized` → green "Deposit authorized · ${amount}"
  - `paid` / `captured` → emerald "Payment captured · ${amount}"
  - `pending` → amber "Awaiting Stripe confirmation"
  - `failed` → destructive "Payment failed — retry"
- **Webhook**: new edge function `stripe-lodging-webhook` listens for `payment_intent.amount_capturable_updated` (→ `authorized`), `payment_intent.succeeded` (→ `captured`), `payment_intent.payment_failed` (→ `failed`), and `charge.refunded` (→ `refunded`), updating `lodge_reservations` matched by `stripe_payment_intent_id`.
- Badge rendered: in the booking-drawer success panel beside the reference, in `MyTripsPage` lodging cards, and on `TripDetailPage`. Realtime subscription keeps it live.

## 4. .ics preview + edit panel

- New `IcsPreviewPanel.tsx` shown in the success screen *before* download:
  - Editable inputs: **Check-in time** (HH:MM), **Check-out time** (HH:MM), **Address** (textarea, prefilled from `propertyProfile.address` / store address), **Timezone** (read-only chip with link "use property tz: Asia/Phnom_Penh").
  - Live preview block showing the two events as they'll appear on the calendar (`Check-in: Sat 3 May · 3:00 PM @ {address}` etc).
  - Buttons: `Download .ics` (calls existing `buildBookingIcs` with edited values) and `Reset to property defaults`.
- Replaces the current single "Add to calendar" button — that button now opens the panel inline.

## 5. "View source" deep link on each consent checkbox

- Add a small `<button type="button">View source</button>` link beside each of the two consent checkboxes in Step 4.
- Tapping opens a lightweight inline `Sheet` / accordion (`PolicySourceSheet.tsx`) that:
  - For the **House rules** checkbox: renders the exact `house_rules` JSON from `lodge_property_profile` formatted as a labeled list (Quiet hours, Parties, Smoking, Min age, ID at check-in, Security deposit), with each field highlighted; scroll lands on the first non-empty rule.
  - For the **Cancellation** checkbox: renders the policy key (`flexible | moderate | strict | non_refundable`), the long-form `cancellationDescription()`, and the rate type that triggered it.
- Each opens a fresh interaction; the consent checkbox itself stays gated by the existing scroll-to-bottom rule plus a new flag `viewedRulesSource` / `viewedCancelSource` that flips true once the sheet has been opened. Hint chip: "Tap **View source** to enable this checkbox".

## File map

**Created**
- `src/components/lodging/ReservationStatusHistory.tsx` — audit-row list with realtime + actor names.
- `src/components/lodging/LodgingPaymentBadge.tsx` — Stripe payment-status chip.
- `src/components/lodging/IcsPreviewPanel.tsx` — editable .ics confirmation panel.
- `src/components/lodging/PolicySourceSheet.tsx` — "View source" sheet.
- `src/hooks/lodging/useReservationLive.ts` — realtime hook for reservation + audit rows.
- `src/hooks/lodging/useRoomConflictCheck.ts` — fresh DB conflict query for the selected dates.
- `supabase/functions/stripe-lodging-webhook/index.ts` — Stripe webhook → payment_status updates.
- `supabase/migrations/<ts>_lodge_audit_actor.sql` — adds actor cols + status-change trigger.

**Modified**
- `src/components/lodging/LodgingBookingDrawer.tsx` — conflict re-check, payment badge, IcsPreviewPanel replacing button, PolicySourceSheet, viewed-source gating.
- `src/pages/trips/TripDetailPage.tsx` — render timeline + history + payment badge for lodging trips, subscribe to realtime.
- `src/pages/app/MyTripsPage.tsx` — payment badge alongside the existing status pill.

## Technical notes

- New webhook needs `STRIPE_WEBHOOK_SECRET` — will prompt the user via the secrets tool before deploy.
- Realtime: enable replication on `lodge_reservations` and `lodge_reservation_audit` (added in migration with `alter publication supabase_realtime add table …`).
- Trigger uses `SECURITY DEFINER` and resolves actor role: `admin` if `has_role(uid,'admin')`, `host` if `is_lodge_store_owner(store_id)`, else `guest`. NULL `auth.uid()` (edge-function service role updates) → `system`.
- All UI follows v2026 high-density tokens (`text-[11px]`, `rounded-xl`, Lucide icons only).
- No new npm dependencies.

