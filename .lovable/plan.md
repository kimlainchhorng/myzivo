

# Hotels & Resort — Connect, polish & harden the full booking workflow

A focused round to wire the host-side admin to all the new guest-side intelligence, tighten UX, and audit the data flow end-to-end.

## 1. Bring the host admin up to parity with the guest experience

The guest-side success screen and `TripDetailPage` already render the new `ReservationStatusTimeline`, `ReservationStatusHistory`, `LodgingPaymentBadge`, `PolicyAcknowledgementCard`, retry button, and CSV export. The host's `AdminLodgingReservationDetailPage` and `LodgingReservationsSection` still show the old plain badges only. Connect them:

- **`AdminLodgingReservationDetailPage`**:
  - Add `ReservationStatusTimeline` at the top of the page body.
  - Replace the hand-rolled "Audit log" card with `ReservationStatusHistory` (gets actor name + role automatically) + a `Download CSV` button using `auditCsv.ts`.
  - Add a `LodgingPaymentBadge` next to the price block, with `onRetry` wired to `create-lodging-deposit` so hosts can re-mint a Stripe link if the guest's first attempt failed.
  - Add `PolicyAcknowledgementCard` reading `policy_consent` + `policy_consent_version` from the row — hosts get legal proof at a glance.
  - Use `useReservationLive(reservationId)` so status, payment_status, and audit rows refresh in real time as the guest pays / cancels.
- **`LodgingReservationsSection` list**: render a compact `LodgingPaymentBadge` and a `ShieldCheck` "Policies acknowledged" pip on each row when `policy_consent` exists, so hosts can scan refund-pending and verified rows quickly.

## 2. Booking drawer — clearer, faster, fewer dead ends

Polish based on the screenshots:

- **Step 3 (Guest info)**: when the user lands on it via "back" (image 220), the dates summary is missing — render the locked `LodgingStaySelector` at the top of every step (stay/addons/guest/review), matching review's pattern. Adds the "Go back to change dates or guests" affordance everywhere.
- **Step 4 consent block** (image 223): collapse the two long "Tap **View source** to enable this checkbox" hints into one compact row with a single emerald `View house rules · View cancellation` chip pair. Once a chip is tapped (opens `PolicySourceSheet`), it flips to `ShieldCheck Verified`. Removes the duplicate hint clutter.
- **Step 4 marketplace footer** ("ZIVO is a marketplace…"): move it inside the policy scroll area so it doesn't compete with the Confirm button.
- **Success step**: add three quick actions in a row above the .ics panel — `Copy ref`, `Share booking` (uses `navigator.share` with deep link `/trip/{id}`), and `Open chat with host` (deep links to `/chat?with={ownerId}`). Keep the existing `Contact host` (tel:) below.
- **Sticky total bar**: at the bottom of every step, show a thin pill `{nights}n · {guests} · {total}` so the user always sees the running price (currently only visible in the price summary cards).

## 3. Sync `lodge_reservations.nights` and computed values via DB trigger

The drawer currently writes `total_cents`, `addons`, `fee_breakdown`, etc., but **does not write `nights`** — it relies on the row already having a default. The host detail page reads `reservation.nights` and shows `0` if the trigger isn't there.

- Add a Postgres trigger `tg_lodge_reservation_set_nights` on `lodge_reservations` (`BEFORE INSERT OR UPDATE OF check_in, check_out`) that sets `nights = (check_out - check_in)`. Idempotent.
- Backfill existing rows: `UPDATE lodge_reservations SET nights = (check_out - check_in) WHERE nights IS NULL OR nights = 0`.
- Also ensure `extras_cents`, `tax_cents`, `paid_cents` default to 0 (verify in migration; add `DEFAULT 0 NOT NULL` if missing) so the admin price card never shows `NaN`.

## 4. Payment-status retry & link-expiry hardening on `create-lodging-deposit`

The retry button currently calls the function blindly. Make the function safe to re-invoke:

- If the reservation already has a `stripe_session_id` AND the existing Checkout Session is still `open` (check via `stripe.checkout.sessions.retrieve`), return the same `url` instead of minting a new one — prevents duplicate authorizations.
- If the session is `expired` or `complete` with a failed PI, create a fresh session and overwrite `stripe_session_id` + `stripe_payment_intent_id`.
- Refuse to mint a session when `payment_status` is already `authorized`, `captured`, or `refund_pending` — return a structured `{ already_paid: true, status }` payload that the badge surfaces as a toast ("Already authorized — no charge needed").
- Include `reservation_id` in `metadata` of both the Session and the PaymentIntent so the webhook never has to fall back to email matching.

## 5. End-to-end connection sanity audit

A short verification pass — no new features, just confirming data flows wired correctly. Output a one-page "Lodging wiring report" in chat after the migration runs:

- **RLS**: `lodge_reservations` SELECT/INSERT/UPDATE policies cover `(guest = auth.uid()) OR (store owner)` — confirm via the security linter and adjust if the new `policy_consent`, `last_payment_error`, `stripe_*` columns need to remain readable to both parties.
- **Realtime**: confirm `lodge_reservations` and `lodge_reservation_audit` are in `supabase_realtime` publication (already added previously, but double-check after any schema change).
- **Edge functions**: `verify_jwt = false` only on `stripe-lodging-webhook`; everything else stays JWT-protected. Run `supabase--linter` and fix anything it flags.
- **Foreign keys**: `lodge_reservations.room_id` → `lodge_rooms.id ON DELETE SET NULL` (so deleting a room doesn't wipe history); `lodge_reservation_audit.reservation_id` → `lodge_reservations.id ON DELETE CASCADE`. Add if missing.
- **Indexes**: add `CREATE INDEX IF NOT EXISTS` on `(store_id, status, check_in)` and on `(stripe_payment_intent_id)` to keep the host list and webhook lookups O(log n) as data grows.

## File map

**Modified**
- `src/pages/admin/lodging/AdminLodgingReservationDetailPage.tsx` — timeline + history + payment badge + retry + ack card + live subscription + CSV button.
- `src/components/admin/store/lodging/LodgingReservationsSection.tsx` — payment badge + acknowledged pip per row.
- `src/components/lodging/LodgingBookingDrawer.tsx` — locked stay header on every step, compact consent chips, sticky total pill, success quick-actions row.
- `supabase/functions/create-lodging-deposit/index.ts` — session reuse, metadata, already-paid guard.

**Migration**
- Trigger `tg_lodge_reservation_set_nights` + backfill.
- Defaults / NOT NULL on `extras_cents`, `tax_cents`, `paid_cents` if missing.
- FK `room_id` → `lodge_rooms.id ON DELETE SET NULL`; FK on audit → cascade.
- New indexes on `(store_id, status, check_in)` and `(stripe_payment_intent_id)`.

**No new files**, no new dependencies. All UI follows v2026 high-density tokens (Lucide icons only, no emojis except on success header which already uses 🎉 — leave as-is).

## Technical notes

- The retry hardening relies on Stripe SDK `sessions.retrieve` + `paymentIntents.retrieve` — both already imported via the shared `_shared/stripe.ts` shim.
- `useReservationLive` is reused on the admin page — same channel name keys by reservation id, so both guest and host sit on the same realtime topic.
- After the migration, run the security linter; if it flags any of the new columns, lock them down with a follow-up policy and report it in the wiring report.

